"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
describe('validateApiPath', () => {
    const INVALID_PARAM = /Invalid path template: '.+'. Please use \{\w+\} instead of '\:\w+'/;
    const NO_PARAM_MODIFIER = /Parameter modifier '.+' is not allowed in path/;
    const INVALID_PARAM_NAME = /Invalid parameter name '.+' found in path/;
    const UNNAMED_PARAM = /Unnamed parameter is not allowed in path/;
    it('allows /{foo}/bar', () => {
        const path = (0, __1.validateApiPath)('/{foo}/bar');
        (0, testlab_1.expect)(path).to.eql('/{foo}/bar');
    });
    it('allows /{foo}/{bar}', () => {
        const path = (0, __1.validateApiPath)('/{foo}/{bar}');
        (0, testlab_1.expect)(path).to.eql('/{foo}/{bar}');
    });
    it('allows /{foo}.{bar}', () => {
        const path = (0, __1.validateApiPath)('/{foo}.{bar}');
        (0, testlab_1.expect)(path).to.eql('/{foo}.{bar}');
    });
    it('allows /{foo}@{bar}', () => {
        const path = (0, __1.validateApiPath)('/{foo}@{bar}');
        (0, testlab_1.expect)(path).to.eql('/{foo}@{bar}');
    });
    it('allows /{foo}#{bar}', () => {
        const path = (0, __1.validateApiPath)('/{foo}#{bar}');
        (0, testlab_1.expect)(path).to.eql('/{foo}#{bar}');
    });
    it('allows /{_foo}/{bar}', () => {
        const path = (0, __1.validateApiPath)('/{_foo}/{bar}');
        (0, testlab_1.expect)(path).to.eql('/{_foo}/{bar}');
    });
    it('disallows /:foo/bar', () => {
        disallows('/:foo/bar');
    });
    it('disallows /:foo/:bar', () => {
        disallows('/:foo/:bar');
    });
    it('disallows /:foo+', () => {
        disallows('/:foo+');
    });
    it('disallows /:foo?', () => {
        disallows('/:foo?');
    });
    it('disallows /:foo*', () => {
        disallows('/:foo*');
    });
    it('disallows /:foo(\\d+)', () => {
        disallows('/:foo(\\d+)');
    });
    it('disallows /foo/(.*)', () => {
        disallows('/foo/(.*)', UNNAMED_PARAM);
    });
    it('disallows /{foo}+', () => {
        disallows('/{foo}+', NO_PARAM_MODIFIER);
    });
    it('disallows /{foo}?', () => {
        disallows('/{foo}?', NO_PARAM_MODIFIER);
    });
    it('disallows /{foo}*', () => {
        disallows('/{foo}*', NO_PARAM_MODIFIER);
    });
    it('disallows /{foo}(\\d+)', () => {
        disallows('/{foo}(\\d+)', UNNAMED_PARAM);
    });
    it('disallows /{$123}', () => {
        disallows('/{$123}', INVALID_PARAM_NAME);
    });
    it('disallows /{%abc}', () => {
        disallows('/{%abc}', INVALID_PARAM_NAME);
    });
    function disallows(path, pattern) {
        (0, testlab_1.expect)(() => (0, __1.validateApiPath)(path)).to.throw(pattern !== null && pattern !== void 0 ? pattern : INVALID_PARAM);
    }
});
//# sourceMappingURL=openapi-path.unit.js.map