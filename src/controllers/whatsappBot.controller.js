const whatsappBot = require('../services/whatsappBot.service');



async function webhook(req, res, next) {
  try {
    // res.json();
    let oResp = await whatsappBot.webhook(req.body, req.cookies);
    // console.log(oResp);
    res.cookie('sThread', oResp.sThread, ['Path=/']);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.status(200).end(oResp.twimlResponce);
  } catch (err) {
    console.error(`Error while webhook`, err.message);
    next(err);
  }
}

async function sendWhatsappMessage(req, res, next) {
  try {
    res.json(await whatsappBot.sendWhatsappMessage(req.body));
  } catch (err) {
    console.error(`Error sendWhatsappMessage`, err.message);
    next(err);
  }
}


module.exports = {
  webhook,
  sendWhatsappMessage
};
