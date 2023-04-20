"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const testlab_1 = require("@loopback/testlab");
const multer_1 = (0, tslib_1.__importDefault)(require("multer"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const __1 = require("../../..");
describe('multipart/form-data', () => {
    let client;
    let app;
    before(givenAClient);
    after(async () => {
        await app.stop();
    });
    it('supports file uploads', async () => {
        const FIXTURES = path_1.default.resolve(__dirname, '../../../../fixtures');
        const res = await client
            .post('/show-body')
            .field('user', 'john')
            .field('email', 'john@example.com')
            .attach('testFile1', path_1.default.resolve(FIXTURES, 'file-upload-test.txt'), {
            filename: 'file-upload-test.txt',
            contentType: 'multipart/form-data',
        })
            .attach('testFile2', path_1.default.resolve(FIXTURES, 'assets/index.html'), {
            filename: 'index.html',
            contentType: 'multipart/form-data',
        })
            .expect(200);
        (0, testlab_1.expect)(res.body.files[0]).containEql({
            fieldname: 'testFile1',
            originalname: 'file-upload-test.txt',
            mimetype: 'multipart/form-data',
        });
        (0, testlab_1.expect)(res.body.files[1]).containEql({
            fieldname: 'testFile2',
            originalname: 'index.html',
            mimetype: 'multipart/form-data',
        });
    });
    class FileUploadController {
        async showBody(request, response) {
            const storage = multer_1.default.memoryStorage();
            const upload = (0, multer_1.default)({ storage });
            return new Promise((resolve, reject) => {
                upload.any()(request, response, (err) => {
                    if (err)
                        reject(err);
                    else {
                        resolve({
                            files: request.files,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            fields: request.fields,
                        });
                    }
                });
            });
        }
    }
    (0, tslib_1.__decorate)([
        (0, __1.post)('/show-body', {
            responses: {
                200: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                            },
                        },
                    },
                    description: '',
                },
            },
        }),
        (0, tslib_1.__param)(0, (0, __1.requestBody)({
            description: 'multipart/form-data value.',
            required: true,
            content: {
                'multipart/form-data': {
                    // Skip body parsing
                    'x-parser': 'stream',
                    schema: { type: 'object' },
                },
            },
        })),
        (0, tslib_1.__param)(1, (0, core_1.inject)(__1.RestBindings.Http.RESPONSE)),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Object, Object]),
        (0, tslib_1.__metadata)("design:returntype", Promise)
    ], FileUploadController.prototype, "showBody", null);
    async function givenAClient() {
        app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
        app.controller(FileUploadController);
        await app.start();
        client = (0, testlab_1.createRestAppClient)(app);
    }
});
//# sourceMappingURL=file-upload.acceptance.js.map