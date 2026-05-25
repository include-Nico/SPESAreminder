// js/storage.js

const STORAGE_KEY = 'spesa_mamma_data';

export function ottieniSpesa() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function aggiungiItem(testo) {
    const lista = ottieniSpesa();
    const nuovoItem = {
        id: Date.now().toString(),
        testo: testo,
        completato: false
    };
    lista.push(nuovoItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return lista;
}

export function toggleCompletato(id) {
    const lista = ottieniSpesa();
    const index = lista.findIndex(item => item.id === id);
    if (index !== -1) {
        lista[index].completato = !lista[index].completato;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }
    return lista;
}

// REINTRODOTTO: Rimuove un singolo elemento specifico
export function rimuoviItem(id) {
    let lista = ottieniSpesa();
    lista = lista.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return lista;
}

export function svuotaLista() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
}