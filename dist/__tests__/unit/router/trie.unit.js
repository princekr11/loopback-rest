"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
describe('Trie', () => {
    const pattern = /^([^\/#\?]+?)[\/#\?]?$/i;
    it('creates nodes', () => {
        const trie = givenTrie();
        const getOrders = givenRoute('get', '/orders');
        trie.create('get/orders', getOrders);
        (0, testlab_1.expect)(trie.root).to.containEql({
            key: '',
            children: {
                get: {
                    key: 'get',
                    children: {
                        orders: {
                            key: 'orders',
                            value: getOrders,
                            children: {},
                        },
                    },
                },
            },
        });
    });
    it('creates nodes with overlapping keys', () => {
        const trie = givenTrie();
        const getOrders = givenRoute('get', '/orders');
        const getOrderById = givenRoute('get', '/orders/{id}');
        trie.create('get/orders', getOrders);
        trie.create('get/orders/{id}', getOrderById);
        (0, testlab_1.expect)(trie.root).to.containEql({
            key: '',
            children: {
                get: {
                    key: 'get',
                    children: {
                        orders: {
                            key: 'orders',
                            value: getOrders,
                            children: {
                                '{id}': {
                                    key: '{id}',
                                    value: getOrderById,
                                    names: ['id'],
                                    regexp: pattern,
                                    children: {},
                                },
                            },
                        },
                    },
                },
            },
        });
    });
    it('reports error for conflicting nodes', () => {
        const trie = givenTrie();
        const getOrders = givenRoute('get', '/orders');
        trie.create('get/orders', getOrders);
        (0, testlab_1.expect)(() => trie.create('get/orders', givenRoute('post', '/orders'))).to.throw(/Duplicate key found with different value/);
    });
    it('lists nodes with values', () => {
        const trie = givenTrie();
        const getOrders = givenRoute('get', '/orders');
        const getOrderById = givenRoute('get', '/orders/{id}');
        trie.create('get/orders', getOrders);
        trie.create('get/orders/{id}', getOrderById);
        const nodes = trie.list();
        (0, testlab_1.expect)(nodes).to.containDeepOrdered([
            {
                key: 'orders',
                value: { verb: 'get', path: '/orders' },
            },
            {
                key: '{id}',
                value: { verb: 'get', path: '/orders/{id}' },
                names: ['id'],
                regexp: pattern,
            },
        ]);
    });
    it('skips nodes without values', () => {
        const trie = givenTrie();
        const getOrderById = givenRoute('get', '/orders/{id}');
        trie.create('get/orders/{id}', getOrderById);
        const nodes = trie.list();
        (0, testlab_1.expect)(nodes).to.eql([
            {
                key: '{id}',
                value: { verb: 'get', path: '/orders/{id}' },
                names: ['id'],
                regexp: pattern,
                children: {},
            },
        ]);
    });
    it('matches nodes by keys', () => {
        const trie = givenTrie();
        const getOrders = givenRoute('get', '/orders');
        const createOrders = givenRoute('post', '/orders');
        const getOrderById = givenRoute('get', '/orders/{id}');
        const getOrderCount = givenRoute('get', '/orders/count');
        trie.create('get/orders', getOrders);
        trie.create('get/orders/{id}', getOrderById);
        trie.create('get/orders/count', getOrderCount);
        trie.create('post/orders', createOrders);
        expectMatch(trie, 'get/orders', getOrders);
        expectMatch(trie, '/get/orders/123', getOrderById, { id: '123' });
        expectMatch(trie, 'get/orders/count', getOrderCount);
        expectMatch(trie, 'post/orders', createOrders);
    });
    it('matches nodes by params', () => {
        const trie = givenTrie();
        const getUsersByName = givenRoute('get', '/users/{username}');
        trie.create('get/users/{username}', getUsersByName);
        expectMatch(trie, 'get/users/admin', getUsersByName, { username: 'admin' });
    });
    function expectMatch(trie, route, value, params) {
        const resolved = trie.match(route);
        (0, testlab_1.expect)(resolved).not.is.undefined();
        (0, testlab_1.expect)(resolved.node).to.containEql({ value });
        params = params !== null && params !== void 0 ? params : {};
        (0, testlab_1.expect)(resolved.params).to.eql(params);
    }
    function givenTrie() {
        return new __1.Trie();
    }
    function givenRoute(verb, path) {
        return { verb, path };
    }
});
//# sourceMappingURL=trie.unit.js.map