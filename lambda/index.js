/* *
 * This file contains the handlers for all skill Intents
 * */
const Alexa = require('ask-sdk-core');
const reinhart = require('reinhart-api.js');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.log("we made it into the LaunchRequest");
        const speakOutput = 'Welcome to Reinhart Foodservice. What would you like to do?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

//---===============================================================---------Make Order---------===================================------------------

/**
 * User starts an order without giving any slot information
 * Ex: "Start order"
 * */
const Start_MakeOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "MakeOrderIntent"
      && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addElicitSlotDirective('spokenProductName')
      .speak("What would you like to order?")
      .reprompt('What would you like to order?')
      .getResponse();
  }
};

/**
 * User has provided a product they would like to order and
 * we need check our database for the most closely related item.
 * We then need to ask if the item we have retrieved from our database
 * matches the product they are looking to order.
 * */
const ProductGiven_MakeOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "MakeOrderIntent"
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === "NONE"
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const spokenProductName = slots.spokenProductName.value;
    const quantity = slots.quantity.value;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    const resolvedProduct = await reinhart.getProductFromCatalogue(spokenProductName);
    console.log("resolvedProduct: " + resolvedProduct);
    
    if (resolvedProduct === null) {
        
        return handlerInput.responseBuilder
          .addElicitSlotDirective('spokenProductName',
                {
                    name: 'MakeOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: "spokenProductName",
                            value: undefined,
                            confirmationStatus: "NONE"
                        },
                        quantity: {
                            name: "quantity",
                            value: quantity
                        }
                    }
                })
          .speak("I'm sorry, I was not able to find any product matching " + spokenProductName + ". Please state a new product or try being more specific.")
          .reprompt("Try to be as specific as possible. What would you like to order?")
          .getResponse();
    }

    sessionAttributes.resolvedProduct = resolvedProduct;
    
    return handlerInput.responseBuilder
      .addConfirmSlotDirective('spokenProductName')
      .speak("I was able to find " + sessionAttributes.resolvedProduct.resolvedProductName + ". Is this what you would like to order?")
      .reprompt("I was able to find " + sessionAttributes.resolvedProduct.resolvedProductName + ". Is this what you would like to order?")
      .getResponse();
  }
};

/**
 * User has provided a product they would like to order and confirmed whether
 * or not the product we retrieved from our database is the one they want to order.
 * We will check whether or not they confirmed or denied the product from the database here.
 * */
const ProductConfirmation_MakeOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "MakeOrderIntent"
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
      && !handlerInput.requestEnvelope.request.intent.slots.quantity.value
  },
  handle(handlerInput) {
    const intent = handlerInput.requestEnvelope.request.intent;
    const spokenProductName = intent.slots.spokenProductName.value;
    const quantity = intent.slots.quantity.value;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    console.log("spoken product name confirmation status: " + spokenProductName.confirmationStatus);
    if (intent.slots.spokenProductName.confirmationStatus === "DENIED") {
        return handlerInput.responseBuilder
          .speak("Okay, what would you like to order?")
          .reprompt("Try to be as specific as possible. What would you like to order?")
          .addElicitSlotDirective('spokenProductName',
                {
                    name: 'MakeOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: "spokenProductName",
                            value: undefined,
                            confirmationStatus: "NONE"
                        },
                        quantity: {
                            name: "quantity",
                            value: quantity,
                            confirmationStatus: "NONE"
                        }
                    }
                })
          .getResponse();
    }

    if (intent.slots.spokenProductName.confirmationStatus === "CONFIRMED") {
        
        return handlerInput.responseBuilder
          .speak("How many cases of " + sessionAttributes.resolvedProduct.resolvedProductName + " would you like to order?")
          .reprompt("How many cases of " + sessionAttributes.resolvedProduct.resolvedProductName + " would you like to order?")
          .addElicitSlotDirective('quantity',
                {
                    name: 'MakeOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: "spokenProductName",
                            value: intent.slots.spokenProductName.value,
                            confirmationStatus: "CONFIRMED"
                        },
                        quantity: {
                            name: "quantity",
                            value: quantity
                        }
                    }
                })
          .getResponse();
    }
  }
};

/**
 * User has confirmed the product they want to order and provided the quantity 
 * they would like to order. We will save their item to their order here and ask if they would
 * like to order more
 * */
