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
const __1 = require("../../..");
const SequenceActions = __1.RestBindings.SequenceActions;
/* # Feature: Sequence
 * - In order to build REST APIs
 * - As a framework developer
 * - I want the framework to handle default sequence and user defined sequence
 */
describe('Sequence', () => {
    let app;
    let server;
    beforeEach(givenAppWithController);
    it('provides a default sequence', async () => {
        await whenIRequest().get('/name').expect('SequenceApp');
    });
    it('allows users to define a custom sequence as a function', () => {
        server.handler(({ response }, sequence) => {
            sequence.send(response, 'hello world');
        });
        return whenIRequest().get('/').expect('hello world');
    });
    it('allows users to define a custom sequence as a class', async () => {
        let MySequence = class MySequence {
            constructor(send) {
                this.send = send;
            }
            async handle({ response }) {
                this.send(response, 'hello world');
            }
        };
        MySequence = (0, tslib_1.__decorate)([
            (0, tslib_1.__param)(0, (0, core_1.inject)(SequenceActions.SEND)),
            (0, tslib_1.__metadata)("design:paramtypes", [Function])
        ], MySequence);
        // bind user defined sequence
        server.sequence(MySequence);
        await whenIRequest().get('/').expect('hello world');
    });
    it('allows users to bind a custom sequence class', () => {
        let MySequence = class MySequence {
            constructor(findRoute, parseParams, invoke, send) {
                this.findRoute = findRoute;
                this.parseParams = parseParams;
                this.invoke = invoke;
                this.send = send;
            }
            async handle(context) {
                const { request, response } = context;
                const route = this.findRoute(request);
                const args = await this.parseParams(request, route);
                const result = await this.invoke(route, args);
                this.send(response, `MySequence ${result}`);
            }
        };
        MySequence = (0, tslib_1.__decorate)([
            (0, tslib_1.__param)(0, (0, core_1.inject)(SequenceActions.FIND_ROUTE)),
            (0, tslib_1.__param)(1, (0, core_1.inject)(SequenceActions.PARSE_PARAMS)),
            (0, tslib_1.__param)(2, (0, core_1.inject)(SequenceActions.INVOKE_METHOD)),
            (0, tslib_1.__param)(3, (0, core_1.inject)(SequenceActions.SEND)),
            (0, tslib_1.__metadata)("design:paramtypes", [Function, Function, Function, Function])
        ], MySequence);
        server.sequence(MySequence);
        return whenIRequest().get('/name').expect('MySequence SequenceApp');
    });
    it('allows users to bind a custom sequence class via app.sequence()', async () => {
        let MySequence = class MySequence {
            constructor(send) {
                this.send = send;
            }
            async handle({ response }) {
                this.send(response, 'MySequence was invoked.');
            }
        };
        MySequence = (0, tslib_1.__decorate)([
            (0, tslib_1.__param)(0, (0, core_1.inject)(SequenceActions.SEND)),
            (0, tslib_1.__metadata)("design:paramtypes", [Function])
        ], MySequence);
        const restApp = new __1.RestApplication();
        restApp.sequence(MySequence);
        await whenIRequest(restApp).get('/name').expect('MySequence was invoked.');
    });
    it('user-defined Send', () => {
        const send = (response, result) => {
            response.setHeader('content-type', 'text/plain');
            response.end(`CUSTOM FORMAT: ${result}`);
        };
        server.bind(SequenceActions.SEND).to(send);
        return whenIRequest().get('/name').expect('CUSTOM FORMAT: SequenceApp');
    });
    it('user-defined Reject', () => {
        const reject = ({ response }, error) => {
            response.statusCode = 418; // I'm a teapot
            response.end();
        };
        server.bind(SequenceActions.REJECT).to(reject);
        return whenIRequest().get('/unknown-url').expect(418);
    });
    it('makes ctx available in a custom sequence handler function', () => {
        app.bind('test').to('hello world');
        server.handler((context, sequence) => {
            sequence.send(context.response, context.getSync('test'));
        });
        return whenIRequest().get('/').expect('hello world');
    });
    it('makes ctx available in a custom sequence class', () => {
        let MySequence = class MySequence extends __1.DefaultSequence {
            constructor(findRoute, parseParams, invoke, send, reject) {
                super(findRoute, parseParams, invoke, send, reject);
                this.findRoute = findRoute;
                this.parseParams = parseParams;
                this.invoke = invoke;
                this.send = send;
                this.reject = reject;
            }
            async handle(context) {
                this.send(context.response, context.getSync('test'));
            }
        };
        MySequence = (0, tslib_1.__decorate)([
            (0, tslib_1.__param)(0, (0, core_1.inject)(SequenceActions.FIND_ROUTE)),
            (0, tslib_1.__param)(1, (0, core_1.inject)(SequenceActions.PARSE_PARAMS)),
            (0, tslib_1.__param)(2, (0, core_1.inject)(SequenceActions.INVOKE_METHOD)),
            (0, tslib_1.__param)(3, (0, core_1.inject)(SequenceActions.SEND)),
            (0, tslib_1.__param)(4, (0, core_1.inject)(SequenceActions.REJECT)),
            (0, tslib_1.__metadata)("design:paramtypes", [Function, Function, Function, Function, Function])
        ], MySequence);
        server.sequence(MySequence);
        app.bind('test').to('hello world');
        return whenIRequest().get('/').expect('hello world');
    });
    it('allows CORS middleware to produce an http response', () => {
        server.sequence(__1.DefaultSequence);
        app.bind('test').to('hello world');
        // Response from `CORS`
        return whenIRequest()
            .options('/')
            .expect(204)
            .expect('access-control-allow-origin', '*');
    });
    it('allows OpenAPI middleware to produce an http response', () => {
        server.sequence(__1.DefaultSequence);
        app.bind('test').to('hello world');
        // Response from `OpenAPI`
        return whenIRequest().get('/openapi.json').expect(200);
    });
    async function givenAppWithController() {
        await givenAnApplication();
        app.bind('application.name').to('SequenceApp');
        const apispec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/name', {
            'x-operation-name': 'getName',
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
        let InfoController = class InfoController {
            constructor(appName) {
                this.appName = appName;
            }
            async getName() {
                return this.appName;
            }
        };
        InfoController = (0, tslib_1.__decorate)([
            (0, openapi_v3_1.api)(apispec),
            (0, tslib_1.__param)(0, (0, core_1.inject)('application.name')),
            (0, tslib_1.__metadata)("design:paramtypes", [String])
        ], InfoController);
        givenControllerInServer(InfoController);
    }
    /* ===== HELPERS ===== */
    async function givenAnApplication() {
        app = new core_1.Application();
        app.component(__1.RestComponent);
        server = await app.getServer(__1.RestServer);
    }
    function givenControllerInServer(controller) {
        app.controller(controller);
    }
    function whenIRequest(restServerOrApp = server) {
        return (0, testlab_1.createClientForHandler)(restServerOrApp.requestHandler);
    }
});
//# sourceMappingURL=sequence.acceptance.js.map