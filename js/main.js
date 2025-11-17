/*
	Main js entry for template ATON web-app

===============================================*/

window.addEventListener( 'load', ()=>
{
  // Realize the base front-end
  ATON.FE.realize();
  
  // Add basic events handling
  ATON.FE.addBasicLoaderEvents(); 
  document.APP = APP;
  
  //For experiment setup
  APP.MIND = MIND.init(AldrovandiMind);
})

let APP = ATON.App.realize();

APP.audioCanPlay=false;

// Simple modal API attached to APP
// Usage: APP.showModal({ header: 'Title', body: '<p>Content</p>', footer: 'Footer HTML', width: '720px', closeOnOverlayClick: true, onShow: callback })
// - header: string or HTMLElement (optional, null to omit); displayed in modal header
// - body: string or HTMLElement (required); main modal content
// - footer: string or HTMLElement (optional); displayed in footer area
// - width: CSS width string (default: '80vw')
// - closeOnOverlayClick: boolean (default: true); clicking overlay/backdrop closes modal
// - onShow: function callback fired after modal is shown
// Close with: APP.closeModal()
APP.showModal = function(options){
    options = options || {};
    const modal = document.getElementById('appModal');
    if (!modal) { console.warn('APP.showModal: #appModal not found'); return; }

    const dialog = modal.querySelector('.app-modal-dialog');
    const titleEl = modal.querySelector('.app-modal-title');
    const bodyEl = modal.querySelector('.app-modal-body');
    const footerEl = modal.querySelector('.app-modal-footer');
    const overlay = modal.querySelector('[data-role="overlay"]') || modal.querySelector('.app-modal-overlay');

    if (options.width) dialog.style.width = options.width;
    else dialog.style.width = '';

    // Header
    if (options.header === undefined || options.header === null) {
        titleEl.innerHTML = '';
    } else if (typeof options.header === 'string') {
        titleEl.innerHTML = options.header;
    } else if (options.header instanceof HTMLElement) {
        titleEl.innerHTML = '';
        titleEl.appendChild(options.header);
    }

    // Body
    bodyEl.innerHTML = '';
    if (options.body instanceof HTMLElement) bodyEl.appendChild(options.body);
    else bodyEl.innerHTML = options.body || '';

    // Footer
    footerEl.innerHTML = '';
    if (options.footer instanceof HTMLElement) footerEl.appendChild(options.footer);
    else if (options.footer !== undefined) footerEl.innerHTML = options.footer || '';

    // show modal
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');

    // overlay click
    const overlayHandler = (e) => {
        if (e.target === overlay && options.closeOnOverlayClick !== false) {
            APP.closeModal();
        }
    };
    overlay.addEventListener('click', overlayHandler);
    modal._overlayHandler = overlayHandler;

    if (typeof options.onShow === 'function') options.onShow(modal);

    return modal;
};

APP.closeModal = function(){
    const modal = document.getElementById('appModal');
    if (!modal) return;
    const overlay = modal.querySelector('[data-role="overlay"]') || modal.querySelector('.app-modal-overlay');
    if (modal._overlayHandler && overlay) overlay.removeEventListener('click', modal._overlayHandler);
    modal._overlayHandler = null;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    const titleEl = modal.querySelector('.app-modal-title');
    const bodyEl = modal.querySelector('.app-modal-body');
    const footerEl = modal.querySelector('.app-modal-footer');
    if (titleEl) titleEl.innerHTML = '';
    if (bodyEl) bodyEl.innerHTML = '';
    if (footerEl) footerEl.innerHTML = '';
};

APP.startAPP=(language)=> 
{ 
    //Close Welcome Popup
    APP.closeWelcomePopup();

    //Set current language
    APP.currentLanguage = language;

    //Set System Texts by Language:
    for (const [_id, copy] of Object.entries(APP.config.systemTexts)) {
        console.log(_id, copy);
        let _text = copy[APP.currentLanguage];
        let _el = document.getElementById(_id);
        if(_el) _el.innerText = _text;
    }

    //Init iframeSystem for Melody-links
    //APP.initIframeForSidebarLinks(); //Close for now


    //Set audio available
    APP.audioCanPlay=true;
    APP.setFirstAudioAvailable();
    APP.playCurrentAudio();

    //Set Fullscreen
    ATON.Utils.requestFullscreen();

    //Set UI and SUI
    APP.setSideBar_Navigation();
    APP.showBottomBar();
    APP.updateRoomSUI();
}


//AUDIO MANAGEMENT
APP._audio = null;
//Set First audio available
APP.setFirstAudioAvailable=()=>{
   
   if(!APP.config) return;
   if(!APP.config.rooms) return;
   

  let firstAudioPath =  Object.values(APP.config.rooms)[0].audiosource;
  if(!firstAudioPath) return;

  APP.setCurrentAudio(firstAudioPath);
}

//Set current audio based on language
APP.setCurrentAudio = (audio) => {  
    const l = APP.currentLanguage || "ita";
    APP.setAudioSource(audio[l]);
};

// Create or reuse audio element and set a new source
APP.setAudioSource=(src)=>{
if (!APP._audio) {
        APP._audio = document.getElementById("mainAudioControls");
    } else {
        APP._audio.pause();       // Stop if something is playing
        APP._audio.src = "";      // Unload old source
    }

    let titleEl = document.getElementById("audioControlsTitle");
    const audioTitle = APP.cRoom?.audioTitle ? APP.cRoom.audioTitle[APP.currentLanguage] : "";
    titleEl.innerText = audioTitle || "";
    APP._audio.src = src;    
    APP._audio.load();           // Load the new source
    APP.showBottomBar();
}

// Play current audio
APP.playCurrentAudio = () => {
    if (APP._audio && APP.audioCanPlay) {
        APP._audio.play();
    }

    //SUI UPDATE:
    let iconPath = APP._audio.paused ? APP.pathContent+"SUI/play.png" : APP.pathContent+"SUI/pause.png";
    //Reset icon
    APP.suiButton_PPaudio.setIcon(iconPath);

};

// Pause current audio
APP.pauseCurrentAudio = () => {
    if (APP._audio) {
        APP._audio.pause();
    }
};


// Toggle play/pause
APP.toggleCurrentAudio = () => {
    if (!APP._audio) return;
    if (APP._audio.paused) {
        APP._audio.play();
    } else {
        APP._audio.pause();
    }
};

APP.showBottomBar=()=>{
    document.getElementById("BottomBar").style.display="flex";
}

APP.hideBottomBar=()=>{
    document.getElementById("BottomBar").style.display="none";
}

//END AUDIO MANAGEMENT

APP.showWelcomePopup=()=>{
    let container = document.getElementById("welcomePopupContainer");
    if(container) {
        container.classList.add("isSemiTransparent");
        container.style.display="block";
    }
}

APP.closeWelcomePopup=()=>
{
    document.getElementById("welcomePopupContainer").style.display="none"; 
}


APP.isVR_Device=()=>
{
	const mobileAndTabletCheck=()=>{ //https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
		let check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	};


	if("xr" in window.navigator && !mobileAndTabletCheck())
	{
		return true
	}
	else return false;

//    return true;
}


APP.setSideBar_Navigation=()=>{
    
    //Reset Info Container
    let infoScrollContainer = document.getElementById("InfoScrollContainer");
    infoScrollContainer.style.display="none";
    
    //Show Home Button
    document.getElementById("HomeBtnHeader").style.display="flex";
    //Hide Back Button
    document.getElementById("backBtnHeader").style.display="none";
    
    //Show SideBar
    document.getElementById("SideBAR").style.display="block";
}



APP.initIframeForSidebarLinks=()=>{

    //Apre un iframe in una modale ATON
    function showLinkInAtonModal(url) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '80vh';
        iframe.setAttribute('frameborder', '0');

        APP.showModal({
            header: url,
            body: iframe
        });
    }

    // Agganci i link dentro #InfoContainer
    const unhookInfoLinks = hookLinksToModal('#InfoContainer', (url, link, event) => {
        showLinkInAtonModal(url);
    });
    
    // Quando non ti serve più intercettare i click:
    // unhookInfoLinks();
}


/**
 * Aggancia un listener ai link dentro un container e
 * invece di navigare apre qualcosa (es: modale con iframe).
 */
function hookLinksToModal(container, onLinkClick) {
    // Permetti sia DOM element che selettore stringa
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    if (!container) {
        console.warn('hookLinksToModal: container not found');
        return () => {};
    }

    const handler = (event) => {
        const link = event.target.closest('a[href]');
        if (!link || !container.contains(link)) return;

        // Rispetta Ctrl/Cmd-click e click col tasto centrale (nuova tab)
        if (event.ctrlKey || event.metaKey || event.button !== 0) {
            return;
        }

        const url = link.href;
        if (!url) return;

        event.preventDefault();
        event.stopPropagation();

        // Lasciamo a chi usa l'helper la responsabilità di cosa fare
        try {
            onLinkClick(url, link, event);
        } catch (err) {
            console.error('hookLinksToModal onLinkClick error:', err);
        }
    };

    container.addEventListener('click', handler);

    // Ritorniamo una funzione per staccare il listener
    return () => {
        container.removeEventListener('click', handler);
    };
}






APP.isVR_Running=()=>{return ATON.XR._bPresenting}


// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.

//DEBUG:
APP.changeRoomProps=()=>{
    let _roughness = 0.2;
    let _metalness = 1;
    let r = APP.room.children[0].children[1]; 
    r.children[0].material.roughness = _roughness;
    r.children[1].material.roughness = _roughness;
    r.children[2].material.roughness = _roughness;
    r.children[3].material.roughness = _roughness;

    r.children[0].material.metalness = _metalness;
    r.children[1].material.metalness = _metalness;
    r.children[2].material.metalness = _metalness;
    r.children[3].material.metalness = _metalness;

    
}

//DEBUG:
APP.loadAllRooms=()=>{
    
    const rooms = APP.config.rooms;
    for (const id in rooms) {

            const room = rooms[id].room;
            console.log(`ID: ${id}, Object:`, room);
            ATON.createSceneNode(id+"room").load(room.path).attachToRoot();
            if(room.pos){ATON.getSceneNode(id+"room").setPosition(room.pos.x,room.pos.y,room.pos.z)}
            if(room.rot){ATON.getSceneNode(id+"room").setRotation(room.rot.x,room.rot.y,room.rot.z)}
    }
}

