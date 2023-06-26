// Code generated by gen_typescript. DO NOT EDIT.

export interface IOAuth2Client {
  createdAt: NonNullable<string>;
  archivedAt?: string;
  name: NonNullable<string>;
  description: NonNullable<string>;
  clientID: NonNullable<string>;
  id: NonNullable<string>;
}

export class OAuth2Client implements IOAuth2Client {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  archivedAt?: string;
  name: NonNullable<string> = '';
  description: NonNullable<string> = '';
  clientID: NonNullable<string> = '';
  id: NonNullable<string> = '';

  constructor(input: Partial<OAuth2Client> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.archivedAt = input.archivedAt;
    this.name = input.name ?? '';
    this.description = input.description ?? '';
    this.clientID = input.clientID ?? '';
    this.id = input.id ?? '';
  }
}

export interface IOAuth2ClientCreationRequestInput {
  name: NonNullable<string>;
  description: NonNullable<string>;
}

export class OAuth2ClientCreationRequestInput implements IOAuth2ClientCreationRequestInput {
  name: NonNullable<string> = '';
  description: NonNullable<string> = '';

  constructor(input: Partial<OAuth2ClientCreationRequestInput> = {}) {
    this.name = input.name ?? '';
    this.description = input.description ?? '';
  }
}

export interface IOAuth2ClientCreationResponse {
  clientID: NonNullable<string>;
  clientSecret: NonNullable<string>;
  name: NonNullable<string>;
  description: NonNullable<string>;
  id: NonNullable<string>;
}

export class OAuth2ClientCreationResponse implements IOAuth2ClientCreationResponse {
  clientID: NonNullable<string> = '';
  clientSecret: NonNullable<string> = '';
  name: NonNullable<string> = '';
  description: NonNullable<string> = '';
  id: NonNullable<string> = '';

  constructor(input: Partial<OAuth2ClientCreationResponse> = {}) {
    this.clientID = input.clientID ?? '';
    this.clientSecret = input.clientSecret ?? '';
    this.name = input.name ?? '';
    this.description = input.description ?? '';
    this.id = input.id ?? '';
  }
}
