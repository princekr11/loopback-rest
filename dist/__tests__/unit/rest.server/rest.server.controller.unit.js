"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const core_1 = require("@loopback/core");
const __1 = require("../../..");
describe('Application.controller()', () => {
    it('binds the controller to "controllers.*" namespace', async () => {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        const server = await app.getServer(__1.RestServer);
        class TestController {
        }
        app.controller(TestController);
        let boundControllers = app.find('controllers.*').map(b => b.key);
        (0, testlab_1.expect)(boundControllers).to.containEql('controllers.TestController');
        // Bindings should also be available on the server context directly.
        boundControllers = server.find('controllers.*').map(b => b.key);
        (0, testlab_1.expect)(boundControllers).to.containEql('controllers.TestController');
    });
});
//# sourceMappingURL=rest.server.controller.unit.js.map