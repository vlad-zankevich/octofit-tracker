import { useEffect, useState } from 'react';

type ApiDataState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export function useApiData<T>(load: () => Promise<T>): ApiDataState<T> {
  const [state, setState] = useState<ApiDataState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    load()
      .then((data) => {
        if (active) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Unexpected error';
        setState({ status: 'error', message });
      });

    return () => {
      active = false;
    };
  }, [load]);

  return state;
}
