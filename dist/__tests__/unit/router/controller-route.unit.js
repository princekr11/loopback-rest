"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@loopback/core");
const openapi_spec_builder_1 = require("@loopback/openapi-spec-builder");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
describe('joinPath', () => {
    it('joins basePath and path', () => {
        (0, testlab_1.expect)((0, __1.joinPath)('', 'a')).to.equal('/a');
        (0, testlab_1.expect)((0, __1.joinPath)('/', '')).to.equal('/');
        (0, testlab_1.expect)((0, __1.joinPath)('/', 'a')).to.equal('/a');
        (0, testlab_1.expect)((0, __1.joinPath)('/root', 'a')).to.equal('/root/a');
        (0, testlab_1.expect)((0, __1.joinPath)('root', 'a')).to.equal('/root/a');
        (0, testlab_1.expect)((0, __1.joinPath)('root/', '/a')).to.equal('/root/a');
        (0, testlab_1.expect)((0, __1.joinPath)('root/', '/a/')).to.equal('/root/a');
        (0, testlab_1.expect)((0, __1.joinPath)('/root/', '/a/')).to.equal('/root/a');
        (0, testlab_1.expect)((0, __1.joinPath)('/root//x', '/a')).to.equal('/root/x/a');
        (0, testlab_1.expect)((0, __1.joinPath)('/root/', '/')).to.equal('/root');
        (0, testlab_1.expect)((0, __1.joinPath)('/root/x', '/a/b')).to.equal('/root/x/a/b');
        (0, testlab_1.expect)((0, __1.joinPath)('//root//x', '//a///b////c')).to.equal('/root/x/a/b/c');
    });
});
describe('ControllerRoute', () => {
    it('rejects routes with no methodName', () => {
        const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
        (0, testlab_1.expect)(() => new __1.ControllerRoute('get', '/greet', spec, MyController)).to.throw(/methodName must be provided.*"get \/greet".*MyController/);
    });
    it('creates a factory', () => {
        const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
        const route = new MyRoute('get', '/greet', spec, MyController, myControllerFactory, 'greet');
        (0, testlab_1.expect)(route._controllerFactory).to.be.a.Function();
    });
    it('honors a factory', () => {
        const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
        const factory = (0, __1.createControllerFactoryForBinding)('controllers.my-controller');
        const route = new MyRoute('get', '/greet', spec, MyController, factory, 'greet');
        (0, testlab_1.expect)(route._controllerFactory).to.be.exactly(factory);
    });
    it('infers controllerName from the class', () => {
        const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
        const route = new MyRoute('get', '/greet', spec, MyController, myControllerFactory, 'greet');
        (0, testlab_1.expect)(route._controllerName).to.eql(MyController.name);
    });
    it('honors controllerName from the spec', () => {
        const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
        spec['x-controller-name'] = 'my-controller';
        const route = new MyRoute('get', '/greet', spec, MyController, myControllerFactory, 'greet');
        (0, testlab_1.expect)(route._controllerName).to.eql('my-controller');
    });
    it('implements toString', () => {
        const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
        const route = new MyRoute('get', '/greet', spec, MyController, myControllerFactory, 'greet');
        (0, testlab_1.expect)(route.toString()).to.equal('MyRoute - get /greet => MyController.greet');
        (0, testlab_1.expect)(new __1.RouteSource(route).toString()).to.equal('MyRoute - get /greet => MyController.greet');
    });
    describe('updateBindings()', () => {
        let appCtx;
        let requestCtx;
        before(givenContextsAndControllerRoute);
        it('adds bindings to the request context', async () => {
            (0, testlab_1.expect)(requestCtx.contains(core_1.CoreBindings.CONTROLLER_CURRENT));
            (0, testlab_1.expect)(requestCtx.getBinding(core_1.CoreBindings.CONTROLLER_CURRENT).scope).to.equal(core_1.BindingScope.SINGLETON);
            (0, testlab_1.expect)(await requestCtx.get(core_1.CoreBindings.CONTROLLER_CLASS)).to.equal(MyController);
            (0, testlab_1.expect)(await requestCtx.get(core_1.CoreBindings.CONTROLLER_METHOD_NAME)).to.equal('greet');
            (0, testlab_1.expect)(await requestCtx.get(__1.RestBindings.OPERATION_SPEC_CURRENT)).to.eql({
                'x-controller-name': 'MyController',
                'x-operation-name': 'greet',
                tags: ['MyController'],
                responses: { '200': { description: 'An undocumented response body.' } },
            });
        });
        it('binds current controller to the request context as singleton', async () => {
            const controller1 = await requestCtx.get(core_1.CoreBindings.CONTROLLER_CURRENT);
            (0, testlab_1.expect)(controller1).instanceOf(MyController);
            const controller2 = await requestCtx.get(core_1.CoreBindings.CONTROLLER_CURRENT);
            (0, testlab_1.expect)(controller2).to.be.exactly(controller1);
            const childCtx = new core_1.Context(requestCtx);
            const controller3 = await childCtx.get(core_1.CoreBindings.CONTROLLER_CURRENT);
            (0, testlab_1.expect)(controller3).to.be.exactly(controller1);
            await (0, testlab_1.expect)(appCtx.get(core_1.CoreBindings.CONTROLLER_CURRENT)).to.be.rejectedWith(/The key .+ is not bound to any value/);
        });
        function givenContextsAndControllerRoute() {
            const spec = (0, openapi_spec_builder_1.anOperationSpec)().build();
            const route = new MyRoute('get', '/greet', spec, MyController, myControllerFactory, 'greet');
            appCtx = new core_1.Context('application');
            requestCtx = new core_1.Context(appCtx, 'request');
            route.updateBindings(requestCtx);
        }
    });
    class MyController {
        greet() {
            return 'Hello';
        }
    }
    const myControllerFactory = (0, __1.createControllerFactoryForClass)(MyController);
    class MyRoute extends __1.ControllerRoute {
    }
});
//# sourceMappingURL=controller-route.unit.js.map