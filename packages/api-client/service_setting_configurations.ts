import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ServiceSettingConfigurationCreationRequestInput,
  ServiceSettingConfiguration,
  ServiceSettingConfigurationUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createServiceSettingConfiguration(
  client: Axios,
  input: ServiceSettingConfigurationCreationRequestInput,
): Promise<AxiosResponse<APIResponse<ServiceSettingConfiguration>>> {
  return client.post<APIResponse<ServiceSettingConfiguration>>(backendRoutes.SERVICE_SETTINGS, input);
}

export async function getServiceSettingConfigurationsForUser(
  client: Axios,
): Promise<AxiosResponse<QueryFilteredResult<ServiceSettingConfiguration>>> {
  return client.get<QueryFilteredResult<ServiceSettingConfiguration>>(
    backendRoutes.SERVICE_SETTING_CONFIGURATIONS_FOR_USER,
  );
}

export async function getServiceSettingConfigurationsForHousehold(
  client: Axios,
): Promise<AxiosResponse<QueryFilteredResult<ServiceSettingConfiguration>>> {
  return client.get<QueryFilteredResult<ServiceSettingConfiguration>>(
    backendRoutes.SERVICE_SETTING_CONFIGURATIONS_FOR_HOUSEHOLD,
  );
}

export async function updateServiceSettingConfiguration(
  client: Axios,
  serviceSettingConfigurationID: string,
  input: ServiceSettingConfigurationUpdateRequestInput,
): Promise<AxiosResponse<APIResponse<ServiceSettingConfiguration>>> {
  return client.put<APIResponse<ServiceSettingConfiguration>>(
    format(backendRoutes.SERVICE_SETTING_CONFIGURATION, serviceSettingConfigurationID),
    input,
  );
}

export async function deleteServiceSettingConfiguration(
  client: Axios,
  serviceSettingConfigurationID: string,
): Promise<AxiosResponse<APIResponse<ServiceSettingConfiguration>>> {
  return client.delete(format(backendRoutes.SERVICE_SETTING_CONFIGURATION, serviceSettingConfigurationID));
}
