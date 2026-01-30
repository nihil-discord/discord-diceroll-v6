import type { ChatInputCommandInteraction } from 'discord.js';
import type { CommandConfig, CommandResult } from 'robo.js';

export const config: CommandConfig = {
  description: 'Check the bot\'s latency.',
  nameLocalizations: {
    ko: '핑',
  },
  descriptionLocalizations: {
    ko: '응답 시간을 반환합니다.',
  },
};

export default (interaction: ChatInputCommandInteraction): CommandResult => {
  return {
    embeds: [
      {
        title: '퐁!',
        description: `현재 핑: **${interaction.client.ws.ping}ms**`,
        color: 0xff0000,
        timestamp: new Date().toISOString(),
      },
    ],
  };
};
