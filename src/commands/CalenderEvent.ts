import {SlashCommand} from '../structure';
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import dayjs from 'dayjs';
import GCalendarProvider from '../providers/gcalendar.provider';
import GDriveProvider from '../providers/gdrive.provider';
import * as repl from 'repl';

function commonEmbedBuilder(title: string): EmbedBuilder {
  const calUrl = process.env.GOC_CALENDAR_PUB_URL!;
  const cdn = process.env.CDN_URL;
  return new EmbedBuilder()
    .setTitle(title)
    .setURL(calUrl)
    .setAuthor({
      name: '코모라 캘린더 봇',
      iconURL: `${cdn}/cal-bot.webp`,
      url: calUrl,
    })
    .setThumbnail(`${cdn}/logo.webp`);
}

export const getUpcomingEvents: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('cal-list')
    .setNameLocalizations({ko: '일정목록'})
    .setDescription('show upcoming events')
    .setDescriptionLocalizations({ko: '다가오는 이벤트를 확인합니다'}),
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply({ephemeral: true});
    const calendar = new GCalendarProvider();
    const events = await calendar.listEvents();
    let file: AttachmentBuilder | undefined;
    const reply = commonEmbedBuilder('일정 목록').setDescription(
      '30일 내 예정된 일정 목록입니다.'
    );
    if (events.length && events[0].file) {
      const drive = new GDriveProvider();
      const dataStr = await drive.getImage(events[0].file);
      const name = `${events[0].file!}.${dataStr.ext}`;
      file = new AttachmentBuilder(dataStr.buffer, {
        name,
      });
      reply.setImage(`attachment://${name}`);
    }
    events.forEach(event => {
      reply.addFields({
        name: `[${event.date}] ${event.title}`,
        value: `${event.description}`,
      });
    });
    await interaction.editReply({
      embeds: [reply],
      files: file ? [file] : [],
    });
  },
};
export const openWebView: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('cal-open')
    .setNameLocalizations({ko: '일정열기'})
    .setDescription('open calender web view')
    .setDescriptionLocalizations({ko: '캘린더 뷰어를 웹으로 보여줍니다'}),
  execute: async (interaction: CommandInteraction) => {
    const reply = commonEmbedBuilder('캘린더 바로가기').setDescription(
      '아래 버튼을 누르면 캘린더 웹페이지로 이동합니다.'
    );
    const button = new ButtonBuilder()
      .setLabel('Open Calender')
      .setStyle(5)
      .setURL(process.env.GOC_CALENDAR_PUB_URL!);
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
    .setNameLocalizations({ko: '일정구독'})
    .setDescription('open subscription link').setDescriptionLocalizations({ko: '내 구글 캘린더에 코모라 캘린더를 추가하여 구독합니다.'}),
  execute: async (interaction: CommandInteraction) => {
    const reply = commonEmbedBuilder('캘린더 구독하기').setDescription(
      '아래 버튼을 누르면 사용하는 구글 계정에 캘린더를 연동할 수 있습니다 (PC)'
    );
    const button = new ButtonBuilder()
      .setLabel('Open Calender')
      .setStyle(5)
      .setURL(process.env.GOC_CALENDAR_SUBSCRIBE_URL!);
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
    .setNameLocalizations({ko: '일정참여예약'})
    .setDescription('send invitation email')
    .setDescriptionLocalizations({ko: '이메일을 등록하여 다가올 이벤트에 참여를 예약합니다.'}),

  execute: async (interaction: CommandInteraction) => {
    const email = (interaction.options as any).getString('e-mail');
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      await interaction.reply({
        content: '⚠️ 올바르지 않은 이메일 형식입니다.',
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply({ephemeral: true});
    const calendar = new GCalendarProvider();
    const events = await calendar.listEvents();
    let file: AttachmentBuilder | undefined;
    const reply = commonEmbedBuilder('참여 예약하기').setDescription(
      '모임 참석여부를 등록합니다.\n 참석여부를 등록함으로써, 이메일을 수집하며 추후 이벤트 추첨에 활용될 수 있습니다. 아래 이벤트에 참석하려면 "참석여부 등록" 버튼을 눌러주세요.'
    );
    if (events.length) {
      const latestEvent = events[0];
      reply.addFields({
        name: `[${latestEvent.date}] ${latestEvent.title}`,
        value: `${latestEvent.description}`,
      });
      if (latestEvent.file) {
        const drive = new GDriveProvider();
        const dataStr = await drive.getImage(latestEvent.file);
        const name = `${events[0].file!}.${dataStr.ext}`;
        file = new AttachmentBuilder(dataStr.buffer, {
          name,
        });
        reply.setImage(`attachment://${name}`);
      }
    } else {
      reply.addFields({
        name: '이벤트 없음',
        value: '참석 가능한 일정이 없습니다.',
      });
    }
    const customId = `cal-reg::${email}::${dayjs().format()}`;
    const button = new ButtonBuilder()
      .setCustomId(customId)
      .setLabel('참석여부 등록')
      .setStyle(1);
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(button);
    await interaction.editReply({
      embeds: [reply],
      components: [row],
      files: file ? [file] : [],
    });
  },
};

// TBD
// export const Ping: SlashCommand = {
//   data: new SlashCommandBuilder()
//     .setName('ping')
//     .setNameLocalizations({ko: '서버핑'})
//     .setDescription('server ping')
//     .setDescriptionLocalizations({ko: '서버 연결을 확인합니다'}),
//   execute: async (interaction: CommandInteraction) => {
//     const exampleEmbed = new EmbedBuilder()
//       .setTitle('Some title')
//       .setURL('https://discord.js.org/')
//       .setAuthor({
//         name: 'Some name',
//         iconURL: 'https://i.imgur.com/AfFp7pu.png',
//         url: 'https://discord.js.org',
//       })
//       .setDescription('Some description here')
//       .setThumbnail('https://i.imgur.com/AfFp7pu.png')
//       .addFields(
//         {name: 'Regular field title', value: 'Some value here'},
//         {name: '\u200B', value: '\u200B'},
//         {name: 'Inline field title', value: 'Some value here', inline: true},
//         {name: 'Inline field title', value: 'Some value here', inline: true}
//       )
//       .addFields({
//         name: 'Inline field title',
//         value: 'Some value here',
//         inline: true,
//       })
//       .setImage('https://i.imgur.com/AfFp7pu.png')
//       .setTimestamp()
//       .setFooter({
//         text: 'Some footer text here',
//         iconURL: 'https://i.imgur.com/AfFp7pu.png',
//       });
//     await interaction.reply({embeds: [exampleEmbed], ephemeral: true});
//   },
// };
// export const broadcastEvents: SlashCommand = {
//   data: new SlashCommandBuilder()
//     .setName('cal-alert')
//     .setDescription('alert channel upcoming events')
//     .setDefaultMemberPermissions(0),
//   execute: async (interaction: CommandInteraction) => {
//     await interaction.deferReply({ ephemeral: false });
//     const calendar = new GCalendarProvider();
//     const events = await calendar.listEvents();
//     let file: AttachmentBuilder | undefined;
//     const reply = commonEmbedBuilder('일정 전체공지').setDescription(
//       '30일 내 예정된 일정 목록입니다.'
//     );
//     if (events.length && events[0].file) {
//       const drive = new GDriveProvider();
//       const dataStr = await drive.getImage(events[0].file);
//       const name = `${events[0].file!}.${dataStr.ext}`;
//       file = new AttachmentBuilder(dataStr.buffer, {
//         name,
//       });
//       reply.setImage(`attachment://${name}`);
//     }
//     events.forEach(event => {
//       reply.addFields({
//         name: `[${event.date}] ${event.title}`,
//         value: `${event.description}`,
//       });
//     });
//     await interaction.editReply({
//       embeds: [reply],
//       files: file ? [file] : [],
//     });
//   },
// };

