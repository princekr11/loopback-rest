"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindByTitleControllerMixin = void 0;
const tslib_1 = require("tslib");
const __1 = require("../../../");
/**
 * A mixin factory for controllers to be extended by `FindByTitle`
 * @param superClass - Base class
 * @param options - Options for the controller
 *
 * @typeParam M - Model class
 * @typeParam T - Base class
 */
function FindByTitleControllerMixin(superClass, options) {
    class MixedController extends superClass {
        async findByTitle(title) {
            return this.repository.findByTitle(title);
        }
    }
    (0, tslib_1.__decorate)([
        (0, __1.get)(`${options.basePath}/findByTitle/{title}`, {
            responses: {
                '200': {
                    description: `Array of ${options.modelClass.modelName} model instances`,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: (0, __1.getModelSchemaRef)(options.modelClass, {
                                    includeRelations: true,
                                }),
                            },
                        },
                    },
                },
            },
        }),
        (0, tslib_1.__param)(0, __1.param.path.string('title')),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [String]),
        (0, tslib_1.__metadata)("design:returntype", Promise)
    ], MixedController.prototype, "findByTitle", null);
    return MixedController;
}
exports.FindByTitleControllerMixin = FindByTitleControllerMixin;
//# sourceMappingURL=find-by-title-controller-mixin.js.map