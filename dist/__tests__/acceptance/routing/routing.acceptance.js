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
/* # Feature: Routing
 * - In order to build REST APIs
 * - As an app developer
 * - I want the framework to handle the request to controller method routing
 * - So that I can focus on my implementing the methods and not the routing
 */
describe('Routing', () => {
    /* ## Scenario: Basic Usage
     * - Given an `Application`
     * - And API spec describing a single endpoint accepting a "msg" query field
     * - And a controller implementing that API spec
     * - When I make a request to the `Application` with `?msg=hello%20world`
     * - Then I get the result `hello world` from the `Method`
     */
    it('supports basic usage', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/echo', (0, openapi_spec_builder_1.anOperationSpec)()
            .withOperationName('echo')
            .withParameter({
            name: 'msg',
            in: 'query',
            type: 'string',
        })
            .withStringResponse())
            .build();
        let EchoController = class EchoController {
            async echo(msg) {
                return msg;
            }
        };
        EchoController = (0, tslib_1.__decorate)([
            (0, openapi_v3_1.api)(spec)
        ], EchoController);
        givenControllerInApp(app, EchoController);
        return (whenIMakeRequestTo(server)
            .get('/echo?msg=hello%20world')
            // Then I get the result `hello world` from the `Method`
            .expect('hello world'));
    });
    it('allows controllers to define the API using decorators', async () => {
        const spec = (0, openapi_spec_builder_1.anOperationSpec)()
            .withParameter({ name: 'name', in: 'query', type: 'string' })
            .withStringResponse()
            .build();
        class MyController {
            greet(name) {
                return `hello ${name}`;
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet', spec),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        const app = givenAnApplication();
        const server = await givenAServer(app);
        givenControllerInApp(app, MyController);
        return (whenIMakeRequestTo(server)
            .get('/greet?name=world')
            // Then I get the result `hello world` from the `Method`
            .expect('hello world'));
    });
    it('allows controllers to define params via decorators', async () => {
        class MyController {
            greet(name) {
                return `hello ${name}`;
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.query.string('name')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        const app = givenAnApplication();
        const server = await givenAServer(app);
        givenControllerInApp(app, MyController);
        return (whenIMakeRequestTo(server)
            .get('/greet?name=world')
            // Then I get the result `hello world` from the `Method`
            .expect('hello world'));
    });
    it('allows controllers to define requestBody via decorator', async () => {
        class MyController {
            greet(message) {
                return message;
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.post)('/greet'),
            (0, tslib_1.__param)(0, (0, openapi_v3_1.requestBody)()),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Object]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        const app = givenAnApplication();
        const server = await givenAServer(app);
        givenControllerInApp(app, MyController);
        const greeting = { greeting: 'hello world' };
        return whenIMakeRequestTo(server)
            .post('/greet')
            .send(greeting)
            .expect(greeting);
    });
    it('allows mixed use of @requestBody and @param', async () => {
        class MyController {
            greet(language, message) {
                return Object.assign(message, { language: language });
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.post)('/greet'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.header.string('language')),
            (0, tslib_1.__param)(1, (0, openapi_v3_1.requestBody)()),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String, Object]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        const app = givenAnApplication();
        const server = await givenAServer(app);
        givenControllerInApp(app, MyController);
        return whenIMakeRequestTo(server)
            .post('/greet')
            .set('language', 'English')
            .send({ greeting: 'hello world' })
            .expect({ greeting: 'hello world', language: 'English' });
    });
    it('allows controllers to use method DI with mixed params', async () => {
        class MyController {
            greet(name, prefix) {
                return `${prefix} ${name}`;
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.query.string('name')),
            (0, tslib_1.__param)(1, (0, core_1.inject)('hello.prefix')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String, String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        const app = givenAnApplication();
        app.bind('hello.prefix').to('Hello');
        const server = await givenAServer(app);
        givenControllerInApp(app, MyController);
        return (whenIMakeRequestTo(server)
            .get('/greet?name=world')
            // Then I get the result `hello world` from the `Method`
            .expect('Hello world'));
    });
    it('allows controllers to use method DI without rest params', async () => {
        class MyController {
            greet(prefix) {
                return `${prefix} world`;
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet'),
            (0, tslib_1.__param)(0, (0, core_1.inject)('hello.prefix')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        const app = givenAnApplication();
        app.bind('hello.prefix').to('Hello');
        const server = await givenAServer(app);
        givenControllerInApp(app, MyController);
        return (whenIMakeRequestTo(server)
            .get('/greet')
            // Then I get the result `hello world` from the `Method`
            .expect('Hello world'));
    });
    it('reports an error if not all parameters can be resolved', async () => {
        class MyController {
            greet(firstName, lastName, prefix) {
                return `${prefix} ${firstName} ${lastName}`;
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.query.string('firstName')),
            (0, tslib_1.__param)(2, (0, core_1.inject)('hello.prefix')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String, String, String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        const app = givenAnApplication();
        app.bind('hello.prefix').to('Hello');
        const server = await givenAServer(app);
        givenControllerInApp(app, MyController);
        suppressErrorLogsForExpectedHttpError(app, 500);
        return (0, testlab_1.expect)(whenIMakeRequestTo(server).get('/greet?firstName=John'))
            .to.be.rejectedWith('Cannot resolve injected arguments for ' +
            'MyController.prototype.greet[1]: The arguments[1] is not ' +
            'decorated for dependency injection, but a value is not supplied')
            .catch(err => { });
    });
    it('injects controller constructor arguments', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        server.bind('application.name').to('TestApp');
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/name', (0, openapi_spec_builder_1.anOperationSpec)().withOperationName('getName').withStringResponse())
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
            (0, openapi_v3_1.api)(spec),
            (0, tslib_1.__param)(0, (0, core_1.inject)('application.name')),
            (0, tslib_1.__metadata)("design:paramtypes", [String])
        ], InfoController);
        givenControllerInApp(app, InfoController);
        return whenIMakeRequestTo(server).get('/name').expect('TestApp');
    });
    it('creates a new child context for each request', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        server.bind('flag').to('original');
        // create a special binding returning the current context instance
        server.bind('context').getValue = (ctx) => ctx;
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('put', '/flag', 'setFlag')
            .withOperationReturningString('get', '/flag', 'getFlag')
            .build();
        let FlagController = class FlagController {
            constructor(ctx) {
                this.ctx = ctx;
            }
            async setFlag() {
                this.ctx.bind('flag').to('modified');
                return 'modified';
            }
            async getFlag() {
                return this.ctx.get('flag');
            }
        };
        FlagController = (0, tslib_1.__decorate)([
            (0, openapi_v3_1.api)(spec),
            (0, tslib_1.__param)(0, (0, core_1.inject)('context')),
            (0, tslib_1.__metadata)("design:paramtypes", [core_1.Context])
        ], FlagController);
        givenControllerInApp(app, FlagController);
        // Rebind "flag" to "modified". Since we are modifying
        // the per-request child context, the change should
        // be discarded after the request is done.
        await whenIMakeRequestTo(server).put('/flag');
        // Get the value "flag" is bound to.
        // This should return the original value.
        await whenIMakeRequestTo(server).get('/flag').expect('original');
    });
    it('binds request and response objects', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('get', '/status', 'getStatus')
            .withOperationReturningString('get', '/header', 'getHeader')
            .build();
        let StatusController = class StatusController {
            constructor(request, response) {
                this.request = request;
                this.response = response;
            }
            async getStatus() {
                this.response.statusCode = 202; // 202 Accepted
                return this.request.method;
            }
            async getHeader() {
                this.response.status(202);
                this.response.set('x-custom-res-header', 'xyz');
                return this.request.method;
            }
        };
        StatusController = (0, tslib_1.__decorate)([
            (0, openapi_v3_1.api)(spec),
            (0, tslib_1.__param)(0, (0, core_1.inject)(__1.RestBindings.Http.REQUEST)),
            (0, tslib_1.__param)(1, (0, core_1.inject)(__1.RestBindings.Http.RESPONSE)),
            (0, tslib_1.__metadata)("design:paramtypes", [Object, Object])
        ], StatusController);
        givenControllerInApp(app, StatusController);
        await whenIMakeRequestTo(server).get('/status').expect(202, 'GET');
        await whenIMakeRequestTo(server)
            .get('/header')
            .expect(202)
            .expect('x-custom-res-header', 'xyz');
    });
    it('binds controller constructor object and operation', async () => {
        var GetCurrentController_1;
        const app = givenAnApplication();
        const server = await givenAServer(app);
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('get', '/name', 'getControllerName')
            .build();
        let GetCurrentController = GetCurrentController_1 = class GetCurrentController {
            constructor(ctor, operation) {
                this.ctor = ctor;
                this.operation = operation;
                (0, testlab_1.expect)(GetCurrentController_1).eql(ctor);
            }
            async getControllerName() {
                return {
                    ctor: this.ctor.name,
                    operation: this.operation,
                };
            }
        };
        GetCurrentController = GetCurrentController_1 = (0, tslib_1.__decorate)([
            (0, openapi_v3_1.api)(spec),
            (0, tslib_1.__param)(0, (0, core_1.inject)(core_1.CoreBindings.CONTROLLER_CLASS)),
            (0, tslib_1.__param)(1, (0, core_1.inject)(core_1.CoreBindings.CONTROLLER_METHOD_NAME)),
            (0, tslib_1.__metadata)("design:paramtypes", [Function, String])
        ], GetCurrentController);
        givenControllerInApp(app, GetCurrentController);
        return whenIMakeRequestTo(server).get('/name').expect({
            ctor: 'GetCurrentController',
            operation: 'getControllerName',
        });
    });
    describe('current controller', () => {
        let app;
        let server;
        let controllerClass;
        beforeEach(setupApplicationAndServer);
        beforeEach(setupController);
        it('binds current controller resolved from a transient binding', async () => {
            givenControllerInApp(app, controllerClass);
            await whenIMakeRequestTo(server).get('/name').expect({
                count: 1,
                isSingleton: false,
                result: true,
            });
            // Make a second call
            await whenIMakeRequestTo(server).get('/name').expect({
                count: 1,
                isSingleton: false,
                result: true,
            });
        });
        it('binds current controller resolved from a singleton binding', async () => {
            app.controller(controllerClass).inScope(core_1.BindingScope.SINGLETON);
            await whenIMakeRequestTo(server).get('/name').expect({
                count: 1,
                isSingleton: true,
                result: true,
            });
            // Make a second call
            await whenIMakeRequestTo(server).get('/name').expect({
                count: 2,
                isSingleton: true,
                result: true,
            });
        });
        async function setupApplicationAndServer() {
            app = givenAnApplication();
            server = await givenAServer(app);
        }
        async function setupController() {
            const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
                .withOperationReturningString('get', '/name', 'checkController')
                .build();
            let GetCurrentController = class GetCurrentController {
                constructor() {
                    this.count = 0;
                }
                async checkController(inst, currentInst) {
                    return {
                        count: ++this.count,
                        isSingleton: this === inst,
                        result: this === currentInst,
                    };
                }
            };
            (0, tslib_1.__decorate)([
                (0, tslib_1.__param)(0, (0, core_1.inject)('controllers.GetCurrentController')),
                (0, tslib_1.__param)(1, (0, core_1.inject)(core_1.CoreBindings.CONTROLLER_CURRENT)),
                (0, tslib_1.__metadata)("design:type", Function),
                (0, tslib_1.__metadata)("design:paramtypes", [GetCurrentController,
                    GetCurrentController]),
                (0, tslib_1.__metadata)("design:returntype", Promise)
            ], GetCurrentController.prototype, "checkController", null);
            GetCurrentController = (0, tslib_1.__decorate)([
                (0, openapi_v3_1.api)(spec)
            ], GetCurrentController);
            controllerClass = GetCurrentController;
        }
    });
    it('supports function-based routes', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        const routeSpec = {
            parameters: [
                { name: 'name', in: 'query', type: 'string' },
            ],
            responses: {
                200: {
                    description: 'greeting text',
                    schema: { type: 'string' },
                },
            },
        };
        function greet(name) {
            return `hello ${name}`;
        }
        server.route('get', '/greet', routeSpec, greet);
        const client = whenIMakeRequestTo(server);
        await client.get('/greet?name=world').expect(200, 'hello world');
    });
    it('supports handler routes declared via API specification', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        function greet(name) {
            return `hello ${name}`;
        }
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/greet', (0, openapi_spec_builder_1.anOperationSpec)()
            .withParameter({ name: 'name', in: 'query', type: 'string' })
            .withExtension('x-operation', greet))
            .build();
        server.api(spec);
        const client = whenIMakeRequestTo(server);
        await client.get('/greet?name=world').expect(200, 'hello world');
    });
    it('supports API spec with no paths property', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)().build();
        spec.paths = {};
        server.api(spec);
    });
    it('supports API spec with a path with no verbs', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)().build();
        spec.paths = { '/greet': {} };
        server.api(spec);
    });
    it('supports controller routes declared via API spec', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
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
        server.api(spec);
        app.controller(MyController);
        const client = whenIMakeRequestTo(server);
        await client.get('/greet?name=world').expect(200, 'hello world');
    });
    it('supports controller routes declared via API spec with basePath', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        let MyController = class MyController {
            greet(name) {
                return `hello ${name}`;
            }
        };
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.query.string('name')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "greet", null);
        MyController = (0, tslib_1.__decorate)([
            (0, openapi_v3_1.api)({ basePath: '/my' })
        ], MyController);
        app.controller(MyController);
        const client = whenIMakeRequestTo(server);
        await client.get('/my/greet?name=world').expect(200, 'hello world');
    });
    it('reports operations bound to unknown controller', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/greet', (0, openapi_spec_builder_1.anOperationSpec)()
            .withOperationName('greet')
            .withExtension('x-controller-name', 'UnknownController'))
            .build();
        server.api(spec);
        return server.start().then(ok => {
            throw new Error('server.start() should have failed');
        }, err => (0, testlab_1.expect)(err.message).to.match(/UnknownController/));
    });
    it('reports operations with no handler', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('get', '/greet')
            .build();
        server.api(spec);
        return server.start().then(ok => {
            throw new Error('server.start() should have failed');
        }, err => (0, testlab_1.expect)(err.message).to.match(/no handler/));
    });
    it('supports controller routes defined via server.route()', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        class MyController {
            greet(name) {
                return `hello ${name}`;
            }
        }
        const spec = (0, openapi_spec_builder_1.anOperationSpec)()
            .withParameter({ name: 'name', in: 'query', type: 'string' })
            .build();
        server.route('get', '/greet', spec, MyController, (0, __1.createControllerFactoryForClass)(MyController), 'greet');
        const client = whenIMakeRequestTo(server);
        await client.get('/greet?name=world').expect(200, 'hello world');
    });
    it('supports controller routes with factory defined via server.route()', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        class MyController {
            greet(name) {
                return `hello ${name}`;
            }
        }
        const spec = (0, openapi_spec_builder_1.anOperationSpec)()
            .withParameter({ name: 'name', in: 'query', type: 'string' })
            .build();
        const factory = (0, __1.createControllerFactoryForClass)(MyController);
        server.route('get', '/greet', spec, MyController, factory, 'greet');
        const client = whenIMakeRequestTo(server);
        await client.get('/greet?name=world').expect(200, 'hello world');
    });
    describe('RestApplication', () => {
        it('supports function-based routes declared via app.route()', async () => {
            const app = new __1.RestApplication();
            const routeSpec = {
                parameters: [
                    { name: 'name', in: 'query', type: 'string' },
                ],
                responses: {
                    200: {
                        description: 'greeting text',
                        schema: { type: 'string' },
                    },
                },
            };
            function greet(name) {
                return `hello ${name}`;
            }
            app.route('get', '/greet', routeSpec, greet);
            await whenIMakeRequestTo(app)
                .get('/greet?name=world')
                .expect(200, 'hello world');
        });
        it('supports controller routes declared via app.api()', async () => {
            const app = new __1.RestApplication();
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
            app.api(spec);
            app.controller(MyController);
            await whenIMakeRequestTo(app)
                .get('/greet?name=world')
                .expect(200, 'hello world');
        });
        it('supports controller routes defined via app.route()', async () => {
            const app = new __1.RestApplication();
            class MyController {
                greet(name) {
                    return `hello ${name}`;
                }
            }
            const spec = (0, openapi_spec_builder_1.anOperationSpec)()
                .withParameter({ name: 'name', in: 'query', type: 'string' })
                .build();
            const factory = (0, __1.createControllerFactoryForClass)(MyController);
            app.route('get', '/greet', spec, MyController, factory, 'greet');
            await whenIMakeRequestTo(app)
                .get('/greet?name=world')
                .expect(200, 'hello world');
        });
        it('supports controller routes via app.route() with a factory', async () => {
            const app = new __1.RestApplication();
            class MyController {
                greet(name) {
                    return `hello ${name}`;
                }
            }
            class MySubController extends MyController {
                greet(name) {
                    return super.greet(name) + '!';
                }
            }
            const spec = (0, openapi_spec_builder_1.anOperationSpec)()
                .withParameter({ name: 'name', in: 'query', type: 'string' })
                .build();
            const factory = (0, __1.createControllerFactoryForInstance)(new MySubController());
            app.route('get', '/greet', spec, MyController, factory, 'greet');
            await whenIMakeRequestTo(app)
                .get('/greet?name=world')
                .expect(200, 'hello world!');
        });
        it('provides httpHandler compatible with HTTP server API', async () => {
            const app = new __1.RestApplication();
            app.handler(({ response }, sequence) => response.end('hello'));
            await (0, testlab_1.createClientForHandler)(app.requestHandler)
                .get('/')
                .expect(200, 'hello');
        });
        it('allows pluggable router', async () => {
            const app = new __1.RestApplication();
            app.bind(__1.RestBindings.ROUTER).toClass(__1.RegExpRouter);
            const server = await app.getServer(__1.RestServer);
            const handler = await server.get(__1.RestBindings.HANDLER);
            // Use a hack to verify the bound router is used by the handler
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (0, testlab_1.expect)(handler._routes._router).to.be.instanceof(__1.RegExpRouter);
        });
        it('matches routes based on their specifics', async () => {
            const app = new __1.RestApplication();
            app.route('get', '/greet/{name}', (0, openapi_spec_builder_1.anOperationSpec)()
                .withParameter({ name: 'name', in: 'path', type: 'string' })
                .build(), (name) => `hello ${name}`);
            app.route('get', '/greet/world', (0, openapi_spec_builder_1.anOperationSpec)().build(), () => 'HELLO WORLD');
            await whenIMakeRequestTo(app)
                .get('/greet/john')
                .expect(200, 'hello john');
            await whenIMakeRequestTo(app)
                .get('/greet/world')
                .expect(200, 'HELLO WORLD');
        });
        it('gives precedence to redirect routes over controller methods', async () => {
            class MyController {
                hello() {
                    return 'hello';
                }
                helloWorld() {
                    return `hello world`;
                }
            }
            (0, tslib_1.__decorate)([
                (0, openapi_v3_1.get)('/hello', {
                    responses: {},
                }),
                (0, tslib_1.__metadata)("design:type", Function),
                (0, tslib_1.__metadata)("design:paramtypes", []),
                (0, tslib_1.__metadata)("design:returntype", String)
            ], MyController.prototype, "hello", null);
            (0, tslib_1.__decorate)([
                (0, openapi_v3_1.get)('/hello/world'),
                (0, tslib_1.__metadata)("design:type", Function),
                (0, tslib_1.__metadata)("design:paramtypes", []),
                (0, tslib_1.__metadata)("design:returntype", void 0)
            ], MyController.prototype, "helloWorld", null);
            const app = givenAnApplication();
            const server = await givenAServer(app);
            server.basePath('/api');
            server.redirect('/test/hello', '/hello/world');
            givenControllerInApp(app, MyController);
            const response = await whenIMakeRequestTo(server)
                .get('/api/test/hello')
                .expect(303);
            // new request to verify the redirect target
            await whenIMakeRequestTo(server)
                .get(response.header.location)
                .expect(200, 'hello world');
        });
        it('gives precedence to redirect routes over route methods', async () => {
            const app = new __1.RestApplication();
            app.route('get', '/greet/{name}', (0, openapi_spec_builder_1.anOperationSpec)()
                .withParameter({ name: 'name', in: 'path', type: 'string' })
                .build(), (name) => `hello ${name}`);
            app.redirect('/hello/john', '/greet/john');
            const response = await whenIMakeRequestTo(app)
                .get('/hello/john')
                .expect(303);
            // new request to verify the redirect target
            await whenIMakeRequestTo(app)
                .get(response.header.location)
                .expect(200, 'hello john');
        });
    });
    /* ===== HELPERS ===== */
    function givenAnApplication() {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        return app;
    }
    function suppressErrorLogsForExpectedHttpError(app, skipStatusCode) {
        app
            .bind(__1.SequenceActions.LOG_ERROR)
            .to((0, testlab_1.createUnexpectedHttpErrorLogger)(skipStatusCode));
    }
    async function givenAServer(app) {
        return app.getServer(__1.RestServer);
    }
    function givenControllerInApp(app, controller) {
        return app.controller(controller);
    }
    function whenIMakeRequestTo(serverOrApp) {
        return (0, testlab_1.createClientForHandler)(serverOrApp.requestHandler);
    }
});
//# sourceMappingURL=routing.acceptance.js.map