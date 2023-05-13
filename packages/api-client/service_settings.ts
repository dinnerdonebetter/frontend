import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ServiceSettingCreationRequestInput,
  ServiceSetting,
  QueryFilter,
  ServiceSettingUpdateRequestInput,
  QueryFilteredResult,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createServiceSetting(
  client: Axios,
  input: ServiceSettingCreationRequestInput,
): Promise<AxiosResponse<ServiceSetting>> {
  return client.post<ServiceSetting>(backendRoutes.SERVICE_SETTINGS, input);
}

export async function getServiceSetting(
  client: Axios,
  serviceSettingID: string,
): Promise<AxiosResponse<ServiceSetting>> {
  return client.get<ServiceSetting>(format(backendRoutes.SERVICE_SETTING, serviceSettingID));
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
