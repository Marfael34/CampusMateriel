const stock = db.getSiblingDB("campus_materiel");

// 1. Test d'existence des collections (incluant "paniers")
if (stock.getCollectionNames().some(nom => ["users", "produits", "reservations", "counters", "paniers"].includes(nom))) {
    throw new Error("initialisation interrompue: les collections existent déjà");
}

// 2. Collection : counters (gestion de l'auto-incrémentation des _id entiers)
stock.createCollection("counters", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "seq"],
            additionalProperties: false,
            properties: {
                _id: { bsonType: "string", minLength: 1, maxLength: 50 },
                seq: { bsonType: "int", minimum: 0 }
            }
        }
    }
});

// 3. Collection : users
stock.createCollection("users", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "nom", "prenom", "email", "password", "tel", "role"],
            additionalProperties: false,
            properties: {
                _id: { bsonType: "int", minimum: 1 },
                nom: { bsonType: "string", minLength: 2, maxLength: 50 },
                prenom: { bsonType: "string", minLength: 2, maxLength: 50 },
                email: { bsonType: "string", minLength: 5, maxLength: 100 },
                password: { bsonType: "string", minLength: 60, maxLength: 255 },
                tel: { bsonType: "string", minLength: 10, maxLength: 10, pattern: "^[0-9]{10,15}$" },
                role: {
                    bsonType: "array",
                    minItems: 1,
                    maxItems: 3,
                    uniqueItems: true,
                    items: {
                        bsonType: "string",
                        maxLength: 15,
                        enum: ["etudiant", "enseignant", "admin"]
                    }
                }
            }
        }
    }
});

// 4. Collection : produits
stock.createCollection("produits", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "nom", "description", "quantiteTotale", "disponibilite"],
            additionalProperties: false,
            properties: {
                _id: { bsonType: "int", minimum: 1 },
                nom: { bsonType: "string", minLength: 2, maxLength: 100 },
                description: { bsonType: "string"},
                quantiteTotale: { bsonType: "int", minimum: 0 },
                disponibilite: { bsonType: "bool" }
            }
        }
    }
});

// 5. Collection : reservations (Extended Reference Pattern + validation dateFin > dateDebut)
stock.createCollection("reservations", {
    validator: {
        $and: [
            {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["_id", "dateDebut", "dateFin", "statut", "user_id", "produits"],
                    additionalProperties: false,
                    properties: {
                        _id: { bsonType: "int", minimum: 1 },
                        dateDebut: { bsonType: "date" },
                        dateFin: { bsonType: "date" },
                        statut: {
                            bsonType: "string",
                            maxLength: 15,
                            enum: ["en_attente", "validee", "en_cours", "terminee", "annulee", "refusee"]
                        },
                        user_id: { bsonType: "int", minimum: 1 },
                        produits: {
                            bsonType: "array",
                            minItems: 1,
                            maxItems: 50,
                            items: {
                                bsonType: "object",
                                required: ["_id", "nom", "quantite"],
                                additionalProperties: false,
                                properties: {
                                    _id: { bsonType: "int", minimum: 1 },
                                    nom: { bsonType: "string", minLength: 2, maxLength: 100 },
                                    quantite: { bsonType: "int", minimum: 1 }
                                }
                            }
                        }
                    }
                }
            },
            {
                $expr: { $gt: ["$dateFin", "$dateDebut"] }
            }
        ]
    }
});

// 6. Collection : paniers (Gestion des paniers actifs par utilisateur)
stock.createCollection("paniers", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "user_id", "produits"],
            additionalProperties: false,
            properties: {
                _id: { bsonType: "int", minimum: 1 },
                user_id: { bsonType: "int", minimum: 1 },
                produits: {
                    bsonType: "array",
                    minItems: 0,
                    maxItems: 50,
                    items: {
                        bsonType: "object",
                        required: ["_id", "nom", "quantite"],
                        additionalProperties: false,
                        properties: {
                            _id: { bsonType: "int", minimum: 1 },
                            nom: { bsonType: "string", minLength: 2, maxLength: 100 },
                            quantite: { bsonType: "int", minimum: 1 }
                        }
                    }
                }
            }
        }
    }
});

// 7. Création des index uniques et composés
stock.users.createIndex({ email: 1 }, { unique: true });
stock.reservations.createIndex({ user_id: 1, dateDebut: -1 });
stock.reservations.createIndex({ "produits._id": 1, dateDebut: 1, dateFin: 1 });
stock.reservations.createIndex({ statut: 1, dateDebut: -1 });
stock.paniers.createIndex({ user_id: 1 }, { unique: true });

// 8. Données de test (Seed)
stock.users.insertMany([
    // Mots de passe de test :
    // Admin (id 1) : Admin2026
    // Lucas (id 2) : Milo52
    // Eric  (id 3) : Histoire201
    {
        _id: Int32(1),
        nom: "Admin",
        prenom: "Campus",
        email: "admin@campus.fr",
        password: "$2b$10$W1GMlGxq0alVNlgd59LeFu.gztJwoSdHFzvVWV2HAHMFitJK4va4q",
        tel: "0415421530",
        role: ["admin", "enseignant"]
    },
    {
        _id: Int32(2),
        nom: "Martin",
        prenom: "Lucas",
        email: "lucas.martin@etudiant.campus.fr",
        password: "$2b$10$9pSv96GQz20Lq5MpHRudheQ0Xgp4kwiHUIkcu2kz./MrcgpNP5pwy",
        tel: "0762154202",
        role: ["etudiant"]
    },
    {
        _id: Int32(3),
        nom: "Mejean",
        prenom: "eric",
        email: "eric.mejean@enseignant.campus.fr",
        password: "$2b$10$BBM/NsfNA3JU.2xwwdoRKuRNhtbu0BSxQ9UALzF8KI93jGBmRVm5a",
        tel: "0647201215",
        role: ["enseignant"]
    }
]);

stock.produits.insertMany([
    {
        _id: Int32(1),
        nom: "Caméra Sony FX30",
        description: "Caméra cinéma Super 35 4K",
        quantiteTotale: Int32(3),
        disponibilite: true
    },
    {
        _id: Int32(2),
        nom: "Micro Rode NTG5",
        description: "Microphone canon directionnel",
        quantiteTotale: Int32(5),
        disponibilite: true
    },
    {
        _id: Int32(3),
        nom: "Trépied Manfrotto 504X",
        description: "Trépied vidéo fluide aluminium",
        quantiteTotale: Int32(2),
        disponibilite: false
    }
]);

stock.reservations.insertMany([
    {
        _id: Int32(1),
        dateDebut: new Date("2026-11-16T09:00:00Z"),
        dateFin: new Date("2026-11-18T17:00:00Z"),
        statut: "validee",
        user_id: Int32(2),
        produits: [
            { _id: Int32(1), nom: "Caméra Sony FX30", quantite: Int32(1) },
            { _id: Int32(2), nom: "Micro Rode NTG5", quantite: Int32(2) }
        ]
    }
]);

// 9. Initialisation des compteurs au dernier _id inséré
stock.counters.insertMany([
    { _id: "users", seq: Int32(3) },
    { _id: "produits", seq: Int32(3) },
    { _id: "reservations", seq: Int32(1) },
    { _id: "paniers", seq: Int32(0) }
]);

print("Initialisation de campus_materiel terminée avec succès.");