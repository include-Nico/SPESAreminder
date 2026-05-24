// js/main.js
import { ottieniSpesa, aggiungiItem, rimuoviItem, toggleCompletato } from './storage.js';
import { renderLista } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('item-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('shopping-list');

    // Funzione per aggiornare lo schermo
    const aggiornaSchermo = () => {
        const listaAttuale = ottieniSpesa();
        renderLista(listaAttuale, listContainer, handleToggle, handleRemove);
    };

    // Callback: clicco su un elemento per completarlo
    const handleToggle = (id) => {
        toggleCompletato(id);
        aggiornaSchermo();
    };

    // Callback: clicco sulla X per rimuoverlo
    const handleRemove = (id) => {
        rimuoviItem(id);
        aggiornaSchermo();
    };

    // Aggiungi un nuovo elemento
    const gestisciAggiunta = () => {
        const testo = inputField.value.trim();
        if (testo !== '') {
            aggiungiItem(testo);
            inputField.value = ''; // Pulisce l'input
            aggiornaSchermo();
            inputField.focus(); // Riporta il cursore sull'input
        }
    };

    // Event Listeners
    addBtn.addEventListener('click', gestisciAggiunta);

    // Permette di premere "Invio" sulla tastiera per aggiungere
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            gestisciAggiunta();
        }
    });

    // Avvio iniziale dell'app
    aggiornaSchermo();
});