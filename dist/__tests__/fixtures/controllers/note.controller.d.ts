import { Constructor } from '@loopback/core';
import { Count, Filter, Where } from '@loopback/repository';
import { Note } from '../models/note.model';
import { NoteRepository } from '../repositories/note.repository';
declare const NoteController_base: {
    new (...args: any[]): {
        repository: import("../mixins/find-by-title-controller-mixin").FindByTitle<Note>;
        findByTitle(title: string): Promise<Note[]>;
    };
} & Constructor<Object>;
export declare class NoteController extends NoteController_base {
    repository: NoteRepository;
    constructor(repository?: NoteRepository);
    create(note: Omit<Note, 'id'>): Promise<Note>;
    count(where?: Where<Note>): Promise<Count>;
    find(filter?: Filter<Note>): Promise<Note[]>;
    updateAll(note: Note, where?: Where<Note>): Promise<Count>;
    findById(id: number, filter?: Filter<Note>): Promise<Note>;
    updateById(id: number, note: Note): Promise<void>;
    replaceById(id: number, note: Note): Promise<void>;
    deleteById(id: number): Promise<void>;
}
export {};
