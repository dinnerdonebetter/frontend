import { QueryFilteredResult } from './pagination';

export class APIClient {
  lastUpdatedAt?: string;
  archivedAt?: string;
  name: string;
  clientID: string;
  id: string;
  belongsToUser: string;
  createdAt: string;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      name?: string;
      clientID?: string;
      id?: string;
      belongsToUser?: string;
      createdAt?: string;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.name = input.name || '';
    this.clientID = input.clientID || '';
    this.id = input.id || '';
    this.belongsToUser = input.belongsToUser || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
  }
}

export class APIClientList extends QueryFilteredResult<APIClient> {
  constructor(
    input: {
      data?: APIClient[];
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

export class APIClientCreationRequestInput {
  username: string;
  password: string;
  totpToken: string;
  clientName: string;

  constructor(
    input: {
      username?: string;
      password?: string;
      totpToken?: string;
      clientName?: string;
    } = {},
  ) {
    this.username = input.username || '';
    this.password = input.password || '';
    this.totpToken = input.totpToken || '';
    this.clientName = input.clientName || '';
  }
}

export class APIClientCreationResponse {
  clientID: string;
  clientSecret: string;
  id: string;

  constructor(
    input: {
      id?: string;
      clientID?: string;
      clientSecret?: string;
    } = {},
  ) {
    this.clientID = input.clientID || '';
    this.clientSecret = input.clientSecret || '';
    this.id = input.id || '';
  }
}
