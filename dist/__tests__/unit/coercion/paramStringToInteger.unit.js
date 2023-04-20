"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../../");
const utils_1 = require("./utils");
const INT32_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'integer', format: 'int32' },
};
const INT64_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'integer', format: 'int64' },
};
const REQUIRED_INTEGER_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'integer' },
    required: true,
};
const INTEGER_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'integer' },
};
describe('coerce param from string to integer', () => {
    (0, utils_1.test)(INT32_PARAM, '100', 100);
    (0, utils_1.test)(INT64_PARAM, '9007199254740991', 9007199254740991);
});
describe('coerce param from string to integer - required', function () {
    context('valid values', () => {
        (0, utils_1.test)(REQUIRED_INTEGER_PARAM, '0', 0);
        (0, utils_1.test)(REQUIRED_INTEGER_PARAM, '1', 1);
        (0, utils_1.test)(REQUIRED_INTEGER_PARAM, '-1', -1);
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(REQUIRED_INTEGER_PARAM, '', __1.RestHttpErrors.missingRequired(REQUIRED_INTEGER_PARAM.name));
    });
});
describe('coerce param from string to integer - optional', function () {
    context('valid values', () => {
        (0, utils_1.test)(INTEGER_PARAM, '0', 0);
        (0, utils_1.test)(INTEGER_PARAM, '1', 1);
        (0, utils_1.test)(INTEGER_PARAM, '-1', -1);
    });
    context('integers larger than MAX_SAFE_INTEGER should trigger ERROR_BAD_REQUEST', () => {
        (0, utils_1.test)(INTEGER_PARAM, '2343546576878989879789', __1.RestHttpErrors.invalidData('2343546576878989879789', REQUIRED_INTEGER_PARAM.name));
        (0, utils_1.test)(INTEGER_PARAM, '-2343546576878989879789', __1.RestHttpErrors.invalidData('-2343546576878989879789', REQUIRED_INTEGER_PARAM.name));
        (0, utils_1.test)(INTEGER_PARAM, '1.234e+30', __1.RestHttpErrors.invalidData('1.234e+30', REQUIRED_INTEGER_PARAM.name));
        (0, utils_1.test)(INTEGER_PARAM, '-1.234e+30', __1.RestHttpErrors.invalidData('-1.234e+30', REQUIRED_INTEGER_PARAM.name));
    });
    context('scientific notations', () => {
        (0, utils_1.test)(INTEGER_PARAM, '1.234e+3', 1.234e3);
        (0, utils_1.test)(INTEGER_PARAM, '-1.234e+3', -1.234e3);
    });
    context('integer-like string values should trigger ERROR_BAD_REQUEST', () => {
        (0, utils_1.test)(INTEGER_PARAM, '1.2', __1.RestHttpErrors.invalidData('1.2', INTEGER_PARAM.name));
        (0, utils_1.test)(INTEGER_PARAM, '-1.2', __1.RestHttpErrors.invalidData('-1.2', INTEGER_PARAM.name));
    });
    context('empty collection converts to undefined', () => {
        // [], {} sent from request are converted to raw value undefined
        (0, utils_1.test)(INTEGER_PARAM, undefined, undefined);
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(INTEGER_PARAM, '', __1.RestHttpErrors.invalidData('', INTEGER_PARAM.name));
    });
    context('all other non-integer values should trigger ERROR_BAD_REQUEST', () => {
        // 'false', false, 'true', true, 'text' sent from request are converted to a string
        (0, utils_1.test)(INTEGER_PARAM, 'text', __1.RestHttpErrors.invalidData('text', INTEGER_PARAM.name));
        // {a: true}, [1,2] are converted to object
        (0, utils_1.test)(INTEGER_PARAM, { a: true }, __1.RestHttpErrors.invalidData({ a: true }, INTEGER_PARAM.name));
    });
});
//# sourceMappingURL=paramStringToInteger.unit.js.map