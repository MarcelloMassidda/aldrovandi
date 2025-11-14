
var helper = {};

helper.usePhoton = false;

helper.init=()=>
{
    helper.isActive=true;

    ATON.on("KeyPress", (k)=>{
        if(k==="+"){helper.setActive(true)}

        if (k === '0' && helper.isActive) { helper.alertGizmo(); }
        if (k === '1' && helper.isActive) { helper.attachGizmoToActiveNode(); }

        if (k === '2' && helper.isActive) { if(APP.lowObjCollection) APP.lowObjCollection.toggle(); }
        if (k === '3' && helper.isActive) { APP.useGizmo("quadro")}
        if (k === '4' && helper.isActive) { console.log(ATON.getSceneNode("quadro").rotation)}
        if (k === '5' && helper.isActive) { if(APP.ceiling) APP.ceiling.toggle(); }

        
        if (k === 'q' && helper.isActive) { helper.setGizmoMode("translate"); }
        if (k === 'w' && helper.isActive) { helper.setGizmoMode("rotate"); }
        if (k === 'e' && helper.isActive) { helper.setGizmoMode("scale"); }
        if (k === 'd' && helper.isActive) { helper.getPosandRotofCurrentGizmedNode(); }
        if (k === 'r' && helper.isActive) { helper.toggleNAV(); }
        if (k === 't' && helper.isActive) { helper.getCurrentPov(); }


        if (k === "y" && helper.isActive) { helper.toogleLoader(); }
        if (k === "u" && helper.isActive) { helper.getQueryDataScene(); }
        if (k==' ') {APP.toggleCurrentAudio();}
    });
    

    //Connect remote control:
    if(!ATON.Photon) return;
    if(helper.usePhoton){
       ATON.Photon.connect("x");
       ATON.Photon.joinSession("a");
    }


    ATON.Photon.on("fadeFrom", ()=>{APP.fadeFromBlack(1000);});
    ATON.Photon.on("fadeTo", ()=>{APP.fadeToBlack(1000);});

 //   ATON.Photon.on("performanceSended", (p)=>{console.log("Performance sended:");  console.log(performance)});
 //   ATON.Photon.on("performanceAsked", ()=>{ATON.Photon.fire("performanceSended",performance)});
 
    ATON.Photon.on("myRemoteLog", (l)=>{console.log("LOG:"); console.log(l)});

    ATON.Photon.on("testSUI", ()=>{APP.testUserSUI()});


    ATON.Photon.on("testFade",()=>{APP.testFade()});
}

APP.testFade = ()=>{
        APP.setupForFade();
        ATON._mainRoot.add(APP.blackPlaneFade);
        APP.updateFadePlanePosition();

    }


APP.isloading = false;


helper.toggleHelper=()=>
{
    var _active = !helper.setActive;
    helper.setActive(_active)
    if(_active){window.alert("Helper è attivo")}
}

helper.setActive=(b)=>
{
    helper.isActive = b
}

// Function to copy text to clipboard
helper.copyToClipboard=(text)=> {
    // Create a textarea element to hold the text temporarily
    var textarea = $("<textarea>").val(text).appendTo("body").select();
    // Execute the copy command
    document.execCommand("copy");
    // Remove the textarea from the DOM
    textarea.remove();
}
  



helper.getQueryDataScene=()=>
{
    console.log(ATON._queryDataScene.p);
}

helper.toogleLoader=()=>
{
   if(APP.isloading)
   {
    $("#idLoader").hide();
    APP.isloading= true;
   }
   else
   {
    $("#idLoader").show();
    APP.isloading=false;
   }

}
helper.createUI=()=>
{
   $("body").innerHTML= `
    <div id="helpertoolbox">
    <button>MY TOOL BOX</button>
    </div>
    `
}
helper.returnNode=(idnode)=>
{
    var n = null;
    n = ATON.getSceneNode(idnode);
    if(!n){ n = ATON.getUINode(idnode);}
    if(!n){ n = ATON.getSemanticNode(idnode);}
    return n;
}
helper.spawnEmptyWithGizmos=()=>
{
    var empty = ATON.getSceneNode("empty");
    if(!empty)
    {
        empty = ATON.createSceneNode("empty");
    }

    ATON.useGizmo(true);
    helper.ATON_setupGizmo();
    ATON._gizmo.setMode(mode);      
    ATON.FE.attachGizmoToNode(id);
}


