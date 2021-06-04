import { buildApis } from './build';
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

type EE = { environmentId: string };
type EA = { environmentId: string };

const environment: EndpointConfig<State, EE> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}`,
};

const environmentUsers: EndpointConfig<State, EE> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}/users`,
};

const environmentServiceAccounts: EndpointConfig<State, EA> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}/serviceAccounts`,
};

const endpoints = {
  environment,
  environmentUsers,
  environmentServiceAccounts,
};

const api = buildApis<State, typeof endpoints>(endpoints);
api.environmentUsers.create({ environmentId: '2' });
export default api;
