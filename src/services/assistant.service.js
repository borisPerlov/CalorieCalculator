

const OpenAI = require('openai');
const sharp = require('sharp');

const { upload } = require('./files.service');

const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"], // defaults to process.env["OPENAI_API_KEY"]
});


async function createAssistant() {

    // Step 1: Create an Assistant
    const assistant = await openai.beta.assistants.create({
        name: "Diet Consultant",
        instructions: "This assistant serves as a diet consultant. It assists users in managing their diet and nutritional intake by extracting calorie information from images and text, updating and retrieving data from Excel spreadsheets, and providing personalized dietary advice. It should respond with accurate and helpful nutritional information, tailored to the user's needs, while maintaining a supportive and encouraging tone. The assisntant will prioritize user health and wellness, offering practical tips and suggestions for balanced eating habits.",
        tools: [{
            "type": "function",
            "function": {
                "name": "calculateCaloriesFromImage",
                "description": "get the image and calculate calories",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": { "type": "string", "description": "base64" },
                    },
                    "required": ["query"]
                }
            }
        }],
        model: "gpt-4o",

    });

    return assistant


}

async function retrieveAssistant(sAssistant) {

    const myAssistant = await openai.beta.assistants.retrieve(
        sAssistant
    );

    return myAssistant
}


async function waitForRunComplete(sThreadId, sRunId) {
    while (true) {
        // Call some asynchronous function that may return the special value
        const oRun = await openai.beta.threads.runs.retrieve(
            sThreadId,
            sRunId
        );


        if (oRun.status && (oRun.status === "completed" || oRun.status === "failed" || oRun.status === "requires_action")) {
            // Special value found, break out of the loop
            break;
        }

        // If the special value is not found, you can add a delay before checking again
        // This prevents the function from running too frequently and consuming resources
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay (adjust as needed)
    }

}

function extractImageUrl(inputString) {
    // Regular expression to match URLs in the input string

    const resultString = inputString.replace(/[()]/g, '');
    const urlRegex = /https:\/\/[^\s]+/g;

    // Use the match method to find the first URL in the input string
    const match = resultString.match(urlRegex);



    if (match) {
        // If a URL is found, return it
        return match[0];
    } else {
        // If no URL is found, return an error message or handle it as needed
        return false;
    }
}



async function runAssistant(sAssistant, sThread, sMessage) {

    //check if the new conversation
    if (!sThread) {
        let oThread = await openai.beta.threads.create();
        sThread = oThread.id;

    }

    //add message to thread
    await openai.beta.threads.messages.create(
        sThread,
        { role: "user", content: sMessage }
    );

    //run
    let run = await openai.beta.threads.runs.create(
        sThread,
        { assistant_id: sAssistant }
    );

    //wait run to complete
    await waitForRunComplete(sThread, run.id)

    //get run object
    run = await openai.beta.threads.runs.retrieve(
        sThread,
        run.id
    );

    let url = "";
    if (run.status === "requires_action") {


        let oSubmit = await submitToolOutput(sThread, run.id, run.required_action.submit_tool_outputs.tool_calls);

        url = oSubmit.url;
        await waitForRunComplete(sThread, run.id)

    }

    const threadMessages = await openai.beta.threads.messages.list(
        sThread
    );


    //prepare message
    // console.log(threadMessages)

    if (url) {
        return {
            sAssistantMessage: "",
            url: url,
            sThread: sThread
        }

    } else {
        let sAssistantMessage = threadMessages.body.data[0].content[0].text.value;
        return {
            sAssistantMessage: sAssistantMessage,
            url: "",
            sThread: sThread
        }
    }

    // debugger;
    // if (url) {
    //     return {
    //         sAssistantMessage: "",
    //         url: url,
    //         sThread: sThread
    //     }

    // } else {


    //     return {
    //         sAssistantMessage: sAssistantMessage,
    //         url: "",
    //         sThread: sThread
    //     };
    // }
}

async function submitToolOutput(sThreadId, sRunId, aToolToCall) {

    let aToolOutput = [];
    let url = "";
    for (let i = 0; i < aToolToCall.length; i++) {
        if (aToolToCall[i].function.name === "calculateCaloriesFromImage") {
            debugger;
            let instructions = "1.calculate the calories 2. in the output prompt return only number of calculated calories"
            let args = instructions + JSON.parse(aToolToCall[i].function.arguments);


            console.log("this arguments sent to image generation api " + "\n" + aToolToCall[i].function.arguments);

            const oImage = await openai.images.generate({ model: "dall-e-3", prompt: args.query, n: 1, response_format: "b64_json" });

            let base64EncodedJSON = oImage.data[0].b64_json;
            // Decode the base64-encoded JSON to a regular JSON string
            const jsonString = atob(base64EncodedJSON);

            // Encode the regular JSON string to base64
            const base64Encoded = btoa(jsonString);

            let buf = Buffer.from(base64Encoded, 'base64');

            let semiTransparentRedPng = await sharp(buf)
                .png()
                .toBuffer();

            let base64String = semiTransparentRedPng.toString('base64');



            const uri = `data:image/jpeg;base64,${base64String}`;

            let oUpload = await upload(uri);


            url = oUpload.url

            aToolOutput.push({
                "tool_call_id": aToolToCall[i].id,
                "output": url
            })

            // await openai.beta.threads.messages.create(
            //     sThreadId,
            //     { role: "user", content: "https://res.cloudinary.com/dk18zxmsr/image/upload/v1700409406/cld-sample-5.jpg" }
            // );


        }


    }


    await openai.beta.threads.runs.submitToolOutputs(
        sThreadId,
        sRunId,
        {
            tool_outputs: aToolOutput
        }
    );

    return { "url": url }

}


module.exports = {
    createAssistant,
    retrieveAssistant,
    runAssistant
}
