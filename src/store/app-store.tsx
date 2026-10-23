import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useReducer, useState, type ReactNode } from 'react';

import { newId } from './ids';
import type { AppData, OutcomeCard, Profile, Session, TrainingEntry } from './types';

const STORAGE_KEY = 'plotwise/v1';

function initialData(): AppData {
  return {
    version: 1,
    profile: {
      onboarded: false,
      lang: null,
      theme: 'system',
      goals: [],
      minutes: 5,
      installId: newId(),
      mentorVoice: true,
      quietMode: false,
    },
    cards: [],
    sessions: [],
    training: [],
  };
}

type Action =
  | { type: 'hydrate'; data: AppData }
  | { type: 'profile'; patch: Partial<Profile> }
  | { type: 'saveSession'; session: Session; cards: OutcomeCard[] }
  | { type: 'updateCard'; id: string; patch: Partial<OutcomeCard> }
  | { type: 'deleteCard'; id: string }
  | { type: 'addTraining'; entry: TrainingEntry }
  | { type: 'reset' };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'hydrate':
      return action.data;
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'saveSession':
      return {
        ...state,
        sessions: [action.session, ...state.sessions],
        cards: [...action.cards, ...state.cards],
      };
    case 'updateCard':
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      };
    case 'deleteCard':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.id) };
    case 'addTraining':
      return { ...state, training: [action.entry, ...state.training] };
    case 'reset':
      return initialData();
  }
}

type Store = {
  ready: boolean;
  data: AppData;
  dispatch: (action: Action) => void;
};

const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, initialData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as AppData;
          const base = initialData();
          // Merge the profile too, so fields added in later versions get their defaults.
          dispatch({ type: 'hydrate', data: { ...base, ...parsed, profile: { ...base.profile, ...parsed.profile } } });
        }
      })
      .catch(() => {
        // Corrupt or unavailable storage: start fresh rather than block the app.
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [ready, data]);

  return <StoreContext value={{ ready, data, dispatch }}>{children}</StoreContext>;
}

export function useStore(): Store {
  const store = use(StoreContext);
  if (!store) throw new Error('useStore must be used inside AppStoreProvider');
  return store;
}

export async function wipeStorage() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