//TO TEST
APP.setuplightsProbe=()=>{

        //MANIPULATION OF PROPERTIES:

    
    
        // TEST LIGHT PROBES:

         //ATON CUBE TEST:
         /*
         ATON.createSceneNode("item")
         .load("samples/models/atoncube.glb")
         .setPosition(7,1,0)
         .setScale(4,4,4)
         .attachToRoot();
        */

         //ATON.FE.realize();
        /* 
         */
       
         /*
         ATON.mylight = new THREE.PointLight();
         ATON.mylight.intensity = 1.0;
         ATON.mylight.decay     = 0.2;
         ATON._rootVisibleGlobal.add(ATON.mylight);
         
         const helper = new THREE.PointLight(  ATON.mylight, 2 );
         ATON.getRootScene().add(helper);
       
   
         ATON.setMainPanorama( "samples/pano/defsky-grass.jpg");
         */
        
         //adjust light aton:
      
      /* ATON.plight.position.x = 5;
         ATON.plight.position.y = 2;
         ATON.plight.position.z = 4;
         ATON.plight.intensity = 5;
         ATON.enablePointLight();
        */
   
         // show LP icons in 3D space
         
         ATON.SUI.enableLPIcons();
         ATON.SUI.gLPIcons.show();
         //ATON.SUI.gLPIcons.toggle();
         APP.mylightprobe = new ATON.LightProbe(126, 2).setPosition(7, 1.5 ,0)
         ATON.addLightProbe( APP.mylightprobe );
   
   
           //Hemi light
           const hemiLight = new THREE.HemisphereLight( /*0xffffbb, 0x080820, 1*/ );
           hemiLight.position.set(4,4,3);
           hemiLight.intensity = 2;
           APP.myhemiLight = hemiLight;
           ATON.getRootScene().add(APP.myhemiLight);
           
           const hemiHelper = new THREE.HemisphereLightHelper( hemiLight, 5 );
           ATON.getRootScene().add( hemiHelper );
   
   
         //STUFF TO WATCH:
         //var ambient = ATON.getSceneNode("ambient").children[0].children[0].children[1].children
         //var objMAt =ATON.getSceneNode("objCollection").children[0].children[0].material
    
         //END TEST

         //----------SET PATH COLLECTION LOCAL, and after:

           // ATON.setMainPanorama( 'models/room1/room/EnvLight_2k.exr');


    /*
        // TEST CHANGE HDR

     // Load the HDR texture
     const rgbeLoader = new THREE.RGBELoader();
     rgbeLoader.load(APP.pathContent+'models/room1/room/EnvLight_2k.hdr', function (texture) {
     texture.mapping = THREE.EquirectangularReflectionMapping;

     // Set the environment map for the scene
     ATON.getRootScene().environment = texture;

     // Use the HDR environment for the LightProbe
     const lightProbe = new THREE.LightProbe();
    // lightProbe.setPosition(7,1.5,0)
     lightProbe.copy(THREE.LightProbeGenerator.fromCubeTexture(texture)); // Generate light probe data;
     APP.mylightProbe = lightProbe;
     ATON.getRootScene().add(APP.mylightProbe);

     const helper = new LightProbeHelper( lightProbe, 1 );
     ATON.getRootScene().add( helper );

     });
     */
}

//DEBUG/NOT USED
APP.loadModelAsync = async(path)=> {
    const loader = new THREE.GLTFLoader();
    try {
        const gltf = await loader.loadAsync("content/"+path);
       return gltf;
    } catch (error) {
        console.error('An error occurred while loading the model:', error);
    }
}


APP.loadJSON = (path,callback)=>{
    return $.getJSON( path, callback);
}


//LOAD CONFIG
APP.loadConfig = (path)=>{
    return $.getJSON( path, ( config )=>{
        APP.config = config;
        ATON.fireEvent("APP_ConfigLoaded");
    });
};




APP.setup = ()=>{

    //---->LIGHTS PROBE TEST TO DO HERE
    //APP.setuplightsProbe();

    const configPath = "./config.json";
   // const combinedConfigPath = "./combined.json";

    ATON.PATH_COLLECTION = "content/";
    APP.pathContent = window.location.href.split('?')[0];
    APP.pathContent += "content/";
    
    ATON.Nav.setFOV(65);
 
    //---->AND LIGHTS PROBE TEST TO DO HERE
    ATON.on("AllNodeRequestsCompleted",()=>{APP.onAllNodeRequestsCompleted()});
    APP.loadConfig(configPath);
    ATON._mainRoot.background =  new THREE.Color(0.1,0.1,0.1);


ATON.on("APP_ConfigLoaded", ()=>{

    //Melody setup:
    melody.init();

    console.log("config loaded");

    //INITIALIZE ROOM 1
    APP.STAGE = 1;
    //Set Panorama
   // ATON.setMainPanorama( 'image/hemi-grey.jpg');
  
    //Lights probes to remove
    /*
    let posLP = new THREE.Vector3( 86,0.5,-121 );
    APP._lightProbe  = new ATON.LightProbe(128, 10.0).setPosition(posLP);
    ATON.addLightProbe(APP._lightProbe);
    ATON.SUI.gLPIcons.hide();
    */
   
    //Setup Custom semantics
    APP.setupCustomSemanticMats();
    APP.setupCustomSemanticHovers();
    //Setup Custom locomotion Validation
    APP.setupCustomLocomotionValidation();

    //Create SUI
    if(APP.isVR_Device())
    {
        console.log("SETUPPING SUI")
        APP.setupSUI();
    }

    helper.init();


    let homepov = APP.config.rooms["1"].HomePov;
    ATON.Nav.setHomePOV(
        new ATON.POV()
            .setPosition(homepov.pos.x,homepov.pos.y,homepov.pos.z)
            .setTarget(homepov.target.x,homepov.target.y,homepov.target.z)
           // .setFOV(H.fov)
    );


    ATON.Nav.setFirstPersonControl()
    ATON.Nav.requestHome(0.5);

     //Create ambientNode = ceiling, room
    //Create objects
    APP.composeAmbient(APP.STAGE);
    
});

APP.limitY = 0.3;
APP.setupCustomLocomotionValidation=()=>
{
    var Nav = ATON.Nav;
    Nav.locomotionValidator = ()=>{
        if (ATON._queryDataScene === undefined){
            Nav._bValidLocomotion = false;
            return;
        }
    
        let qs = ATON._queryDataScene;
    
        let P = qs.p;
        let N = qs.n;
        let d = qs.d;
    
        //ADDED Y check: L'user non può andare sopra le teche
      
        if(P.y > APP.limitY)
        {
            Nav._bValidLocomotion = false;
            return;
        }

        if (d <= Nav.MIN_LOC_VALID_DIST){ // too close
            Nav._bValidLocomotion = false;
            return;     
        }
    
        if (!N){ // invalid normal
            Nav._bValidLocomotion = false;
            return;  
        }
    
        if (N.y <= 0.7){ // slope
            Nav._bValidLocomotion = false;
            return;
        }
    
        Nav._bValidLocomotion = true;
    }
}


APP.SUInodes=[];

APP.updateRoomSUI=()=>{
    console.log("updating sui")
    if(!APP.cRoom.SUI) return;
    APP.createRoomSUINodes(APP.cRoom.SUI);
}

APP.createRoomSUINodes=(nodes)=>{

    APP.cleanAllTemporarySUI();
    nodes.forEach(n => {
        let _n = APP.createSUILabel(n);
        APP.SUInodes.push(_n);
    });
}

APP.cleanAllTemporarySUI=()=>{
    if(APP.SUInodes.length==0) return;
    APP.SUInodes.forEach(n => {
        n.delete()
    });
    
    APP.SUInodes = [];
}


APP.createSUILabel=(options)=>{
    let w = 1.2;
    let h = 0.5;
    let pos = options.pos || {x:0,y:0,z:0}
    let rot = options.rot || {x:0,y:0,z:0}
    let id =  ATON.Utils.generateID(options.id+"_suiLabel_");
    let content = options.content[APP.currentLanguage];
    let SUIlabel = suiBuilder.createLabel({ id, w, h, content, pos, rot });
    SUIlabel.attachTo(APP.room);
    return SUIlabel;
}




APP.setupSUI=()=>
{
    //Create Toolbar:
    let buttons = [];
	buttons.push( new ATON.SUI.Button("sui-home") );
	buttons.push( new ATON.SUI.Button("sui-PPaudio") );

    APP.suiButton_home    = ATON.getUINode("sui-home");
	APP.suiButton_PPaudio = ATON.getUINode("sui-PPaudio");

    APP.suiButton_PPaudio
    .setBackgroundOpacity(0.5)
    .setIcon(APP.pathContent+"SUI/pause.png")
    .onSelect = ()=>{
        //toggle Audio
        APP.toggleCurrentAudio();
        let iconPath = APP._audio.paused ? APP.pathContent+"SUI/play.png" : APP.pathContent+"SUI/pause.png";
        //Reset icon
        APP.suiButton_PPaudio.setIcon(iconPath);
    };

    APP.suiButton_home
    .setBackgroundOpacity(0.5)
    .setIcon(APP.pathContent+"SUI/home.png")
    .onSelect = ()=>{
        //Go Home
        APP.setRoom(1);
    };

    APP.suiToolbar = ATON.SUI.createToolbar( buttons, undefined, 0.0 );
    let pi2 = (Math.PI * 0.5);
    APP.suiToolbar.setPosition(-0.1,0,0.1).setRotation(-pi2,-pi2,pi2).setScale(0.5);

    APP.suiToolbar.attachToRoot();
    APP.suiToolbar.hide();


    return;
    //Create CloseObject SUI
    APP.CloseObject_SUIBtn = new ATON.SUI.Button("sui-back");
    APP.CloseObject_SUIBtn.setIcon(APP.pathContent + 'icons/backBtn.png', true)
    APP.CloseObject_SUIBtn.setOnSelect(APP.CloseObject)
   // APP.CloseObject_SUIBtn.attachToRoot();

    //Create Title SUI
    APP.Title_SUI = suiBuilder.createLabel({ id:"sui-title", w:1, h:0.5, content:"", pos:{x:0,y:0,z:0}, rot:{x:0,y:0,z:0} });
   // APP.Title_SUI.setBaseColor( new THREE.Color(0.1,0.1,0.1));
    APP.Title_SUI.uiText.set({fontSize: 0.1, textAlign:"left", justifyContent:"left", content:""});
    ThreeMeshUI.update();
    //APP.Title_SUI.attachToRoot();

    //Create Temporary floor:
    const floorGeometry = new THREE.PlaneGeometry(30, 30); // A large plane to act as the floor
    const floorMaterial = new THREE.MeshBasicMaterial({ color:0x743826, side: THREE.DoubleSide }); // Grey double-sided material
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate the floor to be horizontal
    floor.position.set(0, 0, 0); // Position the floor below the user (assuming height of user is roughly 1.5 meters)

    let _floorNid = "VR_floor";
    let floorNode = ATON.createSceneNode(_floorNid);
    floorNode.attachToRoot();
    //floorNode.attach(floor);
    APP.Floor_SUI = floorNode;
    APP.Floor_SUI.visible=false;
   // APP.FLoor_SUI.hide();
}

// Attach SUI toolbar to secondary controller when connected
    ATON.on("XRcontrollerConnected", (c)=>{
        if (c === ATON.XR.HAND_L){

        if(!APP.suiToolbar) APP.setupSUI();

        ATON.XR.getSecondaryController().add(APP.suiToolbar);
        APP.suiToolbar.show();  
        }
});


const deleteAndDispose=(node)=>{
    if(!node) return;
    let p = node.parent;
    if(!p) return;

    if (p !== undefined && p.nid !== undefined) removeChildandDispose(node);
}
APP.deleteAndDispose = deleteAndDispose;


const removeChildandDispose=(node)=>{
    if (node === undefined) return;
    let p = node.parent;
    let nid = node.nid;
    if (node.nid !== undefined) p._nodes[nid] = undefined;

    node.parent = undefined;

    node.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material){
            o.material.dispose();
            if (o.material.map) o.material.map.dispose();
        } 
    });

    p.remove(node);

    return p;
}

