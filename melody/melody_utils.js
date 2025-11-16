////////////////Melody Manager
let melody = {};

melody.init=()=>{

    //Load config from files
    const getConfigfromFile = (path,key)=> {
        if(!path || !key){
            console.alert("Melody config file path or key missing for path: " + path);
            return;
        }
        APP.loadJSON(path,(config)=>{
            if(!config){
                console.alert("Melody config file not found or empty at path: " + path);
                return;
            }
            melody.config[key] = config;
            console.log("Melody " + key + " config loaded:", melody.config[key]);
        });

    };

    //Load Melody main config:
    APP.loadJSON("./melody/melody.json",(configData)=>{
        if(!configData){
            console.alert("Melody config file not found or empty!");
            return;
        }
        melody.config = configData;
        
        //ita config:
        getConfigfromFile(configData.itemsConfig_ITA_path,"config_ita");
        getConfigfromFile(configData.itemsConfig_ITA_VR_path,"config_ita_vr");
        //eng config:
        getConfigfromFile(configData.itemsConfig_ENG_path,"config_eng");
        getConfigfromFile(configData.itemsConfig_ENG_VR_path,"config_eng_vr");

        //Load per-room backups from storage
        melody.backups = melody.backups || {};
        const loadRoomBackups = async () => {
            if (!APP.config || !APP.config.rooms) return;
            
            for (const roomId of Object.keys(APP.config.rooms)) {
                try {
                    const storageKey = `melody/backup_room_${roomId}`;
                    const payload = await ATON.App.getStorage(storageKey);
                    if (payload && payload.data) {
                        melody.backups[roomId] = payload.data;
                        console.log(`Loaded melody backup for room ${roomId}`);
                    }
                } catch (err) {
                    console.warn(`Could not load melody backup for room ${roomId}:`, err);
                }
            }

            // Load global backup_scripts
            try {
                const scriptPayload = await ATON.App.getStorage('melody/backup_scripts');
                if (scriptPayload && scriptPayload.data) {
                    melody.backups['scripts'] = scriptPayload.data;
                    console.log('Loaded melody backup_scripts');
                }
            } catch (err) {
                console.warn('Could not load melody backup_scripts:', err);
            }
        };
        // If enabled, load backups
        if (APP.config.useMelodyBackup) loadRoomBackups();

        console.log("Melody config loaded:", melody.config);
})};

melody.getData=(options)=> {
/* options contains:
    - uri (REQUIRED)
    - onComplete
    - onError
    - format: "json" (optional)
    - isVR: true/false (optional, default false)
    - language: "ita"/"eng" (optional, default current APP language)
*/

let _uri = stripAngleBrackets(options.uri) //IRI without angle brackets

//OLD://let _config_file = options.isVR? melody.configFileVR : melody.configFile;

//Get config for Melody Query:
//by language
let lan = options.language || APP.currentLanguage;
let configKey = "config_" + lan.toLowerCase();

//and VR-version if needed
if(options.isVR) {configKey+="_vr";}
console.log("Melody getData for IRI:", _uri, " Language:", lan, " VR:", options.isVR);
let _config_file = melody.config[configKey];

console.log(_config_file);
//Compose request:
const payload = {
    uri1: _uri,
    config_file: _config_file
}

//Hard format handling
if(options.isVR) {payload.format = "json"}

if(options.format){
    if(options.format=="json"){
        payload.format = "json"
    }
}


fetch( melody.config.api_url,
    {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
})
    .then(response => response.text())
    .then(result => {
        console.log(result);
        if(options.onComplete) options.onComplete(result);
    })
    .catch(error => {
        console.error("Error in API request:", error);
        if(options.onError) options.onError(error);
    });
}

//Debug URI
const uriTest = "<https://w3id.org/changes/4/aldrovandi/itm/1/ob00/1>";

const stripAngleBrackets=(str)=> {
    if (str.startsWith('<') && str.endsWith('>')) {
      return str.slice(1, -1);
    }
    return str;
}

