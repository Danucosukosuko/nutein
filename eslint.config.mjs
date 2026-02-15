import eslintConfig from '@electron-toolkit/eslint-config';
import mochaPlugin from 'eslint-plugin-mocha';

export default [
  eslintConfig,
  mochaPlugin.configs.recommended,
  {
    rules: {
      "mocha/no-setup-in-describe": "off",
      "mocha/no-mocha-arrows": "off",
    }
  }
];
