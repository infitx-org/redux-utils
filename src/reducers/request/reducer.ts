import { StateConfig, RequestState, PendingState, ExtractMeta, ExtractData } from './types';

function buildConfig<T>(config?: Partial<StateConfig<T>>): StateConfig<T> {
  return {
    clearData: false,
    clearError: false,
    initialData: (undefined as unknown) as T,
    ...config,
  };
}

export default function requestState<T = unknown, M = unknown>(
  config?: Partial<StateConfig<T>>
): RequestState<T, M> {
  return {
    config: buildConfig<T>(config),
    initialized: false,
    data: config?.initialData,
    pending: false,
    error: undefined,
    meta: undefined,
  };
}

function setDataByConfig(state: RequestState) {
  return state.config.clearData ? state.config.initialData : state.data;
}

function setErrorByConfig(state: RequestState) {
  return state.config.clearError ? undefined : state.error;
}

requestState.request = function setRequestStatePending<S extends RequestState>(
  state: S,
  meta?: ExtractMeta<S>
): PendingState<ExtractData<S>, ExtractMeta<S>> {
  return {
    config: state.config,
    initialized: true,
    data: setDataByConfig(state),
    pending: true,
    error: setErrorByConfig(state),
    meta,
  };
};

requestState.succeeded = function setRequestStateSuccess<S extends RequestState>(
  state: S,
  data: ExtractData<S>
): RequestState<ExtractData<S>, ExtractMeta<S>> {
  return {
    config: state.config,
    initialized: true,
    data,
    pending: false,
    error: undefined,
    meta: state.meta,
  };
};

requestState.failed = function setRequestStateError<S extends RequestState>(
  state: S,
  error: string | number
): RequestState<ExtractData<S>, ExtractMeta<S>> {
  return {
    config: state.config,
    initialized: true,
    data: setDataByConfig(state),
    pending: false,
    error,
    meta: state.meta,
  };
};
