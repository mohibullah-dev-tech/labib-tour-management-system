import type { FilterQuery, Model, UpdateQuery } from 'mongoose';

export class MongoRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  findOne(filter: FilterQuery<T>) {
    return this.model.findOne(filter).exec();
  }

  findMany(filter: FilterQuery<T>, limit = 50, skip = 0) {
    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(limit, 100))
      .exec();
  }

  create(data: Partial<T>) {
    return this.model.create(data);
  }

  updateById(id: string, update: UpdateQuery<T>) {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }
}
