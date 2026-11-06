import { useEffect, useState } from 'react';

interface LoadState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useLoadedData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<LoadState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    loader()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Something went wrong.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [loader]);

  return state;
}
