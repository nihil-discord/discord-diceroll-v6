import { rollBasic } from '@nihilapp/diceroll-v3';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { CommandConfig, CommandResult } from 'robo.js';

import { createBasicRollEmbed } from '../lib/diceroll/formatters.js';

export const config: CommandConfig = {
  description: 'Roll a preset dice.',
  nameLocalizations: {
    ko: '프리셋',
  },
  descriptionLocalizations: {
    ko: '정해진 주사위를 굴립니다.',
  },
  options: [
    {
      name: 'dice',
      nameLocalizations: {
        ko: '주사위',
      },
      description: 'The type of dice to roll (e.g., d20, d6)',
      descriptionLocalizations: {
        ko: '굴릴 주사위 종류 (예: d20, d6)',
      },
      type: 'number',
      required: true,
      choices: [
        {
          name: 'd2',
          value: 2,
        },
        {
          name: 'd4',
          value: 4,
        },
        {
          name: 'd6',
          value: 6,
        },
        {
          name: 'd8',
          value: 8,
        },
        {
          name: 'd10',
          value: 10,
        },
        {
          name: 'd12',
          value: 12,
        },
        {
          name: 'd20',
          value: 20,
        },
        {
          name: 'd100',
          value: 100,
        },
      ],
    },
    {
      name: 'count',
      nameLocalizations: {
        ko: '개수',
      },
      description: 'Number of dice to roll (default: 1)',
      descriptionLocalizations: {
        ko: '굴릴 주사위 개수 (기본값: 1)',
      },
      type: 'integer',
      required: false,
    },
  ],
};

export default (interaction: ChatInputCommandInteraction): CommandResult => {
  const diceType = interaction.options.getNumber(
    'dice',
    true
  );
  const count = interaction.options.getInteger('count') || 1;

  try {
    const result = rollBasic(
      count,
      diceType
    );

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
  }
  catch (error) {
    console.error(
      'Error calling rollBasic:',
      error
    );
    return {
      embeds: [
        {
          title: '오류',
          description: '주사위를 굴리는 중 오류가 발생했습니다.',
          color: 0xff0000,
        },
      ],
      ephemeral: true,
    };
  }
};
