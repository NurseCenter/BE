export class ConversionUtil {
  static stringToNumber(value: string): number {
    return isNaN(Number(value)) ? NaN : Number(value);
  }

  static stringToBoolean(value: string): boolean {
    return value.toLowerCase() === 'true' || value === '1';
  }
}
