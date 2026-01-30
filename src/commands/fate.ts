import { rollFate } from '@nihilapp/diceroll-v3';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { CommandConfig, CommandResult } from 'robo.js';

export const config: CommandConfig = {
  description: 'Rolls fate dice.',
  nameLocalizations: {
    ko: '페이트',
  },
  descriptionLocalizations: {
    ko: '페이트 주사위를 굴립니다.',
  },
  options: [
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
  const count = interaction.options.getInteger('count') || 1;

  try {
    const result = rollFate(count);

    return {
      embeds: [
        {
          title: '페이트 주사위 굴림 결과',
          fields: [
            {
              name: '총합 (Total)',
              value: `**${result.total}**`,
              inline: true,
            },
            {
              name: '상세 결과',
              value: result.dice.map((roll) => roll).join(', '),
              inline: false,
            },
          ],
          color: 0xff0000,
          footer: {
            text: `굴린 사람: ${interaction.user.username} | 개수: ${count}`,
            icon_url: interaction.user.displayAvatarURL(),
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
  catch (error) {
    console.error(
      'Error calling rollFate:',
      error
    );
    return {
      embeds: [
        {
          title: '오류',
          description: '페이트 주사위 굴림 중 오류가 발생했습니다.',
          color: 0xff0000,
        },
      ],
    };
  }
};
