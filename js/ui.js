// js/ui.js

// Esportiamo la funzione così da usarla anche per il messaggio WhatsApp
export function getIconForWord(word) {
    const w = word.toLowerCase();

    // 🥩 Carni e Salumi
    if(w.includes('pollo') || w.includes('tacchino')) return '🍗';
    if(w.includes('salum') || w.includes('prosciutt') || w.includes('salam') || w.includes('mortadella') || w.includes('pancetta')) return '🥓';
    if(w.includes('carne') || w.includes('trita') || w.includes('manzo') || w.includes('hamburger') || w.includes('bistecca')) return '🥩';
    if(w.includes('maiale') || w.includes('salsicci')) return '🐖';

    // 🐟 Pesce
    if(w.includes('sushi')) return '🍣';
    if(w.includes('salmon') || w.includes('tonno') || w.includes('pesce') || w.includes('merluzzo') || w.includes('orata')) return '🐟';
    if(w.includes('gamber') || w.includes('cozze') || w.includes('vongole') || w.includes('calamar')) return '🦐';

    // 🥤 Bevande
    if(w.includes('coca') || w.includes('fanta') || w.includes('sprite') || w.includes('bibit') || w.includes('estathe')) return '🥤';
    if(w.includes('the') || w.includes('tè') || w.includes('tea') || w.includes('camomilla') || w.includes('infuso')) return '🍵';
    if(w.includes('birra')) return '🍺';
    if(w.includes('vino')) return '🍷';
    if(w.includes('acqua')) return '💧';
    if(w.includes('succo')) return '🧃';
    if(w.includes('caff')) return '☕';

    // 🧴 Casa, Igiene e Detersivi
    if(w.includes('ammorbidente') || w.includes('shampoo') || w.includes('bagnoschiuma') || w.includes('balsamo')) return '🧴';
    if(w.includes('cotton') || w.includes('fioc')) return '🩹'; 
    if(w.includes('carta') || w.includes('scottex') || w.includes('igienica') || w.includes('tovaglioli')) return '🧻';
    if(w.includes('sapon') || w.includes('detersivo') || w.includes('sgrassatore') || w.includes('lavastoviglie')) return '🧼';
    if(w.includes('spugn')) return '🧽';
    if(w.includes('dentifricio') || w.includes('spazzolin')) return '🪥';

    // 🍞 Base (Latticini, Frutta, Verdura, Forno)
    if(w.includes('latte')) return '🥛';
    if(w.includes('pane') || w.includes('panino') || w.includes('baguette')) return '🍞';
    if(w.includes('uov')) return '🥚';
    if(w.includes('mel')) return '🍎';
    if(w.includes('per')) return '🍐';
    if(w.includes('banan')) return '🍌';
    if(w.includes('limon')) return '🍋';
    if(w.includes('frutta')) return '🍇';
    if(w.includes('pomodor')) return '🍅';
    if(w.includes('verdur') || w.includes('insalat') || w.includes('zucchine') || w.includes('carot')) return '🥬';
    if(w.includes('patat')) return '🥔';
    if(w.includes('cipoll') || w.includes('agli')) return '🧅';
    if(w.includes('pasta') || w.includes('spaghett')) return '🍝';
    if(w.includes('riso')) return '🍚';
    if(w.includes('biscott') || w.includes('dolc')) return '🍪';
    if(w.includes('cioccolat')) return '🍫';
    if(w.includes('formaggi') || w.includes('grana') || w.includes('parmigiano') || w.includes('mozzarella')) return '🧀';
    if(w.includes('burro')) return '🧈';
    if(w.includes('gelat')) return '🍦';
    if(w.includes('olio')) return '🫒';
    if(w.includes('sale') || w.includes('zucchero')) return '🧂';
    
    return '📌'; 
}

export function renderLista(lista, container, onToggle, onRemove) {
    container.innerHTML = '';

    lista.forEach(item => {
        const li = document.createElement('li');
        if (item.completato) li.classList.add('completed');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('item-content');
        
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('item-icon');
        iconSpan.textContent = getIconForWord(item.testo);

        const textSpan = document.createElement('span');
        textSpan.classList.add('item-text');
        textSpan.textContent = item.testo;

        contentDiv.appendChild(iconSpan);
        contentDiv.appendChild(textSpan);

        contentDiv.addEventListener('click', () => onToggle(item.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = '✖';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita che il click elimini E contemporaneamente sbarri
            onRemove(item.id);
        });

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        container.appendChild(li);
    });
}