import { Reducer, Store } from 'redux';
import { Saga, Task } from '@redux-saga/types';

export type SagaRunner = (Saga: Saga) => Task;
export type SagaInjector = (key: string, saga: Saga) => void;
export type ReducerMap = Record<string, Reducer>;
export type ReducerInjector = (asyncReducer: Reducer) => string;
export type InjectReducerAndSaga = ({ reducer, saga }: { reducer: Reducer; saga: Saga }) => Store;
export interface StoreInjectors {
  inject: InjectReducerAndSaga;
}
export type InjectableStore = Store & StoreInjectors;
export { Saga };
