/* *
 * This file contains the handlers for all skill Intents
 *
 * TODO:
 *   Remove Item from cart Intent
 *   Remove all Items from cart Intent
 * */
const Alexa = require('ask-sdk-core');
const reinhart = require('reinhart-api.js');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const speakOutput = 'Welcome to Reinhart Foodservice. What would you like to do?';
        sessionAttributes.intentState = 0;
        sessionAttributes.customerID = 14445; // hardcoded customerID
                
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
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.intentState = 1;
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
        console.log("entered product given handler");
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const spokenProductName = slots.spokenProductName.value;
        const quantity = slots.quantity.value;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.intentState = 1;
        sessionAttributes.spokenProductName = spokenProductName;
        sessionAttributes.keywordMatch = false;

        const keywordProduct = await reinhart.getProductByKeyword(spokenProductName, sessionAttributes.customerID);
        if (keywordProduct !== null) {
            // found a keyword so we're going to grab that product and immediately move on w/o confirmation
            console.log("keyword result found");
            sessionAttributes.productToAdd = keywordProduct;
            sessionAttributes.keywordMatch = true;
            return handlerInput.responseBuilder
              .addDelegateDirective(
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
                                value: quantity
                            }
                        }
                    }
                )
                .getResponse();
        }

        // did not find a keyword match
        const resolvedProducts = await reinhart.getProductFromOrderGuide(spokenProductName, sessionAttributes.customerID);
        console.log("resolved products: " + JSON.stringify(resolvedProducts));

        if (resolvedProducts === null) {
            sessionAttributes.yesNoKey = "relatedCatalogue";
            return handlerInput.responseBuilder
                .speak("I'm sorry, I was not able to find any product matching " + spokenProductName + " in your order guide. Would you like to me to search the catalogue?")
                .reprompt("I'm sorry, I was not able to find any product matching " + spokenProductName + " in your order guide. Would you like to me to search the catalogue?")
                .getResponse();
        }

        sessionAttributes.resolvedProducts = resolvedProducts;
        sessionAttributes.productDenies = 0;
        sessionAttributes.productIndex = 0;
        sessionAttributes.orderGuideExhausted = false;

        return handlerInput.responseBuilder
            .addConfirmSlotDirective('spokenProductName')
            .speak("I was able to find " + stringifyProduct(resolvedProducts[sessionAttributes.productIndex]) + " in your order guide. Is this what you would like to order?")
            .reprompt("I was able to find " + stringifyProduct(resolvedProducts[sessionAttributes.productIndex]) + " in your order guide. Is this what you would like to order?")
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
            && (handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === "DENIED" || !handlerInput.requestEnvelope.request.intent.slots.quantity.value);
    },
    async handle(handlerInput) {
        console.log("entered product confirmation handler");
        const intent = handlerInput.requestEnvelope.request.intent;
        const spokenProductName = intent.slots.spokenProductName.value;
        const quantity = intent.slots.quantity.value;
        const productConfirmation = intent.slots.spokenProductName.confirmationStatus;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.intentState = 1;
        let resolvedProducts = sessionAttributes.resolvedProducts;
        sessionAttributes.productConfirmation = productConfirmation;
        sessionAttributes.spokenProductName = spokenProductName;
        sessionAttributes.quantity = quantity;

        if (productConfirmation === "DENIED") {
            console.log("product was denied");
            intent.slots.spokenProductName.confirmationStatus = "NONE";
            sessionAttributes.productDenies++;
            sessionAttributes.productIndex++;

            // if (resolvedProducts === null) {
            //     // user has reached the end of our related products list from the order guide so we need to ask if we should search the catalogue
            //     sessionAttributes.orderGuideExhausted = true;
            //     sessionAttributes.yesNoKey = "relatedCatalogue";
            //     return handlerInput.responseBuilder
            //         .speak("I was not able to find any more items related to " + spokenProductName + " in your order guide. Would you like me to try searching the catalogue?")
            //         .reprompt("I was not able to find any more items related to " + spokenProductName + " in your order guide. Would you like me to try searching the catalogue?")
            //         .getResponse();
            // }

            if (sessionAttributes.productDenies === 1 && sessionAttributes.orderGuideExhausted !== true) {
                // user has denied the first product so we are going to ask them if they want to hear more related items
                const itemsLeft = sessionAttributes.resolvedProducts.length - sessionAttributes.productIndex;
                sessionAttributes.yesNoKey = "relatedOrderGuide";
                let speakOutput = "";
                if (sessionAttributes.orderGuideExhausted === true) {
                    if (itemsLeft === 1) {
                        speakOutput += "I was able to find " + itemsLeft + " other item related to " + spokenProductName + " in the catalogue. Would you like to hear it?";
                    } else {
                        speakOutput += "I was able to find " + itemsLeft + " other items related to " + spokenProductName + " in the catalogue. Would you like me to go through them?";
                    }
                    
                } else {
                    if (itemsLeft === 1) {
                        speakOutput += "I was able to find " + itemsLeft + " other item related to " + spokenProductName + " in your order guide. Would you like to hear it?";
                    } else {
                        speakOutput += "I was able to find " + itemsLeft + " other items related to " + spokenProductName + " in your order guide. Would you like me to go through them?";
                    }
                }

                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }

            if (sessionAttributes.productIndex >= resolvedProducts.length) {
                if (sessionAttributes.orderGuideExhausted === true) {
                    // user has reached the end of our related products list from the catalogue so we need them to just say a more specific product.
                    sessionAttributes.orderGuideExhausted = false;
                    return handlerInput.responseBuilder
                        .speak("I was not able to find any more items related to " + spokenProductName + " in the catalogue. Please state a new product name for me to search.")
                        .reprompt("I was not able to find any more items related to " + spokenProductName + " in the catalogue. Please state a new product name for me to search.")
                        .addElicitSlotDirective('spokenProductName', {
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
                        .getResponse();

                } else {
                    // user has reached the end of our related products list from the order guide so we need to ask if we should search the catalogue
                    sessionAttributes.orderGuideExhausted = true;
                    sessionAttributes.yesNoKey = "relatedCatalogue";
                    return handlerInput.responseBuilder
                        .speak("I was not able to find any more items related to " + spokenProductName + " in your order guide. Would you like me to try searching the catalogue?")
                        .reprompt("I was not able to find any more items related to " + spokenProductName + " in your order guide. Would you like me to try searching the catalogue?")
                        .getResponse();
                }

            }
            // read off the next closest related product to the user
            return handlerInput.responseBuilder
                .speak("Okay, how about " + stringifyProduct(resolvedProducts[sessionAttributes.productIndex]) + "?")
                .reprompt("Okay, how about " + stringifyProduct(resolvedProducts[sessionAttributes.productIndex]) + "?")
                .addConfirmSlotDirective('spokenProductName')
                .getResponse();

        }

        sessionAttributes.productToAdd = resolvedProducts[sessionAttributes.productIndex];
        // product confirmation was confirmed
        return handlerInput.responseBuilder
            .speak("How many cases would you like to order?")
            .reprompt("How many cases would you like to order?")
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
        const intent = handlerInput.requestEnvelope.request.intent;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        console.log(sessionAttributes.productIndex);
        const productToAdd = sessionAttributes.productToAdd;
        const quantity = intent.slots.quantity.value;
        const spokenProductName = intent.slots.spokenProductName.value;
        sessionAttributes.intentState = 1;

        if (isNaN(quantity) || !Number.isInteger(parseInt(quantity)) || quantity < 1 || quantity > 100) {
            return handlerInput.responseBuilder
                .speak(quantity + " is not a valid quantity. Please provide a new quantity between 1 and 100 cases")
                .reprompt("How many cases of " + stringifyProduct(productToAdd) + " would you like to order?")
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
        let orderInfo = await reinhart.getPendingOrderInfo(sessionAttributes.customerID); // hard coded customerID

        if (orderInfo === null) {
            // there is no pending order so we are going to start one
            orderInfo = await reinhart.startOrder(sessionAttributes.customerID); // hard coded customerID
            if (orderInfo === null) {
                // start order function ran into an error
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong when I tried creating an order for you. " +
                        "Please try going online to complete your order, or contact customer service for assistance.")
                    .reprompt("What would you like to do?")
                    .getResponse();
            }
        }

        const addToOrderResult = await reinhart.addToOrder(orderInfo.orderNumber, productToAdd, quantity);
        if (!addToOrderResult) {
            // add to order function ran into an error
            return handlerInput.responseBuilder
                .speak("Im sorry, something went wrong when I tried adding to your shopping cart. " +
                    "Please try going online to complete your order, or contact customer service for assistance.")
                .reprompt("What would you like to do?")
                .getResponse();
        }

        sessionAttributes.spokenProductName = undefined;
        sessionAttributes.resolvedProducts = undefined;
        sessionAttributes.productIndex = undefined;
        sessionAttributes.productDenies = undefined;
        sessionAttributes.productConfirmation = undefined;

        sessionAttributes.yesNoKey = "orderMore";
        return handlerInput.responseBuilder
            .speak("Okay, I have added " + quantity + " cases of " + stringifyProduct(productToAdd) + " to your order. Would you like to order anything else?")
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
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrderInfo = await reinhart.getPendingOrderInfo(sessionAttributes.customerID); // hardcoded customerID
        sessionAttributes.intentState = 2;
        
        if (pendingOrderInfo === null) {
            // there is no pending order and therefore no items in the customer's cart
            return handlerInput.responseBuilder
                .speak("You do not currently have any items in your shopping cart. Please start a new order before attempting to submit.")
                .reprompt("What would you like to do?")
                .getResponse();
        }

        const deliveryDate = parseDate(await reinhart.getNextDeliveryDate(sessionAttributes.customerID));
        const orderContents = await reinhart.getOrderContents(pendingOrderInfo.orderNumber);
        const numberOfItems = orderContents.length;
        
        let speechOutput = "";
        if (numberOfItems === 1) {
            speechOutput += "You have " + numberOfItems + " item in your cart that can be delivered on " + deliveryDate +
                ". Would you like to hear the contents of this order before submitting?";
        } else {
            speechOutput += "You have " + numberOfItems + " items in your cart that can be delivered on " + deliveryDate +
                ". Would you like to hear the contents of this order before submitting?";
        }

        sessionAttributes.yesNoKey = "listSubmit";
        sessionAttributes.pendingOrderNumber = pendingOrderInfo.orderNumber;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt("Would you like to hear the contents of your order before submitting?")
            .getResponse();
    }
};

/**
 * User has confirmed they would like to submit their order
 * */
const Complete_SubmitOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "SubmitOrderIntent"
            && handlerInput.requestEnvelope.request.intent.confirmationStatus !== "NONE";
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const intent = handlerInput.requestEnvelope.request.intent;
        const pendingOrderInfo = await reinhart.getPendingOrderInfo(sessionAttributes.customerID); // hardcoded customerID
        sessionAttributes.intentState = 0;
        
        let speechOutput = "";
        if (intent.confirmationStatus === "CONFIRMED") {
            const submitOrderResult = await reinhart.submitOrder(pendingOrderInfo.orderNumber, sessionAttributes.customerID); // hardcoded customerID
            if (submitOrderResult === null) {
                speechOutput += "I'm sorry, something went wrong when I tried submitting your order. " +
                    "Please try going online to complete your order, or contact customer service for assistance.";

            } else {
                const deliveryDate = parseDate(submitOrderResult);
                speechOutput += "Okay, I have submitted your order. Your items should arrive with your next delivery on " + deliveryDate +
                    ". What else can I help you with today?";
            }

        }

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt("What would you like to do?")
            .getResponse();
    }
}



