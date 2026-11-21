import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { acceptWrite, cloudPayload, parseCloudCopy, SyncConflict } from '../src/services/syncProtocol';
const a = '00000000-0000-0000-0000-000000000001';
const b = '00000000-0000-0000-0000-000000000002';
const payload = { app: 'atlas', version: 3, exportedAt: '2026-10-14T12:00:00.000Z', preferences: { language: 'ru', theme: 'black', navigation: 'balanced', reducedMotion: false }, profile: { name: 'Test', bio: '', joined: '2026-10-14', banner: -1 }, programs: [], activations: [], rests: [], sessions: [], sets: [], xp: [] };
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    insert into auth.users values('${a}'),('${b}');`);
  await db.exec(readFileSync('supabase/migrations/202610140001_atlas_sync.sql', 'utf8'));
}, 30_000);
afterAll(async () => { await db?.close(); });
async function asUser(id: string) { await db.exec(`reset role; select set_config('request.jwt.claim.sub','${id}',false); set role authenticated;`); }
async function save(user: string, revision: number, value: unknown = payload) {
  const result = await db.query<{ value: unknown }>('select public.save_atlas_snapshot($1::uuid,$2::bigint,$3::jsonb) as value', [user, revision, JSON.stringify(value)]);
  return result.rows[0]!.value;
}
describe('actual PostgreSQL migration, permissions and compare-and-swap', () => {
  it('isolates accounts and rejects attempts to bypass RPC', async () => {
    await asUser(a);
    const saved = acceptWrite(await save(a, 0), 0);
    expect(saved.revision).toBe(1);
    await expect(db.query('update public.atlas_snapshots set revision=99')).rejects.toThrow('permission denied');
    await expect(db.query('insert into public.atlas_snapshots values($1,99,$2,now())', [b, JSON.stringify(payload)])).rejects.toThrow('permission denied');
    await asUser(b);
    expect((await db.query('select * from public.atlas_snapshots')).rows).toHaveLength(0);
    expect((await db.query('select * from public.atlas_snapshot_versions')).rows).toHaveLength(0);
    await expect(save(a, 1)).rejects.toThrow('Account changed');
  });
  it('rejects a stale device and keeps the winning copy and recovery revisions', async () => {
    await asUser(a);
    expect(acceptWrite(await save(a, 1), 1).revision).toBe(2);
    expect(() => acceptWrite({ conflict: true }, 1)).toThrow(SyncConflict);
    expect(await save(a, 1)).toEqual({ conflict: true });
    expect(await save(a, 0)).toEqual({ conflict: true });
    const rows = await db.query<{ revision: number }>('select revision from public.atlas_snapshot_versions order by revision');
    expect(rows.rows.map(r => r.revision)).toEqual([1, 2]);
  });
  it('bounds payloads and revisions and denies anonymous execution', async () => {
    await asUser(b);
    await expect(save(b, -1)).rejects.toThrow('Invalid revision');
    await expect(save(b, 0, { ...payload, profile: { bio: 'x'.repeat(610_000) } })).rejects.toThrow('oversized');
    await db.exec('reset role; set role anon;');
    await expect(save(b, 0)).rejects.toThrow('permission denied');
  });
  it('retains only the newest 20 account-owned recovery versions', async () => {
    await asUser(b);
    for (let revision = 0; revision < 22; revision++) await save(b, revision);
    const rows = await db.query<{ revision: number }>('select revision from public.atlas_snapshot_versions order by revision');
    expect(rows.rows).toHaveLength(20);
    expect(rows.rows[0]?.revision).toBe(3);
    expect(rows.rows[19]?.revision).toBe(22);
  });
});
describe('cloud response validation', () => {
  it('rejects future formats, oversized UTF-8 payloads and malformed revisions before restore', () => {
    expect(() => cloudPayload({ ...payload, version: 4 })).toThrow();
    expect(() => cloudPayload({ ...payload, padding: 'я'.repeat(260_000) })).toThrow('500 KB');
    expect(() => parseCloudCopy({ revision: -1, updated_at: 'now', payload })).toThrow('revision');
    expect(() => acceptWrite({ row: { revision: 5, updated_at: payload.exportedAt, payload } }, 1)).toThrow('Unexpected');
    expect(cloudPayload(payload).preferences.theme).toBe('black');
  });
});
