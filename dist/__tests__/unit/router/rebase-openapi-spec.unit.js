"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const router_1 = require("../../../router");
describe('rebaseOpenApiSpec', () => {
    it('does not modify an OpenAPI spec if it does not have paths', async () => {
        const spec = {
            title: 'Greetings',
            components: {
                responses: {
                    Hello: {
                        description: 'Hello.',
                    },
                },
            },
            tags: [{ name: 'greeting', description: 'greetings' }],
        };
        const rebasedSpec = (0, router_1.rebaseOpenApiSpec)(spec, '/api');
        (0, testlab_1.expect)(rebasedSpec).to.eql(spec);
    });
    it('does not modify the OpenApiSpec if basePath is empty or `/`', async () => {
        const spec = {
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
                '/hello': {
                    post: {
                        summary: 'says hello',
                        consumes: 'application/json',
                        responses: {
                            '200': {
                                description: 'OK',
                            },
                        },
                    },
                },
            },
        };
        let rebasedSpec = (0, router_1.rebaseOpenApiSpec)(spec, '');
        (0, testlab_1.expect)(spec).to.eql(rebasedSpec);
        rebasedSpec = (0, router_1.rebaseOpenApiSpec)(spec, '/');
        (0, testlab_1.expect)(rebasedSpec).to.eql(spec);
    });
    it('rebases OpenApiSpec if there is a basePath', async () => {
        const spec = {
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
                '/hello': {
                    post: {
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
        };
        const rebasedSpec = (0, router_1.rebaseOpenApiSpec)(spec, '/greetings');
        const rebasedPaths = Object.keys(rebasedSpec.paths);
        (0, testlab_1.expect)(rebasedPaths).to.eql(['/greetings/', '/greetings/hello']);
    });
    it('does not modify the original OpenApiSpec', async () => {
        const spec = {
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
                '/hello': {
                    post: {
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
        };
        (0, router_1.rebaseOpenApiSpec)(spec, '/greetings');
        const specPaths = Object.keys(spec.paths);
        (0, testlab_1.expect)(specPaths).to.deepEqual(['/', '/hello']);
    });
});
//# sourceMappingURL=rebase-openapi-spec.unit.js.map