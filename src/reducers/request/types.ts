export type ErrorType = string | number;

export interface StateConfig<T> {
  clearData: boolean;
  clearError: boolean;
  initialData: T;
}

export interface InitializedState<T, M> {
  config: StateConfig<T | undefined>;
  initialized: false;
  pending: false;
  error: undefined;
  data: T | undefined;
  meta: M | undefined;
}

export interface PendingState<T, M> {
  config: StateConfig<T | undefined>;
  initialized: true;
  pending: true;
  error: ErrorType | undefined;
  data: T | undefined;
  meta: M;
}

export interface SuccessState<T, M> {
  config: StateConfig<T | undefined>;
  initialized: true;
  pending: false;
  error: undefined;
  data: T;
  meta: M;
}

export interface ErrorState<T, M> {
  config: StateConfig<T | undefined>;
  initialized: true;
  pending: false;
  error: ErrorType;
  data: T | undefined;
  meta: M;
}

export type RequestState<T = unknown, M = unknown> =
  | InitializedState<T, M>
  | PendingState<T, M>
  | SuccessState<T, M>
  | ErrorState<T, M>;

type DataAndMeta<R> = R extends RequestState<infer T, infer M> ? [T, M] : never;

export type ExtractData<R> = DataAndMeta<R>[0];
export type ExtractMeta<R> = DataAndMeta<R>[1];