const ProductQuantityGiven_MakeOrderIntentHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "MakeOrderIntent"
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
      && handlerInput.requestEnvelope.request.intent.slots.quantity.value
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === "CONFIRMED";
  },
  async handle(handlerInput) {
        var customerID = 1;
    const intent = handlerInput.requestEnvelope.request.intent;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const productToAdd = sessionAttributes.resolvedProduct;
    const quantity = intent.slots.quantity.value;
    const spokenProductName = intent.slots.spokenProductName.value;
    
    if (isNaN(quantity) || !Number.isInteger(parseInt(quantity)) || quantity < 0 || quantity > 100) {
        return handlerInput.responseBuilder
          .speak(quantity + " is not a valid quantity. Please provide a new quantity between 0 and 100 cases")
          .reprompt("How many cases of " + sessionAttributes.resolvedProduct.resolvedProductName + " would you like to order?")
          .addElicitSlotDirective("quantity", 
                {
                    name: 'MakeOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: "spokenProductName",
                            value: spokenProductName,
                            confirmationStatus: "CONFIRMED"
                        },
                        quantity: {
                            name: "quantity",
                            value: undefined
                        }
                    }
                })
          .getResponse();
    }
    
    // check if there is a pending order
    let orderInfo = await reinhart.getPendingOrderInfo(customerID); // hard coded customerID

    if (orderInfo === null) {
        // there is no pending order so we are going to start one
        orderInfo = await reinhart.startOrder(customerID); // hard coded customerID
        console.log("new order number: " + orderInfo.orderNumber);
        if (orderInfo === null) {
            // start order function ran into an error
            return handlerInput.responseBuilder
              .speak("I'm sorry, something went wrong when I tried creating an order for you. " + 
                        "Please try going online to complete your order, or contact customer service for assistance.")
              .getResponse();
        }
    }
    
    const addToOrderResult = await reinhart.addToOrder(orderInfo.orderNumber, productToAdd.resolvedProductID, quantity, productToAdd.resolvedProductName);
    if (!addToOrderResult) {
        // add to order function ran into an error
        return handlerInput.responseBuilder
          .speak("Im sorry, something went wrong when I tried adding to your shopping cart. " + 
                        "Please try going online to complete your order, or contact customer service for assistance.")
          .getResponse();
    }
    
    sessionAttributes.yesNoKey = "orderMore";
    return handlerInput.responseBuilder
      .speak("Okay, I have added " + intent.slots.quantity.value + " cases of " + sessionAttributes.resolvedProduct.resolvedProductName + " to your order. Would you like to order anything else?")
      .reprompt("Would you like to order anything else?")
      .getResponse();
  }
};

//====================================================================================================================================================
//---===============================================================---------submit order---------===================================-------------------
//====================================================================================================================================================

/**
 * User asks to submit their pending order (the items in their shopping cart)
 * */
const Start_SubmitOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "SubmitOrderIntent"
      && handlerInput.requestEnvelope.request.intent.confirmationStatus === "NONE";
  },
  async handle(handlerInput) {
    var customerID = 1;
    const pendingOrderInfo = await reinhart.getPendingOrderInfo(customerID); // hardcoded customerID
    if (pendingOrderInfo === null) {
        // there is no pending order and therefore no items in the customer's cart
        return handlerInput.responseBuilder
          .speak("You do not currently have any items in your shopping cart. Please start a new order before attempting to submit.")
          .reprompt("What would you like to do?")
          .getResponse();
    }
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const deliveryDate = parseDate(await reinhart.getNextDeliveryDate(customerID));
    console.log(deliveryDate);
    const orderContents = await reinhart.getOrderContents(pendingOrderInfo.orderNumber);
    let speechOutput = "";
    const numberOfItems = orderContents.length;
    
    if (numberOfItems === 1) {
        speechOutput += "You have " + numberOfItems + " item in your cart that can be delivered on " + deliveryDate + 
                            ". Would you like to hear the contents of this order before submitting?";
    } else {
        speechOutput += "You have " + numberOfItems + " items in your cart that can be delivered on " + deliveryDate + 
                            ". Would you like to hear the contents of this order before submitting?";
    }
    
    sessionAttributes.yesNoKey = "listOrderContents";
    sessionAttributes.pendingOrderNumber = pendingOrderInfo.orderNumber;
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt("Would you like to hear the contents of your order before submitting?")
      .getResponse();
  }
};

