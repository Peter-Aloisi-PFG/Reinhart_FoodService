
//V .8


//database storage and requries
const fs = require("fs");
const Util = require('./util.js');


//------------------------------------DATABASE API-----------------------------------------------------

/*
/    starts an order using the customers customer ID
/    
/    parameters: customerID
/    return: orderNumber
*/
async function startOrder(customerNumber) {
    var orderData = await Util.getJSON("orders.json")

    //connect to service and create the order 
    orderData.length++;
    const orderNumber = orderData.length;
    let newOrder = {
        orderNumber: orderNumber,
        customerNumber: customerNumber,
        deliveryDate: undefined, // once the order is submitted it will be given a delivery date
        orderStatus: 0, //0 is for pending order, 1 is for submitted order, 2 is for archived/past date order
        numItems: 0,
        orderItem: []
    };

    orderData.orders.push(newOrder);
    await Util.uploadJSON("orders.json", orderData);
    console.log("Started Order"); // Success
    return { orderNumber };
}


/*
/    Adds an item to a customers order
/    
/    parameters: orderNumber, product, quantity
/
/    return: true if successful, false if not
*/
async function addToOrder(orderNumber, product, quantity) {
    var orderData = await Util.getJSON("orders.json");
    var foundOrder = false;
    for (let i = 0; i < 5; i++) {
        for (var key in orderData.orders) {
            if (orderData.orders[key].orderNumber === orderNumber) {
                console.log("order numbers matched");
                product["quantity"] = quantity; //add quantity attribute
                orderData.orders[key].orderItem.push(product);
                orderData.orders[key].numItems++;
                foundOrder = true;
                break;
            }
        }
        if (foundOrder === true) {
            break;
        }
        await sleep(1000);
        orderData = await Util.getJSON("orders.json");
    }

    if (!foundOrder) {
        console.log("did not find a matching order--unable to add product to order");
        return false;
    }

    await Util.uploadJSON("orders.json", orderData);
    console.log("added product to order");
    return true;
}

/*
/   Checks if there is a pending order and returns the pending order's order
/   info if one is found.
/
/   parameters: customerID
/
/   return orderNumber if a pending order is found, null if not
*/
async function getPendingOrderInfo(customerNumber) {
    var orderData = await Util.getJSON("orders.json");
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderStatus === 0) {
            if (orderData.orders[key].customerNumber === customerNumber) {
                console.log("found and returned pending order");
                var orderNumber = orderData.orders[key].orderNumber;
                return { orderNumber };
            }
        }
    }
    console.log("did not find pending order");
    return null;
}

/*   TODO implement search and refactor
/    Gets a product from the catalogue based on the spoken name used for the product.
/    For example: "chicken tenders". We will return the full product name for the item along
/    with the productID
/    
/    parameters: spokenLongDescription 
/    return: resolvedProductName, resolvedProductID
*/
async function getProductFromCatalogue(spokenLongDescription) {
    var foodData = await Util.getJSON("products.json");
    var resolvedProductInfo;
    console.log(foodData);
    for (var key in foodData.products) {
        //TODO implement search
        if (foodData.products[key].LongDescription === spokenLongDescription) {
            resolvedProductInfo = foodData.products[key];
        }
    }
    if (resolvedProductInfo === undefined) {
        console.log("did not find product in catalouge");
        return null;
    }

    const resolvedProductName = resolvedProductInfo.productName;
    const resolvedProductID = resolvedProductInfo.ID;
    console.log("found product in catalouge");
    return { resolvedProductName, resolvedProductID };
}

/*  TODO, implement from customers order guide and refactor
/    Gets a product from the customers orderguide based on the spoken product name for the item.
/    For example: "chicken tenders". We will return the full product name for the item along
/    with the productID
/    
/    parameters: customerID, spokenProductName 
/    return: resolvedProductName, resolvedProductID
*/
async function getProductFromOrderGuide(customerID, spokenProductName) {

    var foodData = await Util.getJSON("products.json");
    var resolvedProductInfo;
    for (var key in foodData.products) {
        if (foodData.products[key].commonName === spokenProductName) {
            resolvedProductInfo = foodData.products[key];
        }
    }

    if (resolvedProductInfo === undefined) {
        console.log("did not find product in order guide");
        return null;
    }

    let resolvedProductName = resolvedProductInfo.name;
    const resolvedProductID = resolvedProductInfo.ID;
    console.log("found product in order guide");
    return { resolvedProductName, resolvedProductID };
}