//====================================================================================================================================================
//---===============================================================---------Remove Item---------===================================-------------------
//====================================================================================================================================================


/**
 * User asks to remove an item from their order without stating an item in their cart to remove
 * */
const ProductNotGiven_RemoveItemIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "RemoveItemIntent"
            && !handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        sessionAttributes.intentState = 4;
        
        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to remove. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to remove. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        return handlerInput.responseBuilder
            .addElicitSlotDirective('spokenProductName')
            .speak("Which item in your cart do you want to remove?")
            .reprompt('If you would like to me list the items in your shopping cart, say view my shopping cart, otherwise state the name of the product you wish to remove.')
            .getResponse();
    }
};

/**
 * User has provided a product in their cart that they wish to remove
 * */
const ProductGiven_RemoveItemIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "RemoveItemIntent"
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === "NONE"
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const spokenProductName = slots.spokenProductName.value;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        sessionAttributes.intentState = 4;

        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to remove. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to remove. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        const productInCart = await reinhart.getOrderItemFromOrder(pendingOrder.orderNumber, spokenProductName, sessionAttributes.customerID);

        if (productInCart === null) {

            return handlerInput.responseBuilder
                .addElicitSlotDirective('spokenProductName',
                    {
                        name: 'RemoveItemIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: "spokenProductName",
                                value: undefined,
                                confirmationStatus: "NONE"
                            }
                        }
                    })
                .speak("I'm sorry, I was not able to find a product matching " + spokenProductName + " in your shopping cart. Please state a new product or try being more specific.")
                .reprompt("Try to be as specific as possible. Which item in your cart do you want to edit?")
                .getResponse();
        }

        sessionAttributes.productInCart = productInCart;
        sessionAttributes.orderNumber = pendingOrder.orderNumber;

        let speechOutput = "";
        if (productInCart.quantity > 1) {
            speechOutput += "I was able to find " + productInCart.quantity + " cases of " + stringifyProduct(productInCart) + " in your cart. Is this the item you wish to remove?";
        } else {
            speechOutput += "I was able to find " + productInCart.quantity + " case of " + stringifyProduct(productInCart) + " in your cart. Is this the item you wish to remove?";
        }

        return handlerInput.responseBuilder
            .addConfirmSlotDirective('spokenProductName')
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    }
};

