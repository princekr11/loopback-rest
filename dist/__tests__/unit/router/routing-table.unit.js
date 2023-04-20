"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const openapi_spec_builder_1 = require("@loopback/openapi-spec-builder");
const openapi_v3_1 = require("@loopback/openapi-v3");
const testlab_1 = require("@loopback/testlab");
const http_errors_1 = (0, tslib_1.__importDefault)(require("http-errors"));
const __1 = require("../../..");
describe('RoutingTable with RegExpRouter', () => {
    runTestsWithRouter(new __1.RegExpRouter());
});
describe('RoutingTable with TrieRouter', () => {
    runTestsWithRouter(new __1.TrieRouter());
});
function runTestsWithRouter(router) {
    it('does not fail if some of the parameters are not decorated', () => {
        class TestController {
            greet(prefix, message) {
                return prefix + ': ' + message;
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/greet'),
            (0, tslib_1.__param)(1, openapi_v3_1.param.query.string('message')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [String, String]),
            (0, tslib_1.__metadata)("design:returntype", void 0)
        ], TestController.prototype, "greet", null);
        const spec = (0, openapi_v3_1.getControllerSpec)(TestController);
        const table = givenRoutingTable();
        table.registerController(spec, TestController);
        const paths = table.describeApiPaths();
        const params = paths['/greet']['get'].parameters;
        (0, testlab_1.expect)(params).to.have.property('length', 1);
        (0, testlab_1.expect)(params[0]).to.have.properties({
            name: 'message',
            in: 'query',
            schema: { type: 'string' },
        });
    });
    it('finds simple "GET /hello" endpoint', () => {
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('get', '/hello', 'greet')
            .build();
        class TestController {
        }
        const table = givenRoutingTable();
        table.registerController(spec, TestController);
        const request = givenRequest({
            method: 'get',
            url: '/hello',
        });
        const route = table.find(request);
        (0, testlab_1.expect)(route).to.be.instanceOf(__1.ControllerRoute);
        (0, testlab_1.expect)(route).to.have.property('spec').containEql(spec.paths['/hello'].get);
        (0, testlab_1.expect)(route).to.have.property('pathParams');
        (0, testlab_1.expect)(route.describe()).to.equal('get /hello => TestController.greet');
    });
    it('finds simple "GET /my/hello" endpoint', () => {
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('get', '/hello', 'greet')
            .build();
        // @jannyHou: please note ` anOpenApiSpec()` returns an openapi spec,
        // not controller spec, should be FIXED
        // the routing table test expects an empty spec for
        // interface `ControllerSpec`
        spec.basePath = '/my';
        class TestController {
        }
        const table = givenRoutingTable();
        table.registerController(spec, TestController);
        const request = givenRequest({
            method: 'get',
            url: '/my/hello',
        });
        const route = table.find(request);
        (0, testlab_1.expect)(route).to.be.instanceOf(__1.ControllerRoute);
        (0, testlab_1.expect)(route).to.have.property('spec').containEql(spec.paths['/hello'].get);
        (0, testlab_1.expect)(route).to.have.property('pathParams');
        (0, testlab_1.expect)(route.describe()).to.equal('get /my/hello => TestController.greet');
    });
    it('finds simple "GET /hello/world" endpoint', () => {
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('get', '/hello/{msg}', 'greet')
            .withOperationReturningString('get', '/hello/world', 'greetWorld')
            .build();
        class TestController {
        }
        const table = givenRoutingTable();
        table.registerController(spec, TestController);
        const request = givenRequest({
            method: 'get',
            url: '/hello/world',
        });
        const route = table.find(request);
        (0, testlab_1.expect)(route)
            .to.have.property('spec')
            .containEql(spec.paths['/hello/world'].get);
        (0, testlab_1.expect)(route).to.have.property('pathParams', {});
        (0, testlab_1.expect)(route.describe()).to.equal('get /hello/world => TestController.greetWorld');
    });
    it('finds simple "GET /add/{arg1}/{arg2}" endpoint', () => {
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('get', '/add/{arg1}/{arg2}', 'add')
            .withOperationReturningString('get', '/subtract/{arg1}/{arg2}', 'subtract')
            .build();
        // @jannyHou: please note ` anOpenApiSpec()` returns an openapi spec,
        // not controller spec, should be FIXED
        // the routing table test expects an empty spec for
        // interface `ControllerSpec`
        spec.basePath = '/my';
        class TestController {
        }
        const table = givenRoutingTable();
        table.registerController(spec, TestController);
        let request = givenRequest({
            method: 'get',
            url: '/my/add/1/2',
        });
        let route = table.find(request);
        (0, testlab_1.expect)(route.path).to.eql('/my/add/{arg1}/{arg2}');
        (0, testlab_1.expect)(route.pathParams).to.containEql({ arg1: '1', arg2: '2' });
        request = givenRequest({
            method: 'get',
            url: '/my/subtract/3/2',
        });
        route = table.find(request);
        (0, testlab_1.expect)(route.path).to.eql('/my/subtract/{arg1}/{arg2}');
        (0, testlab_1.expect)(route.pathParams).to.containEql({ arg1: '3', arg2: '2' });
    });
    it('finds "GET /getProfile/{userId}.{format}" endpoint', () => {
        const spec = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperationReturningString('get', '/getProfile/{userId}.{format}', 'getProfile')
            .build();
        spec.basePath = '/my';
        class TestController {
        }
        const table = givenRoutingTable();
        table.registerController(spec, TestController);
        const request = givenRequest({
            method: 'get',
            url: '/my/getProfile/1.json',
        });
        const route = table.find(request);
        (0, testlab_1.expect)(route.path).to.eql('/my/getProfile/{userId}.{format}');
        (0, testlab_1.expect)(route.pathParams).to.containEql({ userId: '1', format: 'json' });
    });
    it('finds "GET /orders, /orders/{id}, /orders/{orderId}/shipments" endpoints', () => {
        class TestController {
            async getOrderById(id) {
                return { id };
            }
            // A path that overlaps with `/orders/{id}`. Please note a different var
            // name is used - `{orderId}`
            async getShipmentsForOrder(id) {
                return [];
            }
            // With trailing `/`
            async findOrders() {
                return [];
            }
            // Without trailing `/`
            async findPendingOrders() {
                return [];
            }
        }
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/orders/{id}'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.path.number('id')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Number]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], TestController.prototype, "getOrderById", null);
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/orders/{orderId}/shipments'),
            (0, tslib_1.__param)(0, openapi_v3_1.param.path.number('orderId')),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Number]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], TestController.prototype, "getShipmentsForOrder", null);
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/orders/'),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", []),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], TestController.prototype, "findOrders", null);
        (0, tslib_1.__decorate)([
            (0, openapi_v3_1.get)('/pendingOrders'),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", []),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], TestController.prototype, "findPendingOrders", null);
        const table = givenRoutingTable();
        const spec = (0, openapi_v3_1.getControllerSpec)(TestController);
        table.registerController(spec, TestController);
        const findAndCheckRoute = (url, expectedPath) => {
            const request = givenRequest({
                method: 'get',
                url,
            });
            const route = table.find(request);
            (0, testlab_1.expect)(route.path).to.eql(expectedPath);
        };
        findAndCheckRoute('/orders/1', '/orders/{id}');
        findAndCheckRoute('/orders/1/shipments', '/orders/{orderId}/shipments');
        findAndCheckRoute('/orders', '/orders');
        findAndCheckRoute('/orders/', '/orders');
        findAndCheckRoute('/pendingOrders', '/pendingOrders');
        findAndCheckRoute('/pendingOrders/', '/pendingOrders');
    });
    it('throws if router is not found', () => {
        const table = givenRoutingTable();
        const request = givenRequest({
            method: 'get',
            url: '/hi',
        });
        (0, testlab_1.expect)(() => table.find(request)).to.throwError(http_errors_1.default.NotFound);
    });
    function givenRequest(options) {
        return (0, testlab_1.stubExpressContext)(options).request;
    }
    function givenRoutingTable() {
        return new __1.RoutingTable(router);
    }
}
//# sourceMappingURL=routing-table.unit.js.map