/*
	Main js entry for template ATON web-app

===============================================*/
let APP = ATON.App.realize();



// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

    document.APP = APP; 

    ATON.PATH_COLLECTION = "content/";
    ATON.FE.realize(); // Realize the base front-end

	ATON.FE.addBasicLoaderEvents(); // Add basic events handling
    
    ATON.SUI.setSelectorRadius(0);
    ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");

	APP.loadConfig("./config.json");

    ATON.on("AllNodeRequestsCompleted",()=>{APP.onAllNodeRequestsCompleted()});


  


    // config is loaded
ATON.on("APP_ConfigLoaded", ()=>
{
    console.log("config loaded");
  
    //Create ambient
    APP.ambient = ATON.createSceneNode("ambient");

    APP.ceiling =  ATON.createSceneNode(APP.config.ceiling.id).load(APP.config.ceiling.path);
    APP.ceiling.attachTo(APP.ambient);
    APP.room =  ATON.createSceneNode(APP.config.room.id).load(APP.config.room.path).attachTo(APP.ambient);
    APP.room.attachTo(APP.ambient);

    APP.ambient.attachToRoot();
    
    //Create objects
    APP.objects = {};
    APP.setupCustomSemanticMats();
    APP.setupCustomSemanticHovers();
    APP.config.objects.map((obj)=>
    {
        APP.objects[obj.id]=obj;
        //SceneNode
        ATON.createSceneNode(obj.id).load(obj.path)
        .setPosition(obj.pos.x,obj.pos.y,obj.pos.z)
        .setRotation(obj.rot.x,obj.rot.y,obj.rot.z)
        .attachToRoot();
        
        //SemanticNode
        let sem = obj.sem;
        ATON.createSemanticNode(obj.id+"_sem").load(sem.path)
        .setDefaultAndHighlightMaterials(APP.matSemDef, APP.matSemHL)
        .setOnHover(function(){console.log("HOVER")})
    //  .setPosition(sem.pos.x,sem.pos.y,sem.pos.z)
    //  .setRotation(sem.rot.x,sem.rot.y,sem.rot.z)
        .setPosition(obj.pos.x,obj.pos.y,obj.pos.z)
        .setRotation(obj.rot.x,obj.rot.y,obj.rot.z)
        .attachToRoot();
    });


    let homepov = APP.config.HomePov;
    ATON.Nav.setHomePOV(
        new ATON.POV()
            .setPosition(homepov.pos.x,homepov.pos.y,homepov.pos.z)
            .setTarget(homepov.target.x,homepov.target.y,homepov.target.z)
           // .setFOV(H.fov)
    );

  //  ATON.Nav.setFirstPersonControl()
   // ATON.Nav.requestHome(0.5);
    
});


//Da sostituire ambiente completo
 // ATON.createSceneNode("ceiling").load("models/room/ceiling.gltf")
 // .attachToRoot();


/*
  ATON.createSceneNode("quadro").load("models/objects/S1-21-CNR-FICLIT_RitrattoAldrovandi/aldrovandi_quadro.gltf")
  .setPosition(79.16108011600797, 2.489892709585605,-123.5091089272303)
  .setRotation(0.062146966021101695,0.4615939933738616,-0.14140775301020403)
  .attachToRoot(); 
  */


  APP.setupCustomSemanticHovers=()=>
  {
    //OVERRIDED FROM ATON.fe

        // Semantic
        ATON.on("SemanticNodeHover", (semid)=>{
            /*
            let S = ATON.getSemanticNode(semid);
            if (S === undefined) return;
    
            FE.showSemLabel(semid);
            FE._bSem = true;
    
            S.highlight();
            $('canvas').css({ cursor: 'crosshair' });
    
            if (ATON.SUI.gSemIcons) ATON.SUI.gSemIcons.hide();
            */
        });
        ATON.on("SemanticNodeLeave", (semid)=>{
            /*
            let S = ATON.getSemanticNode(semid);
            if (S === undefined) return;
    
            FE.hideSemLabel();
            FE._bSem = false;
    
            S.restoreDefaultMaterial();
            $('canvas').css({ cursor: 'grab' });
    
            if (ATON.SUI.gSemIcons) ATON.SUI.gSemIcons.show();
            */
        });

        //OVVERIDED FROM ATON.FE 
        ATON.FE.showSemLabel = (idSem)=>{
            if (!ATON.FE._bShowSemLabel) return;

            let _id = idSem.substring(0, idSem.length-(4));
            let _obj = APP.objects[_id];
            if(!_obj) return;
            let label = _obj.hoverLable;
            $("#idPopupLabel").html(label);
            $("#idPopupLabel").show();
        
            ATON.SUI.setInfoNodeText(label);
            
        };
  }

