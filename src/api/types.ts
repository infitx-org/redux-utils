import { CallEffect, SelectEffect } from 'redux-saga/effects';
// import { Saga } from 'redux-saga';

export type BaseObject = Record<string, unknown>;

export enum Method {
  read = 'get',
  create = 'post',
  update = 'put',
  delete = 'delete',
  modify = 'patch',
}

export type MethodName = keyof typeof Method;

export type HttpConfig = {
  body?: unknown;
  params?: unknown;
};

export type MakeResponse<Data> = {
  status: number;
  data: Data;
};

export type Dispatcher<State = unknown, Data = unknown> = Generator<
  State | SelectEffect | CallEffect,
  MakeResponse<Data>,
  MakeResponse<Data>
>;

export type UrlConfig<State = unknown, Params = unknown> =
  | string
  | ((state: State, data: Params) => string);

interface Service<State> {
  baseUrl: string | ((state: State) => string);
  mock?: (state: State) => boolean;
}

// Mocking configuration
export type MockCall<Params = unknown, Data = unknown> = (
  data: Params
) => MakeResponse<Data> | Promise<MakeResponse<Data>>;

export type CompositeMock<Params = unknown, Data = unknown> = {
  call: MockCall<Params, Data>;
  delay: number;
};

type MockConfig<Params = unknown, Data = unknown> = Record<
  MethodName,
  MockCall<Params, Data> | CompositeMock<Params, Data>
>;

// Endpoints configuration
// eslint-disable-next-line
export interface EndpointConfig<State = any, Params = any, Data = any> {
  service: Service<State>;
  url: UrlConfig<State, Params>;
  transformResponse?: (data: Data) => unknown;
  mock?: Partial<MockConfig<Params, Data>>;
}

export type Endpoints = Record<string, EndpointConfig>;

// This helps us to extract from a given type
type ConfigTypes<C> = C extends EndpointConfig<infer State, infer Params, infer Data>
  ? [State, Params, Data]
  : never;

// Api object configuration
export type ExtractState<C> = ConfigTypes<C>[0];
export type ExtractParams<C> = ConfigTypes<C>[1];
export type ExtractData<C> = ConfigTypes<C>[2];

export type ApiMethodMap<T extends EndpointConfig> = Record<
  MethodName,
  // eslint-disable-next-line
  (...a: any[]) => MakeResponse<ExtractData<T>>
  // Saga<ExtractParams<T> & Partial<HttpConfig>>
  // (params: ExtractParams<T> & Partial<HttpConfig>) => Iterator<ExtractData<T>>
>;

export type Api<T extends Endpoints> = { [K in keyof T]: ApiMethodMap<T[K]> };