const Complete_SubmitOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
          && handlerInput.requestEnvelope.request.intent.name === "SubmitOrderIntent"
          && handlerInput.requestEnvelope.request.intent.confirmationStatus !== "NONE";
    },
    async handle(handlerInput) {
        var customerID = 1;
        const intent = handlerInput.requestEnvelope.request.intent;
        const pendingOrderInfo = await reinhart.getPendingOrderInfo(customerID); // hardcoded customerID
        console.log("order info to submit: " + JSON.stringify(pendingOrderInfo));
        
        if (intent.confirmationStatus === "CONFIRMED") {
            const submitOrderResult = await reinhart.submitOrder(pendingOrderInfo.orderNumber, customerID); // hardcoded customerID
            if (submitOrderResult === null) {
                return handlerInput.responseBuilder
                  .speak("I'm sorry, something went wrong when I tried submitting your order. " + 
                        "Please try going online to complete your order, or contact customer service for assistance.")
                  .getResponse();
            }
            const deliveryDate = parseDate(submitOrderResult);
            return handlerInput.responseBuilder
              .speak("Okay, I have submitted your order. Your items should arrive with your next delivery on " + deliveryDate + 
                        ". What else can I help you with today?")
              .reprompt("What else can I help you with today? Say exit or cancel to close the Reinhart Foodservice app.")
              .getResponse();
              
        }
        
        // this does not work
        // TODO
        return handlerInput.responseBuilder
          .speak("Okay, I did not submit your order. What would you like to do?")
          .reprompt("What would you like to do?")
          .getResponse();
    }
}

//====================================================================================================================================================
//---===============================================================---------yes no intent---------===================================-------------------
//====================================================================================================================================================

const YesNoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
         && handlerInput.requestEnvelope.request.intent.name === "YesNoIntent"
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const key = sessionAttributes.yesNoKey;
        console.log("key: " + key);
        const answer = resolveEntity(slots, "answer");
        
        if (key === "orderMore") {
            if (answer === "yes") {
                // user would like to add more to their order
                sessionAttributes.yesNoKey = undefined; // must always switch back to undefined unless you are asking another ambiguous yes no question
                return handlerInput.responseBuilder
                  .speak("What would you like to order?")
                  .reprompt("What would you like to order")
                  .addElicitSlotDirective('spokenProductName',
                        {
                            name: 'MakeOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                spokenProductName: {
                                    name: "spokenProductName",
                                    value: undefined,
                                    confirmationStatus: "NONE"
                                },
                                quantity: {
                                    name: "quantity",
                                    value: undefined,
                                    confirmationStatus: "NONE"
                                }
                            }
                        })
                  .getResponse();                
            }
            else if (answer === "no") {
                // prompt user if they would like to route to submit order intent
                sessionAttributes.yesNoKey = "submitOrder";
                return handlerInput.responseBuilder
                  .speak("Would you like to submit this order?")
                  .reprompt("Would you like to submit this order?")
                  .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.yesNoKey = undefined;
                return handlerInput.responseBuilder
                  .speak("I'm sorry, something went wrong.")
                  .getResponse();
            }
        }
        else if (key === "submitOrder") {
            if (answer === "yes") {
                // user would like to submit their order
                sessionAttributes.yesNoKey = undefined; // must always switch back to undefined unless you are asking another ambiguous yes no question
                return handlerInput.responseBuilder
                  .addDelegateDirective(
                        {
                            name: 'SubmitOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })
                  .getResponse();
                
                // will route the user to the submit order intent
                // TODO
                //implemented but need to test
                               
            }
            else if (answer === "no") {
                // prompt user if they would like to route to submit order intent
                sessionAttributes.yesNoKey = "submitOrder";
                return handlerInput.responseBuilder
                  .speak("What would you like to do?")
                  .reprompt("What would you like to do?")
                  .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.yesNoKey = undefined;
                return handlerInput.responseBuilder
                  .speak("I'm sorry, something went wrong.")
                  .getResponse();
            }
        }
        else if (key === "listOrderContents") {
            if (answer === "yes") {
                sessionAttributes.yesNoKey = undefined; // must always switch back to undefined unless you are asking another ambiguous yes no question 
                let orderContents = await reinhart.getOrderContents(sessionAttributes.pendingOrderNumber);
                let string_contentList = stringifyItemList(orderContents);
                
                return handlerInput.responseBuilder
                  .speak("you currently have " + string_contentList + " in your cart. Are you sure you would like to submit?")
                  .reprompt("Are you sure you would like to submit?")
                  .addConfirmIntentDirective("SubmitOrderIntent")
                  .getResponse();
                  // TODO decide how to handle this yes/no scenario
                  // implemented but must test
                  
                  
                  
            }
            else if (answer === "no") {
                sessionAttributes.yesNoKey = undefined; // must always switch back to undefined unless you are asking another ambiguous yes no question 
                return handlerInput.responseBuilder
                  .addDelegateDirective(
                        {
                            name: 'SubmitOrderIntent',
                            confirmationStatus: 'CONFIRMED',
                            slots: {}
                        })
                  .getResponse();

            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.yesNoKey = undefined;
                return handlerInput.responseBuilder
                  .speak("I'm sorry, something went wrong.")
                  .getResponse();
            }
        }
        else if (key === "template") {
            if (answer === "yes") {
                sessionAttributes.yesNoKey = undefined; // must always switch back to undefined unless you are asking another ambiguous yes no question 
            }
            else if (answer === "no") {
                sessionAttributes.yesNoKey = undefined; // must always switch back to undefined unless you are asking another ambiguous yes no question 

            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.yesNoKey = undefined;
                return handlerInput.responseBuilder
                  .speak("I'm sorry, something went wrong.")
                  .getResponse();
            }
        }
        else {
            // there was an error and we have an invalid yesNoKey
            sessionAttributes.yesNoKey = undefined;
                return handlerInput.responseBuilder
                  .speak("I'm sorry, something went wrong.")
                  .getResponse();
        }

    }
}

