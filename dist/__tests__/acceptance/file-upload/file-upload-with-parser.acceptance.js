"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const testlab_1 = require("@loopback/testlab");
const multer_1 = (0, tslib_1.__importDefault)(require("multer"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const __1 = require("../../..");
const FORM_DATA = 'multipart/form-data';
describe('multipart/form-data parser', () => {
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
            .attach('testFile', path_1.default.resolve(FIXTURES, 'file-upload-test.txt'), {
            filename: 'file-upload-test.txt',
            contentType: FORM_DATA,
        })
            .expect(200);
        (0, testlab_1.expect)(res.body.files[0]).containEql({
            fieldname: 'testFile',
            originalname: 'file-upload-test.txt',
            mimetype: FORM_DATA,
        });
        (0, testlab_1.expect)(res.body.fields.user).to.equal('john');
        (0, testlab_1.expect)(res.body.fields.email).to.equal('john@example.com');
    });
    class FileUploadController {
        async showBody(body) {
            return body;
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
                [FORM_DATA]: {
                    schema: { type: 'object' },
                },
            },
        })),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Object]),
        (0, tslib_1.__metadata)("design:returntype", Promise)
    ], FileUploadController.prototype, "showBody", null);
    async function givenAClient() {
        app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
        app.bodyParser(MultipartFormDataBodyParser);
        app.controller(FileUploadController);
        await app.start();
        client = (0, testlab_1.createRestAppClient)(app);
    }
});
class MultipartFormDataBodyParser {
    constructor() {
        this.name = FORM_DATA;
    }
    supports(mediaType) {
        // The mediaType can be
        // `multipart/form-data; boundary=--------------------------979177593423179356726653`
        return mediaType.startsWith(FORM_DATA);
    }
    async parse(request) {
        const storage = multer_1.default.memoryStorage();
        const upload = (0, multer_1.default)({ storage });
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            upload.any()(request, {}, (err) => {
                if (err)
                    reject(err);
                else {
                    resolve({
                        value: {
                            files: request.files,
                            fields: request.body,
                        },
                    });
                }
            });
        });
    }
}
//# sourceMappingURL=file-upload-with-parser.acceptance.js.map