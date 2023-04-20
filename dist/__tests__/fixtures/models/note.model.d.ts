import { Entity } from '@loopback/repository';
export declare class Note extends Entity {
    constructor(data?: Partial<Note>);
    id?: number;
    title: string;
    content?: string;
}
export interface NoteRelations {
}
export declare type NoteWithRelations = Note & NoteRelations;
