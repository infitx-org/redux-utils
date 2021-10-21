import axios from 'axios';
import { select } from 'redux-saga/effects';
import {
  EndpointConfig,
  MethodName,
  Dispatcher,
  ExtractState,
  ExtractData,
  MakeResponse,
} from './types';
import * as utils from './utils';

export default function buildDispatcher<T extends EndpointConfig>(
  methodName: MethodName,
  config: T
): (d: Record<string, unknown>) => Dispatcher<ExtractState<T>, ExtractData<T>> {
  // get the state from the config so that
  // we don't need to specify when creating the api object
  type State = ExtractState<T>;
  type Data = ExtractData<T>;

  return function* dispatcher(data: Record<string, unknown> = {}) {
    const state: State = yield select();
    let response: MakeResponse<Data>;

    // Try and see if a mock fn is available
    const mock = utils.getMock<State>(state, config, methodName);
    if (typeof mock === 'function') {
      response = yield mock(data);
    } else {
      response = yield axios({
        method: utils.getMethod(methodName),
        url: utils.getUrl<State>(state, config, data),
        params: data.params,
        data: data.body,
        validateStatus: () => true,
        withCredentials: config.withCredentials,
      });
    }

    const transformedReponse: Data = config.transformResponse
      ? config.transformResponse(response.data)
      : response.data;

    return { status: response.status, data: transformedReponse };
  };
}