/**
 * User has provided a product they would like to remove from their cart and confirmed whether
 * or not the product we retrieved from their cart is the one they would like to remove.
 * We will check whether or not they confirmed or denied the product here.
 * */
const ProductConfirmation_RemoveItemIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "RemoveItemIntent"
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus !== "NONE"
    },
    async handle(handlerInput) {
        const intent = handlerInput.requestEnvelope.request.intent;
        const spokenProductName = intent.slots.spokenProductName.value;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const productInCart = sessionAttributes.productInCart;
        const orderNumber = sessionAttributes.orderNumber;
        sessionAttributes.intentState = 4;

        if (intent.slots.spokenProductName.confirmationStatus === "DENIED") {
            return handlerInput.responseBuilder
                .speak("Okay, which item in your cart would you like to remove then?")
                .reprompt("Try to be as specific as possible. Which item in your cart would you like to remove?")
                .addElicitSlotDirective('spokenProductName',
                    {
                        name: 'EditOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: "spokenProductName",
                                value: undefined,
                                confirmationStatus: "NONE"
                            }
                        }
                    })
                .getResponse();
        }

        let speechOutput = "";
        const removeProductResult = await reinhart.removeProduct(orderNumber, productInCart.ProductNumber);
        if (removeProductResult) {
            speechOutput += "Okay, I removed " + stringifyProduct(productInCart) + " from your cart. What else can I help you with today?";
        } else {
            speechOutput += "I'm sorry, something went wrong when I tried removing the item from your cart. Please try going online to complete the removal process.";
        }
        sessionAttributes.intentState = 0;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();

    }
};


//====================================================================================================================================================
//---===============================================================---------Clear Order Contents---------===================================---------
//====================================================================================================================================================

/**
 * Customer wants to remove all items from their cart
 * */
const Start_ClearOrderContentsIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "ClearOrderContentsIntent"
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === "NONE";
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        sessionAttributes.intentState = 4;
        
        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to remove. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to remove. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        sessionAttributes.orderNumber = pendingOrder.orderNumber;
        const numberOfItems = allItems.length;

        let speechOutput = "";
        if (numberOfItems > 1) {
            speechOutput += "You have " + numberOfItems + " items in your cart. Are you sure you would like to remove them all?";
        } else {
            speechOutput += "You have " + numberOfItems + " item in your cart. Are you sure you would like to remove it?";
        }

        return handlerInput.responseBuilder
            .addConfirmIntentDirective("ClearOrderContentsIntent")
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    }
}

/**
 * customer has confirmed that they would like to remove all items from their cart
 **/
const Complete_ClearOrderContentsIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "ClearOrderContentsIntent"
            && handlerInput.requestEnvelope.request.intent.confirmationStatus !== "NONE";
    },
    async handle(handlerInput) {
        const intent = handlerInput.requestEnvelope.request.intent;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const orderNumber = sessionAttributes.orderNumber;
        sessionAttributes.intentState = 0;

        let speechOutput = "";
        if (intent.confirmationStatus === "DENIED") {
            speechOutput += "Okay, I did not clear your cart. What else can I help you with today?"
        } else {
            const clearOrderResult = await reinhart.clearOrderContents(orderNumber);
            if (clearOrderResult) {
                speechOutput += "Okay, I have removed all items from your cart. What else can I help you with today?"
            } else {
                speechOutput += "I'm sorry, something went wrong when I tried to clear your cart. Please try going online to complete this process."
            }
        }

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt("What else can I help you with today?")
            .getResponse();
    }
}



