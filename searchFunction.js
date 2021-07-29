function getBigrams(str) {
    const bigrams = new Set();
    const length = str.length;
    for (let i = 0; i < length - 1; i++) {
        const bigram = str.slice(i, i + 2);
        bigrams.add(bigram);
    }
    return bigrams;
}

function intersect(set1, set2) {
    const intersection = new Set();
    set1.forEach(value => {
        if (set2.has(value)) {
            intersection.add(value);
        }
    });
    return intersection;
}

function diceCoefficient(str1, str2) {
    const bigrams1 = getBigrams(str1);
    const bigrams2 = getBigrams(str2);
    return (2 * intersect(bigrams1, bigrams2).size) / (bigrams1.size + bigrams2.size);
}
const products = [  {
  "ProductNumber": "AB056",
  "PackSize": "2/4+ Lb",
  "BrandTranslated": "Dietz & Watson",
  "DescriptionTranslated": "Corned Beef Cooked Single Briskit Refrigerated"
},
{
  "ProductNumber": "C9356",
  "PackSize": "25/Lbs",
  "BrandTranslated": "Icicle Seafood",
  "DescriptionTranslated": "Crab Dungeness Cluster Frozen"
},
{
  "ProductNumber": "A1336",
  "PackSize": "12/8 Oz",
  "BrandTranslated": "Westminster Crackers",
  "DescriptionTranslated": "Cracker Oyster Bulk"
},
{
  "ProductNumber": 69692,
  "PackSize": "20/22 Oz",
  "BrandTranslated": "Bonici",
  "DescriptionTranslated": "Crust Pizza 16\" Thick Partial Baked Small Edge Round Neopolitan Frozen"
},
{
  "ProductNumber": "E5824",
  "PackSize": "1000/Cnt",
  "BrandTranslated": "A&W",
  "DescriptionTranslated": "Cup Paper Cold 16 Ounce 2006 A&W"
},
{
  "ProductNumber": "P0630",
  "PackSize": "18/50Cnt",
  "BrandTranslated": "Pactiv",
  "DescriptionTranslated": "Cup Plastic Sundae 5 Ounce Parfait Dish Clear"
},
{
  "ProductNumber": "KF212",
  "PackSize": "16/Oz",
  "BrandTranslated": "Packer Gourmet Foodservice Group Direct Ship",
  "DescriptionTranslated": "Curry Sesame Seed(Ed) Dry Delivers Within 3-5 Business Days"
},
{
  "ProductNumber": 54036,
  "PackSize": "250/Cnt",
  "BrandTranslated": "Jet Plastica",
  "DescriptionTranslated": "Cutlery Kit Plastic Polystyrene Heavy Weight Knife Fork Spoon Salt & Pepper Black"
},
{
  "ProductNumber": 73314,
  "PackSize": "24/Cnt",
  "BrandTranslated": "Carlisle",
  "DescriptionTranslated": "Dallas Ware Platter Plastic Melamine Oval 12X8.5 Cafe Blue"
},
{
  "ProductNumber": "E6792",
  "PackSize": "36/Cnt",
  "BrandTranslated": "International Tableware",
  "DescriptionTranslated": "Danube Plate 7.25\" Blue Speckle"
},
{
  "ProductNumber": "F3334",
  "PackSize": "500/Cnt",
  "BrandTranslated": "Lapaco",
  "DescriptionTranslated": "Doilie Paper Floral Linen 8"
},
{
  "ProductNumber": "L6872",
  "PackSize": "50/Lb",
  "BrandTranslated": "Pillsbury",
  "DescriptionTranslated": "Dough Mix Sweet Pan Dulce Base"
},
{
  "ProductNumber": "L4096",
  "PackSize": "120/Cnt",
  "BrandTranslated": "Rich's Products",
  "DescriptionTranslated": "Dough Roll Cinnamon Freezer To Oven 2.5 Ounce Frozen"
},
{
  "ProductNumber": 64124,
  "PackSize": "36/10Oz",
  "BrandTranslated": "Erbert & Gerbert",
  "DescriptionTranslated": "Dough Substitute Mini White Frozen Erbert And Gerbert"
},
{
  "ProductNumber": "C5188",
  "PackSize": "6/64Oz",
  "BrandTranslated": "Orchard Splash",
  "DescriptionTranslated": "Drink Bar Mix Strawberry 2+1"
},
{
  "ProductNumber": "V4994",
  "PackSize": "4/1Gal",
  "BrandTranslated": "Sun Orchard",
  "DescriptionTranslated": "Drink Margarita Mix Ultra Light(Ly) Pasturized Refrigerated"
},
{
  "ProductNumber": 75148,
  "PackSize": "4/Gal",
  "BrandTranslated": "Finest Call",
  "DescriptionTranslated": "Drink Margarita Ready To Use Mix"
},
{
  "ProductNumber": "AW074",
  "PackSize": "15/Dz",
  "BrandTranslated": "Sparboe Eggs",
  "DescriptionTranslated": "Egg Shell On Brown Large Grade A Refrigerated"
},
{
  "ProductNumber": "NP036",
  "PackSize": "12/6 Cnt",
  "BrandTranslated": "Mccormick Foods",
  "DescriptionTranslated": "Extract Strawberry 1 Ounce"
},
{
  "ProductNumber": "ML524",
  "PackSize": "4/5 Lb",
  "BrandTranslated": "Grillman's",
  "DescriptionTranslated": "Frank Beef Footlong Frozen"
},
{
  "ProductNumber": "AP306",
  "PackSize": "6/5 Lb",
  "BrandTranslated": "Simplot",
  "DescriptionTranslated": "French Fry Thin Cut 5/16\" Advantage Frozen Restaurant Pride"
},
{
  "ProductNumber": "HP200",
  "PackSize": "6/6 Lb",
  "BrandTranslated": "The Munch Box",
  "DescriptionTranslated": "Fries 3/8\" Straight Cut Coated  Frozen"
},
{
  "ProductNumber": "DJ344",
  "PackSize": "6/5 Lb",
  "BrandTranslated": "Roma",
  "DescriptionTranslated": "Fries 5/16\" Thin Straight Cut Extra Long Fancy Frozen"
},
{
  "ProductNumber": "JB466",
  "PackSize": "96/4 Oz",
  "BrandTranslated": "Davenport Usda (School Commodity)",
  "DescriptionTranslated": "Fruit Cup Mixed Berry Frozen"
},
{
  "ProductNumber": "KE152",
  "PackSize": "6/Cnt",
  "BrandTranslated": "Shiloh Farms Direct Ship",
  "DescriptionTranslated": "Grain 6 Variety Dry Delivers Within 3-5 Business Days"
},
{
  "ProductNumber": "T5648",
  "PackSize": "1/Cnt",
  "BrandTranslated": "Carlisle",
  "DescriptionTranslated": "Handle 60\" Wood Tapered Handle"
},
{
  "ProductNumber": "K2160",
  "PackSize": "10/Lb",
  "BrandTranslated": "Fishery Products",
  "DescriptionTranslated": "Hoki Breaded Strip 1.5 Ounce Fresh Crumb Frozen"
},
{
  "ProductNumber": "L6040",
  "PackSize": "12/8 Oz",
  "BrandTranslated": "Cedar's Mediterranean Foods",
  "DescriptionTranslated": "Hummus Vegetable Refrigerated"
},
{
  "ProductNumber": 35060,
  "PackSize": "3/8Cnt",
  "BrandTranslated": "Blue Bunny",
  "DescriptionTranslated": "Ice Cream Chocolate Souffle Creme Torte Frozen"
},
{
  "ProductNumber": "V3942",
  "PackSize": "3/3.5 L",
  "BrandTranslated": "Growers Pride",
  "DescriptionTranslated": "Juice Lemonade 15% Concentrate 5+1 Yield 2129 Ounce Frozen"
},
{
  "ProductNumber": "B4048",
  "PackSize": "28/16 Oz",
  "BrandTranslated": "Schneider Valley Farms",
  "DescriptionTranslated": "Juice Orange 100% Refrigerated"
},
{
  "ProductNumber": 81886,
  "PackSize": "36/4.23",
  "BrandTranslated": "Juicey Juice",
  "DescriptionTranslated": "Juice Orange Tangerine 100%"
},
{
  "ProductNumber": 75460,
  "PackSize": "2/Gal",
  "BrandTranslated": "Jusmad",
  "DescriptionTranslated": "Juice Raspberry 35% Bag In Box Refrigerated"
},
{
  "ProductNumber": "A8714",
  "PackSize": "100/Cnt",
  "BrandTranslated": "Burger King",
  "DescriptionTranslated": "Kit Birthday Parchment Paper Plates Black 10C"
},
{
  "ProductNumber": 53928,
  "PackSize": "2/200Cnt",
  "BrandTranslated": "Hoffmaster",
  "DescriptionTranslated": "Kit Placemat/Napkin Velvet Poinsettia"
},
{
  "ProductNumber": "AM218",
  "PackSize": "1000/Cnt",
  "BrandTranslated": "D&W Fine Pack",
  "DescriptionTranslated": "Knife Plastic Polypropylene Medium Wrapped 7.2\" Black Senate"
},
{
  "ProductNumber": 55176,
  "PackSize": 15000,
  "BrandTranslated": "Philly Connection",
  "DescriptionTranslated": "Label Sandwich Pressure Sensitive P Acct"
},
{
  "ProductNumber": "HP396",
  "PackSize": "2500/Cnt",
  "BrandTranslated": "Prime Source",
  "DescriptionTranslated": "Lid Plastic Souffle Cup 2 Ounce Clear"
},
{
  "ProductNumber": "FF444",
  "PackSize": "4/1 Cnt",
  "BrandTranslated": "Carlisle",
  "DescriptionTranslated": "Lid Waste Can 23Gal Rectangle Trimline Swing Top Brown"
},
{
  "ProductNumber": "C4440",
  "PackSize": "50/50Cnt",
  "BrandTranslated": "Non Food Packer",
  "DescriptionTranslated": "Matches Plain White Book"
},
{
  "ProductNumber": "V8876",
  "PackSize": "18/Cnt",
  "BrandTranslated": "Sun Meadow",
  "DescriptionTranslated": "Meal Kit Ham/Cheese Sandwich Thaw & Serve  Frozen"
},
{
  "ProductNumber": 26324,
  "PackSize": "6/5 Lb",
  "BrandTranslated": "Pennsylvania Usda (School Commodity)",
  "DescriptionTranslated": "Meatball Beef .5 Ounce Fully Cooked Reduced Sodium Frozen"
},
{
  "ProductNumber": 67872,
  "PackSize": "10/Lbs",
  "BrandTranslated": "Rosina Food Products Inc",
  "DescriptionTranslated": "Meatball Gourmet Cooked With Romano And Ricotta Cheese Average 1Oz Frozen"
},
{
  "ProductNumber": "C3792",
  "PackSize": "6/3Lb",
  "BrandTranslated": "Farm Rich",
  "DescriptionTranslated": "Mushroom Breaded Frozen"
},
{
  "ProductNumber": "C0700",
  "PackSize": "24/4Oz",
  "BrandTranslated": "Empress",
  "DescriptionTranslated": "Mushroom Stems And Pieces"
},
{
  "ProductNumber": "L4218",
  "PackSize": "10/250",
  "BrandTranslated": "Georgia Pacific",
  "DescriptionTranslated": "Napkin Dinner Printed Lumberjack Adventure"
},
{
  "ProductNumber": "R8176",
  "PackSize": "8/125Cnt",
  "BrandTranslated": "Graphic Management Specialty Products",
  "DescriptionTranslated": "Napkin Linenaire 1/4 Fold 16.75X17 White"
},
{
  "ProductNumber": 50304,
  "PackSize": "20/10",
  "BrandTranslated": "Eagle Ridge",
  "DescriptionTranslated": "New York Strip 10Oz Steak Boneless Vein Banquet 1180 Refrigerated"
},
{
  "ProductNumber": 33462,
  "PackSize": "14/14Oz",
  "BrandTranslated": "Eagle Ridge",
  "DescriptionTranslated": "New York Strip 14 Ounce Boneless Prime Ultra Trim No Tail Jaccarded-Blade Tender 1X/2 Sets Needles;Nonintact Individual Cryovac Refrigerated"
},
{
  "ProductNumber": "R3836",
  "PackSize": "4/1 Gal",
  "BrandTranslated": "Ron Son Foods",
  "DescriptionTranslated": "Olive Manzanilla Stuffed 340-360 Count"
},
{
  "ProductNumber": "M2584",
  "PackSize": "6/#10Can",
  "BrandTranslated": "Lindsay Olives",
  "DescriptionTranslated": "Olive Ripe Slice Black Canned"
},
{
  "ProductNumber": "BP912",
  "PackSize": "10/Lb",
  "BrandTranslated": "Packer",
  "DescriptionTranslated": "Onion Sweet Fresh"
}]

function search(spokenProductName) {
    let chosenProduct = {
        "score": -1,
        "productString": ""
    }
    let chosenProducts = [chosenProduct, chosenProduct, chosenProduct, chosenProduct];
    console.log(chosenProducts.length);
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let productString = product.PackSize + " " + product.DescriptionTranslated + " " + product.BrandTranslated;
        let score = diceCoefficient(spokenProductName, productString);
        for (let j = 0; j < 4; j++) {
            if (score > chosenProducts[j].score) {
                for (let k = 4; k > j; k--) {
                    chosenProducts[k] = chosenProducts[k-1];
                }
                chosenProducts[j].score = score;
                chosenProducts[j].productString = productString;
               
                break;
            }
        }
    }
    return chosenProducts;
}
console.log(search("apples"));




