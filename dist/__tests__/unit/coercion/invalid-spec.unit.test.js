"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../../");
const utils_1 = require("./utils");
const INVALID_PARAM = {
    in: 'unknown',
    name: 'aparameter',
    // TS compiler catches `unknown` as invalid without the cast
    schema: { type: 'unknown' },
};
describe('throws error for invalid parameter spec', () => {
    (0, utils_1.test)(INVALID_PARAM, '', __1.RestHttpErrors.invalidParamLocation('unknown'));
});
//# sourceMappingURL=invalid-spec.unit.test.js.map