import type { Client } from 'discord.js';

export default (client: Client) => {
  if (!client.user) return;

  console.log(`Logged in as ${client.user.tag}!`);
};
