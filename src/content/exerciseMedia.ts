import type { ImageSourcePropType } from 'react-native';

// Attribution and immutable upstream URLs: docs/licenses/exercise-media.json.
export const exerciseMedia: Record<string, { slug: string; frames: ImageSourcePropType[] }> = {
  'goblet-squat': { slug: 'goblet-squat', frames: [require('../../assets/exercises/goblet-squat-1.png')] },
  'squat': { slug: 'squat', frames: [require('../../assets/exercises/squat-1.png')] },
  'bench': { slug: 'bench-press', frames: [require('../../assets/exercises/bench-1.png')] },
  'db-press': { slug: 'dumbbell-bench-press', frames: [require('../../assets/exercises/db-press-1.png')] },
  'row': { slug: 'one-arm-dumbbell-row', frames: [require('../../assets/exercises/row-1.png')] },
  'pulldown': { slug: 'lat-pulldown', frames: [require('../../assets/exercises/pulldown-1.png')] },
  'rdl': { slug: 'dumbbell-romanian-deadlift', frames: [require('../../assets/exercises/rdl-1.png')] },
  'ohp': { slug: 'standing-dumbbell-press', frames: [require('../../assets/exercises/ohp-1.png')] },
  'lateral': { slug: 'lateral-raise', frames: [require('../../assets/exercises/lateral-1.png')] },
  'curl': { slug: 'bicep-curl', frames: [require('../../assets/exercises/curl-1.png')] },
  'pushdown': { slug: 'tricep-pushdown', frames: [require('../../assets/exercises/pushdown-1.png')] },
  'leg-curl': { slug: 'leg-curl', frames: [require('../../assets/exercises/leg-curl-1.png')] },
  'calf': { slug: 'calf-raise', frames: [require('../../assets/exercises/calf-1.png')] },
  'pushup': { slug: 'push-up', frames: [require('../../assets/exercises/pushup-1.png')] },
  'bridge': { slug: 'glute-bridge', frames: [require('../../assets/exercises/bridge-1.png')] },
  'deadbug': { slug: 'dead-bug', frames: [require('../../assets/exercises/deadbug-1.png')] },
};
export const mediaCredit = 'Bryl Lim / Everkinetic · CC BY-SA 4.0';
export const mediaSourceUrl = 'https://github.com/bryllim/workout-guide';
export const mediaLicenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0/';
