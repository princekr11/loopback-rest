import { ReferenceObject, RequestBodyObject, SchemaObject } from '@loopback/openapi-v3';
import { RestServerConfig, RestServerResolvedConfig } from '../rest.server';
/**
 * Create an OpenAPI request body spec with the given content
 * @param schema - The schema object
 * @param options - Other attributes for the spec
 * @param mediaType - Optional media type, default to `application/json`
 */
export declare function aBodySpec(schema: SchemaObject | ReferenceObject, options?: Partial<RequestBodyObject>, mediaType?: string): RequestBodyObject;
export declare function aRestServerConfig(customConfig?: RestServerConfig): RestServerResolvedConfig;
