import { Context } from '@loopback/core';
import { OperationObject, SchemasObject } from '@loopback/openapi-v3';
import { OperationArgs, OperationRetval, PathParameterValues } from '../types';
/**
 * An entry in the routing table
 */
export interface RouteEntry {
    /**
     * http verb
     */
    readonly verb: string;
    /**
     * http path
     */
    readonly path: string;
    /**
     * OpenAPI operation spec
     */
    readonly spec: OperationObject;
    /**
     * Update bindings for the request context
     * @param requestContext
     */
    updateBindings(requestContext: Context): void;
    /**
     * A handler to invoke the resolved controller method
     * @param requestContext
     * @param args
     */
    invokeHandler(requestContext: Context, args: OperationArgs): Promise<OperationRetval>;
    describe(): string;
}
/**
 * A route with path parameters resolved
 */
export interface ResolvedRoute extends RouteEntry {
    readonly pathParams: PathParameterValues;
    /**
     * Server/application wide schemas shared by multiple routes,
     * e.g. model schemas. This is a temporary workaround for
     * missing support for $ref references, see
     * https://github.com/loopbackio/loopback-next/issues/435
     */
    readonly schemas: SchemasObject;
}
export declare function createResolvedRoute(route: RouteEntry, pathParams: PathParameterValues): ResolvedRoute;
