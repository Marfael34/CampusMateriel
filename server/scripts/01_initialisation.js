const stock = db.getSiblingDB("stock_mongo");

// test d'existance des collections 
if(stock.getCollectionNames().some(nom => ["users", "produits", "reservations"].includes(nom))){
    throw new Error("initialisation interrompue: les collections existent déjà");
}

// users 
stock.createCollection("users", {
    validator: {$jsonSchema: {
        bsonType:
    }}
})