import type {
  DiceExpressionResult,
  RollBasicResult,
  RollFateResult,
  RollResult
} from '@nihilapp/diceroll-v3';
import type {
  APIEmbed,
  APIEmbedField,
  APIUser
} from 'discord.js';

type EmbedUser = Pick<APIUser, 'username'> & {
  displayAvatarURL(): string;
};

type BasicRollEmbedInput = {
  diceType: number;
  count: number;
  result: RollBasicResult;
  user: EmbedUser;
};

type FateRollEmbedInput = {
  count: number;
  result: RollFateResult;
  user: EmbedUser;
};

type DiceExpressionEmbedsInput = {
  results: DiceExpressionResult[];
  user: EmbedUser;
};

function formatRollValue(result: {
  result: number;
  isCritical: boolean;
  isFumble: boolean;
}): string {
  let text = `${result.result}`;
  if (result.isCritical) text = `**${text}** 🌟`;
  if (result.isFumble) text = `**${text}** 💀`;
  return text;
}

function formatRollList(rolls: Array<{
  result: number;
  isCritical: boolean;
  isFumble: boolean;
}>): string {
  return `[ ${rolls.map(formatRollValue).join(', ')} ]`;
}

function createFooter(user: EmbedUser, suffix?: string): APIEmbed['footer'] {
  return {
    text: suffix
      ? `굴린 사람: ${user.username} | ${suffix}`
      : `굴린 사람: ${user.username}`,
    icon_url: user.displayAvatarURL(),
  };
}

function createDetailField(result: RollResult, block: string, contribution: number): APIEmbedField {
  switch (result.kind) {
    case 'keepHighest':
    case 'keepLowest':
    case 'dropHighest':
    case 'dropLowest':
      return {
        name: block,
        value: [
          `유효 주사위: ${formatRollList(result.kept)}`,
          `제외 주사위: ${formatRollList(result.dropped)}`,
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
          formatRollList(result.rolls),
          `개수: **${result.successCount}**`,
        ].join('\n'),
        inline: false,
      };
    case 'netSuccess':
    case 'deductFailures':
      return {
        name: block,
        value: [
          formatRollList(result.rolls),
          `성공: ${result.successCount}, 실패: ${result.failureCount}`,
          `결과: **${result.total}**`,
        ].join('\n'),
        inline: false,
      };
    case 'subtractFailureFaces':
      return {
        name: block,
        value: [
          formatRollList(result.rolls),
          `실패 눈 합계: ${result.failureSum}`,
          `결과: **${contribution}**`,
        ].join('\n'),
        inline: false,
      };
    case 'marginSuccess':
      return {
        name: block,
        value: [
          formatRollList(result.rolls),
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
    case 'basic':
    case 'compound':
    case 'explode':
    case 'explodeOnce':
    case 'reroll':
    case 'rerollOnce':
      return {
        name: block,
        value: [
          formatRollList(result.rolls),
          `결과: **${contribution}**`,
        ].join('\n'),
        inline: false,
      };
    default: {
      const exhaustiveCheck: never = result;
      return exhaustiveCheck;
    }
  }
}

export function createBasicRollEmbed(input: BasicRollEmbedInput): APIEmbed {
  return {
    title: `D${input.diceType} 굴림 결과`,
    fields: [
      {
        name: '총합 (Total)',
        value: `**${input.result.total}**`,
        inline: true,
      },
      {
        name: '상세 결과',
        value: formatRollList(input.result.rolls),
        inline: false,
      },
    ],
    color: 0x00b0f4,
    footer: createFooter(
      input.user,
      `개수: ${input.count}`
    ),
    timestamp: new Date().toISOString(),
  };
}

export function createFateRollEmbed(input: FateRollEmbedInput): APIEmbed {
  return {
    title: '페이트 주사위 굴림 결과',
    fields: [
      {
        name: '총합 (Total)',
        value: `**${input.result.total}**`,
        inline: true,
      },
      {
        name: '상세 결과',
        value: `[ ${input.result.dice.join(', ')} ]`,
        inline: false,
      },
    ],
    color: 0xff0000,
    footer: createFooter(
      input.user,
      `개수: ${input.count}`
    ),
    timestamp: new Date().toISOString(),
  };
}

export function createDiceExpressionEmbeds(input: DiceExpressionEmbedsInput): APIEmbed[] {
  return input.results.map((result) => {
    const modifierText = result.modifiers.map((modifier) => `${modifier.sign}${modifier.value}`).join(', ');
    const fields: APIEmbedField[] = [
      {
        name: '총합 (Total)',
        value: `**${result.total}**`,
        inline: false,
      },
      ...result.rollDetails.map((detail) => createDetailField(
        detail.rollResult,
        detail.block,
        detail.contribution
      )),
    ];

    if (result.modifiers.length > 0) {
      fields.push({
        name: '보정치 (Modifiers)',
        value: `[ ${modifierText} ]`,
        inline: false,
      });
    }

    return {
      title: `주사위 식: ${result.expression}`,
      fields,
      color: 0x00b0f4,
      footer: createFooter(input.user),
      timestamp: new Date().toISOString(),
    };
  });
}