/*
/    Gets an order item from an existing order based on the order number and the
/    spoken product name
/    
/    parameters: orderNumber, spokenProductName
/
/    return: resolvedProductName, resolvedProductID, quantity
*/
async function getOrderItemFromOrder(orderNumber, productNumber) {
    var orderData = await Util.getJSON("orders.json");
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            console.log("found order ");
            if (orderData.orders[key].orderStatus === 0) {
                for (var key2 in orderData.orders[key].orderItem) {
                    if (orderData.orders[key].orderItem[key2].ProductNumber === productNumber) {
                        console.log("found orderItem from order");
                        return orderData.orders[key].orderItem[key2];
                    }
                }
            }
        }
    }
    console.log("couldn't find the product and/or customer--unable to get orderItem from order'");
    return null;
}

/*
/    Gets all the order numbers for the customers next delivery
/    
/    parameters: customerNumber 
/    return: list of orderNumbers
*/
async function getNextDeliveryOrderNumbers(customerNumber) {
    var orderData = await Util.getJSON("orders.json");
    var orderNumbers = [];
    var i = 0;
    for (var key in orderData.orders) {
        if (orderData.orders[key].customerNumber === customerNumber) {
            orderNumbers[i] = orderData.orders[key].orderNum;
            i++;
        }

        console.log("returned next delivery order numbers");
        return orderNumbers;
    }
}

/*
/    Updates the quantity of an order item in a customers order
/    
/    parameters: orderNumber, productNumber, newQuantity 
/    return: true if successful, false if not
*/
async function updateQuantity(orderNumber, productNumber, newQuantity) {
    console.log("my info is " + orderNumber + " " + productNumber + " " + newQuantity);
    var orderData = await Util.getJSON("orders.json");
    var foundProduct = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            console.log("found order");
            for (var key2 in orderData.orders[key].orderItem) {
                if (orderData.orders[key].orderItem[key2].ProductNumber === productNumber) {
                    console.log("found product");
                    orderData.orders[key].orderItem[key2].quantity = newQuantity;
                    foundProduct = true;
                    break;
                }
            }
            break;
        }
    }

    if (!foundProduct) {
        console.log("could not find product in order--unable to update quantity");
        return false;
    }

    Util.uploadJSON("orders.json", orderData);
    console.log("completed updateQuantity");
    return true;
}


/*
/    Removes the product from the given order
/    
/    parameters: orderNumber, productNumber
/    return: success true/false
*/
async function removeProduct(orderNumber, productNumber) {
    var orderData = await Util.getJSON("orders.json");
    var foundProduct = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            for (var key2 in orderData.orders[key].orderItem) {
                if (orderData.orders[key].orderItem[key2].ProductNumber === productNumber) {
                    var array = orderData.orders[key].orderItem;
                    array.splice(key2, 1);
                    orderData.orders[key].orderItem = array;
                    foundProduct = true;
                    break;
                }
            }
            break;
        }
    }

    if (!foundProduct) {
        console.log("could not find product and/or order--unable to remove product");
        return false;
    }
    await Util.uploadJSON("orders.json", orderData);
    console.log("did remove product");
    return true;
}

/*
/    Clears all contents of a given order
/    
/    args: orderNumber
/    return: success true/false
*/
async function clearOrderContents(orderNumber) {
    console.log("entered clear order");
    var orderData = await Util.getJSON("orders.json");
    console.log("order number to clear: " + orderNumber);
    var foundOrder = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            console.log("found an order number match");
            orderData.orders[key].orderItem = [];
            foundOrder = true;
            break;
        }
    }

    if (!foundOrder) {
        console.log("could not find order--unable to clear order contents");
        return false;
    }
    await Util.uploadJSON("orders.json", orderData);
    console.log("completed clear order contents");
    return true;
}


/*
/    Submits a pending order
/    
/    parameters: orderNumber and customerID
/
/    return: the delivery date for the order if successful, null if unsuccessful
*/
async function submitOrder(orderNumber, customerNumber) {
    var orderData = await Util.getJSON("orders.json");
    const deliveryDate = await getNextDeliveryDate(customerNumber);
    var foundOrder = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            if (orderData.orders[key].orderStatus !== 0) {
                console.log("error order already submitted or archived--unable to submit order")
                return false;
            }
            orderData.orders[key].orderStatus = 1;
            orderData.orders[key].deliveryDate = deliveryDate;
            foundOrder = true;
            break;
        }
    }

    if (!foundOrder) {
        console.log("could not find matching order--unable to submit order");
        return null;
    }

    //do other things to submit
    //

    await Util.uploadJSON("orders.json", orderData);
    console.log("completed submit order");
    return deliveryDate;
}

