type KeysOfTypeOfEnum<TEnumType> = keyof TEnumType;

export enum Method {
  read = 'get',
  create = 'post',
  update = 'put',
  delete = 'delete',
  modify = 'patch',
}

export type MethodName = KeysOfTypeOfEnum<typeof Method>;

export type BaseObject = Record<string, unknown>;

export type UrlConfig<State extends BaseObject = any, Params extends BaseObject = any> = (
  state: State,
  data: Params
) => string;

interface Service<State extends BaseObject, Params extends BaseObject> {
  baseUrl: UrlConfig<State, Params>;
  mock?: (state: State) => boolean;
}

export type Response = {
  status: number;
  data: unknown;
};

type MockDelay = number;
export type MockCall = (data: BaseObject) => Response;
export type CompositeMock = {
  call: MockCall;
  delay: MockDelay;
};

type MockConfig = Record<MethodName, MockCall | CompositeMock>;

export interface EndpointConfig<State extends BaseObject = any, Params extends BaseObject = any> {
  service: Service<State, Params>;
  url: UrlConfig<State, Params>;
  transformResponse?: (data: unknown) => unknown;
  mock?: Partial<MockConfig>;
}

export type Endpoints = Record<string, EndpointConfig>;

type ExtractTypeFromEndpointConfig<C> = C extends EndpointConfig<infer State, infer Params>
  ? [State, Params]
  : never;
export type ExtractState<C> = ExtractTypeFromEndpointConfig<C>[0];
export type ExtractParams<C> = ExtractTypeFromEndpointConfig<C>[1];

export type ApiMethodMap<Params = ExtractParams<EndpointConfig>> = Record<
  MethodName,
  (params: Params) => Generator
>;

type X = keyof Endpoints;
export type Api<T extends Endpoints> = Record<keyof T, ApiMethodMap<ExtractParams<T[keyof T]>>>;
