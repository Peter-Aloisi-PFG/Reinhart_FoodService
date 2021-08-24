/* *
 * This file contains the handlers for all skill Intents
 *
 * TODO:
 *   Remove Item from cart Intent
 *   Remove all Items from cart Intent
 * */

//includes/requires
const Alexa = require('ask-sdk-core');
const reinhart = require('reinhart_api.js');


// const LaunchRequestHandler = {
//     canHandle(handlerInput) {
//         return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
//     },
//     handle(handlerInput) {
//         const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//         const speakOutput = 'Welcome to Reinhart Foodservice. What would you like to do?';
//         sessionAttributes.intentState = 0;
//         sessionAttributes.customerID = 14445; // hardcoded customerID

//         return handlerInput.responseBuilder
//             .speak(speakOutput)
//             .reprompt(speakOutput)
//             .getResponse();
//     }
// };

/* *
 * The intent that always gets called first when the user says the invocation phrase
 * */
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = ``;
        sessionAttributes.intentState = 0;
        const { accessToken } = handlerInput.requestEnvelope.session.user;

        if (typeof accessToken !== "undefined") {
            const info = await reinhart.getUserAccess(accessToken);
            console.log(`info: ${JSON.stringify(info)}`)
            const { name } = info;
            const { email } = info;
            const userInfo = await reinhart.getUserInfo(email);
            if (userInfo === null || userInfo === undefined) {
                return handlerInput.responseBuilder
                    .speak('We are sorry, we cannot find your email in our database, please contact customer support to add your email that you use for your alexa, to your Reinhart account')
                    .getResponse();
            }

            //set the customer id and the speakoutput
            sessionAttributes.customerID = userInfo.customerNumber;
            speakOutput = `Welcome to Reinhart Foodservice, ${userInfo.customerName}. What would you like to do?`;

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } else {
            //user didnt allow account linking or they would have access Token
            return handlerInput.responseBuilder
                .speak('Welcome to Reinhart Foodservice, please allow account linking for us in your alexa app so we can get your information, then relaunch the app')
                .getResponse();
        }
    }
};


const DialogManagementStateInterceptor = {
    process(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        console.log("interceptor fired on ===============================================================");
        console.log(currentIntent);

        if (handlerInput.requestEnvelope.request.type === 'IntentRequest') {
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes();
            
            const intentName = currentIntent.name;
            if (intentName !== 'ItemDescriptionIntentHandler') {
                
                switch (intentName) {
                    case 'MakeOrderIntent':
                        sessionAttributes["RemoveItemIntent"] = undefined;
                        sessionAttributes["EditOrderIntent"] = undefined;
                        sessionAttributes["FindOrderItemIntent"] = undefined;
                        sessionAttributes["SubmitOrderIntent"] = undefined;
                        sessionAttributes["ItemDescriptionIntent"] = undefined;
                        sessionAttributes["ViewNextDeliveryContents"] = undefined;
                        sessionAttributes["ClearOrderContents"] = undefined;
                        sessionAttributes["ViewPendingOrderContents"] = undefined;
                    case 'RemoveItemIntent':
                        sessionAttributes["MakeOrderIntent"] = undefined;
                        sessionAttributes["EditOrderIntent"] = undefined;
                        sessionAttributes["FindOrderItemIntent"] = undefined;
                        sessionAttributes["SubmitOrderIntent"] = undefined;
                        sessionAttributes["ItemDescriptionIntent"] = undefined;
                        sessionAttributes["ViewNextDeliveryContents"] = undefined;
                        sessionAttributes["ClearOrderContents"] = undefined;
                        sessionAttributes["ViewPendingOrderContents"] = undefined;
                    case 'EditOrderIntent':
                        sessionAttributes["MakeOrderIntent"] = undefined;
                        sessionAttributes["RemoveItemIntent"] = undefined;
                        sessionAttributes["FindOrderItemIntent"] = undefined;
                        sessionAttributes["SubmitOrderIntent"] = undefined;
                        sessionAttributes["ItemDescriptionIntent"] = undefined;
                        sessionAttributes["ViewNextDeliveryContents"] = undefined;
                        sessionAttributes["ClearOrderContents"] = undefined;
                        sessionAttributes["ViewPendingOrderContents"] = undefined;
                    case 'FindOrderItemIntent':
                        sessionAttributes["MakeOrderIntent"] = undefined;
                        sessionAttributes["RemoveItemIntent"] = undefined;
                        sessionAttributes["EditOrderIntent"] = undefined;
                        sessionAttributes["SubmitOrderIntent"] = undefined;
                        sessionAttributes["ItemDescriptionIntent"] = undefined;
                        sessionAttributes["ViewNextDeliveryContents"] = undefined;
                        sessionAttributes["ClearOrderContents"] = undefined;
                        sessionAttributes["ViewPendingOrderContents"] = undefined;
                    case 'SubmitOrderIntent':
                        sessionAttributes["MakeOrderIntent"] = undefined;
                        sessionAttributes["RemoveItemIntent"] = undefined;
                        sessionAttributes["EditOrderIntent"] = undefined;
                        sessionAttributes["FindOrderItemIntent"] = undefined;
                        sessionAttributes["ItemDescriptionIntent"] = undefined;
                        sessionAttributes["ViewNextDeliveryContents"] = undefined;
                        sessionAttributes["ClearOrderContents"] = undefined;
                        sessionAttributes["ViewPendingOrderContents"] = undefined;
                    case 'ViewNextDeliveryContents':
                        sessionAttributes["MakeOrderIntent"] = undefined;
                        sessionAttributes["RemoveItemIntent"] = undefined;
                        sessionAttributes["EditOrderIntent"] = undefined;
                        sessionAttributes["FindOrderItemIntent"] = undefined;
                        sessionAttributes["SubmitOrderIntent"] = undefined;
                        sessionAttributes["ItemDescriptionIntent"] = undefined;
                        sessionAttributes["ClearOrderContents"] = undefined;
                        sessionAttributes["ViewPendingOrderContents"] = undefined;
                    case 'ClearOrderContents':
                        sessionAttributes["MakeOrderIntent"] = undefined;
                        sessionAttributes["RemoveItemIntent"] = undefined;
                        sessionAttributes["EditOrderIntent"] = undefined;
                        sessionAttributes["FindOrderItemIntent"] = undefined;
                        sessionAttributes["SubmitOrderIntent"] = undefined;
                        sessionAttributes["ItemDescriptionIntent"] = undefined;
                        sessionAttributes["ViewNextDeliveryContents"] = undefined;
                        sessionAttributes["ClearOrderContents"] = undefined;
                        sessionAttributes["ViewPendingOrderContents"] = undefined;
                    case 'ViewPendingOrderContents':
                        sessionAttributes["MakeOrderIntent"] = undefined;
                        sessionAttributes["RemoveItemIntent"] = undefined;
                        sessionAttributes["EditOrderIntent"] = undefined;
                        sessionAttributes["FindOrderItemIntent"] = undefined;
                        sessionAttributes["SubmitOrderIntent"] = undefined;
                        sessionAttributes["ItemDescriptionIntent"] = undefined;
                        sessionAttributes["ViewNextDeliveryContents"] = undefined;
                        sessionAttributes["ClearOrderContents"] = undefined;
                        sessionAttributes["ViewPendingOrderContents"] = undefined;
                }
            }
            // If there are no session attributes we've never entered dialog management
            // for this intent before.

            if (sessionAttributes[currentIntent.name]) {
                let savedSlots = sessionAttributes[currentIntent.name].slots;

                for (let key in savedSlots) {
                    // we let the current intent's values override the session attributes
                    // that way the user can override previously given values.
                    // this includes anything we have previously stored in their profile.
                    if (!currentIntent.slots[key].value && savedSlots[key].value) {
                        currentIntent.slots[key] = savedSlots[key];
                    }
                }
            }
            sessionAttributes[currentIntent.name] = currentIntent;
            attributesManager.setSessionAttributes(sessionAttributes);
        }
    }
};


const ItemDescriptionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ItemDescriptionIntent';
    },
    async handle(handlerInput) {
        let speakOutput;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (handlerInput.requestEnvelope.request.intent.slots.item.value) {
            let description = await reinhart.getProductByKeyword(handlerInput.requestEnvelope.request.intent.slots.item.value, sessionAttributes.customerID);

            if (description === undefined || description === null) {
                description = await reinhart.getProductFromOrderGuide(handlerInput.requestEnvelope.request.intent.slots.item.value, sessionAttributes.customerID);
                description = description[0];
            }
            if (description === undefined || description === null) {
                speakOutput = "Sorry I could not find a product similar to " + handlerInput.requestEnvelope.request.intent.slots.item.value + "in your order guide.";
            } else {
                speakOutput = 'In your order-guide, ' + handlerInput.requestEnvelope.request.intent.slots.item.value +' is ' + stringifyProduct(description) + ".";
            }
            handlerInput.requestEnvelope.request.intent.slots.item.value = undefined;

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt("What do you want to do?")
                .getResponse();
        } else {
            speakOutput = 'Give me a product to look up or ask this at an appropriate time';
        }
        if (sessionAttributes.intentState === 1 && sessionAttributes.fullDescription !== undefined) {
            const currentIntent = sessionAttributes["MakeOrderIntent"];
            if (currentIntent.slots.spokenProductName.confirmationStatus === 'CONFIRMED') {
                //we have confrimed product and we want quantity 
                speakOutput = "The full description for this item is " + stringifyProduct(sessionAttributes.fullDescription) + ". How many cases would you like?";
                return handlerInput.responseBuilder
                    .addElicitSlotDirective("quantity",
                        {
                            name: 'MakeOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                spokenProductName: {
                                    name: "spokenProductName",
                                    value: sessionAttributes.spokenProductName,
                                    confirmationStatus: "CONFIRMED"
                                },
                                quantity: {
                                    name: "quantity",
                                    value: undefined
                                }
                            }
                        })
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            } else {
                //we have not confirmed product and we want to do that.
                speakOutput = "The full description for this item is " + stringifyProduct(sessionAttributes.fullDescription) + ". Would you like to order this?";
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }

        } else if (sessionAttributes.intentState === 3 && sessionAttributes.productInCart !== undefined) {
            const currentIntent = sessionAttributes["EditOrderIntent"];
            
            if (currentIntent.slots.spokenProductName.confirmationStatus === 'CONFIRMED') {
                //we have confirmed product and we want quantity 
                speakOutput = "The full description for this item is " + stringifyProduct(sessionAttributes.fullDescription) + ". Please state a new quantity for this item. Say zero to remove it from your cart."
                return handlerInput.responseBuilder
                    .addElicitSlotDirective("newQuantity",
                        {
                            name: 'EditOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                spokenProductName: {
                                    name: "spokenProductName",
                                    value: currentIntent.slots.spokenProductName.value,
                                    confirmationStatus: "CONFIRMED"
                                },
                                newQuantity: {
                                    name: "newQuantity",
                                    value: undefined
                                }
                            }
                        })
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
                
            } else {
                //we have not confirmed product and we want to do so
                speakOutput = "The full description for this item is " + stringifyProduct(sessionAttributes.fullDescription) + ". Is this the item you wish to edit?";
            }

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } else if (sessionAttributes.orderGuideExhausted === true) {
            
            speakOutput = "The full description for this item is " + stringifyProduct(sessionAttributes.fullDescription) + ". Please state a new quantity for this item. Say zero to remove it from your cart.";
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        console.log(sessionAttributes.productInCart);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("What do you want to do?")
            .getResponse();
    }
};




//=======================================================================================================================================
//============================================---------Make Order---------===============================================================
//=======================================================================================================================================
/**
 * User starts an order without giving any slot information
 * Ex: 'Start order'
 * */
