// js/ui.js

// Funzione intelligente per separare quantità e nome prodotto
export function estraiQuantita(testo) {
    // Cerca numeri (anche con virgola) seguiti opzionalmente da unità di misura
    // Es: "3", "1.5 kg", "500g", "2 pacchi di"
    const regex = /^(\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|pz|litri|chili|etti|pacchi|bottiglie)?)\s+(?:di\s+)?(.*)/i;
    const match = testo.trim().match(regex);
    
    if (match) {
        return {
            quantita: match[1],
            nomeProdotto: match[2].charAt(0).toUpperCase() + match[2].slice(1) // Mette la maiuscola al prodotto
        };
    }
    return {
        quantita: null,
        nomeProdotto: testo.charAt(0).toUpperCase() + testo.slice(1)
    };
}

// Dizionario espanso (invariato)
export function getIconForWord(word) {
    const w = word.toLowerCase();

    if(w.match(/pollo|tacchino|faraona|cappone/)) return '🍗';
    if(w.match(/salum|prosciutt|salam|mortadella|pancetta|speck|bresaola|coppa|guanciale/)) return '🥓';
    if(w.match(/carne|trita|manzo|hamburger|bistecca|vitello|tagliata|costata|filetto|fettine/)) return '🥩';
    if(w.match(/maiale|salsicci|cotechino|lonza/)) return '🐖';
    if(w.match(/sushi|sashimi|nigiri|uramaki/)) return '🍣';
    if(w.match(/salmon|tonno|pesce|merluzz|orat|branzin|spigol|platessa|acciugh|sardin|alici/)) return '🐟';
    if(w.match(/gamber|cozze|vongol|calamar|seppi|polp|scamp|ostrich/)) return '🦐';
    if(w.match(/coca|fanta|sprite|bibit|estathe|pepsi|chinotto|cedrata/)) return '🥤';
    if(w.match(/the|tè|tea|camomill|infus|tisan/)) return '🍵';
    if(w.match(/birra|ceres|tennent|ichnusa|moretti/)) return '🍺';
    if(w.match(/vino|spumante|prosecco|champagne/)) return '🍷';
    if(w.match(/acqua/)) return '💧';
    if(w.match(/succ|ace/)) return '🧃';
    if(w.match(/caff|ginseng/)) return '☕';
    if(w.match(/ammorbid|shampoo|bagnoschiuma|balsamo|crema|bagnodoccia|deodorante/)) return '🧴';
    if(w.match(/cotton|fioc|cerott|disinfettant|medicinal|tachipirina|aspirina|moment/)) return '🩹'; 
    if(w.match(/carta|scottex|igienic|tovagliol|fazzolett|rotol/)) return '🧻';
    if(w.match(/sapon|detersiv|sgrassator|lavastovigli|candeggina|viakal|vetril|smacchiatore/)) return '🧼';
    if(w.match(/spugn|stracci|panni/)) return '🧽';
    if(w.match(/dentifrici|spazzolin|colluttorio/)) return '🪥';
    if(w.match(/latte|panna/)) return '🥛';
    if(w.match(/pane|panin|baguette|focaccia|piadina|crackers|grissin/)) return '🍞';
    if(w.match(/uov/)) return '🥚';
    if(w.match(/mel/)) return '🍎';
    if(w.match(/per/)) return '🍐';
    if(w.match(/banan/)) return '🍌';
    if(w.match(/limon|aranc|mandarin|agrum|pompelm/)) return '🍋';
    if(w.match(/frutt|uv|fragol|pesc|albicocc|cilieg|kiwi|melon|anguria/)) return '🍇';
    if(w.match(/pomodor|pelati|passata/)) return '🍅';
    if(w.match(/verdur|insalat|zucch|carot|broccol|spinac|minestron|finocchi|melanzan|peperon/)) return '🥬';
    if(w.match(/patat/)) return '🥔';
    if(w.match(/cipoll|agli/)) return '🧅';
    if(w.match(/pasta|spaghett|maccheron|penn|tortellin|gnocch/)) return '🍝';
    if(w.match(/riso|farro|orz|cous/)) return '🍚';
    if(w.match(/biscott|dolc|merendin|torta|brioche|cornett|crostat/)) return '🍪';
    if(w.match(/cioccolat|nutella|cacao|praline/)) return '🍫';
    if(w.match(/formaggi|grana|parmigian|mozzarell|ricott|provol|sottilett|gorgonzol|scamorz/)) return '🧀';
    if(w.match(/burro|margarin/)) return '🧈';
    if(w.match(/gelat|ghiacciol|sorbett/)) return '🍦';
    if(w.match(/olio|acet/)) return '🫒';
    if(w.match(/sale|zuccher|pepe|spezi|origan|basilic/)) return '🧂';
    if(w.match(/farin|lievit/)) return '🌾';
    
    return '📌'; 
}

// Rendering della lista HTML con il Badge per i numeri
export function renderLista(lista, container, onToggle) {
    container.innerHTML = '';

    lista.forEach(item => {
        const li = document.createElement('li');
        if (item.completato) li.classList.add('completed');

        li.style.cursor = 'pointer';
        li.addEventListener('click', () => onToggle(item.id));

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('item-content');
        
        // Estrapola quantità e nome dal testo originale
        const info = estraiQuantita(item.testo);

        const iconSpan = document.createElement('span');
        iconSpan.classList.add('item-icon');
        // Cerca l'icona usando il nome pulito (senza il numero)
        iconSpan.textContent = getIconForWord(info.nomeProdotto);
        contentDiv.appendChild(iconSpan);

        // Se ha trovato un numero, crea il badge
        if (info.quantita) {
            const qtySpan = document.createElement('span');
            qtySpan.classList.add('item-qty');
            qtySpan.textContent = info.quantita;
            contentDiv.appendChild(qtySpan);
        }

        const textSpan = document.createElement('span');
        textSpan.classList.add('item-text');
        textSpan.textContent = info.nomeProdotto;
        contentDiv.appendChild(textSpan);

        li.appendChild(contentDiv);
        container.appendChild(li);
    });
}