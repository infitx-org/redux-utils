import buildApis, { buildEndpointBuilder } from './build';

type State = {
  svcUrl: string;
  mock: boolean;
};

const services = {
  jsonplaceholder: {
    baseUrl: (state: State) => state.svcUrl,
    mock: (state: State) => state.mock,
  },
};

type EnvIdType = { environmentId: string };
type UserIdType = { userId: string };

const buildEndpoint = buildEndpointBuilder<State>();

const endpoints = {
  environment: buildEndpoint<EnvIdType>({
    service: services.jsonplaceholder,
    url: (_, { environmentId }) => `/environments/${environmentId}`,
  }),
  environmentUsers: buildEndpoint<EnvIdType>({
    service: services.jsonplaceholder,
    url: (_, { environmentId }) => `/environments/${environmentId}/users`,
  }),
  environmentUser: buildEndpoint<EnvIdType & UserIdType>({
    service: services.jsonplaceholder,
    url: (_, { environmentId, userId }) => `/environments/${environmentId}/users/${userId}`,
  }),
  environmentServiceAccounts: buildEndpoint<EnvIdType>({
    service: services.jsonplaceholder,
    url: (_, { environmentId }) => `/environments/${environmentId}/serviceAccounts`,
  }),
};

const api = buildApis(endpoints);

api.environment.delete({ environmentId: 'e', body: {} });
api.environmentUser.read({ environmentId: '3', userId: '2' });

export default api;
