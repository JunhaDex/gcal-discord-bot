import { google } from 'googleapis';
import path from 'path';

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

  async getImage(fileId: string) {
    const res = await this.gDrive.files
      .get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' })
      .catch(e => {
        console.error(e);
        console.log(JSON.stringify(e.config));
        throw e;
      });
    const imageType = res.headers['content-type'];
    const base64 = Buffer.from(res.data as string, 'utf8').toString('base64');
    return `data:${imageType};base64,${base64}`;
  }
}