APP.updateSiblings=()=>{
    
    //Reset
    if(APP.siblings) deleteAndDispose(APP.siblings);
    APP.siblings = ATON.createSceneNode("siblings");
    APP.siblings.setCloneOnLoadHit(false);
  
    //Add new siblings
    if(APP.cRoom.siblings){
        APP.cRoom.siblings.forEach(s => {
           let sibNode = ATON.createSceneNode(s.id).load(s.path);
            sibNode.setCloneOnLoadHit(false);

            const p = s.pos; if(p) {sibNode.setPosition(p.x,p.y,p.z)}
            const r = s.rot; if(r) {sibNode.setRotation(r.x,r.y,r.z)}
            sibNode.attachTo(APP.siblings)
        });
    }
    APP.siblings.attachToRoot();
    console.log("Siblings updated!")
   // APP.hideBlurredFullscreen();
}


//NEW PROMISE-BASED COMPOSE AMBIENT:

APP.loadAndAttachNode = ( sceneNode, loadPath, attachTarget ) => {

    sceneNode.setCloneOnLoadHit(false);
    //TODO: BLUR ACTIVE
    sceneNode.load(loadPath, () => {
            sceneNode.attachTo(attachTarget);   
    });

    /*
    
        sceneNode.setCloneOnLoadHit(false);
        //Permette di attivare l'evento ALLNODEREQUESTS COMPLETED anche se la promises è già stata chiamata

        ONBLUR // Blur attivo

        sceneNode.load(loadPath, () => {
            sceneNode.attachTo(attachTarget);   
        });
    
    */

   
    /*
    return new Promise((resolve, reject) => {
        try {
            sceneNode.load(loadPath, () => {
                sceneNode.attachTo(attachTarget);
                resolve(sceneNode);
            });
        } catch (err) {
            reject(err);
        }
    });
    */

};



// Refactored composeAmbient using Promise-based loading
APP.composeAmbient = async (_stage) => {

    APP.s = new Date().getTime();
    APP.STAGE = _stage;

    const setPositionAndRotation = (node, pos, rot) => {
        if (pos) node.setPosition(pos.x, pos.y, pos.z);
        if (rot) node.setRotation(rot.x, rot.y, rot.z);
    };

    // Clear previous nodes
    if (APP.ambient) APP.deleteAndDispose(APP.ambient);
    if (APP.lowObjCollection) APP.deleteAndDispose(APP.lowObjCollection);
    if (APP.hqObjects) APP.deleteAndDispose(APP.hqObjects);
    if (APP.semObjects) APP.deleteAndDispose(APP.semObjects);

    APP.cRoom = APP.config.rooms[_stage];
    if (!APP.cRoom) return;

    const rootScene = ATON.getRootScene();
    APP.objects = {};

    //const loadPromises = [];

    // Ambient node (acts as container)
    APP.ambient = ATON.createSceneNode("ambient");
    APP.ambient.setCloneOnLoadHit(false);
    APP.ambient.attachTo(rootScene);

    // Ceiling
    if (APP.cRoom.ceiling) {
        const ceilingNode = ATON.createSceneNode(APP.cRoom.ceiling.id);
        ceilingNode.setCloneOnLoadHit(false);

        const p = APP.loadAndAttachNode(ceilingNode, APP.cRoom.ceiling.path, APP.ambient).then( () => {
            setPositionAndRotation(ceilingNode, APP.cRoom.ceiling.pos, APP.cRoom.ceiling.rot);
        });
        p(); //loadPromises.push(p);
        
    }

    // Room
    if (APP.cRoom.room) {

        //const roomPromise = new Promise((resolve, reject) => {
        const roomLoad = ()=>{
        try {

            // For the ROOM Object: use the litePath if VR is running, otherwise use the regular path
            let _roomPath = APP.cRoom.room.path;
            if(APP.isVR_Running() && APP.cRoom.room.litePath) _roomPath = APP.cRoom.room.litePath;

            const roomNode = ATON.createSceneNode(APP.cRoom.room.id);
            roomNode.setCloneOnLoadHit(false); // Prevent cloning on load hit

            roomNode.load(_roomPath, () => {
                setPositionAndRotation(roomNode, APP.cRoom.room.pos, APP.cRoom.room.rot);
                roomNode.attachTo(APP.ambient);

                APP.room = roomNode;
                // Perform the dependent updates here
                APP.updateSiblings();
                APP.updateRoomSUI();
                APP.updateVideoAssets();

                //resolve(roomNode);
            });
        } catch (err) {
            console.error('Error loading room:', err);
           // reject(err);
        }
    };

    roomLoad(); //loadPromises.push(roomPromise);
        
    /*
        APP.room = ATON.createSceneNode(APP.cRoom.room.id);
        const p = APP.loadAndAttachNode(APP.room, APP.cRoom.room.path, APP.ambient).then(() => {
            setPositionAndRotation(APP.room, APP.cRoom.room.pos, APP.cRoom.room.rot);
            APP.updateRoomSUI();
            APP.updateVideoAssets();
            APP.deleteAndDispose(APP.siblings);
        });
        loadPromises.push(p);
        */
    }

    // Object collection
    
    if (APP.cRoom.objectCollection) {
        // For the Placeholder(s) GLTF: use the litePath if VR is running, otherwise use the regular path
        let _lowObjsPath = APP.cRoom.objectCollection.path;
        if(APP.isVR_Running() && APP.cRoom.objectCollection.litePath) _lowObjsPath = APP.cRoom.objectCollection.litePath;
        
        APP.lowObjCollection = ATON.createSceneNode("objCollection");
        APP.lowObjCollection.setCloneOnLoadHit(false);

        const p = APP.loadAndAttachNode(APP.lowObjCollection, _lowObjsPath, rootScene);
        //.then(() => {
        setPositionAndRotation(APP.lowObjCollection, APP.cRoom.objectCollection.pos, APP.cRoom.objectCollection.rot);
        //});
       //loadPromises.push(p);
    }

    // HQ Objects node (empty, set position if available)
    APP.hqObjects = ATON.createSceneNode("hqCollection");
    setPositionAndRotation(APP.hqObjects, APP.cRoom.objectCollection?.pos, APP.cRoom.objectCollection?.rot);
    APP.hqObjects.attachTo(rootScene);

    // Semantic objects
    APP.semObjects = ATON.createSemanticNode("semObjects");
    APP.semObjects.setCloneOnLoadHit(false);

    const semLoad = ()=> { //const semPromsemLoadise = new Promise((resolve) => {
        if (!APP.cRoom.objects) {
            resolve();
            return;
        }
        APP.cRoom.objects.forEach(obj => {
            APP.objects[obj.id] = obj;
            if (!obj.sem) return;

            const semNode = ATON.createSemanticNode(obj.id + "_sem").load(obj.sem.path);
            semNode.setCloneOnLoadHit(false);
            semNode.setDefaultAndHighlightMaterials(APP.matSemDef, APP.matSemHL);
            semNode.restoreDefaultMaterial();

            setPositionAndRotation(semNode, obj.sem.pos, obj.sem.rot);

            semNode.attachTo(APP.semObjects);
        });
       // resolve();
    }//);
    semLoad(); //loadPromises.push(semPromise);

    // Siblings
    if (APP.cRoom.siblings) {
        /*
        APP.siblings = ATON.createSceneNode("siblings");
        APP.cRoom.siblings.forEach(s => {
            const sibNode = ATON.createSceneNode(s.id);
            const p = APP.loadAndAttachNode(sibNode, s.path, APP.siblings).then(() => {
                setPositionAndRotation(sibNode, s.pos, s.rot);
            });
            loadPromises.push(p);
        });
        APP.siblings.attachTo(rootScene);
        */
    }

    // Attach semantic objects to root
    setPositionAndRotation(APP.semObjects, APP.cRoom.objectCollection?.pos, APP.cRoom.objectCollection?.rot);
    APP.semObjects.attachTo(rootScene);

    return;
    //Other functions are called from ALlNodeRequestsCompleted to complete room loading

    // Wait for all
    try {
       // await Promise.all(loadPromises);
    
        //console.log('✅%c All ambient nodes loaded successfully', 'background: #222; color: #bada55');
        
         //Set audio:
        if(APP.cRoom.audiosource==undefined) { APP.pauseCurrentAudio();}
        else{
            APP.setCurrentAudio(APP.cRoom.audiosource);
            APP.playCurrentAudio();
        }
    
        //Experiment Planner:
        if(MIND.isExperiment)
        {

            if(state.role=="user")
            {
                MIND.minder.photon_userComposeAmbient(APP.STAGE);
            }
            if(state.role=="controller")
            {
                MIND.requestPOV(APP.config.mind.homePOVController[APP.STAGE]);
            }
        }

        //APP.hideBlurredFullscreen();
        //if(APP.isVR_Running()){APP.fadeFromBlack(2000);}

    } catch (err) {
        console.error('Error loading ambient nodes:', err);
    }
};

