"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@loopback/core");
const openapi_spec_builder_1 = require("@loopback/openapi-spec-builder");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
describe('RestServer', () => {
    describe('"invokeMethod" binding', () => {
        it('returns a function for invoking a route handler', async () => {
            function greet() {
                return 'Hello world';
            }
            const route = new __1.Route('get', '/greet', (0, openapi_spec_builder_1.anOperationSpec)().build(), greet);
            const ctx = await givenRequestContext();
            const invokeMethod = await ctx.get(__1.RestBindings.SequenceActions.INVOKE_METHOD);
            const result = await invokeMethod(route, []);
            (0, testlab_1.expect)(result).to.equal('Hello world');
        });
    });
    describe('configuration', () => {
        it('uses http port 3000 by default', async () => {
            const app = new core_1.Application();
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.PORT)).to.equal(3000);
        });
        it('uses undefined http host by default', async () => {
            const app = new core_1.Application();
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            const host = await server.get(__1.RestBindings.HOST);
            (0, testlab_1.expect)(host).to.be.undefined();
        });
        it('can set port 0', async () => {
            const app = new core_1.Application({
                rest: { port: 0 },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.PORT)).to.equal(0);
        });
        it('honors host/port', async () => {
            const app = new core_1.Application({
                rest: { port: 4000, host: 'my-host' },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.PORT)).to.equal(4000);
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.HOST)).to.equal('my-host');
        });
        it('honors unix socket path', async () => {
            const path = '/var/run/loopback.sock';
            const app = new core_1.Application({
                rest: { path },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.PATH)).to.equal(path);
        });
        it('honors named pipe path', async () => {
            const path = '\\\\.\\pipe\\loopback';
            const app = new core_1.Application({
                rest: { path },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.PATH)).to.equal(path);
        });
        it('honors gracePeriodForClose', async () => {
            var _a;
            const app = new core_1.Application({
                rest: { port: 0, gracePeriodForClose: 1000 },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            await server.start();
            try {
                (0, testlab_1.expect)((_a = server.httpServer) === null || _a === void 0 ? void 0 : _a.serverOptions.gracePeriodForClose).to.eql(1000);
            }
            finally {
                await server.stop();
            }
        });
        it('honors basePath in config', async () => {
            const app = new core_1.Application({
                rest: { port: 0, basePath: '/api' },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.BASE_PATH)).to.equal('/api');
        });
        it('honors basePath via api', async () => {
            const app = new core_1.Application({
                rest: { port: 0 },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            server.basePath('/api');
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.BASE_PATH)).to.equal('/api');
        });
        it('rejects basePath if request handler is created', async () => {
            const app = new core_1.Application({
                rest: { port: 0 },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            (0, testlab_1.expect)(() => {
                // Force the `getter` function to be triggered by referencing
                // `server.requestHandler` so that the servers has `requestHandler`
                // populated to prevent `basePath` to be set.
                if (server.requestHandler != null) {
                    server.basePath('/api');
                }
            }).to.throw(/Base path cannot be set as the request handler has been created/);
        });
        it('honors requestBodyParser options in config', async () => {
            const parserOptions = { json: { limit: '1mb' } };
            const app = new core_1.Application({
                rest: { requestBodyParser: parserOptions },
            });
            app.component(__1.RestComponent);
            const server = await app.getServer(__1.RestServer);
            (0, testlab_1.expect)(server.getSync(__1.RestBindings.REQUEST_BODY_PARSER_OPTIONS)).to.equal(parserOptions);
        });
        describe('express settings', () => {
            class TestRestServer extends __1.RestServer {
                constructor(application, config) {
                    super(application, config);
                    this._setupRequestHandlerIfNeeded();
                }
                get expressApp() {
                    assertExists(this._expressApp, 'this._expressApp');
                    return this._expressApp;
                }
            }
            function assertExists(val, msg) {
                testlab_1.expect.exists(val, msg);
            }
            it('honors expressSettings', () => {
                const app = new core_1.Application();
                const server = new TestRestServer(app, {
                    expressSettings: {
                        'x-powered-by': false,
                        env: 'production',
                    },
                });
                const expressApp = server.expressApp;
                (0, testlab_1.expect)(expressApp.get('x-powered-by')).to.equal(false);
                (0, testlab_1.expect)(expressApp.get('env')).to.equal('production');
                // `extended` is the default setting by Express
                (0, testlab_1.expect)(expressApp.get('query parser')).to.equal('extended');
                (0, testlab_1.expect)(expressApp.get('not set')).to.equal(undefined);
            });
            it('honors strict', () => {
                const app = new core_1.Application();
                const server = new TestRestServer(app, {
                    router: {
                        strict: true,
                    },
                });
                const expressApp = server.expressApp;
                (0, testlab_1.expect)(expressApp.get('strict routing')).to.equal(true);
            });
        });
    });
    async function givenRequestContext() {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        const server = await app.getServer(__1.RestServer);
        const requestContext = new core_1.Context(server);
        requestContext.bind(__1.RestBindings.Http.CONTEXT).to(requestContext);
        return requestContext;
    }
});
//# sourceMappingURL=rest.server.unit.js.map