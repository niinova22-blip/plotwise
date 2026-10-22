import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Chip, KindBadge, Row, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import { useStore } from '@/store/app-store';
import type { CardKind } from '@/store/types';

type Filter = 'all' | CardKind;
const FILTERS: Filter[] = ['all', 'assumption', 'reframe', 'experiment', 'future', 'insight'];

export default function Notebook() {
  const { s, lang } = useI18n();
  const { data } = useStore();
  const [filter, setFilter] = useState<Filter>('all');

  const cards = data.cards.filter((c) => filter === 'all' || c.kind === filter);
  const available = new Set(data.cards.map((c) => c.kind));
  const dateFmt = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' });

  return (
    <Screen title={s.notebook.title}>
      <Txt variant="display">{s.notebook.title}</Txt>
      {data.cards.length === 0 ? (
        <Txt color="textSecondary">{s.notebook.empty}</Txt>
      ) : (
        <Row>
          {FILTERS.filter((f) => f === 'all' || available.has(f)).map((f) => (
            <Chip key={f} label={s.notebook.filters[f]} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </Row>
      )}
      {cards.map((c) => (
        <Card key={c.id} accent={c.kind} onPress={() => router.push(`/notebook/${c.id}`)}>
          <View style={styles.cardTop}>
            <KindBadge kind={c.kind} />
            <Txt variant="small" color="textTertiary">
              {dateFmt.format(c.createdAt)}
            </Txt>
          </View>
          <Txt variant="heading">{c.title}</Txt>
          <Txt variant="small" color="textSecondary" numberOfLines={2}>
            {c.body}
          </Txt>
          {c.followUpNote ? (
            <Txt variant="small" color="experiment">
              ✓ {c.followUpNote}
            </Txt>
          ) : null}
        </Card>
      ))}
      <View style={styles.bottom} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottom: { height: Spacing.four },
});
