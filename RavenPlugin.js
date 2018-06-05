const Raven = require('raven');
const { Plugin } = require('jovo-framework');

class RavenPlugin extends Plugin {
  constructor(dsn, options) {
    super(options);
    this.dsn = dsn;
  }

  init() {
    const { app, dsn, options } = this;

    // Configure and install global handlers
    Raven.config(dsn, {
      captureUnhandledRejections: true,
      ...options,
    }).install();

    app.on('handlerError', (jovo, err) => {
      const platform = jovo.getPlatform();
      const { data, metaData } = jovo.user();
      const context = {
        user: {
          id: jovo.getUserId(),
        },
        extra: {
          platform: platform.getType(),
          request: jovo.requestObj,
          session: jovo.getSessionAttributes(),
          user: { ...data, meta: metaData },
        },
      };

      const isIntentRequest = jovo.request().getIntentName;
      if (isIntentRequest) {
        Raven.captureBreadcrumb({
          message: jovo.getIntentName(),
          category: platform.getRequestType(),
          data: platform.getInputs(),
        });
      }

      Raven.captureException(err, context);
    });

    app.on('request', jovo => {
      // Set the ARN as environment if running as lambda
      const arn = jovo.context && jovo.context.invokedFunctionArn;
      if (arn) Raven.environment = arn;
    });
  }
}

module.exports = RavenPlugin;
