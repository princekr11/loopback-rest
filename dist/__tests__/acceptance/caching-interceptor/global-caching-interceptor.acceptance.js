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
const caching_interceptor_1 = require("./caching-interceptor");
describe('global caching interceptor', () => {
    let client;
    let app;
    before(givenAClient);
    after(async () => {
        await app.stop();
    });
    context('caching invocation for controller methods', () => {
        it('invokes the controller method if not cached', async () => {
            await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
            (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.false();
        });
        it('returns from cache without invoking the controller method', async () => {
            for (let i = 0; i <= 5; i++) {
                await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
                (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.true();
            }
        });
        it('invokes the controller method after cache is cleared', async () => {
            (0, caching_interceptor_1.clearCache)();
            await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
            (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.false();
        });
    });
    context('caching invocation for route handler functions', () => {
        it('invokes the handler function if not cached', async () => {
            await client.get('/toLowerCase/Hello').expect(200, 'hello');
            (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.false();
        });
        it('returns from cache without invoking the handler function', async () => {
            for (let i = 0; i <= 5; i++) {
                await client.get('/toLowerCase/Hello').expect(200, 'hello');
                (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.true();
            }
        });
        it('invokes the handler function after cache is cleared', async () => {
            caching_interceptor_1.cachedResults.clear();
            await client.get('/toLowerCase/Hello').expect(200, 'hello');
            (0, testlab_1.expect)(caching_interceptor_1.status.returnFromCache).to.be.false();
        });
    });
    /**
     * OpenAPI operation spec for `toLowerCase(text: string)`
     */
    const toLowerCaseOperationSpec = (0, openapi_spec_builder_1.anOperationSpec)()
        .withOperationName('toLowerCase')
        .withParameter({
        name: 'text',
        in: 'path',
        schema: {
            type: 'string',
        },
    })
        .withStringResponse()
        .build();
    /**
     * A plain function to convert `text` to lower case
     * @param text
     */
    function toLowerCase(text) {
        return text.toLowerCase();
    }
    async function givenAClient() {
        (0, caching_interceptor_1.clearCache)();
        app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
        app
            .bind('caching-interceptor')
            .toProvider(caching_interceptor_1.CachingInterceptorProvider)
            .apply((0, core_1.asGlobalInterceptor)());
        app.controller(StringCaseController);
        app.route('get', '/toLowerCase/{text}', toLowerCaseOperationSpec, toLowerCase);
        await app.start();
        client = (0, testlab_1.createRestAppClient)(app);
    }
    /**
     * A controller using interceptors for caching
     */
    class StringCaseController {
        toUpperCase(text) {
            return text.toUpperCase();
        }
    }
    (0, tslib_1.__decorate)([
        (0, openapi_v3_1.get)('/toUpperCase/{text}'),
        (0, tslib_1.__param)(0, openapi_v3_1.param.path.string('text')),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [String]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], StringCaseController.prototype, "toUpperCase", null);
});
//# sourceMappingURL=global-caching-interceptor.acceptance.js.map