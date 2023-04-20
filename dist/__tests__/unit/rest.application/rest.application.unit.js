"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
describe('RestApplication', () => {
    describe('throws', () => {
        it('when attempting to bind another server', () => {
            const app = new __1.RestApplication();
            testlab_1.expect.throws(() => {
                app.server(__1.RestServer, 'oops');
            }, Error, __1.ERR_NO_MULTI_SERVER);
        });
        it('when attempting to bind an array of servers', () => {
            const app = new __1.RestApplication();
            testlab_1.expect.throws(() => {
                app.servers([__1.RestServer, __1.RestServer]);
            }, Error, __1.ERR_NO_MULTI_SERVER);
        });
        it('when attempting bind multiple servers via RestComponent', () => {
            class OtherRestComponent extends __1.RestComponent {
            }
            testlab_1.expect.throws(() => {
                const app = new __1.RestApplication();
                app.component(__1.RestComponent);
                app.component(OtherRestComponent);
            }, Error, __1.ERR_NO_MULTI_SERVER);
        });
    });
});
//# sourceMappingURL=rest.application.unit.js.map