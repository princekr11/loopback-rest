import { OperationObject, SchemasObject } from '@loopback/openapi-v3';
import { ResolvedRoute, RouteEntry } from '.';
import { RequestContext } from '../request-context';
import { OperationArgs, OperationRetval, PathParameterValues } from '../types';
export declare class RedirectRoute implements RouteEntry, ResolvedRoute {
    readonly sourcePath: string;
    readonly targetLocation: string;
    readonly statusCode: number;
    readonly pathParams: PathParameterValues;
    readonly schemas: SchemasObject;
    readonly verb: string;
    readonly path: string;
    readonly spec: OperationObject;
    constructor(sourcePath: string, targetLocation: string, statusCode?: number);
    invokeHandler({ response }: RequestContext, args: OperationArgs): Promise<OperationRetval>;
    updateBindings(requestContext: RequestContext): void;
    describe(): string;
    /**
     * type guard type checker for this class
     * @param obj
     */
    static isRedirectRoute(obj: any): obj is RedirectRoute;
}