//====================================================================================================================================================
//---===============================================================---------yes no intent---------===================================-------------------
//====================================================================================================================================================

/**
 * Handles ambiguous yes/no situations where the customer is saying yes or no to a question not confirming a slot
 * This handler will use a yesNoKey session attribute to figure out where in the dialog the customer is, and route them
 * accordingly based on their yes/no responseBuilder
 * */
const YesNoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "YesNoIntent"
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const key = sessionAttributes.yesNoKey;
        const answer = resolveEntity(slots, "answer");

        if (key === "orderMore") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                // user would like to add more to their order
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
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "submitOrder") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                // user would like to submit their order
                return handlerInput.responseBuilder
                    .addDelegateDirective(
                        {
                            name: 'SubmitOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })
                    .getResponse();
            }
            else if (answer === "no") {
                return handlerInput.responseBuilder
                    .speak("What would you like to do?")
                    .reprompt("What would you like to do?")
                    .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "listSubmit") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                let allItems = await reinhart.getOrderContents(sessionAttributes.pendingOrderNumber);

                if (allItems !== null) {
                    let itemsToRead;
                    if (allItems.length > 3) {
                        sessionAttributes.itemsToReadIndex = 0;
                        sessionAttributes.allItems = allItems;
                        itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                        sessionAttributes.yesNoKey = "listMoreSubmit";
                        return handlerInput.responseBuilder
                            .speak('There are ' + allItems.length + ' items in your cart: ' + stringifyItemList(itemsToRead) + ". Would you like to hear more?")
                            .reprompt("Would you like to hear more?")
                            .getResponse();

                    } else {
                        return handlerInput.responseBuilder
                            .speak("you currently have " + stringifyItemList(allItems) + " in your cart. Are you sure you would like to submit?")
                            .reprompt("Are you sure you would like to submit?")
                            .addConfirmIntentDirective("SubmitOrderIntent")
                            .getResponse();
                    }
                } else {
                    return handlerInput.responseBuilder
                        .speak("I'm sorry, something went wrong when I tried retrieving your order contents.")
                        .reprompt("I'm sorry, something went wrong when I tried retrieving your order contents.")
                        .getResponse();
                }


            }
            else if (answer === "no") {
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
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "listMoreSubmit") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                let itemsToRead;
                let allItems = sessionAttributes.allItems;
                sessionAttributes.itemsToReadIndex += 3;
                let itemsLeftToRead = allItems.length - sessionAttributes.itemsToReadIndex;

                let speakOutput;
                if (itemsLeftToRead > 3) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                    speakOutput = 'There are ' + itemsLeftToRead + ' other items in your cart: ' + stringifyItemList(itemsToRead) + ". Would you like to hear more?";
                    sessionAttributes.yesNoKey = "listPending";
                } else if (itemsLeftToRead > 2) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                    return handlerInput.responseBuilder
                        .speak("The rest of your cart contains " + stringifyItemList(itemsToRead) + ". Are you sure you would like to submit?")
                        .reprompt("Are you sure you would like to submit?")
                        .addConfirmIntentDirective("SubmitOrderIntent")
                        .getResponse();
                } else if (itemsLeftToRead > 1) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1]];
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                    return handlerInput.responseBuilder
                        .speak("The rest of your cart contains " + stringifyItemList(itemsToRead) + ". Are you sure you would like to submit?")
                        .reprompt("Are you sure you would like to submit?")
                        .addConfirmIntentDirective("SubmitOrderIntent")
                        .getResponse();
                } else if (itemsLeftToRead === 1) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex]];
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                    return handlerInput.responseBuilder
                        .speak("The rest of your cart contains " + stringifyItemList(itemsToRead) + ". Are you sure you would like to submit?")
                        .reprompt("Are you sure you would like to submit?")
                        .addConfirmIntentDirective("SubmitOrderIntent")
                        .getResponse();
                } else {
                    speakOutput = "There are no more items to read off from your cart. Are you sure you would like to submit?";
                }

                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();

            }
            else if (answer === "no") {
                return handlerInput.responseBuilder
                    .speak("Are you sure you would like to submit?")
                    .reprompt("Are you sure you would like to submit?")
                    .addConfirmIntentDirective("SubmitOrderIntent")
                    .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "editMore") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                var customerID = 14445;
                const pendingOrder = await reinhart.getPendingOrderInfo(customerID);
                if (pendingOrder === null) {
                    sessionAttributes.intentState = 0;
                    return handlerInput.responseBuilder
                        .speak("You do not have any items in your shopping cart to edit. What else can I help you with today?")
                        .reprompt("What else can I help you with today?")
                        .getResponse();
                }

                const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
                if (allItems === null) {
                    sessionAttributes.intentState = 0;
                    return handlerInput.responseBuilder
                        .speak("You do not have any items in your shopping cart to edit. What else can I help you with today?")
                        .reprompt("What else can I help you with today?")
                        .getResponse();
                }

                const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
                sessionAttributes.orderNumber = pendingOrder.orderNumber

                return handlerInput.responseBuilder
                    .speak("Which item in your cart do you want to edit?")
                    .reprompt('If you would like to me list the items in your shopping cart, say view my shopping cart, otherwise state the name of the product you wish to edit.')
                    .addElicitSlotDirective('spokenProductName', {
                        name: 'EditOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: "spokenProductName",
                                value: undefined,
                                confirmationStatus: "NONE"
                            },
                            newQuantity: {
                                name: "newQuantity",
                                value: undefined
                            }
                        }
                    })
                    .getResponse();
            }
            else if (answer === "no") {
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("Okay, what else can I help you with today?")
                    .reprompt("What would you like to do?")
                    .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "relatedOrderGuide") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
                const resolvedProducts = sessionAttributes.resolvedProducts;

                // user has indicated they would like to hear more related items in their order guide so we will read the next one off
                return handlerInput.responseBuilder
                    .speak("Okay, the next best match in your order guide is " + stringifyProduct(resolvedProducts[sessionAttributes.productIndex]) + ". Is this what you would like to order?")
                    .reprompt("The next best match in your order guide is " + stringifyProduct(resolvedProducts[sessionAttributes.productIndex]) + ". Is this what you would like to order?")
                    .addConfirmSlotDirective("spokenProductName", {
                        name: 'MakeOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: "spokenProductName",
                                value: sessionAttributes.spokenProductName,
                                confirmationStatus: sessionAttributes.productConfirmation
                            },
                            quantity: {
                                name: "quantity",
                                value: sessionAttributes.quantity
                            }
                        }
                    })
                    .getResponse();
            }
            else if (answer === "no") {
                // user has indicated they do not want to hear more related items in their order guide so we will ask them to state a more specific product name
                return handlerInput.responseBuilder
                    .speak("Okay, please state a more specific product name for me to search.")
                    .reprompt('What would you like to order?')
                    .addElicitSlotDirective('spokenProductName', {
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
                                value: undefined
                            }
                        }
                    })
                    .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "listPending") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                let itemsToRead;
                let allItems = sessionAttributes.allItems;
                sessionAttributes.itemsToReadIndex += 3;
                let itemsLeftToRead = allItems.length - sessionAttributes.itemsToReadIndex;

                let speakOutput;
                if (itemsLeftToRead > 3) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                    speakOutput = 'There are ' + itemsLeftToRead + ' other items in your cart: ' + stringifyItemList(itemsToRead) + ". Would you like to hear more?";
                    sessionAttributes.yesNoKey = "listPending";
                } else if (itemsLeftToRead > 2) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                    speakOutput = 'The rest of your cart contains ' + stringifyItemList(itemsToRead) + ". What else can I do for you today?";
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                } else if (itemsLeftToRead > 1) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1]];
                    speakOutput = 'The rest of your cart contains ' + stringifyItemList(itemsToRead) + ". What else can I do for you today?";
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                } else if (itemsLeftToRead === 1) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex]];
                    speakOutput = 'The rest of your cart contains ' + stringifyItemList(itemsToRead) + ". What else can I do for you today?";
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                } else {
                    speakOutput = "There are no more items to read off from your cart. What else can I do for you today?";
                }
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();

            }
            else if (answer === "no") {
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("Okay, what else can I do for you today?")
                    .reprompt("Okay, what else can I do for you today?")
                    .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "listDelivery") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                let itemsToRead;
                let allItems = sessionAttributes.allItems;
                sessionAttributes.itemsToReadIndex += 3;
                let itemsLeftToRead = allItems.length - sessionAttributes.itemsToReadIndex;

                let speakOutput;
                if (itemsLeftToRead > 3) {
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                    speakOutput = 'There are ' + itemsLeftToRead + ' other items in your next delivery: ' + stringifyItemList(itemsToRead) + ". Would you like to hear more?";
                    sessionAttributes.yesNoKey = "listDelivery";
                } else if (itemsLeftToRead > 2) {
                    sessionAttributes.intentState = 0;
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                    speakOutput = 'The rest of your next delivery contains ' + stringifyItemList(itemsToRead) + ". What else can I do for you today?";
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                } else if (itemsLeftToRead > 1) {
                    sessionAttributes.intentState = 0;
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1]];
                    speakOutput = 'The rest of your next delivery contains ' + stringifyItemList(itemsToRead) + ". What else can I do for you today?";
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                } else if (itemsLeftToRead === 1) {
                    sessionAttributes.intentState = 0;
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex]];
                    speakOutput = 'The rest of your next delivery contains ' + stringifyItemList(itemsToRead) + ". What else can I do for you today?";
                    sessionAttributes.itemsToReadIndex = undefined;
                    sessionAttributes.allItems = undefined;
                } else {
                    sessionAttributes.intentState = 0;
                    speakOutput = "There are no more items to read off from your next delivery. What else can I do for you today?";
                }

                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();

            }
            else if (answer === "no") {
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("Okay, what else can I do for you today?")
                    .reprompt("Okay, what else can I do for you today?")
                    .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "relatedCatalogue") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {
                const customerID = 14445;
                const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
                const spokenProductName = sessionAttributes.spokenProductName;
                sessionAttributes.productIndex = 0;
                sessionAttributes.productDenies = 0;
                sessionAttributes.resolvedProducts = await reinhart.getProductFromCatalogue(spokenProductName);

                const resolvedProducts = sessionAttributes.resolvedProducts;
                console.log("resolvedProducts: " + JSON.stringify(resolvedProducts));

                if (resolvedProducts === null) {
                    return handlerInput.responseBuilder
                        .speak("I'm sorry, I was not able to find any related items in the catalogue. Please state a new product name for me to search.")
                        .reprompt("I'm sorry, I was not able to find any related items in the catalogue. Please state a new product name for me to search.")
                        .addElicitSlotDirective('spokenProductName', {
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
                                    value: undefined
                                }
                            }
                        })
                        .getResponse();
                }
                console.log("we will now return the first related item from the catalogue");
                // user has indicated they would like to hear more related items from the catalogue so we will start listing them off
                return handlerInput.responseBuilder
                    .speak("Okay, I found " + resolvedProducts.length + " items related to " + spokenProductName + " in the catalogue. The next best match is " + stringifyProduct(resolvedProducts[sessionAttributes.productIndex]) + ". Is this what you would like to order?")
                    .reprompt("Okay, I found " + resolvedProducts.length + " items related to " + spokenProductName + " in the catalogue. The next best match is " + stringifyProduct(resolvedProducts[sessionAttributes.productIndex]) + ". Is this what you would like to order?")
                    .addConfirmSlotDirective("spokenProductName", {
                        name: 'MakeOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: "spokenProductName",
                                value: spokenProductName,
                                confirmationStatus: sessionAttributes.productConfirmation
                            },
                            quantity: {
                                name: "quantity",
                                value: sessionAttributes.quantity
                            }
                        }
                    })
                    .getResponse();

            }
            else if (answer === "no") {
                // user has indicated they do not want to hear more related items from the catalogue so we will ask them to state a more specific product name
                return handlerInput.responseBuilder
                    .speak("Okay, please state a more specific product name for me to search.")
                    .reprompt('What would you like to order?')
                    .addElicitSlotDirective('spokenProductName', {
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
                                value: undefined
                            }
                        }
                    })
                    .getResponse();
            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else if (key === "template") {
            sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
            if (answer === "yes") {

            }
            else if (answer === "no") {

            }
            else {
                // there was an error--this is here for debugging purposes
                sessionAttributes.intentState = 0;
                return handlerInput.responseBuilder
                    .speak("I'm sorry, something went wrong.")
                    .getResponse();
            }
        }
        else {
            // there was an error and we have an invalid yesNoKey
            sessionAttributes.intentState = 0;
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

/**
 * User asks to edit their order without stating an item in their cart to edit
 * */
const ProductNotGiven_EditOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "EditOrderIntent"
            && !handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        sessionAttributes.intentState = 3;
        
        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to edit. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to edit. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        return handlerInput.responseBuilder
            .addElicitSlotDirective('spokenProductName')
            .speak("Which item in your cart do you want to edit?")
            .reprompt('If you would like to me list the items in your shopping cart, say view my shopping cart, otherwise state the name of the product you wish to edit.')
            .getResponse();
    }
};

