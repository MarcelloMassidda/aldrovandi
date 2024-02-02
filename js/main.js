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
})


let APP = ATON.App.realize();

APP.closePopup=()=> 
{ 
    document.getElementById("welcomePopupContainer").style.display="none"; 
    //AUDIO PLAY

    APP._audio = document.getElementById("introAudio"); 
    APP._audio.play();
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

APP.isVR_Running=()=>{return ATON.XR._bPresenting}


// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.


APP.setup = ()=>{
    
  

    const configPath = "./config.json";


    ATON.PATH_COLLECTION = "content/";
    APP.pathContent = window.location.href.split('?')[0];
    APP.pathContent += "content/";
    


    ATON.on("AllNodeRequestsCompleted",()=>{APP.onAllNodeRequestsCompleted()});
    APP.loadConfig(configPath);

    ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");	

    //Forced hide loader
    /*
    if (!APP.isVR_Device())
    {
        ATON.on("NodeRequestFired", ()=>{
            //   $("#idLoader").show();
            $("#idLoader").hide();
           });
    }
  */


    // config is loaded
ATON.on("APP_ConfigLoaded", ()=>
{
    console.log("config loaded");

    //INITIALIZE ROOM 1
    APP.STAGE = 1;
    //Set Panorama
    ATON.setMainPanorama( 'image/hemi-grey.jpg');
  
    //Lights probes to remove
    /*
    let posLP = new THREE.Vector3( 86,0.5,-121 );
    APP._lightProbe  = new ATON.LightProbe(128, 10.0).setPosition(posLP);
    ATON.addLightProbe(APP._lightProbe);
    ATON.SUI.gLPIcons.hide();
    */
   
    //Setup Semantics
    APP.setupCustomSemanticMats();
    APP.setupCustomSemanticHovers();
    
    //Create SUI
    if(APP.isVR_Device()){APP.setupSUI();}

    helper.init();


    let homepov = APP.config.HomePov;
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


APP.setupSUI=()=>
{
    APP.CloseObject_SUIBtn = new ATON.SUI.Button("sui-back");
    APP.CloseObject_SUIBtn.setIcon(APP.pathContent + 'icons/backBtn.png', true)
    APP.CloseObject_SUIBtn.setOnSelect(APP.CloseObject)
    APP.CloseObject_SUIBtn.attachToRoot();

    APP.Title_SUI = suiBuilder.customLabel("sui-title",1,0.5);// new ATON.SUI.Label("sui-title", 1 , 0.5);
   // APP.Title_SUI.setBaseColor( new THREE.Color(0.1,0.1,0.1));
    APP.Title_SUI.uiText.set({fontSize: 0.1, textAlign:"left", justifyContent:"left", content:"..."});
    ThreeMeshUI.update();
    APP.Title_SUI.attachToRoot();



  // suiBuilder.container("prova").attachToRoot();
}

//TO DO
APP.composeAmbient = (_stage)=>
{
    //room
    //(TODO: To replace with parametric room ambient)
    APP.ambient = ATON.createSceneNode("ambient");
    APP.ceiling =  ATON.createSceneNode(APP.config.ceiling.id).load(APP.config.ceiling.path).setPosition(0,0.941,0)
    APP.ceiling.attachTo(APP.ambient);
    APP.room =  ATON.createSceneNode(APP.config.room.id).load(APP.config.room.path).attachTo(APP.ambient);
    APP.ambient.attachToRoot();

    //objCollection
    APP.lowObjCollection = ATON.createSceneNode("objCollection").load(APP.config.objectCollections[_stage]);
    APP.lowObjCollection.attachToRoot();

    //SemanticNodes
    APP.objects = {};
    APP.config.objects.map((obj)=>
    {
        APP.objects[obj.id]=obj;
     
        if(APP.isVR_Device()) return;
     
     
        //SemanticNode
        let sem = obj.sem;
        var semNode = ATON.createSemanticNode(obj.id+"_sem").load(sem.path)
        .setDefaultAndHighlightMaterials(APP.matSemDef, APP.matSemHL)
        .setOnHover(function(){console.log("HOVER"); ATON.SUI.fpTeleport.children[0].visible=false})
        .setOnLeave(function(){console.log("LEAVE"); ATON.SUI.fpTeleport.children[0].visible=true})
        .setOnSelect(function(){console.log("SELECTED")});
        if(sem.pos){semNode.setPosition(sem.pos.x,sem.pos.y,sem.pos.z)}
        if(sem.rot){semNode.setRotation(sem.rot.x,sem.rot.y,sem.rot.z)}
        semNode.attachToRoot();
    });
}



  APP.setupCustomSemanticHovers=()=>
  {
    //OVERRIDED FROM ATON.fe

        // Semantic
        ATON.on("SemanticNodeHover", (semid)=>{
            var FE = ATON.FE;

            let S = ATON.getSemanticNode(semid);
            if (S === undefined) return;
    
            FE.showSemLabel(semid);
            FE._bSem = true;
    
            S.highlight();
            //$('canvas').css({ cursor: 'crosshair' });
            $('canvas').css({ cursor: 'zoom-in'});
            if (ATON.SUI.gSemIcons) ATON.SUI.gSemIcons.hide();
            
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

//DESKTOP/MOBILE DoubleTAP
ATON.on("DoubleTap", (e)=>
{
    APP.TryToTapHoveredSemoNode();
});

//OCULUS SELECT
ATON.on("XRselectEnd", (c)=>{
    console.log("Sel end "+c);
    APP.TryToTapHoveredSemoNode();
});

APP.TryToTapHoveredSemoNode = ()=>
{
    if(!ATON._hoveredSemNode) return;
    APP.onTapSemNodes(ATON._hoveredSemNode);
}



APP.onTapSemNodes = (idSem)=>
{

    if(APP.isVR_Device()) return;

    //get object ID from semantic ID
    console.log(idSem + " tapped.");
    let _id = idSem.substring(0, idSem.length-(4));

    if(APP.isVR_Running() && APP.objects[_id].type=="video") return; //prevent video to fix

    //Load object // TODO: async?? MOVED TO ON ENDED POV REQUEST

    //get POV in 
    let povIn = APP.objects[_id].povIn;
    if(!povIn) return;

    APP._currentObjectActive = _id;

    var _pov = new ATON.POV("povIn_"+_id)
    .setPosition(povIn.pos.x,povIn.pos.y,povIn.pos.z)
    .setTarget( povIn.target.x,povIn.target.y,povIn.target.z);

    var SemNode = ATON.getSemanticNode(_id+"_sem");
    SemNode.hide();

    
    //type=="object"
        ATON.getSceneNode("ambient").hide();
        ATON.Nav.setOrbitControl();
        ATON.getSceneNode("blackSphere").show();
    
    if(APP.objects[_id].type=="video")
    {
       // APP.showVideo();
        document.getElementById("InfoScrollContainer").style.display="none";
    }

    ATON.Nav.requestPOV(_pov, 0.6);
    ATON._mainRoot.background = new THREE.Color("rgb(17,17,17)");


    APP.config.objects.map((o)=>
    {
        if(o.id == APP._currentObjectActive) return;
        if(ATON.getSceneNode(o.id)) ATON.getSceneNode(o.id).hide();
        if(ATON.getSemanticNode(o.id+"_sem")) ATON.getSemanticNode(o.id+"_sem").hide();
    })

    //OPEN SIDEBAR
    const _info = APP.returnFormattedInfo(APP.objects[APP._currentObjectActive].content);

    document.getElementById("InfoContainer").innerHTML =  _info;
    document.getElementById("SideBAR").style.display="block";
    
        var copy = document.getElementById(_id); //??
        if(copy)
        {
            copy.style.dislay="block";
        }
}



    ATON.on("POVTransitionCompleted", (x)=>{
        if(!APP._currentObjectActive) return;
        if(APP.currentObjIsFocused) return;

        var obj =  APP.objects[ APP._currentObjectActive];
        ATON.SUI.setSelectorRadius(0);
        
        if(obj.type == "video")
        {
            APP.showVideo();
        }

        if(obj.type=="object")
        {
                console.log('%cTransition POV Ended ' + obj.hoverLable, 'background: #222; color: #bada55');
                $('canvas').css({ cursor: 'wait'});
                
                var hqObj = ATON.createSceneNode(obj.id).load(obj.path,
                    /*On Complete: */ ()=>{
                        APP.lowObjCollection.hide();
                        $('canvas').css({ cursor: 'grab'});
                    });

                if(obj.pos){hqObj.setPosition(obj.pos.x,obj.pos.y,obj.pos.z)}
                if(obj.rot){hqObj.setRotation(obj.rot.x,obj.rot.y,obj.rot.z)}
                hqObj.attachToRoot();

                //SUI
            if(APP.isVR_Running())// if(APP.isVR_Device())
            {
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
        
            }
        }
        APP.currentObjIsFocused=true;
    })


APP.CloseObject = ()=>
{

    //Get and delete current object
    const currentObj = APP.objects[APP._currentObjectActive];
    const t = currentObj.type;

    if(t=="object") ATON.getSceneNode(currentObj.id).delete();
    APP._currentObjectActive = null;
    APP.currentObjIsFocused= false;

    let povOut = currentObj.povOut;
    var _pov = new ATON.POV("povOut_"+ APP._currentObjectActive)
    .setPosition(povOut.pos.x,povOut.pos.y,povOut.pos.z)
    .setTarget( povOut.target.x,povOut.target.y,povOut.target.z);
    ATON.Nav.requestPOV(_pov, 0.6);
    
    ATON.getSceneNode("ambient").show();
    APP.lowObjCollection.show();

    //Show Semantic and Scene Nodes of objects
    APP.config.objects.map((o)=>
    {
       if( ATON.getSceneNode(o.id)) ATON.getSceneNode(o.id).show();
       if(ATON.getSemanticNode(o.id+"_sem")) ATON.getSemanticNode(o.id+"_sem").show();
    })

  //  ATON.getSemanticNode(APP._currentObjectActive+"_sem").show();
    document.getElementById("SideBAR").style.display="none";
    document.getElementById("InfoScrollContainer").style.display="block";
    
    ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");
    APP._currentObjectActive = null;
    ATON.Nav.setFirstPersonControl();
   // ATON.setMainPanorama( 'image/hemi-grey.jpg');
    APP.closeVideo();
    ATON.getSceneNode("blackSphere").hide();

    //SUI
    if(APP.isVR_Running())// if(APP.isVR_Device())
    {
        APP.CloseObject_SUIBtn.visible = false;

        APP.Title_SUI.uiText.set({ content: "..." });
        APP.Title_SUI.visible = false;
        ThreeMeshUI.update()
    }
    
}


APP.openIIIFview=(target)=>
{
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
                    document.getElementById("miradorViewer").style.display="none"
                };
                initialized = true;
            }
        }
    }
        document.getElementById("miradorViewer").style.display="block";

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


    APP.showVideo=()=>
    {
        var videoPlayer = document.getElementById("VideoPlayer");
        videoPlayer.currentTime = 1;
        videoPlayer.style.display="block";
    }

    APP.closeVideo=()=>
    {
        var videoPlayer  = document.getElementById("VideoPlayer");
        videoPlayer.pause();
        videoPlayer.style.display="none";
        videoPlayer.currentTime = 1;
    }


    ATON.on("KeyPress", (k)=>{
        
                if (k === '1') { APP.ceiling.toggle(); }
                if (k === '2') { APP.lowObjCollection.toggle(); }
                if (k === '3') { APP.useGizmo("quadro")}
                if (k === '4') { console.log(ATON.getSceneNode("quadro").rotation)}
            });
};




/* APP.update() if you plan to use an update routine (executed continuously)
APP.update = ()=>{

};
*/



    
APP.sceneInitialized = false;
APP.onAllNodeRequestsCompleted=()=>
{
   $("#idLoader").hide();
   if(APP.sceneInitialized) return;

   //Initialize BlackSphere:
    ATON.SUI.setSelectorRadius(0);
        //Create BlackSphere

        const myMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.1,0.1,0.1),
            side: THREE.BackSide,
            transparent: false,
        });

    
        const geometry = new THREE.SphereGeometry();
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



// Run the App
window.addEventListener('load', ()=>{
	APP.run(); 
});
