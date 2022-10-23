import { HouseholdUserMembershipWithUser } from "./householdUserMemberships";
import { QueryFilteredResult } from "./pagination";

export type validTimeZone =
  | "UTC"
  | "US/Pacific"
  | "US/Mountain"
  | "US/Central"
  | "US/Eastern";

export class Household {
  archivedAt?: string;
  subscriptionPlanID?: number;
  lastUpdatedAt?: string;
  name: string;
  billingStatus: string;
  contactEmail: string;
  contactPhone: string;
  paymentProcessorCustomer: string;
  belongsToUser: string;
  id: string;
  members: HouseholdUserMembershipWithUser[];
  createdAt: string;
  timeZone: validTimeZone;

  constructor(
    input: {
      archivedAt?: string;
      subscriptionPlanID?: number;
      lastUpdatedAt?: string;
      name?: string;
      billingStatus?: string;
      contactEmail?: string;
      contactPhone?: string;
      paymentProcessorCustomer?: string;
      belongsToUser?: string;
      id?: string;
      members?: HouseholdUserMembershipWithUser[];
      createdAt?: string;
      timeZone?: validTimeZone;
    } = {}
  ) {
    this.archivedAt = input.archivedAt;
    this.subscriptionPlanID = input.subscriptionPlanID;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.name = input.name || "";
    this.billingStatus = input.billingStatus || "";
    this.contactEmail = input.contactEmail || "";
    this.contactPhone = input.contactPhone || "";
    this.paymentProcessorCustomer = input.paymentProcessorCustomer || "";
    this.belongsToUser = input.belongsToUser || "";
    this.id = input.id || "";
    this.members = input.members || [];
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.timeZone = input.timeZone || "US/Central";
  }
}

export class HouseholdList extends QueryFilteredResult<Household> {
  constructor(
    input: {
      data?: Household[];
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

export class HouseholdCreationRequestInput {
  name: string;
  contactEmail: string;
  contactPhone: string;
  timeZone: validTimeZone;

  constructor(
    input: {
      name?: string;
      contactEmail?: string;
      contactPhone?: string;
      timeZone?: validTimeZone;
    } = {}
  ) {
    this.name = input.name || "";
    this.contactEmail = input.contactEmail || "";
    this.contactPhone = input.contactPhone || "";
    this.timeZone = input.timeZone || "US/Central";
  }

  static fromHousehold(input: Household): HouseholdCreationRequestInput {
    const x = new HouseholdCreationRequestInput();

    x.name = input.name;
    x.contactEmail = input.contactEmail;
    x.contactPhone = input.contactPhone;
    x.timeZone = input.timeZone;

    return x;
  }
}

export class HouseholdUpdateRequestInput {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  timeZone?: validTimeZone;

  constructor(
    input: {
      name?: string;
      contactEmail?: string;
      contactPhone?: string;
      timeZone?: validTimeZone;
    } = {}
  ) {
    this.name = input.name;
    this.contactEmail = input.contactEmail;
    this.contactPhone = input.contactPhone;
    this.timeZone = input.timeZone;
  }

  static fromHousehold(input: Household): HouseholdUpdateRequestInput {
    const x = new HouseholdUpdateRequestInput();

    x.name = input.name;
    x.contactEmail = input.contactEmail;
    x.contactPhone = input.contactPhone;
    x.timeZone = input.timeZone;

    return x;
  }
}
