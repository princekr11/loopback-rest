"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
const tslib_1 = require("tslib");
const debug_1 = (0, tslib_1.__importDefault)(require("debug"));
const __1 = require("../../..");
const debug = (0, debug_1.default)('loopback:rest:middleware:spy');
/**
 * An Express middleware factory function that creates a handler to spy on
 * requests
 */
const spyMiddlewareFactory = config => {
    const options = { action: 'log', ...config };
    return function spy(req, res, next) {
        debug('config', options);
        switch (options === null || options === void 0 ? void 0 : options.action) {
            case 'mock':
                debug('spy - MOCK');
                res.set('x-spy-mock', `${req.method} ${req.path}`);
                res.send('Hello, Spy');
                break;
            case 'reject':
                debug('spy - REJECT');
                res.set('x-spy-reject', `${req.method} ${req.path}`);
                next(new __1.HttpErrors.BadRequest('Request rejected by spy'));
                break;
            default:
                debug('spy - LOG');
                res.set('x-spy-log', `${req.method} ${req.path}`);
                next();
                break;
        }
    };
};
module.exports = spyMiddlewareFactory;
//# sourceMappingURL=spy.middleware.js.map