const Start_MakeOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MakeOrderIntent'
            && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.intentState = 1;
        return handlerInput.responseBuilder
            .addElicitSlotDirective('spokenProductName')
            .speak('What would you like to order?')
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MakeOrderIntent'
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === 'NONE'
    },
    async handle(handlerInput) {
        console.log('entered product given handler');
        const intent = handlerInput.requestEnvelope.request.intent;
        const slots = intent.slots;
        const spokenProductName = slots.spokenProductName.value;
        const quantity = slots.quantity.value;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.intentState = 1;
        sessionAttributes.spokenProductName = spokenProductName;

        let productDescription;

        const keywordProduct = await reinhart.getProductByKeyword(spokenProductName, sessionAttributes.customerID);

        if (keywordProduct !== null) {
            // found a keyword so we're going to grab that product and immediately move on w/o confirmation
            console.log('keyword result found');
            const productToAdd = keywordProduct;
            sessionAttributes.resolvedProducts = [keywordProduct];
            sessionAttributes.productDescription = parseDescription(keywordProduct.DescriptionTranslated, 3);
            sessionAttributes.productIndex = 0;
            sessionAttributes.fullDescription = keywordProduct;
            productDescription = spokenProductName;
            slots.spokenProductName.confirmationStatus = "CONFIRMED";

            if (quantity !== undefined) {
                if (isNaN(quantity) || !Number.isInteger(parseInt(quantity)) || quantity < 1 || quantity > 100) {
                    sessionAttributes.productIndex = 0;
                    sessionAttributes.resolvedProducts = [productToAdd];
                    sessionAttributes.productDescription = productDescription;
                    slots.quantity = undefined;
                    return handlerInput.responseBuilder
                        .speak('You did not provide a valid quantity. Please provide a new quantity between 1 and 100.')
                        .reprompt('How many cases would you like?')
                        .addElicitSlotDirective('quantity',
                            {
                                name: 'MakeOrderIntent',
                                confirmationStatus: 'NONE',
                                slots: {
                                    spokenProductName: {
                                        name: 'spokenProductName',
                                        value: spokenProductName,
                                        confirmationStatus: 'CONFIRMED'
                                    },
                                    quantity: {
                                        name: 'quantity',
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
                            .speak('I\'m sorry, something went wrong when I tried creating an order for you. ' +
                                'Please try going online to complete your order, or contact customer service for assistance.')
                            .reprompt('What would you like to do?')
                            .getResponse();
                    }
                }

                const addToOrderResult = await reinhart.addToOrder(orderInfo.orderNumber, productToAdd, quantity);
                if (!addToOrderResult) {
                    // add to order function ran into an error
                    return handlerInput.responseBuilder
                        .speak('Im sorry, something went wrong when I tried adding to your shopping cart. ' +
                            'Please try going online to complete your order, or contact customer service for assistance.')
                        .reprompt('What would you like to do?')
                        .getResponse();
                }

                slots.spokenProductName = undefined;
                slots.quantity = undefined;
                intent.dialogState = 'COMPLETED';
                sessionAttributes.yesNoKey = 'orderMore';
                let speakOutput = '';
                if (quantity > 1) {
                    speakOutput += 'I added ' + quantity + ' cases of ' + productDescription + ' to your cart. Would you like to order anything else?'
                } else {
                    speakOutput += 'I added ' + quantity + ' case of ' + productDescription + ' to your cart. Would you like to order anything else?'
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt('Would you like to order anything else?')
                    .getResponse();

            } else {
                return handlerInput.responseBuilder
                    .addElicitSlotDirective('quantity',
                        {
                            name: 'MakeOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                spokenProductName: {
                                    name: 'spokenProductName',
                                    value: spokenProductName,
                                },
                                quantity: {
                                    name: 'quantity',
                                    value: quantity
                                }
                            }
                        }
                    )
                    .speak('How many cases would you like?')
                    .reprompt('How many cases would you like?')
                    .getResponse();
            }
        }

        // did not find a keyword match
        const resolvedProducts = await reinhart.getProductFromOrderGuide(spokenProductName, sessionAttributes.customerID);
        console.log('resolved products: ' + JSON.stringify(resolvedProducts));

        if (resolvedProducts === null) {
            sessionAttributes.yesNoKey = 'relatedCatalogue';
            return handlerInput.responseBuilder
                .speak('I\'m sorry, I was not able to find any product matching ' + spokenProductName + ' in your order guide. Would you like me to search in the catalogue?')
                .reprompt('I\'m sorry, I was not able to find any product matching ' + spokenProductName + ' in your order guide. Would you like me to search in the catalogue?')
                .getResponse();
        }

        sessionAttributes.productIndex = 0;
        sessionAttributes.orderGuideExhausted = false;
        sessionAttributes.resolvedProducts = resolvedProducts;
        sessionAttributes.productDenies = 0;

        const descriptionLength = getDescriptionLength(resolvedProducts, sessionAttributes.productIndex);
        productDescription = parseDescription(resolvedProducts[sessionAttributes.productIndex].DescriptionTranslated, descriptionLength);
        console.log("------------------this product description is " + productDescription);
        sessionAttributes.fullDescription = resolvedProducts[sessionAttributes.productIndex];
        sessionAttributes.productDescription = productDescription;
        sessionAttributes.yesNoKey = 'orderConfirmation';
        return handlerInput.responseBuilder
            // .addConfirmSlotDirective('spokenProductName')
            .speak('I found ' + productDescription + ' in your order guide. Is this what you want to order?')
            .reprompt('I found ' + productDescription + ' in your order guide. Is this what you want to order?')
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MakeOrderIntent'
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && (handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === 'DENIED' || !handlerInput.requestEnvelope.request.intent.slots.quantity.value);
    },
    async handle(handlerInput) {
        console.log('entered product confirmation handler');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const intent = handlerInput.requestEnvelope.request.intent;
        const spokenProductName = intent.slots.spokenProductName.value;
        const quantity = intent.slots.quantity.value;
        const productConfirmation = intent.slots.spokenProductName.confirmationStatus;

        sessionAttributes.intentState = 1;
        let resolvedProducts = sessionAttributes.resolvedProducts;
        sessionAttributes.productConfirmation = productConfirmation;
        sessionAttributes.spokenProductName = spokenProductName;
        sessionAttributes.quantity = quantity;

        if (productConfirmation === 'DENIED') {
            console.log('product was denied');
            intent.slots.spokenProductName.confirmationStatus = 'NONE';
            sessionAttributes.productDenies++;
            sessionAttributes.productIndex++;

            if (sessionAttributes.productDenies === 1) {
                // user has denied the first product so we are going to ask them if they want to hear more related items
                const itemsLeft = sessionAttributes.resolvedProducts.length - sessionAttributes.productIndex;

                if (itemsLeft > 1 && sessionAttributes.orderGuideExhausted !== true) {
                    sessionAttributes.yesNoKey = 'relatedOrderGuide';
                    const speakOutput = 'I found ' + itemsLeft + ' other items related to ' + spokenProductName + ' in your order guide. Would you like me to go through them?';
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }
            }

            if (sessionAttributes.productIndex >= resolvedProducts.length) {
                if (sessionAttributes.orderGuideExhausted === true) {
                    // user has reached the end of our related products list from the catalogue so we need them to just say a more specific product.
                    sessionAttributes.orderGuideExhausted = false;
                    return handlerInput.responseBuilder
                        .speak('I found no other items related to ' + spokenProductName + ' in the catalogue. Please state a new product name, or contact customer service to add your desired product.')
                        .reprompt('I found no other items related to ' + spokenProductName + ' in the catalogue. Please state a new product name, or contact customer service to add your desired product.')
                        .addElicitSlotDirective('spokenProductName', {
                            name: 'MakeOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                spokenProductName: {
                                    name: 'spokenProductName',
                                    value: undefined,
                                    confirmationStatus: 'NONE'
                                },
                                quantity: {
                                    name: 'quantity',
                                    value: quantity
                                }
                            }
                        })
                        .getResponse();

                } else {
                    // user has reached the end of our related products list from the order guide so we need to ask if we should search the catalogue
                    sessionAttributes.yesNoKey = 'relatedCatalogue';
                    return handlerInput.responseBuilder
                        .speak('I found no other items related to ' + spokenProductName + ' in your order guide. Would you like me to search in the catalogue?')
                        .reprompt('I found no other items related to ' + spokenProductName + ' in your order guide. Would you like me to search in the catalogue?')
                        .getResponse();
                }
            }

            // read off the next closest related product to the user
            const descriptionLength = getDescriptionLength(resolvedProducts, sessionAttributes.productIndex);
            const productDescription = parseDescription(resolvedProducts[sessionAttributes.productIndex].DescriptionTranslated, descriptionLength);
            sessionAttributes.productDescription = productDescription;
            sessionAttributes.fullDescription = resolvedProducts[sessionAttributes.productIndex];
          
            sessionAttributes.yesNoKey = 'orderConfirmation';
            return handlerInput.responseBuilder
                .speak('How about ' + productDescription + '?')
                .reprompt('How about ' + productDescription + '?')
                // .addConfirmSlotDirective('spokenProductName')
                .getResponse();

        }

        // product confirmation was confirmed
        return handlerInput.responseBuilder
            .speak('How many cases would you like?')
            .reprompt('How many cases would you like?')
            .addElicitSlotDirective('quantity',
                {
                    name: 'MakeOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: 'spokenProductName',
                            value: intent.slots.spokenProductName.value,
                            confirmationStatus: 'CONFIRMED'
                        },
                        quantity: {
                            name: 'quantity',
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MakeOrderIntent'
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.quantity.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === 'CONFIRMED';
    },
    async handle(handlerInput) {
        console.log('entered product quantity given handler');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const intent = handlerInput.requestEnvelope.request.intent;
        const slots = intent.slots;
        const productToAdd = sessionAttributes.resolvedProducts[sessionAttributes.productIndex];
        const quantity = intent.slots.quantity.value;
        const spokenProductName = intent.slots.spokenProductName.value;
        const productDescription = sessionAttributes.productDescription;
        sessionAttributes.intentState = 1;

        if (isNaN(quantity) || !Number.isInteger(parseInt(quantity)) || quantity < 1 || quantity > 100) {
            console.log('quantity is invalid');
            slots.quantity = undefined;
            return handlerInput.responseBuilder
                .speak('You did not provide a valid quantity. Please provide a new quantity between 1 and 100.')
                .reprompt('How many cases would you like?')
                .addElicitSlotDirective('quantity',
                    {
                        name: 'MakeOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: 'spokenProductName',
                                value: spokenProductName,
                                confirmationStatus: 'CONFIRMED'
                            },
                            quantity: {
                                name: 'quantity',
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
                    .speak('I\'m sorry, something went wrong when I tried creating an order for you. ' +
                        'Please try going online to complete your order, or contact customer service for assistance.')
                    .reprompt('What would you like to do?')
                    .getResponse();
            }
        }

        const addToOrderResult = await reinhart.addToOrder(orderInfo.orderNumber, productToAdd, quantity);
        if (!addToOrderResult) {
            // add to order function ran into an error
            return handlerInput.responseBuilder
                .speak('Im sorry, something went wrong when I tried adding to your shopping cart. ' +
                    'Please try going online to complete your order, or contact customer service for assistance.')
                .reprompt('What would you like to do?')
                .getResponse();
        }

        sessionAttributes.spokenProductName = undefined;
        sessionAttributes.resolvedProducts = undefined;
        sessionAttributes.productIndex = undefined;
        sessionAttributes.productDenies = undefined;
        sessionAttributes.productConfirmation = undefined;
        sessionAttributes.productDescription = undefined;
        sessionAttributes['MakeOrderIntent'] = undefined;
        sessionAttributes.intentState = 0;
        sessionAttributes.fullDescription = undefined;
        sessionAttributes.yesNoKey = 'orderMore';
        let speakOutput = '';
        if (quantity > 1) {
            speakOutput += 'I added ' + quantity + ' cases of ' + productDescription + ' to your cart. Would you like to order anything else?'
        } else {
            speakOutput += 'I added ' + quantity + ' case of ' + productDescription + ' to your cart. Would you like to order anything else?'
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Would you like to order anything else?')
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SubmitOrderIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'NONE';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrderInfo = await reinhart.getPendingOrderInfo(sessionAttributes.customerID); // hardcoded customerID
        sessionAttributes.intentState = 2;

        if (pendingOrderInfo === null) {
            // there is no pending order and therefore no items in the customer's cart
            return handlerInput.responseBuilder
                .speak('There are no items in your shopping cart to submit. Please start a new order before attempting to submit again.')
                .reprompt('What would you like to do?')
                .getResponse();
        }
        
        const allItems = await reinhart.getOrderContents(pendingOrderInfo.orderNumber);
        if (allItems === null) {
            return handlerInput.responseBuilder
             .speak("You do not have any items in your shopping cart to submit. Please add an item to your order before attempting to submit again.")
             .reprompt("What else can I help you with today?")
             .getResponse();
        }                

        const deliveryDate = parseDate(await reinhart.getNextDeliveryDate(sessionAttributes.customerID));
        const orderContents = await reinhart.getOrderContents(pendingOrderInfo.orderNumber);
        const numberOfItems = orderContents.length;

        let speechOutput = '';
        if (numberOfItems === 1) {
            speechOutput += 'You have ' + numberOfItems + ' item in your cart that can be delivered on ' + deliveryDate +
                '. Would you like to hear the contents of this order before submitting?';
        } else {
            speechOutput += 'You have ' + numberOfItems + ' items in your cart that can be delivered on ' + deliveryDate +
                '. Would you like to hear the contents of this order before submitting?';
        }

        sessionAttributes.yesNoKey = 'listSubmit';
        sessionAttributes.pendingOrderNumber = pendingOrderInfo.orderNumber;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt('Would you like to hear the contents of your order before submitting?')
            .getResponse();
    }
};

/**
 * User has confirmed they would like to submit their order
 * */
const Complete_SubmitOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SubmitOrderIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'NONE';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const intent = handlerInput.requestEnvelope.request.intent;
        const pendingOrderInfo = await reinhart.getPendingOrderInfo(sessionAttributes.customerID); // hardcoded customerID
        sessionAttributes.intentState = 0;

        let speechOutput = '';
        if (intent.confirmationStatus === 'CONFIRMED') {
            const submitOrderResult = await reinhart.submitOrder(pendingOrderInfo.orderNumber, sessionAttributes.customerID); // hardcoded customerID
            if (submitOrderResult === null) {
                speechOutput += 'I\'m sorry, something went wrong when I tried submitting your order. ' +
                    'Please try going online to complete your order, or contact customer service for assistance.';

            } else {
                const deliveryDate = parseDate(submitOrderResult);
                speechOutput += 'I submitted your order. Thank you for shopping with Reinhart. What else can I help you with today?';
            }

        } else {
            speechOutput += 'What would you like to do?';
        }

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt('What would you like to do?')
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveItemIntent'
            && !handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        sessionAttributes.intentState = 4;

        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak('You do not have any items in your shopping cart to remove. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak('You do not have any items in your shopping cart to remove. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
                .getResponse();
        }

        return handlerInput.responseBuilder
            .addElicitSlotDirective('spokenProductName')
            .speak('Which item in your cart do you want to remove?')
            .reprompt('If you would like me to list the items in your shopping cart, say view my shopping cart, otherwise state the name of the product you wish to remove.')
            .getResponse();
    }
};

/**
 * User has provided a product in their cart that they wish to remove
 * */
const ProductGiven_RemoveItemIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveItemIntent'
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === 'NONE'
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
                .speak('You do not have any items in your shopping cart to remove. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak('You do not have any items in your shopping cart to remove. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
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
                                name: 'spokenProductName',
                                value: undefined,
                                confirmationStatus: 'NONE'
                            }
                        }
                    })
                .speak('I\'m sorry, I was not able to find a product matching ' + spokenProductName + ' in your shopping cart. Please state a new product or try being more specific.')
                .reprompt('Which item in your cart do you want to edit? Try to be as specific as possible.')
                .getResponse();
        }

        sessionAttributes.productInCart = productInCart;
        sessionAttributes.fullDescription = productInCart;
        sessionAttributes.orderNumber = pendingOrder.orderNumber;

        let speechOutput = '';
        if (productInCart.quantity > 1) {
            speechOutput += 'I found ' + productInCart.quantity + ' cases of ' + parseDescription(productInCart.DescriptionTranslated, 3) + ' in your cart. Is this the item you wish to remove?';
        } else {
            speechOutput += 'I found ' + productInCart.quantity + ' case of ' + parseDescription(productInCart.DescriptionTranslated, 3) + ' in your cart. Is this the item you wish to remove?';
        }

        sessionAttributes.yesNoKey = 'removeConfirmation';
        return handlerInput.responseBuilder
            //.addConfirmSlotDirective('spokenProductName')
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveItemIntent'
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus !== 'NONE'
    },
    async handle(handlerInput) {
        const intent = handlerInput.requestEnvelope.request.intent;
        const spokenProductName = intent.slots.spokenProductName.value;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const productInCart = sessionAttributes.productInCart;
        const orderNumber = sessionAttributes.orderNumber;
        sessionAttributes.intentState = 4;

        if (intent.slots.spokenProductName.confirmationStatus === 'DENIED') {
            return handlerInput.responseBuilder
                .speak('Which item in your cart would you like to remove then?')
                .reprompt('Which item in your cart do you want to remove? Try to be as specific as possible.')
                .addElicitSlotDirective('spokenProductName',
                    {
                        name: 'RemoveItemIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: 'spokenProductName',
                                value: undefined,
                                confirmationStatus: 'NONE'
                            }
                        }
                    })
                .getResponse();
        }

        let speechOutput = '';
        const removeProductResult = await reinhart.removeProduct(orderNumber, productInCart.ProductNumber);
        if (removeProductResult) {
            speechOutput += 'I removed ' + parseDescription(productInCart.DescriptionTranslated, 3) + ' from your cart. What else can I help you with today?';
        } else {
            speechOutput += 'I\'m sorry, something went wrong when I tried removing the item from your cart. Please try going online to complete the removal process.';
        }
        sessionAttributes.intentState = 0;
        sessionAttributes['RemoveItemIntent'] = undefined;
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ClearOrderContentsIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'NONE';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        sessionAttributes.intentState = 4;

        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak('You do not have any items in your shopping cart to remove. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak('You do not have any items in your shopping cart to remove. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
                .getResponse();
        }

        sessionAttributes.orderNumber = pendingOrder.orderNumber;
        const numberOfItems = allItems.length;

        let speechOutput = '';
        if (numberOfItems > 1) {
            speechOutput += 'You have ' + numberOfItems + ' items in your cart. Are you sure you would like to remove them all?';
        } else {
            speechOutput += 'You have ' + numberOfItems + ' item in your cart. Are you sure you would like to remove it?';
        }

        return handlerInput.responseBuilder
            .addConfirmIntentDirective('ClearOrderContentsIntent')
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ClearOrderContentsIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'NONE';
    },
    async handle(handlerInput) {
        const intent = handlerInput.requestEnvelope.request.intent;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const orderNumber = sessionAttributes.orderNumber;
        sessionAttributes.intentState = 0;

        let speechOutput = '';
        if (intent.confirmationStatus === 'DENIED') {
            speechOutput += 'I did not clear your cart. What else can I help you with today?'
        } else {
            const clearOrderResult = await reinhart.clearOrderContents(orderNumber);
            if (clearOrderResult) {
                speechOutput += 'I removed all items from your cart. What else can I help you with today?'
            } else {
                speechOutput += 'I\'m sorry, something went wrong when I tried to clear your cart. Please try going online to complete this process.'
            }
        }

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt('What else can I help you with today?')
            .getResponse();
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'EditOrderIntent'
            && !handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        sessionAttributes.intentState = 3;

        if (pendingOrder === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak('You do not have any items in your shopping cart to edit. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak('You do not have any items in your shopping cart to edit. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
                .getResponse();
        }

        return handlerInput.responseBuilder
            .addElicitSlotDirective('spokenProductName')
            .speak('Which item in your cart do you want to edit?')
            .reprompt('If you would like to me list the items in your shopping cart, say view my shopping cart, otherwise state the name of the product you wish to edit.')
            .getResponse();
    }
};

