import hash from 'object-hash';
import { combineReducers, Reducer, Store, StoreCreator, AnyAction } from 'redux';
import {
  Saga,
  SagaRunner,
  SagaInjector,
  ReducerMap,
  ReducerInjector,
  InjectableStore,
} from './types';

function createSagaInjector(runSaga: SagaRunner, rootSaga: Saga): SagaInjector {
  // Create a dictionary to keep track of injected sagas
  const injectedSagas = new Map();

  function sagaInjector(key: string, saga: Saga) {
    // We won't run saga if it is already injected
    // Sagas return task when they executed, which can be used to cancel them
    // Save the task if we want to cancel it in the future
    if (injectedSagas.has(key)) {
      return;
    }
    const task = runSaga(saga);
    injectedSagas.set(key, task);
  }

  // Inject the root saga as it a staticlly loaded file,
  sagaInjector('root', rootSaga);

  return sagaInjector;
}

function createReducerInjector(
  replaceReducer: (reducer: Reducer) => void,
  reducers: ReducerMap
): ReducerInjector {
  const asyncReducers: ReducerMap = {};

  return function reducerInjector(asyncReducer: Reducer): string {
    const hashValue = hash(asyncReducer(undefined, {} as AnyAction));

    // do not replace reducer if already mounted
    if (!(hashValue in asyncReducers)) {
      // save new reducer
      Object.assign(asyncReducers, { [hashValue]: asyncReducer });

      replaceReducer(
        combineReducers({
          ...reducers,
          ...asyncReducers,
        })
      );
    }

    return hashValue;
  };
}

function createInjectors(injectSaga: SagaInjector, injectReducer: ReducerInjector) {
  return function inject(asyncReducer: Reducer, asyncSaga: Saga): string {
    // create unique hash for store
    const hashValue = injectReducer(asyncReducer);

    if (asyncSaga) {
      // let's run the child app sagas by using the same unique hashValue
      injectSaga(hashValue, asyncSaga);
    }

    return hashValue;
  };
}

function addInjectors(
  store: Store,
  reducers: ReducerMap,
  sagaRunner: SagaRunner,
  rootSaga: Saga
): InjectableStore {
  // Create injectors
  const sagaInjector = createSagaInjector(sagaRunner, rootSaga);
  const reducerInjector = createReducerInjector(store.replaceReducer, reducers);

  // Create inject function to expose on store object
  const injector = createInjectors(sagaInjector, reducerInjector);

  return {
    ...store,
    inject: ({ reducer, saga }: { reducer: Reducer; saga: Saga }) => {
      const path = injector(reducer, saga);
      return {
        ...store,
        getState: () => store.getState()[path],
      };
    },
  };
}

// Creates the composer
function applyInjectors({
  staticReducers,
  sagaRunner,
  rootSaga,
}: {
  staticReducers: ReducerMap;
  sagaRunner: SagaRunner;
  rootSaga: Saga;
}) {
  return (createStore: StoreCreator) => {
    return function injectStoreCreator(
      reducerFn: Reducer,
      preloadedState: ReturnType<Reducer>
    ): InjectableStore {
      const store = createStore(reducerFn, preloadedState);
      return addInjectors(store, staticReducers, sagaRunner, rootSaga);
    };
  };
}

export { addInjectors };
export default applyInjectors;
