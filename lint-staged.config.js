module.exports = {
  'src/**/*.{js,ts,json}': [
    './node_modules/.bin/eslint --fix',
    './node_modules/.bin/prettier --write',
    'yarn lint',
  ],
};
