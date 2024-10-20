import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as WinstonDaily from 'winston-daily-rotate-file';
import { format, transports } from 'winston';

const isProduction = process.env.NODE_ENV === 'production';
const logDir = __dirname + '/../../logs';

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: logDir + `/${level}`,
    filename: `%DATE%.${level}.log`,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  };
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new transports.Console({
      level: isProduction ? 'info' : 'silly',
      format: isProduction
        ? format.simple()
        : format.combine(
            format.timestamp(),
            format.ms(),
            nestWinstonModuleUtilities.format.nestLike('Caugannies_BE', {
              colors: true,
              prettyPrint: true,
            }),
          ),
    }),
    new WinstonDaily(dailyOptions('info')),
    new WinstonDaily(dailyOptions('warn')),
    new WinstonDaily(dailyOptions('error')),
  ],
});
