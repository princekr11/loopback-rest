"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const qs_1 = (0, tslib_1.__importDefault)(require("qs"));
const __1 = require("../../..");
const utils_1 = require("./utils");
const OPTIONAL_ANY_OBJECT = {
    in: 'query',
    name: 'aparameter',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                additionalProperties: true,
            },
        },
    },
};
const REQUIRED_ANY_OBJECT = {
    ...OPTIONAL_ANY_OBJECT,
    required: true,
};
describe('coerce object param - required', function () {
    context('valid values', () => {
        // Use JSON-encoded style, qs.stringify() omits empty objects
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, '{}', {});
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, { key: 'value' }, { key: 'value' });
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, { key: 'undefined' }, { key: 'undefined' });
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, { key: 'null' }, { key: 'null' });
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, { key: 'text' }, { key: 'text' });
    });
    context('valid string values', () => {
        // simple object
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, '{"key": "text"}', { key: 'text' });
        // nested objects
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, '{"include": [{ "relation" : "todoList" }]}', {
            include: [{ relation: 'todoList' }],
        });
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, undefined, // the parameter is missing
        __1.RestHttpErrors.missingRequired(REQUIRED_ANY_OBJECT.name));
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, '', // ?param=
        __1.RestHttpErrors.missingRequired(REQUIRED_ANY_OBJECT.name));
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, 'null', // ?param=null
        __1.RestHttpErrors.missingRequired(REQUIRED_ANY_OBJECT.name));
    });
    context('array values are not allowed', () => {
        // JSON encoding
        testInvalidDataError('[]');
        testInvalidDataError('[1,2]');
        // deepObject style
        testInvalidDataError([1, 2]);
    });
    function testInvalidDataError(input, extraErrorProps) {
        (0, utils_1.test)(REQUIRED_ANY_OBJECT, input, __1.RestHttpErrors.invalidData(createInvalidDataInput(input), REQUIRED_ANY_OBJECT.name, extraErrorProps));
    }
});
describe('coerce object param - optional', function () {
    context('valid values', () => {
        // Use JSON-encoded style, qs.stringify() omits empty objects
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, '{}', {});
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: 'value' }, { key: 'value' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, undefined, undefined);
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, '', undefined);
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, 'null', null);
    });
    context('valid string values', () => {
        // simple object
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, '{"key": "text"}', { key: 'text' });
        // nested objects
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, '{"include": [{ "relation" : "todoList" }]}', {
            include: [{ relation: 'todoList' }],
        });
    });
    context('nested values are not coerced', () => {
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: 'undefined' }, { key: 'undefined' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: 'null' }, { key: 'null' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: 'text' }, { key: 'text' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: '0' }, { key: '0' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: '1' }, { key: '1' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: '-1' }, { key: '-1' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: '1.2' }, { key: '1.2' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: '-1.2' }, { key: '-1.2' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: 'true' }, { key: 'true' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: 'false' }, { key: 'false' });
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, { key: '2016-05-19T13:28:51.299Z' }, { key: '2016-05-19T13:28:51.299Z' });
    });
    context('invalid values should trigger ERROR_BAD_REQUEST', () => {
        testInvalidDataError('text', {
            details: {
                syntaxError: 'Unexpected token e in JSON at position 1',
            },
        });
        testInvalidDataError('0');
        testInvalidDataError('1');
    });
    context('array values are not allowed', () => {
        testInvalidDataError('[]');
        testInvalidDataError('[1,2]');
        testInvalidDataError([1, 2]);
    });
    function testInvalidDataError(input, extraErrorProps) {
        (0, utils_1.test)(OPTIONAL_ANY_OBJECT, input, __1.RestHttpErrors.invalidData(createInvalidDataInput(input), OPTIONAL_ANY_OBJECT.name, extraErrorProps));
    }
});
function createInvalidDataInput(input) {
    if (typeof input === 'string')
        return input;
    // convert deep property values to strings, that's what our parser
    // is going to receive on input and show in the error message
    return qs_1.default.parse(qs_1.default.stringify({ value: input })).value;
}
//# sourceMappingURL=paramObject.unit.js.map