melody.testAPI=(_uri=uriTest)=>{

    const onComplete = (res)=>{
        window.res = res;
        document.getElementById("SideBAR").style.display="block";
        document.getElementById("InfoContainer").innerHTML = res;
    }

    const onError = (error)=>{
        console.error("Error in API request:", error);
        document.getElementById("InfoContainer").innerHTML = "Error in API request: " + error;
    }

    
    melody.getData({
       // format:"json",
        onComplete,
        onError,
        uri:_uri,
        isVR:true
    });
}

// Inject HTML into a container and ensure any <script> tags execute
function injectHTMLWithScripts(container, html) {
    if (!container) return Promise.resolve();
    // Inject markup first
    container.innerHTML = html || '';

    // Compute a base origin from configured API to resolve relative assets
    let baseOrigin = '';
    let basePath = '/';
    try {
        const u = new URL(melody.config.api_url);
        baseOrigin = u.origin;
        // Directory of the API path, e.g., '/melody/api' -> '/melody/'
        basePath = u.pathname.replace(/\/[^/]*$/, '/');
    } catch (_) { /* no-op */ }
    const isAbsolute = (u) => /^(?:[a-z]+:)?\/\//i.test(u) || u.startsWith('data:') || u.startsWith('blob:');
    const resolveUrl = (u) => {
        try {
            if (!u) return u;
            if (isAbsolute(u)) return u;
            if (u.startsWith('/')) return baseOrigin ? (baseOrigin + u) : u;
            // Common bundles from the Melody app
            if (/^(?:\.?\/)?static\//.test(u)) return baseOrigin ? (baseOrigin + basePath + u.replace(/^\.+\//, '')) : u;
            if (/^melody\//.test(u)) return baseOrigin ? (baseOrigin + '/' + u) : u;
            if (baseOrigin) return new URL(u, baseOrigin + basePath).toString();
            return u;
        } catch (_) { return u; }
    };

    // Rewrite stylesheet/link/img/video/audio/source URLs to absolute if needed
    const relSelectors = [
        'link[rel="stylesheet"][href]',
        'img[src]',
        'script[src]',
        'video[src]', 'audio[src]', 'source[src]'
    ];
    for (const sel of relSelectors) {
        const nodes = container.querySelectorAll(sel);
        nodes.forEach(n => {
            const attr = n.hasAttribute('href') ? 'href' : 'src';
            const val = n.getAttribute(attr);
            const abs = resolveUrl(val);
            if (abs && abs !== val) n.setAttribute(attr, abs);
        });
    }

    // Find scripts in document order
    const scripts = Array.from(container.querySelectorAll('script'));
    if (!scripts.length) return Promise.resolve();

    // Load/execute sequentially to preserve order
    return scripts.reduce((chain, oldScript) => {
        return chain.then(() => new Promise((resolve) => {
            const newScript = document.createElement('script');
            // Copy attributes verbatim
            for (const attr of oldScript.attributes) newScript.setAttribute(attr.name, attr.value);
            // Ensure ordered execution unless explicitly async
            if (!newScript.hasAttribute('async')) newScript.async = false;

            if (oldScript.textContent && !newScript.src) {
                // Inline script: copy code and execute on insertion
                newScript.text = oldScript.textContent;
                oldScript.replaceWith(newScript);
                // Inline executes immediately on insertion
                resolve();
            } else {
                // External script: wait for load/error then continue
                // Normalize URL against API origin if relative
                const rawSrc = oldScript.getAttribute('src');
                const absSrc = resolveUrl(rawSrc);
                if (absSrc) newScript.src = absSrc;
                newScript.onload = () => resolve();
                newScript.onerror = () => resolve();
                oldScript.replaceWith(newScript);
            }
        }));
    }, Promise.resolve());
}

// injectEmbeddedHTML (modalità OFFLINE / BACKUP)
//    - Input:  container (DOM element), html (stringa con riferimenti via data-script-ref/data-css-ref)
//    - Effetto: risolve riferimenti a scripts/CSS dal backup_scripts.json
//              poi inietta l'HTML e forza l'esecuzione degli script in ordine
//    - Uso: quando carichi un HTML di backup con riferimenti ai scripts/CSS
//
async function injectEmbeddedHTML(container, html) {
    if (!container) return Promise.resolve();

    // 1) Load scripts/CSS backup if not already cached
    if (!melody.backups['scripts']) {
        try {
            const stored = await ATON.App.getStorage('melody/backup_scripts');
            if (stored && stored.data) {
                melody.backups['scripts'] = stored.data;
                console.log('Loaded melody backup_scripts from storage');
            }
        } catch (err) {
            console.warn('Failed to load melody backup_scripts:', err);
        }
    }

    // 2) Resolve all references
    let resolvedHTML = html;
    if (melody.backups['scripts']) {
        const backupScripts = melody.backups['scripts'];
        const { scripts, css, data } = backupScripts;

        // Replace script references: <script data-script-ref="script_001"></script> -> <script>code</script>
        for (const [url, refId] of Object.entries(scripts)) {
            const scriptCode = data[refId];
            if (scriptCode) {
                const refMarkup = `<script data-script-ref="${refId}"></script>`;
                const replacement = `<script>${scriptCode}</script>`;
                resolvedHTML = resolvedHTML.replace(refMarkup, replacement);
            }
        }

        // Replace CSS references: <link data-css-ref="css_001"> -> <style>css</style>
        for (const [url, refId] of Object.entries(css)) {
            const cssCode = data[refId];
            if (cssCode) {
                const refMarkup = `<link data-css-ref="${refId}">`;
                const replacement = `<style>${cssCode}</style>`;
                resolvedHTML = resolvedHTML.replace(refMarkup, replacement);
            }
        }
    }

    // 3) Inject resolved HTML
    container.innerHTML = resolvedHTML || '';

    // 4) Force script execution in order
    const scripts = Array.from(container.querySelectorAll('script'));
    if (!scripts.length) return Promise.resolve();

    return scripts.reduce((chain, oldScript) => {
        return chain.then(() => new Promise((resolve) => {
            const newScript = document.createElement('script');

            // Copia attributi (es. type, data-*, ecc.)
            for (const attr of oldScript.attributes) {
                if (attr.name !== 'data-script-ref') {
                    newScript.setAttribute(attr.name, attr.value);
                }
            }

            if (!newScript.hasAttribute('async')) {
                newScript.async = false;
            }

            const hasSrc = oldScript.hasAttribute('src');

            if (!hasSrc) {
                // Caso normale: script inline
                if (oldScript.textContent) {
                    newScript.text = oldScript.textContent;
                }
                oldScript.replaceWith(newScript);
                resolve();
            } else {
                // Se per qualche motivo c'è un src, caricalo normalmente
                newScript.src = oldScript.getAttribute('src');
                newScript.onload = () => resolve();
                newScript.onerror = () => resolve();
                oldScript.replaceWith(newScript);
            }
        }));
    }, Promise.resolve());
}



//GET ALL DATA
//Async function to create backup from Melody API for all IRI

function getMelodyDataAsync(uri,isVR,lan) {
    return new Promise((resolve, reject) => {
        melody.getData({
            uri: uri,
           // format: "json",
            onComplete: resolve,
            onError: reject,
            language: lan,
            isVR
        });
    });
}

async function fetchMelodyDataForAllRooms(scriptUrls = new Map(), cssUrls = new Map()) {
    // Return a dictionary keyed by roomId where each value is the array of object backups for that room
    const resultsByRoom = {};

    for (const roomId in APP.config.rooms) {
        const room = APP.config.rooms[roomId];
        if (!room || !room.objects) {
            resultsByRoom[roomId] = [];
            continue;
        }

        resultsByRoom[roomId] = [];

        // Process all objects in the room (use slice if you want to limit during testing)
        const objectsToProcess = room.objects.slice(0);

        for (const obj of objectsToProcess) {
            if (!obj.IRI) continue;
            try {
                const static_data_ita = await getMelodyDataAsync(obj.IRI, false, "ita");
                const data_ita = await buildEmbeddedHTML(static_data_ita, scriptUrls, cssUrls);

                const static_data_eng = await getMelodyDataAsync(obj.IRI, false, "eng");
                const data_eng = await buildEmbeddedHTML(static_data_eng, scriptUrls, cssUrls);

                const vrData_ita = await getMelodyDataAsync(obj.IRI, true, "ita");
                const vrData_eng = await getMelodyDataAsync(obj.IRI, true, "eng");

                resultsByRoom[roomId].push({
                    room: roomId,
                    id: obj.id || obj.NR || null,
                    iri: obj.IRI,
                    data: { "ita": data_ita, "eng": data_eng },
                    vrData: { "ita": vrData_ita, "eng": vrData_eng }
                });
            } catch (err) {
                console.error(`Error for IRI ${obj.IRI} (room ${roomId}):`, err);
                resultsByRoom[roomId].push({ room: roomId, id: obj.id || obj.NR || null, iri: obj.IRI, error: err });
            }
        }
    }

    return resultsByRoom;
}

// Collect unique script and CSS URLs from all object HTMLs (first pass, no embedded content)
async function collectScriptsAndCSS() {
    const scriptUrls = new Map(); // URL -> id
    const cssUrls = new Map();    // URL -> id
    let scriptCounter = 1;
    let cssCounter = 1;

    // Iterate through all rooms and objects to collect raw script/CSS URLs
    if (!APP.config || !APP.config.rooms) {
        console.warn('No rooms in APP.config');
        return { scriptUrls, cssUrls };
    }

    for (const roomId in APP.config.rooms) {
        const room = APP.config.rooms[roomId];
        if (!room || !room.objects) continue;

        for (const obj of room.objects) {
            if (!obj.IRI) continue;

            try {
                // Fetch raw HTML for all language/VR combinations
                for (const isVR of [false, true]) {
                    for (const lang of ['ita', 'eng']) {
                        try {
                            const rawHtml = await getMelodyDataAsync(obj.IRI, isVR, lang);
                            if (!rawHtml) continue;

                            const temp = document.createElement('div');
                            temp.innerHTML = rawHtml;

                            // Collect script URLs
                            const scripts = temp.querySelectorAll('script[src]');
                            scripts.forEach(s => {
                                const src = s.getAttribute('src');
                                if (src && !scriptUrls.has(src)) {
                                    scriptUrls.set(src, `script_${String(scriptCounter).padStart(3, '0')}`);
                                    scriptCounter++;
                                }
                            });

                            // Collect CSS URLs
                            const links = temp.querySelectorAll('link[rel="stylesheet"][href]');
                            links.forEach(l => {
                                const href = l.getAttribute('href');
                                if (href && !cssUrls.has(href)) {
                                    cssUrls.set(href, `css_${String(cssCounter).padStart(3, '0')}`);
                                    cssCounter++;
                                }
                            });
                        } catch (err) {
                            console.debug(`collectScriptsAndCSS: skipped ${obj.IRI} (${lang}, VR=${isVR})`);
                        }
                    }
                }
            } catch (err) {
                console.warn(`collectScriptsAndCSS: error for ${obj.IRI}:`, err);
            }
        }
    }

    console.log(`collectScriptsAndCSS: found ${scriptUrls.size} scripts, ${cssUrls.size} CSS files`);
    return { scriptUrls, cssUrls };
}

// Build and save backup_scripts.json with all fetched scripts and CSS
async function buildBackupScripts(scriptUrls = new Map(), cssUrls = new Map()) {
    const backupScripts = {
        scripts: Object.fromEntries(scriptUrls),
        css: Object.fromEntries(cssUrls),
        data: {}
    };

    // Fetch all scripts
    for (const [url, id] of scriptUrls) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) continue;
            const code = await resp.text();
            backupScripts.data[id] = code;
            console.log(`Fetched script ${id}: ${url}`);
        } catch (err) {
            console.warn(`Failed to fetch script from ${url}:`, err);
        }
    }

    // Fetch all CSS
    for (const [url, id] of cssUrls) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) continue;
            const css = await resp.text();
            backupScripts.data[id] = css;
            console.log(`Fetched CSS ${id}: ${url}`);
        } catch (err) {
            console.warn(`Failed to fetch CSS from ${url}:`, err);
        }
    }

    // Save to storage and cache
    try {
        await ATON.App.addToStorage('melody/backup_scripts', { data: backupScripts });
        melody.backups['scripts'] = backupScripts;
        console.log('Saved melody backup_scripts to storage');
    } catch (err) {
        console.error('Failed to save melody backup_scripts:', err);
    }

    return backupScripts;
}