APP.setupCustomSemanticMats=()=>
{
    //  let matSemDef = ATON.MatHub.materials.semanticShape;
    APP.matSemDef =  new THREE.ShaderMaterial({
        uniforms: ATON.MatHub._uSem,
    
        vertexShader: ATON.MatHub.getDefVertexShader(),
        fragmentShader:`
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            varying vec3 vNormalV;
    
            uniform float time;
            uniform vec4 tint;
    
            void main(){
                //vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
    
                //float ff = dot(vNormalV, vec3(0,0,1));
                //ff = clamp(1.0-ff, 0.0, 1.0);
    
                float f = (1.0 * cos(time*2.0)); // - 0.5;
                //f = cos(time + (vPositionW.y*10.0));
                f = clamp(f, 0.0,1.0);
    
                gl_FragColor = vec4(tint.rgb, tint.a * f);
                //gl_FragColor = vec4(tint.rgb, ff);
            }
        `,
        transparent: true,
        depthWrite: false,
        //flatShading: false
        //opacity: 0.0,
    });

    //let matSemHL  = ATON.MatHub.materials.semanticShapeHL;
    APP.matSemHL  = new THREE.MeshBasicMaterial({ 
        color: ATON.MatHub.colors.sem, 
        transparent: true,
        depthWrite: false, 
        opacity: 0.2
        //flatShading: true
    });
   
}

//Setup actions:
ATON.on("DoubleTap", (e)=>
{
    if(!ATON._hoveredSemNode) return;
    APP.onTapSemNodes(ATON._hoveredSemNode);
})


APP.onTapSemNodes = (idSem)=>
{
    console.log(idSem + " tapped.");
    let _id = idSem.substring(0, idSem.length-(4));
    
    let povIn = APP.objects[_id].povIn;
    if(!povIn) return;

    APP._currentObjectActive = _id;

    var _pov = new ATON.POV("povIn_"+_id)
    .setPosition(povIn.pos.x,povIn.pos.y,povIn.pos.z)
    .setTarget( povIn.target.x,povIn.target.y,povIn.target.z);

    var SemNode = ATON.getSemanticNode(_id+"_sem");
    SemNode.hide();

    ATON.getSceneNode("ambient").hide();
    ATON.Nav.requestPOV(_pov, 0.6);
    ATON._mainRoot.background = new THREE.Color("rgb(17,17,17)");
    document.getElementById("InfoContainer").style.display="block";
   
    //Hide other Scene and Semantic Nodes of objects
    APP.config.objects.map((o)=>
    {
        if(o.id == APP._currentObjectActive) return;
        ATON.getSceneNode(o.id).hide();
        ATON.getSemanticNode(o.id+"_sem").hide();
    })

    //OPEN SIDEBAR
    switch(idSem)
    {
        case "quadroSem":
            console.log("Il quadro è stato cliccato");

    }
}

APP.CloseObject = ()=>
{
    //GET CURRENT OBJECT from APP._currentObjectActive = idSem; todo
    let povOut = APP.objects[APP._currentObjectActive].povOut;
    var _pov = new ATON.POV("povOut_"+ APP._currentObjectActive)
    .setPosition(povOut.pos.x,povOut.pos.y,povOut.pos.z)
    .setTarget( povOut.target.x,povOut.target.y,povOut.target.z);
    ATON.Nav.requestPOV(_pov, 0.6);
    
    
    ATON.getSceneNode("ambient").show();

    //Show Semantic and Scene Nodes of objects
    APP.config.objects.map((o)=>
    {
        ATON.getSceneNode(o.id).show();
        ATON.getSemanticNode(o.id+"_sem").show();
    })

  //  ATON.getSemanticNode(APP._currentObjectActive+"_sem").show();
    document.getElementById("InfoContainer").style.display="none";
    ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");
    APP._currentObjectActive = null;
}


APP.openIIIFview=(path)=>
{

    var initialized = false;
    if(!initialized)
    {
        $('#miradorViewer').on('mouseup', ()=>
        {
            onMouseUp();
        });
    }

    const onMouseUp = ()=>
    {
        if(!initialized)
        {
            let closeBtn = document.getElementsByClassName("MuiButtonBase-root MuiIconButton-root mirador-window-close")[0];
            if(closeBtn)
            {
                closeBtn.onclick = function()
                {
                    console.log("forced Closed")
                    document.getElementById("miradorViewer").style.display="none"
                };
                initialized = true;
            }
        }
    }
        document.getElementById("miradorViewer").style.display="block";

        var mirador = Mirador.viewer({
            "id": "miradorViewer",
            "manifests": "./cospiIIIFManifest.json",
             // "https://bub.unibo.it/iiif/2/manifest/bub/manoscritti/bub_rot002.json",
            "windows": [
              {
                "loadedManifest": "./cospiIIIFManifest.json",
                "canvasIndex": 1,
                "thumbnailNavigationPosition": 'far-bottom'
              }
            ]
          });
          document.mirador = mirador;
    }
};





/* APP.update() if you plan to use an update routine (executed continuously)
APP.update = ()=>{

};
*/
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
    
    

APP.onAllNodeRequestsCompleted=()=>
{
    APP.ambient.children[1].traverse((o)=>
    {
        console.log(o.name)
    })
}


// Run the App
window.addEventListener('load', ()=>{
	APP.run();


    //Active Gizmos:
    
    ATON.useGizmo(true);
    ATON._gizmo.setMode("translate");      
    ATON.FE.attachGizmoToNode("quadro");
});
