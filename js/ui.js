// js/ui.js

// Dizionario massivamente espanso utilizzando Espressioni Regolari (Regex)
export function getIconForWord(word) {
    const w = word.toLowerCase();

    // 🥩 Carni e Salumi
    if(w.match(/pollo|tacchino|faraona|cappone/)) return '🍗';
    if(w.match(/salum|prosciutt|salam|mortadella|pancetta|speck|bresaola|coppa|guanciale/)) return '🥓';
    if(w.match(/carne|trita|manzo|hamburger|bistecca|vitello|tagliata|costata|filetto|fettine/)) return '🥩';
    if(w.match(/maiale|salsicci|cotechino|lonza/)) return '🐖';

    // 🐟 Pesce e Frutti di Mare
    if(w.match(/sushi|sashimi|nigiri|uramaki/)) return '🍣';
    if(w.match(/salmon|tonno|pesce|merluzz|orat|branzin|spigol|platessa|acciugh|sardin|alici/)) return '🐟';
    if(w.match(/gamber|cozze|vongol|calamar|seppi|polp|scamp|ostrich/)) return '🦐';

    // 🥤 Bevande
    if(w.match(/coca|fanta|sprite|bibit|estathe|pepsi|chinotto|cedrata/)) return '🥤';
    if(w.match(/the|tè|tea|camomill|infus|tisan/)) return '🍵';
    if(w.match(/birra|ceres|tennent|ichnusa|moretti/)) return '🍺';
    if(w.match(/vino|spumante|prosecco|champagne/)) return '🍷';
    if(w.match(/acqua/)) return '💧';
    if(w.match(/succ|ace/)) return '🧃';
    if(w.match(/caff|ginseng/)) return '☕';

    // 🧴 Casa, Igiene e Farmacia
    if(w.match(/ammorbid|shampoo|bagnoschiuma|balsamo|crema|bagnodoccia|deodorante/)) return '🧴';
    if(w.match(/cotton|fioc|cerott|disinfettant|medicinal|tachipirina|aspirina|moment/)) return '🩹'; 
    if(w.match(/carta|scottex|igienic|tovagliol|fazzolett|rotol/)) return '🧻';
    if(w.match(/sapon|detersiv|sgrassator|lavastovigli|candeggina|viakal|vetril|smacchiatore/)) return '🧼';
    if(w.match(/spugn|stracci|panni/)) return '🧽';
    if(w.match(/dentifrici|spazzolin|colluttorio/)) return '🪥';

    // 🍞 Base (Latticini, Frutta, Verdura, Forno, Dispensa)
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
    
    // Icona di default (segnaposto elegante)
    return '📌'; 
}

// Rendering della lista HTML
export function renderLista(lista, container, onToggle) {
    // Svuota l'HTML precedente per evitare duplicati
    container.innerHTML = '';

    lista.forEach(item => {
        // Crea il contenitore del singolo prodotto
        const li = document.createElement('li');
        
        // Se è completato, aggiunge la classe CSS per l'effetto sbarrato
        if (item.completato) li.classList.add('completed');

        // L'intero blocco del prodotto diventa l'area cliccabile
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => onToggle(item.id));

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('item-content');
        
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('item-icon');
        iconSpan.textContent = getIconForWord(item.testo);

        const textSpan = document.createElement('span');
        textSpan.classList.add('item-text');
        textSpan.textContent = item.testo;

        // Assembla l'elemento
        contentDiv.appendChild(iconSpan);
        contentDiv.appendChild(textSpan);
        li.appendChild(contentDiv);
        
        // Inserisce l'elemento finito nel contenitore principale
        container.appendChild(li);
    });
}