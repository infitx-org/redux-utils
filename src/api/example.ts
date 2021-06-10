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

type EE = { environmentId: string };
type AA = { environmentId: string };

// const fixed: EndpointConfig<State> = {
//   service: services.jsonplaceholder,
//   url: (_, { environmentId }) => `/environments/${environmentId}`,
// };

const environment: EndpointConfig<State, AA> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}`,
};

const environmentUsers: EndpointConfig<State, EE> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}/users`,
};

const environmentServiceAccounts: EndpointConfig<State, EE> = {
  service: services.jsonplaceholder,
  url: (_, { environmentId }) => `/environments/${environmentId}/serviceAccounts`,
};

const endpoints = {
  // fixed,
  environment,
  environmentUsers,
  environmentServiceAccounts,
};

const api = buildApis<typeof endpoints>(endpoints);

api.environment.delete({ environmentId: 'e', body: {} });

const x = buildOne(environment);
x.create();

export default api;
