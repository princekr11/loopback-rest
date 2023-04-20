"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.aRestServerConfig = exports.aBodySpec = void 0;
/**
 * Create an OpenAPI request body spec with the given content
 * @param schema - The schema object
 * @param options - Other attributes for the spec
 * @param mediaType - Optional media type, default to `application/json`
 */
function aBodySpec(schema, options = {}, mediaType = 'application/json') {
    var _a;
    const spec = Object.assign({}, options);
    spec.content = (_a = spec.content) !== null && _a !== void 0 ? _a : {};
    Object.assign(spec.content, {
        [mediaType]: {
            schema: schema,
        },
    });
    return spec;
}
exports.aBodySpec = aBodySpec;
function aRestServerConfig(customConfig) {
    return Object.assign({
        port: 3000,
        openApiSpec: { disabled: true },
        apiExplorer: { disabled: true },
        cors: {},
        expressSettings: {},
        router: {},
    }, customConfig);
}
exports.aRestServerConfig = aRestServerConfig;
//# sourceMappingURL=helpers.js.map