import sleep from '@modusbox/ts-utils/lib/async/sleep';
import { Method, MockCall, CompositeMock, EndpointConfig, MethodName, BaseObject } from './types';

function isMockCall(mockConfig: MockCall | CompositeMock): mockConfig is MockCall {
  return typeof mockConfig === 'function';
}

export function getMock<State>(
  state: State,
  config: EndpointConfig,
  methodName: MethodName
): ((d: BaseObject) => Generator<Promise<true>, unknown, unknown>) | undefined {
  if (config.service.mock?.(state)) {
    const mockConfig = config.mock?.[methodName];
    if (mockConfig) {
      return function* mock(data: BaseObject) {
        const mockFn = isMockCall(mockConfig) ? mockConfig : mockConfig.call;
        const delay = isMockCall(mockConfig) ? 200 : mockConfig.delay;

        // simulate delay
        yield sleep(delay);
        return mockFn(data);
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
