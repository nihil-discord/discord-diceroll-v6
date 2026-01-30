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

/** 지원 주사위식 설명서 (인라인 필드용) — @nihilapp/diceroll-v3 기준 */
const MANUAL_FIELDS: Array<{ name: string;
  value: string;
  inline: true; }> = [
  {
    name: '기본 굴림',
    value: '`d20`, `3d6`, `d20+5` — 개수 생략 시 1개. `d`/`D`/`ㅇ` 동일.',
    inline: true,
  },
  {
    name: 'Compound (!!)',
    value: '`10d6!!` 최대값 시 추가 굴림 합산. `!!>N`으로 임계값 지정.',
    inline: true,
  },
  {
    name: 'Explode (!)',
    value: '`10d6!` 조건 만족 시 추가 주사위. `!>N`으로 임계값 지정.',
    inline: true,
  },
  {
    name: 'Keep (kh/kl)',
    value: '`4d6kh3` 상위 3개 합. `2d20kl1` 하위 1개 (불리함).',
    inline: true,
  },
  {
    name: 'Drop (dh/dl)',
    value: '`4d6dh1` 최고 1개 제외. `4d6dl1` 최저 1개 제외.',
    inline: true,
  },
  {
    name: 'Reroll (r)',
    value: '`1d20r1` 1 나올 때까지 재굴림. `r<=N`, `r>=N`, `r<N`, `r>N` 가능.',
    inline: true,
  },
  {
    name: 'Reroll Once (ro)',
    value: '`1d20ro1` 조건 시 한 번만 재굴림. `ro<N`, `ro>N` 등.',
    inline: true,
  },
  {
    name: 'Success (>N)',
    value: '`5d10>7` 7 초과 개수 (WoD). `>=N`, `=N`, `<N`, `<=N` 지원.',
    inline: true,
  },
  {
    name: 'Net Success (>NfM)',
    value: '`5d10>8f1` 성공 +1, 1은 -1. 순성공 = 성공−실패.',
    inline: true,
  },
  {
    name: 'Percentile (d%)',
    value: '`d%` — 1~100 난수 (CoC 등).',
    inline: true,
  },
  {
    name: 'Fate (dF)',
    value: '`dF` 또는 `4dF` — Fate 주사위. 개수 생략 시 4개.',
    inline: true,
  },
  {
    name: '보정·복합',
    value: '`+N`/`-N` 보정. 공백 구분 시 여러 식 동시: `d20+5 3d6`. 괄호: `d20+(2d6+3)`.',
    inline: true,
  },
];

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

  // 2. 상세 결과 (Detail) Fields — basic, compound, explode, reroll, rerollOnce, keep/drop, success, netSuccess, percentile, fate
  result.rollDetails.forEach((detail) => {
    const rr = detail.rollResult;
    let value = '';

    if ('rolls' in rr && Array.isArray(rr.rolls)) {
      // basic, compound, explode, reroll, rerollOnce
      const rollsStr = rr.rolls.map(formatRollInfo).join(', ');
      value = `[ ${rollsStr} ] → **${detail.contribution}**`;
    }
    else if ('kept' in rr && 'dropped' in rr) {
      // keepHighest, keepLowest, dropHighest, dropLowest
      const kept = rr.kept ?? [];
      const dropped = rr.dropped ?? [];
      const parts: string[] = [];
      if (kept.length > 0) {
        parts.push(`유효 주사위: [ ${kept.map(formatRollInfo).join(', ')} ]`);
      }
      if (dropped.length > 0) {
        parts.push(`제외 주사위: [ ${dropped.map((r) => r.result).join(', ')} ]`);
      }
      value = parts.join('\n');
      value += `\n결과: **${detail.contribution}**`;
    }
    else if ('successCount' in rr && !('failureCount' in rr)) {
      // success (WoD 성공 개수)
      const rolls = 'rolls' in rr
        ? rr.rolls
        : [];
      const rollsStr = rolls.map(formatRollInfo).join(', ');
      value = `[ ${rollsStr} ]\n성공 개수: **${(rr as { successCount: number }).successCount}**`;
    }
    else if ('successCount' in rr && 'failureCount' in rr) {
      // netSuccess
      const rolls = 'rolls' in rr
        ? rr.rolls
        : [];
      const rollsStr = rolls.map(formatRollInfo).join(', ');
      type NetSuccess = {
        successCount: number;
        failureCount: number;
        total: number;
      };
      const ns = rr as NetSuccess;
      value = `[ ${rollsStr} ]\n성공: ${ns.successCount}, 실패: ${ns.failureCount} → 순성공: **${ns.total}**`;
    }
    else if ('dice' in rr) {
      // fate
      type FateRoll = { dice: number[] };
      const fr = rr as FateRoll;
      if (Array.isArray(fr.dice)) {
        value = `[ ${fr.dice.join(', ')} ] → **${detail.contribution}**`;
      }
      else {
        value = `결과: **${detail.contribution}**`;
      }
    }
    else if ('result' in rr && typeof (rr as { result: number }).result === 'number' && !('rolls' in rr)) {
      // percentile (단일 DiceRollResult)
      const single = rr as RollInfo;
      value = `${formatRollInfo(single)} → **${detail.contribution}**`;
    }
    else {
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
  const action = interaction.options.getString('action') ?? 'roll';
  const formula = interaction.options.getString('formula');

  if (action === 'manual') {
    return {
      embeds: [
        {
          title: '주사위식 설명서',
          description: '`/주사위` 커스텀 주사위에서 사용할 수 있는 주사위식 문법입니다. (`@nihilapp/diceroll-v3` 기준)',
          fields: MANUAL_FIELDS,
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
    const results = rollDiceExpression(formulaStr) as unknown as RollResult[];
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
