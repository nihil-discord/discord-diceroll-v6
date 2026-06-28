# diceroll-v3 업그레이드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@nihilapp/diceroll-v3@3.0.4` 기준으로 `/프리셋`, `/페이트`, `/주사위`의 내부 로직과 도움말을 정렬하고 새 결과 유형까지 안정적으로 표시한다.

**Architecture:** 명령어 구조는 유지하고, 주사위 결과 해석과 임베드 렌더링을 공용 포맷터 모듈로 이동한다. `/주사위` 도움말은 라이브러리 README 기준으로 재작성하고, 검증은 `ts-node` 기반의 실행형 테스트 파일과 `pnpm build`로 마무리한다.

**Tech Stack:** TypeScript, Robo.js, discord.js, `@nihilapp/diceroll-v3`, `ts-node`

---

## File Map

- Modify: `src/commands/preset_roll.ts`
  현재 `rollBasic()` 결과를 직접 임베드로 출력한다. 공용 포맷터 사용으로 전환한다.
- Modify: `src/commands/fate.ts`
  현재 `rollFate()` 결과를 직접 임베드로 출력한다. 공용 포맷터 사용으로 전환한다.
- Modify: `src/commands/custom_roll.ts`
  현재 수동 분기, 구형 도움말, 넓은 타입 캐스팅이 모두 들어 있다. 결과 처리와 도움말 참조를 공용 모듈로 이동한다.
- Create: `src/lib/diceroll/formatters.ts`
  `rollBasic`, `rollFate`, `rollDiceExpression` 결과를 임베드로 바꾸는 단일 진입점이다.
- Create: `src/lib/diceroll/manual.ts`
  최신 README 기준 설명서 필드 상수를 보관한다.
- Create: `src/lib/diceroll/formatters.test.ts`
  `ts-node`로 실행하는 경량 검증 파일이다. 핵심 `kind`와 제거 문법을 직접 확인한다.

### Task 1: 공용 포맷터 테스트 골격 추가

**Files:**
- Create: `src/lib/diceroll/formatters.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```ts
import assert from 'node:assert/strict';
import { rollBasic, rollDiceExpression, rollFate } from '@nihilapp/diceroll-v3';
import {
  createBasicRollEmbed,
  createDiceExpressionEmbeds,
  createFateRollEmbed
} from './formatters.js';

function expectFieldText(text: string | undefined, needle: string) {
  assert.ok(text?.includes(needle), `Expected "${needle}" in "${text}"`);
}

function run() {
  const basicEmbed = createBasicRollEmbed({
    diceType: 20,
    count: 2,
    result: rollBasic(2, 20),
    user: {
      username: 'tester',
      displayAvatarURL: () => 'https://example.com/avatar.png',
    } as never,
  });

  assert.equal(basicEmbed.title, 'D20 굴림 결과');
  assert.equal(basicEmbed.fields?.[0]?.name, '총합 (Total)');

  const fateEmbed = createFateRollEmbed({
    count: 4,
    result: rollFate(4),
    user: {
      username: 'tester',
      displayAvatarURL: () => 'https://example.com/avatar.png',
    } as never,
  });

  assert.equal(fateEmbed.title, '페이트 주사위 굴림 결과');

  const successEmbeds = createDiceExpressionEmbeds({
    results: rollDiceExpression('4d6cf 4d6even 3d6ms>10'),
    user: {
      username: 'tester',
      displayAvatarURL: () => 'https://example.com/avatar.png',
    } as never,
  });

  assert.equal(successEmbeds.length, 3);
  expectFieldText(successEmbeds[0].fields?.[1]?.value, '개수');
  expectFieldText(successEmbeds[1].fields?.[1]?.value, '개수');
  expectFieldText(successEmbeds[2].fields?.[1]?.value, '목표값');

  assert.throws(() => rollDiceExpression('1d20ro1'));
}