APP.onAllRoomNodesAttached=()=>{

     if(APP.cRoom.audiosource==undefined) { APP.pauseCurrentAudio(); APP.hideBottomBar();}
        else{
            if(!APP.currentObjIsFocused){
                console.log("PLAY AUDIO")
                APP.setCurrentAudio(APP.cRoom.audiosource);
                APP.playCurrentAudio();
            }
        }
    
        //Experiment Planner:
        if(MIND.isExperiment)
        {
            if(state.role=="user")
            {
                MIND.minder.photon_userComposeAmbient(APP.STAGE);
            }
            if(state.role=="controller")
            {
                MIND.requestPOV(APP.config.mind.homePOVController[APP.STAGE]);
            }
        }
}

APP.removeLoadingMode = () =>{
        APP.hideBlurredFullscreen();
        if(APP.isVR_Running()){APP.fadeFromBlack(2000);}
}


//END NEW COMPOSE AMBIENT



//TO CREATE BOUNDING BOX SEM NODE ---- TO IMPLEMENT
APP.createBoxFromBoundings=(objTarget, mat = null)=>
{
    // Get the object's bounding box
    var objectBox = new THREE.Box3().setFromObject(objTarget);

    // Calculate the dimensions of the bounding box
    var size = new THREE.Vector3();
    objectBox.getSize(size);

    // Create a cube geometry using the dimensions of the bounding box
    var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

    // Create a material
    var material = mat || new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Adjust color as needed

    // Create a cube mesh using the geometry and material
    var cube = new THREE.Mesh(geometry, material);

    // Set the position of the cube to the center of the bounding box
    var center = new THREE.Vector3();
    objectBox.getCenter(center);
    cube.position.copy(center);
    return cube;
}



APP.createSemFromMesh=(semId,mesh)=>
{
    let S = ATON.getOrCreateSemanticNode(semId);
    S.add(mesh);
    S.setDefaultAndHighlightMaterials(APP.matSemDef, APP.matSemHL);
   // S.setOnSelect(function(){console.log("SELECTED")});
    return S;
}



APP.testSem=(object)=>
{
    const cube = APP.createBoxFromBoundings(object);
    const sem = APP.createSemFromMesh("ciao",cube);
    sem.attachToRoot();
}

//END SEM BOUNDING BOX




APP.setupCustomSemanticHovers=()=>{
    //OVERRIDED FROM ATON.fe

        // Semantic
        ATON.on("SemanticNodeHover", (semid)=>{
            var FE = ATON.FE;
            
            let S = ATON.getSemanticNode(semid);
            if (S === undefined) return;
    
            if(APP.isVR_Running()){
                APP.setMetadataSUI(semid);
                
                let _id = semid.substring(0, semid.length-(4));
                let _obj = APP.objects[_id];
                if(!_obj) return;
                if(_obj.type=="object"){
                    //no others label for objects
                    ATON.FE._bShowSemLabel = false;
                    ATON.FE.hideSemLabel();
                    return;
                } 
            }
           
            ATON.FE._bShowSemLabel = true;
            FE.showSemLabel(semid);
            FE._bSem = true;
    
            S.highlight();
            //$('canvas').css({ cursor: 'crosshair' });
            $('canvas').css({ cursor: 'zoom-in'});
            if (ATON.SUI.gSemIcons) ATON.SUI.gSemIcons.hide();
        });

        ATON.on("SemanticNodeLeave", (semid)=>{
            
            let S = ATON.getSemanticNode(semid);
            if (S === undefined) return;
    
            ATON.FE.hideSemLabel();
            ATON.FE._bSem = false;
    
            S.restoreDefaultMaterial();
            $('canvas').css({ cursor: 'grab' });
    
            if (ATON.SUI.gSemIcons) ATON.SUI.gSemIcons.show();

            //In VR, hide the label
            //if(APP.isVR_Running()){
                APP.removeUserSUI();
            //}
            
        });

        //OVVERIDED FROM ATON.FE 
        ATON.FE.showSemLabel = (idSem)=>{
            console.log("showSemLabel: "+idSem);
            console.log("ATON.FE._bShowSemLabel: "+ATON.FE._bShowSemLabel);
            if (!ATON.FE._bShowSemLabel) return;
            
            let _id = idSem.substring(0, idSem.length-(4));
            let _obj = APP.objects[_id];            
            if(!_obj) return;
            
            if(APP.isVR_Running()) {
                if(_obj.type=="object") {
                    ATON.SUI.setInfoNodeText(null);
                    ATON.SUI.infoNode.visible=false;
                    ATON.SUI.infoContainer.visible =false;
                    return;
                }else{
                    ATON.SUI.infoNode.visible = true;
                    ATON.SUI.infoContainer.visible = true;
                }
            } //no label for objects in VR
          
            let label = _obj.hoverLable;
            $("#idPopupLabel").html(label);
            $("#idPopupLabel").show();
        
            ATON.SUI.setInfoNodeText(label);
            
        };
}



APP.setupCustomSemanticMats=()=>{

    ATON.MatHub._uSem.tint = { type:'vec4', value: new THREE.Vector4( 0.49, 0.54, 0.73, 0.6) };

    //  let matSemDef = ATON.MatHub.materials.semanticShape;
    APP.matSemDef =  new THREE.ShaderMaterial({
        uniforms: ATON.MatHub._uSem,
        /*{
            time: { type:'float', value: 0.0 },
            tint: { type:'vec4', value: new THREE.Vector4( 0.49, 0.54, 0.73, 0.8) },
            sel: { type:'vec4', value: new THREE.Vector4(0.0, 0.0, 0.0, 0.1) }
        },*/

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

                float pulse = cos(time * 0.9); // Want even more time between pulses? Change time * 1.5 to time * 1.0
                float f = smoothstep(0.9, 1.0, pulse); //Want a shorter bright phase? Adjust smoothstep (>0.5, 1.0, pulse)

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
    //APP.matSemDef.uniforms.tint.value = ATON.MatHub.colors.white;
   
    //let matSemHL  = ATON.MatHub.materials.semanticShapeHL;
    APP.matSemHL  = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color("rgb(99, 127, 220)"),// ATON.MatHub.colors.sem, 
        transparent: true,
        depthWrite: false, 
        opacity: 0.4
        //flatShading: true
    });
}

//Setup actions:

//DESKTOP/MOBILE DoubleTAP
ATON.on("DoubleTap", (e)=>
{
    APP.TryToTapHoveredSemNode();
});

//OCULUS SELECT
ATON.on("XRselectEnd", (c)=>{
    console.log("Sel end "+c);
    APP.TryToTapHoveredSemNode();
});

APP.TryToTapHoveredSemNode = ()=>{
    if(!ATON._hoveredSemNode) return;
    APP.onTapSemNodes(ATON._hoveredSemNode, ATON._queryDataScene.p);
}



