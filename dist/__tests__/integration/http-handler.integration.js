"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const openapi_spec_builder_1 = require("@loopback/openapi-spec-builder");
const openapi_v3_1 = require("@loopback/openapi-v3");
const testlab_1 = require("@loopback/testlab");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const http_errors_1 = (0, tslib_1.__importDefault)(require("http-errors"));
const type_is_1 = require("type-is");
const __1 = require("../..");
const helpers_1 = require("../helpers");
const SequenceActions = __1.RestBindings.SequenceActions;
describe('HttpHandler', () => {
    let client;
    beforeEach(givenHandler);
    beforeEach(givenClient);
    context('with a simple HelloWorld controller', () => {
        beforeEach(function setupHelloController() {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperationReturningString('get', '/hello', 'greet')
                .build();
            class HelloController {
                async greet() {
                    return 'Hello world!';
                }
            }
            givenControllerClass(HelloController, spec);
        });
        it('handles simple "GET /hello" requests', () => {
            return client
                .get('/hello')
                .expect(200)
                .expect('content-type', 'text/plain')
                .expect('Hello world!');
        });
    });
    context('with a controller with operations at different paths/verbs', () => {
        beforeEach(function setupHelloController() {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperationReturningString('get', '/hello', 'hello')
                .withOperationReturningString('get', '/bye', 'bye')
                .withOperationReturningString('post', '/hello', 'postHello')
                .build();
            class HelloController {
                async hello() {
                    return 'hello';
                }
                async bye() {
                    return 'bye';
                }
                async postHello() {
                    return 'hello posted';
                }
            }
            givenControllerClass(HelloController, spec);
        });
        it('executes hello() for "GET /hello"', () => {
            return client.get('/hello').expect('hello');
        });
        it('executes bye() for "GET /bye"', () => {
            return client.get('/bye').expect('bye');
        });
        it('executes postHello() for "POST /hello', () => {
            return client.post('/hello').expect('hello posted');
        });
        it('returns 404 for path not handled', () => {
            logErrorsExcept(404);
            return client.get('/unknown-path').expect(404);
        });
        it('returns 404 for verb not handled', () => {
            logErrorsExcept(404);
            return client.post('/bye').expect(404);
        });
    });
    context('with an operation echoing a string parameter from query', () => {
        beforeEach(function setupEchoController() {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('get', '/echo', {
                'x-operation-name': 'echo',
                parameters: [
                    // the type cast is not required, but improves Intellisense
                    {
                        name: 'msg',
                        in: 'query',
                        type: 'string',
                    },
                ],
                responses: {
                    '200': {
                        schema: {
                            type: 'string',
                        },
                        description: '',
                    },
                },
            })
                .build();
            class EchoController {
                async echo(msg) {
                    return msg;
                }
            }
            givenControllerClass(EchoController, spec);
        });
        it('returns "hello" for "?msg=hello"', () => {
            return client.get('/echo?msg=hello').expect('hello');
        });
        it('url-decodes the parameter value', () => {
            return client.get('/echo?msg=hello%20world').expect('hello world');
        });
        it('ignores other query fields', () => {
            return client.get('/echo?msg=hello&ignoreKey=ignoreMe').expect('hello');
        });
    });
    context('with a path-parameter route', () => {
        beforeEach(givenRouteParamController);
        it('returns "admin" for "/users/admin"', () => {
            return client.get('/users/admin').expect('admin');
        });
        function givenRouteParamController() {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('get', '/users/{username}', {
                'x-operation-name': 'getUserByUsername',
                parameters: [
                    {
                        name: 'username',
                        in: 'path',
                        description: 'The name of the user to look up.',
                        required: true,
                        type: 'string',
                    },
                ],
                responses: {
                    200: {
                        schema: {
                            type: 'string',
                        },
                        description: '',
                    },
                },
            })
                .build();
            class RouteParamController {
                async getUserByUsername(userName) {
                    return userName;
                }
            }
            givenControllerClass(RouteParamController, spec);
        }
    });
    context('with a header-parameter route', () => {
        beforeEach(givenHeaderParamController);
        it('returns the value sent in the header', () => {
            return client
                .get('/show-authorization')
                .set('authorization', 'admin')
                .expect('admin');
        });
        function givenHeaderParamController() {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('get', '/show-authorization', {
                'x-operation-name': 'showAuthorization',
                parameters: [
                    {
                        name: 'Authorization',
                        in: 'header',
                        description: 'Authorization credentials.',
                        required: true,
                        type: 'string',
                    },
                ],
                responses: {
                    200: {
                        schema: {
                            type: 'string',
                        },
                        description: '',
                    },
                },
            })
                .build();
            class RouteParamController {
                async showAuthorization(auth) {
                    return auth;
                }
            }
            givenControllerClass(RouteParamController, spec);
        }
    });
    context('with a body request route', () => {
        let bodyParamControllerInvoked = false;
        beforeEach(() => {
            bodyParamControllerInvoked = false;
        });
        beforeEach(givenBodyParamController);
        it('returns the value sent in json-encoded body', () => {
            return client
                .post('/show-body')
                .send({ key: 'value' })
                .expect(200, { key: 'value' });
        });
        it('allows url-encoded request body', () => {
            return client
                .post('/show-body')
                .send('key=value')
                .expect(200, { key: 'value' });
        });
        it('returns 400 for malformed JSON body', () => {
            logErrorsExcept(400);
            return client
                .post('/show-body')
                .set('content-type', 'application/json')
                .send('malformed-json')
                .expect(400, {
                error: {
                    message: 'Unexpected token m in JSON at position 0',
                    name: 'SyntaxError',
                    statusCode: 400,
                },
            });
        });
        it('rejects unsupported request body', () => {
            logErrorsExcept(415);
            return client
                .post('/show-body')
                .set('content-type', 'application/xml')
                .send('<key>value</key>')
                .expect(415, {
                error: {
                    code: 'UNSUPPORTED_MEDIA_TYPE',
                    message: 'Content-type application/xml is not supported.',
                    name: 'UnsupportedMediaTypeError',
                    statusCode: 415,
                },
            });
        });
        it('rejects unmatched request body', () => {
            logErrorsExcept(415);
            return client
                .post('/show-body')
                .set('content-type', 'text/plain')
                .send('<key>value</key>')
                .expect(415, {
                error: {
                    code: 'UNSUPPORTED_MEDIA_TYPE',
                    message: 'Content-type text/plain does not match [application/json' +
                        ',application/x-www-form-urlencoded,application/xml].',
                    name: 'UnsupportedMediaTypeError',
                    statusCode: 415,
                },
            });
        });
        it('rejects over-limit request form body', () => {
            logErrorsExcept(413);
            return client
                .post('/show-body')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send('key=' + givenLargeRequest())
                .expect(413, {
                error: {
                    statusCode: 413,
                    name: 'PayloadTooLargeError',
                    message: 'request entity too large',
                },
            })
                .catch(ignorePipeError)
                .then(() => (0, testlab_1.expect)(bodyParamControllerInvoked).be.false());
        });
        it('rejects over-limit request json body', () => {
            logErrorsExcept(413);
            return client
                .post('/show-body')
                .set('content-type', 'application/json')
                .send({ key: givenLargeRequest() })
                .expect(413, {
                error: {
                    statusCode: 413,
                    name: 'PayloadTooLargeError',
                    message: 'request entity too large',
                },
            })
                .catch(ignorePipeError)
                .then(() => (0, testlab_1.expect)(bodyParamControllerInvoked).be.false());
        });
        it('allows customization of request body parser options', () => {
            const body = { key: givenLargeRequest() };
            rootContext
                .bind(__1.RestBindings.REQUEST_BODY_PARSER_OPTIONS)
                .to({ limit: '4mb' }); // Set limit to 4MB
            return client
                .post('/show-body')
                .set('content-type', 'application/json')
                .send(body)
                .expect(200, body);
        });
        it('allows request body parser extensions', () => {
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
            // Register a request body parser for xml
            rootContext.add((0, __1.createBodyParserBinding)(XmlBodyParser));
            return client
                .post('/show-body')
                .set('content-type', 'application/xml')
                .send(body)
                .expect(200, { key: 'value' });
        });
        /**
         * Ignore the EPIPE and ECONNRESET errors.
         * See https://github.com/nodejs/node/issues/12339
         * @param err
         */
        function ignorePipeError(err) {
            // The server side can close the socket before the client
            // side can send out all data. For example, `response.end()`
            // is called before all request data has been processed due
            // to size limit.
            // On Windows, ECONNRESET is sometimes emitted instead of EPIPE.
            if ((err === null || err === void 0 ? void 0 : err.code) !== 'EPIPE' && (err === null || err === void 0 ? void 0 : err.code) !== 'ECONNRESET')
                throw err;
        }
        function givenLargeRequest() {
            const data = Buffer.alloc(2 * 1024 * 1024, 'A', 'utf-8');
            return data.toString();
        }
        function givenBodyParamController() {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('post', '/show-body', {
                'x-operation-name': 'showBody',
                requestBody: {
                    description: 'Any object value.',
                    required: true,
                    content: {
                        'application/json': {
                            schema: { type: 'object' },
                        },
                        'application/x-www-form-urlencoded': {
                            schema: { type: 'object' },
                        },
                        'application/xml': {
                            schema: { type: 'object' },
                        },
                    },
                },
                responses: {
                    200: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                },
                            },
                        },
                        description: '',
                    },
                },
            })
                .build();
            class RouteParamController {
                async showBody(data) {
                    bodyParamControllerInvoked = true;
                    return data;
                }
            }
            givenControllerClass(RouteParamController, spec);
        }
    });
    context('response serialization', () => {
        it('converts object result to a JSON response', () => {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('get', '/object', {
                'x-operation-name': 'getObject',
                responses: {
                    '200': { schema: { type: 'object' }, description: '' },
                },
            })
                .build();
            class TestController {
                async getObject() {
                    return { key: 'value' };
                }
            }
            givenControllerClass(TestController, spec);
            return client
                .get('/object')
                .expect(200)
                .expect('content-type', /^application\/json($|;)/)
                .expect('{"key":"value"}');
        });
    });
    context('error handling', () => {
        it('handles errors thrown by controller constructor', () => {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperationReturningString('get', '/hello', 'greet')
                .build();
            class ThrowingController {
                constructor() {
                    throw new Error('Thrown from constructor.');
                }
            }
            givenControllerClass(ThrowingController, spec);
            logErrorsExcept(500);
            return client.get('/hello').expect(500, {
                error: {
                    message: 'Internal Server Error',
                    statusCode: 500,
                },
            });
        });
        it('handles invocation of an unknown method', async () => {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('get', '/hello', (0, openapi_spec_builder_1.anOperationSpec)().withOperationName('unknownMethod'))
                .build();
            class TestController {
            }
            givenControllerClass(TestController, spec);
            logErrorsExcept(404);
            await client.get('/hello').expect(404, {
                error: {
                    message: 'Controller method not found: get /hello => TestController.unknownMethod',
                    name: 'NotFoundError',
                    statusCode: 404,
                },
            });
        });
        it('handles errors thrown from the method', async () => {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('get', '/hello', (0, openapi_spec_builder_1.anOperationSpec)().withOperationName('hello'))
                .build();
            class TestController {
                hello() {
                    throw new http_errors_1.default.BadRequest('Bad hello');
                }
            }
            (0, tslib_1.__decorate)([
                (0, openapi_v3_1.get)('/hello'),
                (0, tslib_1.__metadata)("design:type", Function),
                (0, tslib_1.__metadata)("design:paramtypes", []),
                (0, tslib_1.__metadata)("design:returntype", void 0)
            ], TestController.prototype, "hello", null);
            givenControllerClass(TestController, spec);
            logErrorsExcept(400);
            await client.get('/hello').expect(400, {
                error: {
                    message: 'Bad hello',
                    name: 'BadRequestError',
                    statusCode: 400,
                },
            });
        });
        it('handles 500 error thrown from the method', async () => {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('get', '/hello', (0, openapi_spec_builder_1.anOperationSpec)().withOperationName('hello'))
                .build();
            class TestController {
                hello() {
                    throw new http_errors_1.default.InternalServerError('Bad hello');
                }
            }
            (0, tslib_1.__decorate)([
                (0, openapi_v3_1.get)('/hello'),
                (0, tslib_1.__metadata)("design:type", Function),
                (0, tslib_1.__metadata)("design:paramtypes", []),
                (0, tslib_1.__metadata)("design:returntype", void 0)
            ], TestController.prototype, "hello", null);
            givenControllerClass(TestController, spec);
            logErrorsExcept(500);
            await client.get('/hello').expect(500, {
                error: {
                    message: 'Internal Server Error',
                    statusCode: 500,
                },
            });
        });
        it('respects error handler options', async () => {
            rootContext.bind(__1.RestBindings.ERROR_WRITER_OPTIONS).to({ debug: true });
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperation('get', '/hello', (0, openapi_spec_builder_1.anOperationSpec)().withOperationName('hello'))
                .build();
            class TestController {
                hello() {
                    throw new http_errors_1.default.InternalServerError('Bad hello');
                }
            }
            (0, tslib_1.__decorate)([
                (0, openapi_v3_1.get)('/hello'),
                (0, tslib_1.__metadata)("design:type", Function),
                (0, tslib_1.__metadata)("design:paramtypes", []),
                (0, tslib_1.__metadata)("design:returntype", void 0)
            ], TestController.prototype, "hello", null);
            givenControllerClass(TestController, spec);
            logErrorsExcept(500);
            const response = await client.get('/hello').expect(500);
            (0, testlab_1.expect)(response.body.error).to.containDeep({
                message: 'Bad hello',
                statusCode: 500,
            });
        });
    });
    let rootContext;
    let handler;
    function givenHandler() {
        rootContext = new core_1.Context();
        rootContext
            .bind(SequenceActions.FIND_ROUTE)
            .toDynamicValue(__1.FindRouteProvider);
        rootContext
            .bind(SequenceActions.PARSE_PARAMS)
            .toDynamicValue(__1.ParseParamsProvider);
        rootContext
            .bind(SequenceActions.INVOKE_METHOD)
            .toDynamicValue(__1.InvokeMethodProvider);
        rootContext
            .bind(SequenceActions.LOG_ERROR)
            .to((0, testlab_1.createUnexpectedHttpErrorLogger)());
        rootContext.bind(SequenceActions.SEND).to(__1.writeResultToResponse);
        rootContext.bind(SequenceActions.REJECT).toDynamicValue(__1.RejectProvider);
        rootContext.bind(__1.RestBindings.SEQUENCE).toClass(__1.DefaultSequence);
        [
            (0, __1.createBodyParserBinding)(__1.JsonBodyParser, __1.RestBindings.REQUEST_BODY_PARSER_JSON),
            (0, __1.createBodyParserBinding)(__1.TextBodyParser, __1.RestBindings.REQUEST_BODY_PARSER_TEXT),
            (0, __1.createBodyParserBinding)(__1.UrlEncodedBodyParser, __1.RestBindings.REQUEST_BODY_PARSER_URLENCODED),
            (0, __1.createBodyParserBinding)(__1.RawBodyParser, __1.RestBindings.REQUEST_BODY_PARSER_RAW),
            (0, __1.createBodyParserBinding)(__1.StreamBodyParser, __1.RestBindings.REQUEST_BODY_PARSER_STREAM),
        ].forEach(binding => rootContext.add(binding));
        rootContext
            .bind(__1.RestBindings.REQUEST_BODY_PARSER)
            .toClass(__1.RequestBodyParser);
        handler = new __1.HttpHandler(rootContext, (0, helpers_1.aRestServerConfig)());
        rootContext.bind(__1.RestBindings.HANDLER).to(handler);
    }
    function logErrorsExcept(ignoreStatusCode) {
        rootContext
            .bind(SequenceActions.LOG_ERROR)
            .to((0, testlab_1.createUnexpectedHttpErrorLogger)(ignoreStatusCode));
    }
    function givenControllerClass(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctor, spec) {
        handler.registerController(spec, ctor);
    }
    function givenClient() {
        const app = (0, express_1.default)();
        app.use((req, res) => {
            handler.handleRequest(req, res).catch(err => {
                // This should never happen. If we ever get here,
                // then it means "handler.handlerRequest()" crashed unexpectedly.
                // We need to make a lot of helpful noise in such case.
                console.error('Request failed.', err.stack);
                if (res.headersSent)
                    return;
                res.statusCode = 500;
                res.end();
            });
        });
        client = (0, testlab_1.createClientForHandler)(app);
    }
});
//# sourceMappingURL=http-handler.integration.js.map