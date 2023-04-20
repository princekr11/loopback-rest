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
const repository_1 = require("@loopback/repository");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
const keys_1 = require("../../../keys");
const consolidate_spec_enhancer_1 = require("../../../spec-enhancers/consolidate.spec-enhancer");
const info_spec_extension_1 = require("./fixtures/info.spec.extension");
describe('RestServer.getApiSpec()', () => {
    let app;
    let server;
    beforeEach(givenApplication);
    it('comes with a valid default spec', async () => {
        await (0, testlab_1.validateApiSpec)(await server.getApiSpec());
    });
    it('honours API defined via app.api()', async () => {
        server.api({
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            servers: [{ url: 'example.com:8080/api' }],
            paths: {},
            'x-foo': 'bar',
        });
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec).to.deepEqual({
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            servers: [{ url: 'example.com:8080/api' }],
            paths: {},
            'x-foo': 'bar',
        });
    });
    it('binds a route via app.route(route)', () => {
        function greet() { }
        const binding = server.route('get', '/greet', { responses: {} }, greet);
        (0, testlab_1.expect)(binding.key).to.eql('routes.get %2Fgreet');
        (0, testlab_1.expect)(binding.tagNames).containEql(keys_1.RestTags.REST_ROUTE);
        (0, testlab_1.expect)(binding.tagMap).containEql({
            [keys_1.RestTags.ROUTE_VERB]: 'get',
            [keys_1.RestTags.ROUTE_PATH]: '/greet',
        });
    });
    it('binds a route via app.route(..., Controller, method)', () => {
        class MyController {
            greet() { }
        }
        const binding = server.route('get', '/greet.json', { responses: {} }, MyController, (0, __1.createControllerFactoryForClass)(MyController), 'greet');
        (0, testlab_1.expect)(binding.key).to.eql('routes.get %2Fgreet%2Ejson');
        (0, testlab_1.expect)(binding.tagNames).containEql(keys_1.RestTags.REST_ROUTE);
        (0, testlab_1.expect)(binding.tagMap).containEql({
            [keys_1.RestTags.ROUTE_VERB]: 'get',
            [keys_1.RestTags.ROUTE_PATH]: '/greet.json',
        });
    });
    it('returns routes registered via app.route(route)', async () => {
        function greet() { }
        server.route('get', '/greet', { responses: {} }, greet);
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.paths).to.eql({
            '/greet': {
                get: {
                    responses: {},
                },
            },
        });
    });
    it('ignores routes marked as "x-visibility" via app.route(route)', async () => {
        function greet() { }
        function meet() { }
        server.route('get', '/greet', { 'x-visibility': 'undocumented', responses: {}, spec: {} }, greet);
        server.route('get', '/meet', { responses: {}, spec: {} }, meet);
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.paths).to.eql({
            '/meet': {
                get: {
                    responses: {},
                    spec: {},
                },
            },
        });
    });
    it('returns routes registered via app.route(..., Controller, method)', async () => {
        class MyController {
            greet() { }
        }
        server.route('get', '/greet', { responses: {} }, MyController, (0, __1.createControllerFactoryForClass)(MyController), 'greet');
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.paths).to.eql({
            '/greet': {
                get: {
                    responses: {},
                    'x-controller-name': 'MyController',
                    'x-operation-name': 'greet',
                    tags: ['MyController'],
                },
            },
        });
    });
    it('ignores routes marked as "x-visibility" via app.route(..., Controller, method)', async () => {
        class GreetController {
            greet() { }
        }
        class MeetController {
            meet() { }
        }
        server.route('get', '/greet', { 'x-visibility': 'undocumented', responses: {} }, GreetController, (0, __1.createControllerFactoryForClass)(GreetController), 'greet');
        server.route('get', '/meet', { responses: {} }, MeetController, (0, __1.createControllerFactoryForClass)(MeetController), 'meet');
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.paths).to.eql({
            '/meet': {
                get: {
                    responses: {},
                    'x-controller-name': 'MeetController',
                    'x-operation-name': 'meet',
                    tags: ['MeetController'],
                },
            },
        });
    });
    it('honors tags in the operation spec', async () => {
        class MyController {
            greet() { }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet', { responses: { '200': { description: '' } }, tags: ['MyTag'] }),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", []),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        app.controller(MyController);
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.paths).to.eql({
            '/greet': {
                get: {
                    responses: { '200': { description: '' } },
                    'x-controller-name': 'MyController',
                    'x-operation-name': 'greet',
                    operationId: 'MyController.greet',
                    tags: ['MyTag'],
                },
            },
        });
    });
    it('emits all media types for request body', async () => {
        const expectedOpSpec = (0, openapi_spec_builder_1.anOperationSpec)()
            .withRequestBody({
            description: 'Any object value.',
            required: true,
            content: {
                'application/json': {
                    schema: { type: 'object' },
                },
                'application/x-www-form-urlencoded': {
                    schema: { type: 'object' },
                },
            },
        })
            .withResponse(200, {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                    },
                },
            },
            description: '',
        })
            .build();
        class MyController {
            showBody(body) {
                return body;
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.post)('/show-body', expectedOpSpec),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Object]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "showBody", null);
        app.controller(MyController);
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.paths['/show-body'].post).to.containDeep(expectedOpSpec);
    });
    it('returns routes registered via app.controller()', async () => {
        class MyController {
            greet() { }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet'),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", []),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        app.controller(MyController);
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.paths).to.eql({
            '/greet': {
                get: {
                    responses: {
                        '200': { description: 'Return value of MyController.greet' },
                    },
                    'x-controller-name': 'MyController',
                    'x-operation-name': 'greet',
                    operationId: 'MyController.greet',
                    tags: ['MyController'],
                },
            },
        });
    });
    it('returns definitions inferred via app.controller()', async () => {
        var _a;
        let MyModel = class MyModel {
        };
        (0, tslib_1.__decorate)([
            (0, repository_1.property)(),
            (0, tslib_1.__metadata)("design:type", String)
        ], MyModel.prototype, "bar", void 0);
        MyModel = (0, tslib_1.__decorate)([
            (0, repository_1.model)()
        ], MyModel);
        class MyController {
            createFoo(foo) { }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.post)('/foo'),
            (0, tslib_1.__param)(0, (0, openapi_v3_1.requestBody)()),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [MyModel]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "createFoo", null);
        app.controller(MyController);
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)((_a = spec.components) === null || _a === void 0 ? void 0 : _a.schemas).to.deepEqual({
            MyModel: {
                title: 'MyModel',
                type: 'object',
                properties: {
                    bar: {
                        type: 'string',
                    },
                },
                additionalProperties: false,
            },
        });
    });
    it('preserves routes specified in app.api()', async () => {
        function status() { }
        server.api((0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/status', {
            'x-operation': status,
            responses: {},
        })
            .build());
        function greet() { }
        server.route('get', '/greet', { responses: {} }, greet);
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.paths).to.eql({
            '/greet': {
                get: {
                    responses: {},
                },
            },
            '/status': {
                get: {
                    'x-operation': status,
                    responses: {},
                },
            },
        });
    });
    it('registers consolidate enhancer', async () => {
        const enhancer = await server.OASEnhancer.getEnhancerByName('consolidate');
        (0, testlab_1.expect)(enhancer).to.be.instanceOf(consolidate_spec_enhancer_1.ConsolidationEnhancer);
    });
    it('invokes registered oas enhancers', async () => {
        const EXPECTED_SPEC_INFO = {
            title: 'LoopBack Test Application',
            version: '1.0.1',
        };
        server.add((0, core_1.createBindingFromClass)(info_spec_extension_1.TestInfoSpecEnhancer));
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.info).to.eql(EXPECTED_SPEC_INFO);
    });
    it('invokes info oas enhancers', async () => {
        const EXPECTED_SPEC_INFO = {
            title: 'MyApp',
            description: 'LoopBack Test Application',
            version: '1.0.1',
            contact: {
                name: 'Barney Rubble',
                email: 'b@rubble.com',
                url: 'http://barnyrubble.tumblr.com/',
            },
        };
        app.setMetadata({
            name: 'MyApp',
            description: 'LoopBack Test Application',
            version: '1.0.1',
            author: 'Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)',
        });
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.info).to.eql(EXPECTED_SPEC_INFO);
    });
    it('does not override customized oas.info', async () => {
        const EXPECTED_SPEC_INFO = {
            title: 'My LB App',
            version: '2.0',
            description: 'LoopBack Test Application',
            contact: {},
        };
        app.setMetadata({
            name: 'MyApp',
            description: 'LoopBack Test Application',
            version: '1.0.1',
            author: 'Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)',
        });
        server.api({
            openapi: '3.0.0',
            info: {
                title: 'My LB App',
                version: '2.0',
                contact: {},
            },
            paths: {},
        });
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.info).to.eql(EXPECTED_SPEC_INFO);
    });
    it('invokes info oas enhancers with author object', async () => {
        const EXPECTED_SPEC_INFO = {
            title: 'MyApp',
            description: '',
            version: '1.0.1',
            contact: {
                name: 'Barney Rubble',
                email: 'b@rubble.com',
                url: 'http://barnyrubble.tumblr.com/',
            },
        };
        app.setMetadata({
            name: 'MyApp',
            version: '1.0.1',
            description: '',
            author: {
                name: 'Barney Rubble',
                email: 'b@rubble.com',
                url: 'http://barnyrubble.tumblr.com/',
            },
        });
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.info).to.eql(EXPECTED_SPEC_INFO);
    });
    it('invokes info oas enhancers without author', async () => {
        const EXPECTED_SPEC_INFO = {
            title: 'MyApp',
            description: '',
            version: '1.0.1',
            contact: {},
        };
        app.setMetadata({
            name: 'MyApp',
            version: '1.0.1',
            description: '',
        });
        const spec = await server.getApiSpec();
        (0, testlab_1.expect)(spec.info).to.eql(EXPECTED_SPEC_INFO);
    });
    async function givenApplication() {
        app = new core_1.Application();
        app.component(__1.RestComponent);
        server = await app.getServer(__1.RestServer);
    }
});
//# sourceMappingURL=rest.server.open-api-spec.unit.js.map