/**
 * User has provided a product in their cart that they wish to edit
 * */
const ProductGiven_EditOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "EditOrderIntent"
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === "NONE"
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const spokenProductName = slots.spokenProductName.value;
        const newQuantity = slots.newQuantity.value;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        sessionAttributes.intentState = 3;

        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to edit. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak("You do not have any items in your shopping cart to edit. What else can I help you with today?")
                .reprompt("What else can I help you with today?")
                .getResponse();
        }

        const productInCart = await reinhart.getOrderItemFromOrder(pendingOrder.orderNumber, spokenProductName, sessionAttributes.customerID);

        if (productInCart === null) {
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
                            newQuantity: {
                                name: "newQuantity",
                                value: newQuantity
                            }
                        }
                    })
                .speak("I'm sorry, I was not able to find a product matching " + spokenProductName + " in your shopping cart. Please state a new product or try being more specific.")
                .reprompt("Try to be as specific as possible. Which item in your cart do you want to edit?")
                .getResponse();
        }

        sessionAttributes.productInCart = productInCart;
        sessionAttributes.orderNumber = pendingOrder.orderNumber;

        let speechOutput = "";
        if (productInCart.quantity > 1) {
            speechOutput += "I was able to find " + productInCart.quantity + " cases of " + stringifyProduct(productInCart) + " in your cart. Is this the item you wish to edit?";
        } else {
            speechOutput += "I was able to find " + productInCart.quantity + " case of " + stringifyProduct(productInCart) + " in your cart. Is this the item you wish to edit?";
        }

        return handlerInput.responseBuilder
            .addConfirmSlotDirective('spokenProductName')
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    }
};


