import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidPreparationVesselCreationRequestInput,
  ValidPreparationVessel,
  QueryFilteredResult,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function getValidPreparationVessel(
  client: Axios,
  validPreparationVesselID: string,
): Promise<AxiosResponse<ValidPreparationVessel>> {
  const uri = format(backendRoutes.VALID_PREPARATION_VESSEL, validPreparationVesselID);
  return client.get<ValidPreparationVessel>(uri);
}

export async function validPreparationVesselsForPreparationID(
  client: Axios,
  validPreparationID: string,
): Promise<AxiosResponse<QueryFilteredResult<ValidPreparationVessel>>> {
  const searchURL = format(backendRoutes.VALID_PREPARATION_VESSELS_SEARCH_BY_PREPARATION_ID, validPreparationID);
  return client.get<QueryFilteredResult<ValidPreparationVessel>>(searchURL);
}

export async function validPreparationVesselsForVesselID(
  client: Axios,
  validVesselID: string,
): Promise<AxiosResponse<QueryFilteredResult<ValidPreparationVessel>>> {
  const searchURL = format(backendRoutes.VALID_PREPARATION_VESSELS_SEARCH_BY_VESSEL_ID, validVesselID);
  return client.get<QueryFilteredResult<ValidPreparationVessel>>(searchURL);
}

export async function createValidPreparationVessel(
  client: Axios,
  input: ValidPreparationVesselCreationRequestInput,
): Promise<AxiosResponse<ValidPreparationVessel>> {
  return client.post<ValidPreparationVessel>(backendRoutes.VALID_PREPARATION_VESSELS, input);
}

export async function deleteValidPreparationVessel(
  client: Axios,
  validPreparationVesselID: string,
): Promise<AxiosResponse> {
  return client.delete(format(backendRoutes.VALID_PREPARATION_VESSEL, validPreparationVesselID));
}
