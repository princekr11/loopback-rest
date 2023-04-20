import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Note, NoteRelations } from '../models/note.model';
export declare const NOTE_REPO_BINDING_KEY = "repositories.myrepo";
export declare class NoteRepository extends DefaultCrudRepository<Note, typeof Note.prototype.id, NoteRelations> {
    constructor(ds?: juggler.DataSource);
    findByTitle(title: string): Promise<Note[]>;
}
