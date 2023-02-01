import { Interaction } from '../structure';
import { CommandInteraction, Client } from 'discord.js';
import GCalendarProvider from '../providers/gcalendar.provider';
import interactions from './index';

export const openInvitationConfirmation: Interaction = {
  name: 'cal-reg',
  execute: async (
    interaction: CommandInteraction,
    extra: {
      email: string;
      exp: string;
      admin: any;
    }
  ) => {
    const calendar = new GCalendarProvider();
    const latestEvent = [...(await calendar.listEvents())][0];
    if (latestEvent) {
      const reservation = {
        신청자: `${interaction.user.username}(${interaction.user.id})`,
        이메일: extra.email,
        이벤트명: latestEvent.title,
        날짜: latestEvent.date,
      };
      const text = JSON.stringify(reservation)
        .replace(/[{}]|"/g, '')
        .replace(/,/g, '\n');
      const liner = '======================\n';
      extra.admin.send(text);
      interaction.user.send(
        '신청하신 모임 참석정보 입니다.' + liner + text + liner
      );
    }

    await interaction.reply({
      content: `참여 예약이 전송되었습니다!`,
      ephemeral: true,
    });
  },
};
