APP.testAPIRequest = () => {
    const apiUrl = "http://127.0.0.1:5000/melody/api";

    const payload = {
        uri1: "https://w3id.org/dharc/ontology/chad-ap/data/example/20-item",
        format: "json",
        config_file: {
            "category": "painting",
            "content": {
                "01": {
                    "type": "text",
                    "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                    "query": "PREFIX aat: <http://vocab.getty.edu/page/aat/>\nPREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/>\nPREFIX crmdig: <http://www.ics.forth.gr/isl/CRMdig/>\nPREFIX ex: <https://w3id.org/dharc/ontology/chad-ap/data/example/>\nPREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> \nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\nSELECT DISTINCT ?title \nWHERE {\n  VALUES (?item_id) { (<<<uri1>>>) }\n  ?manifestation lrmoo:R7i_is_exemplified_by ?item_id .\n  ?expression lrmoo:R4i_is_embodied_in ?manifestation .\n  ?work lrmoo:R3_is_realised_in ?expression ;\n        crm:P102_has_title ?title_id.\n  ?title_id crm:P190_has_symbolic_content ?title .\n\n  FILTER (lang(?title) = \"en\")}",
                    "content": "<<<title>>>"
                },
                "02": {
                    "type": "text",
                    "sparql_endpoint": "http://localhost:3030/aldrovandi-object/sparql",
                    "query": "PREFIX aat: <http://vocab.getty.edu/page/aat/>\nPREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/>\nPREFIX crmdig: <http://www.ics.forth.gr/isl/CRMdig/>\nPREFIX ex: <https://w3id.org/dharc/ontology/chad-ap/data/example/>\nPREFIX lrmoo: <http://iflastandards.info/ns/lrm/lrmoo/> \nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\nSELECT DISTINCT ?desc\nWHERE {\n  VALUES (?item_id) { (<<<uri1>>>) }\n  ?manifestation lrmoo:R7i_is_exemplified_by ?item_id .\n ?item_id crm:P3_has_note ?desc .\n}",
                    "content": "<<<desc>>>"
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
            document.getElementById("InfoContainer").innerHTML = result;
        })
        .catch(error => {
            console.error("Error in API request:", error);
            document.getElementById("InfoContainer").innerHTML = "Error in API request: " + error;
        });
};