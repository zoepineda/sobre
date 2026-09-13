import React from "react";
import { Composition, Series } from "remotion";
import { Accounts, Envelopes, Intro, Outro, Payday, Spend } from "./scenes";

const FPS = 30;
const SCENES = [
  { Comp: Intro, frames: 135 }, // 4.5s
  { Comp: Accounts, frames: 240 }, // 8s
  { Comp: Envelopes, frames: 330 }, // 11s
  { Comp: Payday, frames: 270 }, // 9s
  { Comp: Spend, frames: 240 }, // 8s
  { Comp: Outro, frames: 150 }, // 5s
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
