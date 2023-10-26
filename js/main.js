/*
	Main js entry for template ATON web-app

===============================================*/
let APP = ATON.App.realize();

APP.closeWelcome=()=>
{
    document.getElementById("welcomeContainer").style.display="none";
}


// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

    document.APP = APP; 

    ATON.PATH_COLLECTION = "content/";
    ATON.FE.realize(); // Realize the base front-end

    // show LP icons in 3D space
    ATON.SUI.enableLPIcons();
    ATON.SUI.gLPIcons.hide();

	ATON.FE.addBasicLoaderEvents(); // Add basic events handling
    

    ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");

	APP.loadConfig("./config.json");

    ATON.on("AllNodeRequestsCompleted",()=>{APP.onAllNodeRequestsCompleted()});


  


    // config is loaded
ATON.on("APP_ConfigLoaded", ()=>
{
    console.log("config loaded");

    //Set Panorama
    ATON.setMainPanorama( 'image/hemi-grey.jpg');
  
    let posLP = new THREE.Vector3( 86,0.5,-121 );
    APP._lightProbe  = new ATON.LightProbe(128, 10.0).setPosition(posLP);
    ATON.addLightProbe(APP._lightProbe);
  
    ATON.SUI.gLPIcons.hide();

  
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
        if(obj.path)
        {
            ATON.createSceneNode(obj.id).load(obj.path)
            .setPosition(obj.pos.x,obj.pos.y,obj.pos.z)
            .setRotation(obj.rot.x,obj.rot.y,obj.rot.z)
            .attachToRoot();
        }
        
        //SemanticNode
        let sem = obj.sem;
        var semNode = ATON.createSemanticNode(obj.id+"_sem").load(sem.path)
        .setDefaultAndHighlightMaterials(APP.matSemDef, APP.matSemHL)
        .setOnHover(function(){console.log("HOVER")});
        if(sem.pos){ semNode.setPosition(sem.pos.x,sem.pos.y,sem.pos.z)}
        if(sem.rot){semNode.setRotation(sem.rot.x,sem.rot.y,sem.rot.z)}
        semNode.attachToRoot();
    });


    let homepov = APP.config.HomePov;
    ATON.Nav.setHomePOV(
        new ATON.POV()
            .setPosition(homepov.pos.x,homepov.pos.y,homepov.pos.z)
            .setTarget(homepov.target.x,homepov.target.y,homepov.target.z)
           // .setFOV(H.fov)
    );


    ATON.Nav.setFirstPersonControl()
    ATON.Nav.requestHome(0.5);
    
});




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

    if(APP.objects[_id].type=="object")
    {
        ATON.getSceneNode("ambient").hide();
        ATON.Nav.setOrbitControl();
        ATON.getSceneNode("blackSphere").show();
    }
    else
    {
        APP.showVideo();
    }

    ATON.Nav.requestPOV(_pov, 0.6);
    ATON._mainRoot.background = new THREE.Color("rgb(17,17,17)");

    //Hide other Scene and Semantic Nodes of objects
    APP.config.objects.map((o)=>
    {
        if(o.id == APP._currentObjectActive) return;
        if(ATON.getSceneNode(o.id)) ATON.getSceneNode(o.id).hide();
       if(ATON.getSemanticNode(o.id+"_sem")) ATON.getSemanticNode(o.id+"_sem").hide();
    })

    //OPEN SIDEBAR
    document.getElementById("InfoContainer").innerHTML = APP[APP._currentObjectActive+"Info"];

    document.getElementById("SideBAR").style.display="block";
    
        var copy = document.getElementById(_id);
        if(copy)
        {
            copy.style.dislay="block";
        }
       // ATON.setMainPanorama( 'image/black.png');
      
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
      if( ATON.getSceneNode(o.id)) ATON.getSceneNode(o.id).show();
       if(ATON.getSemanticNode(o.id+"_sem")) ATON.getSemanticNode(o.id+"_sem").show();
    })

  //  ATON.getSemanticNode(APP._currentObjectActive+"_sem").show();
    document.getElementById("SideBAR").style.display="none";
    ATON._mainRoot.background = new THREE.Color("rgb(231, 231, 231)");
    APP._currentObjectActive = null;
    ATON.Nav.setFirstPersonControl();
   // ATON.setMainPanorama( 'image/hemi-grey.jpg');
    APP.closeVideo();
    ATON.getSceneNode("blackSphere").hide();
}


APP.openIIIFview=()=>
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
        /*
                if (k==='0') APP.setState(APP.STATE_IDLE);
                if (k==='1') APP.setState(APP.STATE_PILLS);
                if (k==='2') APP.setState(APP.STATE_LENS);
        */
                if (k==='1'){
                    APP.ceiling.toggle();
                }});

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


  /*  APP.TraspMaterial = new THREE.MeshPhysicalMaterial({
        metalness: 0,  
        roughness: 0,
        transmission: 1, // Add transparency
       // thickness: 0.5, // Add refraction!
      });*/

  //  const _envMap = ATON.Utils.textureLoader.load( 'content/image/hemi-grey.jpg')
  //  APP.TraspMaterial = new THREE.MeshBasicMaterial({ envMap: _envMap } );

  //  APP.TraspMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
   
      APP.fakeGlassMat = ATON.MatHub.materials.selector.clone();
      ATON.MatHub.materials.selector.opacity= 0;
    APP.ambient.children[1].traverse((o)=>
    {
        console.log(o.name)
        if(o.name.includes("vetro"))
        {
            o.material =    APP.fakeGlassMat ;
           // o.material =  ATON.MatHub.materials.transWhite;
//            o.material = APP.TraspMaterial;
          //  o.envMap = _envMap;
  //          o.material.needsUpdate = true;
          //  o.mapping = THREE.CubeRefractionMapping
   //       o.color = 
        }
    })

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
        n.setPosition(83.79456628914275, 3.7398329478829453, -124.78000583629174)
        .setScale(10,10,10)
        .attachToRoot();
        n.hide();
}


APP.useGizmo=(id, mode="translate")=> //translate rotate
{
  //Active Gizmos:
  ATON.useGizmo(true);
  ATON._gizmo.setMode(mode);      
  ATON.FE.attachGizmoToNode(id);
}

APP.getPosOfNode=(id)=>
{
return ATON.getSceneNode(id).position;
}



APP.quadroInfo =    `
<h1>Ritatto di Ulisse Aldrovandi</h1>
<!--BLOCK SCHEDA INFORMATIVA-->
<div class="Block">
    <div class="flexContainer">
        <div class="leftSide">
            <div class="myCircle"></div>
        </div>
        <div class="RightSide">
            <span class="b">OGGETTO</span>: dipinto<br><br>
            <span class="b">MATERIA E TECNICA</span>:  tela/ pittura a olio<br><br>
            <span class="b">DIMENSIONI</span>: 79 cm x 62 cm<br><br>
            <span class="b"> DATA</span>: 1584/1586<br><br>
            <span class="b"> ATTRIBUZIONI</span>: Agostino Carracci<br/><br>
            <span class="b">ALTRE ATTRIBUZIONI</span>: Ludovico Carracci, Carracci Agostino, Attribuito: Bartolomeo Passarotti<br><br>
            <span class="b"> LUOGO DI CONSERVAZIONE</span>: Accademia Carrara - Museo, Bergamo<br>
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
