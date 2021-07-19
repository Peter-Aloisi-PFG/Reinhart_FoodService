//database storage and requries
const fs = require("fs");
const Util = require('./util.js');


//------------------------------------DATABASE API-----------------------------------------------------

async function debugViewOrders() {
    var orderData = await Util.getJSON("orders.json")
    console.log("Order data is : " + orderData); // Success
}

async function debugViewProducts() {
    var orderData = await Util.getJSON("products.json")
    console.log("products data is : " + orderData); // Success
}

async function debugViewCustomers() {
    var orderData = await Util.getJSON("customers.json")
    console.log("customers data is : " + orderData); // Success
}

/*
/    starts an order using the customers customer ID
/    
/    args: customerID
/    return: orderNumber, deliveryDate
*/
async function startOrder(customerID) {
    var orderData = await Util.getJSON("orders.json")

    //connect to service and create the order 
    orderData.length++;
    const orderNumber = orderData.length;
    let newOrder = {
        orderNumber: orderNumber,
        customerID: customerID,
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
/    args: orderNumber, productID, quantity, productName
/
/    return: true if successful, false if not
*/
async function addToOrder(orderNumber, productID, quantity, productName) {
    var orderData = await Util.getJSON("orders.json");
    var foundOrder = false;

    for (let i = 0; i < 5; i++) {
        for (var key in orderData.orders) {
            if (orderData.orders[key].orderNumber === orderNumber) {
                let orderItem = {
                    productID: productID,
                    quantity: quantity,
                    productName: productName
                }
                orderData.orders[key].orderItem.push(orderItem);
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
    
    if(!foundOrder){
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
/   args: customerID
/
/   return orderNumber if a pending order is found, null if not
*/
async function getPendingOrderInfo(customerID) {
    var orderData = await Util.getJSON("orders.json");
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderStatus === 0) {
            console.log("found pending order");
            if (orderData.orders[key].customerID === customerID) {
                var orderNumber = orderData.orders[key].orderNumber;
                var orderStatus = orderData.orders[key].orderStatus;
                return { orderNumber };
            }
        }
    }
    console.log("did not find pending order");
    return null;
}

/*
/    Gets a product from the catalogue based on the spoken name used for the product.
/    For example: "chicken tenders". We will return the full product name for the item along
/    with the productID
/    
/    args: spokenProductName 
/    return: resolvedProductName, resolvedProductID
*/
async function getProductFromCatalogue(spokenProductName) {
    var foodData = await Util.getJSON("products.json");
    var resolvedProductInfo;
    for (var key in foodData.products) {
        if (foodData.products[key].commonName === spokenProductName) {
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

/*
/    Gets a product from the customers orderguide based on the spoken product name for the item.
/    For example: "chicken tenders". We will return the full product name for the item along
/    with the productID
/    
/    args: customerID, spokenProductName 
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
/    args: orderNumber, spokenProductName
/
/    return: resolvedProductName, resolvedProductID, quantity
*/
async function getOrderItemFromOrder(orderNumber, productID) {
    var customerID = 1;
    var orderData = await Util.getJSON("orders.json");
    let foundOrder = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            if (orderData.orders[key].orderStatus === 0) {
                for (var key2 in orderData.orders[key].orderItem) {
                    if (orderData.orders[key].orderItem[key2].productID === productID) {
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
/    args: customerID 
/    return: list of orderNumbers
*/
async function getNextDeliveryOrderNumbers(customerID) {
    var orderData = await Util.getJSON("orders.json");
    var orderNumbers = [];
    var i = 0;
    for (var key in orderData.orders) {
        if (orderData.orders[key].custID === customerID) {
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
/    args: orderNumber, productID, newQuantity 
/    return: true if successful, false if not
*/
async function updateQuantity(orderNumber, productID, newQuantity) {
    var orderData = await Util.getJSON("orders.json");
    var foundProduct = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            console.log("found order");
            for (var key2 in orderData.orders[key].orderItem) {
                if (orderData.orders[key].orderItem[key2].productID === productID) {
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
/    Updates the product in a customer's order to something else.
/    For example: 10pc chicken tenders -> 10pc chicken nuggets.
/    
/    args: orderNumber, productID, newProductID 
/    return: productName, productID
*/
async function updateProduct(orderNumber, productID, newProductID) {
    var orderData = await Util.getJSON("orders.json");
    var foundProduct = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            for (var key2 in orderData.orders[key].orderItem) {
                if (orderData.orders[key].orderItem[key2].productID === productID) {
                    orderData.orders[key].orderItem[key2].productID = newProductID;
                 //   orderData.orders[key].orderItem.splice(key2, 1);
                    foundProduct = true;
                    break;
                }
            }
            break;
        }
    }

    if (!foundProduct) {
        console.log("could not find product in order--unable to update product");
        return false;
    }

    Util.uploadJSON("orders.json", orderData);
    console.log("completed updatProduct");
    return true;
}

/*
/    Removes the product from the given order
/    
/    args: orderNumber, productID
/    return: success true/false
*/
async function removeProduct(orderNumber, productID) {
    var orderData = await Util.getJSON("orders.json");
    var foundProduct = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].orderNumber === orderNumber) {
            for (var key2 in orderData.orders[key].orderItem) {
                if (orderData.orders[key].orderItem[key2].productID === productID) {
                    var array = orderData.orders[key].orderItem;
                    array.splice(key2,1);
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
    console.log("completed remove product");
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
/    args: orderNumber and customerID
/
/    return: the delivery date for the order if successful, null if unsuccessful
*/
async function submitOrder(orderNumber, customerID) {
    var orderData = await Util.getJSON("orders.json");
    const deliveryDate = await getNextDeliveryDate(customerID);
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

    await Util.uploadJSON("orders.json", orderData);
    var confirmation = true;
    console.log("completed submit order");
    return deliveryDate;
}

/*
/    Cancels a customers next delivery
/    
/    args: customerID 
/
/    return: true if successful, false if not
*/
async function cancelNextDelivery(customerID) {
    var orderData = await Util.getJSON("orders.json");
    var nextDeliv = await getNextDeliveryDate(customerID);

    var foundOrder = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].customerID === customerID) {
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
  return nextDate;
}

/*
/    Gets upcoming delivery dates for a customer
/    
/    args: customerID 
/    return: the customer's nextDeliveryDate in ISO format
*/
async function getNextDeliveryDate(customerID) {
    let customerData = await Util.getJSON("customers.json");
    let foundCustomer = false;
    for (var key in customerData.customers) {
        if (customerData.customers[key].customerID === customerID) {
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
/    args: customerID, spokenProductName 
/    return: associated orderItem in the delivery (includes full product name, quantity, etc.)
*/
async function getOrderItemFromNextDelivery(customerID, spokenProductName) {
    var orderData = await Util.getJSON("orders.json");
    var date = await getNextDeliveryDate(customerID);
    let foundOrder = false;
    for (var key in orderData.orders) {
        if (orderData.orders[key].customerID === customerID) {
            if (orderData.orders[key].deliveryDate === date) {
                for (var key2 in orderData.orders[key].orderItem) {
                    if (orderData.orders[key].orderItem[key2].productName === spokenProductName) {
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
            for(var key2 in orderData.orders[key].orderItem){
                    allItems.push(orderData.orders[key].orderItem[key2]);
                    foundSomething = true;
            }
            
        }
    }
        if(!foundSomething){
            console.log("could not find product and/or customer--unable to get order contents");
            return null;
        }
        console.log("completed get order contents");
        return allItems;
}

/*
/    Gets the contents of a customers next delivery
/    
/    args: customerID
/    return: list of orderItems
*/
async function getNextDeliveryContents(customerID) {

    var orderData = await Util.getJSON("orders.json");
    var date = await getNextDeliveryDate(customerID);
    let foundOrder = false;
    var allItems = [];
    for (var key in orderData.orders) {
        if (orderData.orders[key].customerID === customerID) {
            if (orderData.orders[key].deliveryDate === date) {
                if(orderData.orders[key].orderStatus !== 0 ){
                    for(var key2 in orderData.orders[key].orderItem){
                        allItems.push(orderData.orders[key].orderItem[key2]);
                        foundOrder = true;
                    }
                }
            }
        }
    }
    
    console.log(debugViewOrders());
    if(!foundOrder){
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