"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = exports.testCoercion = void 0;
const tslib_1 = require("tslib");
const testlab_1 = require("@loopback/testlab");
const http_errors_1 = (0, tslib_1.__importDefault)(require("http-errors"));
const qs_1 = (0, tslib_1.__importDefault)(require("qs"));
const util_1 = require("util");
const __1 = require("../../..");
function givenOperationWithParameters(params) {
    return {
        'x-operation-name': 'testOp',
        parameters: params,
        responses: {},
    };
}
function givenRequest(options) {
    return (0, testlab_1.stubExpressContext)(options).request;
}
function givenResolvedRoute(spec, pathParams = {}) {
    const route = new __1.Route('get', '/', spec, () => { });
    return (0, __1.createResolvedRoute)(route, pathParams);
}
async function testCoercion(config) {
    /* istanbul ignore next */
    try {
        const pathParams = {};
        let url = '/';
        const spec = givenOperationWithParameters([config.paramSpec]);
        const route = givenResolvedRoute(spec, pathParams);
        switch (config.paramSpec.in) {
            case 'path':
                pathParams.aparameter = config.rawValue;
                break;
            case 'query':
                {
                    const q = qs_1.default.stringify({ aparameter: config.rawValue }, { encodeValuesOnly: true });
                    url += `?${q}`;
                }
                break;
            case 'header':
            case 'cookie':
                throw new Error(`testCoercion does not yet support in:${config.paramSpec.in}`);
            default:
                // An invalid param spec. Pass it through as an empty request
                // to allow the tests to verify how invalid param spec is handled
                break;
        }
        // Create the request after url is fully populated so that request.query
        // is parsed
        const req = givenRequest({ url });
        const requestBodyParser = new __1.RequestBodyParser();
        if (config.expectError) {
            await (0, testlab_1.expect)((0, __1.parseOperationArgs)(req, route, requestBodyParser)).to.be.rejectedWith(config.expectedResult);
        }
        else {
            const args = await (0, __1.parseOperationArgs)(req, route, requestBodyParser);
            (0, testlab_1.expect)(args).to.eql([config.expectedResult]);
        }
    }
    catch (err) {
        err.stack += config.caller;
        throw err;
    }
}
exports.testCoercion = testCoercion;
function test(paramSpec, rawValue, expectedResult, opts) {
    const caller = new Error().stack;
    const testName = buildTestName(rawValue, expectedResult, opts);
    it(testName, async () => {
        await testCoercion({
            paramSpec,
            rawValue,
            expectedResult,
            caller,
            expectError: expectedResult instanceof http_errors_1.default.HttpError,
            opts: opts !== null && opts !== void 0 ? opts : {},
        });
    });
}
exports.test = test;
function buildTestName(rawValue, expectedResult, opts) {
    if (opts === null || opts === void 0 ? void 0 : opts.testName)
        return opts.testName;
    const inputString = getPrettyString(rawValue);
    if (expectedResult instanceof http_errors_1.default.HttpError)
        return `rejects request raw value ${inputString}`;
    const expectedString = getPrettyString(expectedResult);
    return `converts request raw value ${inputString} to ${expectedString}`;
}
function getPrettyString(value) {
    switch (typeof value) {
        case 'string':
            return JSON.stringify(value);
        default:
            return (0, util_1.format)(value);
    }
}
//# sourceMappingURL=utils.js.map