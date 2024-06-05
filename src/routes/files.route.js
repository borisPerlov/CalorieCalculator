const express = require('express');
const router = express.Router();
const files = require('../controllers/files.controller');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();

router.post('/uploadFile', jsonParser, files.upload);



module.exports = router;
