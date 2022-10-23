type validStatus = "unverified" | "banned" | "terminated" | "good";

export class UserAccountStatusUpdateInput {
  newStatus: validStatus;
  reason: string;
  targetUserID: string;

  constructor(
    input: {
      newStatus?: validStatus;
      reason?: string;
      targetUserID?: string;
    } = {}
  ) {
    this.newStatus = input.newStatus || "unverified";
    this.reason = input.reason || "";
    this.targetUserID = input.targetUserID || "";
  }
}
