const save = (controller, data) => {
  return new Promise((resolve, reject) => {
    controller.storage.teams.save(data, err => {
      if (err !== null) {
        reject(err);
      }
      resolve();
    });
  });
};

const get = (controller, id) => {
  return new Promise((resolve, reject) => {
    controller.storage.teams.get(id, (err, data) => {
      if (err !== null) {
        reject(err);
      }
      resolve(data ? data.values : null);
    });
  });
};

// can't be called "delete"
const deleteId = (controller, id) => {
  return new Promise((resolve, reject) => {
    controller.storage.teams.delete(err => {
      if (err !== null) {
        reject(err);
      }
      resolve();
    });
  });
};

const all = controller => {
  return new Promise((resolve, reject) => {
    controller.storage.teams.all((err, data) => {
      if (err !== null) {
        reject(err);
      }
      resolve(data.values);
    });
  });
};

module.exports = { save, get, delete: deleteId, all };
