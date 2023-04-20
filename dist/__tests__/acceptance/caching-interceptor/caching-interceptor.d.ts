/// <reference types="express" />
import { Interceptor, InvocationContext, Provider, ValueOrPromise } from '@loopback/core';
import { Request } from '../../..';
/**
 * Execution status
 */
export declare const status: {
    returnFromCache: boolean;
};
/**
 * In-memory cache
 */
export declare const cachedResults: Map<string, unknown>;
/**
 * Reset the cache
 */
export declare function clearCache(): void;
/**
 * A provider class for caching interceptor that leverages dependency
 * injection
 */
export declare class CachingInterceptorProvider implements Provider<Interceptor> {
    private request;
    constructor(request: Request | undefined);
    value(): <T>(invocationCtx: InvocationContext, next: () => ValueOrPromise<T>) => Promise<T>;
}
/**
 * An interceptor function that caches results. It uses `invocationContext`
 * to locate the http request
 *
 * @param invocationCtx
 * @param next
 */
export declare function cache<T>(invocationCtx: InvocationContext, next: () => ValueOrPromise<T>): Promise<T>;
