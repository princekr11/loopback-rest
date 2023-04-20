"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const stream_1 = require("stream");
const testlab_1 = require("@loopback/testlab");
describe('writer', () => {
    let response;
    let observedResponse;
    beforeEach(setupResponseMock);
    it('writes string result to response as text', async () => {
        (0, __1.writeResultToResponse)(response, 'Joe');
        const result = await observedResponse;
        // content-type should be 'application/json' since it's set
        // into the response in writer.writeResultToResponse()
        (0, testlab_1.expect)(result.headers['content-type']).to.eql('text/plain');
        (0, testlab_1.expect)(result.payload).to.equal('Joe');
    });
    it('writes object result to response as JSON', async () => {
        (0, __1.writeResultToResponse)(response, { name: 'Joe' });
        const result = await observedResponse;
        (0, testlab_1.expect)(result.headers['content-type']).to.eql('application/json');
        (0, testlab_1.expect)(result.payload).to.equal('{"name":"Joe"}');
    });
    it('writes boolean result to response as json', async () => {
        (0, __1.writeResultToResponse)(response, true);
        const result = await observedResponse;
        (0, testlab_1.expect)(result.headers['content-type']).to.eql('application/json');
        (0, testlab_1.expect)(result.payload).to.equal('true');
    });
    it('writes number result to response as json', async () => {
        (0, __1.writeResultToResponse)(response, 2);
        const result = await observedResponse;
        (0, testlab_1.expect)(result.headers['content-type']).to.eql('application/json');
        (0, testlab_1.expect)(result.payload).to.equal('2');
    });
    it('writes buffer result to response as binary', async () => {
        const buf = Buffer.from('ABC123');
        (0, __1.writeResultToResponse)(response, buf);
        const result = await observedResponse;
        (0, testlab_1.expect)(result.headers['content-type']).to.eql('application/octet-stream');
        (0, testlab_1.expect)(result.payload).to.equal('ABC123');
    });
    it('writes stream result to response as binary', async () => {
        const buf = Buffer.from('ABC123');
        const stream = new stream_1.Duplex();
        stream.push(buf);
        stream.push(null);
        (0, __1.writeResultToResponse)(response, stream);
        const result = await observedResponse;
        (0, testlab_1.expect)(result.headers['content-type']).to.eql('application/octet-stream');
        (0, testlab_1.expect)(result.payload).to.equal('ABC123');
    });
    it('writes null object result to response as JSON', async () => {
        (0, __1.writeResultToResponse)(response, null);
        const result = await observedResponse;
        (0, testlab_1.expect)(result.headers['content-type']).to.eql('application/json');
        (0, testlab_1.expect)(result.payload).to.equal('null');
    });
    it('sends 204 No Content when the response is undefined', async () => {
        (0, __1.writeResultToResponse)(response, undefined);
        const result = await observedResponse;
        (0, testlab_1.expect)(result.statusCode).to.equal(204);
        (0, testlab_1.expect)(result.headers).to.not.have.property('content-type');
        (0, testlab_1.expect)(result.payload).to.equal('');
    });
    it('skips writing when the return value is the response', async () => {
        response
            .status(200)
            .contentType('text/html; charset=utf-8')
            .send('<html><body>Hi</body></html>');
        (0, __1.writeResultToResponse)(response, response);
        const result = await observedResponse;
        (0, testlab_1.expect)(result.statusCode).to.equal(200);
        (0, testlab_1.expect)(result.headers).to.have.property('content-type', 'text/html; charset=utf-8');
        (0, testlab_1.expect)(result.payload).to.equal('<html><body>Hi</body></html>');
    });
    it('skips writing when the response headers are sent', async () => {
        response
            .status(200)
            .contentType('text/html; charset=utf-8')
            .send('<html><body>Hi</body></html>');
        (0, __1.writeResultToResponse)(response, undefined);
        const result = await observedResponse;
        (0, testlab_1.expect)(result.statusCode).to.equal(200);
        (0, testlab_1.expect)(result.headers).to.have.property('content-type', 'text/html; charset=utf-8');
        (0, testlab_1.expect)(result.payload).to.equal('<html><body>Hi</body></html>');
    });
    function setupResponseMock() {
        const responseMock = (0, testlab_1.stubExpressContext)();
        response = responseMock.response;
        observedResponse = responseMock.result;
        // content-type should be undefined since it's not set in the response yet.
        (0, testlab_1.expect)(response.getHeader('content-type')).to.eql(undefined);
    }
});
//# sourceMappingURL=writer.unit.js.map