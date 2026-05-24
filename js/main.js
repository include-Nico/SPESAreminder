// js/main.js
import { ottieniSpesa, aggiungiItem, rimuoviItem, toggleCompletato, pulisciCompletati } from './storage.js';
import { renderLista, getIconForWord } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('item-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('shopping-list');
    
    // Nuovi reference ai bottoni d'azione
    const whatsappBtn = document.getElementById('share-whatsapp-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    const aggiornaSchermo = () => {
        const listaAttuale = ottieniSpesa();
        renderLista(listaAttuale, listContainer, handleToggle, handleRemove);
    };

    const handleToggle = (id) => {
        toggleCompletato(id);
        aggiornaSchermo();
    };

    const handleRemove = (id) => {
        rimuoviItem(id);
        aggiornaSchermo();
    };

    const gestisciAggiunta = () => {
        const testo = inputField.value.trim();
        if (testo !== '') {
            aggiungiItem(testo);
            inputField.value = '';
            aggiornaSchermo();
            inputField.focus();
        }
    };

    // NUOVO: Funzione che formatta la lista e apre WhatsApp
    const gestisciCondivisioneWhatsApp = () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) {
            alert("La lista è vuota! Aggiungi qualcosa prima di inviare.");
            return;
        }

        // Costruiamo il testo del messaggio formattato per WhatsApp
        let messaggio = "*SP€SA! 🛒*\n_Ecco la lista aggiornata:_\n\n";
        
        lista.forEach(item => {
            const icona = getIconForWord(item.testo);
            // Mette una spunta se è già stato preso, o un quadratino vuoto se manca
            const stato = item.completato ? "✅ " : "⬜ "; 
            messaggio += `${stato}${icona} *${item.testo}*\n`;
        });

        // Crea il link universale di WhatsApp ed effettua il reindirizzamento sicuro
        const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(messaggio)}`;
        window.open(urlWhatsApp, '_blank');
    };

    // Event Listeners esistenti
    addBtn.addEventListener('click', gestisciAggiunta);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') gestisciAggiunta();
    });

    // NUOVI: Event Listeners per i bottoni inferiori
    whatsappBtn.addEventListener('click', gestisciCondivisioneWhatsApp);
    
    clearCompletedBtn.addEventListener('click', () => {
        pulisciCompletati();
        aggiornaSchermo();
    });

    // Rendering iniziale all'avvio
    aggiornaSchermo();
});