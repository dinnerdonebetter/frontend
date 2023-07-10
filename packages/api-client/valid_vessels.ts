import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidVesselCreationRequestInput,
  ValidVessel,
  QueryFilter,
  ValidVesselUpdateRequestInput,
  QueryFilteredResult,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidVessel(
  client: Axios,
  input: ValidVesselCreationRequestInput,
): Promise<AxiosResponse<ValidVessel>> {
  return client.post<ValidVessel>(backendRoutes.VALID_VESSELS, input);
}

export async function getValidVessel(client: Axios, validVesselID: string): Promise<AxiosResponse<ValidVessel>> {
  return client.get<ValidVessel>(format(backendRoutes.VALID_VESSEL, validVesselID));
}

export async function getValidVessels(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidVessel>>> {
  return client.get<QueryFilteredResult<ValidVessel>>(backendRoutes.VALID_VESSELS, {
    params: filter.asRecord(),
  });
}

export async function updateValidVessel(
  client: Axios,
  validVesselID: string,
  input: ValidVesselUpdateRequestInput,
): Promise<AxiosResponse<ValidVessel>> {
  return client.put<ValidVessel>(format(backendRoutes.VALID_VESSEL, validVesselID), input);
}

export async function deleteValidVessel(client: Axios, validVesselID: string): Promise<AxiosResponse<ValidVessel>> {
  return client.delete(format(backendRoutes.VALID_VESSEL, validVesselID));
}

export async function searchForValidVessels(client: Axios, query: string): Promise<AxiosResponse<ValidVessel[]>> {
  const searchURL = `${backendRoutes.VALID_VESSELS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<ValidVessel[]>(searchURL);
}