async function buildMelodyBackup() {
    melody.backups = melody.backups || {};

    // 1) First collect and cache the backup_scripts (global deduplication)
    console.log("Collecting scripts and CSS...");
    const { scriptUrls, cssUrls } = await collectScriptsAndCSS();
    console.log("Building backup_scripts...");
    const backupScripts = await buildBackupScripts(scriptUrls, cssUrls);

    // 2) Fetch all melody data with script/CSS references
    console.log("Fetching all melody data with script/CSS references...");
    const allMelodyData = await fetchMelodyDataForAllRooms(scriptUrls, cssUrls);
    console.log("All Melody Data (by room):", allMelodyData);

    if (!allMelodyData) {
        console.warn('No melody data returned from fetchMelodyDataForAllRooms');
        return;
    }

    // 3) Save one storage entry per room to avoid oversized single payloads
    for (const roomId of Object.keys(allMelodyData)) {
        try {
            const roomData = allMelodyData[roomId] || [];
            const storagePayload = { data: roomData };
            const storageKey = `melody/backup_room_${roomId}`;
            // Save and also cache in memory
            await ATON.App.addToStorage(storageKey, storagePayload);
            melody.backups[roomId] = roomData;
            console.log(`Saved melody backup for room ${roomId} to storage key '${storageKey}'.`);
        } catch (err) {
            console.error(`Failed to save melody backup for room ${roomId}:`, err);
        }
    }
}

