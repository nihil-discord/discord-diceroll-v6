import type { APIEmbedField } from 'discord.js';

export const DICE_MANUAL_FIELDS: APIEmbedField[] = [
  {
    name: '기본 굴림',
    value: '`d20`, `3d6`, `d20+5` — 개수 생략 시 1개. `d`/`D`/`ㅇ` 동일.',
    inline: true,
  },
  {
    name: 'Explode / Compound',
    value: '`10d6!`, `10d6!!`, `1d6x`, `1d6xo` — 폭발/합산 굴림',
    inline: true,
  },
  {
    name: 'Keep / Drop',
    value: '`4d6kh3`, `4d6k`, `4d6dh1`, `4d6d`, `4d6dl1`, `4d6kl`',
    inline: true,
  },
  {
    name: 'Reroll',
    value: '`1d20r1`, `2d6rr<2` (`ro` 제거)',
    inline: true,
  },
  {
    name: 'Success Family',
    value: '`5d10>7`, `5d10>8f1`, `4d6cf`, `4d6df`, `3d6sf<3`, `3d6ms>10`, `4d6even`, `4d6odd`',
    inline: true,
  },
  {
    name: '기타',
    value: '`d%`, `4dF`, `4d6min2max5`, `d20+5 3d6+2`',
    inline: true,
  },
];
