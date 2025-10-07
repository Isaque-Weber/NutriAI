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
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from './base.repository';

export interface TenantEntity extends ObjectLiteral {
  organizationId: string;
}

export abstract class TenantAwareRepository<
  T extends TenantEntity,
> extends BaseRepository<T> {
  protected constructor(repository: Repository<T>) {
    super(repository);
  }

  private addOrganizationFilter(
    organizationId: string,
    options?: FindManyOptions<T>,
  ): FindManyOptions<T> {
    const where = options?.where || ({} as FindOptionsWhere<T>);

    if (Array.isArray(where)) {
      return {
        ...options,
        where: where.map(
          (w) => ({ ...w, organizationId }) as FindOptionsWhere<T>,
        ),
      };
    }

    return {
      ...options,
      where: { ...where, organizationId } as FindOptionsWhere<T>,
    };
  }

  private addOrganizationFilterOne(
    organizationId: string,
    options?: FindOneOptions<T>,
  ): FindOneOptions<T> {
    const where = options?.where || ({} as FindOptionsWhere<T>);

    if (Array.isArray(where)) {
      return {
        ...options,
        where: where.map(
          (w) => ({ ...w, organizationId }) as FindOptionsWhere<T>,
        ),
      };
    }

    return {
      ...options,
      where: { ...where, organizationId } as FindOptionsWhere<T>,
    };
  }

  findAllByOrganization(
    organizationId: string,
    options: PaginationOptions<T>,
  ): Promise<PaginatedResult<T>>;
  findAllByOrganization(
    organizationId: string,
    options?: FindManyOptions<T>,
  ): Promise<T[]>;
  findAllByOrganization(
    organizationId: string,
    options?: FindManyOptions<T> | PaginationOptions<T>,
  ): Promise<T[] | PaginatedResult<T>> {
    const filteredOptions = this.addOrganizationFilter(organizationId, options);
    return this.findAll(filteredOptions as any);
  }

  findOneByIdAndOrganizationId(
    id: string,
    organizationId: string,
    options?: FindOneOptions<T>,
  ): Promise<T | null> {
    const filteredOptions = this.addOrganizationFilterOne(organizationId, {
      ...options,
      where: { id: id } as unknown as FindOptionsWhere<T>,
    });

    return this.repo.findOne(filteredOptions);
  }

  createAndSaveWithOrganization(
    dto: DeepPartial<T>,
    organizationId: string,
  ): Promise<T> {
    const entityData = { ...dto, organizationId } as DeepPartial<T>;
    const entity = this.repo.create(entityData);
    return this.repo.save(entity);
  }

  async deleteByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<DeleteResult> {
    const whereCondition: FindOptionsWhere<T> = {
      id,
      organizationId,
    } as unknown as FindOptionsWhere<T>;
    return this.repo.delete(whereCondition);
  }

  async softDeleteByIdAndOrganizationId(
    id: string,
    organizationId: string,
  ): Promise<UpdateResult> {
    const whereCondition: FindOptionsWhere<T> = {
      id,
      organizationId,
    } as unknown as FindOptionsWhere<T>;
    return this.repo.softDelete(whereCondition);
  }

  async restoreByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<UpdateResult> {
    const whereCondition: FindOptionsWhere<T> = {
      id,
      organizationId,
    } as unknown as FindOptionsWhere<T>;
    return this.repo.restore(whereCondition);
  }
}
