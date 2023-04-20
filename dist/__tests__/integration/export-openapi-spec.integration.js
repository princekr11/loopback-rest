"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const testlab_1 = require("@loopback/testlab");
const fs_1 = (0, tslib_1.__importDefault)(require("fs"));
const js_yaml_1 = require("js-yaml");
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const util_1 = require("util");
const __1 = require("../..");
const sandbox = new testlab_1.TestSandbox(path_1.default.resolve(__dirname, '../../../.sandbox'));
describe('exportOpenApiSpec', () => {
    let app;
    let lastLog = '';
    const log = (formatter, ...args) => {
        lastLog = (0, util_1.format)(formatter, ...args);
    };
    const expectedSpec = {
        openapi: '3.0.0',
        info: {
            title: 'LoopBack Application',
            version: '1.0.0',
        },
        paths: {
            '/hello': {
                get: {
                    'x-controller-name': 'MyController',
                    'x-operation-name': 'hello',
                    tags: ['MyController'],
                    responses: {
                        '200': {
                            description: 'Return value of MyController.hello',
                        },
                    },
                    operationId: 'MyController.hello',
                },
            },
        },
        servers: [
            {
                url: '/',
            },
        ],
    };
    beforeEach(async () => {
        lastLog = '';
        await givenApp();
    });
    it('saves the spec to a json file for RestApplication', async () => {
        const file = path_1.default.join(sandbox.path, 'openapi.json');
        await app.exportOpenApiSpec(file, log);
        expectJsonSpec(file);
    });
    it('saves the spec to a json file for RestServer', async () => {
        const file = path_1.default.join(sandbox.path, 'openapi.json');
        await app.restServer.exportOpenApiSpec(file, log);
        expectJsonSpec(file);
    });
    it('writes the spec as a json document to console', async () => {
        await app.exportOpenApiSpec('-', log);
        (0, testlab_1.expect)(JSON.parse(lastLog)).to.eql(expectedSpec);
    });
    it('saves the spec to a yaml file', async () => {
        const file = path_1.default.join(sandbox.path, 'openapi.yaml');
        await app.restServer.exportOpenApiSpec(file, log);
        (0, testlab_1.expect)(lastLog.match(/The OpenAPI spec is saved to .+ openapi\.yaml$/));
        const content = fs_1.default.readFileSync(file, 'utf-8');
        (0, testlab_1.expect)((0, js_yaml_1.load)(content)).to.eql(expectedSpec);
    });
    it('saves the spec to a yml file', async () => {
        const file = path_1.default.join(sandbox.path, 'openapi.yml');
        await app.restServer.exportOpenApiSpec(file, log);
        (0, testlab_1.expect)(lastLog.match(/The OpenAPI spec is saved to .+ openapi\.yml$/));
        const content = fs_1.default.readFileSync(file, 'utf-8');
        (0, testlab_1.expect)((0, js_yaml_1.load)(content)).to.eql(expectedSpec);
    });
    after(() => sandbox.reset());
    function expectJsonSpec(file) {
        (0, testlab_1.expect)(lastLog.match(/The OpenAPI spec is saved to .+ openapi\.json$/));
        const content = fs_1.default.readFileSync(file, 'utf-8');
        (0, testlab_1.expect)(JSON.parse(content)).to.eql(expectedSpec);
    }
    class MyController {
        hello() {
            return 'Hello';
        }
    }
    (0, tslib_1.__decorate)([
        (0, __1.get)('/hello'),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", []),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "hello", null);
    class MyApp extends __1.RestApplication {
        constructor(config) {
            super(config);
            this.controller(MyController);
        }
        async boot() { }
    }
    async function givenApp() {
        app = new MyApp({ rest: (0, testlab_1.givenHttpServerConfig)() });
        await app.boot();
        return app;
    }
});
//# sourceMappingURL=export-openapi-spec.integration.js.map