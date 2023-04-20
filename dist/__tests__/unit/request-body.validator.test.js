"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../");
const helpers_1 = require("../helpers");
const INVALID_MSG = __1.RestHttpErrors.INVALID_REQUEST_BODY_MESSAGE;
const TODO_SCHEMA = {
    title: 'Todo',
    properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        isComplete: { type: 'boolean' },
    },
    required: ['title'],
};
// a schema that contains a property with referenced schema
const ACCOUNT_SCHEMA = {
    title: 'Account',
    properties: {
        title: { type: 'string' },
        address: { $ref: '#/components/schemas/Address' },
    },
};
const ADDRESS_SCHEMA = {
    title: 'Address',
    properties: {
        city: { type: 'string' },
        unit: { type: 'number' },
        isOwner: { type: 'boolean' },
    },
};
const INVALID_ACCOUNT_SCHEMA = {
    title: 'Account',
    properties: {
        title: { type: 'string' },
        address: { $ref: '#/components/schemas/Invalid' },
    },
};
describe('validateRequestBody', () => {
    it('accepts valid data omitting optional properties', async () => {
        await (0, __1.validateRequestBody)({ value: { title: 'work' }, schema: TODO_SCHEMA }, (0, helpers_1.aBodySpec)(TODO_SCHEMA));
    });
    // Test for https://github.com/loopbackio/loopback-next/issues/3234
    it('honors options for AJV validator caching', async () => {
        // 1. Trigger a validation with `{coerceTypes: false}`
        await (0, __1.validateRequestBody)({
            value: { city: 'San Jose', unit: 123, isOwner: true },
            schema: ADDRESS_SCHEMA,
        }, (0, helpers_1.aBodySpec)(ADDRESS_SCHEMA), {}, { coerceTypes: false });
        // 2. Trigger a validation with `{coerceTypes: true}`
        await (0, __1.validateRequestBody)({
            value: { city: 'San Jose', unit: '123', isOwner: 'true' },
            schema: ADDRESS_SCHEMA,
        }, (0, helpers_1.aBodySpec)(ADDRESS_SCHEMA), {}, { coerceTypes: true });
        // 3. Trigger a validation with `{coerceTypes: false}` with invalid data
        await (0, testlab_1.expect)((0, __1.validateRequestBody)({
            value: { city: 'San Jose', unit: '123', isOwner: true },
            schema: ADDRESS_SCHEMA,
        }, (0, helpers_1.aBodySpec)(ADDRESS_SCHEMA), {}, { coerceTypes: false })).to.be.rejectedWith(/The request body is invalid/);
    });
    it('rejects data missing a required property', async () => {
        const details = [
            {
                path: '',
                code: 'required',
                message: "must have required property 'title'",
                info: { missingProperty: 'title' },
            },
        ];
        await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, {
            description: 'missing required "title"',
        }, TODO_SCHEMA);
    });
    it('rejects data containing values of a wrong type', async () => {
        const details = [
            {
                path: '/isComplete',
                code: 'type',
                message: 'must be boolean',
                info: { type: 'boolean' },
            },
        ];
        await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, {
            title: 'todo with a string value of "isComplete"',
            isComplete: 'a string value',
        }, TODO_SCHEMA);
    });
    it('reports all validation errors', async () => {
        const details = [
            {
                path: '',
                code: 'required',
                message: "must have required property 'title'",
                info: { missingProperty: 'title' },
            },
            {
                path: '/isComplete',
                code: 'type',
                message: 'must be boolean',
                info: { type: 'boolean' },
            },
        ];
        await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, {
            description: 'missing title and a string value of "isComplete"',
            isComplete: 'a string value',
        }, TODO_SCHEMA);
    });
    it('reports schema generation errors', async () => {
        await (0, testlab_1.expect)((0, __1.validateRequestBody)({
            value: {},
            schema: INVALID_ACCOUNT_SCHEMA,
        })).to.be.rejectedWith("can't resolve reference #/components/schemas/Invalid from id #");
    });
    it('resolves schema references', async () => {
        const details = [
            {
                path: '',
                code: 'required',
                message: "must have required property 'title'",
                info: { missingProperty: 'title' },
            },
        ];
        await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, { description: 'missing title' }, { $ref: '#/components/schemas/Todo' }, { Todo: TODO_SCHEMA });
    });
    it('rejects empty values when body is required', async () => {
        await verifyValidationRejectsInputWithError('Request body is required', 'MISSING_REQUIRED_PARAMETER', undefined, null, TODO_SCHEMA, {}, true);
    });
    it('allows empty values when body is optional', async () => {
        await (0, __1.validateRequestBody)({ value: null, schema: TODO_SCHEMA }, (0, helpers_1.aBodySpec)(TODO_SCHEMA, { required: false }));
    });
    it('rejects invalid values for number properties', async () => {
        const details = [
            {
                path: '/count',
                code: 'type',
                message: 'must be number',
                info: { type: 'number' },
            },
        ];
        const schema = {
            properties: {
                count: { type: 'number' },
            },
        };
        await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, { count: 'string value' }, schema);
    });
    context('rejects array of data with wrong type - ', () => {
        it('primitive types', async () => {
            const details = [
                {
                    path: '/orders/1',
                    code: 'type',
                    message: 'must be string',
                    info: { type: 'string' },
                },
            ];
            const schema = {
                type: 'object',
                properties: {
                    orders: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            };
            await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, { orders: ['order1', 1] }, schema);
        });
        it('first level $ref', async () => {
            const details = [
                {
                    path: '/1',
                    code: 'required',
                    message: "must have required property 'title'",
                    info: { missingProperty: 'title' },
                },
            ];
            const schema = {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/Todo',
                },
            };
            await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, [{ title: 'a good todo' }, { description: 'a todo item missing title' }], schema, { Todo: TODO_SCHEMA });
        });
        it('nested $ref in schema', async () => {
            const details = [
                {
                    path: '/todos/1',
                    code: 'required',
                    message: "must have required property 'title'",
                    info: { missingProperty: 'title' },
                },
                {
                    path: '/todos/2/title',
                    code: 'type',
                    message: 'must be string',
                    info: { type: 'string' },
                },
            ];
            const schema = {
                type: 'object',
                properties: {
                    todos: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Todo',
                        },
                    },
                },
            };
            await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, {
                todos: [
                    { title: 'a good todo' },
                    { description: 'a todo item missing title' },
                    { description: 'a todo with wrong type of title', title: 2 },
                ],
            }, schema, { Todo: TODO_SCHEMA });
        });
        it('nested $ref in reference', async () => {
            const details = [
                {
                    path: '/accounts/0/address/city',
                    code: 'type',
                    message: 'must be string',
                    info: { type: 'string' },
                },
            ];
            const schema = {
                type: 'object',
                properties: {
                    accounts: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Account',
                        },
                    },
                },
            };
            await verifyValidationRejectsInputWithError(INVALID_MSG, 'VALIDATION_FAILED', details, {
                accounts: [
                    { title: 'an account with invalid address', address: { city: 1 } },
                ],
            }, schema, { Account: ACCOUNT_SCHEMA, Address: ADDRESS_SCHEMA });
        });
    });
});
// ----- HELPERS ----- /
async function verifyValidationRejectsInputWithError(expectedMessage, expectedCode, expectedDetails, body, schema, schemas, required) {
    try {
        await (0, __1.validateRequestBody)({ value: body, schema }, (0, helpers_1.aBodySpec)(schema, { required }), schemas);
        throw new Error("expected Function { name: 'validateRequestBody' } to throw exception");
    }
    catch (err) {
        (0, testlab_1.expect)(err.message).to.equal(expectedMessage);
        (0, testlab_1.expect)(err.code).to.equal(expectedCode);
        (0, testlab_1.expect)(err.details).to.deepEqual(expectedDetails);
    }
}
//# sourceMappingURL=request-body.validator.test.js.map