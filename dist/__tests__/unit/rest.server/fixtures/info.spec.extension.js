"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestInfoSpecEnhancer = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const debug_1 = (0, tslib_1.__importDefault)(require("debug"));
const util_1 = require("util");
const __1 = require("../../../..");
const debug = (0, debug_1.default)('loopback:openapi:spec-enhancer');
/**
 * A spec enhancer to add OpenAPI info spec
 */
let TestInfoSpecEnhancer = class TestInfoSpecEnhancer {
    constructor() {
        this.name = 'info-test';
    }
    modifySpec(spec) {
        const InfoPatchSpec = {
            info: { title: 'LoopBack Test Application', version: '1.0.1' },
        };
        const mergedSpec = (0, __1.mergeOpenAPISpec)(spec, InfoPatchSpec);
        debug(`security spec extension, merged spec: ${(0, util_1.inspect)(mergedSpec)}`);
        return mergedSpec;
    }
};
TestInfoSpecEnhancer = (0, tslib_1.__decorate)([
    (0, core_1.injectable)(__1.asSpecEnhancer)
], TestInfoSpecEnhancer);
exports.TestInfoSpecEnhancer = TestInfoSpecEnhancer;
//# sourceMappingURL=info.spec.extension.js.map