//====================================================================================================================================================
//---===============================================================---------Edit Order---------===================================-------------------
//====================================================================================================================================================
const ProductNotGiven_EditOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "EditOrderIntent"
      && !handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
      && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  async handle(handlerInput) {
    var customerID = 1;
    var pendingOrder = await reinhart.getPendingOrderInfo(customerID);
    console.log("pending order is " + pendingOrder);
    if(pendingOrder === null){
        return handlerInput.responseBuilder
         .speak("You do not have any items in your shopping cart to edit. What else can I help you with today?")
         .reprompt("What else can I help you with today?")
         .getResponse();
  
    }
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
    sessionAttributes.orderNumber = pendingOrder.orderNumber
    
    return handlerInput.responseBuilder
      .addElicitSlotDirective('spokenProductName')
      .speak("Which item in your cart do you want to edit?")
      .reprompt('If you would like to me list the items in your shopping cart, say view my shopping cart, otherwise state the name of the product you wish to edit.')
      .getResponse();
  }
};


const ProductGiven_EditOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "EditOrderIntent"
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === "NONE"
  },
  async handle(handlerInput) {
    var customerID = 1; 
     
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const spokenProductName = slots.spokenProductName.value;
    const newQuantity = slots.NewQuantity.value;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    var resolvedProduct =  await reinhart.getProductFromCatalogue(spokenProductName);
    if(resolvedProduct !== null){
        var productInCart = await reinhart.getOrderItemFromOrder(sessionAttributes.orderNumber,resolvedProduct.resolvedProductID);
        console.log("resolvedProduct(edit): " + resolvedProduct);
    }
    
    if (resolvedProduct === null || productInCart === null) {
        
        return handlerInput.responseBuilder
          .addElicitSlotDirective('spokenProductName',
                {
                    name: 'EditOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: "spokenProductName",
                            value: undefined,
                            confirmationStatus: "NONE"
                        },
                        NewQuantity: {
                            name: "NewQuantity",
                            value: newQuantity
                        }
                    }
                })
          .speak("I'm sorry, I was not able to find a product matching " + spokenProductName + " in your shopping cart. Please state a new product or try being more specific.")
          .reprompt("Try to be as specific as possible. Which item in your cart do you want to edit?")
          .getResponse();
    }
    
    sessionAttributes.resolvedProduct = resolvedProduct;
    
    let speechOutput = "";
    if(productInCart.quantity > 1) {
        speechOutput += "I was able to find " + productInCart.quantity + " cases of " + productInCart.productName + " in your cart. Is this the item you wish to edit?";
    } else {
        speechOutput += "I was able to find " + productInCart.quantity + " case of " + productInCart.productName + " in your cart. Is this the item you wish to edit?";
    }
    
    return handlerInput.responseBuilder
      .addConfirmSlotDirective('spokenProductName')
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  }
};


