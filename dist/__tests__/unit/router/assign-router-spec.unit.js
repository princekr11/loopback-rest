"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../../");
describe('assignRouterSpec', () => {
    it('duplicates the additions spec if the target spec is empty', () => {
        const target = { paths: {} };
        const additions = {
            paths: {
                '/': {
                    get: {
                        responses: {
                            '200': {
                                description: 'greeting',
                                content: {
                                    'application/json': {
                                        schema: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    Greeting: {
                        type: 'object',
                        properties: {
                            message: {
                                type: 'string',
                            },
                        },
                    },
                },
                requestBodies: {
                    Greeting: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Greeting',
                                },
                            },
                        },
                    },
                },
            },
            tags: [{ name: 'greeting', description: 'greetings' }],
        };
        (0, __1.assignRouterSpec)(target, additions);
        (0, testlab_1.expect)(target).to.deepEqual(additions);
    });
    it('assigns all components', () => {
        const target = {
            paths: {},
            components: {},
        };
        const additions = {
            paths: {},
            components: {
                schemas: {
                    Greeting: {
                        type: 'object',
                        properties: {
                            message: {
                                type: 'string',
                            },
                        },
                    },
                },
                requestBodies: {
                    Greeting: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Greeting',
                                },
                            },
                        },
                    },
                },
                responses: {
                    Hello: {
                        description: 'Hello.',
                    },
                },
            },
        };
        (0, __1.assignRouterSpec)(target, additions);
        (0, testlab_1.expect)(target.components).to.deepEqual(additions.components);
        (0, testlab_1.expect)(target.components).to.have.properties([
            'schemas',
            'requestBodies',
            'responses',
        ]);
    });
    it('uses the route registered first', () => {
        const originalPath = {
            '/': {
                get: {
                    responses: {
                        '200': {
                            description: 'greeting',
                            content: {
                                'application/json': {
                                    schema: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        };
        const target = { paths: originalPath };
        const additions = {
            paths: {
                '/': {
                    get: {
                        responses: {
                            '200': {
                                description: 'additional greeting',
                                content: {
                                    'application/json': {
                                        schema: { type: 'string' },
                                    },
                                },
                            },
                            '404': {
                                description: 'Error: no greeting',
                                content: {
                                    'application/json': {
                                        schema: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };
        (0, __1.assignRouterSpec)(target, additions);
        (0, testlab_1.expect)(target.paths).to.eql(originalPath);
    });
    it('does not duplicate tags from the additional spec', () => {
        const target = {
            paths: {},
            tags: [{ name: 'greeting', description: 'greetings' }],
        };
        const additions = {
            paths: {},
            tags: [
                { name: 'greeting', description: 'additional greetings' },
                { name: 'salutation', description: 'salutations!' },
            ],
        };
        (0, __1.assignRouterSpec)(target, additions);
        (0, testlab_1.expect)(target.tags).to.containDeep([
            { name: 'greeting', description: 'greetings' },
            { name: 'salutation', description: 'salutations!' },
        ]);
    });
});
//# sourceMappingURL=assign-router-spec.unit.js.map