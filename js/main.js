/*
	Main js entry for template ATON web-app

===============================================*/
let APP = ATON.App.realize();

// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

    document.APP = APP;

	APP.loadConfig("./config.json");

    ATON.PATH_COLLECTION = "content/";
    ATON.FE.realize(); // Realize the base front-end

	ATON.FE.addBasicLoaderEvents(); // Add basic events handling
    
    ATON.SUI.setSelectorRadius(0);
    ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");

//Da sostituire ambiente completo
  ATON.createSceneNode("ceiling").load("models/room/ceiling.gltf")
  .attachToRoot();

//Oggetti
  ATON.createSceneNode("quadro").load("models/objects/S1-21-CNR-FICLIT_RitrattoAldrovandi/aldrovandi_quadro.gltf")
  .setPosition(79.16108011600797, 2.489892709585605,-123.5091089272303)
  .setRotation(0.062146966021101695,0.4615939933738616,-0.14140775301020403)
  .attachToRoot(); 




//SEMANTIC NODES:

//  let matSemDef = ATON.MatHub.materials.semanticShape;
  let matSemDef =  new THREE.ShaderMaterial({
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
let matSemHL  = new THREE.MeshBasicMaterial({ 
    color: ATON.MatHub.colors.sem, 
    transparent: true,
    depthWrite: false, 
    opacity: 0.2
    //flatShading: true
});



ATON.createSemanticNode("quadroSem")                             
.load("models/quadro_sem.glb")                  
.setDefaultAndHighlightMaterials(matSemDef, matSemHL)
.setOnHover(function(){console.log("HOVER")})
.setPosition(79.16108011600797, 2.489892709585605,-123.5091089272303)
.setRotation(0.062146966021101695,0.4615939933738616,-0.14140775301020403)
.attachToRoot()
.onSelect = function(){console.log("EI")}


//Setup actions:
ATON.on("DoubleTap", (e)=>
{
    console.log(e)
    if(!ATON._hoveredSemNode) return;
    APP.onTapSemNodes(ATON._hoveredSemNode);
})


APP.onTapSemNodes = (idSem)=>
{
    console.log(idSem + " tapped.");
    APP._currentObjectActive = idSem;

    var SemNode = ATON.getSemanticNode(idSem);
    var _pov = new ATON.POV("pov_face").setPosition(80.57858627353247, 2.5283589807655114,-123.33100102497511).setTarget( 79.00093707565502,2.492843324896314,-123.2777427967964);
   
   // ATON.Nav.requestPOVbyNode(SemNode, 0.5);
    SemNode .hide();
    ATON.getSceneNode("ceiling").hide();
    ATON.Nav.requestPOV(_pov, 0.6);
    ATON._mainRoot.background = new THREE.Color("rgb(17,17,17)");
    document.getElementById("InfoContainer").style.display="block";
    //Hide other objects to do


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
    var _pov = new ATON.POV("pov_face").setPosition(82,3,-124).setTarget(78,2,-123,2.5,-123.5);
    ATON.Nav.requestPOV(_pov, 0.6);
    ATON.getSceneNode("ceiling").show();
    ATON.getSemanticNode(APP._currentObjectActive).show();
    document.getElementById("InfoContainer").style.display="none";
    ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");
}

};




/* APP.update() if you plan to use an update routine (executed continuously)
APP.update = ()=>{

};
*/

APP.loadConfig = (path)=>{
    return $.getJSON( path, ( data )=>{
        //console.log(data);
        console.log("Loaded config: "+path);

        APP.conf = data;
		ATON.fireEvent("APP_ConfigLoaded");
	});
};


// Run the App
window.addEventListener('load', ()=>{
	APP.run();


    //Active Gizmos:
    /*
    ATON.useGizmo(true);
    ATON._gizmo.setMode("rotate");      
    ATON.FE.attachGizmoToNode("quadro");
   */
});