run();
console.log('formatters.test.ts: ok');
```

- [ ] **Step 2: 테스트 실행으로 실패 확인**

Run: `@'` newline `node --loader ts-node/esm src/lib/diceroll/formatters.test.ts` newline `'@ | powershell -Command -`

Expected: `Cannot find module './formatters.js'` 또는 `createBasicRollEmbed is not exported` 계열 실패

- [ ] **Step 3: 실패 상태 커밋 전 확인**

Run: `git status --short`

Expected: `?? src/lib/diceroll/formatters.test.ts`

- [ ] **Step 4: 커밋**

```bash
git add src/lib/diceroll/formatters.test.ts
git commit -m "2026 0628 테스트: diceroll 포맷터 검증 골격 추가"
```

### Task 2: 공용 포맷터와 설명서 모듈 구현

**Files:**
- Create: `src/lib/diceroll/formatters.ts`
- Create: `src/lib/diceroll/manual.ts`
- Modify: `src/lib/diceroll/formatters.test.ts`

- [ ] **Step 1: 설명서 상수 파일 작성**

```ts
export const DICE_MANUAL_FIELDS = [
  {
    name: '기본 굴림',
    value: '`d20`, `3d6`, `d20+5` — 개수 생략 시 1개. `d`/`D`/`ㅇ` 동일.',
    inline: true as const,
  },
  {
    name: 'Explode / Compound',
    value: '`10d6!`, `10d6!!`, `1d6x`, `1d6xo`',
    inline: true as const,
  },
  {
    name: 'Keep / Drop',
    value: '`4d6kh3`, `4d6k`, `4d6dh1`, `4d6d`',
    inline: true as const,
  },
  {
    name: 'Reroll',
    value: '`1d20r1`, `2d6rr<2` (`ro` 제거)',
    inline: true as const,
  },
  {
    name: 'Success Family',
    value: '`5d10>7`, `5d10>8f1`, `4d6cf`, `4d6df`, `3d6sf<3`, `3d6ms>10`, `4d6even`, `4d6odd`',
    inline: true as const,
  },
  {
    name: '기타',
    value: '`d%`, `4dF`, `4d6min2max5`, `d20+5 3d6+2`',
    inline: true as const,
  },
];
```

- [ ] **Step 2: 포맷터 구현**

```ts
import type {
  APIEmbed,
  EmbedField,
  User
} from 'discord.js';
import type {
  DiceExpressionResult,
  RollBasicResult,
  RollFateResult,
  RollResult
} from '@nihilapp/diceroll-v3';

type EmbedUser = Pick<User, 'username' | 'displayAvatarURL'>;

function formatRollValue(result: {
  result: number;
  isCritical: boolean;
  isFumble: boolean;
}) {
  let text = `${result.result}`;
  if (result.isCritical) text = `**${text}** 🌟`;
  if (result.isFumble) text = `**${text}** 💀`;
  return text;
}

