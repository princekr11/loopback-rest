"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const __1 = require("../../../");
const find_by_title_controller_mixin_1 = require("../mixins/find-by-title-controller-mixin");
const note_model_1 = require("../models/note.model");
const note_repository_1 = require("../repositories/note.repository");
const options = {
    basePath: '/notes',
    modelClass: note_model_1.Note,
};
let NoteController = class NoteController extends (0, find_by_title_controller_mixin_1.FindByTitleControllerMixin)(Object, options) {
    constructor(repository = new note_repository_1.NoteRepository()) {
        super();
        this.repository = repository;
    }
    async create(note) {
        return this.repository.create(note);
    }
    async count(where) {
        return this.repository.count(where);
    }
    async find(filter) {
        return this.repository.find(filter);
    }
    async updateAll(note, where) {
        return this.repository.updateAll(note, where);
    }
    async findById(id, filter) {
        return this.repository.findById(id, filter);
    }
    async updateById(id, note) {
        await this.repository.updateById(id, note);
    }
    async replaceById(id, note) {
        await this.repository.replaceById(id, note);
    }
    async deleteById(id) {
        await this.repository.deleteById(id);
    }
};
(0, tslib_1.__decorate)([
    (0, __1.post)('/notes', {
        responses: {
            '200': {
                description: 'Note model instance',
                content: { 'application/json': { schema: (0, __1.getModelSchemaRef)(note_model_1.Note) } },
            },
        },
    }),
    (0, tslib_1.__param)(0, (0, __1.requestBody)({
        content: {
            'application/json': {
                schema: (0, __1.getModelSchemaRef)(note_model_1.Note, {
                    title: 'NewNote',
                    exclude: ['id'],
                }),
            },
        },
    })),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], NoteController.prototype, "create", null);
(0, tslib_1.__decorate)([
    (0, __1.get)('/notes/count', {
        responses: {
            '200': {
                description: 'Note model count',
                content: { 'application/json': { schema: repository_1.CountSchema } },
            },
        },
    }),
    (0, tslib_1.__param)(0, __1.param.query.object('where', (0, __1.getWhereSchemaFor)(note_model_1.Note))),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], NoteController.prototype, "count", null);
(0, tslib_1.__decorate)([
    (0, __1.get)('/notes', {
        responses: {
            '200': {
                description: 'Array of Note model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: (0, __1.getModelSchemaRef)(note_model_1.Note, { includeRelations: true }),
                        },
                    },
                },
            },
        },
    }),
    (0, tslib_1.__param)(0, __1.param.query.object('filter', (0, __1.getFilterSchemaFor)(note_model_1.Note))),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], NoteController.prototype, "find", null);
(0, tslib_1.__decorate)([
    (0, __1.patch)('/notes', {
        responses: {
            '200': {
                description: 'Note PATCH success count',
                content: { 'application/json': { schema: repository_1.CountSchema } },
            },
        },
    }),
    (0, tslib_1.__param)(0, (0, __1.requestBody)({
        content: {
            'application/json': {
                schema: (0, __1.getModelSchemaRef)(note_model_1.Note, { partial: true }),
            },
        },
    })),
    (0, tslib_1.__param)(1, __1.param.query.object('where', (0, __1.getWhereSchemaFor)(note_model_1.Note))),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [note_model_1.Note, Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], NoteController.prototype, "updateAll", null);
(0, tslib_1.__decorate)([
    (0, __1.get)('/notes/{id}', {
        responses: {
            '200': {
                description: 'Note model instance',
                content: {
                    'application/json': {
                        schema: (0, __1.getModelSchemaRef)(note_model_1.Note, { includeRelations: true }),
                    },
                },
            },
        },
    }),
    (0, tslib_1.__param)(0, __1.param.path.number('id')),
    (0, tslib_1.__param)(1, __1.param.query.object('filter', (0, __1.getFilterSchemaFor)(note_model_1.Note))),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Number, Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], NoteController.prototype, "findById", null);
(0, tslib_1.__decorate)([
    (0, __1.patch)('/notes/{id}', {
        responses: {
            '204': {
                description: 'Note PATCH success',
            },
        },
    }),
    (0, tslib_1.__param)(0, __1.param.path.number('id')),
    (0, tslib_1.__param)(1, (0, __1.requestBody)({
        content: {
            'application/json': {
                schema: (0, __1.getModelSchemaRef)(note_model_1.Note, { partial: true }),
            },
        },
    })),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Number, note_model_1.Note]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], NoteController.prototype, "updateById", null);
(0, tslib_1.__decorate)([
    (0, __1.put)('/notes/{id}', {
        responses: {
            '204': {
                description: 'Note PUT success',
            },
        },
    }),
    (0, tslib_1.__param)(0, __1.param.path.number('id')),
    (0, tslib_1.__param)(1, (0, __1.requestBody)()),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Number, note_model_1.Note]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], NoteController.prototype, "replaceById", null);
(0, tslib_1.__decorate)([
    (0, __1.del)('/notes/{id}', {
        responses: {
            '204': {
                description: 'Note DELETE success',
            },
        },
    }),
    (0, tslib_1.__param)(0, __1.param.path.number('id')),
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Number]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], NoteController.prototype, "deleteById", null);
NoteController = (0, tslib_1.__decorate)([
    (0, tslib_1.__param)(0, (0, core_1.inject)(note_repository_1.NOTE_REPO_BINDING_KEY)),
    (0, tslib_1.__metadata)("design:paramtypes", [note_repository_1.NoteRepository])
], NoteController);
exports.NoteController = NoteController;
//# sourceMappingURL=note.controller.js.map