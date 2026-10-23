import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import type { ComponentProps, ComponentType } from 'react';
import { View } from 'react-native';

import type { Ozan } from './ozan';

type Props = ComponentProps<typeof Ozan>;

/** On web, Skia needs CanvasKit loaded before any Skia module is imported. */
export function OzanHost(props: Props) {
  return (
    <WithSkiaWeb<Props>
      opts={{ locateFile: () => '/canvaskit.wasm' }}
      getComponent={() => import('./ozan').then((m): { default: ComponentType<Props> } => ({ default: m.Ozan }))}
      componentProps={props}
      fallback={<View style={{ width: props.size, height: (props.size * 330) / 300 }} />}
    />
  );
}
