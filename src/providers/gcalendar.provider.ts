import { google } from 'googleapis';
import * as path from 'path';
import dayjs from 'dayjs';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const PATH = path.join(
  process.cwd(),
  'secret/gcloud-svc-dev-secret-fb52124767a5.json'
);

export default class GCalendarProvider {
  private readonly accessToken;
  private gCal;

  constructor() {
    this.accessToken = new google.auth.GoogleAuth({
      projectId: '',
      credentials: {
        client_email: '',
        private_key: '',
      },
      scopes: SCOPES,
    });
    this.gCal = google.calendar({ version: 'v3', auth: this.accessToken });
  }

  async listCalender() {
    const res = await this.gCal.calendarList.list();
  }

  async listEvents() {
    await import('dayjs/locale/ko.js');
    const [timeMin, timeMax] = [
      dayjs().format(),
      dayjs().add(30, 'day').format(),
    ];
    const res = await this.gCal.events.list({
      calendarId: process.env.GOS_CALENDAR_ID!,
      timeMin,
      timeMax,
    });
    if (res.data) {
      return [...res.data.items!].map(item => {
        return {
          id: item.id,
          title: item.summary,
          description: item.description,
          date: dayjs(item.start!.date ?? item.start!.dateTime)
            .locale('ko')
            .format('YYYY. MM. DD (ddd)'),
        };
      });
    }
    throw new Error('Calender List Error');
  }

  async addAttendeesToRecent(email: string) {
    const latest = [...(await this.listEvents())][0];
    if (latest) {
      const res = await this.gCal.events.patch({
        calendarId: process.env.GOS_CALENDAR_ID!,
        eventId: latest.id!,
        requestBody: {
          attendees: [{ email }],
        },
      });
    }
  }

  async acceptCalender() {
    const res = await this.gCal.calendarList.insert({
      requestBody: {
        id: process.env.GOS_CALENDAR_ID,
      },
    });
  }
}
