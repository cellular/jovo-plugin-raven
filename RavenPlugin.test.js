/**
 * @jest-environment node
 */
const Raven = require('raven');
const RavenPlugin = require('./RavenPlugin');
const { App, util } = require('jovo-framework');
const { getPlatformRequestBuilder } = util;
const [requestBuilder] = getPlatformRequestBuilder();

// Mock the send method an fire an event instead of sending the data
Raven.send = function(data) {
  this.emit('send', data);
};

test('RavenPlugin', done => {
  const app = new App();
  app.register('RavenPlugin', new RavenPlugin('https://abc:123@localhost'));

  const request = requestBuilder.intent('BadIntent', { beep: 'boop' });
  const response = {};

  Raven.once('send', data => {
    console.log(data);
    expect(data).toMatchObject({
      user: { id: expect.any(String) },
      extra: {
        platform: 'GoogleAction',
        session: {},
        user: {},
      },
      message: 'Error: boop',
      exception: expect.any(Array),
      transaction: 'RavenPlugin.test at Jovo.BadIntent',
      tags: {},
      breadcrumbs: {
        values: [
          {
            category: 'INTENT',
            data: {
              beep: {
                name: 'beep',
                id: 'boop',
                key: 'boop',
                value: 'boop',
              },
            },
            message: 'BadIntent',
            timestamp: expect.any(Number),
          },
        ],
      },
      environment: 'test',
    });
    done();
  });

  expect(
    app.handleRequest(request.buildHttpRequest(), response, {
      BadIntent: function(beep) {
        throw new Error(beep.key);
      },
    })
  ).rejects.toThrowError('boop');
});
