import { defineConfig } from 'cva';
import { twMerge } from 'tailwind-merge';

export type { VariantProps } from 'cva';

export const { cva, cx, compose } = defineConfig({
  hooks: {
    onComplete: twMerge,
  },
});
