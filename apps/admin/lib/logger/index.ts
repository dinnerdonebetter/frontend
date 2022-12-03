import { Logger } from 'tslog';

export const buildServerSideLogger = (name: string): Logger => {
  const runningInGCP = process.env.RUNNING_IN_GOOGLE_CLOUD_RUN?.trim().toLowerCase() === 'true';

  const pfLogger = new Logger({
    type: runningInGCP ? 'json' : 'pretty',
    name,
    minLevel: 'debug',
    colorizePrettyLogs: true,
    dateTimePattern: 'year-month-day hour:minute:second.millisecond',
    dateTimeTimezone: 'America/Chicago',
    prefix: [''],
    displayDateTime: true,
    displayLogLevel: true,
    displayLoggerName: true,
    displayFilePath: 'hidden',
    displayFunctionName: false,
  });

  return pfLogger;
};
