"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
const utils_1 = require("./utils");
const BUFFER_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'string', format: 'byte' },
};
const REQUIRED_BUFFER_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'string', format: 'byte' },
    required: true,
};
describe('coerce param from string to buffer - required', () => {
    context('valid value', () => {
        const testValues = {
            base64: Buffer.from('Hello World').toString('base64'),
        };
        (0, utils_1.test)(BUFFER_PARAM, testValues.base64, Buffer.from(testValues.base64, 'base64'));
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(REQUIRED_BUFFER_PARAM, '', __1.RestHttpErrors.missingRequired(REQUIRED_BUFFER_PARAM.name));
    });
});
describe('coerce param from string to buffer - optional', () => {
    context('valid values', () => {
        const testValues = {
            base64: Buffer.from('Hello World').toString('base64'),
        };
        (0, utils_1.test)(BUFFER_PARAM, testValues.base64, Buffer.from(testValues.base64, 'base64'));
    });
    context('empty collection converts to undefined', () => {
        // [], {} sent from request are converted to raw value undefined
        (0, utils_1.test)(BUFFER_PARAM, undefined, undefined);
    });
});
//# sourceMappingURL=paramStringToBuffer.unit.js.map