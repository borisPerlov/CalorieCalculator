const express = require('express');
const router = express.Router();
const whatsappBot = require('../controllers/whatsappBot.controller');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();

router.post('/webhook', jsonParser, whatsappBot.webhook);
router.post('/sendWhatsappMessage', jsonParser, whatsappBot.sendWhatsappMessage);


module.exports = router;
