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

type Builder<State> = <Params extends BaseObject>(
  config: EndpointConfig<State, Params>
) => EndpointConfig<State, Params>;

export function buildEndpointBuilder<State extends BaseObject>(): Builder<State> {
  const buildEndpoint = <Params extends BaseObject>(
    config: EndpointConfig<State, Params>
  ): EndpointConfig<State, Params> => config;
  return buildEndpoint;
}

function buildOne<T extends EndpointConfig>(config: T): ApiMethodMap<T> {
  return Object.keys(Method).reduce(
    (all, methodName) => ({
      ...all,
      [methodName]: buildDispatcher<typeof config>(methodName as MethodName, config),
    }),
    {} as ApiMethodMap<typeof config>
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
