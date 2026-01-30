import {
  rollDiceExpression,
  type DiceExpressionResult,
  type RollBasicResult
} from '@nihilapp/diceroll-v3';
import type { ChatInputCommandInteraction, APIEmbed, User } from 'discord.js';
import type { CommandConfig, CommandResult } from 'robo.js';

// Use exported type
type RollResult = DiceExpressionResult;

// Helper type for the roll object
type RollInfo = RollBasicResult['rolls'][number];

export const config: CommandConfig = {
  description: 'Roll a dice with custom formula.',
  nameLocalizations: {
    ko: '주사위',
  },
  descriptionLocalizations: {
    ko: '주사위식을 입력하여 주사위를 굴립니다.',
  },
  options: [
    {
      name: 'formula',
      nameLocalizations: {
        ko: '주사위식',
      },
      description: 'input dice formula (e.g., 2d6+3)',
      descriptionLocalizations: {
        ko: '주사위식을 입력해주세요 (예: 2d6+3)',
      },
      type: 'string',
      required: true,
    },
  ],
};

function formatRollInfo(roll: RollInfo): string {
  let text = `${roll.result}`;
  if (roll.isCritical) text = `**${text}** 🌟`;
  if (roll.isFumble) text = `**${text}** 💀`;
  return text;
}

function createEmbed(result: RollResult, user: User): APIEmbed {
  const fields = [];

  // 1. 총합 (Total) Field
  fields.push({
    name: '총합 (Total)',
    value: `**${result.total}**`,
    inline: false,
  });

  // 2. 상세 결과 (Detail) Fields
  result.rollDetails.forEach((detail) => {
    let value = '';

    if (detail.kind === 'basic' && 'rolls' in detail.rollResult) {
      const rollsStr = detail.rollResult.rolls.map(formatRollInfo).join(', ');
      value = `[ ${rollsStr} ] → **${detail.contribution}**`;
    }
    else if ((detail.kind === 'keepHighest' || detail.kind === 'keepLowest') && 'all' in detail.rollResult) {
      const kept = detail.rollResult.kept || [];
      const dropped = detail.rollResult.dropped || [];

      const parts = [];
      if (kept.length > 0) {
        parts.push(`유효 주사위: [ ${kept.map(formatRollInfo).join(', ')} ]`);
      }
      if (dropped.length > 0) {
        parts.push(`제외 주사위: [ ${dropped.map((r) => r.result).join(', ')} ]`);
      }

      value = parts.join('\n');
      value += `\n결과: **${detail.contribution}**`;
    }
    else {
      // Fallback
      value = `결과: **${detail.contribution}**`;
    }

    fields.push({
      name: `${detail.block}`,
      value: value,
      inline: false,
    });
  });

  // 3. Modifiers Field (if any)
  if (result.modifiers && result.modifiers.length > 0) {
    // Attempt to stringify modifiers
    const modStr = result.modifiers.map((m) => `${m.sign}${m.value}`).join(', ');
    fields.push({
      name: '보정치 (Modifiers)',
      value: `[ ${modStr} ]`,
      inline: false,
    });
  }

  return {
    title: `주사위 식: ${result.expression}`,
    fields: fields,
    color: 0x00b0f4, // Robo.js Blue-ish
    footer: {
      text: `굴린 사람: ${user.username}`,
      icon_url: user.displayAvatarURL(),
    },
    timestamp: new Date().toISOString(),
  };
}

export default (interaction: ChatInputCommandInteraction): CommandResult => {
  const formula = interaction.options.getString(
    'formula',
    true
  );

  try {
    const results = rollDiceExpression(formula) as unknown as RollResult[];
    // Ensure array
    const resultsArray = Array.isArray(results)
      ? results
      : [ results, ];

    const embeds = resultsArray.map((r) => createEmbed(
      r,
      interaction.user
    ));

    return {
      embeds,
    };
  }
  catch (error) {
    console.error(
      'Error calling rollDiceExpression:',
      error
    );
    return {
      embeds: [
        {
          title: '오류',
          description: '주사위를 굴리는 중 오류가 발생했습니다. 주사위 식을 확인해주세요.',
          color: 0xff0000,
        },
      ],
      ephemeral: true,
    };
  }
};
