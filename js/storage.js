// js/storage.js

const STORAGE_KEY = 'spesa_mamma_data';

// Recupera la lista dal LocalStorage del browser
export function ottieniSpesa() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Salva un nuovo oggetto nell'array e aggiorna la memoria
export function aggiungiItem(testo) {
    const lista = ottieniSpesa();
    const nuovoItem = {
        id: Date.now().toString(),
        testo: testo,
        completato: false // Di default l'oggetto è da comprare
    };
    lista.push(nuovoItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return lista;
}

// Inverte lo stato da "comprato" a "da comprare" e viceversa
export function toggleCompletato(id) {
    const lista = ottieniSpesa();
    const index = lista.findIndex(item => item.id === id);
    if (index !== -1) {
        lista[index].completato = !lista[index].completato;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }
    return lista;
}

// Cancella completamente tutti i dati (reset della lista)
export function svuotaLista() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
}