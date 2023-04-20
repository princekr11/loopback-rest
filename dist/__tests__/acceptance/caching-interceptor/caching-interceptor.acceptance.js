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
const __1 = require("../../..");
const caching_interceptor_1 = require("./caching-interceptor");
describe('caching interceptor', () => {
    let client;
    let app;
    beforeEach(caching_interceptor_1.clearCache);
    context('as a binding key', () => {
        class ControllerWithInterceptorBinding {
            toUpperCase(text) {
                return text.toUpperCase();
            }
        }
        (0, tslib_1.__decorate)([
            (0, core_1.intercept)('caching-interceptor'),
            (0, openapi_v3_1.get)('/toUpperCase/{text}'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.path.string('text')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], ControllerWithInterceptorBinding.prototype, "toUpperCase", null);
        before(givenAClient);
        after(async () => {
            await app.stop();
        });
        it('invokes the controller method if not cached', async () => {
            await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
            (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.false();
        });
        it('returns from cache without invoking the controller method', async () => {
            await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
            for (let i = 0; i <= 5; i++) {
                await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
                (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.true();
            }
        });
        async function givenAClient() {
            app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
            app.bind('caching-interceptor').toProvider(caching_interceptor_1.CachingInterceptorProvider);
            app.controller(ControllerWithInterceptorBinding);
            await app.start();
            client = (0, testlab_1.createRestAppClient)(app);
        }
    });
    context('as an interceptor function', () => {
        class ControllerWithInterceptorFunction {
            toLowerCase(text) {
                return text.toLowerCase();
            }
        }
        (0, tslib_1.__decorate)([
            (0, core_1.intercept)(caching_interceptor_1.cache),
            (0, openapi_v3_1.get)('/toLowerCase/{text}'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.path.string('text')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], ControllerWithInterceptorFunction.prototype, "toLowerCase", null);
        before(givenAClient);
        after(async () => {
            await app.stop();
        });
        it('invokes the controller method if not cached', async () => {
            await client.get('/toLowerCase/Hello').expect(200, 'hello');
            (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.false();
        });
        it('returns from cache without invoking the controller method', async () => {
            await client.get('/toLowerCase/Hello').expect(200, 'hello');
            for (let i = 0; i <= 5; i++) {
                await client.get('/toLowerCase/Hello').expect(200, 'hello');
                (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.true();
            }
        });
        async function givenAClient() {
            app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
            app.controller(ControllerWithInterceptorFunction);
            await app.start();
            client = (0, testlab_1.createRestAppClient)(app);
        }
    });
});
//# sourceMappingURL=caching-interceptor.acceptance.js.map