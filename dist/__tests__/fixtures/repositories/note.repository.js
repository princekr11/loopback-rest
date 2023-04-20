"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteRepository = exports.NOTE_REPO_BINDING_KEY = void 0;
const repository_1 = require("@loopback/repository");
const note_model_1 = require("../models/note.model");
exports.NOTE_REPO_BINDING_KEY = 'repositories.myrepo';
class NoteRepository extends repository_1.DefaultCrudRepository {
    constructor(ds = new repository_1.juggler.DataSource({
        connector: 'memory',
    })) {
        super(note_model_1.Note, ds);
    }
    async findByTitle(title) {
        const where = { title };
        const titleFilter = { where };
        return this.find(titleFilter);
    }
}
exports.NoteRepository = NoteRepository;
//# sourceMappingURL=note.repository.js.map