helper.ATON_setupGizmo=()=>{

    
        if (!ATON._bGizmo){
            if (ATON._gizmo) ATON._gizmo.detach();
            return;
        }
    
        if (ATON.Nav._camera === undefined) return;
        if (ATON._renderer === undefined) return;
    
        if (ATON._gizmo === undefined){
            ATON._gizmo = new THREE.TransformControls( ATON.Nav._camera, ATON._renderer.domElement );
            ATON._rootUI.add(ATON._gizmo.getHelper())
    
            ATON._gizmo.setMode("rotate");
    
            ATON._gizmo.addEventListener('dragging-changed', function( event ){
                let bDrag = event.value;
    
                ATON.Nav.setUserControl(!bDrag);
                ATON._bPauseQuery = bDrag;
    
                if (!bDrag){
                    ATON.recomputeSceneBounds();
                    ATON.updateLightProbes();
                    console.log(ATON._gizmo.object)
                }
            });
        }
        else {
            ATON._gizmo.camera = ATON.Nav._camera;
            ATON._gizmo.detach();
        }
}

helper.setGizmoMode=(mode)=>
{
    ATON._gizmo.setMode(mode);
    //alert(mode);
}

helper.alertGizmo=()=>
{

    if(APP.currentGizmedNode){  ATON.useGizmo(true);  APP.currentGizmedNode=null}
    var idnode = prompt("inserisci nome del nodo");
    var n = helper.returnNode(idnode);
    if(!n) {alert("Non trovato"); return;}
    
    APP.currentGizmedNode = idnode;
    ATON.useGizmo(true);
    helper.ATON_setupGizmo();
    ATON._gizmo.attach( n );
}

helper.attachGizmoToActiveNode=()=>{

    let idNode = APP._currentObjectActive;
    if(!idNode) return;

    var n = helper.returnNode(idNode);
    APP.currentGizmedNode = idNode;
    ATON.useGizmo(true);
    helper.ATON_setupGizmo();
    ATON._gizmo.attach( n );
}


helper.getPosandRotofCurrentGizmedNode=()=>
{
    var n = helper.returnNode(APP.currentGizmedNode);
    var pos = {x:n.position.x, y:n.position.y, z:n.position.z};
    var rot = {x:n.rotation.x, y:n.rotation.y, z:n.rotation.z};
    var info = JSON.stringify({NR:APP._currentObjectActive, pos,rot});
    console.log(info);

    helper.copyToClipboard(info);
    alert("COPIED IN CLIPBOARD: " + info);
}

helper.getNodes=()=>
{
    const returtnIdList = (nodes)=>
    {
        var idList = "";

        for (const [key, value] of Object.entries(nodes)) {
            idList.concat = " - " + key;            
    }
    var s = returtnIdList(ATON.snodes);
    var ui =  returtnIdList(ATON.uinodes);
    var sem =  returtnIdList(ATON.semnodes);
    alert("SCENE NODES:/n"+s+"/n/n"+"UI NODES:/n"+ui + "SEM NODES/n"+sem);
    }
}


helper.getCurrentPov=()=>
{
    var p = ATON.Nav._currPOV;
    var infoPOV = 
    {
        pos:{x:p.pos.x, y:p.pos.y,z:p.pos.z},
        target:{x:p.target.x, y:p.target.y,z:p.target.z}
    }
    const _infopov = JSON.stringify(infoPOV)
    console.log(_infopov);
    helper.copyToClipboard(_infopov);
    alert("COPIED IN CLIPBOARD: " + _infopov);
}

APP.currentMode = "first"
helper.toggleNAV=()=>
{
    if(APP.currentMode=="orbit")
    {
        ATON.Nav.setFirstPersonControl();
        APP.currentMode="first";
        return;
    }
    if(APP.currentMode=="first")
    {
        ATON.Nav.setOrbitControl();
        APP.currentMode="orbit";
        return;
    }
}


APP.getBoundingBox = (nodeId = APP._currentObjectActive )=>{
   console.log("NODE ID IS:"  + nodeId)
    var object = ATON.getSceneNode(nodeId);
    if(!object){ console.log("NO OBJECT"); return;}
    
    // Compute bounding box
    const box = new THREE.Box3().setFromObject(object);
    const boxSize = new THREE.Vector3();
    box.getSize(boxSize);

    // Create a bounding box mesh
    const boxGeometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false });
    const boundingBoxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boundingBoxMesh.position.copy(box.getCenter(new THREE.Vector3()));
    ATON.getRootScene().add(boundingBoxMesh);
    return boundingBoxMesh;
}

