/*
//a/webapp
?experiment=true
?controller=true
?session = idSession | generated | null (default=1)
*/

let MIND = {}; //Psychologist Experiment multiuser session controller
let state = {};
let currentRecord ={};
const timePOV = 0;

MIND.init = (minder=null)=>
{
    //è un esperimento?
    var isExperiment = false;
    
    if(ATON.FE.urlParams) isExperiment = ATON.FE.urlParams.get('experiment') ? true : false;
    console.log("Is an experiment: " + isExperiment);
    MIND.isExperiment = isExperiment;
    if(!isExperiment) return null;

    MIND.minder = minder;

    //è inserito un id univoco per la sessione?
    state.session = MIND.getSessionID();

    //sono lo sperimentatore (true)? o l'utente (false)?
    var isController = ATON.FE.urlParams.get('controller') ? true : false;
    
    //MIND SETUP:
    ATON.VRoadcast.bSendState = !isController // Il controllore non manda il proprio stato
    ATON.VRoadcast.setAvatarsVisibility(isController) //L'utente ha la visibilità degli avatar = false
    ATON.VRoadcast.connect(state.session); //Entrambi si connettono alla stessa sessione
    console.log(`%cMIND IS CONNECTED: ${state.session}`, 'background: #222; color: #bada55');

    state.role = isController ? "controller" : "user";

    //APP SPECIFIC Minder setup
    MIND.minder.setup(state.role);

    // Initial status message (our HTML stuff)
    //setStatus(false);

    // We handle connect/disconnect to change status message
    ATON.on("VRC_Connected", ()=>{
      console.log("CONNECTED")
   //   setStatus(true);
    });
    ATON.on("VRC_Disconnected", ()=>{
      console.log("Disconnected")
    //  setStatus(false);
    });
    return MIND;
}

/*
// Helper function to set status message
let setStatus = (b)=>{
  if (b){
      let numUsers = ATON.VRoadcast.getNumUsers(); // Retrieve current number of connected users

      if (numUsers <= 1) $("#idStatus").html("Connected (just you!)");
      else $("#idStatus").html("Connected ("+numUsers+" users)");
      
      $("#idStatus").css("background-color","rgba(0,150,0, 0.3)");
  }
  else {
      $("#idStatus").html("Disconnected<br>is VRoadcast service up and running?");
      $("#idStatus").css("background-color","rgba(150,0,0, 0.3)");
  }
};
*/

//CONTROLLER USER INPUTS:
MIND.promptUserInput=(options)=>
{
  /*
    o.idPopup?
    o.idInput?
    o.type? default: "text", "radio"
    o.radios=[{id,value,text}]
    o.valuator(callback)? TO ADD
  */

  const o = options;
  if(!o.type) o.type = "text";
  if(!o.idPopup) o.idPopup = "promptPopup";
  if(!o.idInput) o.idInput = "promptInput";


  return new Promise((resolve , reject)=>{

    const onClickConfermBtn = ()=>
    {
        const userInput = UI.DataEntry.getValue({type:o.type,id:o.idInput});
        UI.removePopup(o.idPopup);
        resolve(userInput);
    }
    const onClickResumeBtn = ()=>
    {
      UI.removePopup(o.idPopup);
      resolve(null);
    }

    console.log("in promt:")
    console.log(o);
    
    o.id=o.idInput;
    const _input = UI.DataEntry.create(o);
    const _conferm = UI.button({id:"confermBtn",text:"Conferma",onpress:onClickConfermBtn});
    const _resume = UI.button({id:"resumeBtn",text:"Annulla",onpress:onClickResumeBtn});
    var btnGroup = UI.buttonGroup({id:"promptBtnGroup", classList:"controllerSideBarGroup", buttons:[_conferm,_resume]});


    const _popup = UI.popup({id:o.idPopup,content:[_input,btnGroup]});
    $("body").append(_popup);
    $("#"+o.idInput).focus();
  })
}

//TASK/TIME MANAGEMENT
MIND.getSessionID = ()=>
{
  var sessionID = MIND.getQueryParam("session");
  console.log("SESSION ID IS: " + sessionID);
  if(!sessionID) {sessionID = "1"}
  if(sessionID=="generated") {sessionID = Date.now().toString() + "Test";} 
  return sessionID;
}

MIND.returnNow = ()=>{return Date.now();}

//DB
MIND.getIfExist=(id)=>
{
  const item = localStorage.getItem(id);
  const result = item ? JSON.parse(item) : null;
  return result;
}
MIND.get=(id)=>{return MIND.getIfExist(id)}
MIND.create=(id,data)=>{ localStorage.setItem(id,JSON.stringify(data));}

MIND.update=(id,data)=>
{
  var obj = MIND.getIfExist(id);
  if(!obj) return;
  obj[data.key]=data.value;
  MIND.create(id,obj); 
}


MIND.updateDB=(state)=>
{ 
  var DB;
  var local_DB = localStorage.getItem("Aldrovandi_DB");
  DB = local_DB ? JSON.parse(local_DB) : {rows:[]};
  DB.rows.push(state);
  localStorage.setItem("Aldrovandi_DB",JSON.stringify(DB));
  return DB;
}

