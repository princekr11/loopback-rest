import { Entity } from '@loopback/repository';
export declare class Book extends Entity {
    constructor(data?: Partial<Book>);
    id?: number;
    title: string;
}
export interface BookRelations {
}
export declare type BookWithRelations = Book & BookRelations;
