"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const testlab_1 = require("@loopback/testlab");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const rest_application_1 = require("../../rest.application");
const rest_server_1 = require("../../rest.server");
let app;
let client;
let observedCtx;
describe('RequestContext', () => {
    beforeEach(setup);
    afterEach(teardown);
    describe('requestedProtocol', () => {
        it('defaults to "http"', async () => {
            await givenRunningAppWithClient();
            await client.get('/products').expect(200);
            (0, testlab_1.expect)(observedCtx.requestedProtocol).to.equal('http');
        });
        it('honors "x-forwarded-proto" header', async () => {
            await givenRunningAppWithClient();
            await client
                .get('/products')
                .set('x-forwarded-proto', 'https')
                .expect(200);
            (0, testlab_1.expect)(observedCtx.requestedProtocol).to.equal('https');
        });
        it('honors protocol provided by Express request', async () => {
            await givenRunningAppWithClient({ protocol: 'https' });
            (0, testlab_1.expect)(app.restServer.url).to.startWith('https:');
            // supertest@3 fails with Error: self signed certificate
            // FIXME(bajtos) rework this code once we upgrade to supertest@4
            // await client.get('/products').trustLocalhost().expect(200);
            await (0, testlab_1.httpsGetAsync)(app.restServer.url + '/products');
            (0, testlab_1.expect)(observedCtx.requestedProtocol).to.equal('https');
        });
    });
    describe('basePath', () => {
        it('defaults to an empty string', async () => {
            await givenRunningAppWithClient();
            await client.get('/products').expect(200);
            (0, testlab_1.expect)(observedCtx.basePath).to.equal('');
        });
        it('honors baseUrl when mounted on a sub-path', async () => {
            const lbApp = new rest_application_1.RestApplication();
            lbApp.handler(contextObservingHandler);
            const expressApp = (0, express_1.default)();
            expressApp.use('/api', lbApp.requestHandler);
            await (0, testlab_1.supertest)(expressApp).get('/api/products').expect(200);
            (0, testlab_1.expect)(observedCtx.basePath).to.equal('/api');
        });
        it('combines both baseUrl and basePath', async () => {
            const lbApp = new rest_application_1.RestApplication();
            lbApp.handler(contextObservingHandler);
            lbApp.basePath('/v1'); // set basePath at LoopBack level
            const expressApp = (0, express_1.default)();
            expressApp.use('/api', lbApp.requestHandler); // mount the app at baseUrl
            await (0, testlab_1.supertest)(expressApp).get('/api/v1/products').expect(200);
            (0, testlab_1.expect)(observedCtx.basePath).to.equal('/api/v1');
        });
        it('honors basePath from server config', async () => {
            await givenRunningAppWithClient({ basePath: '/api' });
            await client.get('/api/products').expect(200);
            (0, testlab_1.expect)(observedCtx.basePath).to.equal('/api');
        });
        it('honors basePath set via basePath() method', async () => {
            await givenRunningAppWithClient({}, a => {
                a.restServer.basePath('/api');
            });
            await client.get('/api/products').expect(200);
            (0, testlab_1.expect)(observedCtx.basePath).to.equal('/api');
        });
    });
    describe('requestedBaseUrl', () => {
        it('defaults to data from the HTTP connection', async () => {
            await givenRunningAppWithClient({
                host: undefined,
                port: 0,
            });
            const serverUrl = app.restServer.url;
            await client.get('/products').expect(200);
            (0, testlab_1.expect)(observedCtx.requestedBaseUrl).to.equal(serverUrl);
        });
        it('honors "x-forwarded-*" headers', async () => {
            await givenRunningAppWithClient();
            await client
                .get('/products')
                .set('x-forwarded-proto', 'https')
                .set('x-forwarded-host', 'example.com')
                .set('x-forwarded-port', '8080')
                .expect(200);
            (0, testlab_1.expect)(observedCtx.requestedBaseUrl).to.equal('https://example.com:8080');
        });
    });
});
describe('close', () => {
    it('removes listeners from parent context', async () => {
        await givenRunningAppWithClient();
        const server = await app.getServer(rest_server_1.RestServer);
        // Running the request 5 times
        for (let i = 0; i < 5; i++) {
            await client
                .get('/products')
                .set('x-forwarded-proto', 'https')
                .expect(200);
        }
        (0, testlab_1.expect)(observedCtx.contains('req.originalUrl'));
        (0, testlab_1.expect)(server.listenerCount('bind')).to.eql(2);
    });
});
function setup() {
    app = undefined;
    client = undefined;
    observedCtx = undefined;
}
async function teardown() {
    if (app)
        await app.stop();
}
async function givenRunningAppWithClient(restOptions, setupFn = () => { }) {
    const options = {
        rest: (0, testlab_1.givenHttpServerConfig)(restOptions),
    };
    app = new rest_application_1.RestApplication(options);
    app.handler(contextObservingHandler);
    setupFn(app);
    await app.start();
    client = (0, testlab_1.createRestAppClient)(app);
}
function contextObservingHandler(ctx, _sequence) {
    observedCtx = ctx;
    // Add a subscriber to verify `close()`
    ctx.subscribe(() => { });
    // Add a binding to the request context
    ctx.bind('req.originalUrl').to(ctx.request.originalUrl);
    ctx.response.end('ok');
}
//# sourceMappingURL=request-context.integration.js.map