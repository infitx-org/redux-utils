import {
  Api,
  ApiMethodMap,
  Endpoints,
  EndpointConfig,
  MethodName,
  Method,
  BaseObject,
} from './types';
import buildDispatcher from './dispatcher';

type Builder<State> = <Params extends BaseObject, Data extends unknown = unknown>(
  config: EndpointConfig<State, Params, Data>
) => EndpointConfig<State, Params, Data>;

export function buildEndpointBuilder<State extends unknown>(): Builder<State> {
  const buildEndpoint = <Params extends BaseObject, Data extends unknown>(
    config: EndpointConfig<State, Params, Data>
  ): EndpointConfig<State, Params, Data> => config;
  return buildEndpoint;
}

function buildOne<T extends EndpointConfig>(config: T): ApiMethodMap<T> {
  return Object.keys(Method).reduce(
    (all, methodName) => ({
      ...all,
      [methodName]: buildDispatcher<T>(methodName as MethodName, config),
    }),
    {} as ApiMethodMap<T>
  );
}

export default function buildApis<T extends Endpoints>(endpoints: T): Api<T> {
  return Object.entries(endpoints).reduce(function redd(prev, [name, config]) {
    return {
      ...prev,
      [name as keyof T]: buildOne(config),
    };
  }, {} as Api<T>);
}
