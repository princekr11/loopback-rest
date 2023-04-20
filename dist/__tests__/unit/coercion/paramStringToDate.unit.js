"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../../");
const utils_1 = require("./utils");
const DATE_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'string', format: 'date' },
};
const REQUIRED_DATETIME_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'string', format: 'date' },
    required: true,
};
describe('coerce param from string to date - required', () => {
    context('valid values', () => {
        (0, utils_1.test)(REQUIRED_DATETIME_PARAM, '2016-05-19', new Date('2016-05-19'));
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(REQUIRED_DATETIME_PARAM, '', __1.RestHttpErrors.missingRequired(REQUIRED_DATETIME_PARAM.name));
    });
});
describe('coerce param from string to date - optional', () => {
    context('valid values', () => {
        (0, utils_1.test)(DATE_PARAM, '2015-03-01', new Date('2015-03-01'));
    });
    context('invalid values trigger ERROR_BAD_REQUEST', () => {
        (0, utils_1.test)(DATE_PARAM, '2015-04-32', __1.RestHttpErrors.invalidData('2015-04-32', DATE_PARAM.name));
        (0, utils_1.test)(DATE_PARAM, '2015-03-01T11:20:20.001Z', __1.RestHttpErrors.invalidData('2015-03-01T11:20:20.001Z', DATE_PARAM.name));
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(DATE_PARAM, '', __1.RestHttpErrors.invalidData('', DATE_PARAM.name));
    });
    context('empty collection converts to undefined', () => {
        // [], {} sent from request are converted to raw value undefined
        (0, utils_1.test)(DATE_PARAM, undefined, undefined);
    });
    context('All other non-date values trigger ERROR_BAD_REQUEST', () => {
        // 'false', false, 'true', true, 'text' sent from request are converted to a string
        (0, utils_1.test)(DATE_PARAM, 'text', __1.RestHttpErrors.invalidData('text', DATE_PARAM.name));
        // {a: true}, [1,2] are converted to object
        (0, utils_1.test)(DATE_PARAM, { a: true }, __1.RestHttpErrors.invalidData({ a: true }, DATE_PARAM.name));
    });
});
//# sourceMappingURL=paramStringToDate.unit.js.map