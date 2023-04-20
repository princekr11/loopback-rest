"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_spec_builder_1 = require("@loopback/openapi-spec-builder");
const testlab_1 = require("@loopback/testlab");
const consolidate_spec_enhancer_1 = require("../../../spec-enhancers/consolidate.spec-enhancer");
const consolidationEnhancer = new consolidate_spec_enhancer_1.ConsolidationEnhancer();
describe('consolidateSchemaObjects', () => {
    it('moves schema with title to component.schemas, replaces with reference', () => {
        const INPUT_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        title: 'loopback.example',
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        }))
            .build();
        const EXPECTED_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/loopback.example',
                    },
                },
            },
        }))
            .withComponents((0, openapi_spec_builder_1.aComponentsSpec)().withSchema('loopback.example', {
            title: 'loopback.example',
            properties: {
                test: {
                    type: 'string',
                },
            },
        }))
            .build();
        (0, testlab_1.expect)(consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(EXPECTED_SPEC);
    });
    it('ignores schema without title property', () => {
        const INPUT_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        }))
            .build();
        (0, testlab_1.expect)(consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(INPUT_SPEC);
    });
    it('avoids naming collision', () => {
        const INPUT_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        title: 'loopback.example',
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        }))
            .withComponents((0, openapi_spec_builder_1.aComponentsSpec)().withSchema('loopback.example', {
            title: 'Different loopback.example exists',
            properties: {
                testDiff: {
                    type: 'string',
                },
            },
        }))
            .build();
        const EXPECTED_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/loopback.example1',
                    },
                },
            },
        }))
            .withComponents((0, openapi_spec_builder_1.aComponentsSpec)()
            .withSchema('loopback.example', {
            title: 'Different loopback.example exists',
            properties: {
                testDiff: {
                    type: 'string',
                },
            },
        })
            .withSchema('loopback.example1', {
            title: 'loopback.example',
            properties: {
                test: {
                    type: 'string',
                },
            },
        }))
            .build();
        (0, testlab_1.expect)(consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(EXPECTED_SPEC);
    });
    it('consolidates same schema in multiple locations', () => {
        const INPUT_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', 
        // first time has 'loopback.example'
        '/path1', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        title: 'loopback.example',
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        }))
            .withOperation('get', 
        // second time has 'loopback.example'
        '/path2', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        title: 'loopback.example',
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        }))
            .build();
        const EXPECTED_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/path1', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/loopback.example',
                    },
                },
            },
        }))
            .withOperation('get', '/path2', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/loopback.example',
                    },
                },
            },
        }))
            .withComponents((0, openapi_spec_builder_1.aComponentsSpec)().withSchema('loopback.example', {
            title: 'loopback.example',
            properties: {
                test: {
                    type: 'string',
                },
            },
        }))
            .build();
        (0, testlab_1.expect)(consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(EXPECTED_SPEC);
    });
    it('obeys disabled option when set to true', () => {
        consolidationEnhancer.disabled = true;
        const INPUT_SPEC = (0, openapi_spec_builder_1.anOpenApiSpec)()
            .withOperation('get', '/', (0, openapi_spec_builder_1.anOperationSpec)().withResponse(200, {
            description: 'Example',
            content: {
                'application/json': {
                    schema: {
                        title: 'loopback.example',
                        properties: {
                            test: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        }))
            .build();
        (0, testlab_1.expect)(consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(INPUT_SPEC);
    });
});
//# sourceMappingURL=consolidate.spec.extension.unit.js.map