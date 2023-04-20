import { ParameterObject } from '@loopback/openapi-v3';
export interface TestArgs<T> {
    paramSpec: ParameterObject;
    rawValue: string | undefined | object;
    expectedResult: T;
    caller: string;
    expectError: boolean;
    opts: TestOptions;
}
export declare type TestOptions = {
    testName?: string;
};
export declare function testCoercion<T>(config: TestArgs<T>): Promise<void>;
export declare function test<T>(paramSpec: ParameterObject, rawValue: string | undefined | object, expectedResult: T, opts?: TestOptions): void;
