import { QueryFilteredResult } from "./pagination";

export class ValidMeasurementUnit {
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
    } = {}
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.name = input.name || "";
    this.description = input.description || "";
    this.id = input.id || "";
    this.iconPath = input.iconPath || "";
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.volumetric = Boolean(input.volumetric);
    this.universal = Boolean(input.universal);
    this.metric = Boolean(input.metric);
    this.imperial = Boolean(input.imperial);
    this.pluralName = input.pluralName || "";
  }
}

export class ValidMeasurementUnitList extends QueryFilteredResult<ValidMeasurementUnit> {
  constructor(
    input: {
      data?: ValidMeasurementUnit[];
      page?: number;
      limit?: number;
      filteredCount?: number;
      totalCount?: number;
    } = {}
  ) {
    super(input);

    this.data = input.data || [];
    this.page = input.page || 1;
    this.limit = input.limit || 20;
    this.filteredCount = input.filteredCount || 0;
    this.totalCount = input.totalCount || 0;
  }
}

export class ValidMeasurementUnitCreationRequestInput {
  name: string;
  description: string;
  iconPath: string;
  volumetric: boolean;
  universal: boolean;
  metric: boolean;
  imperial: boolean;
  pluralName: string;

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
    } = {}
  ) {
    this.name = input.name || "";
    this.description = input.description || "";
    this.iconPath = input.iconPath || "";
    this.volumetric = Boolean(input.volumetric);
    this.universal = Boolean(input.universal);
    this.metric = Boolean(input.metric);
    this.imperial = Boolean(input.imperial);
    this.pluralName = input.pluralName || "";
  }

  static fromValidMeasurementUnit(
    input: ValidMeasurementUnit
  ): ValidMeasurementUnitCreationRequestInput {
    const x = new ValidMeasurementUnitCreationRequestInput();

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

export class ValidMeasurementUnitUpdateRequestInput {
  id?: string;
  name?: string;
  description?: string;
  iconPath?: string;
  volumetric?: boolean;
  universal?: boolean;
  metric?: boolean;
  imperial?: boolean;
  pluralName?: string;

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
    } = {}
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
  }

  static fromValidMeasurementUnit(
    input: ValidMeasurementUnit
  ): ValidMeasurementUnitUpdateRequestInput {
    const x = new ValidMeasurementUnitUpdateRequestInput();

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
