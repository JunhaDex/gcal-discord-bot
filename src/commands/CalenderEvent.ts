import { SlashCommand } from '../structure';
import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import * as dayjs from 'dayjs';
import GCalendarProvider from '../providers/gcalendar.provider';

export const Ping: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setNameLocalizations({ ko: '서버핑' })
    .setDescription('server ping')
    .setDescriptionLocalizations({ ko: '서버 연결을 확인합니다' }),
  execute: async (interaction: CommandInteraction) => {
    console.log('executed!');
    const exampleEmbed = new EmbedBuilder()
      .setTitle('Some title')
      .setURL('https://discord.js.org/')
      .setAuthor({
        name: 'Some name',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
        url: 'https://discord.js.org',
      })
      .setDescription('Some description here')
      .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true }
      )
      .addFields({
        name: 'Inline field title',
        value: 'Some value here',
        inline: true,
      })
      .setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter({
        text: 'Some footer text here',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
      });
    await interaction.reply({ embeds: [exampleEmbed], ephemeral: true });
  },
};

export const getUpcomingEvents: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('cal-upcoming')
    .setDescription('show upcoming events')
    .setDescriptionLocalizations({ ko: '다가오는 이벤트를 확인합니다' }),
  execute: async (interaction: CommandInteraction) => {
    const calendar = new GCalendarProvider();
    const events = await calendar.listEvents();
    const reply = new EmbedBuilder()
      .setTitle('예정된 일정 목록')
      .setURL(process.env.CALENDAR_PUB_URL!)
      .setAuthor({
        name: 'Some name',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
        url: 'https://discord.js.org',
      })
      .setDescription('30일 내 예정된 일정 목록입니다.');
    events.forEach(event => {
      reply.addFields({
        name: `[${event.date}] ${event.title}`,
        value: `${event.description}`,
      });
    });
    await interaction.reply({ embeds: [reply], ephemeral: true });
  },
};
export const broadcastEvents: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('cal-alert')
    .setDescription('alert channel upcoming events'),
  execute: async (interaction: CommandInteraction) => {
    const calendar = new GCalendarProvider();
    const events = await calendar.listEvents();
    const reply = new EmbedBuilder()
      .setTitle('체널에 일정을 공지드립니다!')
      .setURL(process.env.CALENDAR_PUB_URL!)
      .setAuthor({
        name: 'Some name',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
        url: 'https://discord.js.org',
      })
      .setDescription('30일 내 예정된 일정 목록입니다.');
    events.forEach(event => {
      reply.addFields({
        name: `[${event.date}] ${event.title}`,
        value: `${event.description}`,
      });
    });
    await interaction.reply({ embeds: [reply], ephemeral: false });
  },
};
export const openWebView: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('cal-open')
    .setDescription('open calender web view'),
  execute: async (interaction: CommandInteraction) => {
    const reply = new EmbedBuilder()
      .setTitle('캘린더 바로가기')
      .setURL(process.env.CALENDAR_PUB_URL!)
      .setAuthor({
        name: 'Some name',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
        url: 'https://discord.js.org',
      })
      .setDescription('아래 버튼을 누르면 캘린더 웹페이지로 이동합니다.');
    const button = new ButtonBuilder()
      .setLabel('Open Calender')
      .setStyle(5)
      .setURL(process.env.CALENDAR_PUB_URL!);
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(button);
    await interaction.reply({
      embeds: [reply],
      components: [row],
      ephemeral: true,
    });
  },
};
export const subscribe: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('cal-subscribe')
    .setDescription('open subscription link'),
  execute: async (interaction: CommandInteraction) => {
    const reply = new EmbedBuilder()
      .setTitle('캘린더 구독하기')
      .setURL(process.env.CALENDAR_SUBSCRIBE_URL!)
      .setAuthor({
        name: 'Some name',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
        url: 'https://discord.js.org',
      })
      .setDescription(
        '아래 버튼을 누르면 사용하는 구글 계정에 캘린더를 연동할 수 있습니다 (PC)'
      );
    const button = new ButtonBuilder()
      .setLabel('Open Calender')
      .setStyle(5)
      .setURL(process.env.CALENDAR_SUBSCRIBE_URL!);
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(button);
    await interaction.reply({
      embeds: [reply],
      components: [row],
      ephemeral: true,
    });
  },
};
export const invite: SlashCommand = {
  data: new SlashCommandBuilder()
    .addStringOption(option =>
      option.setName('e-mail').setDescription('Your Email').setRequired(true)
    )
    .setName('cal-invite')
    .setDescription('send invitation email'),

  execute: async (interaction: CommandInteraction) => {
    const email = (interaction.options as any).getString('e-mail');
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      await interaction.reply({
        content: '⚠️ 올바르지 않은 이메일 형식입니다.',
        ephemeral: true,
      });
      return;
    }
    const reply = new EmbedBuilder()
      .setTitle('모임 참석 리마인더 설정')
      .setURL(process.env.CALENDAR_SUBSCRIBE_URL!)
      .setAuthor({
        name: 'Some name',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
        url: 'https://discord.js.org',
      })
      .setDescription(
        '캘린더에 참여 여부를 알리고, 예약한 내역을 이메일로 보내드립니다.'
      );
    const customId = `cal-reg::${email}::${dayjs().format()}`;
    const button = new ButtonBuilder()
      .setCustomId(customId)
      .setLabel('모임 참여 예약')
      .setStyle(1);
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(button);
    await interaction.reply({
      embeds: [reply],
      components: [row],
      ephemeral: true,
    });
  },
};
export const showHelp: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('cal-help')
    .setDescription('show calender commands help'),
  execute: async (interaction: CommandInteraction) => {},
};
