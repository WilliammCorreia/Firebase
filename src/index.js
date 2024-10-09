// Pour executer le code : npx webpack serve ou npm run dev

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import 'dotenv/config'

console.warn("Petit test tu connais!");

// const firebaseConfig = {
//     apiKey: "AIzaSyC09F0Qwuk3yJYV9DRknyXusPXtmnTV1_8",
//     authDomain: "b3-firebase-dc478.firebaseapp.com",
//     projectId: "b3-firebase-dc478",
//     storageBucket: "b3-firebase-dc478.appspot.com",
//     messagingSenderId: "366377741179",
//     appId: "1:366377741179:web:6d8532bacbf7fc1a36abde",
//     measurementId: "G-4S0HXXL46W",
//     // databaseURL: "https://b3-firebase-dc478.europe-west1.firebasedatabase.app"
// };

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId,
    // databaseURL: "https://b3-firebase-dc478.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// La liste des factures de ma bdd
let factures = [];
async function getFactures(db) {
    const facturesCol = collection(db, 'factures');
    const facturesSnapshot = await getDocs(facturesCol);

    facturesSnapshot.docs.map((doc) => { //.map c'est comme forEach
        let finalDoc = doc.data();
        finalDoc.id = doc.id;
        factures.push(finalDoc);

        //factures.push({...doc.data(), id : doc.id});
    });

    return factures;
}

const table = document.getElementById("table");
const ligne = [];
let cellule;

// Afficher les factures sous forme de tableau
function showFactures() {
    getFactures(db);

    console.log("Mes factures juste ici -> ", factures)

    for (let i = 0; i < factures.length; i++) {
        ligne[i] = table.insertRow(i);

        // Numéro de la facture
        cellule = ligne[i].insertCell(0);
        cellule.innerHTML = factures[i].number;

        // Status de la facture
        cellule = ligne[i].insertCell(1);
        cellule.innerHTML = factures[i].status;

        // Date de la facture
        cellule = ligne[i].insertCell(2);
        if (factures[i].date) {
            cellule.innerHTML = factures[i].date.toDate().toString().slice(3, 25);
        } else {
            cellule.innerHTML = "-";
        }
    }

    console.log("Les factures viennent d'être affichées.");
}

document.querySelector("#addFacture").addEventListener('submit', async (event) => {
    event.preventDefault();

    let number = document.querySelector("#number").value;
    let statue = document.querySelector("#status").value;

    if (number !== "" && statue !== "") {

        await addDoc(collection(db, "factures"), {
            number: number,
            status: statue,
            date: serverTimestamp()
        });

        for (let i = 0; i < factures.length; i++) {
            table.deleteRow(0);
        }

        factures = [];
        await getFactures(db);
        for (let i = 0; i < factures.length; i++) {
            ligne[i] = table.insertRow(i);

            // Numéro de la facture
            cellule = ligne[i].insertCell(0);
            cellule.innerHTML = factures[i].number;

            // Status de la facture
            cellule = ligne[i].insertCell(1);
            cellule.innerHTML = factures[i].status;

            // Date de la facture
            cellule = ligne[i].insertCell(2);
            if (factures[i].date) {
                cellule.innerHTML = factures[i].date.toDate().toString().slice(3, 25);
            } else {
                cellule.innerHTML = "-";
            }
        }
        console.log(factures);

    } else {
        alert("J'ai rien récupéré là ???");
    }
});

let taille = factures.length;

// onSnapshot(collection(db, "factures"), (querySnapshot) => {

//     console.log('Je test si ça fonctionne');
// });

showFactures();