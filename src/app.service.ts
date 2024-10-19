import { Injectable } from '@nestjs/common';
import { ConversionUtil } from 'src/common/utils/conversion.utils';

@Injectable()
export class AppService {
  getHello(): { message: string } {
    const { toKST } = ConversionUtil;
    const now = new Date();
    const nowInSeoul = toKST(now);

    // console.log("now", now, "type of now", typeof now);
    // console.log("nowInSeoul", nowInSeoul, "type of nowInSeoul", typeof nowInSeoul);

    const message = `😝 Welcome To Caugannies Server!, Date and time now in Seoul: ${nowInSeoul}, UTC: ${now.toISOString()}`;

    return { message };
  }
}
