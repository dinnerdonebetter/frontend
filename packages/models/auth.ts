import { permission } from './permissions';

export class UserHouseholdMembershipInfo {
  name: string;
  householdID: string;

  constructor(
    input: {
      name?: string;
      householdID?: string;
    } = {},
  ) {
    this.name = input.name || '';
    this.householdID = input.householdID || '';
  }
}

export class UserStatusResponse {
  accountStatus?: string;
  accountStatusExplanation: string;
  activeHousehold?: string;
  isAuthenticated: boolean;

  constructor(
    input: {
      accountStatus?: string;
      accountStatusExplanation?: string;
      activeHousehold?: string;
      isAuthenticated?: boolean;
    } = {},
  ) {
    this.accountStatus = input.accountStatus;
    this.accountStatusExplanation = input.accountStatusExplanation || '';
    this.activeHousehold = input.activeHousehold;
    this.isAuthenticated = Boolean(input.isAuthenticated);
  }
}

export class ChangeActiveHouseholdInput {
  householdID: string;

  constructor(
    input: {
      householdID?: string;
    } = {},
  ) {
    this.householdID = input.householdID || '';
  }
}

export class PASETOCreationInput {
  clientID: string;
  householdID: string;
  requestTime: number;
  requestedLifetime?: number;

  constructor(
    input: {
      clientID?: string;
      householdID?: string;
      requestTime?: number;
      requestedLifetime?: number;
    } = {},
  ) {
    this.clientID = input.clientID || '';
    this.householdID = input.householdID || '';
    this.requestTime = input.requestTime || -1;
    this.requestedLifetime = input.requestedLifetime;
  }
}

export class PASETOResponse {
  token: string;
  expiresAt: string;

  constructor(
    input: {
      token?: string;
      expiresAt?: string;
    } = {},
  ) {
    this.token = input.token || '';
    this.expiresAt = input.expiresAt || '';
  }
}

export class UserLoginInput {
  username: string;
  password: string;
  totpToken: string;

  constructor(
    input: {
      username?: string;
      password?: string;
      totpToken?: string;
    } = {},
  ) {
    this.username = input.username || '';
    this.password = input.password || '';
    this.totpToken = input.totpToken || '';
  }
}

export class UserPermissionsRequestInput {
  permissions: permission[];

  constructor(permissions: permission[]) {
    this.permissions = permissions;
  }
}

export class UserPermissionsResponse {
  permissions: Record<permission, boolean>;

  constructor(
    input: {
      permissions?: Record<permission, boolean>;
    } = {},
  ) {
    this.permissions = input.permissions || ({} as Record<permission, boolean>);
  }
}

export class PasswordResetTokenCreationRequestInput {
  emailAddress: string;

  constructor(
    input: {
      emailAddress?: string;
    } = {},
  ) {
    this.emailAddress = input.emailAddress || '';
  }
}

export class PasswordResetTokenRedemptionRequestInput {
  newPassword: string;
  token: string;

  constructor(
    input: {
      newPassword?: string;
      token?: string;
    } = {},
  ) {
    this.newPassword = input.newPassword || '';
    this.token = input.token || '';
  }
}

export class UsernameReminderRequestInput {
  emailAddress: string;

  constructor(
    input: {
      emailAddress?: string;
    } = {},
  ) {
    this.emailAddress = input.emailAddress || '';
  }
}
