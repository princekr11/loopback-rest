import { OASEnhancer, OpenApiSpec } from '../../../..';
/**
 * A spec enhancer to add OpenAPI info spec
 */
export declare class TestInfoSpecEnhancer implements OASEnhancer {
    name: string;
    modifySpec(spec: OpenApiSpec): OpenApiSpec;
}
