"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const testlab_1 = require("@loopback/testlab");
const crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
const qs_1 = (0, tslib_1.__importDefault)(require("qs"));
const __1 = require("../../..");
describe('request parsing', () => {
    let client;
    let app;
    let parsedRequestBodyValue;
    beforeEach(givenAClient);
    afterEach(async () => {
        await app.stop();
    });
    it('supports x-parser extension', async () => {
        await postRequest('/show-body-json');
    });
    it('allows built-in body parsers to be overridden', async () => {
        class MyJsonBodyParser extends __1.JsonBodyParser {
            supports(mediaType) {
                return false;
            }
        }
        app.bodyParser(MyJsonBodyParser, __1.RestBindings.REQUEST_BODY_PARSER_JSON);
        await postRequest('/show-body', 415);
        await postRequest('/show-body-json');
    });
    it('invokes custom body parsers before built-in ones', async () => {
        let invoked = false;
        class MyJsonBodyParser extends __1.JsonBodyParser {
            constructor() {
                super(...arguments);
                this.name = Symbol('my-json');
            }
            async parse(request) {
                const body = await super.parse(request);
                invoked = true;
                return body;
            }
        }
        app.bodyParser(MyJsonBodyParser);
        await client
            .post('/show-body')
            .set('Content-Type', 'application/json')
            .send({ key: 'value' })
            .expect(200, { key: 'new-value' });
        (0, testlab_1.expect)(invoked).to.be.true();
    });
    it('invokes custom body parsers to calculate hash', async () => {
        let invoked = false;
        let UrlEncodedBodyParserForHash = class UrlEncodedBodyParserForHash extends __1.RawBodyParser {
            constructor(options = {}) {
                super(options);
                this.options = options;
                this.urlEncodedOptions = (0, __1.getParserOptions)('urlencoded', this.options);
            }
            async parse(request) {
                const body = await super.parse(request);
                const buffer = body.value;
                const hash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
                // We cannot use UrlEncodedParser as `request.body` is set by `RawBodyParser`
                const value = qs_1.default.parse(buffer.toString('utf-8'), this.urlEncodedOptions);
                value.hash = hash;
                invoked = true;
                body.value = value;
                return body;
            }
        };
        UrlEncodedBodyParserForHash = (0, tslib_1.__decorate)([
            (0, tslib_1.__param)(0, (0, core_1.inject)(__1.RestBindings.REQUEST_BODY_PARSER_OPTIONS, { optional: true })),
            (0, tslib_1.__metadata)("design:paramtypes", [Object])
        ], UrlEncodedBodyParserForHash);
        app.controller(givenBodyParamController('/show-body-encoded', UrlEncodedBodyParserForHash), 'Controller3');
        await client
            .post('/show-body-encoded')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({ key: 'value' })
            .expect(200, {
            key: 'new-value',
            parser: 'UrlEncodedBodyParserForHash',
        });
        (0, testlab_1.expect)(invoked).to.be.true();
    });
    it('allows built-in body parsers to be removed', async () => {
        app.unbind(__1.RestBindings.REQUEST_BODY_PARSER_JSON);
        await postRequest('/show-body', 415);
    });
    async function givenAClient() {
        parsedRequestBodyValue = undefined;
        app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
        app.controller(givenBodyParamController('/show-body-json', 'json'), 'Controller1');
        app.controller(givenBodyParamController('/show-body'), 'Controller2');
        await app.start();
        client = (0, testlab_1.createRestAppClient)(app);
    }
    async function postRequest(url = '/show-body', expectedStatusCode = 200) {
        const res = await client
            .post(url)
            .set('Content-Type', 'application/json')
            .send({ key: 'value' })
            .expect(expectedStatusCode);
        if (expectedStatusCode === 200) {
            (0, testlab_1.expect)(parsedRequestBodyValue).to.eql({ key: 'value' });
        }
        return res;
    }
    function givenBodyParamController(url, parser) {
        class RouteParamController {
            async showBody(request) {
                parsedRequestBodyValue = request;
                if (parser === 'stream') {
                    parsedRequestBodyValue = request.body;
                }
                const parserName = typeof parser === 'string' ? parser : parser === null || parser === void 0 ? void 0 : parser.name;
                return { key: 'new-value', parser: parserName };
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.post)(url, {
                responses: {
                    200: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                },
                            },
                        },
                        description: '',
                    },
                },
            }),
            (0, tslib_1.__param)(0, (0, __1.requestBody)({
                required: true,
                content: {
                    'application/json': {
                        // Customize body parsing
                        'x-parser': parser,
                        schema: { type: 'object' },
                    },
                    'application/x-www-form-urlencoded': {
                        // Customize body parsing
                        'x-parser': parser,
                        schema: { type: 'object' },
                    },
                },
            })),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", [Object]),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], RouteParamController.prototype, "showBody", null);
        return RouteParamController;
    }
});
//# sourceMappingURL=request-parsing.acceptance.js.map