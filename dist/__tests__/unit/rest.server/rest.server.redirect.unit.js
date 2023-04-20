"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const core_1 = require("@loopback/core");
const __1 = require("../../..");
describe('RestServer.redirect()', () => {
    it('binds the redirect route', async () => {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        const server = await app.getServer(__1.RestServer);
        server.redirect('/test', '/test/');
        const boundRoutes = server.find('routes.*').map(b => b.key);
        (0, testlab_1.expect)(boundRoutes).to.containEql('routes.get %2Ftest');
    });
});
//# sourceMappingURL=rest.server.redirect.unit.js.map