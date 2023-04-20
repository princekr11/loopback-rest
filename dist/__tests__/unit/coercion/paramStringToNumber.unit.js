"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../../");
const utils_1 = require("./utils");
const NUMBER_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'number' },
};
const REQUIRED_NUMBER_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'number' },
    required: true,
};
const FLOAT_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: {
        type: 'number',
        format: 'float',
    },
};
const DOUBLE_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: {
        type: 'number',
        format: 'double',
    },
};
describe('coerce param from string to number - required', () => {
    context('valid values', () => {
        (0, utils_1.test)(REQUIRED_NUMBER_PARAM, '0', 0);
        (0, utils_1.test)(REQUIRED_NUMBER_PARAM, '1', 1);
        (0, utils_1.test)(REQUIRED_NUMBER_PARAM, '-1', -1);
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(REQUIRED_NUMBER_PARAM, '', __1.RestHttpErrors.missingRequired(REQUIRED_NUMBER_PARAM.name));
    });
});
describe('coerce param from string to number - optional', () => {
    context('valid values', () => {
        (0, utils_1.test)(NUMBER_PARAM, '0', 0);
        (0, utils_1.test)(NUMBER_PARAM, '1', 1);
        (0, utils_1.test)(NUMBER_PARAM, '-1', -1);
        (0, utils_1.test)(NUMBER_PARAM, '1.2', 1.2);
        (0, utils_1.test)(NUMBER_PARAM, '-1.2', -1.2);
    });
    context('numbers larger than MAX_SAFE_INTEGER get trimmed', () => {
        (0, utils_1.test)(NUMBER_PARAM, '2343546576878989879789', 2.34354657687899e21);
        (0, utils_1.test)(NUMBER_PARAM, '-2343546576878989879789', -2.34354657687899e21);
    });
    context('scientific notations', () => {
        (0, utils_1.test)(NUMBER_PARAM, '1.234e+30', 1.234e30);
        (0, utils_1.test)(NUMBER_PARAM, '-1.234e+30', -1.234e30);
    });
    context('empty collection converts to undefined', () => {
        // [], {} sent from request are converted to raw value undefined
        (0, utils_1.test)(NUMBER_PARAM, undefined, undefined);
    });
    // @jannyhou For review: shall we convert empty value to 0 or throw error?
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(NUMBER_PARAM, '', __1.RestHttpErrors.invalidData('', NUMBER_PARAM.name));
    });
    context('All other non-number values trigger ERROR_BAD_REQUEST', () => {
        // 'false', false, 'true', true, 'text' sent from request are converted to a string
        (0, utils_1.test)(NUMBER_PARAM, 'text', __1.RestHttpErrors.invalidData('text', NUMBER_PARAM.name));
        // {a: true}, [1,2] are converted to object
        (0, utils_1.test)(NUMBER_PARAM, { a: true }, __1.RestHttpErrors.invalidData({ a: true }, NUMBER_PARAM.name));
    });
});
describe('OAI3 primitive types', () => {
    (0, utils_1.test)(FLOAT_PARAM, '3.333333', 3.333333);
    (0, utils_1.test)(DOUBLE_PARAM, '3.3333333333', 3.3333333333);
});
//# sourceMappingURL=paramStringToNumber.unit.js.map