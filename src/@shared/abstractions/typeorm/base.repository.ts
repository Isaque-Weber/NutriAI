import {
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  DeleteResult,
  UpdateResult,
  ObjectLiteral,
} from 'typeorm';

export interface PaginationOptions<T> {
  page?: number;
  limit?: number;
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  order?: FindManyOptions<T>['order'];
  relations?: FindManyOptions<T>['relations'];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly repo: Repository<T>;

  protected constructor(repository: Repository<T>) {
    this.repo = repository;
  }

  findAll(options: PaginationOptions<T>): Promise<PaginatedResult<T>>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  async findAll(
    options?: FindManyOptions<T> | PaginationOptions<T>,
  ): Promise<T[] | PaginatedResult<T>> {
    const isPaginated = options && ('page' in options || 'limit' in options);

    if (isPaginated) {
      const page = options.page ?? 1;
      const limit = options.limit ?? 10;

      const [data, total] = await this.repo.findAndCount({
        ...options,
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);
      return { data, total, page, limit, totalPages };
    }

    return this.repo.find(options);
  }

  findOneById(id: string, options?: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      ...options,
    });
  }

  createAndSave(dto: DeepPartial<T>): Promise<T> {
    const ent = this.repo.create(dto);
    return this.repo.save(ent);
  }

  save(entity: T): Promise<T> {
    return this.repo.save(entity);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.repo.softDelete(id);
  }

  restore(id: string): Promise<UpdateResult> {
    return this.repo.restore(id);
  }
}
