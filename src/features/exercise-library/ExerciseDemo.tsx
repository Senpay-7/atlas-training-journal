import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { DemoFrame } from '../../design-system/DemoFrame';
import { Button, Label, Progress, styles } from '../../design-system/ui';
import { useDesign } from '../../design-system/theme';
import { useMotionPreference } from '../../design-system/motion';
import { featureText } from '../../localization/features';
const sequence = [0, 1, 2, 1] as const;
export function ExerciseDemo({ exerciseId }: { exerciseId: string }) {
  const reduced = useMotionPreference();
  const { language } = useDesign();
  const f = (key: Parameters<typeof featureText>[1]) => featureText(language, key);
  const [playing, setPlaying] = useState(!reduced);
  const [step, setStep] = useState(0);
  useEffect(() => { if (reduced) setPlaying(false); }, [reduced]);
  useEffect(() => { const sub = AppState.addEventListener('change', state => { if (state !== 'active') setPlaying(false); }); return () => sub.remove(); }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setStep(value => (value + 1) % sequence.length), 800);
    return () => clearInterval(timer);
  }, [playing]);
  return <View style={{ gap: 12 }}><Label size={12} bold>{f('draftDemo')}</Label><DemoFrame exerciseId={exerciseId} frame={sequence[step]} />
    <Progress fraction={((sequence[step] ?? 0) + 1) / 3} />
    <View style={styles.wrap}><Button title={f(playing ? 'pause' : 'play')} icon={playing ? 'pause' : 'play'} onPress={() => setPlaying(!playing)} /><Button title={f('nextFrame')} secondary onPress={() => { setPlaying(false); setStep(value => (value + 1) % sequence.length); }} /></View>
    <Label muted size={12}>{f('demoNote')}</Label>
  </View>;
}
