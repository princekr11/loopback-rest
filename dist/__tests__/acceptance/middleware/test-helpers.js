"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestHelper = exports.spy = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const openapi_v3_1 = require("@loopback/openapi-v3");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
const spy_middleware_1 = (0, tslib_1.__importDefault)(require("../../fixtures/middleware/spy.middleware"));
exports.spy = spy_middleware_1.default;
class TestHelper {
    constructor() {
        this.app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
    }
    async start() {
        await this.app.start();
        this.client = (0, testlab_1.createRestAppClient)(this.app);
    }
    stop() {
        return this.app.stop();
    }
    bindController(interceptor) {
        const interceptors = [];
        if (interceptor)
            interceptors.push(interceptor);
        class MyController {
            hello(msg) {
                return `Hello, ${msg}`;
            }
        }
        (0, tslib_1.__decorate)([
            (0, core_1.intercept)(...interceptors),
            (0, openapi_v3_1.post)('/hello', {
                responses: {
                    '200': {
                        content: { 'application/json': { schema: { type: 'string' } } },
                    },
                },
            }),
            (0, tslib_1.__param)(0, (0, openapi_v3_1.requestBody)({
                content: {
                    'application/json': {
                        schema: { type: 'string' },
                    },
                },
            })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], MyController.prototype, "hello", null);
        return this.app.controller(MyController);
    }
    async testSpyLog(spyBinding) {
        // We have to re-configure at restServer level
        // as `this.app.middleware()` delegates to `restServer`
        this.app.restServer
            .configure(spyBinding.key)
            .to({ action: 'log' });
        await this.assertSpyLog();
    }
    async assertSpyLog() {
        await this.client
            .post('/hello')
            .send('"World"')
            .set('content-type', 'application/json')
            .expect(200, 'Hello, World')
            .expect('x-spy-log', 'POST /hello');
    }
    async testSpyMock(spyBinding) {
        // We have to re-configure at restServer level
        // as `this.app.middleware()` delegates to `restServer`
        this.app.restServer
            .configure(spyBinding.key)
            .to({ action: 'mock' });
        await this.assertSpyMock();
    }
    async assertSpyMock() {
        await this.client
            .post('/hello')
            .send('"World"')
            .set('content-type', 'application/json')
            .expect(200, 'Hello, Spy')
            .expect('x-spy-mock', 'POST /hello');
    }
    async testSpyReject(spyBinding) {
        // We have to re-configure at restServer level
        // as `this.app.middleware()` delegates to `restServer`
        this.app.restServer
            .configure(spyBinding.key)
            .to({ action: 'reject' });
        await this.assertSpyReject();
    }
    async assertSpyReject() {
        await this.client
            .post('/hello')
            .send('"World"')
            .set('content-type', 'application/json')
            .expect(400)
            .expect('x-spy-reject', 'POST /hello');
    }
}
exports.TestHelper = TestHelper;
//# sourceMappingURL=test-helpers.js.map