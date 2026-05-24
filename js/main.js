// js/main.js
import { ottieniSpesa, aggiungiItem, rimuoviItem, toggleCompletato } from './storage.js';
import { renderLista } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('item-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('shopping-list');

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

    addBtn.addEventListener('click', gestisciAggiunta);

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            gestisciAggiunta();
        }
    });

    aggiornaSchermo();
});