"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../../");
const utils_1 = require("./utils");
const DATETIME_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'string', format: 'date-time' },
};
const REQUIRED_DATETIME_PARAM = {
    in: 'path',
    name: 'aparameter',
    schema: { type: 'string', format: 'date-time' },
    required: true,
};
describe('coerce param from string to date - required', function () {
    context('valid values', () => {
        (0, utils_1.test)(REQUIRED_DATETIME_PARAM, '2016-05-19T13:28:51Z', new Date('2016-05-19T13:28:51Z'));
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(REQUIRED_DATETIME_PARAM, '', __1.RestHttpErrors.missingRequired(REQUIRED_DATETIME_PARAM.name));
    });
});
describe('coerce param from string to date - optional', function () {
    context('valid values', () => {
        (0, utils_1.test)(DATETIME_PARAM, '2016-05-19T13:28:51Z', new Date('2016-05-19T13:28:51Z'));
        (0, utils_1.test)(DATETIME_PARAM, '2016-05-19t13:28:51z', new Date('2016-05-19t13:28:51z'));
        (0, utils_1.test)(DATETIME_PARAM, '2016-05-19T13:28:51.299Z', new Date('2016-05-19T13:28:51.299Z'));
        (0, utils_1.test)(DATETIME_PARAM, '2016-05-19T13:28:51-08:00', new Date('2016-05-19T13:28:51-08:00'));
        (0, utils_1.test)(DATETIME_PARAM, '2016-05-19T13:28:51.299-08:00', new Date('2016-05-19T13:28:51.299-08:00'));
    });
    context('invalid values should trigger ERROR_BAD_REQUEST', () => {
        (0, utils_1.test)(DATETIME_PARAM, '2016-01-01', __1.RestHttpErrors.invalidData('2016-01-01', DATETIME_PARAM.name));
        (0, utils_1.test)(DATETIME_PARAM, '2016-04-32T13:28:51Z', __1.RestHttpErrors.invalidData('2016-04-32T13:28:51Z', DATETIME_PARAM.name));
    });
    context('empty values trigger ERROR_BAD_REQUEST', () => {
        // null, '' sent from request are converted to raw value ''
        (0, utils_1.test)(DATETIME_PARAM, '', __1.RestHttpErrors.invalidData('', DATETIME_PARAM.name));
    });
    context('empty collection converts to undefined', () => {
        // [], {} sent from request are converted to raw value undefined
        (0, utils_1.test)(DATETIME_PARAM, undefined, undefined);
    });
    context('All other non-date values trigger ERROR_BAD_REQUEST', () => {
        // 'false', false, 'true', true, 'text' sent from request are converted to a string
        (0, utils_1.test)(DATETIME_PARAM, 'text', __1.RestHttpErrors.invalidData('text', DATETIME_PARAM.name));
        // {a: true}, [1,2] are converted to object
        (0, utils_1.test)(DATETIME_PARAM, { a: true }, __1.RestHttpErrors.invalidData({ a: true }, DATETIME_PARAM.name));
    });
});
//# sourceMappingURL=parseStringToDatetime.unit.js.map