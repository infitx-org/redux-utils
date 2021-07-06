import { RequestState } from './types';
import requestState from './reducer';

interface State {
  obj: RequestState<null, string>;
}

describe('tests the requests reducer', () => {
  it('build the correct structure', () => {
    const request = requestState();

    expect(request).toHaveProperty('config');
    expect(request).toHaveProperty('data');
    expect(request).toHaveProperty('error');
    expect(request).toHaveProperty('pending');
    expect(request).toHaveProperty('meta');
  });
});

describe('tests the initialization', () => {
  it('initializes with correct key values', () => {
    const state: State = {
      obj: requestState(),
    };

    expect(state.obj.config.clearData).toBe(false);
    expect(state.obj.config.clearError).toBe(false);
    expect(state.obj.config.initialData).toBe(undefined);

    expect(state.obj.data).toBe(undefined);
    expect(state.obj.error).toBe(undefined);
    expect(state.obj.pending).toBe(false);
    expect(state.obj.meta).toBe(undefined);
  });

  it('initializes the data with the specified type', () => {
    const obj = requestState<null>(null);
    expect(obj.data).toBe(null);
  });

  it('initializes the data with undefined when not set', () => {
    const obj = requestState<null>();
    expect(obj.data).toBe(undefined);
  });

  it('initialzes the data with an empty collection', () => {
    const obj = requestState<number[]>([]);
    expect(obj.data).toStrictEqual([]);
  });
});

describe('tests the "request" method', () => {
  it('set the pending', () => {
    const obj = requestState();
    const result = requestState.request(obj);

    expect(result.pending).toBe(true);
  });

  it('sets the meta it passed by', () => {
    const obj = requestState<undefined, string>();
    const result = requestState.request(obj, 'meta');

    expect(result.meta).toBe('meta');
  });

  it('does not clear the data by default', () => {
    const obj = requestState<string>('initialValue');
    obj.data = 'changedValue';
    const result = requestState.request(obj);

    expect(result.data).toBe('changedValue');
  });

  it('clears the data if set in config', () => {
    const obj = requestState<string>('initialValue', { clearData: true });
    obj.data = 'changedValue';
    const result = requestState.request(obj);

    expect(result.data).toBe('initialValue');
  });

  it('does not clear the error by default', () => {
    const obj = requestState();
    obj.error = 'error';
    const result = requestState.request(obj);

    expect(result.error).toBe('error');
  });

  it('clears the error if set in config', () => {
    const obj = requestState(undefined, { clearError: true });
    obj.error = 'error';
    const result = requestState.request(obj);

    expect(result.error).toBe(undefined);
  });
});