function createDetailField(result: RollResult, block: string, contribution: number): EmbedField {
  switch (result.kind) {
    case 'keepHighest':
    case 'keepLowest':
    case 'dropHighest':
    case 'dropLowest':
      return {
        name: block,
        value: [
          `유효 주사위: [ ${result.kept.map(formatRollValue).join(', ')} ]`,
          `제외 주사위: [ ${result.dropped.map(formatRollValue).join(', ')} ]`,
          `결과: **${contribution}**`,
        ].join('\n'),
        inline: false,
      };
    case 'success':
    case 'countFailure':
    case 'countEven':
    case 'countOdd':
      return {
        name: block,
        value: [
          `[ ${result.rolls.map(formatRollValue).join(', ')} ]`,
          `개수: **${result.successCount}**`,
        ].join('\n'),
        inline: false,
      };
    case 'netSuccess':
    case 'deductFailures':
      return {
        name: block,
        value: [
          `[ ${result.rolls.map(formatRollValue).join(', ')} ]`,
          `성공: ${result.successCount}, 실패: ${result.failureCount}`,
          `결과: **${result.total}**`,
        ].join('\n'),
        inline: false,
      };
    case 'subtractFailureFaces':
      return {
        name: block,
        value: [
          `[ ${result.rolls.map(formatRollValue).join(', ')} ]`,
          `실패 눈 합계: ${result.failureSum}`,
          `결과: **${contribution}**`,
        ].join('\n'),
        inline: false,
      };
    case 'marginSuccess':
      return {
        name: block,
        value: [
          `[ ${result.rolls.map(formatRollValue).join(', ')} ]`,
          `목표값: ${result.target}`,
          `결과: **${contribution}**`,
        ].join('\n'),
        inline: false,
      };
    case 'percentile':
      return {
        name: block,
        value: `${formatRollValue(result)} → **${contribution}**`,
        inline: false,
      };
    case 'fate':
      return {
        name: block,
        value: `[ ${result.dice.join(', ')} ] → **${contribution}**`,
        inline: false,
      };
    default:
      return {
        name: block,
        value: `[ ${result.rolls.map(formatRollValue).join(', ')} ] → **${contribution}**`,
        inline: false,
      };
  }
}
```

- [ ] **Step 3: 테스트 파일을 실제 포맷터 API에 맞게 정리**

```ts
import {
  createBasicRollEmbed,
  createDiceExpressionEmbeds,
  createFateRollEmbed
} from './formatters.js';
```

Expected: Task 1에서 만든 import 라인을 그대로 유지하고, 테스트가 더 이상 모듈 누락으로 실패하지 않는 상태로 만든다.

- [ ] **Step 4: 테스트 실행으로 통과 확인**

Run: `@'` newline `node --loader ts-node/esm src/lib/diceroll/formatters.test.ts` newline `'@ | powershell -Command -`

Expected: `formatters.test.ts: ok`

- [ ] **Step 5: 커밋**

```bash
git add src/lib/diceroll/formatters.ts src/lib/diceroll/manual.ts src/lib/diceroll/formatters.test.ts
git commit -m "2026 0628 기능: diceroll 공용 포맷터와 설명서 모듈 추가"
```

### Task 3: `/프리셋`과 `/페이트`를 공용 포맷터로 이관

**Files:**
- Modify: `src/commands/preset_roll.ts`
- Modify: `src/commands/fate.ts`
- Test: `src/lib/diceroll/formatters.test.ts`

- [ ] **Step 1: `/프리셋` 구현 최소 변경**

```ts
import { rollBasic } from '@nihilapp/diceroll-v3';
import { createBasicRollEmbed } from '../lib/diceroll/formatters.js';

// ...
const result = rollBasic(count, diceType);

return {
  embeds: [
    createBasicRollEmbed({
      diceType,
      count,
      result,
      user: interaction.user,
    }),
  ],
};
```

- [ ] **Step 2: `/페이트` 구현 최소 변경**

```ts
import { rollFate } from '@nihilapp/diceroll-v3';
import { createFateRollEmbed } from '../lib/diceroll/formatters.js';

// ...
const result = rollFate(count);

