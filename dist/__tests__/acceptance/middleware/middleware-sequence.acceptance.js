"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const express_1 = require("@loopback/express");
const testlab_1 = require("@loopback/testlab");
const events_1 = require("events");
const __1 = require("../../../");
const test_helpers_1 = require("./test-helpers");
const POST_INVOCATION_MIDDLEWARE = 'middleware.postInvocation';
describe('Middleware in sequence', () => {
    let helper;
    beforeEach(givenTestApp);
    afterEach(() => helper === null || helper === void 0 ? void 0 : helper.stop());
    it('registers a middleware in default slot', () => {
        const binding = helper.app.expressMiddleware(test_helpers_1.spy, undefined, {
            chain: __1.RestTags.ACTION_MIDDLEWARE_CHAIN,
        });
        return helper.testSpyLog(binding);
    });
    it('registers a middleware in postInvoke slot', () => {
        const binding = helper.app.expressMiddleware(test_helpers_1.spy, undefined, {
            chain: POST_INVOCATION_MIDDLEWARE,
        });
        return helper.testSpyLog(binding);
    });
    it('registers a middleware in both slots', async () => {
        const firstSpy = helper.app.expressMiddleware(test_helpers_1.spy, undefined, {
            key: 'middleware.firstSpy',
        });
        const secondSpy = helper.app
            .expressMiddleware(test_helpers_1.spy, undefined, {
            key: 'middleware.secondSpy',
            chain: POST_INVOCATION_MIDDLEWARE,
        })
            // Set the scope to be `TRANSIENT` so that the new config can be loaded
            .inScope(core_1.BindingScope.TRANSIENT);
        await helper.testSpyLog(firstSpy);
        await helper.testSpyReject(secondSpy);
    });
    it('registers a middleware in default slot with sequence 2', () => {
        helper.app.sequence(SequenceWithTwoInvokeMiddleware);
        const binding = helper.app.expressMiddleware(test_helpers_1.spy, undefined, {
            chain: __1.RestTags.ACTION_MIDDLEWARE_CHAIN,
        });
        return helper.testSpyLog(binding);
    });
    it('allows a middleware to be unregistered', async () => {
        helper.app.sequence(__1.MiddlewareSequence);
        const binding = helper.app.expressMiddleware(test_helpers_1.spy, undefined, {
            chain: __1.RestTags.REST_MIDDLEWARE_CHAIN,
        });
        await helper.testSpyLog(binding);
        const view = new express_1.MiddlewareView(helper.app.restServer, {
            chain: __1.RestTags.REST_MIDDLEWARE_CHAIN,
        });
        helper.app.restServer.unbind(binding.key);
        // Wait until the `unbind` is processed
        await (0, events_1.once)(view, 'refresh');
        const res = await helper.client
            .post('/hello')
            .send('"World"')
            .set('content-type', 'application/json')
            .expect(200, 'Hello, World');
        (0, testlab_1.expect)(res.get('x-spy-log')).to.be.undefined();
    });
    it('reports an error for unreachable middleware groups', async () => {
        suppressErrorLogsForExpectedHttpError(helper.app, 500);
        helper.app.sequence(__1.MiddlewareSequence);
        const binding = helper.app.expressMiddleware(test_helpers_1.spy, undefined, {
            chain: __1.RestTags.REST_MIDDLEWARE_CHAIN,
            group: 'log',
            upstreamGroups: [__1.RestMiddlewareGroups.INVOKE_METHOD],
        });
        helper.app.restServer.configure(binding.key).to({ action: 'log' });
        await helper.client
            .post('/hello')
            .send('"World"')
            .set('content-type', 'application/json')
            .expect(500);
    });
    function givenTestApp() {
        helper = new test_helpers_1.TestHelper();
        // Create another middleware phase
        helper.app
            .bind('middleware.postInvoke')
            .toDynamicValue(express_1.InvokeMiddlewareProvider)
            // Configure a different extension point name
            .tag({ [core_1.CoreTags.EXTENSION_POINT]: POST_INVOCATION_MIDDLEWARE });
        helper.app.sequence(SequenceWithOneInvokeMiddleware);
        helper.bindController();
        return helper.start();
    }
    function suppressErrorLogsForExpectedHttpError(app, skipStatusCode) {
        app
            .bind(__1.SequenceActions.LOG_ERROR)
            .to((0, testlab_1.createUnexpectedHttpErrorLogger)(skipStatusCode));
    }
    /**
     * Use `invokeMiddleware` to invoke two sets of middleware
     */
    class SequenceWithOneInvokeMiddleware extends __1.DefaultSequence {
        async handle(context) {
            try {
                const { request, response } = context;
                // The default middleware chain
                let finished = await this.invokeMiddleware(context);
                if (finished)
                    return;
                const route = this.findRoute(request);
                const args = await this.parseParams(request, route);
                const result = await this.invoke(route, args);
                // The second middleware chain for post-invocation processing
                context.bind('invocation.result').to(result);
                // Invoke another chain of middleware
                finished = await this.invokeMiddleware(context, {
                    chain: POST_INVOCATION_MIDDLEWARE,
                });
                if (finished)
                    return;
                this.send(response, result);
            }
            catch (error) {
                this.reject(context, error);
            }
        }
    }
    /**
     * Use another injected `invokeMiddleware` to invoke middleware after the
     * invocation returns.
     */
    class SequenceWithTwoInvokeMiddleware extends __1.DefaultSequence {
        constructor() {
            super(...arguments);
            /**
             * Inject another middleware chain for post invocation
             */
            this.invokeMiddlewareAfterInvoke = () => false;
        }
        async handle(context) {
            try {
                const { request, response } = context;
                // The default middleware chain
                let finished = await this.invokeMiddleware(context);
                if (finished)
                    return;
                const route = this.findRoute(request);
                const args = await this.parseParams(request, route);
                const result = await this.invoke(route, args);
                // The second middleware chain for post-invocation processing
                context.bind('invocation.result').to(result);
                finished = await this.invokeMiddlewareAfterInvoke(context);
                if (finished)
                    return;
                this.send(response, result);
            }
            catch (error) {
                this.reject(context, error);
            }
        }
    }
    (0, tslib_1.__decorate)([
        (0, core_1.inject)('middleware.postInvoke', { optional: true }),
        (0, tslib_1.__metadata)("design:type", Function)
    ], SequenceWithTwoInvokeMiddleware.prototype, "invokeMiddlewareAfterInvoke", void 0);
});
describe('Invoke a list of Express Middleware in sequence', () => {
    let helper;
    beforeEach(givenTestApp);
    afterEach(() => helper === null || helper === void 0 ? void 0 : helper.stop());
    function runTest(action, fn) {
        it(`invokes a ${action} middleware`, () => {
            helper.app.sequence(givenSequence(action));
            return fn();
        });
    }
    runTest('log', () => helper.assertSpyLog());
    runTest('mock', () => helper.assertSpyMock());
    runTest('reject', () => helper.assertSpyReject());
    function givenTestApp() {
        helper = new test_helpers_1.TestHelper();
        helper.bindController();
        return helper.start();
    }
    function givenSequence(action) {
        /**
         * Use `invokeMiddleware` to invoke two sets of middleware
         */
        class SequenceWithExpressMiddleware extends __1.DefaultSequence {
            async handle(context) {
                try {
                    const { request, response } = context;
                    // The default middleware chain
                    const finished = await this.invokeMiddleware(context, [
                        (0, test_helpers_1.spy)({ action }),
                    ]);
                    if (finished)
                        return;
                    const route = this.findRoute(request);
                    const args = await this.parseParams(request, route);
                    const result = await this.invoke(route, args);
                    this.send(response, result);
                }
                catch (error) {
                    this.reject(context, error);
                }
            }
        }
        return SequenceWithExpressMiddleware;
    }
});
//# sourceMappingURL=middleware-sequence.acceptance.js.map