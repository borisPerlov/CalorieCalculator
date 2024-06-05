const files = require('../services/files.service');

// async function get(req, res, next) {
//   try {
//       res.json(await programmingLanguages.getMultiple(req.query.page));
//   } catch (err) {
//       console.error(`Error while getting programming languages`, err.message);
//       next(err);
//   }
// }

async function upload(req, res, next) {
  try {
    res.json(await files.upload(req.body));
  } catch (err) {
    console.error(`Error while creating upload file`, err.message);
    next(err);
  }
}


// async function update(req, res, next) {
//   try {
//     res.json(await programmingLanguages.update(req.params.id, req.body));
//   } catch (err) {
//     console.error(`Error while updating programming language`, err.message);
//     next(err);
//   }
// }

// async function remove(req, res, next) {
//   try {
//     res.json(await programmingLanguages.remove(req.params.id));
//   } catch (err) {
//     console.error(`Error while deleting programming language`, err.message);
//     next(err);
//   }
// }

module.exports = {
  upload
};
