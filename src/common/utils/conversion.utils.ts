import * as moment from 'moment-timezone';

export class ConversionUtil {
  static stringToNumber(value: string): number {
    return isNaN(Number(value)) ? NaN : Number(value);
  }

  static stringToBoolean(value: string): boolean {
    return value.toLowerCase() === 'true' || value === '1';
  }

  static dateToISOString(date: Date | null): string | null {
    return date ? date.toISOString() : null;
  }

  static toKST(date: Date) {
    return moment(date).tz('Asia/Seoul').toDate();
  }
}
