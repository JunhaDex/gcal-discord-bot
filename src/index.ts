import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import express from 'express';
import Commands from './commands';
import Interactions from './interactions';
import * as process from 'process';
import * as path from 'path';

dotenv.config();
const app = express();
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
      process.env.DSC_ACCESS_TOKEN!
    );
    await rest.put(Routes.applicationCommands(process.env.GOC_CLIENT_ID!), {
      body: commandMeta,
    });
    console.log('logged in!');
  });
  client.on(Events.InteractionCreate, async (interaction: any) => {
    const admin = await client.users.fetch(process.env.DSC_CHANNEL_ADMIN_ID!);
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

  await client.login(process.env.DSC_ACCESS_TOKEN);
};
//TODO manage keyfile
main();

app.use(
  '/static/images',
  express.static(path.join(process.cwd(), 'public/assets'))
);
app.listen(process.env.PORT ?? '3000', () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
