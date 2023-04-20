"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_v3_1 = require("@loopback/openapi-v3");
const repository_1 = require("@loopback/repository");
const testlab_1 = require("@loopback/testlab");
describe('defineModelClass', () => {
    it('should include model definition details in generated Model class', () => {
        const definition = new repository_1.ModelDefinition('Book').addProperty('title', {
            type: 'string',
        });
        const Book = (0, repository_1.defineModelClass)(repository_1.Model, definition);
        const schemaRef = (0, openapi_v3_1.getModelSchemaRef)(Book);
        const expected = {
            $ref: '#/components/schemas/Book',
            definitions: {
                Book: { title: 'Book', type: 'object', additionalProperties: false },
            },
        };
        (0, testlab_1.expect)(schemaRef).to.match(expected);
    });
});
//# sourceMappingURL=repository.integration.js.map