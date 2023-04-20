"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@loopback/core");
const testlab_1 = require("@loopback/testlab");
const __1 = require("../..");
const note_controller_1 = require("../fixtures/controllers/note.controller");
const note_model_1 = require("../fixtures/models/note.model");
const note_repository_1 = require("../fixtures/repositories/note.repository");
describe('add method to controller via mixin', () => {
    let controller;
    const noteData = {
        title: 'groceries',
        content: 'eggs,bacon',
    };
    const expectedNote = new note_model_1.Note({
        id: 1,
        ...noteData,
    });
    it(`non-mixin method 'create' exists`, async () => {
        givenController();
        const note = await givenNewNote();
        (0, testlab_1.expect)(note).to.deepEqual(expectedNote);
    });
    it(`mixin method 'findByTitle' exists`, async () => {
        givenController();
        await givenNewNote();
        const foundNote = await controller.findByTitle('groceries');
        (0, testlab_1.expect)(foundNote).to.deepEqual([expectedNote]);
    });
    it('mixin endpoint /notes/findByTitle reachable', async () => {
        const app = givenAnApplication();
        const server = await givenAServer(app);
        await whenIMakeRequestTo(server)
            .post('/notes')
            .send(noteData)
            .expect(200, expectedNote.toJSON());
        return whenIMakeRequestTo(server)
            .get('/notes/findByTitle/groceries')
            .expect(200, JSON.stringify([expectedNote]));
    });
    function givenAnApplication() {
        const app = new core_1.Application();
        app.component(__1.RestComponent);
        app.bind(note_repository_1.NOTE_REPO_BINDING_KEY).to(new note_repository_1.NoteRepository());
        app.controller(note_controller_1.NoteController);
        return app;
    }
    async function givenAServer(app) {
        return app.getServer(__1.RestServer);
    }
    function whenIMakeRequestTo(serverOrApp) {
        return (0, testlab_1.createClientForHandler)(serverOrApp.requestHandler);
    }
    async function givenNewNote() {
        return controller.create(new note_model_1.Note(noteData));
    }
    function givenController() {
        controller = new note_controller_1.NoteController();
    }
});
//# sourceMappingURL=controller.mixin.unit.js.map