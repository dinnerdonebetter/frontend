import { Logger } from 'tslog';

export const buildServerSideLogger = (name: string): Logger => {
  const pfLogger = new Logger({
    type: 'json',
    name: name,
    minLevel: 'debug',
    colorizePrettyLogs: true,
    dateTimePattern: 'year-month-day hour:minute:second.millisecond',
    dateTimeTimezone: 'America/Chicago',
    prefix: [``],
    displayDateTime: true,
    displayLogLevel: true,
    displayLoggerName: true,
    displayFilePath: 'hidden',
    displayFunctionName: false,
  });

  return pfLogger;
};
