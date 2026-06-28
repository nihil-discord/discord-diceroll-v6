import {
  rollDiceExpression
} from '@nihilapp/diceroll-v3';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { CommandConfig, CommandResult } from 'robo.js';

import { createDiceExpressionEmbeds } from '../lib/diceroll/formatters.js';
import { DICE_MANUAL_FIELDS } from '../lib/diceroll/manual.js';

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
      name: 'action',
      nameLocalizations: {
        ko: '동작',
      },
      description: 'Roll dice or show manual',
      descriptionLocalizations: {
        ko: '주사위 굴리기 또는 설명서 보기',
      },
      type: 'string',
      required: false,
      choices: [
        {
          name: '주사위 굴리기',
          value: 'roll',
          nameLocalizations: { ko: '주사위 굴리기', },
        },
        {
          name: '설명서',
          value: 'manual',
          nameLocalizations: { ko: '설명서', },
        },
      ],
    },
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
      required: false,
    },
  ],
};

export default (interaction: ChatInputCommandInteraction): CommandResult => {
  const action = interaction.options.getString('action') ?? 'roll';
  const formula = interaction.options.getString('formula');

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

  const formulaStr = formula?.trim() ?? '';
  if (!formulaStr) {
    return {
      embeds: [
        {
          title: '오류',
          description: '주사위식을 입력해주세요. 설명서를 보려면 동작에서 **설명서**를 선택하세요.',
          color: 0xff0000,
        },
      ],
      ephemeral: true,
    };
  }

  try {
    return {
      embeds: createDiceExpressionEmbeds({
        results: rollDiceExpression(formulaStr),
        user: interaction.user,
      }),
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
