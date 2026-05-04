import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development'
      ? babel({
          plugins: [
            [
              '@emotion/babel-plugin',
              {
                autoLabel: 'always',
                labelFormat: '[filename]--[local]',
                sourceMap: true,
              },
            ],
          ],
        })
      : null,
  ],
  base: process.env.NODE_ENV === 'production' ? '/todo-cloud/' : '/',
}));
