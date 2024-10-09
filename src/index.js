// Pour executer le code : npx webpack serve ou npm run dev
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

console.warn("Petit test tu connais!");

// Configuration Firebase
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

// Afficher les factures sous forme de tableau
await getFactures(db);
function showFactures() {

    const table = document.getElementById("table");
    const ligne = [];
    let cellule;

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
}

// Ajoute une facture
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
        showFactures();
        console.log(factures);

    } else {
        alert("J'ai rien récupéré là ???");
    }
});

showFactures();

// Écoute s'il y a un changement en BDD
onSnapshot(collection(db, "factures"), async (collection) => {

    for (let i = 0; i < factures.length; i++) {
        table.deleteRow(0);
    }

    factures = [];
    await getFactures(db);
    showFactures();
});
