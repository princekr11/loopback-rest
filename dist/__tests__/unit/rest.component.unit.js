"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../..");
const helpers_1 = require("../helpers");
const SequenceActions = __1.RestBindings.SequenceActions;
describe('RestComponent', () => {
    describe('Providers', () => {
        describe('Default implementation', () => {
            let app;
            let comp;
            const EXPECTED_KEYS = [
                __1.RestBindings.SequenceActions.LOG_ERROR.key,
                __1.RestBindings.SequenceActions.FIND_ROUTE.key,
                __1.RestBindings.SequenceActions.INVOKE_METHOD.key,
                __1.RestBindings.SequenceActions.REJECT.key,
                __1.RestBindings.SequenceActions.PARSE_PARAMS.key,
                __1.RestBindings.SequenceActions.SEND.key,
            ];
            before(async () => {
                app = new core_1.Application();
                app.component(__1.RestComponent);
                // Stub constructor requirements for some providers.
                app.bind(__1.RestBindings.Http.CONTEXT).to(new core_1.Context());
                app
                    .bind(__1.RestBindings.HANDLER)
                    .to(new __1.HttpHandler(app, (0, helpers_1.aRestServerConfig)()));
                comp = await app.get('components.RestComponent');
            });
            for (const key of EXPECTED_KEYS) {
                it(`binds ${key}`, async () => {
                    var _a;
                    await app.get(key);
                    const expected = (_a = comp.bindings) === null || _a === void 0 ? void 0 : _a.find(b => b.key === key);
                    (0, testlab_1.expect)(expected === null || expected === void 0 ? void 0 : expected.type).to.eql(core_1.BindingType.DYNAMIC_VALUE);
                });
            }
        });
        describe('LOG_ERROR', () => {
            it('matches expected argument signature', async () => {
                const app = new core_1.Application();
                app.component(__1.RestComponent);
                const server = await app.getServer(__1.RestServer);
                const logError = await server.get(SequenceActions.LOG_ERROR);
                (0, testlab_1.expect)(logError.length).to.equal(3); // (err, statusCode, request)
            });
            it('can be customized by extending RestComponent', async () => {
                let lastLog = 'logError() was not called';
                let CustomRestComponent = class CustomRestComponent extends __1.RestComponent {
                    constructor(application, config) {
                        super(application, config);
                        this.bindings = [
                            (0, core_1.createBindingFromClass)(CustomLogger, {
                                key: __1.RestBindings.SequenceActions.LOG_ERROR,
                            }),
                        ];
                    }
                };
                CustomRestComponent = (0, tslib_1.__decorate)([
                    (0, tslib_1.__param)(0, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_INSTANCE)),
                    (0, tslib_1.__param)(1, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_CONFIG)),
                    (0, tslib_1.__metadata)("design:paramtypes", [core_1.Application, Object])
                ], CustomRestComponent);
                class CustomLogger {
                    value() {
                        return (err, statusCode, request) => {
                            lastLog = `${request.url} ${statusCode} ${err.message}`;
                        };
                    }
                }
                const app = new core_1.Application();
                app.component(CustomRestComponent);
                const server = await app.getServer(__1.RestServer);
                const logError = await server.get(SequenceActions.LOG_ERROR);
                const expressContext = (0, testlab_1.stubExpressContext)({ url: '/' });
                logError(new Error('test-error'), 400, expressContext.request);
                (0, testlab_1.expect)(lastLog).to.equal('/ 400 test-error');
            });
        });
    });
});
//# sourceMappingURL=rest.component.unit.js.map