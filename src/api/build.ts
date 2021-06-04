import axios, { AxiosResponse } from 'axios';
import sleep from '@modusbox/ts-utils/lib/async/sleep';
import { call, select } from 'redux-saga/effects';
import {
  Api,
  ApiMethodMap,
  UrlConfig,
  BaseObject,
  EndpointConfig,
  Endpoints,
  MethodName,
  Method,
  MockCall,
  CompositeMock,
  Dispatcher,
} from './types';

function getUrl<State>(
  baseUrl: UrlConfig<State>,
  state: State,
  data: BaseObject,
  urlFn?: UrlConfig<State>
) {
  const appUrl = typeof baseUrl === 'function' ? baseUrl(state, data) : baseUrl;
  const endpointUrl = typeof urlFn === 'function' ? urlFn(state, data) : urlFn;
  return `${appUrl}${endpointUrl}`;
}

function isMockCall(mockConfig: MockCall | CompositeMock): mockConfig is MockCall {
  return typeof mockConfig === 'function';
}

function buildDispatcher<State>(
  methodName: MethodName,
  config: EndpointConfig
): () => Dispatcher<State> {
  return function* dispatcher(data: BaseObject = {}): Dispatcher<State> {
    const state: State = yield select();

    const { url: rurl, transformResponse } = config;
    const method = Method[methodName];
    const url = getUrl<State>(config.service.baseUrl, state, data, rurl);

    if (config.service.mock?.(state)) {
      const mockConfig = config.mock?.[methodName];
      if (mockConfig) {
        let mockFn;
        let delay = 200;
        if (isMockCall(mockConfig)) {
          mockFn = mockConfig;
        } else {
          mockFn = mockConfig.call;
          delay = mockConfig.delay;
        }

        // simulate delay
        yield call(sleep, delay);

        return mockFn(data);
      }
    }

    const response: AxiosResponse<unknown> = yield axios({
      method,
      url,
      params: data.params,
      data: data.body,
      validateStatus: () => true,
    });
    const transformedReponse = transformResponse ? transformResponse(response.data) : response.data;

    return { status: response.status, data: transformedReponse };
  };
}

function buildApis<State, T extends Endpoints>(endpoints: T): Api<T> {
  return Object.entries(endpoints).reduce(function redd(prev, [name, config]) {
    return {
      ...prev,
      [name as keyof T]: Object.keys(Method).reduce(
        (all, methodName) => ({
          ...all,
          [methodName]: buildDispatcher<State>(methodName as MethodName, config),
        }),
        {} as ApiMethodMap
      ),
    };
  }, {} as Api<T>);
}

export { buildApis };
