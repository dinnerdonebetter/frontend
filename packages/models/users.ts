import { QueryFilteredResult } from './pagination';

export class User {
  passwordLastChangedAt?: string;
  archivedAt?: string;
  lastUpdatedAt?: string;
  avatar?: string;
  birthday?: string;
  emailAddress: string;
  accountStatusExplanation: string;
  id: string;
  accountStatus: string;
  username: string;
  serviceRoles: string[];
  createdAt: string;
  requiresPasswordChange: boolean;
  twoFactorSecretVerifiedAt?: string;

  constructor(
    input: {
      passwordLastChangedAt?: string;
      archivedAt?: string;
      lastUpdatedAt?: string;
      avatar?: string;
      birthday?: string;
      emailAddress?: string;
      accountStatusExplanation?: string;
      id?: string;
      accountStatus?: string;
      username?: string;
      serviceRoles?: string[];
      createdAt?: string;
      requiresPasswordChange?: boolean;
      twoFactorSecretVerifiedAt?: string;
    } = {},
  ) {
    this.passwordLastChangedAt = input.passwordLastChangedAt;
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.avatar = input.avatar;
    this.birthday = input.birthday;
    this.emailAddress = input.emailAddress || '';
    this.accountStatusExplanation = input.accountStatusExplanation || '';
    this.id = input.id || '';
    this.accountStatus = input.accountStatus || '';
    this.username = input.username || '';
    this.serviceRoles = input.serviceRoles || [];
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.requiresPasswordChange = Boolean(input.requiresPasswordChange);
    this.twoFactorSecretVerifiedAt = input.twoFactorSecretVerifiedAt;
  }
}

export class UserList extends QueryFilteredResult<User> {
  constructor(
    input: {
      data?: User[];
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

export class UserRegistrationInput {
  birthday?: string;
  password: string;
  emailAddress: string;
  invitationToken?: string;
  invitationID?: string;
  username: string;
  householdName: string;

  constructor(
    input: {
      birthday?: string;
      password?: string;
      emailAddress?: string;
      invitationToken?: string;
      invitationID?: string;
      username?: string;
      householdName?: string;
    } = {},
  ) {
    this.birthday = input.birthday;
    this.password = input.password || '';
    this.emailAddress = input.emailAddress || '';
    this.invitationToken = input.invitationToken;
    this.invitationID = input.invitationID;
    this.username = input.username || '';
    this.householdName = input.householdName || '';
  }
}

export class UserCreationResponse {
  birthday?: string;
  username: string;
  emailAddress: string;
  qrCode: string;
  createdUserID: string;
  accountStatus: string;
  twoFactorSecret: string;
  createdAt: string;
  isAdmin: boolean;

  constructor(
    input: {
      birthday?: string;
      username?: string;
      emailAddress?: string;
      qrCode?: string;
      createdUserID?: string;
      accountStatus?: string;
      twoFactorSecret?: string;
      createdAt?: string;
      isAdmin?: boolean;
    } = {},
  ) {
    this.birthday = input.birthday;
    this.username = input.username || '';
    this.emailAddress = input.emailAddress || '';
    this.qrCode = input.qrCode || '';
    this.createdUserID = input.createdUserID || '';
    this.accountStatus = input.accountStatus || '';
    this.twoFactorSecret = input.twoFactorSecret || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.isAdmin = Boolean(input.isAdmin);
  }
}

export class PasswordUpdateInput {
  newPassword: string;
  currentPassword: string;
  totpToken: string;

  constructor(
    input: {
      newPassword?: string;
      currentPassword?: string;
      totpToken?: string;
    } = {},
  ) {
    this.newPassword = input.newPassword || '';
    this.currentPassword = input.currentPassword || '';
    this.totpToken = input.totpToken || '';
  }
}

export class TOTPSecretRefreshInput {
  currentPassword: string;
  totpToken: string;

  constructor(
    input: {
      currentPassword?: string;
      totpToken?: string;
    } = {},
  ) {
    this.currentPassword = input.currentPassword || '';
    this.totpToken = input.totpToken || '';
  }
}

export class TOTPSecretVerificationInput {
  totpToken: string;
  userID: string;

  constructor(
    input: {
      userID?: string;
      totpToken?: string;
    } = {},
  ) {
    this.totpToken = input.totpToken || '';
    this.userID = input.userID || '';
  }
}

export class TOTPSecretRefreshResponse {
  qrCode: string;
  twoFactorSecret: string;

  constructor(
    input: {
      qrCode?: string;
      twoFactorSecret?: string;
    } = {},
  ) {
    this.qrCode = input.qrCode || '';
    this.twoFactorSecret = input.twoFactorSecret || '';
  }
}
