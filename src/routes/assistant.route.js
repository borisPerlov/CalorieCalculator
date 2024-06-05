const express = require('express');
const router = express.Router();
const assistant = require('../controllers/assistant.controller');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();


router.post('/createAssistant', jsonParser, assistant.createAssistant);
router.get('/retrieveAssistant', assistant.retrieveAssistant);
router.get('/runAssistant', assistant.runAssistant);

module.exports = router;
