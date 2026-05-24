// js/storage.js

const STORAGE_KEY = 'spesa_mamma_data';

// Recupera la lista dal LocalStorage
export function ottieniSpesa() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Salva un nuovo oggetto nella lista
export function aggiungiItem(testo) {
    const lista = ottieniSpesa();
    const nuovoItem = {
        id: Date.now().toString(), // Genera un ID univoco
        testo: testo,
        completato: false
    };
    lista.push(nuovoItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return lista;
}

// Rimuove un oggetto specifico
export function rimuoviItem(id) {
    let lista = ottieniSpesa();
    lista = lista.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return lista;
}

// Segna come comprato/da comprare
export function toggleCompletato(id) {
    const lista = ottieniSpesa();
    const index = lista.findIndex(item => item.id === id);
    if (index !== -1) {
        lista[index].completato = !lista[index].completato;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }
    return lista;
}