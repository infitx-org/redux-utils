import buildApis, { buildOne } from './build';
import { EndpointConfig } from './types';

interface State {
  svcUrl: string;
  mock: boolean;
}

const services = {
  jsonplaceholder: {
    baseUrl: (state: State) => state.svcUrl,
    mock: (state: State) => state.mock,
  },
};

type EnvIdType = { environmentId: string };
type UserIdType = { userId: string };

const environment: EndpointConfig<State, EnvIdType> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}`,
};

const environmentUsers: EndpointConfig<State, EnvIdType> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}/users`,
};

const environmentUser: EndpointConfig<State, EnvIdType & UserIdType> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId, userId }) => `/environments/${environmentId}/users/${userId}`,
};

const environmentServiceAccounts: EndpointConfig<State, EnvIdType> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}/serviceAccounts`,
};

const endpoints = {
  environment,
  environmentUsers,
  environmentUser,
  environmentServiceAccounts,
};

const api = buildApis<typeof endpoints>(endpoints);

api.environment.delete({ environmentId: 'e', body: {} });
api.environmentUser.read({ environmentId: '3', userId: '2' });

const x = buildOne(environment);
x.create();

export default api;