// Function to export as GLB
APP.exportGLB=(scene,filename) =>{
    console.log("exporting");
    console.log(scene);

    const exporter = new THREE.GLTFExporter();
    exporter.parse(scene, (gltf) => {

        const blob = new Blob([gltf], { type: 'application/octet-stream' });
        
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("dajee")
    }, { binary: true });
}



APP.computeBoundingBox = async(nodeId = APP._currentObjectActive)=>{
    const bb = await APP.getBoundingBox(nodeId);
    console.log("BBBBB");
    console.log(bb);
    //exportGLTF(bb, nodeId);
//    APP.exportGLB(bb, nodeId+".glb");
}   


APP.testRot=()=>{

    var object = ATON.getSceneNode(APP._currentObjectActive);
    var dataObject = ()=>APP.config.rooms[3].objects.filter(obj => obj.id === APP._currentObjectActive)[0];
    var obj = dataObject();
  
   
    function degToRad(deg) {
        return deg * Math.PI / 180;
    }
    
    // Blender Euler angles in degrees
    const blenderX = obj.rot.x;
    const blenderY = obj.rot.y;
    const blenderZ = obj.rot.z;

    // Convert degrees to radians
    const eulerBlender = new THREE.Euler(
       - degToRad(blenderX),
        degToRad(blenderZ),
        -degToRad(blenderY),
        'ZYX' // Set to 'ZYX' for correct conversion order
    );
    
    // Convert Blender Euler to Quaternion
    const blenderQuat = new THREE.Quaternion().setFromEuler(eulerBlender);
    
    // Transformation Quaternion (Z-up → Y-up: Rotate -90° around X)
    const conversionQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-Math.PI / 2, 0, 0, 'ZYX') // Also using 'ZYX'
    );
    
    // Apply coordinate system transformation
    blenderQuat.premultiply(conversionQuat);
    
    // Assign to the Three.js object
    object.quaternion.copy(blenderQuat);
    
    // Debugging - Convert back to Euler to check values
    const debugEuler = new THREE.Euler().setFromQuaternion(blenderQuat, 'ZYX');
    console.log("Converted Euler (ZYX order):", debugEuler);
    console.log("Converted Quaternion:", blenderQuat);
}

APP.QuaternionTest=()=>{

    var object = ATON.getSceneNode(APP._currentObjectActive);
    const w = 0.006372; // W component
    const x =-0.03685;   // X component
    const y = -0.078737;   // Y component
    const z = -0.996194;   // Z component
    const blenderQuat = new THREE.Quaternion(x, y, z, w); // Note: Three.js takes (X, Y, Z, W)

    // Convert from Blender's Z-up to Three.js' Y-up
    const conversionQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ') // Rotation to fix the coordinate system
    );
    
    // Apply transformation
    blenderQuat.premultiply(conversionQuat);
    
    // Assign to Three.js object
    object.quaternion.copy(blenderQuat);


}

APP.testRot2=()=>{


    var object = ATON.getSceneNode(APP._currentObjectActive);
    var dataObject = ()=>APP.config.rooms[3].objects.filter(obj => obj.id === APP._currentObjectActive)[0];
    var obj = dataObject();

   
    function degToRad(deg) {
        return deg * Math.PI / 180;
    }
    
    // Blender Euler angles in degrees
    const _x = obj.rot.x;
    const _y = obj.rot.y;
    const _z = obj.rot.z;

    
    // Blender Euler Angles (Z-up)
    const blenderEuler = new THREE.Euler(
        degToRad(_x),   // X
        degToRad(_y),  // Y
        degToRad(_z),   // Z
        'XYZ' // Blender’s Euler order
    );
    
    // Convert to Quaternion
    const blenderQuat = new THREE.Quaternion().setFromEuler(blenderEuler);
    
    // Apply Z-up to Y-up transformation (Rotate -90° around X)
    const conversionQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-Math.PI / 2, 0, Math.PI, 'ZYX') // Add 180° Z correction if needed
    );
    
    // Adjust quaternion to match Three.js
    blenderQuat.premultiply(conversionQuat);
    
    // Convert back to Three.js Euler
    const threeEuler = new THREE.Euler().setFromQuaternion(blenderQuat, 'XYZ');
    
    console.log("Converted Three.js Euler:", threeEuler);
    object.quaternion.copy(blenderQuat);
    
}


