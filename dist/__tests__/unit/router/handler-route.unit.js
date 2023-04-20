"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@loopback/core");
const openapi_spec_builder_1 = require("@loopback/openapi-spec-builder");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
describe('HandlerRoute', () => {
    describe('updateBindings()', () => {
        let appCtx;
        let requestCtx;
        before(givenContextsAndHandlerRoute);
        it('adds bindings to the request context', async () => {
            (0, testlab_1.expect)(await requestCtx.get(__1.RestBindings.OPERATION_SPEC_CURRENT)).to.eql({
                responses: { '200': { description: 'An undocumented response body.' } },
            });
        });
        function givenContextsAndHandlerRoute() {
            const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
            const route = new __1.Route('get', '/greet', spec, () => { });
            appCtx = new core_1.Context('application');
            requestCtx = new core_1.Context(appCtx, 'request');
            route.updateBindings(requestCtx);
        }
    });
    describe('toString', () => {
        it('implements toString for anonymous handler', () => {
            const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
            const route = new __1.Route('get', '/greet', spec, () => { });
            (0, testlab_1.expect)(route.toString()).to.equal('Route - get /greet => () => { }');
            (0, testlab_1.expect)(new __1.RouteSource(route).toString()).to.equal('Route - get /greet => () => { }');
        });
        it('implements toString for named handler', () => {
            const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
            const route = new __1.Route('get', '/greet', spec, function process() { });
            (0, testlab_1.expect)(route.toString()).to.equal('Route - get /greet => process');
            (0, testlab_1.expect)(new __1.RouteSource(route).toString()).to.equal('Route - get /greet => process');
        });
    });
});
//# sourceMappingURL=handler-route.unit.js.map