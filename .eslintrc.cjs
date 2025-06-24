module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true, // Added for good measure, though primary is browser
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/jsx-runtime', // For new JSX transform
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  rules: {
    // Add any specific rule overrides here
    // Example: 'react/prop-types': 'off', // If not using prop-types with TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist/', 'node_modules/', 'vite.config.ts', 'postcss.config.js', 'tailwind.config.js'], // Ignoring build outputs and config files
};
