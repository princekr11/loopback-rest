"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_spec_builder_1 = require("@loopback/openapi-spec-builder");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
class TestTrieRouter extends __1.TrieRouter {
    get staticRoutes() {
        return Object.values(this.routesWithoutPathVars);
    }
}
describe('trie router', () => {
    let router;
    before(givenRouter);
    it('adds routes to routesWithoutPathVars', () => {
        const staticRoutes = router.staticRoutes.map(getVerbAndPath);
        for (const r of [
            { verb: 'post', path: '/orders' },
            { verb: 'patch', path: '/orders' },
            { verb: 'get', path: '/orders/count' },
            { verb: 'get', path: '/orders' },
            { verb: 'delete', path: '/orders' },
        ]) {
            (0, testlab_1.expect)(staticRoutes).to.containEql(r);
        }
        for (const r of [
            { verb: 'put', path: '/orders/{id}' },
            { verb: 'patch', path: '/orders/{id}' },
            { verb: 'get', path: '/orders/{id}/exists' },
            { verb: 'get', path: '/orders/{id}' },
            { verb: 'delete', path: '/orders/{id}' },
            { verb: 'get', path: '/users/{id}' },
            { verb: 'get', path: '/users/{userId}/orders' },
            { verb: 'get', path: '/users/{id}/products' },
        ]) {
            (0, testlab_1.expect)(staticRoutes).to.not.containEql(r);
        }
    });
    it('lists routes by order', () => {
        (0, testlab_1.expect)(router.list().map(getVerbAndPath)).to.eql([
            { verb: 'get', path: '/orders/count' },
            { verb: 'get', path: '/orders/{id}/exists' },
            { verb: 'put', path: '/orders/{id}' },
            { verb: 'patch', path: '/orders/{id}' },
            { verb: 'get', path: '/orders/{id}' },
            { verb: 'delete', path: '/orders/{id}' },
            { verb: 'post', path: '/orders' },
            { verb: 'patch', path: '/orders' },
            { verb: 'get', path: '/orders' },
            { verb: 'delete', path: '/orders' },
            { verb: 'get', path: '/users/{userId}/orders' },
            { verb: 'get', path: '/users/{id}/products' },
            { verb: 'get', path: '/users/{id}' },
        ]);
    });
    function getVerbAndPath(r) {
        return {
            verb: r === null || r === void 0 ? void 0 : r.verb,
            path: r === null || r === void 0 ? void 0 : r.path,
        };
    }
    function givenRoutes() {
        const routes = [];
        addRoute(routes, 'create', 'post', '/orders');
        addRoute(routes, 'findAll', 'get', '/orders');
        addRoute(routes, 'findById', 'get', '/orders/{id}');
        addRoute(routes, 'updateById', 'patch', '/orders/{id}');
        addRoute(routes, 'replaceById', 'put', '/orders/{id}');
        addRoute(routes, 'count', 'get', '/orders/count');
        addRoute(routes, 'exists', 'get', '/orders/{id}/exists');
        addRoute(routes, 'deleteById', 'delete', '/orders/{id}');
        addRoute(routes, 'deleteAll', 'delete', '/orders');
        addRoute(routes, 'updateAll', 'patch', '/orders');
        addRoute(routes, 'getUserById', 'get', '/users/{id}');
        addRoute(routes, 'getUserOrders', 'get', '/users/{userId}/orders');
        addRoute(routes, 'getUserRecommendation', 'get', '/users/{id}/products');
        return routes;
    }
    function givenRouter() {
        router = givenTrieRouter(givenRoutes());
    }
});
/**
 * This suite covers the following trie-based routes:
 * ```
 * get
 *   |_ users
 *      |_ {id} (get /users/{id})
 *         |_ products (get /users/{id}/products)
 *      |_ {userId}
 *         |_ orders (get /users/{userId}/orders)
 * ```
 *
 * To match `GET /users/{userId}/orders`, the trie router needs to try both
 * `/users/{id}` and `/users/{userId}` sub-trees.
 */
