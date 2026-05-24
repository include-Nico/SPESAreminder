// js/ui.js

// Dizionario delle icone basato su parole chiave
function getIconForWord(word) {
    const w = word.toLowerCase();
    if(w.includes('latte')) return '🥛';
    if(w.includes('pane')) return '🍞';
    if(w.includes('uova') || w.includes('uovo')) return '🥚';
    if(w.includes('mela') || w.includes('mele')) return '🍎';
    if(w.includes('carne') || w.includes('pollo')) return '🥩';
    if(w.includes('pesce')) return '🐟';
    if(w.includes('pasta')) return '🍝';
    if(w.includes('acqua')) return '💧';
    if(w.includes('carta') || w.includes('scottex')) return '🧻';
    if(w.includes('sapone') || w.includes('detersivo')) return '🧼';
    if(w.includes('frutta')) return '🍇';
    if(w.includes('verdura') || w.includes('insalata')) return '🥬';
    if(w.includes('biscotti')) return '🍪';
    if(w.includes('caffè') || w.includes('caffe')) return '☕';
    if(w.includes('formaggio')) return '🧀';
    
    // Icona di default se non trova corrispondenze
    return '📌'; 
}

export function renderLista(lista, container, onToggle, onRemove) {
    // Svuota il contenitore
    container.innerHTML = '';

    lista.forEach(item => {
        const li = document.createElement('li');
        if (item.completato) li.classList.add('completed');

        // Contenitore per icona e testo
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('item-content');
        
        // Assegna l'icona in base al testo
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('item-icon');
        iconSpan.textContent = getIconForWord(item.testo);

        const textSpan = document.createElement('span');
        textSpan.classList.add('item-text');
        textSpan.textContent = item.testo;

        contentDiv.appendChild(iconSpan);
        contentDiv.appendChild(textSpan);

        // Click sul testo per sbarrarlo
        contentDiv.addEventListener('click', () => onToggle(item.id));

        // Pulsante di eliminazione
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = '✖';
        deleteBtn.addEventListener('click', () => onRemove(item.id));

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        container.appendChild(li);
    });
}