// Pour executer le code : npx webpack serve ou npm run dev
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';

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
    table.innerHTML = "";
    const ligne = [];
    let cellule;

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

        // Bouton supprimer;
        cellule = ligne[i].insertCell(3);
        cellule.innerHTML = "<button type='button' class='delete' id='" + i + "'>Supprimer</button>";
        cellule.addEventListener("click", function (e) {

            deleteFacture(factures[i].id);
        });

        // Bouton modifier
        cellule = ligne[i].insertCell(4);
        cellule.innerHTML = "<button type='button' class='modify' id='" + i + "'>Modifier</button>";
        cellule.addEventListener("click", function (e) {

            // On sauvegarde les valeurs actuelles
            let newNb = ligne[i].cells[0].innerHTML;
            let newStatus = ligne[i].cells[1].innerHTML;

            // On transforme les champs numéro et statut en input
            ligne[i].cells[0].innerHTML = "<input type='text' id='" + i + "' placeholder='Entrez le nouveau numéro'>";
            ligne[i].cells[1].innerHTML = "<input type='text' id='" + (i + 1) + "' placeholder='Entrez le nouveau statut'>";

            // On transforme le bouton modifier en bouton annuler
            ligne[i].cells[4].innerHTML = "<button type='button'>Annuler</button>";

            // Si l'utilisateur appuis sur annuler on ré-initialise
            ligne[i].cells[4].addEventListener("click", event => {
                showFactures();
            })

            // On écoute quand l'utilisateur appuie sur entrée et on modifie les champs
            ligne[i].cells[0].addEventListener("keypress", event => {

                if (event.key === 'Enter') {

                    // Si l'utilisateur ne veut pas changer le statut
                    if (document.getElementById((i + 1)).value !== '') {
                        newStatus = document.getElementById((i + 1)).value;
                    }
                    else {
                        ligne[i].cells[1].innerHTML = newStatus;
                    }

                    // Modification en BDD
                    newNb = document.getElementById(i).value;
                    modifyFacture(factures[i].id, newNb, newStatus);
                }
            });

            // On écoute quand l'utilisateur appuie sur entrée et on modifie les champs
            ligne[i].cells[1].addEventListener("keypress", event => {

                if (event.key === 'Enter') {

                    // Si l'utilisateur ne veut pas changer le numéro
                    if (document.getElementById(i).value !== '') {
                        newNb = document.getElementById(i).value;
                    }
                    else {
                        ligne[i].cells[0].innerHTML = newNb;
                    }

                    // Modification en BDD
                    newStatus = document.getElementById((i + 1)).value;
                    modifyFacture(factures[i].id, newNb, newStatus);
                }
            });
        });
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

// Supprime la facture
async function deleteFacture(id) {
    await deleteDoc(doc(db, "factures", id));
}

// Modifie la facture
async function modifyFacture(id, nb, status) {
    await updateDoc(doc(db, "factures", id), {
        number: nb,
        status: status,
        date: serverTimestamp()
    });
}