import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ServiceSettingCreationRequestInput,
  ServiceSetting,
  QueryFilter,
  ServiceSettingUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createServiceSetting(
  client: Axios,
  input: ServiceSettingCreationRequestInput,
): Promise<ServiceSetting> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<ServiceSetting>>(backendRoutes.SERVICE_SETTINGS, input);

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getServiceSetting(client: Axios, serviceSettingID: string): Promise<ServiceSetting> {
  return new Promise(async function (resolve, reject) {
    const response = await client.get<APIResponse<ServiceSetting>>(
      format(backendRoutes.SERVICE_SETTING, serviceSettingID),
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getServiceSettings(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ServiceSetting>>> {
  return client.get<QueryFilteredResult<ServiceSetting>>(backendRoutes.SERVICE_SETTINGS, {
    params: filter.asRecord(),
  });
}

export async function updateServiceSetting(
  client: Axios,
  serviceSettingID: string,
  input: ServiceSettingUpdateRequestInput,
): Promise<AxiosResponse<ServiceSetting>> {
  return client.put<ServiceSetting>(format(backendRoutes.SERVICE_SETTING, serviceSettingID), input);
}

export async function deleteServiceSetting(
  client: Axios,
  serviceSettingID: string,
): Promise<AxiosResponse<ServiceSetting>> {
  return client.delete(format(backendRoutes.SERVICE_SETTING, serviceSettingID));
}

export async function searchForServiceSettings(client: Axios, query: string): Promise<AxiosResponse<ServiceSetting[]>> {
  const searchURL = `${backendRoutes.SERVICE_SETTINGS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<ServiceSetting[]>(searchURL);
}
