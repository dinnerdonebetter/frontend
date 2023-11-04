import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidInstrumentCreationRequestInput,
  ValidInstrument,
  QueryFilter,
  ValidInstrumentUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidInstrument(
  client: Axios,
  input: ValidInstrumentCreationRequestInput,
): Promise<ValidInstrument> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<ValidInstrument>>(backendRoutes.VALID_INSTRUMENTS, input);

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getValidInstrument(client: Axios, validInstrumentID: string): Promise<ValidInstrument> {
  return new Promise(async function (resolve, reject) {
    const response = await client.get<APIResponse<ValidInstrument>>(
      format(backendRoutes.VALID_INSTRUMENT, validInstrumentID),
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getValidInstruments(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidInstrument>>> {
  return client.get<QueryFilteredResult<ValidInstrument>>(backendRoutes.VALID_INSTRUMENTS, {
    params: filter.asRecord(),
  });
}

export async function updateValidInstrument(
  client: Axios,
  validInstrumentID: string,
  input: ValidInstrumentUpdateRequestInput,
): Promise<AxiosResponse<ValidInstrument>> {
  return client.put<ValidInstrument>(format(backendRoutes.VALID_INSTRUMENT, validInstrumentID), input);
}

export async function deleteValidInstrument(
  client: Axios,
  validInstrumentID: string,
): Promise<AxiosResponse<ValidInstrument>> {
  return client.delete(format(backendRoutes.VALID_INSTRUMENT, validInstrumentID));
}

export async function searchForValidInstruments(
  client: Axios,
  query: string,
): Promise<AxiosResponse<ValidInstrument[]>> {
  const searchURL = `${backendRoutes.VALID_INSTRUMENTS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<ValidInstrument[]>(searchURL);
}
