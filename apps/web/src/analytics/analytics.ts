import { Analytics } from '@segment/analytics-node';
import { AnalyticsBrowser } from '@segment/analytics-next';

export const browserSideAnalytics = AnalyticsBrowser.load({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_API_TOKEN || 'never_mind',
});

export const serverSideAnalytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_API_TOKEN || 'never_mind',
});