return {
  embeds: [
    createFateRollEmbed({
      count,
      result,
      user: interaction.user,
    }),
  ],
};
```

- [ ] **Step 3: 테스트 재실행**

Run: `@'` newline `node --loader ts-node/esm src/lib/diceroll/formatters.test.ts` newline `'@ | powershell -Command -`

Expected: `formatters.test.ts: ok`

- [ ] **Step 4: 빌드 전 타입 확인**

Run: `pnpm build`

Expected: build success

- [ ] **Step 5: 커밋**

```bash
git add src/commands/preset_roll.ts src/commands/fate.ts src/lib/diceroll/formatters.test.ts
git commit -m "2026 0628 리팩터링: 프리셋과 페이트 명령의 공용 포맷터 전환"
```

### Task 4: `/주사위` 결과 처리와 도움말 전면 교체

**Files:**
- Modify: `src/commands/custom_roll.ts`
- Modify: `src/lib/diceroll/formatters.test.ts`
- Create or Modify: `src/lib/diceroll/manual.ts`

- [ ] **Step 1: `/주사위`에서 수동 도움말 상수 제거**

```ts
import { rollDiceExpression } from '@nihilapp/diceroll-v3';
import { createDiceExpressionEmbeds } from '../lib/diceroll/formatters.js';
import { DICE_MANUAL_FIELDS } from '../lib/diceroll/manual.js';
```

Expected: `MANUAL_FIELDS`, `RollResult`, `RollInfo`, `formatRollInfo`, `createEmbed` 삭제 준비가 된다.

- [ ] **Step 2: 설명서 응답을 공용 상수로 교체**

```ts
if (action === 'manual') {
  return {
    embeds: [
      {
        title: '주사위식 설명서',
        description: '`/주사위`에서 사용할 수 있는 최신 주사위식 문법입니다. (`@nihilapp/diceroll-v3` 기준)',
        fields: DICE_MANUAL_FIELDS,
        color: 0x00b0f4,
        footer: {
          text: `요청: ${interaction.user.username}`,
          icon_url: interaction.user.displayAvatarURL(),
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
```

- [ ] **Step 3: 결과 처리 분기를 공용 포맷터 호출로 교체**

```ts
const results = rollDiceExpression(formulaStr);

return {
  embeds: createDiceExpressionEmbeds({
    results,
    user: interaction.user,
  }),
};
```

- [ ] **Step 4: 테스트 파일에 제거 문법과 신규 kind 확인 추가**

```ts
const extraEmbeds = createDiceExpressionEmbeds({
  results: rollDiceExpression('1d6xo 4d6df 3d6sf<3 2d6rr<2'),
  user: {
    username: 'tester',
    displayAvatarURL: () => 'https://example.com/avatar.png',
  } as never,
});

assert.equal(extraEmbeds.length, 4);
expectFieldText(extraEmbeds[0].fields?.[1]?.value, '결과');
expectFieldText(extraEmbeds[1].fields?.[1]?.value, '실패');
expectFieldText(extraEmbeds[2].fields?.[1]?.value, '실패 눈 합계');
expectFieldText(extraEmbeds[3].fields?.[1]?.value, '결과');
```

- [ ] **Step 5: 테스트 및 빌드 실행**

Run: `@'` newline `node --loader ts-node/esm src/lib/diceroll/formatters.test.ts` newline `'@ | powershell -Command -`

Expected: `formatters.test.ts: ok`

Run: `pnpm build`

Expected: build success

- [ ] **Step 6: 커밋**

```bash
git add src/commands/custom_roll.ts src/lib/diceroll/manual.ts src/lib/diceroll/formatters.test.ts
git commit -m "2026 0628 기능: 커스텀 주사위 로직과 도움말을 diceroll-v3 기준으로 개편"
```

### Task 5: 최종 검증과 마감 정리

**Files:**
- Modify: `src/lib/diceroll/formatters.test.ts` (필요 시만)
- Verify: `src/commands/custom_roll.ts`
- Verify: `src/commands/preset_roll.ts`
- Verify: `src/commands/fate.ts`

- [ ] **Step 1: 대표 수식 최종 검증**

```ts
const finalEmbeds = createDiceExpressionEmbeds({
  results: rollDiceExpression('d20+5 10d6!! 5d10!>8 4d6k 5d10>8f1 d% 4dF'),
  user: {
    username: 'tester',
    displayAvatarURL: () => 'https://example.com/avatar.png',
  } as never,
});

assert.equal(finalEmbeds.length, 7);
```

- [ ] **Step 2: 테스트 실행**

Run: `@'` newline `node --loader ts-node/esm src/lib/diceroll/formatters.test.ts` newline `'@ | powershell -Command -`

Expected: `formatters.test.ts: ok`

- [ ] **Step 3: 린트 실행**

Run: `pnpm lint`

Expected: lint success

- [ ] **Step 4: 빌드 실행**

Run: `pnpm build`

Expected: build success

- [ ] **Step 5: 작업 상태 확인**

Run: `git status --short`

Expected: working tree clean

- [ ] **Step 6: 커밋**

```bash
git add src/commands/preset_roll.ts src/commands/fate.ts src/commands/custom_roll.ts src/lib/diceroll/formatters.ts src/lib/diceroll/manual.ts src/lib/diceroll/formatters.test.ts
git commit -m "2026 0628 검증: diceroll-v3 업그레이드 마감"
```

## Self-Review

- Spec coverage:
  - 명령 구조 유지: Task 3, Task 4
  - 라이브러리 기준 동작 일치: Task 2, Task 4, Task 5
  - 결과 출력 안정화: Task 2, Task 3, Task 4
  - 도움말 개편: Task 2, Task 4
  - 제거 문법 `ro`: Task 1, Task 4, Task 5
- Placeholder scan:
  - `TODO`, `TBD`, "적절히" 같은 표현 없음
  - 각 단계에 파일, 코드, 실행 명령 포함
- Type consistency:
  - 공용 API 이름을 `createBasicRollEmbed`, `createFateRollEmbed`, `createDiceExpressionEmbeds`, `DICE_MANUAL_FIELDS`로 통일
