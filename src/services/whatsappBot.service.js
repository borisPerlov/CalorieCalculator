

const MessagingResponse = require('twilio').twiml.MessagingResponse;
const axios = require('axios');
const { runAssistant } = require('./assistant.service');
const { upload } = require('./files.service');
const generalConfig = require('../configs/general.config');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


async function sendWhatsappMessage(mediaUrl, body, to, sThread) {
    const client = axios.create({
        baseURL: 'https://api.twilio.com/2010-04-01/',
        auth: {
            username: accountSid,
            password: authToken,
        },
    });

    // Add your cookies here
    const cookies = 'sThread=' + sThread;

    // res.cookie('sThread', oResp.sThread, ['Path=/']);

    let url = '/Accounts/' + accountSid + '/Messages.json'
    const options = {
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies, // Add the cookies to the request headers
        },
        data: mediaUrl.length > 0 ? new URLSearchParams({
            From: 'whatsapp:+14155238886',
            Body: body,
            MediaUrl: mediaUrl,
            To: to,
        }) : new URLSearchParams({
            From: 'whatsapp:+14155238886',
            Body: body,
            To: to,
        }),
    };

    try {
        const response = await client(options);
        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}

async function webhook(body, cookies) {


    const twiml = new MessagingResponse();
    // const incomingMessage = body.Body;

    const incomingMessage = body.Body;
    let sThread = "";

    if (cookies && cookies.sThread) {
        sThread = cookies.sThread
    }

    let oAssistantResponce = await runAssistant(process.env["assistant"], sThread, incomingMessage);

    // let oAssistantResponce = {
    //     sThread: "thread_ZhISbY5KLdnWt3NJ6raiDaT7",
    //     url: "https://res.cloudinary.com/dxshuzlz8/image/upload/v1701164452/x2eb7beep3gus0c2gtpt.png"
    // }
    // https://res.cloudinary.com/dxshuzlz8/image/upload/v1701164452/x2eb7beep3gus0c2gtpt.png
    // https://demo.twilio.com/owl.png
    // const message = twiml.message();


    // if (oAssistantResponce.url) {
    //   message.media(oAssistantResponce.url);
    // } else {
    //   message.body(oAssistantResponce.sAssistantMessage);
    // }

    let aMediaURl = oAssistantResponce.url ? [oAssistantResponce.url] : [];
    let oMessageResponce = await sendWhatsappMessage(aMediaURl, oAssistantResponce.sAssistantMessage, 'whatsapp:+972547756209', oAssistantResponce.sThread); // the separatly message will send because of timeout


    console.log(oAssistantResponce);
    // return { "twimlResponce": twiml.toString(), "sThread": oAssistantResponce.sThread };


    return { "twimlResponce": twiml.toString(), "sThread": oAssistantResponce.sThread };


    // if (currentStage === stages.length) {
    //   const collectedInfo = `Collected Information:\nFirst Name: ${userData.firstName}\nLast Name: ${userData.lastName}\nEmail: ${userData.email}`;
    //   currentStage = 0;
    //   userData = {};
    //   // res.send(collectedInfo);

    //   // twiml.message(collectedInfo);
    //   const messageOptions = {
    //     media: 'https://demo.twilio.com/owl.png',

    //   };
    //   const message = twiml.message();
    //   message.body('Store Location: 123 Easy St.');
    //   message.media('https://demo.twilio.com/owl.png');







    // res.end(twiml.toString());

    // const response = new MessagingResponse();
    // response.message('Store Location: 123 Easy St.');
    // res.end(twiml.toString());

}

module.exports = {
    webhook,
    sendWhatsappMessage
}
