import { router } from 'expo-router';

import { Card, Txt } from '@/components/ui';
import { useI18n } from '@/hooks/use-i18n';
import type { Echo } from '@/store/echo';

/** A reminder of an earlier session on the same topic; opens its card in the notebook. */
export function EchoCard({ echo }: { echo: Echo }) {
  const { s, lang } = useI18n();
  const { session, card } = echo;
  const date = new Date(session.createdAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long' });
  return (
    <Card accent="insight" onPress={card ? () => router.push(`/notebook/${card.id}`) : undefined}>
      <Txt variant="caption" color="insight">
        {`${s.common.echoTitle} · ${date}`}
      </Txt>
      <Txt color="textSecondary">{`“${session.title}”`}</Txt>
      {card && <Txt variant="heading">{card.title}</Txt>}
      {card?.followUpNote ? (
        <Txt variant="small" color="textSecondary">
          {`${s.common.echoLearned}: ${card.followUpNote}`}
        </Txt>
      ) : null}
    </Card>
  );
}
