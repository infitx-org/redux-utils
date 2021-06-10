import axios from 'axios';
import { runSaga } from 'redux-saga';
import { EndpointConfig, Endpoints, Method } from './types';
import buildApis from './build';

jest.mock('axios');

const testState = {
  name: 'nameProperty',
  lastName: 'lastnameProperty',
};

type State = typeof testState;

const testService = {
  baseUrl: 'https://test.com',
};

const testStaticEndpoint: EndpointConfig<State> = {
  service: testService,
  url: () => '/todos/1',
};

const testDynamicEndpoint: EndpointConfig<State, { id: string }> = {
  service: testService,
  url: (state, { id }) => `/todos/${id}`,
};

async function runSagaWithArgs(api, state = {}, data = {}) {
  const dispatched = [];
  await runSaga(
    {
      dispatch: (action) => dispatched.push(action),
      getState: () => null,
    },
    api,
    state,
    data
  ).toPromise();

  return dispatched;
}

describe('tests the api object is built correctly', () => {
  it('build the object with the endpoint names passed in', () => {
    const endpoints = {
      todo: testStaticEndpoint,
      other: testStaticEndpoint,
    };
    const apis = buildApis<typeof endpoints>(endpoints);
    expect(apis.todo).toBeInstanceOf(Object);
    expect(apis.other).toBeInstanceOf(Object);
    expect(Object.keys(apis)).toHaveLength(2);
  });

  it('each key in the api object has the method names as functions', () => {
    const endpoints = {
      todo: testStaticEndpoint,
    };
    const apis = buildApis<typeof endpoints>(endpoints);

    Object.keys(Method).forEach((method) => {
      expect(apis.todo[method]).toBeInstanceOf(Function);
    });
  });
});

describe('test the generator', () => {
  beforeEach(() => {
    axios.mockReset();
    axios.mockImplementationOnce(() => Promise.resolve({ test: null }));
  });

  it('should test the whole saga', async () => {
    const todo: EndpointConfig<string> = {
      service: testService,
      url: () => '/todos/1',
    };
    const endpoints: Endpoints = {
      todo,
    };

    const apis = buildApis(endpoints);
    await runSagaWithArgs(apis.todo.read);

    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://test.com/todos/1',
      data: undefined,
      params: undefined,
      validateStatus: expect.any(Function),
    });
  });

  it('should build the static url', async () => {
    const todo: EndpointConfig<string> = {
      service: testService,
      url: () => '/todos/1',
    };
    const endpoints: Endpoints = {
      todo,
    };

    const apis = buildApis(endpoints);

    await runSagaWithArgs(apis.todo.read);
    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://test.com/todos/1',
      data: undefined,
      params: undefined,
      validateStatus: expect.any(Function),
    });
  });

  it('should compose the correct url', async () => {
    const todo: EndpointConfig<string> = {
      service: testService,
      url: (_, { id }) => `/todos/${id}`,
    };
    const endpoints: Endpoints = {
      todo,
    };

    const apis = buildApis(endpoints);
    await runSagaWithArgs(apis.todo.read, { id: 12 });

    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://test.com/todos/12',
      data: undefined,
      params: undefined,
      validateStatus: expect.any(Function),
    });
  });
});
