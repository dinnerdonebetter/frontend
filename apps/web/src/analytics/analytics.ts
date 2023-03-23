import { Analytics } from '@segment/analytics-node';

export const serverSideAnalytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_API_TOKEN || 'never_mind_server',
});
