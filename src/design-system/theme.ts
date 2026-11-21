import { useAtlas } from '../core/store';
import { translate } from '../localization/strings';
export const dark = { background: '#0A1220', surface: '#111E32', raised: '#1A2D49', text: '#F0F4FC', muted: '#A6B5CC', border: '#2B3E59', accent: '#9DBBEE', button: '#234C88', buttonText: '#F4F7FF', good: '#9DBBEE', danger: '#FFABA6', glass: '#111E32F2', hero: '#142F56', heroText: '#F1F5FD', heroMuted: '#BACBDF', heroLine: '#365477', heroButton: '#F1F5FD', heroButtonText: '#173B6C', artwork: '#18375F', artworkLine: '#355982' };
export const light = { background: '#F0F3F8', surface: '#FFFFFF', raised: '#E3EAF5', text: '#14253F', muted: '#52637D', border: '#C9D4E5', accent: '#234C88', button: '#1D427A', buttonText: '#F4F7FF', good: '#234C88', danger: '#A43535', glass: '#FFFFFFF2', hero: '#142F56', heroText: '#F1F5FD', heroMuted: '#BACBDF', heroLine: '#365477', heroButton: '#F1F5FD', heroButtonText: '#173B6C', artwork: '#18375F', artworkLine: '#355982' };
export const tokens = { radius: { control: 12, card: 18, sheet: 24 }, space: { small: 8, medium: 16, page: 20, section: 28 }, motion: { press: 120, state: 200, panel: 280 } } as const;
export const black = { ...dark, background: '#050608', surface: '#111316', raised: '#22262C', text: '#F5F6F8', muted: '#AFB4BE', border: '#343941', accent: '#D0DAEA', button: '#DCE4F0', buttonText: '#111820', good: '#D0DAEA', glass: '#111316F5', hero: '#161D27', heroLine: '#3C4655', artwork: '#1A232F', artworkLine: '#424C5B' };
export function useDesign() {
  const preferences = useAtlas(s => s.data?.preferences);
  const language = preferences?.language ?? 'uk';
  return { colors: preferences?.theme === 'light' ? light : preferences?.theme === 'black' ? black : dark, language, t: (key: Parameters<typeof translate>[1]) => translate(language, key) };
}
export const gradients = [
  ['#174998', '#0C1D40'], ['#6246AC', '#192245'], ['#236A6D', '#102F3D'], ['#A05742', '#3B2440'], ['#6A4C80', '#242642'],
  ['#476FAC', '#18273F'], ['#447660', '#122F32'], ['#8D3863', '#302C55'], ['#796447', '#2C2D40'], ['#4A566A', '#171E2C'],
] as const;
