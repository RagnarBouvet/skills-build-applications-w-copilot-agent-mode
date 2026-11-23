import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  load: () => Promise<T>;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  renderData: (data: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  load,
  emptyMessage,
  isEmpty,
  renderData,
}: Props<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    setData(undefined);

    load()
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unknown error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [load]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {loading && <p role="status">Loading {title.toLowerCase()}...</p>}
        {!loading && error && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}
        {!loading && data !== undefined && isEmpty(data) && <p role="status">{emptyMessage}</p>}
        {!loading && data !== undefined && !isEmpty(data) && renderData(data)}
      </div>
    </section>
  );
}
