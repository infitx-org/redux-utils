# @modusbox/redux-utils

A collection of Typescript utilities for the frontend apps.

To install the module run `yarn add @modusbox/redux-utils`.

Documentation is available at [https://modusintegration.github.io/redux-utils](https://modusintegration.github.io/redux-utils)

### Development

First install the dependencies with `yarn install`.

It is suggested to configure your editor/IDE to use ESLint plugins so that you'll be able to see warnings and errors while coding.

### Testing

The library uses Jest for testing. Tests should be written in .ts files, post with _.spec_ eg `html.spec.ts`.

Use `yarn test` to launch the test runner.

### Coding standards

The project uses ESLint extending Airbnb, Prettier, Typescript recommended rules.

Use `yarn lint` to run ESLint across the source files.


### Building the library

You can use the command `yarn compile` to launch `tsc` locally. 

While this is not a necessary step while developing, it can be useful when you want to test the library locally with `yarn link`.

### Documentation

The project uses Typedoc to generate documentation. 

Use `yarn docs` to run Typedoc on the codebase.






