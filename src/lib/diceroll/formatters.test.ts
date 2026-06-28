import assert from 'node:assert/strict';

import { rollBasic, rollDiceExpression, rollFate } from '@nihilapp/diceroll-v3';

import {
  createBasicRollEmbed,
  createDiceExpressionEmbeds,
  createFateRollEmbed
} from './formatters.js';

function expectFieldText(text: string | undefined, needle: string) {
  assert.ok(
    text?.includes(needle),
    `Expected "${needle}" in "${text}"`
  );
}

function createTestUser() {
  return {
    username: 'tester',
    displayAvatarURL: () => 'https://example.com/avatar.png',
  };
}

function run() {
  const basicEmbed = createBasicRollEmbed({
    diceType: 20,
    count: 2,
    result: rollBasic(
      2,
      20
    ),
    user: createTestUser(),
  });

  assert.equal(
    basicEmbed.title,
    'D20 굴림 결과'
  );
  assert.equal(
    basicEmbed.fields?.[0]?.name,
    '총합 (Total)'
  );

  const fateEmbed = createFateRollEmbed({
    count: 4,
    result: rollFate(4),
    user: createTestUser(),
  });

  assert.equal(
    fateEmbed.title,
    '페이트 주사위 굴림 결과'
  );

  const successEmbeds = createDiceExpressionEmbeds({
    results: rollDiceExpression('4d6cf 4d6even 3d6ms>10'),
    user: createTestUser(),
  });

  assert.equal(
    successEmbeds.length,
    3
  );
  expectFieldText(
    successEmbeds[0].fields?.[1]?.value,
    '개수'
  );
  expectFieldText(
    successEmbeds[1].fields?.[1]?.value,
    '개수'
  );
  expectFieldText(
    successEmbeds[2].fields?.[1]?.value,
    '목표값'
  );

  const extraEmbeds = createDiceExpressionEmbeds({
    results: rollDiceExpression('1d6xo 4d6df 3d6sf<3 2d6rr<2'),
    user: createTestUser(),
  });

  assert.equal(
    extraEmbeds.length,
    4
  );
  expectFieldText(
    extraEmbeds[0].fields?.[1]?.value,
    '결과'
  );
  expectFieldText(
    extraEmbeds[1].fields?.[1]?.value,
    '실패'
  );
  expectFieldText(
    extraEmbeds[2].fields?.[1]?.value,
    '실패 눈 합계'
  );
  expectFieldText(
    extraEmbeds[3].fields?.[1]?.value,
    '결과'
  );

  const finalEmbeds = createDiceExpressionEmbeds({
    results: rollDiceExpression('d20+5 10d6!! 5d10! 4d6k 5d10>8f1 d% 4dF'),
    user: createTestUser(),
  });

  assert.equal(
    finalEmbeds.length,
    7
  );

  assert.throws(() => rollDiceExpression('1d20ro1'));
}

run();
console.log('formatters.test.ts: ok');
process.exit(0);
