// js/ui.js

export function estraiQuantita(testo) {
    const regex = /^(\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|pz|litri|chili|etti|pacchi|bottiglie)?)\s+(?:di\s+)?(.*)/i;
    const match = testo.trim().match(regex);
    if (match) {
        return {
            quantita: match[1],
            nomeProdotto: match[2].charAt(0).toUpperCase() + match[2].slice(1)
        };
    }
    return {
        quantita: null,
        nomeProdotto: testo.charAt(0).toUpperCase() + testo.slice(1)
    };
}

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

// AGGIUNTO: Riceve onLongPress per l'eliminazione
export function renderLista(lista, container, onToggle, onLongPress) {
    container.innerHTML = '';

    lista.forEach(item => {
        const li = document.createElement('li');
        if (item.completato) li.classList.add('completed');

        // --- GESTIONE PRESSIONE PROLUNGATA (LONG PRESS) ---
        let pressTimer;
        let isLongPress = false;

        const startPress = (e) => {
            // Ignora se è un click col tasto destro del mouse
            if (e.type === 'mousedown' && e.button !== 0) return; 
            
            isLongPress = false;
            li.classList.add('pressing'); // Attiva l'animazione di rimpicciolimento

            // Se il dito sta premuto per 600 millisecondi, scatta l'eliminazione
            pressTimer = setTimeout(() => {
                isLongPress = true;
                li.classList.remove('pressing');
                
                // Feedback tattile: fa vibrare leggermente il telefono se supportato
                if (navigator.vibrate) navigator.vibrate(50); 
                
                onLongPress(item); // Chiama la funzione di avviso eliminazione
            }, 600);
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
            li.classList.remove('pressing');
        };

        // Eventi universali (Mobile e Computer)
        li.addEventListener('mousedown', startPress);
        li.addEventListener('touchstart', startPress, { passive: true });
        
        li.addEventListener('mouseup', cancelPress);
        li.addEventListener('mouseleave', cancelPress);
        li.addEventListener('touchend', cancelPress);
        li.addEventListener('touchcancel', cancelPress);

        // Click normale (sbarra la riga)
        li.addEventListener('click', (e) => {
            // Se si è appena attivato il long press, blocchiamo il click normale!
            if (isLongPress) {
                e.preventDefault();
                return;
            }
            onToggle(item.id);
        });
        // --- FINE GESTIONE LONG PRESS ---

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('item-content');
        
        const info = estraiQuantita(item.testo);

        const iconSpan = document.createElement('span');
        iconSpan.classList.add('item-icon');
        iconSpan.textContent = getIconForWord(info.nomeProdotto);
        contentDiv.appendChild(iconSpan);

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