/**
 * User has provided a product in their cart that they wish to edit
 * */
const ProductGiven_EditOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'EditOrderIntent'
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === 'NONE'
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
                .speak('You do not have any items in your shopping cart to edit. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
                .getResponse();
        }

        const allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        if (allItems === null) {
            sessionAttributes.intentState = 0;
            return handlerInput.responseBuilder
                .speak('You do not have any items in your shopping cart to edit. What else can I help you with today?')
                .reprompt('What else can I help you with today?')
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
                                name: 'spokenProductName',
                                value: undefined,
                                confirmationStatus: 'NONE'
                            },
                            newQuantity: {
                                name: 'newQuantity',
                                value: newQuantity
                            }
                        }
                    })
                .speak('I\'m sorry, I was not able to find a product matching ' + spokenProductName + ' in your shopping cart. Please state a new product or try being more specific.')
                .reprompt('Which item in your cart do you want to edit? Try to be as specific as possible.')
                .getResponse();
        }

        sessionAttributes.productInCart = productInCart;
        sessionAttributes.fullDescription = productInCart;
        sessionAttributes.orderNumber = pendingOrder.orderNumber;

        let speechOutput = '';
        if (productInCart.quantity > 1) {
            speechOutput += 'I found ' + productInCart.quantity + ' cases of ' + parseDescription(productInCart.DescriptionTranslated, 3) + ' in your cart. Is this the item you wish to edit?';
        } else {
            speechOutput += 'I found ' + productInCart.quantity + ' case of ' + parseDescription(productInCart.DescriptionTranslated, 3) + ' in your cart. Is this the item you wish to edit?';
        }

        sessionAttributes.yesNoKey = 'editConfirmation';
        return handlerInput.responseBuilder
            // .addConfirmSlotDirective('spokenProductName')
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'EditOrderIntent'
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

        if (intent.slots.spokenProductName.confirmationStatus === 'DENIED') {
            return handlerInput.responseBuilder
                .speak('Which item in your cart would you like to edit then?')
                .reprompt('Which item in your cart do you want to edit? Try to be as specific as possible.')
                .addElicitSlotDirective('spokenProductName',
                    {
                        name: 'EditOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: 'spokenProductName',
                                value: undefined,
                                confirmationStatus: 'NONE'
                            },
                            newQuantity: {
                                name: 'newQuantity',
                                value: newQuantity,
                                confirmationStatus: 'NONE'
                            }
                        }
                    })
                .getResponse();
        }
        if (intent.slots.spokenProductName.confirmationStatus === 'CONFIRMED') {

            return handlerInput.responseBuilder
                .speak('Please state a new quantity for ' + parseDescription(productInCart.DescriptionTranslated, 3) + '. Say zero to remove the item from your cart.')
                .reprompt('Please state a number for the new quantity for ' + parseDescription(productInCart.DescriptionTranslated, 3) + '. Say zero to remove the item from your cart.')
                .addElicitSlotDirective('newQuantity',
                    {
                        name: 'EditOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: 'spokenProductName',
                                value: intent.slots.spokenProductName.value,
                                confirmationStatus: 'CONFIRMED'
                            },
                            newQuantity: {
                                name: 'newQuantity',
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'EditOrderIntent'
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.value
            && handlerInput.requestEnvelope.request.intent.slots.newQuantity.value
            && handlerInput.requestEnvelope.request.intent.slots.spokenProductName.confirmationStatus === 'CONFIRMED';
    },
    async handle(handlerInput) {
        let intent = handlerInput.requestEnvelope.request.intent;
        let slots = intent.slots;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const productInCart = sessionAttributes.productInCart;
        const orderNumber = sessionAttributes.orderNumber;
        const newQuantity = intent.slots.newQuantity.value;
        sessionAttributes.intentState = 3;

        if (isNaN(newQuantity) || !Number.isInteger(parseInt(newQuantity)) || newQuantity < 0 || newQuantity > 100) {
            return handlerInput.responseBuilder
                .speak('You did not provide a valid quantity. Please provide a new quantity between 0 and 100.')
                .reprompt('Please state a number for the new quantity for ' + parseDescription(productInCart.DescriptionTranslated, 3) + '. Say zero to remove the item from your cart.')
                .addElicitSlotDirective('newQuantity',
                    {
                        name: 'EditOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            spokenProductName: {
                                name: 'spokenProductName',
                                value: intent.slots.spokenProductName.value,
                                confirmationStatus: 'CONFIRMED'
                            },
                            newQuantity: {
                                name: 'newQuantity',
                                value: undefined
                            }
                        }
                    })
                .getResponse();
        }

        let speechOutput = '';
        if (parseInt(intent.slots.newQuantity.value) !== 0) {
            const updateQuantityResult = await reinhart.updateQuantity(orderNumber, productInCart.ProductNumber, intent.slots.newQuantity.value);
            if (updateQuantityResult) {
                if (intent.slots.newQuantity.value > 1) {
                    speechOutput += 'Your cart now contains ' + intent.slots.newQuantity.value + ' cases of ' + parseDescription(productInCart.DescriptionTranslated, 3) + '. Would you like to edit anything else?';
                } else {
                    speechOutput += 'Your cart now contains ' + intent.slots.newQuantity.value + ' case of ' + parseDescription(productInCart.DescriptionTranslated, 3) + '. Would you like to edit anything else?';
                }
            } else {
                speechOutput += 'I\'m sorry, something went wrong when I tried editing your cart. Please try going online to finish editing your cart.';
            }
        } else {
            const removeProductResult = await reinhart.removeProduct(orderNumber, productInCart.ProductNumber);
            if (removeProductResult) {
                speechOutput += 'I removed ' + parseDescription(productInCart.DescriptionTranslated, 3) + ' from your cart. Would you like to edit anything else in your cart?';
            } else {
                speechOutput += 'I\'m sorry, something went wrong when I tried removing the item from your cart. Please try going online to complete the removal process.';
            }
        }

        sessionAttributes.yesNoKey = 'editMore';
        slots.newQuantity.value = undefined;
        slots.spokenProductName.value = undefined;
        sessionAttributes['EditOrderIntent'] = undefined;
        sessionAttributes.productInCart = undefined;
        sessionAttributes.intentState = 0;
        console.log('edit order intent is ');
        console.log(intent);
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt('Would you like to edit anything else in your cart?')
            .getResponse();
    }

};



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//---===============================================================---------Small Functions---------===================================---------
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Shows the user the delivery contents of all order items combined for the next delivery date
 * 
 */
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
            const numItems = allItems.length;
            const deliveryDate = parseDate(await reinhart.getNextDeliveryDate(sessionAttributes.customerID));
            if (numItems > 3) {
                sessionAttributes.itemsToReadIndex = 0;
                sessionAttributes.allItems = allItems;
                itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                speakOutput = 'You have ' + numItems + ' items being delivered on ' + deliveryDate + ': ' + stringifyItemList(itemsToRead) + '. Would you like to hear more?'
                sessionAttributes.yesNoKey = 'listDelivery';

            } else {
                if (numItems === 1) {
                    speakOutput = 'You have ' + numItems + ' item being delivered on ' + deliveryDate + ': ' + stringifyItemList(allItems) + '. What else can I help you with today?';
                } else {
                    speakOutput = 'You have ' + numItems + ' items being delivered on ' + deliveryDate + ': ' + stringifyItemList(allItems) + '. What else can I help you with today?';
                }

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
            speakOutput = 'Your shopping cart is empty. Start an order to begin adding to it.';

        } else {

            let allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);

            if (allItems !== null) {
                let itemsToRead;
                const numItems = allItems.length;
                if (numItems > 3) {
                    sessionAttributes.itemsToReadIndex = 0;
                    sessionAttributes.allItems = allItems;
                    itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                    speakOutput = 'There are ' + numItems + ' items in your cart: ' + stringifyItemList(itemsToRead) + '. Would you like to hear more?'
                    sessionAttributes.yesNoKey = 'listPending';
                } else {
                    sessionAttributes.intentState = 0;
                    if (numItems === 1) {
                        speakOutput = 'There is ' + numItems + ' item in your cart: ' + stringifyItemList(allItems) + '. What else can I help you with today?';
                    } else {
                        speakOutput = 'There are ' + numItems + ' items in your cart: ' + stringifyItemList(allItems) + '. What else can I help you with today?';
                    }
                }
            } else {
                sessionAttributes.intentState = 0;
                speakOutput = 'Your shopping cart is empty, start an order to begin adding to it. What else can I do for you today?';
            }
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const FindOrderItemIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FindOrderItemIntent'
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const intent = handlerInput.requestEnvelope.request.intent;
        const slots = intent.slots;
        const customerID = sessionAttributes.customerID;
        const spokenProductName = slots.spokenProductName.value;

        const pendingOrder = await reinhart.getPendingOrderInfo(customerID);
        const orderNumber = pendingOrder.orderNumber;

        let speakOutput = '';

        if (pendingOrder === null) {
            speakOutput += 'Your shopping cart is empty, start an order to begin adding to it. What else can I do for you today?';
        } else if (await reinhart.getOrderContents(orderNumber) === null) {
            speakOutput += 'Your shopping cart is empty, start an order to begin adding to it. What else can I do for you today?'
        } else {
            const orderItemFound = await reinhart.getOrderItemFromOrder(orderNumber, spokenProductName, customerID);
            if (orderItemFound === null) {
                speakOutput += 'No, I did not find a product matching ' + spokenProductName + ' in your order. Would you like to order it?'
                sessionAttributes.spokenProductName = spokenProductName;
                sessionAttributes.yesNoKey = 'orderItemFound'
            } else {
                const itemName = parseDescription(orderItemFound.DescriptionTranslated, 3);
                const quantity = orderItemFound.quantity;
                speakOutput += 'Yes, I found ' + quantity + ' cases of ' + itemName + ' in your cart. What else can I help you with today?';
            }
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'YesNoIntent'
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const key = sessionAttributes.yesNoKey;
        sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
        const answer = resolveEntity(slots, 'answer');
        let currentIntent;
        switch (key) {
            case 'orderMore':
                return yesNo_orderMore(handlerInput, answer, sessionAttributes);
            case 'submitOrder':
                return yesNo_submitOrder(handlerInput, answer, sessionAttributes);
            case 'listSubmit':
                return yesNo_listSubmit(handlerInput, answer, sessionAttributes);
            case 'listMoreSubmit':
                return yesNo_listMoreSubmit(handlerInput, answer, sessionAttributes);
            case 'editMore':
                return yesNo_editMore(handlerInput, answer, sessionAttributes);
            case 'relatedOrderGuide':
                return yesNo_relatedOrderGuide(handlerInput, answer, sessionAttributes);
            case 'listPending':
                return yesNo_listPending(handlerInput, answer, sessionAttributes);
            case 'listDelivery':
                return yesNo_listDelivery(handlerInput, answer, sessionAttributes);
            case 'relatedCatalogue':
                return yesNo_relatedCatalogue(handlerInput, answer, sessionAttributes);
            case 'orderConfirmation':
                currentIntent = sessionAttributes['MakeOrderIntent'];
                return yesNo_itemConfirmation(handlerInput, answer, sessionAttributes, currentIntent);
            case 'removeConfirmation':
                currentIntent = sessionAttributes['RemoveItemIntent'];
                return yesNo_itemConfirmation(handlerInput, answer, sessionAttributes, currentIntent);
            case 'editConfirmation':
                currentIntent = sessionAttributes["EditOrderIntent"];
                return yesNo_itemConfirmation(handlerInput, answer, sessionAttributes, currentIntent);
            case 'orderItemFound':
                return yesNo_orderItemFound(handlerInput, answer, sessionAttributes);
            default:
                // there was an error and we have an invalid yesNoKey
                sessionAttributes.intentState = 0;
                let speakOutput = 'I\'m sorry, something went wrong';
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse();
        }
    }
}



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//---===============================================================---------Helpers---------===================================-----------------
//=====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