//from backup, get data by IRI (synchronous)
function getMelodyDataByIRI(targetIRI, vr = false, idRoom) {
    // Assumes `melody.backups` is already populated in memory.
    const lan = APP.currentLanguage;

    if (!idRoom) {
        console.warn('getMelodyDataByIRI: idRoom parameter is required');
        return null;
    }

    melody.backups = melody.backups || {};

    const arr = melody.backups[idRoom];
    if (!arr) return null;

    const res = arr.find(entry => entry.iri === targetIRI);
    if (!res) return null;

    const data = vr ? res.vrData : res.data;
    return data ? data[lan] : null;
}

//  buildEmbeddedHTML
//    - Input:  html (stringa HTML ricevuta dall'API), scriptUrls, cssUrls (URL -> ID mappings)
//    - Output: Promise<string> con HTML con riferimenti ai backup scripts/CSS
//    - Uso: fase di pre-processing / backup quando sei online
//    - Nota: Sostituisce script[src] e link[rel="stylesheet"] con attributi data-*-ref
//
async function buildEmbeddedHTML(html, scriptUrls = new Map(), cssUrls = new Map()) {
    const container = document.createElement('div');
    container.innerHTML = html || '';

    // === Base URL (da melody.config.api_url) ===
    let baseOrigin = '';
    let basePath = '/';
    try {
        const u = new URL(melody.config.api_url);
        baseOrigin = u.origin;
        basePath = u.pathname.replace(/\/[^/]*$/, '/'); // dir dell'API
    } catch (_) {
        // se non è valido, niente baseOrigin
    }

    const isAbsolute = (u) =>
        /^(?:[a-z]+:)?\/\//i.test(u) || u.startsWith('data:') || u.startsWith('blob:');

    const resolveUrl = (u) => {
        try {
            if (!u) return u;
            if (isAbsolute(u)) return u;
            if (u.startsWith('/')) return baseOrigin ? (baseOrigin + u) : u;
            // asset comuni dell'app Melody
            if (/^(?:\.?\/)?static\//.test(u)) {
                return baseOrigin
                    ? (baseOrigin + basePath + u.replace(/^\.+\//, ''))
                    : u;
            }
            if (/^melody\//.test(u)) {
                return baseOrigin ? (baseOrigin + '/' + u) : u;
            }
            if (baseOrigin) {
                return new URL(u, baseOrigin + basePath).toString();
            }
            return u;
        } catch (_) {
            return u;
        }
    };

    // 1) Normalizza tutti gli URL (href/src) prima
    const relSelectors = [
        'link[rel="stylesheet"][href]',
        'img[src]',
        'script[src]',
        'video[src]', 'audio[src]', 'source[src]'
    ];
    for (const sel of relSelectors) {
        const nodes = container.querySelectorAll(sel);
        nodes.forEach(n => {
            const attr = n.hasAttribute('href') ? 'href' : 'src';
            const val = n.getAttribute(attr);
            const abs = resolveUrl(val);
            if (abs && abs !== val) n.setAttribute(attr, abs);
        });
    }

    // 2) REPLACE CSS: <link rel="stylesheet"> -> <link data-css-ref="css_001"> (NO href)
    const styleLinks = Array.from(
        container.querySelectorAll('link[rel="stylesheet"][href]')
    );
    styleLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('data:') || href.startsWith('blob:')) return;
        
        const refId = cssUrls.get(href);
        if (refId) {
            // Replace with reference
            link.removeAttribute('href');
            link.setAttribute('data-css-ref', refId);
        }
    });

    // 3) REPLACE JS: <script src="..."> -> <script data-script-ref="script_001"></script>
    const scriptsWithSrc = Array.from(container.querySelectorAll('script[src]'));
    scriptsWithSrc.forEach(script => {
        const src = script.getAttribute('src');
        if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;
        
        const refId = scriptUrls.get(src);
        if (refId) {
            // Replace with reference
            script.removeAttribute('src');
            script.setAttribute('data-script-ref', refId);
            script.textContent = '';
        }
    });

    return container.innerHTML;
}


