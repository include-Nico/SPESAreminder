// js/main.js
import { ottieniSpesa, aggiungiItem, toggleCompletato, svuotaLista } from './storage.js';
import { renderLista, getIconForWord } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referenze agli elementi del DOM (l'interfaccia HTML)
    const inputField = document.getElementById('item-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('shopping-list');
    
    // Referenze ai nuovi bottoni inferiori
    const whatsappBtn = document.getElementById('share-whatsapp-btn');
    const clearBtn = document.getElementById('clear-completed-btn');

    // Funzione centrale per aggiornare visivamente la lista
    const aggiornaSchermo = () => {
        const listaAttuale = ottieniSpesa();
        // Nota: ora passiamo solo handleToggle, perché la rimozione singola non c'è più
        renderLista(listaAttuale, listContainer, handleToggle);
    };

    // Gestisce il click sull'intera riga dell'elemento (segna come preso/non preso)
    const handleToggle = (id) => {
        toggleCompletato(id);
        aggiornaSchermo();
    };

    // Legge l'input, lo salva e pulisce la barra di testo
    const gestisciAggiunta = () => {
        const testo = inputField.value.trim();
        if (testo !== '') {
            aggiungiItem(testo);
            inputField.value = ''; // Svuota la barra
            aggiornaSchermo();
            inputField.focus(); // Rimette la tastiera pronta per scrivere il prossimo
        }
    };

    // Genera il testo elegante e apre WhatsApp
    const gestisciCondivisioneWhatsApp = () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) {
            alert("La lista è vuota! Aggiungi qualcosa prima di inviare.");
            return;
        }

        let messaggio = "*SP€SA! 🛒*\n_Ecco la lista aggiornata:_\n\n";
        
        lista.forEach(item => {
            const icona = getIconForWord(item.testo);
            // ✅ per i prodotti già nel carrello, ⬜ per quelli che mancano
            const stato = item.completato ? "✅ " : "⬜ "; 
            messaggio += `${stato}${icona} *${item.testo}*\n`;
        });

        // Crea il link universale e apre l'app (o il sito web su PC)
        const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(messaggio)}`;
        window.open(urlWhatsApp, '_blank');
    };

    // Event Listeners: collegano le azioni umane al codice
    addBtn.addEventListener('click', gestisciAggiunta);
    
    // Permette di aggiungere prodotti premendo il tasto "Invio" sulla tastiera
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') gestisciAggiunta();
    });

    whatsappBtn.addEventListener('click', gestisciCondivisioneWhatsApp);
    
    // Svuota tutta la lista, ma chiede prima conferma per sicurezza!
    clearBtn.addEventListener('click', () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) return; // Se è già vuota, non fa nulla

        // Finestra di avviso per evitare cancellazioni accidentali
        const conferma = confirm("Sei sicura di voler cancellare l'intera lista?");
        if (conferma) {
            svuotaLista();
            aggiornaSchermo();
        }
    });

    // Disegna la lista appena si apre l'applicazione
    aggiornaSchermo();
});