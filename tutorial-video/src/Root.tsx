import React from "react";
import { Composition, Series } from "remotion";
import { Accounts, Envelopes, Intro, Outro, Payday, Spend } from "./scenes";

const FPS = 30;
const SCENES = [
  { Comp: Intro, frames: 150 }, // 5s
  { Comp: Accounts, frames: 330 }, // 11s
  { Comp: Envelopes, frames: 360 }, // 12s
  { Comp: Payday, frames: 360 }, // 12s
  { Comp: Spend, frames: 360 }, // 12s
  { Comp: Outro, frames: 240 }, // 8s
];
const TOTAL = SCENES.reduce((s, x) => s + x.frames, 0);

const Tutorial: React.FC = () => (
  <Series>
    {SCENES.map(({ Comp, frames }, i) => (
      <Series.Sequence key={i} durationInFrames={frames}>
        <Comp duration={frames} />
      </Series.Sequence>
    ))}
  </Series>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SobreTutorial"
    component={Tutorial}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
