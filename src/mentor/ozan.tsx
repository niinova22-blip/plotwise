import {
  Canvas,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

import { C, SHAPES as S } from './art/shapes';
import { eyeShape, EYE_L, EYE_R } from './rig/geometry';
import { POSES, type Mood } from './rig/params';
import { useRig } from './use-rig';

const clipL = Skia.Path.MakeFromSVGString(eyeShape(EYE_L.cx))!;
const clipR = Skia.Path.MakeFromSVGString(eyeShape(EYE_R.cx))!;

const W = 300;
const H = 330;

type Props = {
  size: number;
  mood: Mood;
  /** True while a line plays (and briefly after): shows the mood's gesture. */
  gesturing: boolean;
  /** Mouth-open envelope 0..1, driven by the speech player. */
  speaking: SharedValue<number>;
  /** Eyes jump here (-1..1) while set, e.g. towards a tapped button. */
  glanceAt?: SharedValue<[number, number] | null>;
  /** False freezes him, e.g. while his screen is covered by another. */
  active?: boolean;
};

const Skin = ({ cx = 132, cy = 110, r = 80 }: { cx?: number; cy?: number; r?: number }) => (
  <RadialGradient c={vec(cx, cy)} r={r} colors={C.skin} positions={[0, 0.75, 1]} />
);

function Stroke({ d, color, width, opacity = 1 }: { d: string | SharedValue<string>; color: string; width: number; opacity?: number | SharedValue<number> }) {
  return <Path path={d} color={color} style="stroke" strokeWidth={width} strokeCap="round" strokeJoin="round" opacity={opacity} />;
}

/** Ozan, the lantern-carrying storyteller. Drawn with Skia, animated on the UI thread. */
export function Ozan({ size, mood, gesturing, speaking, glanceAt, active = true }: Props) {
  const r = useRig(mood, gesturing, speaking, glanceAt, active);
  const scale = size / W;

  return (
    <Canvas style={{ width: size, height: (size * H) / W }}>
      <Group transform={[{ scale }]}>
        <Path path={S.shadow} color="#5A3A22" opacity={0.09} />

        {/* Lantern */}
        <Group>
          <Rect x={180} y={230} width={130} height={100} opacity={r.glow}>
            <RadialGradient c={vec(...S.lanternGlow.c)} r={S.lanternGlow.r} colors={C.glow} positions={[0, 0.5, 1]} />
          </Rect>
          <Path path={S.lanternGround} color={C.glass} opacity={r.groundGlow} />
        </Group>
        <Stroke d={S.lanternRing} color={C.brassDark} width={2.6} />
        <Path path={S.lanternKnob} color={C.brassDark} />
        <Path path={S.lanternCap}>
          <LinearGradient start={vec(236, 268)} end={vec(268, 288)} colors={[C.brassLight, C.brass, C.brassDark]} />
        </Path>
        <Stroke d={S.lanternCapHi} color="#FFF1CF" width={1.8} opacity={0.7} />
        <Path path={S.lanternCapRim} color={C.brassDark} />
        <Path path={S.lanternGlass}>
          <RadialGradient c={vec(252, 303)} r={18} colors={['#FFF0C2', C.glass, '#F2A93E']} positions={[0, 0.55, 1]} />
        </Path>
        <Group origin={vec(252, 308)} transform={r.flameScale}>
          <Path path={S.flame} color={C.flame} />
          <Path path={S.flameCore} color={C.flameCore} opacity={0.85} />
        </Group>
        <Path path={S.lanternPaneHi} color="#FFFFFF" opacity={0.35} />
        <Stroke d={S.lanternBars} color={C.brass} width={2.2} />
        <Path path={S.lanternBase}>
          <LinearGradient start={vec(233, 315)} end={vec(233, 322)} colors={[C.brass, C.brassDark]} />
        </Path>
        {S.lanternRivets.map((d, i) => (
          <Path key={i} path={d} color={C.brassLight} />
        ))}

        {/* Body */}
        <Group origin={vec(150, 330)} transform={r.bodyTransform}>
          <Path path={S.cloak}>
            <LinearGradient start={vec(150, 234)} end={vec(150, 330)} colors={C.cloak} />
          </Path>
          <Stroke d={S.cloakHiL} color={C.cloakLight} width={5} opacity={0.45} />
          <Stroke d={S.cloakHiR} color={C.cloakLight} width={5} opacity={0.45} />
          <Path path={S.liningL} color={C.cloakDeep} />
          <Path path={S.liningR} color={C.cloakDeep} />
          <Path path={S.tunic} color={C.tunic} />
          <Stroke d={S.tunicV} color={C.tunicLine} width={2.4} />
          <Stroke d={S.tunicFolds} color="#DCCAA6" width={1.6} />
          <Stroke d={S.belt} color={C.rope} width={6} />
          <Path path={S.beltStitch} color={C.ropeLight} style="stroke" strokeWidth={2.2} strokeCap="round" opacity={0.9} />
          <Path path={S.knot} color={C.rope} />
          <Stroke d={S.ropeEnds} color={C.rope} width={3} />
          <Stroke d={S.folds} color={C.cloakDark} width={3} opacity={0.5} />
          <Path path={S.hood} color={C.hood} />
          <Stroke d={S.hoodLine} color={C.hoodLine} width={3} />
          <Stroke d={S.hoodFolds} color="#7E3322" width={1.8} />
          <Path path={S.clasp} color="#E2A73B" />
          <Path path={S.claspHi} color="#F7D894" />

          {/* Resting sleeve on his left, mirrored from the gesture arm's rest pose */}
          <Group transform={[{ translateX: W }, { scaleX: -1 }]}>
            <Path path={S.restSleeve}>
              <LinearGradient start={vec(100, 250)} end={vec(140, 300)} colors={C.sleeve} />
            </Path>
            <Group transform={[{ translateX: POSES.rest.w[0] }, { translateY: POSES.rest.w[1] }, { rotate: (S.restCuffAngle * Math.PI) / 180 }]}>
              <Path path={S.cuff} color={C.cuff} />
            </Group>
          </Group>
        </Group>

        {/* Head */}
        <Group origin={vec(150, 226)} transform={r.headTransform}>
          <Path path={S.hairL}>
            <RadialGradient c={vec(92, 118)} r={40} colors={C.hair} />
          </Path>
          <Path path={S.hairR}>
            <RadialGradient c={vec(208, 118)} r={40} colors={C.hair} />
          </Path>
          <Stroke d={S.hairShade} color={C.hairLine} width={1.8} />
          <Stroke d={S.hairStrands} color="#FFFFFF" width={1.4} opacity={0.8} />
          <Path path={S.earL} color={C.skinShade} />
          <Path path={S.earR} color={C.skinShade} />
          <Stroke d={S.earLines} color="#D08F6C" width={2} />
          <Path path={S.face}>
            <Skin />
          </Path>
          <Path path={S.shine} color="#FFFFFF" opacity={0.28} />
          <Stroke d={S.wisps} color="#F1EDE6" width={1.5} opacity={0.85} />
          <Stroke d={S.crownWisps} color="#EEE9E1" width={3} />
          <Stroke d={S.forehead} color={C.skinFold} width={1.5} opacity={r.forehead} />
          {S.spots.map((d, i) => (
            <Path key={i} path={d} color="#E3A47F" opacity={0.42} />
          ))}
          <Path path={S.blushL} color={C.blush} opacity={r.blush} />
          <Path path={S.blushR} color={C.blush} opacity={r.blush} />

          {/* Eyes: everything inside is clipped to the almond opening */}
          <Group clip={clipL}>
            <Rect x={105} y={110} width={42} height={32} color={C.eyeWhite} />
            <Group transform={r.irisTransform}>
              <Path path={S.irisL} color={C.iris} />
              <Path path={S.pupilL} color={C.pupil} />
              <Path path={S.glintL} color="#FFFFFF" />
            </Group>
            <Path path={r.lidL}>
              <Skin />
            </Path>
            <Path path={r.lowL}>
              <Skin />
            </Path>
            <Stroke d={r.lashL} color={C.lash} width={2.4} />
            <Stroke d={r.lowLashL} color={C.lowLash} width={1.6} opacity={r.lowLashOpacity} />
          </Group>
          <Group clip={clipR}>
            <Rect x={153} y={110} width={42} height={32} color={C.eyeWhite} />
            <Group transform={r.irisTransform}>
              <Path path={S.irisR} color={C.iris} />
              <Path path={S.pupilR} color={C.pupil} />
              <Path path={S.glintR} color="#FFFFFF" />
            </Group>
            <Path path={r.lidR}>
              <Skin />
            </Path>
            <Path path={r.lowR}>
              <Skin />
            </Path>
            <Stroke d={r.lashR} color={C.lash} width={2.4} />
            <Stroke d={r.lowLashR} color={C.lowLash} width={1.6} opacity={r.lowLashOpacity} />
          </Group>
          <Stroke d={S.eyeBags} color="#E0A07D" width={1.4} opacity={0.55} />
          <Stroke d={S.crowL} color={C.skinLine} width={1.5} opacity={r.crowOpacity} />
          <Stroke d={S.crowR} color={C.skinLine} width={1.5} opacity={r.crowOpacity} />

          {/* Brows: an under-tone stroke plus the white fluff on top */}
          <Stroke d={r.browL} color={C.browUnder} width={10} />
          <Stroke d={r.browL} color={C.brow} width={7.5} />
          <Stroke d={r.browR} color={C.browUnder} width={10} />
          <Stroke d={r.browR} color={C.brow} width={7.5} />

          {/* Beard, mouth, tuft, moustache, nose */}
          <Path path={S.beardBack} color={C.beardBack} />
          <Group transform={r.beardLow}>
            <Path path={S.beard}>
              <LinearGradient start={vec(150, 158)} end={vec(150, 252)} colors={C.beard} />
            </Path>
            <Stroke d={S.beardStrands} color={C.beardLine} width={2} />
            <Stroke d={S.beardLight} color="#E8E2D7" width={1.6} />
          </Group>
          <Path path={r.mouthInner} color={C.mouth} opacity={r.mouthInnerOpacity} />
          <Stroke d={r.mouthLine} color={C.mouthLine} width={2.6} opacity={r.mouthLineOpacity} />
          <Group transform={r.tuft}>
            <Path path={S.tuft} color="#F3EFE8" />
          </Group>
          <Group transform={r.stache}>
            <Path path={S.stache} color={C.stache} />
            <Stroke d={S.stacheLines} color={C.stacheLine} width={1.8} />
            <Stroke d={S.stacheStrands} color="#ECE6DC" width={1.2} />
          </Group>
          <Path path={S.nose}>
            <RadialGradient c={vec(146, 144)} r={14} colors={C.nose} />
          </Path>
          <Path path={S.noseHi} color="#FFFFFF" opacity={0.45} />
          <Stroke d={S.noseSides} color="#D88F6C" width={1.3} opacity={0.6} />
          <Stroke d={S.nostrils} color="#C9805F" width={1.4} />
        </Group>

        {/* Gesture arm, in front of the beard so he can stroke it. The hand is drawn
            first so that at rest it slides back under the sleeve and cuff. */}
        <Group transform={r.armTransform}>
          <Group transform={r.handTransform}>
            <Group origin={vec(-13, -9)} transform={[{ rotate: (-35 * Math.PI) / 180 }]}>
              <Path path={S.thumb}>
                <Skin cx={-14} cy={-14} r={14} />
              </Path>
            </Group>
            <Path path={S.palm}>
              <Skin cx={-2} cy={-20} r={26} />
            </Path>
            <Stroke d={S.fingerHint} color="#DA9573" width={1.3} opacity={0.65} />
            <Stroke d={S.palmCrease} color="#E2A07E" width={1.3} opacity={0.65} />
          </Group>
          <Path path={r.sleeve}>
            <LinearGradient start={vec(60, 240)} end={vec(140, 310)} colors={C.sleeve} />
          </Path>
          <Group transform={r.cuffTransform}>
            <Path path={S.cuff} color={C.cuff} />
            <Path path={S.cuffInner} color={C.cuffInner} opacity={0.85} />
          </Group>
        </Group>
      </Group>
    </Canvas>
  );
}
