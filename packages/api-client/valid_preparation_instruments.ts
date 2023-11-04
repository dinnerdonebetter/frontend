import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidPreparationInstrumentCreationRequestInput,
  ValidPreparationInstrument,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function getValidPreparationInstrument(
  client: Axios,
  validPreparationInstrumentID: string,
): Promise<ValidPreparationInstrument> {
  return new Promise(async function (resolve, reject) {
    const response = await client.get<APIResponse<ValidPreparationInstrument>>(
      format(backendRoutes.VALID_PREPARATION_INSTRUMENT, validPreparationInstrumentID),
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function validPreparationInstrumentsForPreparationID(
  client: Axios,
  validPreparationID: string,
): Promise<AxiosResponse<QueryFilteredResult<ValidPreparationInstrument>>> {
  const searchURL = format(backendRoutes.VALID_PREPARATION_INSTRUMENTS_SEARCH_BY_PREPARATION_ID, validPreparationID);
  return client.get<QueryFilteredResult<ValidPreparationInstrument>>(searchURL);
}

export async function validPreparationInstrumentsForInstrumentID(
  client: Axios,
  validInstrumentID: string,
): Promise<AxiosResponse<QueryFilteredResult<ValidPreparationInstrument>>> {
  const searchURL = format(backendRoutes.VALID_PREPARATION_INSTRUMENTS_SEARCH_BY_PREPARATION_ID, validInstrumentID);
  return client.get<QueryFilteredResult<ValidPreparationInstrument>>(searchURL);
}

export async function createValidPreparationInstrument(
  client: Axios,
  input: ValidPreparationInstrumentCreationRequestInput,
): Promise<ValidPreparationInstrument> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<ValidPreparationInstrument>>(
      backendRoutes.VALID_PREPARATION_INSTRUMENTS,
      input,
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function deleteValidPreparationInstrument(
  client: Axios,
  validPreparationInstrumentID: string,
): Promise<AxiosResponse> {
  return client.delete(format(backendRoutes.VALID_PREPARATION_INSTRUMENT, validPreparationInstrumentID));
}
