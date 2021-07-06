import { RequestStateConfig, StateConfig, RequestState, ExtractMeta, ExtractData } from './types';

function buildConfig<T>(config?: Partial<RequestStateConfig>, initialData?: T): StateConfig<T> {
  return {
    clearData: false,
    clearError: false,
    ...config,
    initialData,
  };
}

export default function requestState<T = unknown, M = undefined>(
  initialData?: T,
  config?: Partial<RequestStateConfig>
): RequestState<T, M> {
  return {
    config: buildConfig<T>(config, initialData),
    data: initialData,
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
): RequestState<ExtractData<S>, ExtractMeta<S>> {
  return {
    config: state.config,
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
    error: undefined,
    data,
    pending: false,
    meta: state.meta,
  };
};

requestState.failed = function setRequestStateError<S extends RequestState>(
  state: S,
  error: string | number
): RequestState<ExtractData<S>, ExtractMeta<S>> {
  return {
    config: state.config,
    data: setDataByConfig(state),
    pending: false,
    error,
    meta: state.meta,
  };
};
