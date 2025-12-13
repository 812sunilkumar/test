export abstract class AbstractRepository<T> {
  abstract create(item: Partial<T>): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract find(filter?: any): Promise<T[]>;
  abstract update(id: string, update: Partial<T>): Promise<T | null>;
}
