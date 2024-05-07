var mindClient = {}

var mc_state = {}

mindClient.init = ()=>
{

     // Realize our App
     let myApp = ATON.App.realize();

     // Setup: this is executed once (App initialization)
     // This may include UI setup (HTML), events handling, etc.
     myApp.setup = ()=>{
         ATON.FE.realize(); // Realize the base front-end
         ATON.FE.addBasicLoaderEvents(); // Add basic front-end events (loading spinner, automatic home, ...)
 
         // Create and load a scene
         ATON.FE.loadSceneID("samples/montebelluna");

        // Lets connect and join VRC session
         mc_state.userId = mindClient.getUserID();
         mc_state.currentSessionId = mc_state.userId + "-session";
         ATON.VRoadcast.connect(mc_state.currentSessionId);
 
         // Setup incoming communications from control App
         // Remote request for transition to a specific viewpoint
         ATON.VRoadcast.on("POV", (id)=>{
             console.log("Moving my POV from controller")
             ATON.Nav.requestPOVbyID( id );
         });
 
         // Generate QR-code for remote control App
         let url = window.location.origin + "/a/mind/PsicoControl.html";
         if (url.startsWith("http://localhost")) $("#idQRcontrol").html("<b>To use another device for remote control, you have to use local network address or public IP (not localhost)</b>");
         else new QRCode( document.getElementById("idQRcontrol"), url);
     };
 
     // Ok, let's run our App!
     myApp.run();

}


mindClient.getUserID=()=> //Same as SessionController
{
    var userId = ATON.FE.urlParams.get('user');
    if(userId=="generated") userId = Date.now().toString() + "Test";
    if(!user) userId = "null";
    return userId;

}