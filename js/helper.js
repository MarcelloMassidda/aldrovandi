var helper = {};

helper.init=()=>
{
    ATON.on("KeyPress", (k)=>{
        
        if (k === '0') { helper.alertGizmo(); }
        if (k === 'q') { helper.setGizmoMode("translate"); }
        if (k === 'w') { helper.setGizmoMode("rotate"); }
        if (k === 'e') { helper.getPosandRotofCurrentGizmedNode(); }
        if (k === 'r') { helper.toggleNAV(); }
        if (k === 't') { helper.getCurrentPov(); }
        if (k === "y") { helper.toogleLoader(); }
    });
    
}


APP.isloading = false;
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
    ATON._gizmo.setMode(mode);      
    ATON.FE.attachGizmoToNode(id);
}

helper.setGizmoMode=(mode)=>
{
    ATON._gizmo.setMode(mode);
    //alert(mode);
}

helper.alertGizmo=()=>
{

    if(APP.currentGizmedNode){  ATON.useGizmo(true); APP.currentGizmedNode=null}
    var idnode = prompt("inserisci nome del nodo");
    var n = helper.returnNode(idnode);
    if(!n) {alert("Non trovato"); return;}
    
    APP.currentGizmedNode = idnode;
    ATON.useGizmo(true);
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
    alert(JSON.stringify(infoPOV));
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
    