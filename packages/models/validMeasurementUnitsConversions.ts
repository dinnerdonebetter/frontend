import { QueryFilteredResult } from './pagination';

export class ValidMeasurementUnitConversion {
  lastUpdatedAt?: string;
  archivedAt?: string;
  name: string;
  description: string;
  id: string;
  iconPath: string;
  createdAt: string;
  volumetric: boolean;
  universal: boolean;
  metric: boolean;
  imperial: boolean;
  pluralName: string;
  slug: string;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      name?: string;
      description?: string;
      id?: string;
      iconPath?: string;
      createdAt?: string;
      volumetric?: boolean;
      universal?: boolean;
      metric?: boolean;
      imperial?: boolean;
      pluralName?: string;
      slug?: string;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.name = input.name || '';
    this.description = input.description || '';
    this.id = input.id || '';
    this.iconPath = input.iconPath || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.volumetric = Boolean(input.volumetric);
    this.universal = Boolean(input.universal);
    this.metric = Boolean(input.metric);
    this.imperial = Boolean(input.imperial);
    this.pluralName = input.pluralName || '';
    this.slug = input.slug || '';
  }
}

export class ValidMeasurementUnitConversionList extends QueryFilteredResult<ValidMeasurementUnitConversion> {
  constructor(
    input: {
      data?: ValidMeasurementUnitConversion[];
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

export class ValidMeasurementUnitConversionCreationRequestInput {
  name: string;
  description: string;
  iconPath: string;
  volumetric: boolean;
  universal: boolean;
  metric: boolean;
  imperial: boolean;
  pluralName: string;
  slug: string;

  constructor(
    input: {
      name?: string;
      description?: string;
      iconPath?: string;
      volumetric?: boolean;
      universal?: boolean;
      metric?: boolean;
      imperial?: boolean;
      pluralName?: string;
      slug?: string;
    } = {},
  ) {
    this.name = input.name || '';
    this.description = input.description || '';
    this.iconPath = input.iconPath || '';
    this.volumetric = Boolean(input.volumetric);
    this.universal = Boolean(input.universal);
    this.metric = Boolean(input.metric);
    this.imperial = Boolean(input.imperial);
    this.pluralName = input.pluralName || '';
    this.slug = input.slug || '';
  }

  static fromValidMeasurementUnitConversion(
    input: ValidMeasurementUnitConversion,
  ): ValidMeasurementUnitConversionCreationRequestInput {
    const x = new ValidMeasurementUnitConversionCreationRequestInput();

    x.name = input.name;
    x.description = input.description;
    x.iconPath = input.iconPath;
    x.volumetric = input.volumetric;
    x.universal = Boolean(input.universal);
    x.metric = Boolean(input.metric);
    x.imperial = Boolean(input.imperial);
    x.pluralName = input.pluralName;
    x.slug = input.slug;

    return x;
  }
}

export class ValidMeasurementUnitConversionUpdateRequestInput {
  id?: string;
  name?: string;
  description?: string;
  iconPath?: string;
  volumetric?: boolean;
  universal?: boolean;
  metric?: boolean;
  imperial?: boolean;
  pluralName?: string;
  slug?: string;

  constructor(
    input: {
      id?: string;
      name?: string;
      description?: string;
      iconPath?: string;
      volumetric?: boolean;
      universal?: boolean;
      metric?: boolean;
      imperial?: boolean;
      pluralName?: string;
      slug?: string;
    } = {},
  ) {
    this.id = input.id;
    this.name = input.name;
    this.description = input.description;
    this.iconPath = input.iconPath;
    this.volumetric = input.volumetric;
    this.universal = Boolean(input.universal);
    this.metric = Boolean(input.metric);
    this.imperial = Boolean(input.imperial);
    this.pluralName = input.pluralName;
    this.slug = input.slug;
  }

  static fromValidMeasurementUnitConversion(
    input: ValidMeasurementUnitConversion,
  ): ValidMeasurementUnitConversionUpdateRequestInput {
    const x = new ValidMeasurementUnitConversionUpdateRequestInput();

    x.name = input.name;
    x.description = input.description;
    x.iconPath = input.iconPath;
    x.volumetric = input.volumetric;
    x.universal = Boolean(input.universal);
    x.metric = Boolean(input.metric);
    x.imperial = Boolean(input.imperial);
    x.pluralName = input.pluralName;

    return x;
  }
}
