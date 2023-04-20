"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
const core_1 = require("@loopback/core");
describe('createControllerFactory', () => {
    let ctx;
    beforeEach(() => {
        ctx = new core_1.Context();
    });
    it('creates a factory with binding key', async () => {
        ctx.bind('controllers.my-controller').toClass(MyController);
        const factory = (0, __1.createControllerFactoryForBinding)('controllers.my-controller');
        const inst = await factory(ctx);
        (0, testlab_1.expect)(inst).to.be.instanceof(MyController);
    });
    it('creates a factory with class', async () => {
        const factory = (0, __1.createControllerFactoryForClass)(MyController);
        const inst = await factory(ctx);
        (0, testlab_1.expect)(inst).to.be.instanceof(MyController);
    });
    it('creates a factory with an instance', async () => {
        const factory = (0, __1.createControllerFactoryForInstance)(new MyController());
        const inst = await factory(ctx);
        (0, testlab_1.expect)(inst).to.be.instanceof(MyController);
    });
    class MyController {
        greet() {
            return 'Hello';
        }
    }
});
//# sourceMappingURL=controller-factory.unit.js.map