//Default configuration:
const defStyleUrl= "https://raw.githack.com/polifonia-project/dashboard/api-url-to-html/test_style.css";

//Melody Manager
const melody = { 
    // Base configuration:
    apiUrl : "http://127.0.0.1:5000/melody/api",
    configFile:{
        "content": {
            "01": {
                "type": "text",
                "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                "query": "PREFIX aat: <http://vocab.getty.edu/page/aat/> PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item ?content WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?manifestation lrmoo:R7i_is_exemplified_by ?item . ?expression lrmoo:R4i_is_embodied_in ?manifestation . ?work lrmoo:R3_is_realised_in ?expression ; crm:P102_has_title ?title . ?title crm:P2_has_type aat:300417207 ; crm:P190_has_symbolic_content ?content . FILTER( lang(?content) = \"it\") }",
                "content": "<h1 class='sidebar-title'><<<content>>></h1>"
            },
            "02": {
                "type": "text",
                "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                "query": "PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item ?type WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?manifestation lrmoo:R7i_is_exemplified_by ?item ; crm:P2_has_type ?type . }",
                "content": "<p class='metadata-header'><span class='metadata-caption'>tipologia</span> – <span class='metadata-content'><<<type>>></span></p>"
            },
            "03": {
                "type": "text",
                "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                "query": "PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item ?technique WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?manifestation lrmoo:R7i_is_exemplified_by ?item . ?expression lrmoo:R4i_is_embodied_in ?manifestation . ?creation a lrmoo:F28_Expression_Creation ; lrmoo:R17_created ?expression ; crm:P32_used_general_technique ?technique . }",
                "content": "<p class='metadata-header'><span class='metadata-caption'>tecnica</span> – <span class='metadata-content'><<<technique>>></span></p>"
            },
            "04": {
                "type": "text",
                "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                "query": "PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item (GROUP_CONCAT(REPLACE(REPLACE(STR(?subject), \".*/([^/]+)/[^/]+$\", \"$1\"), \"_\", \" \") ; SEPARATOR='; ') AS ?subjects) WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?manifestation lrmoo:R7i_is_exemplified_by ?item . ?expression lrmoo:R4i_is_embodied_in ?manifestation ; crm:P129_is_about ?subject . } GROUP BY ?item",
                "content": "<p class='metadata-header'><span class='metadata-caption'>temi</span> – <span class='metadata-content'><<<subjects>>></span></p>"
            },
            "05": {
                "type": "text",
                "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                "query": "PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item (IF(STR(YEAR(?begin)) = STR(YEAR(?end)), STR(YEAR(?begin)), CONCAT(STR(YEAR(?begin)), '-', STR(YEAR(?end)))) AS ?date) WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?manifestation lrmoo:R7i_is_exemplified_by ?item . ?expression lrmoo:R4i_is_embodied_in ?manifestation . ?creation a lrmoo:F28_Expression_Creation ; lrmoo:R17_created ?expression ; crm:P4_has_time-span ?timespan . ?timespan crm:P82a_begin_of_the_begin ?begin ; crm:P82b_end_of_the_end ?end . }",
                "content": "<p class='metadata-header'><span class='metadata-caption'>data</span> – <span class='metadata-content'><<<date>>></span></p>"
            },
            "06": {
                "type": "text",
                "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                "query": "PREFIX aat: <http://vocab.getty.edu/page/aat/> PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item (REPLACE(REPLACE(STR(?conservation_org), \".*/([^/]+)/[^/]+$\", \"$1\"), \"_\", \" \") AS ?conservation_org_label) WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?activity crm:P16_used_specific_object ?item ; crm:P2_has_type aat:300054277 ; crm:P14_carried_out_by ?conservation_org . }",
                "content": "<p class='metadata-digitisation'><span class='metadata-caption'>ente conservatore</span> – <span class='metadata-content'><<<conservation_org_label>>></span></p>"
            },
            "07": {
                "type": "text",
                "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                "query": "PREFIX aat: <http://vocab.getty.edu/page/aat/> PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item (REPLACE(REPLACE(STR(?conservation_place), \".*/([^/]+)/[^/]+$\", \"$1\"), \"_\", \" \") AS ?conservation_place_label) WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?activity crm:P16_used_specific_object ?item ; crm:P2_has_type aat:300054277 ; crm:P14_carried_out_by ?conservation_org . ?conservation_org crm:P74_has_current_or_former_residence ?conservation_place . }",
                "content": "<p class='metadata-digitisation'><span class='metadata-caption'>luogo di conservazione</span> – <span class='metadata-content'><<<conservation_place_label>>></span></p>"
            },
            "08": {
                "type": "text",
                "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                "query": "PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item ?digital_repr WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?manifestation lrmoo:R7i_is_exemplified_by ?item ; crm:P130i_features_are_also_found_on ?digital_repr . }",
                "content": "<button class='sidebar-button'><a href='<<<digital_repr>>>' target='_blank'>Versione digitale</a></button>"
            }
        }
    },
    configFileVR:{
    "content": {
        "01": {
            "type": "text",
            "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
            "query": "PREFIX aat: <http://vocab.getty.edu/page/aat/> PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item ?content WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item . ?manifestation lrmoo:R7i_is_exemplified_by ?item . ?expression lrmoo:R4i_is_embodied_in ?manifestation . ?work lrmoo:R3_is_realised_in ?expression ; crm:P102_has_title ?title . ?title crm:P2_has_type aat:300417207 ; crm:P190_has_symbolic_content ?content . FILTER( lang(?content) = \"it\") }",
            "content": "<<<content>>>"
        },
        "02": {
            "type": "text",
            "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
            "query": "PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> PREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> SELECT ?item ?description WHERE { VALUES ?item {<<<uri1>>>} ?item a lrmoo:F5_Item ; crm:P3_has_note ?description . }",
            "content": "<<<description>>>"
        }
    }
}
};


