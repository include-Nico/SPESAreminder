// js/main.js
import { ottieniSpesa, aggiungiItem, toggleCompletato, svuotaLista, rimuoviItem } from './storage.js';
import { renderLista, getIconForWord } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('item-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('shopping-list');
    const whatsappBtn = document.getElementById('share-whatsapp-btn');
    const clearBtn = document.getElementById('clear-completed-btn');
    const micBtn = document.getElementById('mic-btn');

    // --- GESTIONE MODALE PERSONALIZZATO ---
    const modalOverlay = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    // Funzione intelligente per gestire tutti gli avvisi
    function mostraModale(titolo, messaggio, onConfirm, isAlert = false) {
        modalTitle.textContent = titolo;
        modalMessage.textContent = messaggio;

        // Troviamo i bottoni originali
        const oldCancelBtn = document.getElementById('modal-cancel');
        const oldConfirmBtn = document.getElementById('modal-confirm');

        // TRUCCO PRO: Cloniamo i bottoni per resettare vecchi "click" rimasti in memoria
        const cancelBtn = oldCancelBtn.cloneNode(true);
        const confirmBtn = oldConfirmBtn.cloneNode(true);
        oldCancelBtn.parentNode.replaceChild(cancelBtn, oldCancelBtn);
        oldConfirmBtn.parentNode.replaceChild(confirmBtn, oldConfirmBtn);

        // Se è solo un avviso (es. lista vuota), nascondi "Annulla" e cambia testo a "OK"
        if (isAlert) {
            cancelBtn.classList.add('hidden');
            confirmBtn.textContent = 'OK';
            confirmBtn.classList.remove('danger-btn');
            confirmBtn.classList.add('secondary-btn'); // Fallo sembrare innocuo
        } else {
            cancelBtn.classList.remove('hidden');
            confirmBtn.textContent = 'Elimina';
            confirmBtn.classList.add('danger-btn');
            confirmBtn.classList.remove('secondary-btn');
        }

        // Mostra il modale con animazione
        modalOverlay.classList.add('visible');

        // Azione Annulla
        cancelBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('visible');
        });

        // Azione Conferma
        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            modalOverlay.classList.remove('visible');
        });
    }
    // --- FINE MODALE ---

    const aggiornaSchermo = () => {
        const listaAttuale = ottieniSpesa();
        // Passiamo anche la nuova funzione handleLongPress al render
        renderLista(listaAttuale, listContainer, handleToggle, handleLongPress);
    };

    const handleToggle = (id) => {
        toggleCompletato(id);
        aggiornaSchermo();
    };

    // Callback per la pressione prolungata (singolo prodotto)
    const handleLongPress = (item) => {
        // Usiamo il nostro bellissimo Modale Personalizzato!
        mostraModale(
            "Rimuovi Prodotto", 
            `Vuoi davvero eliminare "${item.testo}" dalla lista?`, 
            () => {
                rimuoviItem(item.id);
                aggiornaSchermo();
            }
        );
    };

    const gestisciAggiunta = () => {
        const testo = inputField.value.trim();
        if (testo !== '') {
            aggiungiItem(testo);
            inputField.value = ''; 
            aggiornaSchermo();
            if (window.innerWidth > 768) inputField.focus(); 
        }
    };

    // MICROFONO (Web Speech API)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'it-IT';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        micBtn.addEventListener('click', () => recognition.start());

        recognition.addEventListener('audiostart', () => {
            micBtn.classList.add('listening');
            inputField.placeholder = "Ti ascolto...";
        });

        recognition.addEventListener('result', (e) => {
            inputField.value = e.results[0][0].transcript;
            gestisciAggiunta(); 
        });

        recognition.addEventListener('audioend', () => {
            micBtn.classList.remove('listening');
            inputField.placeholder = "Es. 3 Latte, 2kg Mele...";
        });

        recognition.addEventListener('error', (e) => {
            micBtn.classList.remove('listening');
            inputField.placeholder = "Es. 3 Latte...";
            if (e.error === 'not-allowed') {
                mostraModale("Microfono bloccato", "Devi consentire l'uso del microfono nelle impostazioni.", null, true);
            }
        });
    } else {
        micBtn.style.display = 'none';
    }

    // WHATSAPP
    const gestisciCondivisioneWhatsApp = () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) {
            // Sostituito il vecchio "alert" con il nostro modale in modalità "Solo Avviso"
            mostraModale("Lista Vuota", "Non c'è nulla da inviare. Aggiungi qualcosa prima!", null, true);
            return;
        }

        let messaggio = "*SP€SA! 🛒*\n_Ecco la lista aggiornata:_\n\n";
        lista.forEach(item => {
            const icona = getIconForWord(item.testo);
            const stato = item.completato ? "✅ " : "⬜ "; 
            messaggio += `${stato}${icona} *${item.testo}*\n`;
        });

        const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(messaggio)}`;
        window.open(urlWhatsApp, '_blank');
    };

    // EVENT LISTENERS
    addBtn.addEventListener('click', gestisciAggiunta);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') gestisciAggiunta();
    });

    whatsappBtn.addEventListener('click', gestisciCondivisioneWhatsApp);
    
    // CANCELLA LISTA
    clearBtn.addEventListener('click', () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) {
            mostraModale("Lista Vuota", "La lista è già vuota!", null, true);
            return; 
        }

        // Sostituito il vecchio "confirm" con il modale elegante
        mostraModale(
            "Svuota Carrello", 
            "Sei sicura di voler cancellare l'intera lista della spesa?", 
            () => {
                svuotaLista();
                aggiornaSchermo();
            }
        );
    });

    // Avvio dell'app
    aggiornaSchermo();
});