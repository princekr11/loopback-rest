"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const __1 = require("../..");
describe('re-export controller decorators', () => {
    it('exports functions from @loopback/openapi-v3', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class Test {
            // Make sure the decorators are exported
            async test() {
                return '';
            }
        }
        (0, tslib_1.__decorate)([
            (0, __1.get)('/test'),
            (0, tslib_1.__metadata)("design:type", Function),
            (0, tslib_1.__metadata)("design:paramtypes", []),
            (0, tslib_1.__metadata)("design:returntype", Promise)
        ], Test.prototype, "test", null);
    });
});
//# sourceMappingURL=re-export.unit.js.map