MIND.getAllItemsFromLocalStorage=()=>{
  // Initialize an empty array to store items
  var allItems = [];

  // Loop through all keys in local storage
  for (var i = 0; i < localStorage.length; i++) {
      // Get the key at index i
      var key = localStorage.key(i);
      // Get the value associated with the key
      var value = JSON.parse(localStorage.getItem(key));
      // Create an object with the key-value pair and add it to the array
      allItems.push( value );
  }
  // Return the array containing all key-value pairs from local storage
  return MIND.orderByDate(allItems);
}

MIND.orderByDate=(data)=>{
 return data.sort((a, b) => {
  // Check if 'date' property is missing in 'a' or 'b'
  if (a.date === undefined && b.date === undefined) return 0;
  if (a.date === undefined) return -1;
  if (b.date === undefined) return 1;
  
  // Compare 'date' properties if both exist
  return a.date - b.date;
});
}

MIND.deleteAllItemsFromLocalStorage=()=>
{
   // Loop through all keys in local storage
        for (var i = 0; i < localStorage.length; i++) {
            // Get the key at index i
            var key = localStorage.key(i);
            // Remove the item associated with the key from local storage
            localStorage.removeItem(key);
}}



//----------UTILITIES
MIND.getQueryParam=(param)=>
{
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

//Inject UITOOLKIT:
MIND.injectUI=(uitoolkit_path,UIcss_path,callback=null)=>
{
  var jsIsLoaded = false;
  var cssIsLoaded = false;

  let jss = document.createElement("script");
  jss.type = "module";
  jss.src = uitoolkit_path;

  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = UIcss_path;

  if(!callback) return;

  const tryCallback=()=>{if(jsIsLoaded && cssIsLoaded)callback(window.UI)}
  jss.onload = ()=> {jsIsLoaded=true;tryCallback(window.UI)}
  link.onload = ()=>{cssIsLoaded=true;tryCallback(window.UI)}
  
  document.documentElement.firstChild.appendChild(jss);
  document.documentElement.firstChild.appendChild(link);
}


MIND.downloadAllRecordsCSV=()=>
{
  const _json = MIND.getAllItemsFromLocalStorage();
  const _csv = MIND.convertJsonToCsv(_json);
  MIND.downloadCsv(_csv);
}

MIND.convertJsonToCsv=(jsonData)=> {
    // Extract headers from JSON keys
    //const headers = Object.keys(jsonData[0]);
    const headers = MIND.minder.config().dataFormat.props;

    // Extract data rows from JSON values
    const rows = jsonData.map(obj =>
      headers.map(header => obj[header]).join(',')
    );

    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n');
  }

MIND.downloadCsv=(csvData)=> {
    // Create a Blob object
    const blob = new Blob([csvData], { type: 'text/csv' });

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';

    // Trigger a click event on the link to start the download
    document.body.appendChild(a);
    a.click();

    // Clean up by revoking the temporary URL and removing the link element
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}


//POV
MIND.requestPOV=(infoPOV)=>
{

  const p = MIND.returnPOVfromInfo(infoPOV);
  ATON.Nav.requestPOV(p,timePOV);
}

MIND.returnPOVfromInfo=(infoPOV)=>
{
  const p = infoPOV;
  var _pov = new ATON.POV("pov_"+p.id)
  .setPosition(p.pos.x,p.pos.y,p.pos.z)
  .setTarget( p.target.x,p.target.y,p.target.z);
  return _pov;
}



//COLLIDERS:



/*    
    //Test colliders
    const colliderA = MIND.createBox("colliderA");
    const colliderB = MIND.createBox("colliderB", {x:6,y:0,z:3.72});
//     colliderA.attachToRoot();
//    colliderB.attachToRoot();
    const _cA = new THREE.BoxHelper( colliderA, 0xffff00 );
    const _cB = new THREE.BoxHelper( colliderB, 0xffff00 );

    AldrovandiMind.colliders=[_cA,_cB];

*/

MIND.setColliders=(colliders)=>
{
  if(!colliders) return;
  if(colliders.length==0) return;

  MIND.colliders=colliders;
 // MIND.needsUpdate=true;
}


MIND.createBox=(id,pos=null)=>
{
  const testPosition={x:3.4,y:0,z:3.72}  
  if(!pos) pos = testPosition;

  // Create a box geometry
var geometry = new THREE.BoxGeometry(1, 1, 1); // Width, height, and depth of the box
// Create a material
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
// Create a mesh using the geometry and material
var cube = new THREE.Mesh(geometry, material);

let _cube = new THREE.Object3D();
_cube.add(cube);
let atonCube = ATON.createSceneNode(id).add(_cube);
atonCube.setPosition(pos.x,pos.y,pos.z);

return atonCube;
}

MIND.createColliderBox=(id,pos=null)=>
{
  const trigger = new THREE.Box3();
  trigger.setFromCenterAndSize(pos, new THREE.Vector3(1,1,1));
  
  
}


/*
MIND.update=()=>
{

  let P  = ATON.Nav._currPOV.pos;
  MIND.colliders.forEach(c => {
    
    if(c.containsPoint(P))
    {
      console.log("DAJE DE CAZZO ");
      console.log(c);
    }
  });
}
*/


/*

  const colliderA = MIND.createBox("colliderA");
  const _cA = new THREE.BoxHelper( colliderA, 0xffff00 );
  var scene = ATON.getSceneRoot();
  scene.add(_cA);

var objectBox = new THREE.Box3()
objectBox.setFromCenterAndSize( new THREE.Vector3(0,0,0), new THREE.Vector3(4,4,4))
objectBox.containsPoint(ATON.Nav._currPOV.pos)


*/