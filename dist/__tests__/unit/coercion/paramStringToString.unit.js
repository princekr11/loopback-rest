"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
const utils_1 = require("./utils");
const OPTIONAL_STRING_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'string' },
};
const REQUIRED_STRING_PARAM = {
    ...OPTIONAL_STRING_PARAM,
    required: true,
};
const ENUM_STRING_PARAM = {
    in: 'query',
    name: 'aparameter',
    schema: { type: 'string', enum: ['A', 'B'] },
};
describe('coerce param from string to string - required', () => {
    context('valid values', () => {
        (0, utils_1.test)(REQUIRED_STRING_PARAM, 'text', 'text');
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(REQUIRED_STRING_PARAM, '', __1.RestHttpErrors.missingRequired(REQUIRED_STRING_PARAM.name));
    });
});
describe('coerce param from string to string - enum', () => {
    context('valid values', () => {
        (0, utils_1.test)(ENUM_STRING_PARAM, 'A', 'A');
    });
    context('invalid values trigger ERROR_BAD_REQUEST', () => {
        const expectedError = __1.RestHttpErrors.invalidData('C', ENUM_STRING_PARAM.name);
        expectedError.details = [
            {
                path: '',
                code: 'enum',
                message: 'must be equal to one of the allowed values',
                info: { allowedValues: ['A', 'B'] },
            },
        ];
        (0, utils_1.test)(ENUM_STRING_PARAM, 'C', expectedError);
    });
});
describe('coerce param from string to string - optional', () => {
    context('valid values', () => {
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, 'text', 'text');
    });
    context('number-like strings are preserved as strings', () => {
        // octal (base 8)
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, '0664', '0664');
        // integers that cannot be repesented by JavaScript's number
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, '2343546576878989879789', '2343546576878989879789');
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, '-2343546576878989879789', '-2343546576878989879789');
        // scientific notation
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, '1.234e+30', '1.234e+30');
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, '-1.234e+30', '-1.234e+30');
    });
    context('empty collection converts to undefined', () => {
        // [], {} sent from request are converted to raw value undefined
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, undefined, undefined);
    });
    context('empty values are allowed', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, '', '');
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, 'null', 'null');
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, 'undefined', 'undefined');
    });
    context('object values trigger ERROR_BAD_REQUEST', () => {
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, { a: true }, __1.RestHttpErrors.invalidData({ a: true }, OPTIONAL_STRING_PARAM.name));
        (0, utils_1.test)(OPTIONAL_STRING_PARAM, [1, 2, 3], __1.RestHttpErrors.invalidData([1, 2, 3], OPTIONAL_STRING_PARAM.name));
    });
});
//# sourceMappingURL=paramStringToString.unit.js.map