/**
 * User has provided a product they would like to edit in their cart and confirmed whether
 * or not the product we retrieved from their cart is the one they would like to edit.
 * We will check whether or not they confirmed or denied the product here.
 * */
const ProductConfirmation_EditOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "EditOrderIntent"
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && !handlerInput.requestEnvelope.request.intent.slots.newQuantity.value
    },
    handle(handlerInput) {
        const intent = handlerInput.requestEnvelope.request.intent;
        const spokenProductName = intent.slots.spokenProductName.value;
        const newQuantity = intent.slots.newQuantity.value;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const productInCart = sessionAttributes.productInCart;
        sessionAttributes.intentState = 3;

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
                            newQuantity: {
                                name: "newQuantity",
                                value: newQuantity,
                                confirmationStatus: "NONE"
                            }
                        }
                    })
                .getResponse();
        }
        if (intent.slots.spokenProductName.confirmationStatus === "CONFIRMED") {

            return handlerInput.responseBuilder
                .speak("Please state a new quantity for " + stringifyProduct(productInCart) + " or say zero to remove the item from your cart.")
                .reprompt("Please state a number for the new quantity for " + stringifyProduct(productInCart) + " or say zero to remove the item from your cart.")
                .addElicitSlotDirective('newQuantity',
                    {
                        name: 'EditOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: "spokenProductName",
                                value: intent.slots.spokenProductName.value,
                                confirmationStatus: "CONFIRMED"
                            },
                            newQuantity: {
                                name: "newQuantity",
                                value: newQuantity
                            }
                        }
                    })
                .getResponse();
        }
    }
};

/**
 * User has confirmed the product in their cart they wish to edit and provided a
 * new quantity for the product. We will save the change to their order here and ask if they would
 * like to edit anything else.
 * */
