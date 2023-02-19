import { SlashCommand } from '../structure';
import {
  broadcastEvents,
  getUpcomingEvents,
  openWebView,
  Ping,
  invite,
  subscribe,
} from './CalenderEvent';

const Commands: SlashCommand[] = [
  Ping,
  getUpcomingEvents,
  broadcastEvents,
  openWebView,
  subscribe,
  invite,
];
export default Commands;