//GIULIA TEST:
APP.testAPIRequest = () => {
    console.log('API OK')
    const apiUrl = "http://127.0.0.1:5000/melody/api";

    const payload = {
        uri1: "https://w3id.org/dharc/ontology/chad-ap/data/example/20-item",
        config_file: {
            "category": "painting",
            "style": "https://raw.githack.com/polifonia-project/dashboard/api-url-to-html/test_style.css",
            "content": {
                "01": {
                    "type": "text",
                    "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                    "query":
                        "PREFIX aat: <http://vocab.getty.edu/page/aat/>\n" +
                        "PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/>\n" +
                        "PREFIX crmdig: <http://www.ics.forth.gr/isl/CRMdig/>\n" +
                        "PREFIX ex: <https://w3id.org/dharc/ontology/chad-ap/data/example/>\n" +
                        "PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/>\n" +
                        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\n" +
                        "SELECT DISTINCT ?title ?desc\n" +
                        "WHERE {\n" +
                        "  VALUES (?item_id) { (<<<uri1>>>) }\n" +
                        "  ?manifestation lrmoo:R7i_is_exemplified_by ?item_id .\n" +
                        "  ?expression lrmoo:R4i_is_embodied_in ?manifestation .\n" +
                        "  ?work lrmoo:R3_is_realised_in ?expression ;\n" +
                        "        crm:P102_has_title ?title_id.\n" +
                        "  ?title_id crm:P190_has_symbolic_content ?title .\n\n" +
                        "  FILTER (lang(?title) = \"en\")\n" +
                        "  ?item_id crm:P3_has_note ?desc .\n" +
                        "}",
                    "content": "<div><h1><<<title>>></h1><h3><<<desc>>></h3></div>"
                }
            }
        }
    };


    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.text())
        .then(result => {
            window.res = result;
              document.getElementById("InfoContainer").innerHTML = result;
        })
        .catch(error => {
            console.error("Error in API request:", error);
            document.getElementById("InfoContainer").innerHTML = "Error in API request: " + error;
        });
};