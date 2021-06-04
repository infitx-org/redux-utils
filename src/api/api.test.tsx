import axios from 'axios';
import { runSaga } from 'redux-saga';
import { buildApis } from './index';
import { Config, Endpoints } from './types';

jest.mock('axios');

const services = {
  testSvc: {
    baseUrl: 'https://test.com',
  },
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

test('should build the config', () => {
  const todo: Config<string> = {
    service: services.testSvc,
    url: () => '/todos/1',
  };

  const endpoints: Endpoints = {
    todo,
  };

  const apis = buildApis(endpoints);
  expect(apis.todo.read).toBeInstanceOf(Function);
});

describe('test the generator', () => {
  beforeEach(() => {
    axios.mockReset();
    axios.mockImplementationOnce(() => Promise.resolve({ test: null }));
  });

  test('should test the whole saga', async () => {
    const todo: Config<string> = {
      service: services.testSvc,
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

  test('should build the static url', async () => {
    const todo: Config<string> = {
      service: services.testSvc,
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

  test('should compose the correct url', async () => {
    const todo: Config<string> = {
      service: services.testSvc,
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