/*
/    Cancels a customers next delivery
/    
/    parameters: customerID 
/
/    return: true if successful, false if not
*/
async function cancelNextDelivery(customerNumber) {
    var orderData = await Util.getJSON("orders.json");
    var nextDeliv = await getNextDeliveryDate(customerNumber);
    var foundOrder = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].customerNumber === customerNumber) {
            if (orderData.orders[key].deliveryDate === nextDeliv) {
                orderData.orders.splice(key, 1);
                foundOrder = true;
            }
        }
    }

    if (!foundOrder) {
        console.log("could not find next delivery--unable to cancel next delivery");
        return false;
    }

    Util.uploadJSON("orders.json", orderData);
    console.log("completed cancel next delivery");
    return true;
}


//private helper method
function calculateDeliveryDay(deliveryDays) {
    let currentDay = new Date().getDay();
    let nextDay = -1;

    for (let day in deliveryDays) {
        if (deliveryDays[day] >= currentDay) {
            nextDay = deliveryDays[day];
            break;
        }
    }
    let offset;
    if (nextDay !== -1) {
        offset = nextDay - currentDay;
    } else {
        nextDay = deliveryDays[0];
        offset = 7 - currentDay + nextDay;
    }
    var nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + offset);
    nextDate.setHours(0, 0, 0, 0);
    nextDate = nextDate.toISOString();
    //console.log("next date" + nextDate);
    return nextDate;
}

/*
/    Gets upcoming delivery dates for a customer
/    
/    parameters: customerID 
/    return: the customer's nextDeliveryDate in ISO format
*/
async function getNextDeliveryDate(customerNumber) {
    let customerData = await Util.getJSON("customers.json");
    let foundCustomer = false;
    for (var key in customerData.customers) {
        if (customerData.customers[key].CustomerNumber === customerNumber) {
            foundCustomer = true;
            var deliveryDates = customerData.customers[key].deliveryDays;
        }
    }

    if (!foundCustomer) {
        console.log("did not find customer--unable to get next delivery date");
        return null;
    }

    var nextDeliveryDate = calculateDeliveryDay(deliveryDates);
    console.log("completed get next delivery date");
    return nextDeliveryDate;
}

/*
/    Gets a product from the customers next delivery
/    
/    parameters: customerID, spokenProductName 
/    return: associated orderItem in the delivery (includes full product name, quantity, etc.)
*/
async function getOrderItemFromNextDelivery(customerNumber, productNumber) {
    var orderData = await Util.getJSON("orders.json");
    var date = await getNextDeliveryDate(customerNumber);
    let foundOrder = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].customerNumber === customerNumber) {
            if (orderData.orders[key].deliveryDate === date) {
                for (var key2 in orderData.orders[key].orderItem) {
                    if (orderData.orders[key].orderItem[key2].ProductNumber === productNumber) {
                        console.log("completed get orderItem from next delivery");
                        return orderData.orders[key].orderItem[key2];
                    }
                }
            }
        }
    }
    console.log("couldnt find product and/or customer--unable to get orderItem from next delivery");
    return null;
}

/*
/    Gets the contents of a customers order based on the order number
/    
/    args: orderNumber
/    return: list of orderItems
*/
async function getOrderContents(orderNumber) {
    var orderData = await Util.getJSON("orders.json");
    var allItems = [];
    var foundSomething = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            for (var key2 in orderData.orders[key].orderItem) {
                allItems.push(orderData.orders[key].orderItem[key2]);
                foundSomething = true;
            }

        }
    }
    if (!foundSomething) {
        console.log("could not find product and/or customer--unable to get order contents");
        return null;
    }
    console.log("completed get order contents");
    return allItems;
}

/*
/    Gets the contents of a customers next delivery
/    
/    parameters: customerID
/    return: list of orderItems
*/
async function getNextDeliveryContents(customerNumber) {

    var orderData = await Util.getJSON("orders.json");
    var date = await getNextDeliveryDate(customerNumber);
    let foundOrder = false;
    var allItems = [];
    for (var key in orderData.orders) {
        if (orderData.orders[key].customerNumber === customerNumber) {
            if (orderData.orders[key].deliveryDate === date) {
                if (orderData.orders[key.orderStatus] !== 0) {
                    for (var key2 in orderData.orders[key].orderItem) {
                        allItems.push(orderData.orders[key].orderItem[key2]);
                        foundOrder = true;
                    }
                }
            }
        }
    }
    console.log(debugViewOrders());
    if (!foundOrder) {
        console.log("couldnt find product and/or customer--unable to get next delivery contents");
        return null;
    }

    console.log("completed get next delivery contents");
    return allItems;

}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


module.exports = { startOrder, addToOrder, getPendingOrderInfo, getProductFromCatalogue, getProductFromOrderGuide, getOrderItemFromOrder, getNextDeliveryOrderNumbers, updateQuantity, updateProduct, removeProduct, clearOrderContents, submitOrder, cancelNextDelivery, calculateDeliveryDay, getNextDeliveryDate, getOrderItemFromNextDelivery, getOrderContents, getNextDeliveryContents };
