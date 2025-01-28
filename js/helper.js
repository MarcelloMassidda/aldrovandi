var helper = {};


helper.init=()=>
{
    helper.isActive=true;

    ATON.on("KeyPress", (k)=>{
        if(k==="+"){helper.setActive(true)}
        
        if (k === '1' && helper.isActive) { if(APP.ceiling) APP.ceiling.toggle(); }
        if (k === '2' && helper.isActive) { if(APP.lowObjCollection) APP.lowObjCollection.toggle(); }
        if (k === '3' && helper.isActive) { APP.useGizmo("quadro")}
        if (k === '4' && helper.isActive) { console.log(ATON.getSceneNode("quadro").rotation)}

        if (k === '0' && helper.isActive) { helper.alertGizmo(); }
        if (k === 'q' && helper.isActive) { helper.setGizmoMode("translate"); }
        if (k === 'w' && helper.isActive) { helper.setGizmoMode("rotate"); }
        if (k === 'e' && helper.isActive) { helper.getPosandRotofCurrentGizmedNode(); }
        if (k === 'r' && helper.isActive) { helper.toggleNAV(); }
        if (k === 't' && helper.isActive) { helper.getCurrentPov(); }
        if (k === "y" && helper.isActive) { helper.toogleLoader(); }
        if (k === "u" && helper.isActive) { helper.getQueryDataScene(); }
        if (k==' ') {helper.toggleAudio();}
    });
    
}


APP.isloading = false;
helper.toggleAudio=()=>
{
    if(!APP._audio) return;
    if(!APP._audio.paused){APP._audio.pause()}
    else{APP._audio.play()}
}

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

helper.getPosandRotofCurrentGizmedNode=()=>
{
    var n = helper.returnNode(APP.currentGizmedNode);
    var pos = {x:n.position.x, y:n.position.y, z:n.position.z};
    var rot = {x:n.rotation.x, y:n.rotation.y, z:n.rotation.z};
    var info = JSON.stringify({pos,rot});
    alert(info);    
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


//Load del config
APP.loadConfig = (path)=>{
    console.log("configuring ")
    return $.getJSON( path, ( config )=>{
        
        console.log("Loaded config: "+path);
        console.log(config);
    
        APP.config = config;
        ATON.fireEvent("APP_ConfigLoaded");
    });
    };
    