import axios from 'axios';
import { runSaga } from 'redux-saga';
import { Method } from './types';
import buildApis, { buildEndpointBuilder } from './build';

jest.mock('axios');

// Define reusable test data

type State = typeof testState;
type Account = {
  name: string;
  age: number;
};

const testState = {
  name: 'nameProperty',
  lastName: 'lastnameProperty',
};

const testService = {
  baseUrl: 'https://test.com',
  mock: () => true,
};

const testStaticEndpoint = {
  service: testService,
  url: () => '/todos/1',
};

const testDynamicEndpoint = {
  service: testService,
  url: (state, { id }) => `/todos/${id}`,
};

// Runner
async function runSagaWithArgs(saga, data = {}) {
  const dispatched = [];
  return runSaga(
    {
      dispatch: (action) => dispatched.push(action),
      getState: () => testState,
    },
    saga,
    data
  ).toPromise();
}

describe('tests the api object is built correctly', () => {
  it('builds the endpoint builder', () => {
    const builder = buildEndpointBuilder<State>();
    expect(builder).toBeInstanceOf(Function);
  });

  it('the endpoint builder build an endpoint config', () => {
    const builder = buildEndpointBuilder<State>();
    const config = builder({
      service: testService,
      url: () => '/todos/1',
    });

    expect(config).toBeInstanceOf(Object);
    expect(config.service).toEqual(testService);
    expect(config.url).toBeInstanceOf(Function);
  });

  it('build the object with the endpoint names passed in', () => {
    const endpoints = {
      todo: testStaticEndpoint,
      other: testStaticEndpoint,
    };
    const apis = buildApis(endpoints);
    expect(apis.todo).toBeInstanceOf(Object);
    expect(apis.other).toBeInstanceOf(Object);
    expect(Object.keys(apis)).toHaveLength(2);
  });

  it('each key in the api object has the method names as functions', () => {
    const endpoints = {
      todo: testStaticEndpoint,
    };
    const apis = buildApis(endpoints);

    Object.keys(Method).forEach((method) => {
      expect(apis.todo[method]).toBeInstanceOf(Function);
    });
  });
});

describe('test the url is build correctly when saga runs', () => {
  const builder = buildEndpointBuilder<State>();

  beforeEach(() => {
    axios.mockReset();
    axios.mockImplementationOnce(() => Promise.resolve({ test: null }));
  });

  it('should build the static url', async () => {
    const apis = buildApis({
      todo: builder({
        service: testService,
        url: () => '/todos/1',
      }),
    });

    const result = await runSagaWithArgs(apis.todo.read);

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://test.com/todos/1',
      })
    );
  });

  it('should build the dynamic url with params', async () => {
    type Params = { id: string };

    const apis = buildApis({
      todo: builder<Params>({
        service: testService,
        url: (_, { id }) => `/todos/${id}`,
      }),
    });

    await runSagaWithArgs(apis.todo.read, { id: 12 });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://test.com/todos/12',
      })
    );
  });

  it('should build the dynamic url with state', async () => {
    const apis = buildApis({
      todo: builder<{ type: string }, Account>({
        service: testService,
        url: (state) => `/todos/${state.name}`,
      }),
    });

    await runSagaWithArgs(apis.todo.read);

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://test.com/todos/nameProperty',
      })
    );
  });
});

describe('test the mock functions', () => {
  const builder = buildEndpointBuilder<State>();

  beforeEach(() => {
    axios.mockReset();
    axios.mockImplementationOnce(() => Promise.resolve({ test: null }));
  });

  it('should use the mock function and not do any axios call', async () => {
    const apis = buildApis({
      todo: builder({
        service: testService,
        url: () => '/todos/1',
        mock: {
          read: {
            delay: 20,
            call: () => ({ status: 200, data: [] }),
          },
        },
      }),
    });

    await runSagaWithArgs(apis.todo.read, { id: '2' });
    expect(axios).not.toHaveBeenCalled();
  });

  it('should use the mock function in the abbreviated form', async () => {
    const apis = buildApis({
      todo: builder({
        service: testService,
        url: () => '/todos/1',
        mock: {
          read: () => ({ status: 200, data: [] }),
        },
      }),
    });

    await runSagaWithArgs(apis.todo.read, { id: '2' });

    expect(axios).not.toHaveBeenCalled();
  });

  it('should get the mock response', async () => {
    const apis = buildApis({
      todo: builder({
        service: testService,
        url: () => '/todos/1',
        mock: {
          read: {
            delay: 200,
            call: () => ({ status: 200, data: [] }),
          },
        },
      }),
    });

    const response = await runSagaWithArgs(apis.todo.read, { id: '2' });

    expect(response).toBeInstanceOf(Object);
    expect(response).toEqual({ status: 200, data: [] });
  });
});

// describe('saga yield call', () => {
//   it('just works', async () => {
//     const builder = buildEndpointBuilder<State>();

//     const apis = buildApis({
//       todoArgs: builder<{ a: string }>({
//         service: testService,
//         url: () => '/todos/1',
//         mock: {
//           read: {
//             delay: 200,
//             call: () => ({ status: 200, data: [] }),
//           },
//         },
//       }),
//       todo: builder({
//         service: testService,
//         url: () => '/todos/1',
//         mock: {
//           read: {
//             delay: 200,
//             call: () => ({ status: 200, data: [] }),
//           },
//         },
//       }),
//     });

//     // const response = await runSagaWithArgs(apis.todo.read, { id: '2' });

//     function* saga() {
//       yield call(apis.todo.read, {});
//       yield call(apis.todo.read, { body: '2' });

//       yield call(apis.todoArgs.read, { a: '2' });
//       yield call(apis.todoArgs.read, { body: '2' });
//       yield call(apis.todoArgs.read, { a: '2', body: '2' });
//     }
//   });
// });
