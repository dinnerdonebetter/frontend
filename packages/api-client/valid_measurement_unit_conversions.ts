import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidMeasurementConversionCreationRequestInput,
  ValidMeasurementConversion,
  QueryFilter,
  ValidMeasurementConversionList,
  ValidMeasurementConversionUpdateRequestInput,
} from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function createValidMeasurementConversion(
  client: Axios,
  input: ValidMeasurementConversionCreationRequestInput,
): Promise<AxiosResponse<ValidMeasurementConversion>> {
  return client.post<ValidMeasurementConversion>(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSIONS, input);
}

export async function getValidMeasurementConversion(
  client: Axios,
  validMeasurementConversionID: string,
): Promise<AxiosResponse<ValidMeasurementConversion>> {
  return client.get<ValidMeasurementConversion>(
    format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSION, validMeasurementConversionID),
  );
}

export async function getValidMeasurementConversionsFromUnit(
  client: Axios,
  validMeasurementUnitID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidMeasurementConversion[]>> {
  return client.get<ValidMeasurementConversion[]>(
    format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSIONS_FROM_UNIT, validMeasurementUnitID),
    {
      params: filter.asRecord(),
    },
  );
}

export async function getValidMeasurementConversionsToUnit(
  client: Axios,
  validMeasurementUnitID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidMeasurementConversion[]>> {
  return client.get<ValidMeasurementConversion[]>(
    format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSIONS_TO_UNIT, validMeasurementUnitID),
    {
      params: filter.asRecord(),
    },
  );
}

export async function getValidMeasurementConversions(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidMeasurementConversionList>> {
  return client.get<ValidMeasurementConversionList>(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSIONS, {
    params: filter.asRecord(),
  });
}

export async function updateValidMeasurementConversion(
  client: Axios,
  validMeasurementConversionID: string,
  input: ValidMeasurementConversionUpdateRequestInput,
): Promise<AxiosResponse<ValidMeasurementConversion>> {
  return client.put<ValidMeasurementConversion>(
    format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSION, validMeasurementConversionID),
    input,
  );
}

export async function deleteValidMeasurementConversion(
  client: Axios,
  validMeasurementConversionID: string,
): Promise<AxiosResponse<ValidMeasurementConversion>> {
  return client.delete(format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSION, validMeasurementConversionID));
}
