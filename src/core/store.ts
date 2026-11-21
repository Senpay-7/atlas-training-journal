import { create } from 'zustand';
import { openDatabaseAsync } from 'expo-sqlite';
import { AtlasRepository } from '../data/repository';
import type { Snapshot } from '../domain/models';

type Store = { data: Snapshot | null; error: string | null; refresh: () => void; dismiss: () => void; run: (task: (repo: AtlasRepository) => void) => boolean };
let repo: AtlasRepository;
let boot: Promise<void> | undefined;
export const useAtlas = create<Store>((set) => ({
  data: null, error: null,
  dismiss: () => set({ error: null }),
  refresh: () => set({ data: repo.snapshot() }),
  run: task => {
    try { task(repo); set({ data: repo.snapshot(), error: null }); return true; }
    catch (error) { set({ error: error instanceof Error ? error.message : String(error) }); return false; }
  },
}));
export function bootstrap() {
  boot ??= openDatabaseAsync('atlas.db').then(db => {
    repo = new AtlasRepository(db);
    repo.initialize();
    useAtlas.getState().refresh();
  }).catch(error => { useAtlas.setState({ error: String(error) }); boot = undefined; });
  return boot;
}