const getnewRots =()=>{
    var rots =ATON.getSceneNode("rots4");
    var childs = rots.children[0].children;
    childs.forEach(r => {
        console.log(r.name);
        console.log("x");
        console.log( r.rotation.x);
        console.log("y")
        console.log(r.rotation.y)
        console.log("z")
        console.log(r.rotation.z)
        console.log("-----------------")
    });
}



//GLTF EXPORTER:

function exportGLTF( input, filename) {

    const gltfExporter = new THREE.GLTFExporter().setTextureUtils( THREE.TextureUtils );

    const options = {
        trs:false,
        onlyVisible: true,
        binary: false,
        maxTextureSize: 4096
    };
    gltfExporter.parse(
        input,
        function ( result ) {

            if ( result instanceof ArrayBuffer ) {

                saveArrayBuffer( result, filename+'.glb' );

            } else {

                const output = JSON.stringify( result, null, 2 );
                console.log( output );
                saveString( output, filename+'.gltf' );

            }

        },
        function ( error ) {

            console.log( 'An error happened during parsing', error );

        },
        options
    );

}


/*
const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function save( blob, filename ) {

    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {

    save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}


function saveArrayBuffer( buffer, filename ) {

    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}
    */



// Process roto-translation from single GLTF with all children to NR-roto-translation json.

const room1SemsConvexHullPath  =     "models/room1/semObjects/convex/ALLSEMS_room1.glb";
const room1SemsForRotsPath  =     "models/room1/rots.glb";
const room2SemsForRotsPath  =     "models/room2/ALL_sems_Room2.glb";
const room3SemsForRotsPath  =     "models/room3/ALL_sems_Room3.glb";
const room4SemsForRotsPath  =     "models/room4/semObjs/convex/ALL_Sems.glb";
const room5SemsForRotsPath  =     "models/room5/semObjs/ALL_Sems_5.glb";
const room5NewSemsForRotsPath  =     "models/room5/7nuovi_sala5.gltf";
const room6SemsForRotsPath  =     "models/room6/semObjs/ALL_Sems_room6.gltf";



APP.process_semsRoom1=()=>{ APP.process_sems("hull1",room1SemsForRotsPath) }
APP.process_semsRoom2=()=>{ APP.process_sems("hull2",room2SemsForRotsPath) }
APP.process_semsRoom3=()=>{ APP.process_sems("hull3",room3SemsForRotsPath) }
APP.process_semsRoom4=()=>{ APP.process_sems("hull4",room4SemsForRotsPath) }
APP.process_semsRoom5=()=>{ APP.process_sems("hull5",room5SemsForRotsPath) }
APP.process_semsRoom6=()=>{ APP.process_sems("hull6",room6SemsForRotsPath) }

APP.process_semsRoom5New=()=>{ APP.process_sems("hull5new",room5NewSemsForRotsPath) }


APP.process_sems=(nodeId,path)=>{
    const onLoad = ()=>{
       
       //Compose data:
       let data = {};
       let SemParent = ATON.getSceneNode(nodeId);
       console.log(SemParent);
       let sems = SemParent.children[0].children;
       
       sems.forEach(s => {
           let _name =  s.name.replace(/_convex$/, "");
           console.log(_name);
         data[_name]= {
            pos:{x:s.position.x,y:s.position.y,z:s.position.z},
            rot:{x:s.rotation._x,y:s.rotation._y,z:s.rotation._z}
        }
        });

        //Save data to file:
        downloadJSONOnTheFly(nodeId,data);
    }
    APP.fastLoadModel(nodeId,path,onLoad);
}

APP.fastLoadModel =(nodeId,path,onload)=>{
    ATON.createSceneNode(nodeId).load(path, onload).attachTo(APP.room);
}


const downloadJSONOnTheFly=(name , obj)=>{
    var storageObj = obj; // {value:"ciao"};
    document.body.innerHTML+=`<a id="downloadAnchorElem" style="display:none"></a>"`;
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", name+".json");
    dlAnchorElem.click();
    dlAnchorElem.remove();
}



APP.compose