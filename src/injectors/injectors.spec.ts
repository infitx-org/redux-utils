import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { addInjectors } from './applyInjectors';

describe('creates an injectable store', () => {
  const testReducer = () => ({});
  const testSaga = function* testSaga() {
    yield 1;
  };
  const sagaMiddleware = createSagaMiddleware({});
  const composedEnhancers = compose(applyMiddleware(sagaMiddleware));
  const store = createStore(testReducer, undefined, composedEnhancers);

  it('Adds the injectors', () => {
    const injectableStore = addInjectors(store, { testReducer }, sagaMiddleware.run, testSaga);

    expect(injectableStore.inject).toBeDefined();
    expect(typeof injectableStore.inject).toBe('function');

    injectableStore.inject({ reducer: testReducer, saga: testSaga });
  });
});
