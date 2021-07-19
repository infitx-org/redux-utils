import sleep from '@modusbox/ts-utils/lib/async/sleep';
import {
  Method,
  MockCall,
  CompositeMock,
  EndpointConfig,
  MethodName,
  BaseObject,
  Response,
} from './types';

function isMockCall(mockConfig: MockCall | CompositeMock): mockConfig is MockCall {
  return typeof mockConfig === 'function';
}

export function getMock<State>(
  state: State,
  config: EndpointConfig,
  methodName: MethodName
):
  | ((d: BaseObject) => Generator<Promise<true> | Response | Promise<Response>, unknown, unknown>)
  | undefined {
  if (config.service.mock?.(state)) {
    const mockConfig = config.mock?.[methodName];
    if (mockConfig) {
      return function* mock(data: BaseObject) {
        const mockFn = isMockCall(mockConfig) ? mockConfig : mockConfig.call;
        const delay = isMockCall(mockConfig) ? 200 : mockConfig.delay;

        // simulate delay
        yield sleep(delay);
        const response = yield mockFn(data);
        return response;
      };
    }
  }
  return undefined;
}

// Simple convenience method to get an HTTP method
export function getMethod(name: MethodName): Method {
  return Method[name];
}

// Builds the urls
export function getUrl<State>(state: State, config: EndpointConfig, data: BaseObject): string {
  const {
    url,
    service: { baseUrl },
  } = config;
  const appUrl = typeof baseUrl === 'function' ? baseUrl(state) : baseUrl;
  const endpointUrl = typeof url === 'function' ? url(state, data) : url;
  return `${appUrl}${endpointUrl}`;
}
