// js/main.js
import { ottieniSpesa, aggiungiItem, toggleCompletato, svuotaLista } from './storage.js';
import { renderLista, getIconForWord } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('item-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('shopping-list');
    const whatsappBtn = document.getElementById('share-whatsapp-btn');
    const clearBtn = document.getElementById('clear-completed-btn');
    const micBtn = document.getElementById('mic-btn');

    const aggiornaSchermo = () => {
        const listaAttuale = ottieniSpesa();
        renderLista(listaAttuale, listContainer, handleToggle);
    };

    const handleToggle = (id) => {
        toggleCompletato(id);
        aggiornaSchermo();
    };

    const gestisciAggiunta = () => {
        const testo = inputField.value.trim();
        if (testo !== '') {
            aggiungiItem(testo);
            inputField.value = ''; 
            aggiornaSchermo();
            // Evitiamo di forzare il focus su mobile per non far aprire sempre la tastiera
            if (window.innerWidth > 768) inputField.focus(); 
        }
    };

    // SETUP MICROFONO (Web Speech API)
    // Controlla se il browser supporta il riconoscimento vocale
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'it-IT'; // Imposta lingua italiana
        recognition.interimResults = false; // Aspetta che finisca di parlare
        recognition.maxAlternatives = 1;

        // Quando tocca il microfono, inizia ad ascoltare
        micBtn.addEventListener('click', () => {
            recognition.start();
        });

        // Quando inizia ad ascoltare, fa pulsare il bottone di rosso
        recognition.addEventListener('audiostart', () => {
            micBtn.classList.add('listening');
            inputField.placeholder = "Ti ascolto...";
        });

        // Quando ha capito la parola, la inserisce e la aggiunge in automatico!
        recognition.addEventListener('result', (e) => {
            const transcript = e.results[0][0].transcript;
            inputField.value = transcript;
            gestisciAggiunta(); // Aggiunge direttamente alla lista senza fargli premere "Aggiungi"
        });

        // Quando finisce (o va in timeout), ferma l'animazione
        recognition.addEventListener('audioend', () => {
            micBtn.classList.remove('listening');
            inputField.placeholder = "Es. 3 Latte, 2kg Mele...";
        });

        // Gestione errori (es. permessi negati)
        recognition.addEventListener('error', (e) => {
            micBtn.classList.remove('listening');
            inputField.placeholder = "Es. 3 Latte, 2kg Mele...";
            if (e.error === 'not-allowed') {
                alert('Attenzione: devi consentire l\'uso del microfono nelle impostazioni del browser.');
            }
        });
    } else {
        // Se usa un browser troppo vecchio, nasconde il bottone del microfono
        micBtn.style.display = 'none';
    }

    // CONDIVISIONE WHATSAPP
    const gestisciCondivisioneWhatsApp = () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) {
            alert("La lista è vuota! Aggiungi qualcosa prima di inviare.");
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

    // EVENT LISTENERS TRADIZIONALI
    addBtn.addEventListener('click', gestisciAggiunta);
    
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') gestisciAggiunta();
    });

    whatsappBtn.addEventListener('click', gestisciCondivisioneWhatsApp);
    
    clearBtn.addEventListener('click', () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) return; 

        const conferma = confirm("Sei sicura di voler cancellare l'intera lista?");
        if (conferma) {
            svuotaLista();
            aggiornaSchermo();
        }
    });

    // Avvio dell'app
    aggiornaSchermo();
});