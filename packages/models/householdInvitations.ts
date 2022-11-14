import { Household } from './households';
import { QueryFilteredResult } from './pagination';
import { User } from './users';

export class HouseholdInvitation {
  lastUpdatedAt?: string;
  archivedAt?: string;
  fromUser: User;
  toEmail: string;
  toUser?: string;
  note: string;
  statusNote: string;
  token: string;
  destinationHousehold: Household;
  expiresAt?: string;
  id: string;
  status: string;
  createdAt: string;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      fromUser?: User;
      toEmail?: string;
      toUser?: string;
      note?: string;
      statusNote?: string;
      token?: string;
      destinationHousehold?: Household;
      id?: string;
      status?: string;
      createdAt?: string;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.fromUser = input.fromUser || new User();
    this.toEmail = input.toEmail || '';
    this.toUser = input.toUser;
    this.note = input.note || '';
    this.statusNote = input.statusNote || '';
    this.token = input.token || '';
    this.destinationHousehold = input.destinationHousehold || new Household();
    this.id = input.id || '';
    this.status = input.status || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
  }
}

export class HouseholdInvitationList extends QueryFilteredResult<HouseholdInvitation> {
  constructor(
    input: {
      data?: HouseholdInvitation[];
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

export class HouseholdInvitationCreationRequestInput {
  note: string;
  toEmail: string;

  constructor(
    input: {
      note?: string;
      toEmail?: string;
    } = {},
  ) {
    this.note = input.note || '';
    this.toEmail = input.toEmail || '';
  }

  static fromHouseholdInvitation(source: HouseholdInvitation): HouseholdInvitationCreationRequestInput {
    const target = new HouseholdInvitationCreationRequestInput();

    target.note = source.note;
    target.toEmail = source.toEmail;

    return target;
  }
}

export class HouseholdInvitationUpdateRequestInput {
  token: string;
  note: string;

  constructor(
    input: {
      token?: string;
      note?: string;
    } = {},
  ) {
    this.token = input.token || '';
    this.note = input.note || '';
  }

  static fromHouseholdInvitation(source: HouseholdInvitation): HouseholdInvitationUpdateRequestInput {
    const target = new HouseholdInvitationUpdateRequestInput();

    target.token = source.token;
    target.note = source.note;

    return target;
  }
}
