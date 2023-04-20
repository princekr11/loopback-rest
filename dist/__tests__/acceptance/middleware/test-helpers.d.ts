import { Binding, InterceptorOrKey } from '@loopback/core';
import { Client } from '@loopback/testlab';
import { RestApplication } from '../../..';
import { SpyConfig } from '../../fixtures/middleware/spy-config';
export declare const spy: import("@loopback/express/dist/types").ExpressMiddlewareFactory<SpyConfig>;
export { SpyConfig } from '../../fixtures/middleware/spy-config';
export declare type TestFunction = (spyBinding: Binding<unknown>) => Promise<unknown>;
export declare class TestHelper {
    readonly app: RestApplication;
    client: Client;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    bindController(interceptor?: InterceptorOrKey): Binding<unknown>;
    testSpyLog(spyBinding: Binding<unknown>): Promise<void>;
    assertSpyLog(): Promise<void>;
    testSpyMock(spyBinding: Binding<unknown>): Promise<void>;
    assertSpyMock(): Promise<void>;
    testSpyReject(spyBinding: Binding<unknown>): Promise<void>;
    assertSpyReject(): Promise<void>;
}
