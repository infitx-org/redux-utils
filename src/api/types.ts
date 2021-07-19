import { AxiosPromise, AxiosResponse } from 'axios';
import { SelectEffect, CallEffect } from 'redux-saga/effects';

type KeysOfTypeOfEnum<TEnumType> = keyof TEnumType;

export type BaseObject = Record<string, unknown>;

export enum Method {
  read = 'get',
  create = 'post',
  update = 'put',
  delete = 'delete',
  modify = 'patch',
}

export type MethodName = KeysOfTypeOfEnum<typeof Method>;

export type Response = {
  status: number;
  data: unknown;
};

export type HttpConfig = {
  body?: unknown;
  params?: unknown;
};

export type Dispatcher<State = unknown> = Generator<
  State | SelectEffect | CallEffect | AxiosPromise,
  Response,
  BaseObject & State & AxiosResponse
>;

export type UrlConfig<State = unknown, Params = unknown> =
  | string
  | ((state: State, data: Params) => string);

interface Service<State> {
  baseUrl: string | ((state: State) => string);
  mock?: (state: State) => boolean;
}

// Mocking configuration
export type MockCall<Params = unknown> = (data: Params) => Response | Promise<Response>;

export type CompositeMock<Params = unknown> = {
  call: MockCall<Params>;
  delay: number;
};

type MockConfig<Params = unknown> = Record<MethodName, MockCall<Params> | CompositeMock<Params>>;

// Endpoints configuration
// eslint-disable-next-line
export interface EndpointConfig<State = any, Params = any> {
  service: Service<State>;
  url: UrlConfig<State, Params>;
  transformResponse?: (data: unknown) => unknown;
  mock?: Partial<MockConfig<Params>>;
}

export type Endpoints = Record<string, EndpointConfig>;

// This helps us to extract from a given type
type StateAndParams<C> = C extends EndpointConfig<infer State, infer Params>
  ? [State, Params]
  : never;

// Api object configuration
export type ExtractState<C> = StateAndParams<C>[0];
export type ExtractParams<C> = StateAndParams<C>[1];

export type ApiMethodMap<T extends EndpointConfig> = Record<
  MethodName,
  (params: ExtractParams<T> & Partial<HttpConfig>) => Dispatcher<ExtractState<T>>
>;

export type Api<T extends Endpoints> = { [K in keyof T]: ApiMethodMap<T[K]> };
