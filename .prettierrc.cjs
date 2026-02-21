module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  proseWrap: 'never',
  endOfLine: 'lf',
  overrides: [
    {
      files: '.prettierrc',
      options: {
        parser: 'json',
      },
    },
  ],
};
