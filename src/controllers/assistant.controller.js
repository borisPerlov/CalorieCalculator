const assistant = require('../services/assistant.service');

async function retrieveAssistant(req, res, next) {
  try {
    res.json(await assistant.retrieveAssistant(req.query.assistant));
  } catch (err) {
    console.error(`Error while retrieveAssistant`, err.message);
    next(err);
  }
}

async function runAssistant(req, res, next) {
  try {
    res.json(await assistant.runAssistant(req.query.sAssistant, req.query.sThread, req.query.sMessage));


  } catch (err) {
    console.error(`Error while runAssistant`, err.message);
    next(err);
  }
}



async function createAssistant(req, res, next) {
  try {
    res.json(await assistant.createAssistant(req.body));
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
  createAssistant,
  retrieveAssistant,
  runAssistant
};
