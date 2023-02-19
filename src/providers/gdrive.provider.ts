import { google } from 'googleapis';
import path from 'path';
import { BufferResolvable } from 'discord.js';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const PATH = path.join(process.cwd(), 'secret/auth-key.json');
export default class GDriveProvider {
  private gDrive;

  constructor() {
    const accessToken = new google.auth.GoogleAuth({
      keyFile: PATH,
      scopes: SCOPES,
    });
    this.gDrive = google.drive({ version: 'v3', auth: accessToken });
  }

  async getImage(
    fileId: string
  ): Promise<{ ext: string; buffer: BufferResolvable }> {
    const res = await this.gDrive.files
      .get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' })
      .catch(e => {
        console.error(e);
        throw e;
      });
    const imageType = res.headers['content-type'];
    const buffer = Buffer.from(res.data as string, 'utf8');
    return { ext: imageType.split('/').pop(), buffer };
  }
}
