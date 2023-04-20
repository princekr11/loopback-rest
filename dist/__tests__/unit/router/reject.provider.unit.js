"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
describe('reject', () => {
    const noopLogger = () => { };
    const testError = new Error('test error');
    let contextStub;
    beforeEach(givenStubbedContext);
    it('returns HTTP response with status code 500 by default', async () => {
        const reject = __1.RejectProvider.value(noopLogger);
        reject(contextStub, testError);
        const result = await contextStub.result;
        (0, testlab_1.expect)(result).to.have.property('statusCode', 500);
    });
    it('converts error code ENTITY_NOT_FOUND to status code 404', async () => {
        const reject = __1.RejectProvider.value(noopLogger);
        const notFoundError = new Error('not found');
        notFoundError.code = 'ENTITY_NOT_FOUND';
        reject(contextStub, notFoundError);
        const result = await contextStub.result;
        (0, testlab_1.expect)(result.statusCode).to.equal(404);
    });
    it('logs the error', async () => {
        const logger = testlab_1.sinon.spy();
        const reject = __1.RejectProvider.value(logger);
        reject(contextStub, testError);
        await contextStub.result;
        testlab_1.sinon.assert.calledWith(logger, testError, 500, contextStub.request);
    });
    function givenStubbedContext() {
        contextStub = (0, testlab_1.stubExpressContext)();
    }
});
//# sourceMappingURL=reject.provider.unit.js.map