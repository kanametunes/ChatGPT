const Alexa = require('ask-sdk-core');
const axios = require("axios");
const OPENAI_API_KEY = 'sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function askToGPT(prompt) {
  try{    
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model:"gpt-3.5-turbo",
          messages:[{
            "role":"user",
            "content":prompt
          }]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
        }
        );
      return response.data.choices[0].message.content;
    }catch(err){
        return "なんかエラーになったよ。"+ err;  
  }
    
}

function formatString(text) {
  return text.replace(/\n+/g, " ");
}

//gpt-3.5-turboへ会話を投げるインテント(toChatgpt)が来たらこのコードが実行される
const AskChatgptIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "toChatgpt"
    );
  },
  async handle(handlerInput) {
    const question = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "question"
    );

    const responseFromGPT = await askToGPT(question);
    const formattedResponse = formatString(responseFromGPT);

    return handlerInput.responseBuilder
        .speak(formattedResponse)
        .reprompt(formattedResponse)
        .getResponse();
    },
};

//スキルが発動したらこのコードが実行される
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'こんにちは！「教えて」と言ってから話かけてくれると、ChatGPTと話せるよ';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

//キャンセルとストップするインテントが来たら、このコードが実行される
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

//エラーの場合（インテントが存在しないなど）このコードが実行される
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = '最初に「教えて」と言ってから話しかけて！';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        AskChatgptIntentHandler,
        LaunchRequestHandler,
        CancelAndStopIntentHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
