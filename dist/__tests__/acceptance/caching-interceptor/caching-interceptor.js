"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.CachingInterceptorProvider = exports.clearCache = exports.cachedResults = exports.status = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const __1 = require("../../..");
/**
 * Execution status
 */
exports.status = {
    returnFromCache: false,
};
/**
 * In-memory cache
 */
exports.cachedResults = new Map();
/**
 * Reset the cache
 */
function clearCache() {
    exports.status.returnFromCache = false;
    exports.cachedResults.clear();
}
exports.clearCache = clearCache;
/**
 * A provider class for caching interceptor that leverages dependency
 * injection
 */
let CachingInterceptorProvider = class CachingInterceptorProvider {
    constructor(request) {
        this.request = request;
    }
    value() {
        return (invocationCtx, next) => cache(invocationCtx, next);
    }
};
CachingInterceptorProvider = (0, tslib_1.__decorate)([
    (0, tslib_1.__param)(0, (0, core_1.inject)(__1.RestBindings.Http.REQUEST, { optional: true })),
    (0, tslib_1.__metadata)("design:paramtypes", [Object])
], CachingInterceptorProvider);
exports.CachingInterceptorProvider = CachingInterceptorProvider;
/**
 * An interceptor function that caches results. It uses `invocationContext`
 * to locate the http request
 *
 * @param invocationCtx
 * @param next
 */
async function cache(invocationCtx, next) {
    exports.status.returnFromCache = false;
    if (invocationCtx.source == null ||
        !(invocationCtx.source instanceof __1.RouteSource)) {
        return next();
    }
    const req = await invocationCtx.get(__1.RestBindings.Http.REQUEST, {
        optional: true,
    });
    if (!req || req.method.toLowerCase() !== 'get') {
        // The method is not invoked by an http request, no caching
        return next();
    }
    const url = req.url;
    const cachedValue = exports.cachedResults.get(url);
    if (cachedValue) {
        exports.status.returnFromCache = true;
        return cachedValue;
    }
    const result = await next();
    exports.cachedResults.set(url, result);
    return result;
}
exports.cache = cache;
//# sourceMappingURL=caching-interceptor.js.map