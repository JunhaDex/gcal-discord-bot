import { SlashCommand } from '../structure';
import {
  // broadcastEvents,
  // Ping,
  getUpcomingEvents,
  openWebView,
  invite,
  subscribe,
} from './CalenderEvent';

const Commands: SlashCommand[] = [
  getUpcomingEvents,
  openWebView,
  subscribe,
  invite,
];
export default Commands;
