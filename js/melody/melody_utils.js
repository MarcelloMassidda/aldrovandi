
//Default configuration:
const defStyleUrl= "https://raw.githack.com/polifonia-project/dashboard/api-url-to-html/test_style.css";

//Melody Manager
const melody = { 
    // Base configuration:
    apiUrl : "http://127.0.0.1:5000/melody/api",
    configFile: {
        "category": "painting",
        //"style":  defStyleUrl,
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
                "content": "<h1><<<title>>></h1><div class='Block'><p><<<desc>>></p></div>"
            }
        }
    },

};


const uriTest = "https://w3id.org/dharc/ontology/chad-ap/data/example/20-item";


melody.getData=(options)=> {
/* options contains:
    - uri (REQUIRED)
    - onComplete
    - onError
    - format: "json" (optional)
*/

//Compose request:
const payload = {
    uri1: options.uri,
    config_file: melody.configFile
}

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
        uri:_uri
    });
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