import { MixinTarget } from '@loopback/core';
import { Model } from '@loopback/repository';
/**
 * An interface to allow finding notes by title
 */
export interface FindByTitle<M extends Model> {
    findByTitle(title: string): Promise<M[]>;
}
/**
 * Options to mix in findByTitle
 */
export interface FindByTitleControllerMixinOptions {
    /**
     * Base path for the controller
     */
    basePath: string;
    /**
     * Model class for CRUD
     */
    modelClass: typeof Model;
}
/**
 * A mixin factory for controllers to be extended by `FindByTitle`
 * @param superClass - Base class
 * @param options - Options for the controller
 *
 * @typeParam M - Model class
 * @typeParam T - Base class
 */
export declare function FindByTitleControllerMixin<M extends Model, T extends MixinTarget<object>>(superClass: T, options: FindByTitleControllerMixinOptions): {
    new (...args: any[]): {
        repository: FindByTitle<M>;
        findByTitle(title: string): Promise<M[]>;
    };
} & T;