const ProductQuantityGiven_EditOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
            && handlerInput.requestEnvelope.request.intent.name === "EditOrderIntent"
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.newQuantity.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === "CONFIRMED";
    },
    async handle(handlerInput) {
        const intent = handlerInput.requestEnvelope.request.intent;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const productInCart = sessionAttributes.productInCart;
        const orderNumber = sessionAttributes.orderNumber;
        const newQuantity = intent.slots.newQuantity.value;
        sessionAttributes.intentState = 3;

        if (isNaN(newQuantity) || !Number.isInteger(parseInt(newQuantity)) || newQuantity < 0 || newQuantity > 100) {
            return handlerInput.responseBuilder
                .speak(newQuantity + " is not a valid quantity. Please provide a new quantity between 0 and 100 cases")
                .reprompt("Please state a number for the new quantity for " + stringifyProduct(productInCart) + " or say zero to remove the item from your cart.")
                .addElicitSlotDirective("newQuantity",
                    {
                        name: 'EditOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: "spokenProductName",
                                value: intent.slots.spokenProductName.value,
                                confirmationStatus: "CONFIRMED"
                            },
                            newQuantity: {
                                name: "newQuantity",
                                value: undefined
                            }
                        }
                    })
                .getResponse();
        }

        let speechOutput = "";
        if (parseInt(intent.slots.newQuantity.value) !== 0) {
            const updateQuantityResult = await reinhart.updateQuantity(orderNumber, productInCart.ProductNumber, intent.slots.newQuantity.value);
            if (updateQuantityResult) {
                if (intent.slots.newQuantity.value > 1) {
                    speechOutput += "Okay, your cart now contains " + intent.slots.newQuantity.value + " cases of " + stringifyProduct(productInCart) + ". Would you like to edit anything else in your cart?";
                } else {
                    speechOutput += "Okay, your cart now contains " + intent.slots.newQuantity.value + " case of " + stringifyProduct(productInCart) + ". Would you like to edit anything else in your cart?";
                }
            } else {
                speechOutput += "I'm sorry, something went wrong when I tried editing your cart. Please try going online to finish editing your cart.";
            }
        } else {
            const removeProductResult = await reinhart.removeProduct(orderNumber, productInCart.ProductNumber);
            if (removeProductResult) {
                speechOutput += "Okay, I removed " + stringifyProduct(productInCart) + " from your cart. Would you like to edit anything else in your cart?";
            } else {
                speechOutput += "I'm sorry, something went wrong when I tried removing the item from your cart. Please try going online to complete the removal process.";
            }
        }

        sessionAttributes.yesNoKey = "editMore";
        sessionAttributes.intentState = 0;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt("What else can I help you with today?")
            .getResponse();
    }

};



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//---===============================================================---------Small Functions---------===================================---------
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


const ViewNextDeliveryContentsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewNextDeliveryContents';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let allItems = await reinhart.getNextDeliveryContents(sessionAttributes.customerID);

        let speakOutput;
        if (allItems !== null) {
            let itemsToRead;
            if (allItems.length > 3) {
                sessionAttributes.itemsToReadIndex = 0;
                sessionAttributes.allItems = allItems;
                itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                speakOutput = 'There are ' + allItems.length + ' items in your next delivery: ' + stringifyItemList(itemsToRead) + ". Would you like to hear more?"
                sessionAttributes.yesNoKey = "listDelivery";

            } else {
                speakOutput = 'There are ' + allItems.length + ' items in your next delivery: ' + stringifyItemList(allItems) + ". What else can I help you with today?";
            }
        } else {
            speakOutput = 'There are no items coming in your next delivery. What else can I do for you today?';
        }
        sessionAttributes.intentState = 0;
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
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);

        let speakOutput;
        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            speakOutput = 'Your shopping cart is currently empty, start an order to begin adding to it. What else can I do for you today?';

        } else {

            let allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);

            if (allItems !== null) {
                let itemsToRead;
                if (allItems.length > 3) {
                    sessionAttributes.itemsToReadIndex = 0;
                    sessionAttributes.allItems = allItems;
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                    speakOutput = 'There are ' + allItems.length + ' items in your cart: ' + stringifyItemList(itemsToRead) + ". Would you like to hear more?"
                    sessionAttributes.yesNoKey = "listPending";

                } else {
                    sessionAttributes.intentState = 0;
                    speakOutput = 'There are ' + allItems.length + ' items in your cart: ' + stringifyItemList(allItems) + ". What else can I help you with today?";
                }
            } else {
                sessionAttributes.intentState = 0;
                speakOutput = 'Your shopping cart is currently empty, start an order to begin adding to it. What else can I do for you today?';
            }

        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//---===============================================================---------Helpers---------===================================-----------------
//=====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


/**
 * Parses the ISO delivery date format into a more digestible format for the user
 * */
const parseDate = (deliveryDate) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let trimmedDate = deliveryDate.slice(0, 10);
    trimmedDate = trimmedDate.split("-");
    const year = parseInt(trimmedDate[0]);
    let month = parseInt(trimmedDate[1]);
    month = months[month - 1];
    let day = parseInt(trimmedDate[2]);

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

/**
 * Takes in a list of order items and stringifies them 
 * into a digestible, string list format to be read off
 * */
