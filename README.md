# Sentry integration for the Jovo Framework

[Jovo](https://www.jovo.tech/) [Plugin](https://www.jovo.tech/docs/advanced#plugins) that sends errors to a [Sentry](https://github.com/getsentry/sentry) server using [Raven](https://github.com/getsentry/raven-node).

## Usage

```js
const { App } = require('jovo-framework');
const Raven = require('raven');
const RavenPlugin = require('jovo-plugin-raven');

const app = new App();

const dsn = 'https://abc:123@example.com/1';
const opts = {
  // see:
  // https://docs.sentry.io/clients/node/config/#optional-settings
};

app.register('RavenPlugin', new RavenPlugin(dsn, opts));
```

# License

MIT