import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { OzanHost } from '@/mentor/ozan-host';
import { MOODS, type Mood } from '@/mentor/rig/params';

const LINES: Record<Mood, string> = {
  warm: 'Bugün ne üzerine düşüneceksin? Hadi, yolculuğa başlayalım.',
  empathy: 'Ah, insanlar... Dünyanın en karmaşık bulmacası.',
  happy: 'Ooo, işte bu güzel bir fikir!',
  think: 'Hmm... Peki ya tam tersi doğruysa?',
  curious: 'Vay, bunu hiç böyle düşünmemiştim.',
};
const VOWELS = 'aeıioöuüAEIİOÖUÜ';

/** Dev-only gallery: every mood with a fake syllable envelope, for visual checks. */
export default function OzanGallery() {
  const [mood, setMood] = useState<Mood>('warm');
  const [gesturing, setGesturing] = useState(false);
  const speaking = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (!__DEV__) return <Redirect href="/" />;

  function play(m: Mood) {
    setMood(m);
    setGesturing(true);
    const text = LINES[m];
    const rate = MOODS[m].rate;
    let i = 0;
    const step = () => {
      if (i >= text.length) {
        speaking.value = 0;
        timer.current = setTimeout(() => setGesturing(false), m === 'think' ? 2600 : 1400);
        return;
      }
      const ch = text[i++];
      let dur = 62 / rate;
      if (VOWELS.includes(ch)) speaking.value = 0.45 + Math.random() * 0.45;
      else if (ch === ' ') speaking.value = 0.08;
      else if (',.!?'.includes(ch)) {
        speaking.value = 0;
        dur = 380 * MOODS[m].pause;
      } else speaking.value = 0.05 + Math.random() * 0.18;
      timer.current = setTimeout(step, dur);
    };
    if (timer.current) clearTimeout(timer.current);
    step();
  }

  return (
    <View style={styles.page}>
      <OzanHost size={320} mood={mood} gesturing={gesturing} speaking={speaking} />
      <Text style={styles.line}>{LINES[mood]}</Text>
      <View style={styles.row}>
        {(Object.keys(MOODS) as Mood[]).map((m) => (
          <Pressable key={m} onPress={() => play(m)} style={[styles.btn, mood === m && styles.on]}>
            <Text>{m}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6EFE3', gap: 12 },
  line: { fontSize: 16, color: '#2A2420', maxWidth: 320, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFFBF4', borderWidth: 1, borderColor: '#E6D8C2' },
  on: { borderColor: '#C2573A' },
});
