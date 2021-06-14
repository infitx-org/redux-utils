import axios, { AxiosResponse } from 'axios';
import { call, select } from 'redux-saga/effects';
import { EndpointConfig, MethodName, Dispatcher, ExtractState } from './types';
import * as utils from './utils';

export default function buildDispatcher<T extends EndpointConfig>(
  methodName: MethodName,
  config: T
): () => Dispatcher {
  // get the state from the config so that
  // we don't need to specify when creating the api object
  type State = ExtractState<T>;

  return function* dispatcher(data: Record<string, unknown> = {}): Dispatcher<State> {
    const state: State = yield select();

    // Try and see if a mock fn is available
    const mock = utils.getMock<State>(state, config, methodName);
    if (typeof mock === 'function') {
      const response = yield call(mock, data);
      return response;
    }

    const response: AxiosResponse<unknown> = yield axios({
      method: utils.getMethod(methodName),
      url: utils.getUrl<State>(state, config, data),
      params: data.params,
      data: data.body,
      validateStatus: () => true,
    });
    const transformedReponse = config.transformResponse
      ? config.transformResponse(response.data)
      : response.data;

    return { status: response.status, data: transformedReponse };
  };
}
