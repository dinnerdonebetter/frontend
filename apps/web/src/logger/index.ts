import { Logger } from 'tslog';

export const buildServerSideLogger = (name: string): Logger => {
  const apiClientID = process.env.NEXT_PUBLIC_API_ENDPOINT;
  if (!apiClientID) {
    throw new Error('no API client ID set!');
  }

  const pfClient = new Logger({
    type: 'pretty',
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
