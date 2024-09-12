import { defineConfig } from 'cva';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export type { VariantProps } from 'cva';

export const { cva, cx, compose } = defineConfig({
  hooks: {
    onComplete: twMerge,
  },
});

export function useClipboard(value: string, timeout = 1500) {
  const [{ state, i }, setState] = useState<{
    state: 'idle' | 'copied';
    i: number;
  }>({ state: 'idle', i: 0 });
  const hasCopied = state === 'copied';

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setState({ state: 'copied', i: i + 1 });
  }, [i, value]);

  useEffect(() => {
    if (hasCopied) {
      const timeoutId = window.setTimeout(() => {
        setState({ state: 'idle', i: i + 1 });
      }, timeout);

      return function cleanup() {
        window.clearTimeout(timeoutId);
      };
    }
  }, [hasCopied, i, timeout]);

  return { copy, hasCopied };
}

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function composeSafeRedirectUrl(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = '/',
) {
  if (!to || typeof to !== 'string') {
    return defaultRedirect;
  }

  to = to.trim();

  if (
    !to.startsWith('/') ||
    to.startsWith('//') ||
    to.startsWith('/\\') ||
    to.includes('..')
  ) {
    return defaultRedirect;
  }

  return to;
}
