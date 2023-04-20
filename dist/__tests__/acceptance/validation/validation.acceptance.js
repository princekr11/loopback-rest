"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
const helpers_1 = require("../../helpers");
describe('Validation at REST level', () => {
    let app;
    let client;
    let Product = class Product {
        constructor(data) {
            Object.assign(this, data);
        }
    };
    (0, tslib_1.__decorate)([
        (0, repository_1.property)(),
        (0, tslib_1.__metadata)("design:type", Number)
    ], Product.prototype, "id", void 0);
    (0, tslib_1.__decorate)([
        (0, repository_1.property)({ required: true }),
        (0, tslib_1.__metadata)("design:type", String)
    ], Product.prototype, "name", void 0);
    (0, tslib_1.__decorate)([
        (0, repository_1.property)({ required: false, type: 'string', jsonSchema: { nullable: true } }),
        (0, tslib_1.__metadata)("design:type", Object)
    ], Product.prototype, "description", void 0);
    (0, tslib_1.__decorate)([
        (0, repository_1.property)({
            required: true,
            jsonSchema: {
                range: [0, 100],
                errorMessage: { range: 'price must be in range 0 to 100' },
            },
        }),
        (0, tslib_1.__metadata)("design:type", Number)
    ], Product.prototype, "price", void 0);
    Product = (0, tslib_1.__decorate)([
        (0, repository_1.model)(),
        (0, tslib_1.__metadata)("design:paramtypes", [Object])
    ], Product);
    const PRODUCT_SPEC = (0, __1.jsonToSchemaObject)((0, __1.getJsonSchema)(Product));
    // Add a schema that requires `description`
    const PRODUCT_SPEC_WITH_DESCRIPTION = {
        ...PRODUCT_SPEC,
    };
    PRODUCT_SPEC_WITH_DESCRIPTION.required =
        PRODUCT_SPEC.required.concat('description');
    context('with properties excluded from schema', () => {
        before(() => {
            const schema = (0, __1.jsonToSchemaObject)((0, __1.getJsonSchema)(Product, { exclude: ['id'] }));
            class ProductController {
                async create(data) {
                    return new Product(data);
                }
            }
            (0, tslib_1.__decorate)([
                (0, __1.post)('/products'),
                (0, tslib_1.__param)(0, (0, __1.requestBody)((0, helpers_1.aBodySpec)(schema))),
                (0, tslib_1.__metadata)("design:type", Function),
                (0, tslib_1.__metadata)("design:paramtypes", [Object]),
                (0, tslib_1.__metadata)("design:returntype", Promise)
            ], ProductController.prototype, "create", null);
            return givenAnAppAndAClient(ProductController);
        });
        after(() => app.stop());
        it('rejects request bodies containing excluded properties', async () => {
            const { body } = await client
                .post('/products')
                .type('json')
                .send({ id: 1, name: 'a-product-name', price: 1 })
                .expect(422);
            (0, testlab_1.expect)(body.error).to.containEql({
                code: 'VALIDATION_FAILED',
                details: [
                    {
                        path: '',
                        code: 'additionalProperties',
                        message: 'must NOT have additional properties',
                        info: { additionalProperty: 'id' },
                    },
                ],
            });
        });
    });
    // This is the standard use case that most LB4 applications should use.
    // The request body specification is inferred from a decorated model class.
    context('for request body specified via model definition', () => {
        class ProductController {
            async create(data) {
                return new Product(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({ required: true })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Product]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductController.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductController));
        after(() => app.stop());
        it('accepts valid values', () => serverAcceptsValidRequestBody());
        it('rejects missing required properties', () => serverRejectsRequestWithMissingRequiredValues());
        it('rejects requests with no body', async () => {
            // An empty body is now parsed as `undefined`
            await client.post('/products').type('json').expect(400);
        });
        it('rejects requests with empty json body', async () => {
            await client.post('/products').type('json').send('{}').expect(422);
        });
        it('rejects requests with empty string body', async () => {
            await client.post('/products').type('json').send('""').expect(422);
        });
        it('rejects requests with string body', async () => {
            await client.post('/products').type('json').send('"pencils"').expect(422);
        });
        it('rejects requests with null body', async () => {
            await client.post('/products').type('json').send('null').expect(400);
        });
    });
    context('with request body validation options', () => {
        class ProductController {
            async create(data) {
                return new Product(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({ required: true })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Product]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductController.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductController, {
            compiledSchemaCache: new WeakMap(),
            ajvKeywords: ['range'],
        }));
        after(() => app.stop());
        it('rejects requests with price out of range', async () => {
            const DATA = {
                name: 'iPhone',
                description: 'iPhone',
                price: 200,
            };
            const res = await client.post('/products').send(DATA).expect(422);
            (0, testlab_1.expect)(res.body).to.eql({
                error: {
                    statusCode: 422,
                    name: 'UnprocessableEntityError',
                    message: 'The request body is invalid. See error object `details` property for more info.',
                    code: 'VALIDATION_FAILED',
                    details: [
                        {
                            path: '/price',
                            code: 'maximum',
                            message: 'must be <= 100',
                            info: { comparison: '<=', limit: 100 },
                        },
                        {
                            path: '/price',
                            code: 'errorMessage',
                            message: 'price must be in range 0 to 100',
                            info: {
                                errors: [
                                    {
                                        keyword: 'range',
                                        instancePath: '/price',
                                        schemaPath: '#/components/schemas/Product/properties/price/range',
                                        params: {},
                                        message: 'must pass "range" keyword validation',
                                        emUsed: true,
                                    },
                                ],
                            },
                        },
                    ],
                },
            });
        });
    });
    context('with request body validation options - {ajvKeywords: true}', () => {
        class ProductController {
            async create(data) {
                return new Product(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({ required: true })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Product]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductController.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductController, {
            compiledSchemaCache: new WeakMap(),
            $data: true,
        }));
        after(() => app.stop());
        it('rejects requests with price out of range', async () => {
            const DATA = {
                name: 'iPhone',
                description: 'iPhone',
                price: 200,
            };
            const res = await client.post('/products').send(DATA).expect(422);
            (0, testlab_1.expect)(res.body).to.eql({
                error: {
                    statusCode: 422,
                    name: 'UnprocessableEntityError',
                    message: 'The request body is invalid. See error object `details` property for more info.',
                    code: 'VALIDATION_FAILED',
                    details: [
                        {
                            path: '/price',
                            code: 'maximum',
                            message: 'must be <= 100',
                            info: { comparison: '<=', limit: 100 },
                        },
                        {
                            path: '/price',
                            code: 'errorMessage',
                            message: 'price must be in range 0 to 100',
                            info: {
                                errors: [
                                    {
                                        keyword: 'range',
                                        instancePath: '/price',
                                        schemaPath: '#/components/schemas/Product/properties/price/range',
                                        params: {},
                                        message: 'must pass "range" keyword validation',
                                        emUsed: true,
                                    },
                                ],
                            },
                        },
                    ],
                },
            });
        });
    });
    context('with request body validation options - {ajvErrorTransformer: [Function]}', () => {
        class ProductController {
            async create(data) {
                return new Product(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({ required: true })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Product]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductController.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductController, {
            compiledSchemaCache: new WeakMap(),
            $data: true,
            ajvErrorTransformer: errors => {
                return errors.map(e => ({
                    ...e,
                    message: `(translated) ${e.message}`,
                }));
            },
        }));
        after(() => app.stop());
        it('transforms error messages provided by AJV', async () => {
            const DATA = {
                name: 'iPhone',
                description: 'iPhone',
            };
            const res = await client.post('/products').send(DATA).expect(422);
            (0, testlab_1.expect)(res.body).to.eql({
                error: {
                    statusCode: 422,
                    name: 'UnprocessableEntityError',
                    message: 'The request body is invalid. See error object `details` property for more info.',
                    code: 'VALIDATION_FAILED',
                    details: [
                        {
                            path: '',
                            code: 'required',
                            message: "(translated) must have required property 'price'",
                            info: { missingProperty: 'price' },
                        },
                    ],
                },
            });
        });
    });
    context('with request body validation options - {ajvErrors: true}', () => {
        class ProductController {
            async create(data) {
                return new Product(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({ required: true })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Product]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductController.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductController, {
            compiledSchemaCache: new WeakMap(),
            $data: true,
        }));
        after(() => app.stop());
        it('adds custom error message provided with jsonSchema', async () => {
            const DATA = {
                name: 'iPhone',
                description: 'iPhone',
                price: 200,
            };
            const res = await client.post('/products').send(DATA).expect(422);
            (0, testlab_1.expect)(res.body).to.eql({
                error: {
                    statusCode: 422,
                    name: 'UnprocessableEntityError',
                    message: 'The request body is invalid. See error object `details` property for more info.',
                    code: 'VALIDATION_FAILED',
                    details: [
                        {
                            path: '/price',
                            code: 'maximum',
                            message: 'must be <= 100',
                            info: { comparison: '<=', limit: 100 },
                        },
                        {
                            path: '/price',
                            code: 'errorMessage',
                            message: 'price must be in range 0 to 100',
                            info: {
                                errors: [
                                    {
                                        keyword: 'range',
                                        instancePath: '/price',
                                        schemaPath: '#/components/schemas/Product/properties/price/range',
                                        params: {},
                                        message: 'must pass "range" keyword validation',
                                        emUsed: true,
                                    },
                                ],
                            },
                        },
                    ],
                },
            });
        });
    });
    context('with request body validation options - {ajvErrors: {keepErrors: true}}', () => {
        class ProductController {
            async create(data) {
                return new Product(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({ required: true })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Product]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductController.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductController, {
            compiledSchemaCache: new WeakMap(),
            $data: true,
            ajvErrors: {
                singleError: true,
            },
        }));
        after(() => app.stop());
        it('adds custom error message provided with jsonSchema', async () => {
            const DATA = {
                name: 'iPhone',
                description: 'iPhone',
                price: 200,
            };
            const res = await client.post('/products').send(DATA).expect(422);
            (0, testlab_1.expect)(res.body).to.eql({
                error: {
                    statusCode: 422,
                    name: 'UnprocessableEntityError',
                    message: 'The request body is invalid. See error object `details` property for more info.',
                    code: 'VALIDATION_FAILED',
                    details: [
                        {
                            path: '/price',
                            code: 'maximum',
                            message: 'must be <= 100',
                            info: { comparison: '<=', limit: 100 },
                        },
                        {
                            path: '/price',
                            code: 'errorMessage',
                            message: 'price must be in range 0 to 100',
                            info: {
                                errors: [
                                    {
                                        keyword: 'range',
                                        instancePath: '/price',
                                        schemaPath: '#/components/schemas/Product/properties/price/range',
                                        params: {},
                                        message: 'must pass "range" keyword validation',
                                        emUsed: true,
                                    },
                                ],
                            },
                        },
                    ],
                },
            });
        });
    });
    context('with request body validation options - custom keywords', () => {
        let ProductWithName = class ProductWithName {
            constructor(data) {
                Object.assign(this, data);
            }
        };
        (0, tslib_1.__decorate)([
            (0, repository_1.property)(),
            (0, tslib_1.__metadata)("design:type", Number)
        ], ProductWithName.prototype, "id", void 0);
        (0, tslib_1.__decorate)([
            (0, repository_1.property)({ required: true, jsonSchema: { validProductName: true } }),
            (0, tslib_1.__metadata)("design:type", String)
        ], ProductWithName.prototype, "name", void 0);
        ProductWithName = (0, tslib_1.__decorate)([
            (0, repository_1.model)(),
            (0, tslib_1.__metadata)("design:paramtypes", [Object])
        ], ProductWithName);
        class ProductController {
            async create(data) {
                return new ProductWithName({ id: 1, name: 'prod-1' });
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({ required: true })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [ProductWithName]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductController.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductController));
        after(() => app.stop());
        it('allows async custom keyword', async () => {
            app.bind(__1.RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
                validation: {
                    logger: false,
                    compiledSchemaCache: new WeakMap(),
                    $data: true,
                    ajvErrors: {
                        singleError: true,
                    },
                    keywords: [
                        {
                            keyword: 'validProductName',
                            async: true,
                            type: 'string',
                            validate: async (schema, data) => {
                                return data.startsWith('prod-');
                            },
                        },
                    ],
                },
            });
            const DATA = {
                name: 'iPhone',
            };
            const res = await client.post('/products').send(DATA).expect(422);
            (0, testlab_1.expect)(res.body).to.eql({
                error: {
                    statusCode: 422,
                    name: 'UnprocessableEntityError',
                    message: 'The request body is invalid. See error object `details` property for more info.',
                    code: 'VALIDATION_FAILED',
                    details: [
                        {
                            path: '/name',
                            code: 'validProductName',
                            message: 'must pass "validProductName" keyword validation',
                            info: {},
                        },
                    ],
                },
            });
        });
        it('allows sync custom keyword', async () => {
            app.bind(__1.RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
                validation: {
                    logger: false,
                    compiledSchemaCache: new WeakMap(),
                    $data: true,
                    ajvErrors: {
                        singleError: true,
                    },
                    keywords: [
                        {
                            keyword: 'validProductName',
                            async: false,
                            type: 'string',
                            validate: (schema, data) => {
                                return data.startsWith('prod-');
                            },
                        },
                    ],
                },
            });
            const DATA = {
                name: 'iPhone',
            };
            const res = await client.post('/products').send(DATA).expect(422);
            (0, testlab_1.expect)(res.body).to.eql({
                error: {
                    statusCode: 422,
                    name: 'UnprocessableEntityError',
                    message: 'The request body is invalid. See error object `details` property for more info.',
                    code: 'VALIDATION_FAILED',
                    details: [
                        {
                            path: '/name',
                            code: 'validProductName',
                            message: 'must pass "validProductName" keyword validation',
                            info: {},
                        },
                    ],
                },
            });
        });
    });
    context('for request body specified via model definition with strict false', () => {
        let ProductNotStrict = class ProductNotStrict {
            constructor(data) {
                Object.assign(this, data);
            }
        };
        (0, tslib_1.__decorate)([
            (0, repository_1.property)(),
            (0, tslib_1.__metadata)("design:type", Number)
        ], ProductNotStrict.prototype, "id", void 0);
        (0, tslib_1.__decorate)([
            (0, repository_1.property)({ required: true }),
            (0, tslib_1.__metadata)("design:type", String)
        ], ProductNotStrict.prototype, "name", void 0);
        ProductNotStrict = (0, tslib_1.__decorate)([
            (0, repository_1.model)({ settings: { strict: false } }),
            (0, tslib_1.__metadata)("design:paramtypes", [Object])
        ], ProductNotStrict);
        class ProductController {
            async create(data) {
                return new ProductNotStrict(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({ required: true })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [ProductNotStrict]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductController.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductController));
        after(() => app.stop());
        it('rejects requests with empty string body', async () => {
            await client.post('/products').type('json').send('""').expect(422);
        });
        it('rejects requests with string body', async () => {
            await client
                .post('/products')
                .type('json')
                .send('"pencil"')
                .expect(422);
        });
        it('rejects requests with null body', async () => {
            await client.post('/products').type('json').send('null').expect(400);
        });
    });
    // A request body schema can be provided explicitly by the user
    // as an inlined content[type].schema property.
    context('for fully-specified request body', () => {
        class ProductControllerWithFullSchema {
            async create(data) {
                return new Product(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)((0, helpers_1.aBodySpec)(PRODUCT_SPEC))),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Object]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductControllerWithFullSchema.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductControllerWithFullSchema));
        after(() => app.stop());
        it('accepts valid values', () => serverAcceptsValidRequestBody());
        it('rejects missing required properties', () => serverRejectsRequestWithMissingRequiredValues());
    });
    context('for different schemas per media type', () => {
        let spec = (0, helpers_1.aBodySpec)(PRODUCT_SPEC, {}, 'application/json');
        spec = (0, helpers_1.aBodySpec)(PRODUCT_SPEC_WITH_DESCRIPTION, spec, 'application/x-www-form-urlencoded');
        class ProductControllerWithFullSchema {
            async create(data) {
                return new Product(data);
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)(spec)),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Object]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductControllerWithFullSchema.prototype, "create", null);
        before(() => givenAnAppAndAClient(ProductControllerWithFullSchema));
        after(() => app.stop());
        it('accepts valid values for json', () => serverAcceptsValidRequestBody());
        it('accepts valid values for json with nullable properties', () => serverAcceptsValidRequestBodyWithNull());
        it('accepts valid values for urlencoded', () => serverAcceptsValidRequestBodyForUrlencoded());
        it('rejects missing required properties for urlencoded', () => serverRejectsMissingDescriptionForUrlencoded());
    });
    // A request body schema can be provided explicitly by the user as a reference
    // to a schema shared in the global `components.schemas` object.
    context('for request body specified via a reference', () => {
        let ProductControllerReferencingComponents = class ProductControllerReferencingComponents {
            async create(data) {
                return new Product(data);
            }
        };
        (0, tslib_1.__decorate)([
            (0, __1.post)('/products'),
            (0, tslib_1.__param)(0, (0, __1.requestBody)((0, helpers_1.aBodySpec)({ $ref: '#/components/schemas/Product' }))),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Object]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], ProductControllerReferencingComponents.prototype, "create", null);
        ProductControllerReferencingComponents = (0, tslib_1.__decorate)([
            (0, __1.api)({
                paths: {},
                components: {
                    schemas: {
                        Product: PRODUCT_SPEC,
                    },
                },
            })
        ], ProductControllerReferencingComponents);
        before(() => givenAnAppAndAClient(ProductControllerReferencingComponents));
        after(() => app.stop());
        it('accepts valid values', () => serverAcceptsValidRequestBody());
        it('rejects missing required properties', () => serverRejectsRequestWithMissingRequiredValues());
    });
    async function serverAcceptsValidRequestBody() {
        const DATA = {
            name: 'Pencil',
            description: 'An optional description of a pencil',
            price: 10,
        };
        await client.post('/products').send(DATA).expect(200, DATA);
    }
    async function serverAcceptsValidRequestBodyWithNull() {
        const DATA = {
            name: 'Pencil',
            description: null,
            price: 10,
        };
        await client.post('/products').send(DATA).expect(200, DATA);
    }
    async function serverAcceptsValidRequestBodyForUrlencoded() {
        const DATA = 'name=Pencil&price=10&description=An optional description of a pencil';
        await client
            .post('/products')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(DATA)
            .expect(200, {
            name: 'Pencil',
            description: 'An optional description of a pencil',
            price: 10,
        });
    }
    async function serverRejectsMissingDescriptionForUrlencoded() {
        const DATA = 'name=Pencil&price=10';
        await client
            .post('/products')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(DATA)
            .expect(422);
    }
    async function serverRejectsRequestWithMissingRequiredValues() {
        await client
            .post('/products')
            .send({
            description: 'A product missing required name and price',
        })
            .expect(422);
    }
    async function givenAnAppAndAClient(controller, validationOptions) {
        app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
        if (validationOptions)
            app
                .bind(__1.RestBindings.REQUEST_BODY_PARSER_OPTIONS)
                .to({ validation: validationOptions });
        app.controller(controller);
        await app.start();
        client = (0, testlab_1.createRestAppClient)(app);
    }
});
//# sourceMappingURL=validation.acceptance.js.map