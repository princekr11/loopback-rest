"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../../");
const utils_1 = require("./utils");
const BOOLEAN_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'boolean' },
};
const REQUIRED_BOOLEAN_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'boolean' },
    required: true,
};
describe('coerce param from string to boolean - required', function () {
    context('valid values', () => {
        (0, utils_1.test)(REQUIRED_BOOLEAN_PARAM, 'false', false);
        (0, utils_1.test)(REQUIRED_BOOLEAN_PARAM, 'true', true);
        (0, utils_1.test)(REQUIRED_BOOLEAN_PARAM, 'FALSE', false);
        (0, utils_1.test)(REQUIRED_BOOLEAN_PARAM, 'TRUE', true);
        (0, utils_1.test)(REQUIRED_BOOLEAN_PARAM, '0', false);
        (0, utils_1.test)(REQUIRED_BOOLEAN_PARAM, '1', true);
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(REQUIRED_BOOLEAN_PARAM, '', __1.RestHttpErrors.missingRequired(REQUIRED_BOOLEAN_PARAM.name));
    });
});
describe('coerce param from string to boolean - optional', function () {
    context('valid values', () => {
        (0, utils_1.test)(BOOLEAN_PARAM, 'false', false);
        (0, utils_1.test)(BOOLEAN_PARAM, 'true', true);
        (0, utils_1.test)(BOOLEAN_PARAM, 'FALSE', false);
        (0, utils_1.test)(BOOLEAN_PARAM, 'TRUE', true);
        (0, utils_1.test)(BOOLEAN_PARAM, '0', false);
        (0, utils_1.test)(BOOLEAN_PARAM, '1', true);
    });
    context('invalid values should trigger ERROR_BAD_REQUEST', () => {
        (0, utils_1.test)(BOOLEAN_PARAM, 'text', __1.RestHttpErrors.invalidData('text', BOOLEAN_PARAM.name));
        (0, utils_1.test)(BOOLEAN_PARAM, 'null', __1.RestHttpErrors.invalidData('null', BOOLEAN_PARAM.name));
        // {a: true}, [1,2] are converted to object
        (0, utils_1.test)(BOOLEAN_PARAM, { a: true }, __1.RestHttpErrors.invalidData({ a: true }, BOOLEAN_PARAM.name));
    });
    context('empty collection converts to undefined', () => {
        (0, utils_1.test)(BOOLEAN_PARAM, undefined, undefined);
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(BOOLEAN_PARAM, '', __1.RestHttpErrors.invalidData('', BOOLEAN_PARAM.name));
    });
});
//# sourceMappingURL=paramStringToBoolean.unit.js.map