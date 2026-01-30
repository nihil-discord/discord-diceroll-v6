// @ts-check

/**
 * @type {import('robo.js').Config}
 **/
export default {
  type: 'robo',
  clientOptions: {
    intents: [
      'Guilds',
      'GuildMessages',
      'MessageContent',
    ],
  },
  // defer 끔: 답이 3초 안에 오므로 reply() 한 번만 사용 (중복 응답 방지)
  sage: {
    defer: false,
  },
};
