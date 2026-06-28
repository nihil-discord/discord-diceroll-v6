import type { APIEmbedField } from 'discord.js';

export const DICE_MANUAL_FIELDS: APIEmbedField[] = [
  {
    name: '기본식',
    value: '`d20`, `3d6`, `ㅇ20`\n주사위 개수를 생략하면 1개로 처리합니다. `d`, `D`, `ㅇ`를 모두 사용할 수 있습니다.',
    inline: false,
  },
  {
    name: '숫자 보정',
    value: '`d20+5`, `3d6-2`, `d20+5+4d6kl2`\n주사위식 안에서 `+N`, `-N` 보정을 함께 사용할 수 있습니다.',
    inline: false,
  },
  {
    name: 'Explode',
    value: '`10d6!`, `1d6x`\n최대값이 나오면 추가로 한 번 더 굴립니다.',
    inline: false,
  },
  {
    name: 'Compound Explode',
    value: '`10d6!!`, `1d6xo`\n최대값이 나오면 추가 굴림 값을 기존 주사위 값에 합산합니다.',
    inline: false,
  },
  {
    name: 'Keep Highest',
    value: '`4d6kh3`, `4d6k`\n가장 높은 눈부터 지정한 개수만 남깁니다. `k`는 `kh1`처럼 동작합니다.',
    inline: false,
  },
  {
    name: 'Keep Lowest',
    value: '`2d20kl1`, `4d6kl`\n가장 낮은 눈부터 지정한 개수만 남깁니다. `kl`은 `kl1`처럼 동작합니다.',
    inline: false,
  },
  {
    name: 'Drop Highest',
    value: '`4d6dh1`, `4d6dh`\n가장 높은 눈부터 지정한 개수만 버립니다. `dh`는 `dh1`처럼 동작합니다.',
    inline: false,
  },
  {
    name: 'Drop Lowest',
    value: '`4d6dl1`, `4d6d`\n가장 낮은 눈부터 지정한 개수만 버립니다. `d`는 `dl1`, `dl`처럼 동작합니다.',
    inline: false,
  },
  {
    name: 'Reroll',
    value: '`1d20r1`, `3d6r<2`\n조건에 맞는 눈은 한 번 다시 굴립니다. `=`, `<`, `<=`, `>`, `>=` 비교를 붙일 수 있습니다.',
    inline: false,
  },
  {
    name: 'Recursive Reroll',
    value: '`1d20rr1`, `2d6rr<2`\n조건을 벗어날 때까지 반복해서 다시 굴립니다.',
    inline: false,
  },
  {
    name: 'Success Count',
    value: '`5d10>7`, `5d10>=8`\n조건을 만족한 주사위 개수를 결과로 계산합니다.',
    inline: false,
  },
  {
    name: 'Success / Failure Net',
    value: '`5d10>8f1`, `5d10>=8f<=2`\n성공은 `+1`, 실패는 `-1`로 계산해 최종 순성공값을 반환합니다.',
    inline: false,
  },
  {
    name: 'Critical Success / Failure Count',
    value: '`4d6cs`, `4d6cf`, `4d6cs>5`, `4d6cf<3`\n`cs`는 성공 눈 개수, `cf`는 실패 눈 개수를 셉니다. 비교식이 없으면 `cs`는 최대눈, `cf`는 1을 기준으로 삼습니다.',
    inline: false,
  },
  {
    name: 'Deduct Failure / Margin Success',
    value: '`4d6df`, `3d6sf<3`, `3d6ms>10`\n`df`는 실패 개수만큼 차감, `sf`는 실패한 눈 값을 차감, `ms`는 총합에서 목표값을 뺀 차이를 계산합니다.',
    inline: false,
  },
  {
    name: '짝수 / 홀수',
    value: '`4d6even`, `4d6odd`\n짝수 눈 개수 또는 홀수 눈 개수를 계산합니다.',
    inline: false,
  },
  {
    name: '최소 / 최대 보정',
    value: '`4d6min2`, `4d6max5`, `4d6min2max5`\n각 주사위 값을 최소값이나 최대값으로 보정한 뒤 계산합니다.',
    inline: false,
  },
  {
    name: '백분위 / Fate',
    value: '`d%`, `D%`, `dF`, `4dF`\n`d%`는 1~100, `dF`는 Fate 주사위입니다. `dF`는 개수를 생략하면 기본 4개를 굴립니다.',
    inline: false,
  },
  {
    name: '여러 식 한 번에',
    value: '`d20+5 3d6+2`\n공백으로 구분하면 여러 주사위식을 각각 독립적으로 계산합니다.',
    inline: false,
  },
  {
    name: '조합 예시',
    value: '`4d6min2rr1kh3`, `d20+5+4d6kl2`\n지원 modifier들은 같은 주사위 블록 안에서 조합할 수 있습니다.',
    inline: false,
  },
];
