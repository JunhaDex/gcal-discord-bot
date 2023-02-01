import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import Commands from './commands';
import Interactions from './interactions';
import commands from './commands';

dotenv.config();

const main = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, async () => {
    const commandMeta = Commands.map(command => {
      return command.data.toJSON();
    });
    const rest = new REST({ version: '10' }).setToken(
      process.env.ACCESS_TOKEN!
    );
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commandMeta,
    });
    console.log('logged in!');
  });

  client.on(Events.MessageCreate, message => {
    console.log('reading', message.content);
  });
  client.on(Events.InteractionCreate, async (interaction: any) => {
    console.log(interaction);
    const admin = await client.users.fetch(process.env.CHANNEL_ADMIN_ID!);
    if (interaction.isChatInputCommand()) {
      const exec = Commands.find(
        command => command.data.name === interaction.commandName
      );
      if (exec) {
        try {
          await exec.execute(interaction);
        } catch (e) {
          console.error(e);
          interaction.reply('something went wrong :(');
        }
        return;
      }
    } else if (
      Interactions.find(
        command => command.name === interaction.customId.split('::')[0]
      )
    ) {
      const [key, value, exp] = interaction.customId.split('::');
      const exec = Interactions.find(command => command.name === key);
      try {
        await exec!.execute(interaction, {
          email: value,
          exp,
          admin,
        });
      } catch (e) {
        console.error(e);
        interaction.reply('something went wrong :(');
      }
      return;
    }
    interaction.reply('command not found :(');
  });

  await client.login(process.env.ACCESS_TOKEN);
};
main();