describe('trie router - overlapping paths with different var names', () => {
    let router;
    before(givenRouter);
    it('finds route for GET /users/{id}', () => {
        const req = givenRequest({ method: 'get', url: '/users/123' });
        const route = router.find(req);
        (0, testlab_1.expect)(getRouteInfo(route)).to.containEql({
            verb: 'get',
            path: '/users/{id}',
            params: { id: '123' },
        });
    });
    it('finds route for GET /users/{id}/products', () => {
        const req = givenRequest({ method: 'get', url: '/users/123/products' });
        const route = router.find(req);
        (0, testlab_1.expect)(getRouteInfo(route)).to.containEql({
            verb: 'get',
            path: '/users/{id}/products',
            params: { id: '123' },
        });
    });
    it('finds route for GET /users/{userId}/orders', () => {
        const req = givenRequest({ method: 'get', url: '/users/123/orders' });
        const route = router.find(req);
        (0, testlab_1.expect)(getRouteInfo(route)).to.containEql({
            verb: 'get',
            path: '/users/{userId}/orders',
            params: { userId: '123' },
        });
    });
    function givenRoutesWithDifferentVars() {
        const routes = [];
        addRoute(routes, 'getUserById', 'get', '/users/{id}');
        addRoute(routes, 'getUserOrders', 'get', '/users/{userId}/orders');
        addRoute(routes, 'getUserRecommendation', 'get', '/users/{id}/products');
        return routes;
    }
    function givenRouter() {
        router = givenTrieRouter(givenRoutesWithDifferentVars());
    }
});
describe('trie router with options', () => {
    let router;
    describe('strict: true', () => {
        before(givenStrictRouter);
        it('finds route for GET /users/', () => {
            testStrictRouter('/users/');
        });
        it('fails to find route for GET /users', () => {
            const req = givenRequest({ method: 'get', url: '/users' });
            const route = router.find(req);
            (0, testlab_1.expect)(route).to.be.undefined();
        });
        it('finds route for GET /orders', () => {
            testStrictRouter('/orders');
        });
        it('fails to find route for GET /orders/', () => {
            const req = givenRequest({ method: 'get', url: '/orders/' });
            const route = router.find(req);
            (0, testlab_1.expect)(route).to.be.undefined();
        });
        function testStrictRouter(path) {
            const req = givenRequest({ method: 'get', url: path });
            const route = router.find(req);
            (0, testlab_1.expect)(getRouteInfo(route)).to.containEql({
                verb: 'get',
                path,
                params: {},
            });
        }
        function givenStrictRouter() {
            router = givenTrieRouter(givenRoutesWithDifferentVars(), { strict: true });
        }
    });
    describe('strict: false', () => {
        before(givenNonStrictRouter);
        it('finds route for GET /users/', () => {
            testNonStrictRouter('/users/');
        });
        it('finds route for GET /users', () => {
            testNonStrictRouter('/users', '/users/');
        });
        it('finds route for GET /orders/', () => {
            testNonStrictRouter('/orders/', '/orders');
        });
        it('finds route for GET /orders', () => {
            testNonStrictRouter('/orders');
        });
        function testNonStrictRouter(path, expected) {
            expected = expected !== null && expected !== void 0 ? expected : path;
            const req = givenRequest({ method: 'get', url: path });
            const route = router.find(req);
            (0, testlab_1.expect)(getRouteInfo(route)).to.containEql({
                verb: 'get',
                path: expected,
                params: {},
            });
        }
        function givenNonStrictRouter() {
            router = givenTrieRouter(givenRoutesWithDifferentVars(), { strict: false });
        }
    });
    function givenRoutesWithDifferentVars() {
        const routes = [];
        addRoute(routes, 'getUsers', 'get', '/users/');
        addRoute(routes, 'getOrders', 'get', '/orders');
        return routes;
    }
});
function getRouteInfo(r) {
    return {
        verb: r === null || r === void 0 ? void 0 : r.verb,
        path: r === null || r === void 0 ? void 0 : r.path,
        params: r === null || r === void 0 ? void 0 : r.pathParams,
    };
}
function givenRequest(options) {
    return (0, testlab_1.stubExpressContext)(options).request;
}
function givenTrieRouter(routes, options) {
    const router = new TestTrieRouter(options);
    for (const r of routes) {
        router.add(r);
    }
    return router;
}
function addRoute(routes, op, verb, path) {
    routes.push({
        verb,
        path,
        spec: (0, openapi_spec_builder_1.anOperationSpec)().withOperationName(op).build(),
        updateBindings: () => { },
        invokeHandler: async () => { },
        describe: () => op,
    });
}
//# sourceMappingURL=trie-router.unit.js.map