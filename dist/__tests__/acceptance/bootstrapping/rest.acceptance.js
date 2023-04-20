"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
const core_1 = require("@loopback/core");
describe('Bootstrapping with RestComponent', () => {
    context('with a user-defined sequence', () => {
        let app;
        let server;
        before(givenAppWithUserDefinedSequence);
        it('binds the `sequence` key to the user-defined sequence', () => {
            // At this moment, the Sequence is not ready to be resolved
            // as RestBindings.Http.CONTEXT is not bound
            const binding = server.getBinding(__1.RestBindings.SEQUENCE);
            (0, testlab_1.expect)(binding.valueConstructor).to.equal(UserDefinedSequence);
        });
        class UserDefinedSequence extends __1.DefaultSequence {
        }
        async function givenAppWithUserDefinedSequence() {
            app = new core_1.Application({
                rest: {
                    sequence: UserDefinedSequence,
                    port: 0,
                },
            });
            app.component(__1.RestComponent);
            server = await app.getServer(__1.RestServer);
        }
    });
});
describe('Starting the application', () => {
    it('starts an HTTP server (using RestServer)', async () => {
        const app = new core_1.Application({
            rest: {
                port: 0,
            },
        });
        app.component(__1.RestComponent);
        const server = await app.getServer(__1.RestServer);
        server.handler(sequenceHandler);
        await startServerCheck(app);
    });
    it('starts an HTTP server (using RestApplication)', async () => {
        const app = new __1.RestApplication();
        app.restServer.bind(__1.RestBindings.PORT).to(0);
        app.handler(sequenceHandler);
        await startServerCheck(app);
    });
});
// Helper function to spin up the application instance and assert that it
// works.
async function startServerCheck(app) {
    const server = await app.getServer(__1.RestServer);
    await app.start();
    const port = await server.get(__1.RestBindings.PORT);
    await (0, testlab_1.supertest)(`http://localhost:${port}`)
        .get('/')
        .expect(200, 'hello world');
    await app.stop();
}
function sequenceHandler({ response }, sequence) {
    sequence.send(response, 'hello world');
}
//# sourceMappingURL=rest.acceptance.js.map