/**
 * Parses the ISO delivery date format into a more digestible format for the user
 * */
const parseDate = (deliveryDate) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let trimmedDate = deliveryDate.slice(0, 10);
    trimmedDate = trimmedDate.split('-');
    const year = parseInt(trimmedDate[0]);
    let month = parseInt(trimmedDate[1]);
    month = months[month - 1];
    let day = parseInt(trimmedDate[2]);

    if (day > 10 && day < 14) {
        day = day + 'th';
    } else {
        let mod = day % 10;
        if (mod === 1) {
            day = day + 'st';
        } else if (mod === 2) {
            day = day + 'nd';
        } else if (mod === 3) {
            day = day + 'rd';
        } else {
            day = day + 'th';
        }
    }

    return month + ' ' + day + ', ' + year;
}

/**
 * Takes in a list of order items and stringifies them 
 * into a digestible, string list format to be read off
 * */
const stringifyItemList = (orderItems) => {
    let stringList = '';
    for (var i = 0; i < orderItems.length; i++) {
        const quantity = orderItems[i].quantity;
        const descriptionLength = getDescriptionLength(orderItems, i);
        const productName = parseDescription(orderItems[i].DescriptionTranslated, descriptionLength);
        if (i === 0) {
            stringList += '';
        }
        else if (i === orderItems.length - 1) {
            if (orderItems.length === 2) {
                stringList += ' and ';
            } else {
                stringList += ', and ';
            }
        }
        else {
            stringList += ', ';
        }

        if (quantity === 1) {
            stringList += quantity + ' case of ' + productName
        } else {
            stringList += quantity + ' cases of ' + productName
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

    let parsedDescription = parseDescription(descriptionTranslated, 100);
    let toReturn = '';
    let parsedPackSize = parsePackSize(packSize);

    if (parsedPackSize.length === 1) {
        toReturn += parsedPackSize[0];
    } else if (parsedPackSize.length === 2) {
        toReturn += parsedPackSize[0] + ' ' + mapUnit(parsedPackSize[1]) + ' ';
    } else {
        toReturn += parsedPackSize[0] + ' pack ' + parsedPackSize[1] + ' ' + mapUnit(parsedPackSize[2]) + ' ';
    }

    toReturn += parsedDescription + ' from ' + brandTranslated;
    toReturn = toReturn.toLowerCase();
    console.log('stringified product: ' + toReturn);
    return toReturn;
}

/**
 * maps different abbreviations that are used when describing an item
 * to full english words
 * */
const mapUnit = (unit) => {
    console.log('unit to map: ' + unit);
    switch (unit.toUpperCase()) {
        case 'CNT':
            return 'count';
        case 'LB':
            return 'pound';
        case 'GAL':
            return 'gallon';
        case 'OZ':
            return 'ounce';
        case 'ML':
            return 'millileter';
        case 'DZ':
            return 'dozen';
        case 'LBS':
            return 'pound';
        case 'GM':
            return 'gram';
        case 'L':
            return 'liter';
        case 'UP':
            return 'unit price';
        default:
            return unit;
    }
}

/**
 * Decides what length the parsed description of an item should be.
 * Usually it is three words, but if in a list of products, multiple products have the same first 3 words, then
 * we will parse to four words so the user can tell the getProductsDifference
 * */
const getDescriptionLength = (products, index) => {
    let descriptionOne = parseDescription(products[index].DescriptionTranslated, 3);
    for (let i = 0; i < products.length; i++) {
        let descriptionTwo = parseDescription(products[i].DescriptionTranslated, 3);
        if (i !== index && descriptionOne === descriptionTwo) {
            return 4;
        }
    }
    return 3;
}

/**
 * Takes an items full description and cuts it down to the first three or four numWords
 * 
 * param: descriptionTranslated, numWords
 * return: parsed description 
 * */
const parseDescription = (descriptionTranslated, numWords) => {
    let toReturn = '';
    let splitDescription = descriptionTranslated.split(' ');
    descriptionTranslated = '';
    for (var j = 0; j < splitDescription.length - 1 && j < numWords - 1; j++) {
        descriptionTranslated += splitDescription[j] + ' ';
    }
    descriptionTranslated += splitDescription[j];

    if (j < splitDescription.length - 1 && (!isNaN(splitDescription[j]) || splitDescription[j].toLowerCase() === 'and')) {
        descriptionTranslated += ' ' + splitDescription[j + 1];
    }

    for (let i = 0; i < descriptionTranslated.length; i++) {
        switch (descriptionTranslated.charAt(i)) {
            case '"':
                toReturn += ' inch';
                break;
            case '&':
                toReturn += 'and';
                break;
            default:
                toReturn += descriptionTranslated.charAt(i);
                break;
        }
    }
    console.log('parsed description: toReturn ' + toReturn);
    return toReturn.toLowerCase();
}

/**
 * Takes the packsize information of an item and parses it into a digestible string format
 * 
 * param: packSize
 * return: the parsed pack size
 * */
const parsePackSize = (packSize) => {
    const splitNumerics = packSize.match(/[a-z]+|[^a-z]+/gi);
    const splitCounts = splitNumerics[0].split('/');
    let splitPackSize;
    if (splitCounts[1] === '') {
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
    console.log('pack size array [' + splitPackSize + ']');
    return splitPackSize;
}

/**
 * Takes in an array of order guide products and an array of catalogue products. 
 * We will check to see which products from the catalogue products are not in the order guide products.
 * We will return these products as a new array.
 * 
 * param: orderGuideProducts, catalogueProducts
 * return: an array of resolvedProducts
 * */
const getProductsDifference = (orderGuideProducts, catalogueProducts) => {
    let resolvedProducts = [];
    for (let catalogueProduct in catalogueProducts) {
        let shouldPush = true;
        for (let orderGuideProduct in orderGuideProducts) {
            if (catalogueProducts[catalogueProduct].ProductNumber.toString() === orderGuideProducts[orderGuideProduct].ProductNumber.toString()) {
                shouldPush = false;
            }
        }
        if (shouldPush) {
            resolvedProducts.push(catalogueProducts[catalogueProduct]);
        }
    }
    if (resolvedProducts.length === 0) {
        return null;
    }
    return resolvedProducts;
}



/**
 * Resolves multivalued slots based on what a user says.
 * For example, if a user says 'nope', this would get resolved to 'no'.
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

/**
 * Handles a user saying yes or no to adding more items to their cart
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
function yesNo_orderMore(handlerInput, answer, sessionAttributes) {
    let speakOutput = '';
    let reprompt = '';
    if (answer === 'yes') {
        // user would like to add more to their order
        speakOutput += 'What would you like to order?';
        reprompt += speakOutput;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .addElicitSlotDirective('spokenProductName',
                {
                    name: 'MakeOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: 'spokenProductName',
                            value: undefined,
                            confirmationStatus: 'NONE'
                        },
                        quantity: {
                            name: 'quantity',
                            value: undefined,
                            confirmationStatus: 'NONE'
                        }
                    }
                })
            .getResponse();
    }
    else if (answer === 'no') {
        // prompt user if they would like to route to submit order intent
        speakOutput += 'Would you like to submit this order?';
        reprompt += speakOutput;
        sessionAttributes.yesNoKey = 'submitOrder';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
    else {
        // there was an error--this is here for debugging purposes
        speakOutput += 'I\'m sorry, something went wrong';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}

/**
 * Handles a user saying yes or no to submitting their order
 * 
 * param: handlerInput, answer
 * return: responseBuilder
 * */
function yesNo_submitOrder(handlerInput, answer) {
    let speakOutput = '';
    let reprompt = '';
    if (answer === 'yes') {
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
    else if (answer === 'no') {
        speakOutput += 'What would you like to do?';
        reprompt += speakOutput;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
    else {
        // there was an error--this is here for debugging purposes
        speakOutput += 'I\'m sorry, something went wrong.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}

/**
 * Handles a user saying yes or no to listing off the items in their order, before submitting
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
async function yesNo_listSubmit(handlerInput, answer, sessionAttributes) {
    let speakOutput = '';
    let reprompt = '';
    if (answer === 'yes') {
        const allItems = await reinhart.getOrderContents(sessionAttributes.pendingOrderNumber);
        if (allItems !== null) {
            let itemsToRead;
            const numItems = allItems.length;
            if (numItems > 3) {
                sessionAttributes.itemsToReadIndex = 0;
                sessionAttributes.allItems = allItems;
                itemsToRead = [allItems[sessionAttributes.itemsToReadIndex], allItems[sessionAttributes.itemsToReadIndex + 1], allItems[sessionAttributes.itemsToReadIndex + 2]];
                
                // read off first 3 items in order and ask if they want the rest listed off
                speakOutput += `There are ${numItems} items in your cart: ${stringifyItemList(itemsToRead)}. Would you like to hear more?`;
                reprompt += 'Would you like to hear more?';
                sessionAttributes.yesNoKey = 'listMoreSubmit';
            } else {
                // read off all items in order
                speakOutput += `You have ${stringifyItemList(allItems)} in your cart. Are you sure you would like to submit?`;
                reprompt += 'Are you sure you would like to submit?';
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(reprompt)
                    .addConfirmIntentDirective('SubmitOrderIntent')
                    .getResponse();
            }
        } else {
            speakOutput += 'I\'m sorry, something went wrong when I tried retrieving your order contents.';
            reprompt += speakOutput;
        }

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(reprompt)
          .getResponse();
    }
    else if (answer === 'no') {
        // user does not want items listed so just go ahead and submit
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
        speakOutput += 'I\'m sorry, something went wrong.'
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}

/**
 * Handles a user saying yes or no to listing additional items in their order
 * after listing the first three
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
function yesNo_listMoreSubmit(handlerInput, answer, sessionAttributes) {
    sessionAttributes.yesNoKey = undefined; // must always switch back to undefined
    let speakOutput = '';
    let reprompt = '';
    if (answer === 'yes') {
        let itemsToRead = [];
        let allItems = sessionAttributes.allItems;
        sessionAttributes.itemsToReadIndex += 3;
        const itemsLeftToRead = allItems.length - sessionAttributes.itemsToReadIndex;

        for (let i = 0; i < itemsLeftToRead && i < 3; i++) {
            itemsToRead[i] = allItems[sessionAttributes.itemsToReadIndex + i];
        }

        if (itemsLeftToRead > 3) {
            speakOutput += `There are ${itemsLeftToRead} other items in your cart: ${stringifyItemList(itemsToRead)}. Would you like to hear more?`;
            reprompt += 'Would you like to hear more?';
            sessionAttributes.yesNoKey = 'listMoreSubmit';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(reprompt)
                .getResponse();
        } else {
            sessionAttributes.itemsToReadIndex = undefined;
            sessionAttributes.allItems = undefined;
            speakOutput += `The rest of your cart contains ${stringifyItemList(itemsToRead)}. Are you sure you would like to submit?`;
            reprompt += 'Are you sure you would like to submit';
        }
    }
    else if (answer === 'no') {
        speakOutput += 'Are you sure you would like to submit?';
        reprompt += speakOutput;
    }
    else {
        // there was an error--this is here for debugging purposes
        speakOutput += 'I\'m sorry, something went wrong.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }

    return handlerInput.responseBuilder
        .addConfirmIntentDirective('SubmitOrderIntent')
        .speak(speakOutput)
        .reprompt(reprompt)
        .getResponse();
}

/**
 * Handles a user saying yes or no to listing additional items in their order
 * after listing the first three
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
function yesNo_listPending(handlerInput, answer, sessionAttributes) {
    let speakOutput = '';
    let reprompt = '';
    sessionAttributes.intentState = 0;
    if (answer === 'yes') {
        let itemsToRead = [];
        let allItems = sessionAttributes.allItems;
        sessionAttributes.itemsToReadIndex += 3;
        const itemsLeftToRead = allItems.length - sessionAttributes.itemsToReadIndex;

        for (let i = 0; i < itemsLeftToRead && i < 3; i++) {
            itemsToRead[i] = allItems[sessionAttributes.itemsToReadIndex + i];
        }

        if (itemsLeftToRead > 3) {
            speakOutput += `There are ${itemsLeftToRead} other items in your cart: ${stringifyItemList(itemsToRead)}. Would you like to hear more?`;
            reprompt += 'Would you like to hear more?';
            sessionAttributes.yesNoKey = 'listPending';
        } else {
            sessionAttributes.itemsToReadIndex = undefined;
            sessionAttributes.allItems = undefined;
            speakOutput += `The rest of your cart contains ${stringifyItemList(itemsToRead)}. What else can I do for you today?`;
            reprompt += 'What else can I do for you today?';
        }
    }
    else if (answer === 'no') {
        speakOutput += 'What else can I do for you today?';
        reprompt += speakOutput;
    }
    else {
        // there was an error--this is here for debugging purposes
        speakOutput += 'I\'m sorry, something went wrong.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }

    return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(reprompt)
        .getResponse();
}

/**
 * Handles a user saying yes or no to listing additional items in their delivery
 * after listing the first three
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
function yesNo_listDelivery(handlerInput, answer, sessionAttributes) {
    let speakOutput = '';
    let reprompt = '';
    sessionAttributes.intentState = 0;
    if (answer === 'yes') {
        let itemsToRead = [];
        let allItems = sessionAttributes.allItems;
        sessionAttributes.itemsToReadIndex += 3;
        const itemsLeftToRead = allItems.length - sessionAttributes.itemsToReadIndex;

        for (let i = 0; i < itemsLeftToRead && i < 3; i++) {
            itemsToRead[i] = allItems[sessionAttributes.itemsToReadIndex + i];
        }

        if (itemsLeftToRead > 3) {
            speakOutput += `There are ${itemsLeftToRead} other items in your next delivery: ${stringifyItemList(itemsToRead)}. Would you like to hear more?`;
            reprompt += 'Would you like to hear more?';
            sessionAttributes.yesNoKey = 'listDelivery';
        } else {
            sessionAttributes.itemsToReadIndex = undefined;
            sessionAttributes.allItems = undefined;
            speakOutput += `The rest of your next delivery contains ${stringifyItemList(itemsToRead)}. What else can I do for you today?`;
            reprompt += 'What else can I do for you today?';
        }
    }
    else if (answer === 'no') {
        speakOutput += 'What else can I do for you today?';
        reprompt += speakOutput;
    }
    else {
        // there was an error--this is here for debugging purposes
        speakOutput += 'I\'m sorry, something went wrong.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }

    return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(reprompt)
        .getResponse();
}

/**
 * Handles a user saying yes or no to going through additional items
 * in the catalogue when finding a product to order
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
async function yesNo_relatedCatalogue(handlerInput, answer, sessionAttributes) {
    let speakOutput = '';
    let reprompt = '';
    if (answer === 'yes') {
        const spokenProductName = sessionAttributes.spokenProductName;
        const orderGuideProducts = sessionAttributes.resolvedProducts;
        const catalogueProducts = await reinhart.getProductFromCatalogue(spokenProductName);
        const resolvedProducts = getProductsDifference(orderGuideProducts, catalogueProducts);
        sessionAttributes.orderGuideExhausted = true;
        sessionAttributes.resolvedProducts = resolvedProducts;
        sessionAttributes.productIndex = 0;
        sessionAttributes.productDenies = 0;

        if (resolvedProducts === null) {
            speakOutput += 'I\'m sorry, I was not able to find any related items in the catalogue. Please state a new product name for me to search.';
            reprompt += speakOutput;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(reprompt)
                .addElicitSlotDirective('spokenProductName', {
                    name: 'MakeOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: 'spokenProductName',
                            value: undefined,
                            confirmationStatus: 'NONE'
                        },
                        quantity: {
                            name: 'quantity',
                            value: undefined
                        }
                    }
                })
                .getResponse();
        }

        // user has indicated they would like to hear more related items from the catalogue so we will start listing them off
        const descriptionLength = getDescriptionLength(resolvedProducts, sessionAttributes.productIndex);
        const productDescription = parseDescription(resolvedProducts[sessionAttributes.productIndex].DescriptionTranslated, descriptionLength);
        sessionAttributes.productDescription = productDescription;

        if (resolvedProducts.length > 1) {
            speakOutput += `I found ${resolvedProducts.length} items related to ${spokenProductName} in the catalogue. The best match is ${productDescription}. Is this what you want to order?`;
        } else {
            speakOutput += `I found ${resolvedProducts.length} item related to ${spokenProductName} in the catalogue. The best match is ${productDescription}. Is this what you want to order?`;
        }
        
        sessionAttributes.yesNoKey = 'orderConfirmation';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();

    }
    else if (answer === 'no') {
        // user has indicated they do not want to hear more related items from the catalogue so we will ask them to state a more specific product name
        speakOutput += 'Please state a more specific product name for me to search.';
        reprompt += 'What would you like to order?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .addElicitSlotDirective('spokenProductName', {
                name: 'MakeOrderIntent',
                confirmationStatus: 'NONE',
                slots: {
                    spokenProductName: {
                        name: 'spokenProductName',
                        value: undefined,
                        confirmationStatus: 'NONE'
                    },
                    quantity: {
                        name: 'quantity',
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
            .speak('I\'m sorry, something went wrong.')
            .getResponse();
    }
}

/**
 * Handles a user saying yes or no to going through additional items in their guide
 * when finding a product to order
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
function yesNo_relatedOrderGuide(handlerInput, answer, sessionAttributes) {
    let speakOutput = '';
    let reprompt = '';
    if (answer === 'yes') {
        // user has indicated they would like to hear more related items in their order guide so we will read the next one off
        const resolvedProducts = sessionAttributes.resolvedProducts;
        const descriptionLength = getDescriptionLength(resolvedProducts, sessionAttributes.productIndex);
        const productDescription = parseDescription(resolvedProducts[sessionAttributes.productIndex].DescriptionTranslated, descriptionLength);
        sessionAttributes.productDescription = productDescription;

        speakOutput += `The next best match in your order guide is ${productDescription}. Is this what you want to order?`;
        reprompt += speakOutput;
        sessionAttributes.yesNoKey = 'orderConfirmation';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
    else if (answer === 'no') {
        // user has indicated they do not want to hear more related items in their order guide so we will ask them to state a more specific product name
        speakOutput += 'Please state a more specific product name for me to search.';
        reprompt += 'What would you like to order?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .addElicitSlotDirective('spokenProductName', {
                name: 'MakeOrderIntent',
                confirmationStatus: 'NONE',
                slots: {
                    spokenProductName: {
                        name: 'spokenProductName',
                        value: undefined,
                        confirmationStatus: 'NONE'
                    },
                    quantity: {
                        name: 'quantity',
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
            .speak('I\'m sorry, something went wrong.')
            .getResponse();
    }
}

/**
 * Handles a user saying yes or no to editing additional items in their cart
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
async function yesNo_editMore(handlerInput, answer, sessionAttributes) {
    let speakOutput = '';
    let reprompt = '';
    if (answer === 'yes') {
        const pendingOrder = await reinhart.getPendingOrderInfo(sessionAttributes.customerID);
        let allItems;
        if (pendingOrder !== null) {
            allItems = await reinhart.getOrderContents(pendingOrder.orderNumber);
        }

        if (allItems === undefined || allItems === null) {
            sessionAttributes.intentState = 0;
            speakOutput += 'You do not have any items in your shopping cart to edit. What else can I help you with today?';
            reprompt += 'What else can I do for you today?';
        } else {
            sessionAttributes.orderNumber = pendingOrder.orderNumber
            speakOutput += 'Which item in your cart do you want to edit?';
            reprompt += 'If you would like to me list the items in your shopping cart, say view my shopping cart, otherwise state the name of the product you wish to edit.'
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(reprompt)
                .addElicitSlotDirective('spokenProductName', {
                    name: 'EditOrderIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        spokenProductName: {
                            name: 'spokenProductName',
                            value: undefined,
                            confirmationStatus: 'NONE'
                        },
                        newQuantity: {
                            name: 'newQuantity',
                            value: undefined
                        }
                    }
                })
                .getResponse();
        }
    }
    else if (answer === 'no') {
        sessionAttributes.intentState = 0;
        speakOutput += 'What else can I help you with today?';
        reprompt += speakOutput;
    }
    else {
        // there was an error--this is here for debugging purposes
        sessionAttributes.intentState = 0;
        speakOutput += 'I\'m sorry, something went wrong';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }

    return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(reprompt)
        .getResponse();
}

/**
 * Handles a user saying yes or no to confirming that a suggested product
 * is what they would like to order
 * 
 * param: handlerInput, answer, sessionAttributes, currentIntent
 * return: responseBuilder
 * */
function yesNo_itemConfirmation(handlerInput, answer, sessionAttributes, currentIntent) {
    let speakOutput = '';
    if (answer === 'yes') {
        currentIntent.slots.spokenProductName.confirmationStatus = 'CONFIRMED';
    } 
    else if (answer === 'no') {
        currentIntent.slots.spokenProductName.confirmationStatus = 'DENIED';
    }
    else {
        // there was an error--this is here for debugging purposes
        sessionAttributes.intentState = 0;
        speakOutput += 'I\'m sorry, something went wrong';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }

    return handlerInput.responseBuilder
    .addDelegateDirective(currentIntent)
    .getResponse();
}

/**
 * Handles a user saying yes or no to ordering an item that we weren't able
 * to find in their order
 * 
 * param: handlerInput, answer, sessionAttributes
 * return: responseBuilder
 * */
function yesNo_orderItemFound(handlerInput, answer, sessionAttributes) {
    const spokenProductName = sessionAttributes.spokenProductName
    let speakOutput = '';
    let reprompt = '';
    if (answer === 'yes') {
        return handlerInput.responseBuilder
          .addDelegateDirective( {
                name: 'MakeOrderIntent',
                confirmationStatus: 'NONE',
                slots: {
                    spokenProductName: {
                        name: 'spokenProductName',
                        value: spokenProductName,
                        confirmationStatus: 'NONE'
                    },
                    quantity: {
                        name: 'quantity',
                        value: undefined
                    }
                },
                dialogState: 'IN_PROGRESS'
            })
            .getResponse();
    }
    else if (answer === 'no') {
        speakOutput += 'What would you like to do?';
        reprompt += speakOutput;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(reprompt)
          .getResponse();
    }
    else {
        // there was an error--this is here for debugging purposes
        sessionAttributes.intentState = 0;
        speakOutput += 'I\'m sorry, something went wrong';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}

/**
 * Clears all session attributes used while the skill is running
 * */
function clearSessionAttributes(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.spokenProductName = undefined;
        sessionAttributes.resolvedProducts = undefined;
        sessionAttributes.productIndex = undefined;
        sessionAttributes.productDenies = undefined;
        sessionAttributes.productConfirmation = undefined;
        sessionAttributes.productDescription = undefined;
        sessionAttributes.intentState = 0;
        sessionAttributes.fullDescription = undefined;
        sessionAttributes.yesNoKey = "orderMore";
        sessionAttributes.yesNoKey = "editMore";
        sessionAttributes.productInCart = undefined;
        sessionAttributes.intentState = 0;
        sessionAttributes["MakeOrderIntent"] = undefined;
        sessionAttributes["RemoveItemIntent"] = undefined;
        sessionAttributes["EditOrderIntent"] = undefined;
        sessionAttributes["FindOrderItemIntent"] = undefined;
        sessionAttributes["SubmitOrderIntent"] = undefined;
        sessionAttributes["ItemDescriptionIntent"] = undefined;
        sessionAttributes["ViewNextDeliveryContents"] = undefined;
        sessionAttributes["ClearOrderContents"] = undefined;
        sessionAttributes["ViewPendingOrderContents"] = undefined;
}


//====================================================================================================================================================
//---===============================================================---------defaults---------===================================-------------------
//====================================================================================================================================================

/**
 * Avaliable so the user can ask for help at any time. 
 * This intent will provide a specific message to the user based on where they are in the dialogue
 * */
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
                speakOutput = 'In Reinhart\'s Alexa app you can quickly add, edit, view, and remove items from your shopping cart. You can also submit an order for your next delivery date. Say help at any point to get assistance.';
                break;
            case 1:
                speakOutput = 'Say your keyword or the product name that you want to order. Alexa will then prompt you for a quantity. You can only add one product at a time, please follow Alexa\'s prompts.';
                break;
            case 2:
                speakOutput = 'To submit this order say submit order then follow along with Alexa\'s response\'s.';
                break;
            case 3:
                speakOutput = 'Say your keyword or the product name that you want to edit. Alexa will then ask for a new quantity. Say zero to remove the product from your cart. You cannot remove or edit submitted orders using the Alexa app, please use the website to do so.';
                break;
            case 4:
                speakOutput = 'Say your keyword or the product name that you want to remove. Alexa will then remove it from your shopping cart. You cannot remove or edit submitted orders using the Alexa app, please use Reinhart\'s website to do so.';
                break;
            default:
                speakOutput = 'error in help';
        }

        sessionAttributes.intentState = 0;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to do?')
            .getResponse();
    }
};

/**
 * This intent is to be used by the user when they want to quit out of the Alexa app entirely
 * */
const StopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Thank you for shopping with Reinhart. Please come again!';
        clearSessionAttributes(handlerInput);
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};

/**
 * This intent is to be used by the user when they want to exit the intent 
 * they are currently in 
 * */
const CancelIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent');
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        clearSessionAttributes(handlerInput);

        const speakOutput = 'What would you like to do? Say goodbye to close the app.';

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
 * session is closed for one of the following reasons: 1) The user says 'exit' or 'quit'. 2) The user does not 
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

        console.log(error);

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

        ItemDescriptionIntentHandler,

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
        FindOrderItemIntentHandler,
        ItemDescriptionIntentHandler,

        HelpIntentHandler,
        CancelIntentHandler,
        StopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)

    .addRequestInterceptors(
        DialogManagementStateInterceptor)

    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        DialogManagementStateInterceptor
    )
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();