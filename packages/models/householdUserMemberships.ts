import { QueryFilteredResult } from './pagination';
import { User } from './users';

export class HouseholdUserMembership {
  archivedAt?: string;
  lastUpdatedAt?: string;
  id: string;
  belongsToUser: string;
  belongsToHousehold: string;
  householdRole: string[];
  createdAt: string;
  defaultHousehold: boolean;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      id?: string;
      belongsToUser?: string;
      belongsToHousehold?: string;
      householdRole?: string[];
      createdAt?: string;
      defaultHousehold?: boolean;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.id = input.id || '';
    this.belongsToUser = input.belongsToUser || '';
    this.belongsToHousehold = input.belongsToHousehold || '';
    this.householdRole = input.householdRole || [];
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.defaultHousehold = Boolean(input.defaultHousehold);
  }
}

export class HouseholdUserMembershipWithUser {
  archivedAt?: string;
  lastUpdatedAt?: string;
  id: string;
  belongsToUser: User;
  belongsToHousehold: string;
  householdRole: string[];
  createdAt: string;
  defaultHousehold: boolean;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      id?: string;
      belongsToUser?: User;
      belongsToHousehold?: string;
      householdRole?: string[];
      createdAt?: string;
      defaultHousehold?: boolean;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.id = input.id || '';
    this.belongsToUser = input.belongsToUser || new User();
    this.belongsToHousehold = input.belongsToHousehold || '';
    this.householdRole = input.householdRole || [];
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.defaultHousehold = Boolean(input.defaultHousehold);
  }
}

export class HouseholdUserMembershipList extends QueryFilteredResult<HouseholdUserMembership> {
  constructor(
    input: {
      data?: HouseholdUserMembership[];
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

export class HouseholdUserMembershipCreationRequestInput {
  reason: string;
  userID: string;

  constructor(
    input: {
      reason?: string;
      userID?: string;
    } = {},
  ) {
    this.reason = input.reason || '';
    this.userID = input.userID || '';
  }
}

export class HouseholdUserMembershipUpdateRequestInput {
  belongsToUser: string;
  belongsToHousehold: string;

  constructor(
    input: {
      belongsToUser?: string;
      belongsToHousehold?: string;
    } = {},
  ) {
    this.belongsToUser = input.belongsToUser || '';
    this.belongsToHousehold = input.belongsToHousehold || '';
  }
}

export class HouseholdOwnershipTransferInput {
  reason: string;
  currentOwner: string;
  newOwner: string;

  constructor(
    input: {
      reason?: string;
      currentOwner?: string;
      newOwner?: string;
    } = {},
  ) {
    this.reason = input.reason || '';
    this.currentOwner = input.currentOwner || '';
    this.newOwner = input.newOwner || '';
  }
}

export class ModifyUserPermissionsInput {
  reason: string;
  newRoles: string[];

  constructor(
    input: {
      reason?: string;
      newRoles?: string[];
    } = {},
  ) {
    this.reason = input.reason || '';
    this.newRoles = input.newRoles || [];
  }
}
