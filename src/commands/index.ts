import { SlashCommand } from '../structure';
import {
  broadcastEvents,
  getUpcomingEvents,
  openWebView,
  Ping,
  invite,
  showHelp,
  subscribe,
} from './CalenderEvent';

const Commands: SlashCommand[] = [
  Ping,
  getUpcomingEvents,
  broadcastEvents,
  openWebView,
  subscribe,
  invite,
  showHelp,
];
export default Commands;
