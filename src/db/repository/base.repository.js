export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(data) {
    return this.model.create(data);
  }

  findById(id) {
    return this.model.findById(id);
  }

  findAll() {
    return this.model.find();
  }

  findOne(filter) {
    return this.model.findOne(filter);
  }

  findOneAndUpdate(filter, update, options = {}) {
    return this.model.findOneAndUpdate(filter, update, options);
  }

  findByIdAndUpdate(id, update, options = {}) {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  updateMany(filter, update) {
    return this.model.updateMany(filter, update);
  }

  deleteMany(filter) {
    return this.model.deleteMany(filter);
  }

  findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async exists(filter) {
    return Boolean(await this.model.exists(filter));
  }
}
