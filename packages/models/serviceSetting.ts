// Code generated by gen_typescript. DO NOT EDIT.

export interface IServiceSetting {
  createdAt: NonNullable<string>;
  defaultValue?: string;
  lastUpdatedAt?: string;
  archivedAt?: string;
  id: NonNullable<string>;
  name: NonNullable<string>;
  type: NonNullable<string>;
  description: NonNullable<string>;
  enumeration: NonNullable<Array<string>>;
  adminsOnly: NonNullable<boolean>;
}

export class ServiceSetting implements IServiceSetting {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  defaultValue?: string;
  lastUpdatedAt?: string;
  archivedAt?: string;
  id: NonNullable<string> = '';
  name: NonNullable<string> = '';
  type: NonNullable<string> = '';
  description: NonNullable<string> = '';
  enumeration: NonNullable<Array<string>> = [];
  adminsOnly: NonNullable<boolean> = false;

  constructor(input: Partial<ServiceSetting> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.defaultValue = input.defaultValue;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.id = input.id ?? '';
    this.name = input.name ?? '';
    this.type = input.type ?? '';
    this.description = input.description ?? '';
    this.enumeration = input.enumeration ?? [];
    this.adminsOnly = input.adminsOnly ?? false;
  }
}

export interface IServiceSettingCreationRequestInput {
  createdAt: NonNullable<string>;
  defaultValue?: string;
  lastUpdatedAt?: string;
  archivedAt?: string;
  id: NonNullable<string>;
  name: NonNullable<string>;
  type: NonNullable<string>;
  description: NonNullable<string>;
  enumeration: NonNullable<Array<string>>;
  adminsOnly: NonNullable<boolean>;
}

export class ServiceSettingCreationRequestInput implements IServiceSettingCreationRequestInput {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  defaultValue?: string;
  lastUpdatedAt?: string;
  archivedAt?: string;
  id: NonNullable<string> = '';
  name: NonNullable<string> = '';
  type: NonNullable<string> = '';
  description: NonNullable<string> = '';
  enumeration: NonNullable<Array<string>> = [];
  adminsOnly: NonNullable<boolean> = false;

  constructor(input: Partial<ServiceSettingCreationRequestInput> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.defaultValue = input.defaultValue;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.id = input.id ?? '';
    this.name = input.name ?? '';
    this.type = input.type ?? '';
    this.description = input.description ?? '';
    this.enumeration = input.enumeration ?? [];
    this.adminsOnly = input.adminsOnly ?? false;
  }
}

export interface IServiceSettingUpdateRequestInput {
  name?: string;
  type?: string;
  description?: string;
  defaultValue?: string;
  adminsOnly?: boolean;
  enumeration: NonNullable<Array<string>>;
}

export class ServiceSettingUpdateRequestInput implements IServiceSettingUpdateRequestInput {
  name?: string;
  type?: string;
  description?: string;
  defaultValue?: string;
  adminsOnly?: boolean = false;
  enumeration: NonNullable<Array<string>> = [];

  constructor(input: Partial<ServiceSettingUpdateRequestInput> = {}) {
    this.name = input.name;
    this.type = input.type;
    this.description = input.description;
    this.defaultValue = input.defaultValue;
    this.adminsOnly = input.adminsOnly ?? false;
    this.enumeration = input.enumeration ?? [];
  }
}
