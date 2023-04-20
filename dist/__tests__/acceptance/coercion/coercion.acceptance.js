"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../../..");
describe('Coercion', () => {
    let app;
    let client;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let spy;
    before(givenAClient);
    after(async () => {
        await app.stop();
    });
    afterEach(() => {
        if (spy)
            spy.restore();
    });
    /* --------- schema defined for object query ---------- */
    const filterSchema = {
        type: 'object',
        title: 'filter',
        properties: {
            where: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    active: { type: 'boolean' },
                },
            },
        },
    };
    /* ----------------------- end ----------------------- */
    /* --------- models defined for nested inclusion query -------- */
    let Todo = class Todo extends repository_1.Entity {
    };
    (0, tslib_1.__decorate)([
        (0, repository_1.property)({
            type: 'number',
            id: true,
            generated: false,
        }),
        (0, tslib_1.__metadata)("design:type", Number)
    ], Todo.prototype, "id", void 0);
    (0, tslib_1.__decorate)([
        (0, repository_1.belongsTo)(() => TodoList),
        (0, tslib_1.__metadata)("design:type", Number)
    ], Todo.prototype, "todoListId", void 0);
    Todo = (0, tslib_1.__decorate)([
        (0, repository_1.model)()
    ], Todo);
    let TodoListImage = class TodoListImage extends repository_1.Entity {
    };
    (0, tslib_1.__decorate)([
        (0, repository_1.property)({
            type: 'number',
            id: true,
            generated: false,
        }),
        (0, tslib_1.__metadata)("design:type", Number)
    ], TodoListImage.prototype, "id", void 0);
    (0, tslib_1.__decorate)([
        (0, repository_1.belongsTo)(() => TodoList),
        (0, tslib_1.__metadata)("design:type", Number)
    ], TodoListImage.prototype, "todoListId", void 0);
    (0, tslib_1.__decorate)([
        (0, repository_1.property)({
            required: true,
        }),
        (0, tslib_1.__metadata)("design:type", String)
    ], TodoListImage.prototype, "value", void 0);
    TodoListImage = (0, tslib_1.__decorate)([
        (0, repository_1.model)()
    ], TodoListImage);
    let TodoList = class TodoList extends repository_1.Entity {
    };
    (0, tslib_1.__decorate)([
        (0, repository_1.property)({
            type: 'number',
            id: true,
            generated: false,
        }),
        (0, tslib_1.__metadata)("design:type", Number)
    ], TodoList.prototype, "id", void 0);
    (0, tslib_1.__decorate)([
        (0, repository_1.hasMany)(() => Todo),
        (0, tslib_1.__metadata)("design:type", Array)
    ], TodoList.prototype, "todos", void 0);
    (0, tslib_1.__decorate)([
        (0, repository_1.hasOne)(() => TodoListImage),
        (0, tslib_1.__metadata)("design:type", TodoListImage)
    ], TodoList.prototype, "image", void 0);
    TodoList = (0, tslib_1.__decorate)([
        (0, repository_1.model)()
    ], TodoList);
    /* ---------------------------- end --------------------------- */
    class MyController {
        createNumberFromPath(num) {
            return num;
        }
        createNumberFromQuery(num) {
            return num;
        }
        createNumberFromHeader(num) {
            return num;
        }
        getStringFromQuery(where) {
            return where;
        }
        getObjectFromQuery(filter) {
            return filter;
        }
        getRandomObjectFromQuery(filter) {
            return filter;
        }
        nestedInclusionFromQuery(filter) {
            return filter;
        }
        getArrayFromQuery(stringArray) {
            return stringArray;
        }
    }
    (0, tslib_1.__decorate)([
        (0, __1.get)('/create-number-from-path/{num}'),
        (0, tslib_1.__param)(0, __1.param.path.number('num')),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Number]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "createNumberFromPath", null);
    (0, tslib_1.__decorate)([
        (0, __1.get)('/create-number-from-query'),
        (0, tslib_1.__param)(0, __1.param.query.number('num')),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Number]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "createNumberFromQuery", null);
    (0, tslib_1.__decorate)([
        (0, __1.get)('/create-number-from-header'),
        (0, tslib_1.__param)(0, __1.param.header.number('num')),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Number]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "createNumberFromHeader", null);
    (0, tslib_1.__decorate)([
        (0, __1.get)('/string-from-query'),
        (0, tslib_1.__param)(0, __1.param.query.string('where')),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [String]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "getStringFromQuery", null);
    (0, tslib_1.__decorate)([
        (0, __1.get)('/object-from-query'),
        (0, tslib_1.__param)(0, __1.param.query.object('filter', filterSchema)),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Object]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "getObjectFromQuery", null);
    (0, tslib_1.__decorate)([
        (0, __1.get)('/random-object-from-query'),
        (0, tslib_1.__param)(0, __1.param.query.object('filter')),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Object]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "getRandomObjectFromQuery", null);
    (0, tslib_1.__decorate)([
        (0, __1.get)('/nested-inclusion-from-query'),
        (0, tslib_1.__param)(0, __1.param.filter(Todo)),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Object]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "nestedInclusionFromQuery", null);
    (0, tslib_1.__decorate)([
        (0, __1.get)('/array-parameters-from-query'),
        (0, tslib_1.__param)(0, __1.param.array('stringArray', 'query', { type: 'string' })),
        (0, tslib_1.__metadata)("design:type", Function),
        (0, tslib_1.__metadata)("design:paramtypes", [Array]),
        (0, tslib_1.__metadata)("design:returntype", void 0)
    ], MyController.prototype, "getArrayFromQuery", null);
    it('coerces parameter in path from string to number', async () => {
        spy = testlab_1.sinon.spy(MyController.prototype, 'createNumberFromPath');
        await client.get('/create-number-from-path/100').expect(200);
        testlab_1.sinon.assert.calledWithExactly(spy, 100);
    });
    it('coerces parameter in header from string to number', async () => {
        spy = testlab_1.sinon.spy(MyController.prototype, 'createNumberFromHeader');
        await client.get('/create-number-from-header').set({ num: 100 });
        testlab_1.sinon.assert.calledWithExactly(spy, 100);
    });
    it('coerces parameter in query from string to number', async () => {
        spy = testlab_1.sinon.spy(MyController.prototype, 'createNumberFromQuery');
        await client.get('/create-number-from-query').query({ num: 100 }).expect(200);
        testlab_1.sinon.assert.calledWithExactly(spy, 100);
    });
    it('coerces parameter in query from JSON to object', async () => {
        spy = testlab_1.sinon.spy(MyController.prototype, 'getObjectFromQuery');
        await client
            .get('/object-from-query')
            .query({ filter: '{"where":{"id":1,"name":"Pen", "active": true}}' })
            .expect(200);
        testlab_1.sinon.assert.calledWithExactly(spy, {
            where: { id: 1, name: 'Pen', active: true },
        });
    });
    it('coerces parameter in query from nested keys to object', async () => {
        // Notice that numeric and boolean values are coerced to their own types
        // because the schema is provided.
        spy = testlab_1.sinon.spy(MyController.prototype, 'getObjectFromQuery');
        await client
            .get('/object-from-query')
            .query({
            'filter[where][id]': 1,
            'filter[where][name]': 'Pen',
            'filter[where][active]': true,
        })
            .expect(200);
        testlab_1.sinon.assert.calledWithExactly(spy, {
            where: {
                id: 1,
                name: 'Pen',
                active: true,
            },
        });
    });
    it('coerces parameter in query from nested keys to object - no schema', async () => {
        // Notice that numeric and boolean values are converted to strings.
        // This is because all values are encoded as strings on URL queries
        // and we did not specify any schema in @param.query.object() decorator.
        spy = testlab_1.sinon.spy(MyController.prototype, 'getRandomObjectFromQuery');
        await client
            .get('/random-object-from-query')
            .query({
            'filter[where][id]': 1,
            'filter[where][name]': 'Pen',
            'filter[where][active]': true,
        })
            .expect(200);
        testlab_1.sinon.assert.calledWithExactly(spy, {
            where: {
                id: '1',
                name: 'Pen',
                active: 'true',
            },
        });
    });
    it('rejects object value constructed by qs for string parameter', async () => {
        await client
            .get('/string-from-query')
            .query({
            'where[id]': 1,
            'where[name]': 'Pen',
            'where[active]': true,
        })
            .expect(400);
    });
    it('allows nested inclusion filter', async () => {
        spy = testlab_1.sinon.spy(MyController.prototype, 'nestedInclusionFromQuery');
        const inclusionFilter = {
            include: [
                {
                    relation: 'todoList',
                    scope: {
                        include: [
                            {
                                relation: 'image',
                                scope: {
                                    fields: { value: false },
                                },
                            },
                        ],
                    },
                },
            ],
        };
        const encodedFilter = encodeURIComponent(JSON.stringify(inclusionFilter));
        await client
            .get(`/nested-inclusion-from-query?filter=${encodedFilter}`)
            .expect(200);
        testlab_1.sinon.assert.calledWithExactly(spy, { ...inclusionFilter });
    });
    it('returns AJV validation errors in error details', async () => {
        const filter = {
            where: 'string-instead-of-object',
        };
        const response = await client
            .get(`/nested-inclusion-from-query`)
            .query({ filter: JSON.stringify(filter) })
            .expect(400);
        (0, testlab_1.expect)(response.body.error).to.containDeep({
            code: 'INVALID_PARAMETER_VALUE',
            details: [
                {
                    code: 'type',
                    info: {
                        type: 'object',
                    },
                    message: 'must be object',
                    path: '/where',
                },
            ],
        });
        (0, testlab_1.expect)(response.body.error.message).to.match(/Invalid data.* for parameter "filter"/);
    });
    describe('coerces array parameters', () => {
        it('coerces a single value into an array with one item', async () => {
            const response = await client
                .get('/array-parameters-from-query')
                .query({
                stringArray: 'hello',
            })
                .expect(200);
            (0, testlab_1.expect)(response.body).to.eql(['hello']);
        });
        it('preserves array values as arrays', async () => {
            const response = await client
                .get('/array-parameters-from-query')
                .query({
                stringArray: ['hello', 'loopback', 'world'],
            })
                .expect(200);
            (0, testlab_1.expect)(response.body).to.eql(['hello', 'loopback', 'world']);
        });
    });
    async function givenAClient() {
        app = new __1.RestApplication({ rest: (0, testlab_1.givenHttpServerConfig)() });
        app.controller(MyController);
        await app.start();
        client = (0, testlab_1.createRestAppClient)(app);
    }
});
//# sourceMappingURL=coercion.acceptance.js.map