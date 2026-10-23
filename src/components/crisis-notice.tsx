import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

import { useI18n } from '@/hooks/use-i18n';

import { Button, Card, Txt } from './ui';

/**
 * Shown instead of a thinking flow on a possible crisis. With onContinue (a
 * softer, meaning-based match) the user may also carry on with their session.
 */
export function CrisisNotice({ onBack, onContinue }: { onBack: () => void; onContinue?: () => void }) {
  const { s, lang } = useI18n();
  return (
    <Card accent="danger">
      <Txt variant="title">{s.crisis.title}</Txt>
      <Txt color="textSecondary">{s.crisis.body}</Txt>
      <Txt variant="heading">{s.crisis.emergency}</Txt>
      {lang === 'tr' && (
        <Button label="112" variant="secondary" onPress={() => Linking.openURL('tel:112')} />
      )}
      <Button
        label={s.crisis.helplines}
        onPress={() => WebBrowser.openBrowserAsync('https://findahelpline.com')}
      />
      {onContinue && <Button label={s.crisis.continue} variant="secondary" onPress={onContinue} />}
      <Button label={s.crisis.back} variant="ghost" onPress={onBack} />
    </Card>
  );
}
