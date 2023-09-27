/*
	Main js entry for template ATON web-app

===============================================*/
let APP = ATON.App.realize();

// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

     
	APP.loadConfig("./config.json");

    ATON.PATH_COLLECTION = "models/";
    ATON.FE.realize(); // Realize the base front-end

	ATON.FE.addBasicLoaderEvents(); // Add basic events handling

	// Load sample 3D model
    /*
	ATON.createSceneNode("venus").load("skyphos_edited_fill.glb")
    .setScale(0.1, 0.1, 0.1)
    .setPosition(0,-1.2,-0.1)
    .attachToRoot();
    */

    /*

  ATON.createSceneNode("ceiling").load("room/ceiling.gltf")
  .attachToRoot();

  */
  ATON.createSceneNode("quadro").load("objects/S1-21-CNR-FICLIT_RitrattoAldrovandi/aldrovandi_quadro.gltf")
  .setPosition(79.16108011600797, 2.489892709585605,-123.5091089272303)
  .setRotation(0.1278280830171301,  0.4738934480874733,  -0.12006495582829496)
  .attachToRoot(); 







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
   /* ATON.useGizmo(true);
    ATON._gizmo.setMode("rotate");      
    ATON.FE.attachGizmoToNode("quadro");
    */
});