const stringifyItemList = (orderItems) => {
    let stringList = "";
    for (var i = 0; i < orderItems.length; i++) {
        const quantity = orderItems[i].quantity;
        const productName = stringifyProduct(orderItems[i]);
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

/**
 * Takes in all of a products information and stringifies items
 * into a digestible, string format for the user
 * */
const stringifyProduct = (product) => {
    const descriptionTranslated = product.DescriptionTranslated;
    const packSize = product.PackSize;
    const brandTranslated = product.BrandTranslated;

    let parsedDescription = parseDescription(descriptionTranslated);

    let toReturn = "";
    
    // let parsedPackSize = parsePackSize(packSize);

    // if (parsedPackSize.length === 1) {
    //     toReturn += parsedPackSize[0];
    // } else if (parsedPackSize.length === 2) {
    //     toReturn += parsedPackSize[0] + " " + mapUnit(parsedPackSize[1]) + " ";
    // } else {
    //     toReturn += parsedPackSize[0] + " pack " + parsedPackSize[1] + " " + mapUnit(parsedPackSize[2]) + " ";
    // }

    // toReturn += parsedDescription + " from " + brandTranslated;
    
    toReturn += parsedDescription;
    toReturn = toReturn.toLowerCase();
    console.log("stringified product: " + toReturn);
    return toReturn;
}

const mapUnit = (unit) => {
    console.log("unit to map: " + unit);
    switch (unit.toUpperCase()) {
        case "CNT":
            return "count";
        case "LB":
            return "pound";
        case "GAL":
            return "gallon";
        case "OZ":
            return "ounce";
        case "ML":
            return "millileter";
        case "DZ":
            return "dozen";
        case "LBS":
            return "pound";
        case "GM":
            return "gram";
        case "L":
            return "liter";
        case "UP":
            return "unit price";
        default:
            return unit;
    }
}

const parseDescription = (descriptionTranslated) => {
    let toReturn = "";
    let splitDescription = descriptionTranslated.split(" ");
    descriptionTranslated = "";
    for (let j = 0; j < splitDescription.length && j < 4; j++) {
        descriptionTranslated += splitDescription[j] + " ";
    }
    
    for (let i = 0; i < descriptionTranslated.length; i++) {
        switch (descriptionTranslated.charAt(i)) {
            case "\"":
                toReturn += " inch";
                break;
            case "&":
                toReturn += "and";
                break;
            default:
                toReturn += descriptionTranslated.charAt(i);
                break;
        }
    }
    return toReturn;
}

const parsePackSize = (packSize) => {
    const splitNumerics = packSize.match(/[a-z]+|[^a-z]+/gi);
    const splitCounts = splitNumerics[0].split("/");
    let splitPackSize;
    if (splitCounts[1] === "") {
        if (splitNumerics[1] === undefined) {
            splitPackSize = [splitCounts[0]];
        } else {
            splitPackSize = [splitCounts[0], splitNumerics[1]];
        }
    } else {
        if (splitNumerics[1] === undefined) {
            splitPackSize = [splitCounts[0], splitCounts[1]];
        } else {
            splitPackSize = [splitCounts[0], splitCounts[1], splitNumerics[1]];
        }
    }
    console.log("pack size array [" + splitPackSize + "]");
    return splitPackSize;
}

/**
 * Resolves multivalued slots based on what a user says.
 * For example, if a user says "nope", this would get resolved to "no".
 **/
const resolveEntity = function (resolvedEntity, slotName) {

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
        let speakOutput;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        switch (sessionAttributes.intentState) {
            case 0:
                speakOutput = 'In Reinhart\'s Alexa app you can quickly add, edit, view, and remove items from your shopping cart, you can also submit an order for your next delivery date. To do these tasks simply say: add to my order, edit my order, view my order, remove a product in my order, or submit my order. Saying help while in the process of one of these tasks will give you more detailed feedback. If you need further help, please contact customer support. You cannot remove or edit submitted orders using the Alexa app, please use the website to do that.';
                break;
            case 1:
                speakOutput = 'Say the keyword or name of the product you want to order, for best results use keywords, but if you don\'t have keywords say the product name for example, beef tenderloin tenderized 16 oz. If Alexa donesn\'t find your product please refine your search with more detail, or search the reinhart catalogue. after finding your product, Alexa will prompt you for a quantity. You can say the product name and a quantity in one sentence as well. You can only add one product at a time, please follow Alexa\'s prompts. ';
                break;
            case 2:
                speakOutput = 'To submit this order say submit order then follow along with Alexa\'s responses';
                break;
            case 3:
                speakOutput = 'Say the product name that you want to edit, Alexa will search your shopping cart for that item and ask you if that\'s the right item. Then Alexa will ask for a new quantity, say \'zero\' to remove the product from your cart. You cannot remove or edit submitted orders using the Alexa app, please use the website to do that.';
                break;
            case 4:
                speakOutput = 'Say the keyword or name of the product you want to remove, confirm or deny the item Alexa tells you. Then Alexa will remove it from your shopping cart. You cannot remove or edit submitted orders using the Alexa app, please use the website to do that.';
                break;
            case 5:
                speakOutput = 'You shouldnt see this, bad customer!';
                break;
            default:
                speakOutput = 'error in help';
        }

        sessionAttributes.intentState = 0;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("What would you like to do?")
            .getResponse();
    }
};


const StopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Thank you for shopping with reinhart. Please come again!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const CancelIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent');
    },
    handle(handlerInput) {

        const speakOutput = 'What would you like to do? Say exit to close the app.';

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
        return;
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
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}` + speakOutput);

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

        ProductNotGiven_RemoveItemIntentHandler,
        ProductGiven_RemoveItemIntentHandler,
        ProductConfirmation_RemoveItemIntentHandler,

        Start_ClearOrderContentsIntentHandler,
        Complete_ClearOrderContentsIntentHandler,

        YesNoIntentHandler,

        ProductNotGiven_EditOrderIntentHandler,
        ProductGiven_EditOrderIntentHandler,
        ProductConfirmation_EditOrderIntentHandler,
        ProductQuantityGiven_EditOrderIntentHandler,

        ViewNextDeliveryContentsIntentHandler,
        ViewPendingOrderContentsIntentHandler,

        HelpIntentHandler,
        CancelIntentHandler,
        StopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();