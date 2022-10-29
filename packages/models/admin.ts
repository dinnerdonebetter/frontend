export type validAccountStatus = 'unverified' | 'banned' | 'terminated' | 'good';

export class UserAccountStatusUpdateInput {
  newStatus: validAccountStatus;
  reason: string;
  targetUserID: string;

  constructor(
    input: {
      newStatus?: validAccountStatus;
      reason?: string;
      targetUserID?: string;
    } = {},
  ) {
    this.newStatus = input.newStatus || 'unverified';
    this.reason = input.reason || '';
    this.targetUserID = input.targetUserID || '';
  }
}
