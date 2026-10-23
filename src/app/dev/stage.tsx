import { Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/hooks/use-i18n';
import { useMentor } from '@/mentor/mentor-provider';
import { getScript } from '@/mentor/script';
import { MentorStage } from '@/mentor/stage';

/** Dev-only: drive the stage with real script lines. */
export default function StageGallery() {
  const m = useMentor();
  const { lang } = useI18n();
  if (!__DEV__) return <Redirect href="/" />;
  const script = getScript(lang);
  const runs = {
    home: script.home.first,
    lab: script.lab.describe,
    empathy: script.reactions.work_people,
    think: script.lab.assumptions,
    happy: script.lab.experiment,
  };
  return (
    <View style={styles.page}>
      <View style={styles.stage}>
        <MentorStage />
      </View>
      <Text>status: {m.status}</Text>
      <View style={styles.row}>
        {Object.entries(runs).map(([k, lines]) => (
          <Pressable key={k} style={styles.btn} onPress={() => m.say(lines)}>
            <Text>{k}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  stage: { width: '100%', maxWidth: 420 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E6D8C2' },
});