//const uriTest = "https://w3id.org/dharc/ontology/chad-ap/data/example/20-item";
const uriTest = "<https://w3id.org/changes/4/aldrovandi/itm/21/ob00/1>";


const stripAngleBrackets=(str)=> {
    if (str.startsWith('<') && str.endsWith('>')) {
      return str.slice(1, -1);
    }
    return str;
  }



melody.getData=(options)=> {
/* options contains:
    - uri (REQUIRED)
    - onComplete
    - onError
    - format: "json" (optional)
    - isVR: true/false (optional, default false)
*/

let _uri = stripAngleBrackets(options.uri)

//Settings for VR contents:
let _config_file = options.isVR? melody.configFileVR : melody.configFile;

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

fetch(melody.apiUrl, {
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




//GET ALL DATA:


function getMelodyDataAsync(uri,isVR=false) {
    return new Promise((resolve, reject) => {
        melody.getData({
            uri: uri,
           // format: "json",
            onComplete: resolve,
            onError: reject,
            isVR
        });
    });
}

async function fetchMelodyDataForAllRooms() {
    const results = [];

    for (const roomId in APP.config.rooms) {
        const room = APP.config.rooms[roomId];

        if (!room.objects) continue;

        for (const obj of room.objects) {
            if (obj.IRI) {
                try {
                    const data = await getMelodyDataAsync(obj.IRI);
                    const vrData = await getMelodyDataAsync(obj.IRI, true);
                    results.push({
                        room: roomId,
                        id: obj.id || obj.NR || null,
                        iri: obj.IRI,
                        data: data,
                        vrData
                    });
                } catch (err) {
                    console.error(`Error for IRI ${obj.IRI}:`, err);
                    results.push({
                        room: roomId,
                        id: obj.id || obj.NR || null,
                        iri: obj.IRI,
                        error: err
                    });
                }
            }
        }
    }

  //  console.log("Finished fetching all IRI data:", results);
    return results;
}


async function runMelodyFetchALL() {
    const allMelodyData = await fetchMelodyDataForAllRooms();
    // Do something with the data, e.g.:
    console.log("All Melody Data:", allMelodyData);
    
    //return allMelodyData; // Optional: return if needed elsewhere

    downloadJSONOnTheFly("melodyBackup", allMelodyData);
}


function getMelodyDataByIRI(targetIRI, vr) {
    if(!APP.config.melodyBackup) return undefined;

    let res =  APP.config.melodyBackup.find(entry => entry.iri === targetIRI);
    let _data = vr? res.vrData : res.data;
    return _data;
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