import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Card, Field, KindBadge, Screen, Txt } from '@/components/ui';
import { useI18n } from '@/hooks/use-i18n';
import { useStore } from '@/store/app-store';

export default function CardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, lang } = useI18n();
  const { data, dispatch } = useStore();
  const card = data.cards.find((c) => c.id === id);
  const session = data.sessions.find((x) => x.id === card?.sessionId);
  const [note, setNote] = useState(card?.followUpNote ?? '');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!card) {
    return (
      <Screen title={s.notebook.title}>
        <Txt color="textSecondary">{s.notebook.empty}</Txt>
      </Screen>
    );
  }

  const siblings = data.cards.filter((c) => c.sessionId === card.sessionId && c.id !== card.id);
  const date = new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(card.createdAt);

  return (
    <Screen title={s.notebook.title}>
      <KindBadge kind={card.kind} />
      <Txt variant="title">{card.title}</Txt>
      <Txt color="textSecondary">{card.body}</Txt>
      <Txt variant="small" color="textTertiary">
        {date}
      </Txt>

      {card.kind === 'experiment' && (
        <Card accent="experiment">
          <Txt variant="caption" color="experiment">
            {s.notebook.followUpTitle}
          </Txt>
          <Field
            value={note}
            onChangeText={(v) => {
              setNote(v);
              setSaved(false);
            }}
            placeholder={s.notebook.followUpPlaceholder}
            minHeight={90}
          />
          <Button
            label={saved ? s.notebook.followUpSaved : s.common.save}
            variant="secondary"
            disabled={!note.trim() || saved}
            onPress={() => {
              dispatch({ type: 'updateCard', id: card.id, patch: { followUpNote: note.trim() } });
              setSaved(true);
            }}
          />
        </Card>
      )}

      {session && (
        <>
          <Txt variant="caption" color="textSecondary">
            {s.notebook.fromSession}
          </Txt>
          <Card>
            <Txt variant="heading">{session.title}</Txt>
          </Card>
          {siblings.map((c) => (
            <Card key={c.id} accent={c.kind} onPress={() => router.replace(`/notebook/${c.id}`)}>
              <KindBadge kind={c.kind} />
              <Txt>{c.title}</Txt>
            </Card>
          ))}
        </>
      )}

      <Button
        label={confirmDelete ? s.notebook.deleteConfirm : s.notebook.delete}
        variant="ghost"
        onPress={() => {
          if (!confirmDelete) return setConfirmDelete(true);
          dispatch({ type: 'deleteCard', id: card.id });
          router.back();
        }}
      />
    </Screen>
  );
}
