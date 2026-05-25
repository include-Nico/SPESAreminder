// js/ui.js

// Estrapola quantità e nome prodotto separandoli
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

// Dizionario Massivo (Invariato)
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

// NUOVO: Assegna una priorità (corsia) per l'Ordinamento Intelligente
export function getCategoryPriority(word) {
    const w = word.toLowerCase();
    
    // 1. Ortofrutta
    if(w.match(/mel|per|banan|limon|aranc|mandarin|agrum|pompelm|frutt|uv|fragol|pesc|albicocc|cilieg|kiwi|melon|anguria|pomodor|pelati|passata|verdur|insalat|zucch|carot|broccol|spinac|minestron|finocchi|melanzan|peperon|patat|cipoll|agli/)) return 1;
    // 2. Freschi e Latticini
    if(w.match(/latte|panna|burro|margarin|uov|formaggi|grana|parmigian|mozzarell|ricott|provol|sottilett|gorgonzol|scamorz/)) return 2;
    // 3. Carni e Pesce
    if(w.match(/pollo|tacchino|faraona|cappone|salum|prosciutt|salam|mortadella|pancetta|speck|bresaola|coppa|guanciale|carne|trita|manzo|hamburger|bistecca|vitello|tagliata|costata|filetto|fettine|maiale|salsicci|cotechino|lonza|sushi|sashimi|nigiri|uramaki|salmon|tonno|pesce|merluzz|orat|branzin|spigol|platessa|acciugh|sardin|alici|gamber|cozze|vongol|calamar|seppi|polp|scamp|ostrich/)) return 3;
    // 4. Forno, Carboidrati e Dispensa
    if(w.match(/pane|panin|baguette|focaccia|piadina|crackers|grissin|pasta|spaghett|maccheron|penn|tortellin|gnocch|riso|farro|orz|cous|biscott|dolc|merendin|torta|brioche|cornett|crostat|cioccolat|nutella|cacao|praline|gelat|ghiacciol|sorbett|olio|acet|sale|zuccher|pepe|spezi|origan|basilic|farin|lievit/)) return 4;
    // 5. Bevande
    if(w.match(/coca|fanta|sprite|bibit|estathe|pepsi|chinotto|cedrata|the|tè|tea|camomill|infus|tisan|birra|ceres|tennent|ichnusa|moretti|vino|spumante|prosecco|champagne|acqua|succ|ace|caff|ginseng/)) return 5;
    // 6. Igiene e Cura della Casa
    if(w.match(/ammorbid|shampoo|bagnoschiuma|balsamo|crema|bagnodoccia|deodorante|cotton|fioc|cerott|disinfettant|medicinal|tachipirina|aspirina|moment|carta|scottex|igienic|tovagliol|fazzolett|rotol|sapon|detersiv|sgrassator|lavastovigli|candeggina|viakal|vetril|smacchiatore|spugn|stracci|panni|dentifrici|spazzolin|colluttorio/)) return 6;
    
    // 7. Altro / Non riconosciuto
    return 7;
}

// NUOVO: Generatore visivo dei Suggerimenti Rapidi
export function renderSuggerimenti(container, onAdd) {
    // Array dei prodotti più frequenti
    const solitiNoti = ["Pane", "Latte", "Uova", "Acqua", "Pasta", "Carta igienica", "Passata di pomodoro", "Biscotti"];
    
    container.innerHTML = '';
    
    solitiNoti.forEach(item => {
        const btn = document.createElement('button');
        btn.classList.add('suggestion-chip');
        // Inserisce automaticamente l'icona calcolata dal dizionario
        btn.innerHTML = `${getIconForWord(item)} ${item}`;
        
        // Al click, invia l'elemento alla funzione di aggiunta nel main
        btn.addEventListener('click', () => onAdd(item));
        container.appendChild(btn);
    });
}

// Rendering della Lista Ordinata Intelligente
export function renderLista(listaOriginale, container, onToggle, onLongPress) {
    container.innerHTML = '';

    // Cloniamo la lista originale per non corrompere i dati salvati e la ordiniamo
    const lista = [...listaOriginale].sort((a, b) => {
        // 1. Priorità Assoluta: i completati vanno sempre in fondo
        if (a.completato !== b.completato) {
            return a.completato ? 1 : -1;
        }
        
        // 2. Ordinamento per Corsia (es. Ortofrutta prima di Detersivi)
        const priorityA = getCategoryPriority(estraiQuantita(a.testo).nomeProdotto);
        const priorityB = getCategoryPriority(estraiQuantita(b.testo).nomeProdotto);
        
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        // 3. A parità di corsia, ordina alfabeticamente
        return a.testo.localeCompare(b.testo);
    });

    lista.forEach(item => {
        const li = document.createElement('li');
        if (item.completato) li.classList.add('completed');

        // --- GESTIONE PRESSIONE PROLUNGATA ---
        let pressTimer;
        let isLongPress = false;

        const startPress = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return; 
            isLongPress = false;
            li.classList.add('pressing'); 

            pressTimer = setTimeout(() => {
                isLongPress = true;
                li.classList.remove('pressing');
                if (navigator.vibrate) navigator.vibrate(50); 
                onLongPress(item); 
            }, 600);
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
            li.classList.remove('pressing');
        };

        li.addEventListener('mousedown', startPress);
        li.addEventListener('touchstart', startPress, { passive: true });
        li.addEventListener('mouseup', cancelPress);
        li.addEventListener('mouseleave', cancelPress);
        li.addEventListener('touchend', cancelPress);
        li.addEventListener('touchcancel', cancelPress);

        li.addEventListener('click', (e) => {
            if (isLongPress) {
                e.preventDefault();
                return;
            }
            onToggle(item.id);
        });

        // --- CREAZIONE CONTENUTO ---
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