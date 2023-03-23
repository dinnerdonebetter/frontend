import { Analytics } from '@segment/analytics-node';
import { AnalyticsBrowser } from '@segment/analytics-next';

class serverAnalyticsWrapper {
  noopMode: boolean = false;
  analytics?: Analytics;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_SEGMENT_API_TOKEN || '';
    if (apiKey === '') {
      this.noopMode = true;
    } else {
      this.analytics = new Analytics({ writeKey: apiKey });
    }
  }

  track(userId: string, event: string, properties: Record<string, any>) {
    if (!this.noopMode) {
      this.analytics?.track({ event, properties, userId });
    } else {
      console.debug("server analytics wrapper had 'track' called while operating in noop mode");
    }
  }

  page(userId: string, name: string, properties: Record<string, any>) {
    if (!this.noopMode) {
      this.analytics?.page({ name, properties, userId });
    } else {
      console.debug("server analytics wrapper had 'page' called while operating in noop mode");
    }
  }

  identify(userId: string, traits: Record<string, any>) {
    if (!this.noopMode) {
      this.analytics?.identify({ userId, traits });
    } else {
      console.debug("server analytics wrapper had 'identify' called while operating in noop mode");
    }
  }

  group(userId: string, groupId: string, traits: Record<string, any> = {}) {
    if (!this.noopMode) {
      this.analytics?.group({ userId, groupId, traits });
    } else {
      console.debug("server analytics wrapper had 'group' called while operating in noop mode");
    }
  }
}

class browserAnalyticsWrapper {
  noopMode: boolean = false;
  analytics?: AnalyticsBrowser;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_SEGMENT_API_TOKEN || '';
    if (apiKey === '') {
      this.noopMode = true;
    } else {
      this.analytics = AnalyticsBrowser.load({ writeKey: apiKey });
    }
  }

  track(event: string, properties: Record<string, any>) {
    if (!this.noopMode) {
      this.analytics?.track(event, properties);
    } else {
      console.debug("browser analytics wrapper had 'track' called while operating in noop mode");
    }
  }

  page(name: string, properties: Record<string, any>) {
    if (!this.noopMode) {
      this.analytics?.page({ name, properties });
    } else {
      console.debug("browser analytics wrapper had 'page' called while operating in noop mode");
    }
  }

  identify(userId: string, traits: Record<string, any>) {
    if (!this.noopMode) {
      this.analytics?.identify(userId, { traits });
    } else {
      console.debug("browser analytics wrapper had 'identify' called while operating in noop mode");
    }
  }
}

export const browserSideAnalytics = new browserAnalyticsWrapper();
export const serverSideAnalytics = new serverAnalyticsWrapper();
