import { Logger } from 'tslog';

export const buildServerSideLogger = (name: string): Logger => {
  const apiClientID = process.env.NEXT_PUBLIC_API_ENDPOINT;
  if (!apiClientID) {
    throw new Error('no API client ID set!');
  }

  const runningInGCP = process.env.RUNNING_IN_GOOGLE_CLOUD_RUN?.trim().toLowerCase() === 'true';

  const pfClient = new Logger({
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

  return pfClient;
};