APP.onTapSemNodes = (idSem, p=null)=>
{
    let POVTimeTransition = 0.6;
    let VR_MaxDistance = 1.8; //max distance to interact with object in VR;

    //get object ID from semantic ID
    console.log(idSem + " tapped.");
    let _id = idSem.substring(0, idSem.length-(4));
    let _object = APP.objects[_id]; 
    let _type = APP.objects[_id].type;
    
    //Get Current POV of User:
    APP.POVbeforeTransition = ATON.Nav.copyCurrentPOV(); 
    
    if(MIND.isExperiment){ //on experiment: prevent all click except for room link 
        if(_type!="roomLink"){return}
    } 

    APP._currentObjectActive = _id;
    APP._currentSemActive = idSem;


    if(_type=="roomLink")
    {
        console.log("IS A ROOM LINK");
        POVTimeTransition= 0.2;
        APP.showBlurredFullscreen();

         //FOR VR DESTROY SIBLINGS
        //ATON.Photon.fire("myRemoteLog","isVRDevice: " + APP.isVR_Device());
        //ATON.Photon.fire("myRemoteLog","isVR_Running: " + APP.isVR_Running());
        if(APP.isVR_Device()){if(APP.isVR_Running()) {
            APP.deleteAndDispose(APP.siblings);
            APP.cRoom.siblings = null;
        }}

    }
    
    
    if(APP.isVR_Running()){
            //TO Check distance: 
            /*
            if(p)
            {
                let d = new THREE.Vector3(p.x, p.y, p.z).distanceTo(ATON.Nav._currPOV.pos);
                console.log("Distance: "+d);
                if(d > VR_MaxDistance) return;
            }*/

            if(_type!="roomLink"){return} //For now all interaction were blocked
    } 

        
    /*--------------------------
    Compose POV
    -------------------------*/
    let povIn = APP.objects[_id].povIn;    

    if(povIn)
    {
        var _pov = new ATON.POV("povIn_"+_id)
        .setPosition(povIn.pos.x,povIn.pos.y,povIn.pos.z)
        .setTarget( povIn.target.x,povIn.target.y,povIn.target.z);
    }
    else //SET BY SEMANTICNODE BOUNDS
    {
        let n = ATON.getSemanticNode(idSem);
        let bs = n.getBound();
        //let T = new THREE.Vector3();
        let E = new THREE.Vector3();        
        let r = bs.radius * 3.0;
        E.x = bs.center.x - (r * ATON.Nav._vDir.x);
        E.y = bs.center.y - (r * ATON.Nav._vDir.y);
        E.z = bs.center.z - (r * ATON.Nav._vDir.z);

        var _pov = new ATON.POV().setPosition(E).setTarget(bs.center);  
    }
    
    //For VR avoid to use POV moving and call directly onTransitionCompleted
  
    
    if(_type=="video")
    {
        // APP.showVideo();
        document.getElementById("InfoScrollContainer").style.display="none";
        document.getElementById("SideBAR").style.display="block";
        ATON.getSemanticNode( APP._currentSemActive).hide();
    }

    
    if(_pov) {

//        if(APP.isVR_Running()){
 //           APP.onPOVTransitionCompleted(null);
  //      }
 //       else{
            ATON.Nav.requestPOV(_pov, POVTimeTransition);
  //      }
    }

    if(_type=="object")
    {
        if(!_object.path) return;
        APP.showBlurredFullscreen(); 

        // var SemNode = ATON.getSemanticNode(_id+"_sem");
       // SemNode.hide();

       // ATON.getSceneNode("ambient").hide();
       // if(APP.siblings) APP.siblings.hide();
       // if(APP.videoAssets) APP.videoAssets.hide();
       
        //APP.showBlurredFullscreen();

        ATON.Nav.setOrbitControl();
        //ATON.getSceneNode("blackSphere").show();
        
        ATON._mainRoot.background = new THREE.Color("rgb(17,17,17)");

        
        APP.semObjects.hide();
        //APP.setBlackCubes(true, _object.id.concat("_sem"));
        
        /*
        if(ATON.getSemanticNode(_object.id+"_sem")){
            ATON.getSemanticNode(_object.id+"_sem").hide();
        }
        APP.setBlackMaterialToSemantiNodes();
        */


     APP.cRoom.objects.map((o)=>
        {
            return;

            if(o.id == APP._currentObjectActive) {return;}
            if(ATON.getSceneNode(o.id)) ATON.getSceneNode(o.id).hide();

           
            if(ATON.getSemanticNode(o.id+"_sem")){
            //    ATON.getSemanticNode(o.id+"_sem").hide();
            }
        })
        


    //Content SIDEBAR

    //Try to get data for Melody:
    let _IRI = null;
    
    if(APP.objects[APP._currentObjectActive].IRI!=undefined){
        _IRI = APP.objects[APP._currentObjectActive].IRI;
        console.log("IRI FROM HERE IS: " + _IRI)
    }
    else {
        if(APP.combinedConfig){
            //Current Room:
            if(APP.combinedConfig[APP.STAGE]){
                const o = APP.combinedConfig[APP.STAGE].find(obj => obj.NR === APP._currentObjectActive);

                if(o){
                    if(o.IRI) _IRI = o.IRI;
                }
            }
        }
    }

    let useBackup = APP.config.useMelodyBackup;

    //Callback to compose data in sidebar
    let composeContent= async(_info)=>{

        console.log(_info);

        //if no content no scroll
        var infoScrollContainer = document.getElementById("InfoScrollContainer");
        var scrollVisibility = _info==undefined ? "none" : "block";
        infoScrollContainer.style.display= scrollVisibility;
        
        //Inject HTML:
        const InfoContainer = document.getElementById("InfoContainer");
        if(!useBackup){
            /* With referred SCRIPTS:*/
            injectHTMLWithScripts(InfoContainer, _info);
        }
        else{
            /*With Embedded SCRIPTS*/
            injectEmbeddedHTML(InfoContainer, _info);
        }
        
        //Hide other UI:
        document.getElementById("HomeBtnHeader").style.display="none";
        //Hide CloseBtn until load:
        document.getElementById("backBtnHeader").style.display="none";
        document.getElementById("SideBAR").style.display="block";
        
        var copy = document.getElementById(_id); //??
        if(copy)
        {
            copy.style.dislay="block";
        }
    };

    if(_IRI){
        console.log("ASKING FOR:", _IRI);   
        APP.getMelodyData(_IRI, composeContent, useBackup);
    }

    else{ composeContent(undefined); }

    }
}


APP.setBlackMaterialToSemantiNodes=()=>{

    if(APP.blackSemMat == undefined){
        APP.blackSemMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.1,0.1,0.1),
            transparent: true,
            opacity: 1,
            depthTest: false,
            depthWrite: false
        });
    }
    let nodes = APP.semObjects.children;
    nodes.forEach(N => {
        console.log(N.nid)
        N.setDefaultAndHighlightMaterials(null,null );
        N.setDefaultAndHighlightMaterials(APP.blackSemMat,APP.blackSemMat);
        N.restoreDefaultMaterial();
        N.disablePicking();
    });

}

APP.ResetStandardMaterialToSemanticNodes=()=>{
     let nodes = APP.semObjects.children;
    nodes.forEach(N => {

        N.setDefaultAndHighlightMaterials(APP.matSemDef,APP.matSemHL );
        N.restoreDefaultMaterial();
        N.enablePicking();
    });
}


APP.setBlackCubes=(b,exeptionId)=>{


    //Create Mat
     if(APP.blackMat == undefined){
        APP.blackMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.1,0.1,0.1),
            transparent: true,
            opacity: 1,
            depthTest: true,
            depthWrite: true
        });
    }

    if(b){
    
        if(APP.blackCubes == undefined) APP.blackCubes= ATON.createSceneNode("blackCubes");

        //loop in APP.semObjects:
        let nodes = APP.semObjects.children;
        nodes.forEach(N => {

            if(N.nid!=exeptionId){
            let c = APP.createBoxFromBoundings(N, APP.blackMat);
            APP.blackCubes.add(c);
            }

        });

    APP.blackCubes.attachToRoot();
    }

    else{
        if(APP.blackCubes){
            APP.deleteAndDispose(APP.blackCubes);
            APP.blackCubes=undefined;
        }
    }
}





APP.getMelodyData=(_IRI, callback, frombackup, forcedVR=null)=>{

    var isVR = forcedVR!=null? forcedVR : APP.isVR_Running();
    
    if(frombackup) {
        let staticContent = getMelodyDataByIRI(_IRI, isVR, APP.STAGE);
        callback(staticContent);
    } 
    else{
         let melodyOptions = {
            uri:_IRI,
            isVR,
            onComplete: callback,
            onError: (err)=>{
                console.log(err);
                callback(undefined);
            }
        } 

        melody.getData(melodyOptions);
    }

}

APP.cleanString=(input)=> {
  return input
    .replace(/[^\x20-\x7E]/g, '') // Removes non-ASCII characters
    .replace(/\s+/g, ' ')         // Collapses multiple spaces
    .trim();                      // Trims leading/trailing spaces
}



APP.setMetadataSUI=(semid)=>{

    let _id = semid.substring(0, semid.length-(4));
    let _obj = APP.objects[_id];
    if(_obj.type!="object") return;
    if(!_obj.IRI) return;

//    var isVR = APP.isVR_Running();
    
    let _callback = (_info)=>{

        console.log(_info);
        window.info = _info;
        
        
        //get contents and add /new lines
        let _titleData = JSON.parse(_info).dynamic_elements["01"].content;
        let _title = APP.cleanString(_titleData);
        console.log("TITLE: "+_title);
        let _contentData = JSON.parse(_info).dynamic_elements["02"].content;
        let _content = APP.cleanString(_contentData);
        let _data = "<b>" + _title + "</b>" + "\n" + _content;

        console.log(_data);
        
        try {
            APP.setUserSUI({content: _data, w: APP.UserSUI_w, h: APP.UserSUI_h});
        }
        catch (e) {
            console.error("Error parsing JSON data:", e); 
            window.alert(_data);
        }
    }

    let useBackup = APP.config.useMelodyBackup;
    APP.getMelodyData(_obj.IRI, _callback, useBackup, true);
}



ATON.on("POVTransitionCompleted", (x)=>{APP.onPOVTransitionCompleted(x);})
    
APP.onPOVTransitionCompleted=(x)=>{

    if(!APP._currentObjectActive)
    {
        console.log("no current Object Active")
        return;
    } 
    if(APP.currentObjIsFocused)
    {
        console.log("currentObj Is Focused")
        return;
    }

    var obj =  APP.objects[ APP._currentObjectActive];
    ATON.SUI.setSelectorRadius(0);
    
    if(obj.type == "roomLink")
    {   
        console.log(obj.roomTo);
        APP.currentObjIsFocused=false;
        APP._currentObjectActive=null;

        APP.isChangingRoom = true;
        if(APP.isVR_Running()){ //FADEIFVR - TO
            
            APP.fadeToBlack(500, async () => {
                console.log("Fading To Black");
                await APP.composeAmbient(obj.roomTo);
            });
        }
        else{ APP.composeAmbient(obj.roomTo); }
    }

    if(obj.type == "video")
    {
        APP.showVideo(obj.path);
        APP.showBlurredFullscreen(false);
        APP.currentObjIsFocused=true;
    }

    if(obj.type=="object")
    {
            //SUI
        if(APP.isVR_Running())
        { return;
            //Btn back
            if(obj.close)
            {
                APP.CloseObject_SUIBtn.setPosition(obj.close.pos.x,obj.close.pos.y,obj.close.pos.z)
                APP.CloseObject_SUIBtn.setRotation(obj.close.rot.x,obj.close.rot.y,obj.close.rot.z);
                APP.CloseObject_SUIBtn.visible= true;
            }
            //Info Layout
            if(obj.title)
            {
                //APP.Title_SUI.setText(obj.hoverLable);
                APP.Title_SUI.uiText.set({ content: obj.hoverLable });
                APP.Title_SUI.setPosition(obj.title.pos.x,obj.title.pos.y,obj.title.pos.z)
                APP.Title_SUI.setRotation(obj.title.rot.x,obj.title.rot.y,obj.title.rot.z);
                APP.Title_SUI.visible = true;
                ThreeMeshUI.update()
            }

            ATON.Nav.setFirstPersonControl();
            APP.Floor_SUI.setPosition(ATON.Nav._currPOV.pos.x,0,ATON.Nav._currPOV.pos.z);
            APP.Floor_SUI.show();

        }

            console.log('%cTransition POV Ended ' + obj.hoverLable, 'background: #222; color: #bada55');
            $('canvas').css({ cursor: 'wait'});
            

            var hqObj = ATON.createSceneNode(obj.id).load(obj.path,
                /*On Complete: */ ()=>{
                    APP.lowObjCollection.hide();
                    APP.setBlackCubes(false);
                    $('canvas').css({ cursor: 'grab'});
               
                    ATON.getSceneNode("ambient").hide();
                    if(APP.siblings) APP.siblings.hide();
                    if(APP.videoAssets) APP.videoAssets.hide();
                    
                    
                    if(obj.pos){hqObj.setPosition(obj.pos.x,obj.pos.y,obj.pos.z)}
                    if(obj.rot){hqObj.setRotation(obj.rot.x,obj.rot.y,obj.rot.z)}
                    if(obj.scale){hqObj.setScale(obj.scale.x,obj.scale.y,obj.scale.z)}
                    //hqObj.setCloneOnLoadHit(false);
                    hqObj.attachTo(APP.hqObjects);

                    APP.hideBlurredFullscreen();           
                    APP.currentObjIsFocused=true;

                    //Show CloseBtn only after load:
                    document.getElementById("backBtnHeader").style.display="flex";
            });
    }

}