const ProductConfirmation_EditOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "EditOrderIntent"
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
      && !handlerInput.requestEnvelope.request.intent.slots.NewQuantity.value
  },
  handle(handlerInput) {
    const intent = handlerInput.requestEnvelope.request.intent;
    const spokenProductName = intent.slots.spokenProductName.value;
    const newQuantity = intent.slots.NewQuantity.value;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    console.log("spoken product name confirmation status(edit): " + spokenProductName.confirmationStatus);
    if (intent.slots.spokenProductName.confirmationStatus === "DENIED") {
        return handlerInput.responseBuilder
          .speak("Okay, which item in your cart would you like to edit then?")
          .reprompt("Try to be as specific as possible. Which item in your cart would you like to edit?")
          .addElicitSlotDirective('spokenProductName',
                {
                    name: 'EditOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: "spokenProductName",
                            value: undefined,
                            confirmationStatus: "NONE"
                        },
                        NewQuantity: {
                            name: "NewQuantity",
                            value: newQuantity,
                            confirmationStatus: "NONE"
                        }
                    }
                })
          .getResponse();
    } 
    if (intent.slots.spokenProductName.confirmationStatus === "CONFIRMED") {
        
        return handlerInput.responseBuilder
          .speak("Please state a new quantity for " + sessionAttributes.resolvedProduct.resolvedProductName + " or say zero to remove to remove the item from your cart.")
          .reprompt("Please state a number for the new quantity for " + sessionAttributes.resolvedProduct.resolvedProductName + " or say zero to remove the item from your cart.")
          .addElicitSlotDirective('NewQuantity',
                {
                    name: 'EditOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: "spokenProductName",
                            value: intent.slots.spokenProductName.value,
                            confirmationStatus: "CONFIRMED"
                        },
                        NewQuantity: {
                            name: "NewQuantity",
                            value: newQuantity
                        }
                    }
                })
          .getResponse();
    }
  }
};


const ProductQuantityGiven_EditOrderIntentHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "EditOrderIntent"
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
      && handlerInput.requestEnvelope.request.intent.slots.NewQuantity.value
      && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === "CONFIRMED";
  },
  async handle(handlerInput) {
      console.log("here");
    const intent = handlerInput.requestEnvelope.request.intent;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    if(intent.slots.NewQuantity.value != 0){
        console.log("error here " + intent.slots.NewQuantity.value)
        await reinhart.updateQuantity(sessionAttributes.orderNumber, sessionAttributes.resolvedProduct.resolvedProductID, intent.slots.NewQuantity.value);
        
        let speechOutput = "";
        if(intent.slots.NewQuantity.value > 1) {
            speechOutput += "Okay, your cart now contains " + intent.slots.NewQuantity.value + " cases of " + sessionAttributes.resolvedProduct.resolvedProductName + ". What else can I help you with today?"
        } else {
            speechOutput += "Okay, your cart now contains " + intent.slots.NewQuantity.value + " case of " + sessionAttributes.resolvedProduct.resolvedProductName + ". What else can I help you with today?"
        }
        
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .reprompt("What else can I help you with today?")
          .getResponse();
     
    }else{
        //possible slot validation?
        await reinhart.removeProduct(sessionAttributes.orderNumber, sessionAttributes.resolvedProduct.resolvedProductID); 
        return handlerInput.responseBuilder
          .speak("Okay, I removed " + sessionAttributes.resolvedProduct.resolvedProductName + " from your cart. What else can I help you with today?")
          .reprompt("What else can I help you with today?")
          .getResponse();
    }
  }
    
};



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//---===============================================================---------Small Functions---------===================================-------------------
//=====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


const ViewNextDeliveryContentsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewNextDeliveryContents';
    },
    async handle(handlerInput) {
        console.log("in viewNextDelivery");
        var customerID = 1;

        var allItems = await reinhart.getNextDeliveryContents(customerID);
        //optional conditions to ask if user wants to hear the whole list  
        var  speakOutput;
        if(allItems === null){

           speakOutput = 'I did not find any items in your next delivery. What else can I help you with today?';
        }else{

           speakOutput = 'In your next delivery you have ' + stringifyItemList(allItems) + ". What else can I help you with today?";
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ViewPendingOrderContentsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewPendingOrderContents';
    },
    async handle(handlerInput) {
        console.log("in view pending order");
        var customerID = 1;
        var pendingOrder = await reinhart.getPendingOrderInfo(customerID);

        //optional conditions to ask if user wants to hear the whole list  

        var speakOutput;

        if(pendingOrder === null){
            speakOutput = 'I was not able to find any items in your cart. Start an order to add to your shopping cart.';

        }else{

            var allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);

            if(allItems !== null){
                console.log("guessing 1");
                  speakOutput = 'In your shopping cart you have, ' + stringifyItemList(allItems) + ". What else can I help you with today?";
                  console.log("guessing 2");
            }else{
                  speakOutput = 'I was not able to find any items in your cart. Start an order to start adding to your shopping cart. What else can I help you with today?';
            }
         
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("What else can I help you with today?")
            .getResponse();
    }
};



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//---===============================================================---------Helpers---------===================================-------------------
//=====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


/**
 * Parses the ISO delivery date format into a more digestible format for the user
 * */
const parseDate = (deliveryDate) => {
    console.log("delivery date is: " + deliveryDate);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let trimmedDate = deliveryDate.slice(0, 10);
    console.log("trimmed date: " + trimmedDate);
    trimmedDate = trimmedDate.split("-");
    const year = parseInt(trimmedDate[0]);
    let month = parseInt(trimmedDate[1]);
    month = months[month - 1];
    let day = parseInt(trimmedDate[2]);
    console.log("Int day: " + day);
    
    if (day > 10 && day < 14) {
        day = day + "th";
    } else {
        let mod = day % 10;
        if (mod === 1) {
            day = day + "st";
        } else if (mod === 2) {
            day = day + "nd";
        } else if (mod === 3) {
            day = day + "rd";
        } else {
            day = day + "th";
        }
    }
    
    return month + " " + day + ", " + year;
}

const stringifyItemList = (orderItems) => {
    let stringList = "";
    console.log(orderItems);
    for (var i = 0; i < orderItems.length; i++) {
        console.log("happened once");
        const quantity = orderItems[i].quantity;
        const productName = orderItems[i].productName;
        if (i === 0) {
            stringList += "";
        } 
        else if (i === orderItems.length - 1) {
            if (orderItems.length === 2) {
                stringList += " and ";
            } else {
                stringList += ", and ";
            }
        } 
        else {
            stringList += ", ";
        }
        console
        if (quantity === 1) {
            stringList += quantity + " case of " + productName
        } else {
            stringList += quantity + " cases of " + productName
        }
    }
    return stringList;
}

const resolveEntity = function(resolvedEntity, slotName) {

    //This is built in functionality with SDK Using Alexa's ER
    let erAuthorityResolution = resolvedEntity[slotName].resolutions 
        .resolutionsPerAuthority[0];
    let value = null;
    
    if (erAuthorityResolution.status.code === 'ER_SUCCESS_MATCH') {
        value = erAuthorityResolution.values[0].value.name;
    }
    
    return value;
};




//====================================================================================================================================================
//---===============================================================---------defaults---------===================================-------------------
//====================================================================================================================================================

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say, start order or add order to add to your cart, say submit order to schedule your delivery for your next delivery date, and you can ask to view cart to see whats in your cart and you can ask what items are in my next delivery to see what items have been added to your next delivery ?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'What would you like to do?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.speak("Thank you for shopping with Reinhart. Please come again!").getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
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
        LaunchRequestHandler,
        
        ProductGiven_MakeOrderIntentHandler,
        ProductQuantityGiven_MakeOrderIntentHandler,
        ProductConfirmation_MakeOrderIntentHandler,
        Start_MakeOrderIntentHandler,
        
        Complete_SubmitOrderIntentHandler,
        Start_SubmitOrderIntentHandler,
        
        YesNoIntentHandler,

        ProductNotGiven_EditOrderIntentHandler,
        ProductGiven_EditOrderIntentHandler,
        ProductConfirmation_EditOrderIntentHandler,
        ProductQuantityGiven_EditOrderIntentHandler,
        
        ViewNextDeliveryContentsIntentHandler,
        ViewPendingOrderContentsIntentHandler,
        
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();