import { Page, Route } from '@playwright/test';
import { Household, QueryFilteredResult } from '@prixfixeco/models';
import { assertClient, assertMethod, methods, ResponseConfig } from './helpers';

export class MockHouseholdResponseConfig extends ResponseConfig<Household> {
  householdID: string;

  constructor(householdID: string, status: number = 200, body?: Household) {
    super();

    this.householdID = householdID;
    this.status = status;
    this.body = body;
  }
}

export const mockCurrentHouseholdInfo = (resCfg: MockHouseholdResponseConfig) => {
  return (page: Page) =>
    page.route(
      `**/api/v1/households/current`,
      (route: Route) => {
        const req = route.request();

        assertMethod('GET', route);
        assertClient(route);

        route.fulfill(resCfg.fulfill());
      },
      { times: resCfg.times },
    );
};

export const mockGetHousehold = (resCfg: MockHouseholdResponseConfig) => {
  return (page: Page) =>
    page.route(
      `**/api/v1/households/${resCfg.householdID}`,
      (route: Route) => {
        const req = route.request();

        assertMethod('GET', route);
        assertClient(route);

        route.fulfill(resCfg.fulfill());
      },
      { times: resCfg.times },
    );
};

export const mockUpdateHousehold = (resCfg: MockHouseholdResponseConfig) => {
  return (page: Page) =>
    page.route(
      `**/api/v1/households/${resCfg.householdID}`,
      (route: Route) => {
        const req = route.request();

        assertMethod('PUT', route);
        assertClient(route);

        route.fulfill(resCfg.fulfill());
      },
      { times: resCfg.times },
    );
};

export class MockHouseholdListResponseConfig extends ResponseConfig<QueryFilteredResult<Household>> {}

export const mockGetHouseholds = (resCfg: MockHouseholdListResponseConfig) => {
  return (page: Page) =>
    page.route(
      `**/api/v1/households?${resCfg.filter.asURLSearchParams().toString()}`,
      (route: Route) => {
        const req = route.request();

        assertMethod('GET', route);
        assertClient(route);

        route.fulfill(resCfg.fulfill());
      },
      { times: resCfg.times },
    );
};

export class MockRemoveUserFromHouseholdResponseConfig extends ResponseConfig<void> {
  userID: string;
  householdID: string;

  constructor(userID: string, householdID: string, status: number = 200) {
    super();

    this.userID = userID;
    this.householdID = householdID;
    this.status = status;
  }
}

export const mockRemoveMember = (resCfg: MockRemoveUserFromHouseholdResponseConfig) => {
  return (page: Page) =>
    page.route(
      `**/api/v1/households/${resCfg.householdID}/members/${resCfg.userID}`,
      (route: Route) => {
        const req = route.request();

        assertMethod('DELETE', route);
        assertClient(route);

        route.fulfill(resCfg.fulfill());
      },
      { times: resCfg.times },
    );
};