import { QueryFilteredResult } from "./pagination";
import { ValidInstrument } from "./validInstruments";
import { ValidPreparation } from "./validPreparations";

export class ValidPreparationInstrument {
  archivedAt?: string;
  lastUpdatedAt?: string;
  notes: string;
  preparation: ValidPreparation;
  instrument: ValidInstrument;
  id: string;
  createdAt: string;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      notes?: string;
      preparation?: ValidPreparation;
      instrument?: ValidInstrument;
      id?: string;
      createdAt?: string;
    } = {}
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.notes = input.notes || "";
    this.preparation = input.preparation;
    this.instrument = input.instrument;
    this.id = input.id || "";
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
  }
}

export class ValidPreparationInstrumentList extends QueryFilteredResult<ValidPreparationInstrument> {
  constructor(
    input: {
      data?: ValidPreparationInstrument[];
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

export class ValidPreparationInstrumentCreationRequestInput {
  notes: string;
  validPreparationID: string;
  validInstrumentID: string;

  constructor(
    input: {
      notes?: string;
      validPreparationID?: string;
      validInstrumentID?: string;
    } = {}
  ) {
    this.notes = input.notes || "";
    this.validPreparationID = input.validPreparationID || "";
    this.validInstrumentID = input.validInstrumentID || "";
  }

  static fromValidPreparationInstrument(
    input: ValidPreparationInstrument
  ): ValidPreparationInstrumentCreationRequestInput {
    const x = new ValidPreparationInstrumentCreationRequestInput();

    x.notes = input.notes;
    x.validPreparationID = input.preparation.id;
    x.validInstrumentID = input.instrument.id;

    return x;
  }
}

export class ValidPreparationInstrumentUpdateRequestInput {
  notes?: string;
  validPreparationID?: string;
  validInstrumentID?: string;

  constructor(
    input: {
      notes?: string;
      validPreparationID?: string;
      validInstrumentID?: string;
    } = {}
  ) {
    this.notes = input.notes;
    this.validPreparationID = input.validPreparationID;
    this.validInstrumentID = input.validInstrumentID;
  }

  static fromValidPreparationInstrument(
    input: ValidPreparationInstrument
  ): ValidPreparationInstrumentUpdateRequestInput {
    const x = new ValidPreparationInstrumentUpdateRequestInput();

    x.notes = input.notes;
    x.validPreparationID = input.preparation.id;
    x.validInstrumentID = input.instrument.id;

    return x;
  }
}
