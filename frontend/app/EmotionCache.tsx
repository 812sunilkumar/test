'use client';

import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import type { EmotionCache } from '@emotion/cache';

type Props = {
  options: {
    key: string;
  };
  children: React.ReactNode;
};

export function NextAppDirEmotionCacheProvider({ options, children }: Props) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ ...options, prepend: true });
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted: string[] = [];

    // ✅ Use Parameters<typeof prevInsert> for type safety
    cache.insert = ((...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1];

      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }

      return prevInsert(...args);
    }) as EmotionCache['insert'];

    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = '';
    names.forEach((name) => {
      styles += cache.inserted[name];
    });

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
