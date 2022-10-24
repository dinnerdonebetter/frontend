import { QueryFilteredResult } from './pagination';

type httpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
type httpContentType = 'application/json' | 'application/xml';

export class Webhook {
  lastUpdatedAt?: string;
  archivedAt?: string;
  name: string;
  url: string;
  method: httpMethod;
  contentType: httpContentType;
  id: string;
  belongsToHousehold: string;
  events: string[];
  dataTypes: string[];
  topics: string[];
  createdAt: string;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      name?: string;
      url?: string;
      method?: httpMethod;
      contentType?: httpContentType;
      id?: string;
      belongsToHousehold?: string;
      events?: string[];
      dataTypes?: string[];
      topics?: string[];
      createdAt?: string;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.name = input.name || '';
    this.url = input.url || '';
    this.method = input.method || 'OPTIONS';
    this.contentType = input.contentType || 'application/json';
    this.id = input.id || '';
    this.belongsToHousehold = input.belongsToHousehold || '';
    this.events = input.events || [];
    this.dataTypes = input.dataTypes || [];
    this.topics = input.topics || [];
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
  }
}

export class WebhookCreationRequestInput {
  name: string;
  contentType: string;
  url: string;
  method: string;
  events: string[];
  dataTypes: string[];
  topics: string[];

  constructor(
    input: {
      name?: string;
      contentType?: string;
      url?: string;
      method?: string;
      events?: string[];
      dataTypes?: string[];
      topics?: string[];
    } = {},
  ) {
    this.name = input.name || '';
    this.contentType = input.contentType || 'application/json';
    this.url = input.url || '';
    this.method = input.method || '';
    this.events = input.events || [];
    this.dataTypes = input.dataTypes || [];
    this.topics = input.topics || [];
  }

  static fromWebhook(input: Webhook): WebhookCreationRequestInput {
    const x = new WebhookCreationRequestInput();

    x.name = input.name;
    x.contentType = input.contentType;
    x.url = input.url;
    x.method = input.method;
    x.events = input.events;
    x.dataTypes = input.dataTypes;
    x.topics = input.topics;

    return x;
  }
}

export class WebhookList extends QueryFilteredResult<Webhook> {
  constructor(
    input: {
      data?: Webhook[];
      page?: number;
      limit?: number;
      filteredCount?: number;
      totalCount?: number;
    } = {},
  ) {
    super(input);

    this.data = input.data || [];
    this.page = input.page || 1;
    this.limit = input.limit || 20;
    this.filteredCount = input.filteredCount || 0;
    this.totalCount = input.totalCount || 0;
  }
}