APP.CloseObject = ()=>
{
    //Get and delete current object
    const currentObj = APP.objects[APP._currentObjectActive];
    const t = currentObj.type;

    if(t=="object") {
        let _o = ATON.getSceneNode(currentObj.id)
    // if(_o) _o.delete();
    if(_o)deleteAndDispose(_o);
    
    }
    APP._currentObjectActive = null;
    APP.currentObjIsFocused= false;
    
    /*
    let povOut = currentObj.povOut;
    var _pov = new ATON.POV("povOut_"+ APP._currentObjectActive)
    .setPosition(povOut.pos.x,povOut.pos.y,povOut.pos.z)
    .setTarget( povOut.target.x,povOut.target.y,povOut.target.z);
    */
    var _pov = APP.POVbeforeTransition;
    ATON.Nav.requestPOV(_pov, 0.6);
    
    ATON.getSceneNode("ambient").show();
    if(APP.siblings)APP.siblings.show();
    if(APP.videoAssets) APP.videoAssets.show();
    
    APP.lowObjCollection.show();

    //Show Semantic and Scene Nodes of objects
    APP.semObjects.show();
    //APP.ResetStandardMaterialToSemanticNodes();

/*
    APP.cRoom.objects.map((o)=>
    {
        console.log(o.id);
        if( ATON.getSceneNode(o.id)){console.log("REACTIVATING: " + o.id); ATON.getSceneNode(o.id).show();}
        if(ATON.getSemanticNode(o.id+"_sem")) ATON.getSemanticNode(o.id+"_sem").show();
    });
*/
//  ATON.getSemanticNode(APP._currentObjectActive+"_sem").show();


    //document.getElementById("SideBAR").style.display="none";    
    document.getElementById("InfoScrollContainer").style.display="none"; //"block";
   
    document.getElementById("backBtnHeader").style.display="none";
    document.getElementById("HomeBtnHeader").style.display="flex";
   
    
    //oldwhite: ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");
     ATON._mainRoot.background =  new THREE.Color(0.1,0.1,0.1);


    APP._currentObjectActive = null;
    ATON.Nav.setFirstPersonControl();
// ATON.setMainPanorama( 'image/hemi-grey.jpg');
    APP.closeVideo();
    APP.hideBlurredFullscreen();

    //ATON.getSceneNode("blackSphere").hide();

    //SUI
    if(APP.isVR_Running())
    {
        APP.CloseObject_SUIBtn.visible = false;

        APP.Title_SUI.uiText.set({ content: "" });
        APP.Title_SUI.visible = false;
        ThreeMeshUI.update();
        APP.Floor_SUI.hide();
    }
    
    //Gizmo Helper:
    if (ATON._gizmo) ATON._gizmo.detach();     
}



APP.updateTopToolbar=()=>{

}

APP.openIIIFview=(target)=>
{
if(!navigator.onLine) {window.alert("error on mirador loading: offline"); return;}

const idFullscreenContainer ="miradorFullscreenContainer";

console.log(target);

const _path = target.dataset.path;
console.log("phat is: " + _path);
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
                document.getElementById(idFullscreenContainer).style.display="none";

            };
            initialized = true;
        }
    }
}
    document.getElementById(idFullscreenContainer).style.display="block";

    var mirador = Mirador.viewer({
        "id": "miradorViewer",
        "manifests": _path,
            // "https://bub.unibo.it/iiif/2/manifest/bub/manoscritti/bub_rot002.json",
        "windows": [
            {
            "loadedManifest": _path,
            "canvasIndex": 1,
            "thumbnailNavigationPosition": 'far-bottom'
            }
        ]
        });
        document.mirador = mirador;
}


APP.showVideo=(src)=>{
    var videoPlayer = document.getElementById("VideoPlayer");
    videoPlayer.src = src;
    videoPlayer.currentTime = 1;
    videoPlayer.style.display="block";
    videoPlayer.play();
}

APP.closeVideo=()=>
{
    var videoPlayer  = document.getElementById("VideoPlayer");
    videoPlayer.pause();
    videoPlayer.style.display="none";
    videoPlayer.currentTime = 1;
}
};


APP.showBlurredFullscreen = (needLoader=true) => {
    let element = document.getElementById("blurredFullscreen");
    element.classList.add("show-blur");
    if(needLoader) $("#idLoader").show();
};

APP.hideBlurredFullscreen = () => {
    let element = document.getElementById("blurredFullscreen");
    if(!element) return;
    element.classList.remove("show-blur");
    $("#idLoader").hide();
};


APP.updateVideoAssets = () =>{

    //Close Others
    if(APP.videoAssets) {

        console.log(APP.videoAssets);
        if(APP.videoAssets.parent)  APP.deleteAndDispose(APP.videoAssets);
        
        APP.videoAssets.children.map((videoNode)=>{
            console.log(videoNode);
            let videoEl = document.getElementById(videoNode.nid);
            if(videoEl) videoEl.delete();
        })
    }
    
    const videoAssets = APP.cRoom.videoAssets;
    if(!videoAssets) return;

    APP.videoAssets = ATON.createSceneNode("videoAssets");
    APP.videoAssets.attachTo(APP.room);
    
    //Create video utility:
    const setup3DVideo = (o) =>{

        //1 Create video element
        const video = document.createElement('video');
        video.src = o.videoPath;
        video.loop = true;
        video.muted = true;
        video.play();

        // Create a VideoTexture from the video
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;

        const material = new THREE.MeshBasicMaterial({ map: videoTexture });

        //2 Load Model
        let node = ATON.createSceneNode(o.id).load(o.shapePath);
        node.setMaterial(material);
        node.attachTo(APP.videoAssets);
        //TODO implement pos and rot from json.
    }

    //Add new video assets
    videoAssets.map((o)=>{setup3DVideo(o)});
}

APP.update = ()=>{

    if(APP.MIND)
    {
        if(APP.MIND.needsUpdate)
        {
            APP.MIND.update();
        }
    }
};

APP.update()

APP.BackToStart=()=>{
    APP.setRoom(1);
    //APP.showWelcomePopup();
    APP.pauseCurrentAudio();
    APP.audioCanPlay=false;
}

APP.setRoom=(stage)=>{

    APP.closeWelcomePopup();
    APP.showBlurredFullscreen();
    
    APP.STAGE = stage;
    APP.isChangingRoom=true;
    
    let _pov = APP.config.rooms[stage].HomePov;
    var _p = new ATON.POV("povHome_"+stage)
        .setPosition(_pov.pos.x,_pov.pos.y,_pov.pos.z)
        .setTarget( _pov.target.x,_pov.target.y,_pov.target.z);

    let POVTimeTransition = 0.6;
    ATON.Nav.requestPOV(_p, POVTimeTransition);
    APP.composeAmbient(stage);
}
    
APP.sceneInitialized = false;



APP.onAllNodeRequestsCompleted=()=>
{
    //initialize scene setup
    if(!APP.sceneInitialized) {APP.initializeScene();}
    //setup animation at welcomepopup:
    if(!APP.audioCanPlay) 
    {
       APP.showWelcomePopup();
    }
    
    if(!APP.isChangingRoom) return;
    
    //OFFBLUR // Tutti i load in parallelo sono completati
    APP.removeLoadingMode();
    APP.onAllRoomNodesAttached();

    //Calculate times
    console.log("composed");
    const now =  new Date().getTime();
    const deltaLoad = Math.abs( now -  APP.s); 
    APP.delta = deltaLoad / 1000; 

    console.log('%c ALLNODEREQUESTCOMPLETED ', 'background: #444; color: #bada55');
    console.log("loaded in: " + APP.delta);

    ATON.Photon.fire("myRemoteLog","from remote: ALLNODEREQUESTCOMPLETED '")
    ATON.Photon.fire("myRemoteLog","from remote: loaded in: " + APP.delta)

    APP.isChangingRoom=false;  
}

APP.initializeScene = ()=>
{
   ATON.Photon.fire("myRemoteLog","Initializing")

   //Initialize BlackSphere:
    ATON.SUI.setSelectorRadius(0);
        //Create BlackSphere

        const myMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.1,0.1,0.1),
            side: THREE.BackSide,
            transparent: false,
        });

    
        const radius = 3;
        const widthSegments = 10;
        const heightSegments = 10;

        const geometry = new THREE.SphereGeometry(radius,widthSegments,heightSegments);
        const _sphere = new THREE.Mesh(geometry, myMat);
        
        let m = new THREE.Object3D();
        m.add(_sphere);
        let n = ATON.createSceneNode("blackSphere").add(m);
        n.setPosition(5.549281005903758, 0.9944588964402428, 2.1290913203748545)
       .setScale(10,10,10)
        .attachToRoot();
        n.hide();
   
        APP.sceneInitialized = true;
}

APP.getVRBtn=()=>
{
    ATON.FE.uiAddButtonVR("idTopToolbar");
    console.log('%cbody Loaded and VR Btn added', 'background: #222; color: #bada55');
}

//UI:

