"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const openapi_v3_1 = require("@loopback/openapi-v3");
const testlab_1 = require("@loopback/testlab");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const rest_component_1 = require("../../rest.component");
const rest_server_1 = require("../../rest.server");
describe('HttpHandler mounted as an express router', () => {
    let client;
    beforeEach(givenLoopBackApp);
    beforeEach(givenExpressApp);
    beforeEach(givenClient);
    context('with a simple HelloWorld controller', () => {
        beforeEach(function setupHelloController() {
            class HelloController {
                async greet() {
                    return 'Hello world!';
                }
            }
            (0, tslib_1.__decorate)([
                (0, openapi_v3_1.get)('/hello'),
                (0, tslib_1.__metadata)("design:type", Function),
                (0, tslib_1.__metadata)("design:paramtypes", []),
                (0, tslib_1.__metadata)("design:returntype", Promise)
            ], HelloController.prototype, "greet", null);
            givenControllerClass(HelloController);
        });
        it('handles simple "GET /hello" requests', () => {
            return client
                .get('/api/hello')
                .expect(200)
                .expect('content-type', 'text/plain')
                .expect('Hello world!');
        });
        it('handles openapi.json', async () => {
            const res = await client
                .get('/api/openapi.json')
                .set('Accept', 'application/json')
                .expect(200);
            (0, testlab_1.expect)(res.body.servers[0]).to.eql({ url: '/api' });
        });
    });
    let expressApp;
    let server;
    let handler;
    function givenControllerClass(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctor) {
        server.controller(ctor);
    }
    async function givenLoopBackApp(options = { rest: { port: 0 } }) {
        options.rest = (0, testlab_1.givenHttpServerConfig)(options.rest);
        const app = new core_1.Application(options);
        app.component(rest_component_1.RestComponent);
        server = await app.getServer(rest_server_1.RestServer);
        handler = server.requestHandler;
    }
    /**
     * Create an express app that mounts the LoopBack routes to `/api`
     */
    function givenExpressApp() {
        expressApp = (0, express_1.default)();
        expressApp.use('/api', handler);
    }
    function givenClient() {
        client = (0, testlab_1.createClientForHandler)(expressApp);
    }
});
//# sourceMappingURL=express.integration.js.map