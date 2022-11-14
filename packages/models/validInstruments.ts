import { QueryFilteredResult } from './pagination';

export class ValidInstrument {
  lastUpdatedAt?: string;
  archivedAt?: string;
  description: string;
  iconPath: string;
  id: string;
  name: string;
  pluralName: string;
  createdAt: string;
  slug: string;
  displayInSummaryLists: boolean;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      description?: string;
      iconPath?: string;
      id?: string;
      name?: string;
      pluralName?: string;
      createdAt?: string;
      slug?: string;
      displayInSummaryLists?: boolean;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.description = input.description || '';
    this.iconPath = input.iconPath || '';
    this.id = input.id || '';
    this.name = input.name || '';
    this.pluralName = input.pluralName || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.slug = input.slug || '';
    this.displayInSummaryLists = Boolean(input.displayInSummaryLists);
  }
}

export class ValidInstrumentList extends QueryFilteredResult<ValidInstrument> {
  constructor(
    input: {
      data?: ValidInstrument[];
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

export class ValidInstrumentCreationRequestInput {
  name: string;
  pluralName: string;
  description: string;
  iconPath: string;
  slug: string;
  displayInSummaryLists: boolean;

  constructor(
    input: {
      name?: string;
      pluralName?: string;
      description?: string;
      iconPath?: string;
      slug?: string;
      displayInSummaryLists?: boolean;
    } = {},
  ) {
    this.name = input.name || '';
    this.pluralName = input.pluralName || '';
    this.description = input.description || '';
    this.iconPath = input.iconPath || '';
    this.slug = input.slug || '';
    this.displayInSummaryLists = Boolean(input.displayInSummaryLists);
  }

  static fromValidInstrument(input: ValidInstrument): ValidInstrumentCreationRequestInput {
    const x = new ValidInstrumentCreationRequestInput();

    x.name = input.name;
    x.pluralName = input.pluralName;
    x.description = input.description;
    x.iconPath = input.iconPath;

    return x;
  }
}

export class ValidInstrumentUpdateRequestInput {
  name?: string;
  pluralName?: string;
  description?: string;
  iconPath?: string;
  slug: string;
  displayInSummaryLists: boolean;

  constructor(
    input: {
      name?: string;
      pluralName?: string;
      description?: string;
      iconPath?: string;
      slug?: string;
      displayInSummaryLists?: boolean;
    } = {},
  ) {
    this.name = input.name;
    this.pluralName = input.pluralName;
    this.description = input.description;
    this.iconPath = input.iconPath;
    this.slug = input.slug || '';
    this.displayInSummaryLists = Boolean(input.displayInSummaryLists);
  }

  static fromValidInstrument(input: ValidInstrument): ValidInstrumentUpdateRequestInput {
    const x = new ValidInstrumentUpdateRequestInput();

    x.name = input.name;
    x.pluralName = input.pluralName;
    x.description = input.description;
    x.iconPath = input.iconPath;
    x.slug = input.slug;
    x.displayInSummaryLists = input.displayInSummaryLists;

    return x;
  }
}