APP.returnFormattedInfo=(objectInfo)=>
{
    const returnTitle=(t)=>{return `<h1>${t}</h1>`}

    const returnBlock=(options)=>
    {

        const returnInfoBox=(o)=> //o.copy
        {
            return  `
            <div class="Block">
            <div class="flexContainer">
                <div class="leftSide">
                    <div class="myCircle"></div>
                </div>
                <div class="RightSide">
                   ${o.copy}
                </div>
            </div>
        </div>
            `
        }

        const returnFromCatalogoBox = (o)=> //o.pages, o.title, o.subtitle, o.copy
        {
            return `
            <div class="Block">
            <div class="flexContainer">
                <div class="thumb"></div>
                <div>
                    <span class="b">Dal Catalogo</span><br>
                    (${o.pages})
                </div>
            </div>
                <br><span class="b">${o.title}"</span><br>
                <span class="i">${o.subtitle}</span>
                <div class="line"></div>
                <p>${o.copy}</p>
            <div class="rightAlign" style="text-align: 'right'">
                <div class="moreBtn" onclick=""></div>
            </div>
            </div>`
         }

         const returnCarousel=(o)=>//o.title? o.images (img.path)
         {
             const _title = o.title? o.title : "Galleria";
             var _images = "";
             o.images.forEach(img => {
               _images = _images.concat(`<div class="carouselItem" style="background-image: url('${img.path}');"></div>`)
             });
 
                 return `
                 <div class="Block">
                 <b>${_title}</b><br><br>
                 <div class="flexContainer CarouselContainer">
                 ${_images}
                 </div>
             </div>
             `
         }

         returnIIIFContainer=(o)=> //o.title?, o.subtitle, o.description
         {
            const _title = o.title? o.title : "AD ALTA RISOLUZIONE";
            return `
            <div class="Block">
            <div class="flexContainer IIIFContainer">
                <div>
                
                    <b${o.title}</b><br>
                    ${o.subtitle}<br>
                </div>
            <img src="content/icons/IIIFBtn.svg" class="IIFBtn" data-path=${o.manifestPath} onclick="APP.openIIIFview(this)">
            </div>
            <br><br>
            ${o.description}
              </div>
            `
         }
         
        var blocks=
        {
            "info":returnInfoBox,
            "catalogo":returnFromCatalogoBox,
            "carousel":returnCarousel,
            "iiif":returnIIIFContainer
        }

        if( !blocks[options.type] )
        {
            console.log("NO BLOCKS TYPE");
             return null;
        }
      
        return blocks[options.type](options);
    }


    //_.mainTitle //_.blocks[] (__.type, ...)    
    const o = objectInfo;
    var _info = o.mainTitle? returnTitle(o.mainTitle) : "";
    console.log(o.blocks)
   if(o.blocks)
   {
    o.blocks.forEach(b => {
        _info = _info.concat(returnBlock(b))
     });
   } 
    console.log(_info)
    return _info;
}

/* OLD LAYOUT:

APP.quadroInfo =    `
<h1>Ritratto di Ulisse Aldrovandi</h1>
<!--BLOCK SCHEDA INFORMATIVA-->
<div class="Block">
    <div class="flexContainer">
        <div class="leftSide">
            <div class="myCircle"></div>
        </div>
        <div class="RightSide">
        <b>test BBBB</b><br>altro testo
            <span class="b">OGGETTO</span>: dipinto<br><br>
            <span class="b">MATERIA E TECNICA</span>:  tela/ pittura a olio<br><br>
            <span class="b">DIMENSIONI</span>: 79 cm x 62 cm<br><br>
            <span class="b">DATA</span>: 1584/1586<br><br>
            <span class="b">ATTRIBUZIONI</span>: Agostino Carracci<br/><br>
            <span class="b">ALTRE ATTRIBUZIONI</span>: Ludovico Carracci, Carracci Agostino, Attribuito: Bartolomeo Passarotti<br><br>
            <span class="b">LUOGO DI CONSERVAZIONE</span>: Accademia Carrara - Museo, Bergamo<br>
        </div>
    </div>
</div>
<!--BLOCK CATALOGO-->
<div class="Block">
    <div class="flexContainer">
        <div class="thumb"></div>
        <div>
            <span class="b">Dal Catalogo</span><br>
            (pp. 23-27)
        </div>
    </div>
        <br><span class="b">"Chi era Ulisse Aldrovandi?"</span><br>
        <span class="i">di Giuseppe Olmi</span>
        <div class="line"></div>
        <p>L. Fuchs, K. Gesner, P. Belon, P.A. Mattioli, etc., uno dei grandi rinnovatori dello studio della natura nel Rinascimento. Manifestando precocemente una forte sete di conoscenza («Essendo io spinto dal dessiderio insin dalla mia prima età di sapere», scriverà più tardi) ebbe una infanzia e una giovinezza piuttosto irrequiete: all'età di soli dodici (...)</p>
      
    <div class="rightAlign" style="text-align: 'right'">
        <div class="moreBtn" onclick=""></div>
    </div>
</div>
 <!--BLOCK CAROSELLO-->
 <div class="Block">
    <span class="b">Galleria</span><br><br>
    <div class="flexContainer CarouselContainer">
       
        <div class="carouselItem quadro1"></div>
        <div class="carouselItem quadro2"></div>
        <div class="carouselItem quadro3"></div>
    </div>
 </div>
 
</div>
`
APP.cospiInfo = 
`
<!--COSPI INFOCONTAINER-->
<div id="cospi" class="InfoContainer">

    <h1>Codice Cospi</h1>
    <!--BLOCK SCHEDA INFORMATIVA-->
    <div class="Block">
        <div class="flexContainer">
            <div class="leftSide">
                <div class="myCircle"></div>
            </div>
            <div class="RightSide">
                <span class="b">OGGETTO</span>: manoscritto mesoamericano<br><br>
                <span class="b">MATERIA E TECNICA</span>: striscia di pelle di cervo, interamente coperta da uno strato di gesso, presenta coperte di pergamena europee<br><br>
                <span class="b">DIMENSIONI</span>: 3640 mm x ca. 174-182 mm<br><br>
                <span class="b">DATA</span>: XV-inizi XVI secolo<br><br>
                <span class="b">LUOGO DI CONSERVAZIONE</span>: Biblioteca Universitaria di Bologna, Bologna
            </div>
        </div>
    </div>
      <!--BLOCK IIIF-->
    <div class="Block">
        <div class="flexContainer IIIFContainer">
            <div>
                <span class="b">AD ALTA RISOLUZIONE</span><br>
                © M. Caroli e S. Tebaldi <br>
                Alma Mater Studiorum <br>
                Biblioteca Universitaria di Bologna (BUB)<br>
            </div>
        <img src="content/icons/IIIFBtn.svg" class="IIFBtn" onclick="APP.openIIIFview()">
        </div>
        <br><br>
        Manoscritto mantico. Sul recto i tonalpohualli (ciclo divinatorio di 260 giorni) (1-8), un Almanacco di Venere (9-11) e la sezione dei Quattro Templi (12-13). Sul verso un’unica sezione con disposizione e numero di offerte rituali (21-31).
    </div>
    
    <!--BLOCK CATALOGO-->
    <div class="Block">
        <div class="flexContainer">
            <div class="thumb"></div>
            <div>
                <span class="b">Dal Catalogo</span><br>
                (pp. 29-31)
            </div>
        </div>
            <br><span class="b">“Ulisse Aldrovandi e le cose dell’altro mondo”</span><br>
            <span class="i">di Davide Domenici</span>
            <div class="line"></div>
            <p>La scoperta europea delle Americhe costituì un vero e proprio shock culturale per l'Europa del Rinascimento. Non solo un intero universo di animali, piante e minerali sino ad allora sconosciuti si dischiuse davanti agli occhi di naturalisti e studiosi (...)</p>
          
        <div class="rightAlign">
            <div class="moreBtn" onclick=""></div>
        </div>
    </div>
     <!--BLOCK CAROSELLO-->
     <div class="Block">
        <span class="b">Galleria</span><br><br>
        <div class="flexContainer CarouselContainer">
           
            <div class="carouselItem cospi1"></div>
            <div class="carouselItem cospi2"></div>
            <div class="carouselItem cospi3"></div>
        </div>
     </div>
</div>
`;

APP.videoInfo = `
<div class="Block">
<h2>Video Stanza #1</h2><br>
<span class="b">Le opere del video:</span>
<br><div class="line"></div><br>
<div class="flexContainer">
    <div class="leftSide">
        <div class="VideoOperaItem"></div>
    </div>
    <div class="RightSide">
        <span class="b">San Girolamo nel suo studio</span><br>
        Colantonio,<br>
        1445-1446. <br>
        Napoli, Museo e Real Bosco di Capodimonte
    </div>
    <div class="rightAlign underline">vai a 02:26</div>
</div>
</div>
<!--BLOCK CATALOGO-->
<div class="Block">
<div class="flexContainer">
<div class="thumb"></div>
<div>
    <span class="b">Dal Catalogo</span><br>
    (p. 37)
</div>
</div>
<br><span class="b">“La natura dei libri”</span><br>

<p>
    Secondo la leggenda, nel deserto fuori Betlemme Girolamo incontrò un leone con una spina nella zampa e gliela tolse. Da quel momento l’animale, riconoscente e ammansito, lo seguirà ovunque. Per questo la presenza di un leone aiuta a riconoscere con sicurezza San Girolamo nei quadri del passato. Se però prendiamo questo quadro e gli togliamo il leone, poi il cappello cardinalizio poggiato sul ripiano a sinistra e infine l’aureola del santo, ecco che ci troviamo di fronte al ritratto di un umanista nella tranquillità del suo studiolo, circondato dai libri degli autori classici sopravvissuti al Medioevo, che sono stati da poco riscoperti, tradotti e pubblicati. Per lo studioso del tempo, il leone e gli altri animali o piante di cui legge nei libri sono poco più che parole, e li studia solo attraverso le parole di questi libri.
</p>
<div class="rightAlign">
<div class="moreBtn" onclick=""></div>
</div>
</div>`
*/




/*RETARGETING HELPERS FUNCTIONS*/

APP.getCenterBoundOfNode=(n)=>{
    
    let bs = n.getBound();
    let E = new THREE.Vector3();
    
    E.x = bs.center.x 
    E.y = bs.center.y 
    E.z = bs.center.z 
    return E;
}

APP.createInRoomNormalHelper=(dir=null)=>{
    if(!dir) dir = new THREE.Vector3( 4, -1, 1 );

    let p = APP.getCurrActiveCenter();
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();
    
    const origin = p;
    const length = 1;
    const hex = 0xffff00;
    
    const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
    ATON.getRootScene().add( arrowHelper );
}

