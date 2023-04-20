"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const express_1 = require("@loopback/express");
const openapi_spec_builder_1 = require("@loopback/openapi-spec-builder");
const testlab_1 = require("@loopback/testlab");
const fs_1 = (0, tslib_1.__importDefault)(require("fs"));
const js_yaml_1 = (0, tslib_1.__importDefault)(require("js-yaml"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const type_is_1 = require("type-is");
const util_1 = (0, tslib_1.__importDefault)(require("util"));
const __1 = require("../..");
const keys_1 = require("../../keys");
const readFileAsync = util_1.default.promisify(fs_1.default.readFile);
const FIXTURES = path_1.default.resolve(__dirname, '../../../fixtures');
const ASSETS = path_1.default.resolve(FIXTURES, 'assets');
describe('RestServer (integration)', () => {
    describe('url/rootUrl properties', () => {
        let server;
        afterEach('shuts down server', async () => {
            if (!server)
                return;
            await server.stop();
            (0, testlab_1.expect)(server.url).to.be.undefined();
            (0, testlab_1.expect)(server.rootUrl).to.be.undefined();
        });
        describe('url', () => {
            it('exports url property', async () => {
                server = await givenAServer();
                server.handler(dummyRequestHandler);
                (0, testlab_1.expect)(server.url).to.be.undefined();
                await server.start();
                (0, testlab_1.expect)(server)
                    .to.have.property('url')
                    .which.is.a.String()
                    .match(/http|https\:\/\//);
                await (0, testlab_1.supertest)(server.url).get('/').expect(200, 'Hello');
            });
            it('includes basePath in the url property', async () => {
                server = await givenAServer({ rest: { basePath: '/api' } });
                server.handler(dummyRequestHandler);
                (0, testlab_1.expect)(server.url).to.be.undefined();
                await server.start();
                (0, testlab_1.expect)(server)
                    .to.have.property('url')
                    .which.is.a.String()
                    .match(/http|https\:\/\//);
                (0, testlab_1.expect)(server.url).to.match(/api$/);
                await (0, testlab_1.supertest)(server.url).get('/').expect(200, 'Hello');
            });
        });
        describe('rootUrl', () => {
            it('exports rootUrl property', async () => {
                server = await givenAServer();
                server.handler(dummyRequestHandler);
                (0, testlab_1.expect)(server.rootUrl).to.be.undefined();
                await server.start();
                (0, testlab_1.expect)(server)
                    .to.have.property('rootUrl')
                    .which.is.a.String()
                    .match(/http|https\:\/\//);
                await (0, testlab_1.supertest)(server.rootUrl).get('/api').expect(200, 'Hello');
            });
            it('does not include basePath in rootUrl', async () => {
                server = await givenAServer({ rest: { basePath: '/api' } });
                server.handler(dummyRequestHandler);
                (0, testlab_1.expect)(server.rootUrl).to.be.undefined();
                await server.start();
                (0, testlab_1.expect)(server)
                    .to.have.property('rootUrl')
                    .which.is.a.String()
                    .match(/http|https\:\/\//);
                await (0, testlab_1.supertest)(server.rootUrl).get('/api').expect(200, 'Hello');
            });
        });
    });
    it('parses query without decorated rest query params', async () => {
        // This handler responds with the query object (which is expected to
        // be parsed by Express)
        function requestWithQueryHandler({ request, response }) {
            response.json(request.query);
            response.end();
        }
        // See https://github.com/loopbackio/loopback-next/issues/2088
        const server = await givenAServer();
        server.handler(requestWithQueryHandler);
        await server.start();
        await (0, testlab_1.supertest)(server.url)
            .get('/?x=1&y[a]=2')
            .expect(200, { x: '1', y: { a: '2' } });
        await server.stop();
    });
    it('updates rest.port binding when listening on ephemeral port', async () => {
        const server = await givenAServer();
        await server.start();
        (0, testlab_1.expect)(server.getSync(__1.RestBindings.PORT)).to.be.above(0);
        await server.stop();
    });
    it('honors port binding after instantiation', async () => {
        const server = await givenAServer({ rest: { port: 80 } });
        server.bind(__1.RestBindings.PORT).to(0);
        await server.start();
        (0, testlab_1.expect)(server.getSync(__1.RestBindings.PORT)).to.not.equal(80);
        await server.stop();
    });
    it('disables listening if noListen is set to true', async () => {
        const server = await givenAServer({ rest: { listenOnStart: false, port: 0 } });
        await server.start();
        // No port is assigned
        (0, testlab_1.expect)(server.getSync(__1.RestBindings.PORT)).to.eql(0);
        // No server url is set
        (0, testlab_1.expect)(server.url).to.be.undefined();
        (0, testlab_1.expect)(server.listening).to.be.false();
        await server.stop();
    });
    it('does not throw an error when stopping an app that has not been started', async () => {
        const server = await givenAServer();
        await (0, testlab_1.expect)(server.stop()).to.fulfilled();
    });
    describe('unhandled error', () => {
        let server;
        const consoleError = console.error;
        let errorMsg = '';
        // Patch `console.error`
        before(async () => {
            console.error = (format, ...args) => {
                errorMsg = util_1.default.format(format, ...args);
            };
            server = await givenAServer();
        });
        // Restore `console.error`
        after(() => {
            console.error = consoleError;
        });
        it('responds with 500 when Sequence returns a rejected promise', async () => {
            server.handler((context, sequence) => {
                return Promise.reject(new Error('unhandled test error'));
            });
            await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/').expect(500);
            (0, testlab_1.expect)(errorMsg).to.match(/Request GET \/\ failed with status code 500. Error\: unhandled test error/);
        });
        it('hangs up socket when Sequence returns a rejected promise but headers were already sent', async () => {
            server.handler((context, sequence) => {
                context.response.writeHead(200);
                return Promise.reject(new Error('unhandled test error after sent'));
            });
            await (0, testlab_1.expect)((0, testlab_1.createClientForHandler)(server.requestHandler).get('/')).to.be.rejectedWith(/socket hang up/);
            (0, testlab_1.expect)(errorMsg).to.match(/Request GET \/\ failed with status code 500. Error\: unhandled test error/);
        });
    });
    it('allows static assets to be mounted at /', async () => {
        const root = ASSETS;
        const server = await givenAServer({
            rest: {
                port: 0,
            },
        });
        (0, testlab_1.expect)(() => server.static('/', root)).to.not.throw();
        (0, testlab_1.expect)(() => server.static('', root)).to.not.throw();
        (0, testlab_1.expect)(() => server.static(['/'], root)).to.not.throw();
        (0, testlab_1.expect)(() => server.static(['/html', ''], root)).to.not.throw();
        (0, testlab_1.expect)(() => server.static(/.*/, root)).to.not.throw();
        (0, testlab_1.expect)(() => server.static('/(.*)', root)).to.not.throw();
    });
    it('allows static assets via api', async () => {
        const root = ASSETS;
        const server = await givenAServer();
        server.static('/html', root);
        const content = fs_1.default
            .readFileSync(path_1.default.join(root, 'index.html'))
            .toString('utf-8');
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html/index.html')
            .expect('Content-Type', /text\/html/)
            .expect(200, content);
    });
    it('allows static assets to be mounted on multiple paths', async () => {
        const root = ASSETS;
        const server = await givenAServer();
        server.static('/html-0', root);
        server.static('/html-1', root);
        const content = fs_1.default
            .readFileSync(path_1.default.join(root, 'index.html'))
            .toString('utf-8');
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html-0/index.html')
            .expect('Content-Type', /text\/html/)
            .expect(200, content);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html-1/index.html')
            .expect('Content-Type', /text\/html/)
            .expect(200, content);
    });
    it('merges different static asset directories when mounted on the same path', async () => {
        const root = ASSETS;
        const otherAssets = path_1.default.join(FIXTURES, 'other-assets');
        const server = await givenAServer();
        server.static('/html', root);
        server.static('/html', otherAssets);
        let content = await readFileFromDirectory(root, 'index.html');
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html/index.html')
            .expect('Content-Type', /text\/html/)
            .expect(200, content);
        content = await readFileFromDirectory(otherAssets, 'robots.txt');
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html/robots.txt')
            .expect('Content-Type', /text\/plain/)
            .expect(200, content);
    });
    it('allows static assets via api after start', async () => {
        const root = ASSETS;
        const server = await givenAServer();
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html/index.html')
            .expect(404);
        server.static('/html', root);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html/index.html')
            .expect(200);
    });
    it('allows non-static routes after assets', async () => {
        const root = ASSETS;
        const server = await givenAServer();
        server.static('/html', root);
        server.handler(dummyRequestHandler);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html/does-not-exist.html')
            .expect(200, 'Hello');
    });
    it('gives precedence to API routes over static assets', async () => {
        const root = ASSETS;
        const server = await givenAServer();
        server.static('/html', root);
        server.handler(dummyRequestHandler);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html/index.html')
            .expect(200, 'Hello');
    });
    it('registers controllers defined later than static assets', async () => {
        const root = ASSETS;
        const server = await givenAServer();
        server.static('/html', root);
        server.controller(DummyController);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/html')
            .expect(200, 'Hi');
    });
    it('allows request body parser extensions', async () => {
        const body = '<key>value</key>';
        /**
         * A mock-up xml parser
         */
        class XmlBodyParser {
            constructor() {
                this.name = 'xml';
            }
            supports(mediaType) {
                return !!(0, type_is_1.is)(mediaType, 'xml');
            }
            async parse(request) {
                return { value: { key: 'value' } };
            }
        }
        const server = await givenAServer();
        // Register a request body parser for xml
        server.bodyParser(XmlBodyParser);
        server.controller(DummyXmlController);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .post('/')
            .set('Content-Type', 'application/xml')
            .send(body)
            .expect(200, { key: 'value' });
    });
    it('allows cors', async () => {
        const server = await givenAServer();
        server.handler(dummyRequestHandler);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/')
            .expect(200, 'Hello')
            .expect('Access-Control-Allow-Origin', '*')
            .expect('Access-Control-Allow-Credentials', 'true');
    });
    it('allows cors preflight', async () => {
        const server = await givenAServer();
        server.handler(dummyRequestHandler);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .options('/')
            .expect(204)
            .expect('Access-Control-Allow-Origin', '*')
            .expect('Access-Control-Allow-Credentials', 'true')
            .expect('Access-Control-Max-Age', '86400');
    });
    it('allows custom CORS configuration', async () => {
        const server = await givenAServer({
            rest: {
                port: 0,
                cors: {
                    optionsSuccessStatus: 200,
                    maxAge: 1,
                },
            },
        });
        server.handler(dummyRequestHandler);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .options('/')
            .expect(200)
            .expect('Access-Control-Max-Age', '1');
    });
    it('allows CORS configuration with origin function to reject', async () => {
        const server = await givenAServer({
            rest: {
                port: 0,
                cors: {
                    origin: (origin, callback) => {
                        process.nextTick(() => {
                            callback(new __1.HttpErrors.Forbidden('Not allowed by CORS'));
                        });
                    },
                },
            },
        });
        server.handler(dummyRequestHandler);
        await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .options('/')
            .expect(403, {
            error: {
                statusCode: 403,
                name: 'ForbiddenError',
                message: 'Not allowed by CORS',
            },
        });
    });
    it('exposes "GET /openapi.json" endpoint', async () => {
        const server = await givenAServer();
        const greetSpec = {
            responses: {
                200: {
                    content: { 'text/plain': { schema: { type: 'string' } } },
                    description: 'greeting of the day',
                },
            },
        };
        server.route('get', '/greet', greetSpec, function greet() { });
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/openapi.json');
        (0, testlab_1.expect)(response.body).to.containDeep({
            openapi: '3.0.0',
            info: {
                title: 'LoopBack Application',
                version: '1.0.0',
            },
            servers: [{ url: '/' }],
            paths: {
                '/greet': {
                    get: {
                        responses: {
                            '200': {
                                content: {
                                    'text/plain': {
                                        schema: { type: 'string' },
                                    },
                                },
                                description: 'greeting of the day',
                            },
                        },
                    },
                },
            },
        });
        (0, testlab_1.expect)(response.get('Access-Control-Allow-Origin')).to.equal('*');
        (0, testlab_1.expect)(response.get('Access-Control-Allow-Credentials')).to.equal('true');
    });
    it('exposes "GET /openapi.json" with openApiSpec.servers', async () => {
        const server = await givenAServer({
            rest: {
                port: 0,
                openApiSpec: {
                    servers: [{ url: 'http://127.0.0.1:8080' }],
                },
            },
        });
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/openapi.json');
        (0, testlab_1.expect)(response.body.servers).to.eql([{ url: 'http://127.0.0.1:8080' }]);
    });
    it('exposes "GET /openapi.json" with openApiSpec.setServersFromRequest', async () => {
        const server = await givenAServer({
            rest: {
                port: 0,
                openApiSpec: {
                    setServersFromRequest: true,
                },
            },
        });
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/openapi.json');
        (0, testlab_1.expect)(response.body.servers[0].url).to.match(/http:\/\/127.0.0.1\:\d+/);
    });
    it('exposes endpoints with openApiSpec.endpointMapping', async () => {
        const server = await givenAServer({
            rest: {
                port: 0,
                openApiSpec: {
                    endpointMapping: {
                        '/openapi': { version: '3.0.0', format: 'yaml' },
                    },
                },
            },
        });
        const test = (0, testlab_1.createClientForHandler)(server.requestHandler);
        await test.get('/openapi').expect(200, /openapi\: 3\.0\.0/);
        await test.get('/openapi.json').expect(404);
    });
    it('exposes "GET /openapi.yaml" endpoint', async () => {
        var _a;
        const server = await givenAServer();
        const greetSpec = {
            responses: {
                200: {
                    content: { 'text/plain': { schema: { type: 'string' } } },
                    description: 'greeting of the day',
                },
            },
        };
        server.route('get', '/greet', greetSpec, function greet() { });
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/openapi.yaml');
        const expected = js_yaml_1.default.load(`
openapi: 3.0.0
info:
  title: LoopBack Application
  version: 1.0.0
paths:
  /greet:
    get:
      responses:
        '200':
          description: greeting of the day
          content:
            'text/plain':
              schema:
                type: string
    `);
        // Use json for comparison to tolerate textual diffs
        const json = js_yaml_1.default.load(response.text);
        (0, testlab_1.expect)(json).to.containDeep(expected);
        (0, testlab_1.expect)((_a = json.servers) === null || _a === void 0 ? void 0 : _a[0].url).to.match('/');
        (0, testlab_1.expect)(response.get('Access-Control-Allow-Origin')).to.equal('*');
        (0, testlab_1.expect)(response.get('Access-Control-Allow-Credentials')).to.equal('true');
    });
    it('disables endpoints with openApiSpec.disabled = true', async () => {
        const server = await givenAServer({
            rest: {
                port: 0,
                openApiSpec: {
                    disabled: true,
                },
            },
        });
        const test = (0, testlab_1.createClientForHandler)(server.requestHandler);
        await test.get('/openapi.json').expect(404);
        await test.get('/openapi.yaml').expect(404);
        await test.get('/explorer').expect(404);
    });
    it('can add openApiSpec endpoints before express initialization', async () => {
        const server = await givenAServer();
        server.addOpenApiSpecEndpoint('/custom-openapi.json', {
            version: '3.0.0',
            format: 'json',
        });
        const test = (0, testlab_1.createClientForHandler)(server.requestHandler);
        await test.get('/custom-openapi.json').expect(200);
    });
    // this doesn't work: once the generic routes have been added to express to
    // direct requests at controllers, adding OpenAPI spec routes after that
    // no longer works in the sense that express won't ever try those routes
    // https://github.com/loopbackio/loopback-next/issues/433 will make changes
    // that make it possible to enable this test
    it.skip('can add openApiSpec endpoints after express initialization', async () => {
        const server = await givenAServer();
        const test = (0, testlab_1.createClientForHandler)(server.requestHandler);
        server.addOpenApiSpecEndpoint('/custom-openapi.json', {
            version: '3.0.0',
            format: 'json',
        });
        await test.get('/custom-openapi.json').expect(200);
    });
    it('rejects duplicate additions of openApiSpec endpoints', async () => {
        const server = await givenAServer();
        server.addOpenApiSpecEndpoint('/custom-openapi.json', {
            version: '3.0.0',
            format: 'json',
        });
        (0, testlab_1.expect)(() => server.addOpenApiSpecEndpoint('/custom-openapi.json', {
            version: '3.0.0',
            format: 'yaml',
        })).to.throw(/already configured/);
    });
    it('exposes "GET /explorer" endpoint', async () => {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        const server = await app.getServer(__1.RestServer);
        const greetSpec = {
            responses: {
                200: {
                    schema: { type: 'string' },
                    description: 'greeting of the day',
                },
            },
        };
        server.route('get', '/greet', greetSpec, function greet() { });
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/explorer');
        await server.get(__1.RestBindings.PORT);
        const expectedUrl = new RegExp([
            'http://explorer\\.loopback\\.io',
            '\\?url=http://\\d+.\\d+.\\d+.\\d+:\\d+/openapi.json',
        ].join(''));
        (0, testlab_1.expect)(response.status).to.equal(302);
        (0, testlab_1.expect)(response.get('Location')).match(expectedUrl);
        (0, testlab_1.expect)(response.get('Access-Control-Allow-Origin')).to.equal('*');
        (0, testlab_1.expect)(response.get('Access-Control-Allow-Credentials')).to.equal('true');
    });
    it('can be configured to disable "GET /explorer"', async () => {
        const server = await givenAServer({
            rest: {
                ...(0, testlab_1.givenHttpServerConfig)(),
                apiExplorer: { disabled: true },
            },
        });
        const request = (0, testlab_1.createClientForHandler)(server.requestHandler);
        await request.get('/explorer').expect(404);
    });
    it('honors "x-forwarded-*" headers', async () => {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        const server = await app.getServer(__1.RestServer);
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/explorer')
            .set('x-forwarded-proto', 'https')
            .set('x-forwarded-host', 'example.com')
            .set('x-forwarded-port', '8080');
        await server.get(__1.RestBindings.PORT);
        const expectedUrl = new RegExp([
            'https://explorer\\.loopback\\.io',
            '\\?url=https://example\\.com:8080/openapi\\.json',
        ].join(''));
        (0, testlab_1.expect)(response.get('Location')).match(expectedUrl);
    });
    it('honors "x-forwarded-host" headers', async () => {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        const server = await app.getServer(__1.RestServer);
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/explorer')
            .set('x-forwarded-proto', 'http')
            .set('x-forwarded-host', 'example.com:8080,my.example.com:9080');
        await server.get(__1.RestBindings.PORT);
        const expectedUrl = new RegExp([
            'http://explorer.loopback.io',
            '\\?url=http://example.com:8080/openapi.json',
        ].join(''));
        (0, testlab_1.expect)(response.get('Location')).match(expectedUrl);
    });
    it('skips port if it is the default for http or https', async () => {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        const server = await app.getServer(__1.RestServer);
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler)
            .get('/explorer')
            .set('x-forwarded-proto', 'https')
            .set('x-forwarded-host', 'example.com')
            .set('x-forwarded-port', '443');
        await server.get(__1.RestBindings.PORT);
        const expectedUrl = new RegExp([
            'https://explorer\\.loopback\\.io',
            '\\?url=https://example\\.com/openapi\\.json',
        ].join(''));
        (0, testlab_1.expect)(response.get('Location')).match(expectedUrl);
    });
    it('handles requests with missing Host header', async () => {
        const app = new __1.RestApplication({
            rest: { port: 0, host: '127.0.0.1' },
        });
        await app.start();
        const port = await app.restServer.get(__1.RestBindings.PORT);
        const response = await (0, testlab_1.createRestAppClient)(app)
            .get('/explorer')
            .set('host', '');
        await app.stop();
        const expectedUrl = new RegExp(`\\?url=http://127\\.0\\.0\\.1:${port}`);
        (0, testlab_1.expect)(response.get('Location')).match(expectedUrl);
    });
    it('exposes "GET /explorer" endpoint with apiExplorer.url', async () => {
        const server = await givenAServer({
            rest: {
                apiExplorer: {
                    url: 'https://petstore.swagger.io',
                },
            },
        });
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/explorer');
        await server.get(__1.RestBindings.PORT);
        const expectedUrl = new RegExp([
            'https://petstore\\.swagger\\.io',
            '\\?url=http://\\d+.\\d+.\\d+.\\d+:\\d+/openapi.json',
        ].join(''));
        (0, testlab_1.expect)(response.status).to.equal(302);
        (0, testlab_1.expect)(response.get('Location')).match(expectedUrl);
    });
    it('exposes "GET /explorer" endpoint with apiExplorer.urlForHttp', async () => {
        const server = await givenAServer({
            rest: {
                apiExplorer: {
                    url: 'https://petstore.swagger.io',
                    httpUrl: 'http://petstore.swagger.io',
                },
            },
        });
        const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/explorer');
        await server.get(__1.RestBindings.PORT);
        const expectedUrl = new RegExp([
            'http://petstore\\.swagger\\.io',
            '\\?url=http://\\d+.\\d+.\\d+.\\d+:\\d+/openapi.json',
        ].join(''));
        (0, testlab_1.expect)(response.status).to.equal(302);
        (0, testlab_1.expect)(response.get('Location')).match(expectedUrl);
    });
    it('supports HTTPS protocol with key and certificate files', async () => {
        const keyPath = path_1.default.join(FIXTURES, 'key.pem');
        const certPath = path_1.default.join(FIXTURES, 'cert.pem');
        const serverOptions = (0, testlab_1.givenHttpServerConfig)({
            port: 0,
            protocol: 'https',
            key: fs_1.default.readFileSync(keyPath),
            cert: fs_1.default.readFileSync(certPath),
        });
        const server = await givenAServer({ rest: serverOptions });
        server.handler(dummyRequestHandler);
        await server.start();
        const serverUrl = server.getSync(__1.RestBindings.URL);
        const res = await (0, testlab_1.httpsGetAsync)(serverUrl);
        (0, testlab_1.expect)(res.statusCode).to.equal(200);
    });
    it('supports HTTPS protocol with a pfx file', async () => {
        const pfxPath = path_1.default.join(FIXTURES, 'pfx.pfx');
        const serverOptions = (0, testlab_1.givenHttpServerConfig)({
            port: 0,
            protocol: 'https',
            pfx: fs_1.default.readFileSync(pfxPath),
            passphrase: 'loopback4',
        });
        const server = await givenAServer({ rest: serverOptions });
        server.handler(dummyRequestHandler);
        await server.start();
        const serverUrl = server.getSync(__1.RestBindings.URL);
        const res = await (0, testlab_1.httpsGetAsync)(serverUrl);
        (0, testlab_1.expect)(res.statusCode).to.equal(200);
        await server.stop();
    });
    (0, testlab_1.skipOnTravis)(it, 'handles IPv6 loopback address in HTTPS', async () => {
        const keyPath = path_1.default.join(FIXTURES, 'key.pem');
        const certPath = path_1.default.join(FIXTURES, 'cert.pem');
        const server = await givenAServer({
            rest: {
                port: 0,
                host: '::1',
                protocol: 'https',
                key: fs_1.default.readFileSync(keyPath),
                cert: fs_1.default.readFileSync(certPath),
            },
        });
        server.handler(dummyRequestHandler);
        await server.start();
        const serverUrl = server.getSync(__1.RestBindings.URL);
        const res = await (0, testlab_1.httpsGetAsync)(serverUrl);
        (0, testlab_1.expect)(res.statusCode).to.equal(200);
        await server.stop();
    });
    // https://github.com/loopbackio/loopback-next/issues/1623
    (0, testlab_1.skipOnTravis)(it, 'handles IPv6 address for API Explorer UI', async () => {
        const keyPath = path_1.default.join(FIXTURES, 'key.pem');
        const certPath = path_1.default.join(FIXTURES, 'cert.pem');
        const server = await givenAServer({
            rest: {
                port: 0,
                host: '::1',
                protocol: 'https',
                key: fs_1.default.readFileSync(keyPath),
                cert: fs_1.default.readFileSync(certPath),
            },
        });
        server.handler(dummyRequestHandler);
        await server.start();
        const serverUrl = server.getSync(__1.RestBindings.URL);
        // The `Location` header should be something like
        // https://explorer.loopback.io?url=https://[::1]:58470/openapi.json
        const res = await (0, testlab_1.httpsGetAsync)(serverUrl + '/explorer');
        const location = res.headers['location'];
        (0, testlab_1.expect)(location).to.match(/\[\:\:1\]\:\d+\/openapi.json/);
        (0, testlab_1.expect)(location).to.equal(`https://explorer.loopback.io?url=${serverUrl}/openapi.json`);
        await server.stop();
    });
    it('honors HTTPS config binding after instantiation', async () => {
        const keyPath = path_1.default.join(FIXTURES, 'key.pem');
        const certPath = path_1.default.join(FIXTURES, 'cert.pem');
        const serverOptions = (0, testlab_1.givenHttpServerConfig)({
            port: 0,
            protocol: 'https',
            key: undefined,
            cert: undefined,
        });
        const server = await givenAServer({ rest: serverOptions });
        server.handler(dummyRequestHandler);
        await server.start();
        let serverUrl = server.getSync(__1.RestBindings.URL);
        await (0, testlab_1.expect)((0, testlab_1.httpsGetAsync)(serverUrl)).to.be.rejectedWith(/EPROTO/);
        await server.stop();
        server.bind(__1.RestBindings.HTTPS_OPTIONS).to({
            key: fs_1.default.readFileSync(keyPath),
            cert: fs_1.default.readFileSync(certPath),
        });
        await server.start();
        serverUrl = server.getSync(__1.RestBindings.URL);
        const res = await (0, testlab_1.httpsGetAsync)(serverUrl);
        (0, testlab_1.expect)(res.statusCode).to.equal(200);
        await server.stop();
    });
    it('disables consolidator if openApiSpec.consolidate option is set to false', async () => {
        const options = { openApiSpec: { consolidate: false } };
        const server = await givenAServer({ rest: options });
        const EXPECTED_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        title: 'loopback.example',
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        }))
            .build();
        server.route('get', '/', EXPECTED_SPEC.paths['/'].get, () => { });
        await server.start();
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec).to.eql(EXPECTED_SPEC);
        await server.stop();
    });
    it('runs consolidator if openApiSpec.consolidate option is set to true', async () => {
        const options = { openApiSpec: { consolidate: true } };
        const server = await givenAServer({ rest: options });
        const EXPECTED_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/loopback.example',
                    },
                },
            },
        }))
            .withComponents((0, openapi_spec_builder_1.aComponentsSpec)().withSchema('loopback.example', {
            title: 'loopback.example',
            properties: {
                test: {
                    type: 'string',
                },
            },
        }))
            .build();
        server.route('get', '/', (0, openapi_spec_builder_1.anOperationSpec)()
            .withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        title: 'loopback.example',
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        })
            .build(), () => { });
        await server.start();
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec).to.eql(EXPECTED_SPEC);
        await server.stop();
    });
    it('runs consolidator if openApiSpec.consolidate option is undefined', async () => {
        const options = { openApiSpec: { consolidate: undefined } };
        const server = await givenAServer({ rest: options });
        const EXPECTED_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/loopback.example',
                    },
                },
            },
        }))
            .withComponents((0, openapi_spec_builder_1.aComponentsSpec)().withSchema('loopback.example', {
            title: 'loopback.example',
            properties: {
                test: {
                    type: 'string',
                },
            },
        }))
            .build();
        server.route('get', '/', (0, openapi_spec_builder_1.anOperationSpec)()
            .withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        title: 'loopback.example',
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        })
            .build(), () => { });
        await server.start();
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec).to.eql(EXPECTED_SPEC);
        await server.stop();
    });
    it('keeps api spec components object', async () => {
        const server = await givenAServer();
        const EXPECTED_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withComponents((0, openapi_spec_builder_1.aComponentsSpec)().withParameter('limit', {
            name: 'limit',
            in: 'query',
            description: 'Maximum number of items to return',
            required: false,
            schema: {
                type: 'integer',
            },
        }))
            .build();
        server.api(EXPECTED_SPEC);
        await server.start();
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.components).to.eql(EXPECTED_SPEC.components);
        await server.stop();
    });
    it('registers components provided by server.api()', async () => {
        const server = await givenAServer();
        // Add component schemas
        const EXPECTED_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withComponents((0, openapi_spec_builder_1.aComponentsSpec)().withSchema('requestData', {
            type: 'object',
            properties: {
                greet: { type: 'string' },
            },
        }))
            .build();
        server.api(EXPECTED_SPEC);
        const returnDataSpec = {
            requestBody: {
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/requestData' },
                    },
                },
            },
            responses: {
                200: {
                    content: { 'text/plain': { schema: { type: 'string' } } },
                },
            },
        };
        server.route('post', '/returnData', returnDataSpec, function returnData(data) {
            return data.greet;
        });
        await server.start();
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        await client
            .post('/returnData')
            .set('Content-Type', 'application/json')
            .send({ greet: 'hello' })
            .expect(200, 'hello');
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.components).to.eql(EXPECTED_SPEC.components);
        await server.stop();
    });
    it('registers controller routes under routes.*', async () => {
        const server = await givenAServer();
        server.controller(DummyController);
        await server.start();
        const keys = server.findByTag(keys_1.RestTags.CONTROLLER_ROUTE).map(b => b.key);
        (0, testlab_1.expect)(keys).to.eql(['routes.get %2Fhtml', 'routes.get %2Fendpoint']);
        for (const key of keys) {
            const controllerRoute = await server.get(key);
            (0, testlab_1.expect)(controllerRoute).to.be.instanceOf(__1.ControllerRoute);
        }
        await server.stop();
    });
    it('registers controller routes after start', async () => {
        const server = await givenAServer();
        await server.start();
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        // No DummyController is present
        await client.get('/html').expect(404);
        // Add DummyController after server.start
        server.controller(DummyController);
        // Now /html is available
        await client.get('/html').expect(200);
        // The controller contributes to `routes.*`
        const keys = server.findByTag(keys_1.RestTags.CONTROLLER_ROUTE).map(b => b.key);
        (0, testlab_1.expect)(keys).to.eql(['routes.get %2Fhtml', 'routes.get %2Fendpoint']);
        await server.stop();
    });
    it('removes controller routes after start', async () => {
        const server = await givenAServer();
        const binding = server.controller(DummyController);
        await server.start();
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        // Now /html is available
        await client.get('/html').expect(200);
        // Remove DummyController
        server.unbind(binding.key);
        // Now /html is not available
        await client.get('/html').expect(404);
        // `routes.*` for controllers should have been removed
        const keys = server.findByTag(keys_1.RestTags.CONTROLLER_ROUTE).map(b => b.key);
        (0, testlab_1.expect)(keys).to.eql([]);
        await server.stop();
    });
    it('registers handler routes after start', async () => {
        const server = await givenAServer();
        await server.start();
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        // No `/greet` is present
        await client.get('/greet').expect(404);
        // Add DummyController after server.start
        const greetSpec = {
            responses: {
                200: {
                    content: { 'text/plain': { schema: { type: 'string' } } },
                    description: 'greeting of the day',
                },
            },
        };
        server.route('get', '/greet', greetSpec, function greet() {
            return 'Hello';
        });
        // Now `/greet` is available
        await client.get('/greet').expect(200, 'Hello');
        // The route contributes to `routes.*`
        const keys = server.find('routes.*').map(b => b.key);
        (0, testlab_1.expect)(keys).to.eql(['routes.get %2Fgreet']);
        await server.stop();
    });
    it('removes handler routes after start', async () => {
        const server = await givenAServer();
        // Add DummyController after server.start
        const greetSpec = {
            responses: {
                200: {
                    content: { 'text/plain': { schema: { type: 'string' } } },
                    description: 'greeting of the day',
                },
            },
        };
        const binding = server.route('get', '/greet', greetSpec, function greet() {
            return 'Hello';
        });
        await server.start();
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        // Now `/greet` is available
        await client.get('/greet').expect(200, 'Hello');
        server.unbind(binding.key);
        // Now `/greet` is not available
        await client.get('/greet').expect(404);
        await server.stop();
    });
    it('registers handler routes after start and getApiSpec', async () => {
        const server = await givenAServer();
        await server.start();
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        // No `/greet` is present
        await client.get('/greet').expect(404);
        // Add DummyController after server.start
        const greetSpec = {
            responses: {
                200: {
                    content: { 'text/plain': { schema: { type: 'string' } } },
                    description: 'greeting of the day',
                },
            },
        };
        // Add `GET /greet` route
        server.route('get', '/greet', greetSpec, function greet() {
            return 'Hello';
        });
        // Now `GET /greet` is available
        await client.get('/greet').expect(200, 'Hello');
        // Update api specs to verify serving API explorer does not mess up
        await server.getApiSpec();
        // Add `GET /greet1`
        const binding = server.route('get', '/greet1', greetSpec, function greet() {
            return 'Hello1';
        });
        // `GET /greet` is still available
        await client.get('/greet').expect(200, 'Hello');
        // The newly added `GET /greet1` is available
        await client.get('/greet1').expect(200, 'Hello1');
        // Now update api specs again
        await server.getApiSpec();
        // Remove `GET /greet1`
        server.unbind(binding.key);
        // `GET /greet` is still available
        await client.get('/greet').expect(200, 'Hello');
        // Now `GET /greet1` is gone
        await client.get('/greet1').expect(404);
        await server.stop();
    });
    it('updates api spec after start', async () => {
        class MyController {
            greet(name) {
                return `hello ${name}`;
            }
        }
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/greet', (0, openapi_spec_builder_1.anOperationSpec)()
            .withParameter({ name: 'name', in: 'query', type: 'string' })
            .withExtension('x-operation-name', 'greet')
            .withExtension('x-controller-name', 'MyController'))
            .build();
        const server = await givenAServer();
        await server.start();
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        // `/greet` is not available
        await client.get('/greet?name=world').expect(404);
        // Set api spec that adds routes
        server.api(spec);
        server.controller(MyController);
        // `/greet` is now available
        await client.get('/greet?name=world').expect(200, 'hello world');
        await server.stop();
    });
    it('creates a redirect route with the default status code', async () => {
        const server = await givenAServer();
        server.controller(DummyController);
        server.redirect('/page/html', '/html');
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        const response = await client.get('/page/html').expect(303);
        await client.get(response.header.location).expect(200, 'Hi');
    });
    it('creates a redirect route with a custom status code', async () => {
        const server = await givenAServer();
        server.controller(DummyController);
        server.redirect('/page/html', '/html', 307);
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        const response = await client.get('/page/html').expect(307);
        await client.get(response.header.location).expect(200, 'Hi');
    });
    it('isolates processing for concurrent requests', async () => {
        class MyController {
            hello() {
                return 'hello';
            }
            greet() {
                return 'greet';
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.get)('/hello'),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", []),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "hello", null);
        (0, tslib_1.__decorate)([
            (0, __1.get)('/greet'),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", []),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        const server = await givenAServer();
        server.controller(MyController);
        const client = (0, testlab_1.createClientForHandler)(server.requestHandler);
        const requests = [];
        for (let i = 0; i < 10; i++) {
            requests.push(client.get('/hello').expect(200, 'hello'), client.get('/greet').expect(200, 'greet'));
        }
        await Promise.all(requests);
    });
    describe('basePath', () => {
        const root = ASSETS;
        let server;
        beforeEach(async () => {
            server = await givenAServer({
                rest: {
                    basePath: '/api',
                    port: 0,
                },
            });
        });
        it('controls static assets', async () => {
            server.static('/html', root);
            const content = fs_1.default
                .readFileSync(path_1.default.join(root, 'index.html'))
                .toString('utf-8');
            await (0, testlab_1.createClientForHandler)(server.requestHandler)
                .get('/api/html/index.html')
                .expect('Content-Type', /text\/html/)
                .expect(200, content);
        });
        it('controls controller routes', async () => {
            server.controller(DummyController);
            await (0, testlab_1.createClientForHandler)(server.requestHandler)
                .get('/api/html')
                .expect(200, 'Hi');
        });
        it('reports 404 if not found', async () => {
            server.static('/html', root);
            server.controller(DummyController);
            await (0, testlab_1.createClientForHandler)(server.requestHandler)
                .get('/html')
                .expect(404);
        });
        it('controls server urls', async () => {
            const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/api/openapi.json');
            (0, testlab_1.expect)(response.body.servers).to.containEql({ url: '/api' });
        });
        it('controls server urls even when set via server.basePath() API', async () => {
            server.basePath('/v2');
            const response = await (0, testlab_1.createClientForHandler)(server.requestHandler).get('/v2/openapi.json');
            (0, testlab_1.expect)(response.body.servers).to.containEql({ url: '/v2' });
        });
        it('controls redirect locations', async () => {
            server.controller(DummyController);
            server.redirect('/page/html', '/html');
            const response = await (0, testlab_1.createClientForHandler)(server.requestHandler)
                .get('/api/page/html')
                .expect(303);
            await (0, testlab_1.createClientForHandler)(server.requestHandler)
                .get(response.header.location)
                .expect(200, 'Hi');
        });
    });
    async function givenAServer(options = { rest: { port: 0 } }) {
        options.rest = (0, testlab_1.givenHttpServerConfig)(options.rest);
        const app = new core_1.Application(options);
        app.component(__1.RestComponent);
        return app.getServer(__1.RestServer);
    }
    async function dummyRequestHandler(requestContext) {
        const { response } = requestContext;
        const result = await (0, express_1.invokeMiddleware)(requestContext, {
            chain: keys_1.RestTags.ACTION_MIDDLEWARE_CHAIN,
        });
        if (result === response)
            return;
        response.write('Hello');
        response.end();
    }
    class DummyController {
        constructor() { }
        ping() {
            return 'Hi';
        }
        hello() {
            return 'hello';
        }
    }
    (0, tslib_1.__decorate)([
        (0, __1.get)('/html', {
            responses: {},
        }),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", []),
        (0, tslib_1.__metadata)("design:returntype", String)
    ], DummyController.prototype, "ping", null);
    (0, tslib_1.__decorate)([
        (0, __1.get)('/endpoint', {
            responses: {},
        }),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", []),
        (0, tslib_1.__metadata)("design:returntype", String)
    ], DummyController.prototype, "hello", null);
    class DummyXmlController {
        constructor() { }
        echo(body) {
            return body;
        }
    }
    (0, tslib_1.__decorate)([
        (0, __1.post)('/'),
        (0, tslib_1.__param)(0, (0, __1.requestBody)({
            content: {
                'application/xml': {
                    schema: {
                        type: 'object',
                    },
                },
            },
        })),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Object]),
        (0, tslib_1.__metadata)("design:returntype", Object)
    ], DummyXmlController.prototype, "echo", null);
    function readFileFromDirectory(dirname, filename) {
        return readFileAsync(path_1.default.join(dirname, filename), { encoding: 'utf-8' });
    }
});
//# sourceMappingURL=rest.server.integration.js.map