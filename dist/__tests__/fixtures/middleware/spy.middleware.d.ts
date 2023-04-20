import { ExpressMiddlewareFactory } from '@loopback/express';
import { SpyConfig } from './spy-config';
/**
 * An Express middleware factory function that creates a handler to spy on
 * requests
 */
declare const spyMiddlewareFactory: ExpressMiddlewareFactory<SpyConfig>;
export = spyMiddlewareFactory;