APP.getCurrActiveCenter=()=>{
    let n = ATON.getSceneNode(APP._currentObjectActive);
    return APP.getCenterBoundOfNode(n);

}




//FADE: TO INTRODUCE AND TEST ON VR

//OLD setupForFade:
APP.old_setupForFade = () => {
    if (APP.blackPlaneFade) return;

    const fadeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,  // always start at 0!
        depthTest: false,
        depthWrite: false
    });

    const fadeGeometry = new THREE.PlaneGeometry(2, 2);

    const fadeMesh = new THREE.Mesh(fadeGeometry, fadeMaterial);
    fadeMesh.renderOrder = 999;

    APP.blackPlaneFade = fadeMesh;
    APP.blackPlaneMaterial = fadeMaterial;
};


APP.setupForFade = () => {
  if (APP.blackFadeMesh) return;


      if (APP.blackPlaneFade) return;

    const fadeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,             // sempre da 0
        depthTest: false,
        depthWrite: false,
        side: THREE.BackSide,   // importante: guardiamo l'interno della sfera
        fog: false,
        toneMapped: false
    });

    // raggio > near plane della camera (es. near=0.1 → 1.5 è ok)
    const fadeGeometry = new THREE.SphereGeometry(1.5, 32, 16);

    const fadeMesh = new THREE.Mesh(fadeGeometry, fadeMaterial);
    fadeMesh.renderOrder = 999;

    APP.blackPlaneFade = fadeMesh;
    APP.blackPlaneMaterial = fadeMaterial;
};





APP.updateFadePlanePosition = () => {
    const fadeMesh = APP.blackPlaneFade;
    if (!fadeMesh) return;

    const cameraPos = ATON.Nav._currPOV.pos;
    const cameraQuat = ATON.Nav._qOri;

    fadeMesh.position.copy(cameraPos);
    fadeMesh.quaternion.copy(cameraQuat);
    fadeMesh.translateZ(-0.5);
};

APP.OLDfadeToBlack = (duration = 1000, onComplete = () => {}) => {
    APP.setupForFade();

    const fadeMesh = APP.blackPlaneFade;
    const fadeMaterial = APP.blackPlaneMaterial;

    if (!ATON._mainRoot.children.includes(fadeMesh)) {
        ATON._mainRoot.add(fadeMesh);
    }

    fadeMaterial.opacity = 0;  // ensure we start from black = 0

    const startTime = performance.now();

    function animate() {
        APP.updateFadePlanePosition();
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        fadeMaterial.opacity = t;

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            onComplete();
        }
    }

    animate();
};

APP.OLDfadeFromBlack = (duration = 1000, onComplete = () => {}) => {
    const fadeMesh = APP.blackPlaneFade;
    const fadeMaterial = APP.blackPlaneMaterial;

    if (!fadeMesh || !fadeMaterial) {
        console.warn('fadeFromBlack called without setup');
        onComplete();
        return;
    }

    if (!ATON._mainRoot.children.includes(fadeMesh)) {
        ATON._mainRoot.add(fadeMesh);
    }

    fadeMaterial.opacity = 1;  // ensure we start fully black

    const startTime = performance.now();

    function animate() {
        APP.updateFadePlanePosition();
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        fadeMaterial.opacity = 1 - t;

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            ATON._mainRoot.remove(fadeMesh);
            onComplete();
        }
    }

    animate();
};



APP.testFade = () => {
    APP.fadeToBlack(1000, () => {
        console.log("Scene graph updated");

        // Perform updates here

        APP.fadeFromBlack(1000);
    });
};



function getRequestAnimationFrame() {
    return (ATON.XR && ATON.XR.currSession)
        ? ATON.XR.currSession.requestAnimationFrame.bind(ATON.XR.currSession)
        : window.requestAnimationFrame;
}

APP.fadeToBlack = (duration = 1000, onComplete = () => {}) => {
    try {
        APP.setupForFade();

        const fadeMesh = APP.blackPlaneFade;
        const fadeMaterial = APP.blackPlaneMaterial;

        if (!ATON._mainRoot.children.includes(fadeMesh)) {
            ATON._mainRoot.add(fadeMesh);
        }

        fadeMaterial.opacity = 0; // start transparent

        const startTime = performance.now();
        const raf = getRequestAnimationFrame();

        function animate() {
            try {
                APP.updateFadePlanePosition();
                const elapsed = performance.now() - startTime;
                const t = Math.min(elapsed / duration, 1);
                ATON.Photon.fire("myRemoteLog","T is: " + t);

                fadeMaterial.opacity = t;

                if (t < 1) {
                    raf(animate);
                } else {
                    onComplete();
                }
            } catch (err) {
                console.error("Error during fadeToBlack animation:", err);
                onComplete();
            }
        }

        raf(animate);
    } catch (err) {
        console.error("Error starting fadeToBlack:", err);
        onComplete();
    }
};

APP.fadeFromBlack = (duration = 1000, onComplete = () => {}) => {
    try {
        const fadeMesh = APP.blackPlaneFade;
        const fadeMaterial = APP.blackPlaneMaterial;

        if (!fadeMesh || !fadeMaterial) {
            console.warn('fadeFromBlack called without setup');
            onComplete();
            return;
        }

        if (!ATON._mainRoot.children.includes(fadeMesh)) {
            ATON._mainRoot.add(fadeMesh);
        }

        fadeMaterial.opacity = 1; // start fully black

        const startTime = performance.now();
        const raf = getRequestAnimationFrame();

        function animate() {
            try {
                APP.updateFadePlanePosition();
                const elapsed = performance.now() - startTime;
                const t = Math.min(elapsed / duration, 1);
                fadeMaterial.opacity = 1 - t;

                if (t < 1) {
                    raf(animate);
                } else {
                    ATON._mainRoot.remove(fadeMesh);
                    onComplete();
                }
            } catch (err) {
                console.error("Error during fadeFromBlack animation:", err);
                ATON._mainRoot.remove(fadeMesh);
                onComplete();
            }
        }

        raf(animate);
    } catch (err) {
        console.error("Error starting fadeFromBlack:", err);
        onComplete();
    }
};


//ATON.on("fadeToBlack", () => {APP.fadeToBlack(1000);});
//ATON.on("fadeFromBlack", () => {APP.fadeFromBlack(1000);});






const COLORS = {
  red:        0xff0000,
  green:      0x00ff00,
  blue:       0x0000ff,
  yellow:     0xffff00,
  cyan:       0x00ffff,
  magenta:    0xff00ff,
  orange:     0xffa500,
  purple:     0x800080,
  white:      0xffffff,
  gray:       0x808080
};

APP.createArrowHelper = (dir, origin, length, colorHex = "yellow") => {

        const arrowHelper = new THREE.ArrowHelper( dir, origin, length, COLORS[colorHex] );
        ATON.getRootScene().add( arrowHelper );
}

APP.testvDir=()=>{
    APP.createArrowHelper(ATON.Nav._vDir, ATON.Nav._currPOV.pos, 1,"green");
}

APP.testvDirNegated=()=>{
    APP.createArrowHelper(ATON.Nav._vDir.negate(), ATON.Nav._currPOV.pos, 1,"blue");
}

APP.testOrtogonalVDir=(axis)=>{
    let c;
    if(axis=="x") c = "red";
    if(axis=="y") c = "yellow";
    if(axis=="z") c = "blue";
    
    let orto = APP.getOrthogonalVectorAroundAxis(ATON.Nav._vDir, axis);
    APP.createArrowHelper(orto, ATON.Nav._currPOV.pos, 1,c);
}

APP.testvqOri=()=>{
    APP.createArrowHelper(ATON.Nav._qOri, ATON.Nav._currPOV.pos, 1,"red");
}

APP.getOrthogonalVectorAroundAxis=(vec, axis)=> {
  const orthogonal = vec.clone();

  switch (axis.toLowerCase()) {
    case 'x':
      // Rotate in YZ plane
      orthogonal.set(
        vec.x,
        -vec.z,
        vec.y
      );
      break;

    case 'y':
      // Rotate in XZ plane
      orthogonal.set(
        vec.z,
        vec.y,
        -vec.x
      );
      break;

    case 'z':
      // Rotate in XY plane
      orthogonal.set(
        -vec.y,
        vec.x,
        vec.z
      );
      break;

    default:
      console.warn('Invalid axis. Use "x", "y", or "z".');
      return vec.clone();
  }

  return orthogonal.normalize();
}


APP.removeUserSUI=()=>{
    APP.deleteAndDispose(APP._suiLeftUserLabel);
}

//USER SUI

// Positioning factors
APP.forwardFactor = 0.5 // 0.3;
APP.leftFactor = 0; // 0.13;
APP.upFactor =  -0.1; //0;

APP.UserSUI_w = 0.5;
APP.UserSUI_h = 0.1;
APP_UserSUI_fontSize = 0.013;

APP.setUserSUI=(options)=>{

    let _content = options.content || "label";
    let _w = options.w || 0.1;
    let _h = options.h || 0.02;

   const raf = getRequestAnimationFrame();


  
  // Create label
  const label = suiBuilder.createLabel({
    id: "sui-left",
    w: _w,
    h: _h,
    content: _content,
    pos: { x: 0, y: 0, z: 0 },
    rot: { x: 0, y: 0, z: 0 },
    fSize: APP_UserSUI_fontSize
  });

  label.attachTo(ATON.getRootScene());
  APP._suiLeftUserLabel = label;

  const updateLoop = () => {

    if (!APP._suiLeftUserLabel) return;

    const userPos = ATON.Nav._currPOV.pos.clone();
    const userDir = ATON.Nav._vDir.clone().normalize();

    // Compute side and up vectors
    const up = new THREE.Vector3(0, 1, 0); // world up
    const left = new THREE.Vector3().crossVectors(up, userDir).normalize();

    // Calculate label position relative to user
    const labelPos = userPos.clone()
      .add(userDir.clone().multiplyScalar(APP.forwardFactor))
      .add(left.clone().multiplyScalar(APP.leftFactor))
      .add(up.clone().multiplyScalar(APP.upFactor));

    // Set position
    label.setPosition(labelPos);

    // Make the label face the user
    label.lookAt(userPos);

    raf(updateLoop);
  };

  updateLoop(); // Start the loop

}


// Run the App
window.addEventListener('load', ()=>{
	APP.run(); 
});