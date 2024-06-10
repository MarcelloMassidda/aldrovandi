/*
In questo file ci vanno le configurazioni specializzate che interagiscono con la app di Aldrovandi
per farla funzionare con l'"Addon" MIND.
Fa il mapping tra il MIND e Aldrovandi

LA UI del controller dovrebbe essere iniettata da qua, lasciando intatta la app Aldrovandi

il "minder" deve avere:
-setup(role) //controller or user
-config
*/


let config;
let UI;
let SUI={};
var AldrovandiMind = {};

AldrovandiMind.config = ()=>{return APP.config.mind;}

AldrovandiMind.setup=(role)=>
{
    AldrovandiMind.role = role;

    //inject uiToolkit with callback on loaded:
   // const UItoolkit_path = window.origin+"/a/uitoolkit/js/uitoolkit.js";
   // const UIcss_path = window.origin+"/a/uitoolkit/styles/style.css";
   const basePath =  window.origin+"/a/aldrovandi/content/";
   const UItoolkit_path = basePath + "uitoolkit.js";
   const UIcss_path = basePath+"style.css";


   MIND.injectUI(UItoolkit_path,UIcss_path,AldrovandiMind.InitExperimentOnLoadUI);

   

    AldrovandiMind.setupPhotonEvents();


}

AldrovandiMind.InitExperimentOnLoadUI=(_UI)=>
{
    AldrovandiMind.isInitialized = false;

    ATON.on("AllNodeRequestsCompleted",()=>
    {

        if(AldrovandiMind.isInitialized) return;
        config = AldrovandiMind.config();
        
        UI = _UI;
        const r = AldrovandiMind.role;
    
        APP.closeWelcomePopup();

        if(r=="controller")
        {
            APP.closeWelcomePopup();
            MIND.requestPOV(config.homePOVController[APP.STAGE]);
            Aldro_MindUI.setUpControllerSidebarHome();
        }
        if(r=="user")
        {
            APP.lowObjCollection.hide();
            APP.semObjects.hide();

            //SETUP SUI: Mostrare in VR oggetto A e B
             SUI.A = new ATON.SUI.Button("SUI-object_A");
             const objectPathA = config.popupObjectsThumb["A"];          
             SUI.A.setIcon(APP.pathContent + objectPathA, true)
             SUI.A.setPosition(1.42,1.71,3.8);

             SUI.A.setScale(26,26,26);
             SUI.A.setRotation(-2.944,-1.55,-2.93489);
             SUI.A.visible=false;
             
             
            SUI.B = new ATON.SUI.Button("SUI-object_B");
            const objectPathB = config.popupObjectsThumb["B"];          
            SUI.B.setIcon(APP.pathContent + objectPathB, true)
            SUI.B.setPosition(1.42,1.71,3.8);
            SUI.B.setScale(26,26,26);
            SUI.B.setRotation(-2.944,-1.55,-2.93489);
            SUI.B.visible=false;
            SUI.B.attachToRoot();

            SUI.A.attachToRoot();

        }
        
        //MIND.setColliders(AldrovandiMind.colliders);

        AldrovandiMind.isInitialized=true;
    })
}

//UI
Aldro_MindUI = {};
Aldro_MindUI.createNewSessionBtnID = "createNewSessionBtn";
Aldro_MindUI.reportID= "reportContainer";
Aldro_MindUI.sideBarID= "controllerSideBar";
Aldro_MindUI.exploratioBtnID = "ExplorationBtn";
Aldro_MindUI.searchPanelID = "searchObjectPanel";
Aldro_MindUI.foundedObjectsGroupBtnID = "userFoundObject_BtnGroup"
Aldro_MindUI.userPlayAudioBtnID = "userPlayAudio_Btn"
Aldro_MindUI.statusBarId = "controllerStatusBar"
Aldro_MindUI.setUpControllerSidebarHome=()=>
{
    //NEW SESSION BTN
    const createrSession_Btn = UI.button({id:Aldro_MindUI.createNewSessionBtnID,text:"Crea una nuova sessione",tooltip:"Nuova sessione",onpress:AldrovandiMind.createNewSession});
    const printData_Btn = UI.button({id:"printData_Btn",text:"Scarica dati sessioni", onpress: function(){AldrovandiMind.printData()}});

    if($("#"+Aldro_MindUI.sideBarID).length) 
    {
        $("#"+Aldro_MindUI.sideBarID).html([createrSession_Btn,printData_Btn]); return;
    }

    //Sidebar
    let mySideBar = UI.sideBar({
        id: Aldro_MindUI.sideBarID,
        position:"left",
        content: [createrSession_Btn,printData_Btn],
        classList: ["controllerSideBar"]
    })
    $("body").append(mySideBar);
}



Aldro_MindUI.updateReport=()=>
{
    $("#"+ Aldro_MindUI.reportID).html(Aldro_MindUI.showRecordByID(state.currentRecordID));
}



Aldro_MindUI.setUpControllerPanel=()=>
{
    //GET LIST OF ITEMS
    //SELECT IF YOU WANT TO START FROM SOME

    //STATUS BAR:
    var statusBar = UI.createItem({id: Aldro_MindUI.statusBarId, css:{"margin-bottom":"5px"}, text: ""});
    //REPORT:
    var reportContainer = UI.createItem({id: Aldro_MindUI.reportID, css:{"margin-bottom":"5px"}, text: Aldro_MindUI.showRecordByID(state.currentRecordID)});

    const getBtns =()=>
    {
        //HOME
        var userHome_Btn = UI.button({id:"userHome_Btn",text:"START",tooltip:"Sposta l'utente nella posizione di partenza",onpress:AldrovandiMind.photon_SetUserInStartPosition})
        
        //PLAY AUDIO
        var userPlayAudioBtn = null;
        if(state.currentRecord.audioVersion!="NO"){userPlayAudioBtn = UI.button({id:Aldro_MindUI.userPlayAudioBtnID ,text:`PLAY AUDIO: ${state.currentRecord.audioVersion}`, onpress: function(){AldrovandiMind.photon_playIntroAudioForUser()}});}
      
        //EXPLORATION SPACE
        //var userStartStopExploration_Btn = UI.button({id:Aldro_MindUI.exploratioBtnID,text:"START EXPLORATION", attr:{name:"state",value:"pause"},onpress:AldrovandiMind.StartStopExploration});
        var userStartStopExploration_Btn = AldrovandiMind.returnTimerBtn("exploration1");
      
        //SHOW OBJECTS
        var userShowObjectA_Btn = UI.button({id:"userShowObjectA_Btn",text:"Mostra OGGETTO A (vitello)", onpress: function(){AldrovandiMind.photon_SetupToShowObject("A")}});
        var userShowObjectB_Btn = UI.button({id:"userShowObjectB_Btn",text:"Mostra OGGETTO B (tacchino)", onpress:function(){AldrovandiMind.photon_SetupToShowObject("B")}});
        var userShowObjectsBtnGroup = UI.buttonGroup({id:"userObjectsBtnGroup", classList:"controllerSideBarGroup", buttons:[userShowObjectA_Btn,userShowObjectB_Btn]});
        
        //Set Correct Answer for Object
        var userGetCorrectAnswerForObject_Btn = UI.button({id:"userGetCorrectAnswerForObject_Btn",text:"Risposta corretta", onpress: function(){AldrovandiMind.setAnswerForObject(true)}});
        var userGetNOCorrectAnswerForObject_Btn = UI.button({id:"userGetNONCorrectAnswerForObject_Btn",text:"Risposta sbagliata", onpress:function(){AldrovandiMind.setAnswerForObject(false)}});
        var userAnswerForObjectsBtnGroup = UI.buttonGroup({id:"userAnswersBtnGroup", classList:"controllerSideBarGroup", buttons:[userGetCorrectAnswerForObject_Btn,userGetNOCorrectAnswerForObject_Btn]});

      //  var searchPanel = $("<div>").attr("id", Aldro_MindUI.searchPanelID)

        //end session btn
        endSession_Btn = UI.button({id:"endSession_Btn",text:"Termina Sessione", onpress: function(){AldrovandiMind.endSession()}});
     
        return [statusBar,reportContainer,userHome_Btn,userPlayAudioBtn, userStartStopExploration_Btn, userShowObjectsBtnGroup, userAnswerForObjectsBtnGroup,endSession_Btn];

    }

    $("#"+Aldro_MindUI.createNewSessionBtnID).css("display", "none");
    $("#"+Aldro_MindUI.sideBarID).html(getBtns());
}

//type==text
//conditions
//error
Aldro_MindUI.askForNewUserID=() => {
    const _text = "Stai creando un nuovo record: Inserisci l'id del nuovo utente"
    return MIND.promptUserInput({text:_text});
}

Aldro_MindUI.showRecordByID=(recordID)=>
{

    const record = MIND.get(recordID);
    var report = "REPORT:</br>";
    
    //
    const props = config.dataFormat.props;
    props.forEach(p => {
        if(record[p]) report+= `${p}: ${record[p]}</br>`
    });
    return report;
    
   /*
    Object.keys(record).map(key => {
        report+= `${key}: ${record[key]}</br>`
    });
    return report;
    */
}

Aldro_MindUI.showAllRecords=()=>
{
    var globalReport = "";
    var items =  MIND.getAllItemsFromLocalStorage();
    items.forEach(item => {
        globalReport += item.userNameSurname + "<br>"
    });

    
}

Aldro_MindUI.togglePlayPauseBtn=(id, html)=>
{
    var el =  $("#"+id);
    
    //const state = el.attr("state");
    //let _newstate = state=="pause" ? "play" : "pause";
    //el.attr("state",_newstate);
   // el.html(_html[_newstate]);
   if(el.length) el.html(html);
}

Aldro_MindUI.wrapInPopup=()=>
{
    
     //options: {id,size:[large,small],content}
     return UI.popup()
}

Aldro_MindUI.updateStatusBar=(t)=>
{
    $("#"+Aldro_MindUI.statusBarId).html(t);
}


//PHOTON:
AldrovandiMind.setupPhotonEvents=()=>
{

    ATON.Photon.on("userComposeAmbient",(stage)=>
    {
        //Il controller segue i movimenti dell'user da una stanza all'altra.
        console.log("User is moving in room: " + stage);    
        if(AldrovandiMind.role=="controller")
        {
            APP.composeAmbient(stage);
        }
    })


    ATON.Photon.on("0_user_Home",(p)=>
    {
        if(AldrovandiMind.role=="user")
        {
            MIND.requestPOV(p);
            SUI.A.visible= false;
            SUI.B.visible= false;
            if(APP)
            {
                APP.semObjects.hide();
                APP.lowObjCollection.hide();
            }
        }
    })


    ATON.Photon.on("0_user_introAudio",(audio)=>
    {

        if(AldrovandiMind.role!="user") return;

        APP._audio = document.getElementById(audio); 
        if(!APP._audio) return;
        // APP._audio.currentTime = 1;
        if(APP._audio.paused)
        {
            APP._audio.play()
        }
        //if  APP._audio.ended
        else{APP._audio.pause()}
        
    })


    ATON.Photon.on("1_user_startExploration",()=>
    {
        console.log("STARTING SPACE EXPLORATION")
        if(AldrovandiMind.role!="user") return;
        if(APP._audio) APP._audio.pause();
        APP.semObjects.show();
        APP.lowObjCollection.show();

        let p = config.homePOVUser;
        MIND.requestPOV(p);
    })

    ATON.Photon.on("1_user_stopExploration",()=>
    {
        if(AldrovandiMind.role!="user") return;
        APP.lowObjCollection.hide();
        APP.semObjects.hide();

    })

    

    ATON.Photon.on("2_showObject",(obj)=>
    {
        console.log("Showing object")
        
        let p = config.homePOVUser;
        MIND.requestPOV(p);
        
        APP.semObjects.hide();
        APP.lowObjCollection.hide();
        
        if(APP.STAGE==2){APP.composeAmbient(1)}
        
        //show A or B
        const _visible = obj=="A";
        SUI.A.visible= _visible;
        SUI.B.visible= !_visible;
    })
}


//CONTROLLER ACTIONS:

AldrovandiMind.createNewSession= async ()=>
{
    //Data entry:
    //user name surname
    const newUserIDtext = "Stai creando un nuovo record: <br> Inserisci l'id del nuovo utente";
    const newUserID = await MIND.promptUserInput({text:newUserIDtext})
    .then((id)=>{return id})
    console.log("newuserID :" + newUserID);
    if(!newUserID) return;
    
    //Audio language:
    const languagesRadios=
    [
        {id:"ita",value:"ita",text:"Italiano", checked:true},
        {id:"eng",value:"eng",text:"Inglese"},
    ]
    const audioLanguageText = "Seleziona la lingua dell'audio";
    const _audioLanguage = await MIND.promptUserInput({text:audioLanguageText,type:"radio", radios:languagesRadios});


    //Audio version
    const radios = 
    [
        {id:"A",value:"A",text:"Audio A (connotativa)", checked:true},
        {id:"B",value:"B",text:"Audio B (denotativa)"},
        {id:"NO",value:"NO",text:"No audio"},
    ]

    const audioVersionText = "Seleziona l'audio da ascoltare";
    const _audioVersion = await MIND.promptUserInput({text:audioVersionText, type:"radio", radios})
    .then((audiov)=>{return audiov});
    if(!_audioVersion) return;

    //device // Desktop / VR
    const deviceText = "Seleziona il device utilizzato";
    const devicesRadios=
    [
        {id:"desktop",value:"desktop",text:"Desktop", checked:true},
        {id:"oculus",value:"oculus",text:"Oculus"},
    ]
    const _device = await MIND.promptUserInput({text:deviceText,type:"radio",radios:devicesRadios});

    const recordID = newUserID+"_"+MIND.returnNow();
    console.log("recordID :" + recordID);
    
    if(record.exist(recordID)) {console.log("exist arealdy"); alert(recordID + " esiste già"); return;}
    const _now = MIND.returnNow();
    const r = {id:recordID, userNameSurname: newUserID, audioVersion:_audioVersion, language:_audioLanguage, device:_device, date: _now};
    record.create(recordID, r );
    console.log("record :" + r);
    state.currentRecordID = recordID;
    state.currentRecord = r;

    Aldro_MindUI.setUpControllerPanel();

    //impose ATON settings for Controller:
    ATON.Nav.setOrbitControl();
    APP.currentMode="orbit";
    if(APP.ceiling) APP.ceiling.visible=false;
}

//User nav to room
AldrovandiMind.photon_userComposeAmbient=(stage)=>
{
    ATON.Photon.fireEvent("userComposeAmbient",stage);
}

//0 START
AldrovandiMind.photon_SetUserInStartPosition=()=>
{
    let p = config.homePOVUser;
    ATON.Photon.fireEvent("0_user_Home",p);
    Aldro_MindUI.updateStatusBar("<b>TUTORIAL</b>:<br>L'utente è nella posizione di partenza. In questo momento <b>NON VEDE</b> gli oggetti nella stanza");
}

AldrovandiMind.photon_playIntroAudioForUser=()=>
{   
    const _audio = state.currentRecord.audioVersion+"_"+state.currentRecord.language;
    ATON.Photon.fireEvent("0_user_introAudio",_audio);
}


//2 SHOW OBJECT:
AldrovandiMind.photon_SetupToShowObject=(obj)=>
{
    state.showingObject = obj;
    Aldro_MindUI.updateStatusBar("L'utente sta guardando l'immagine dell'oggetto "+obj+", <b>NON VEDE</b> gli oggetti nella stanza.");
    ATON.Photon.fireEvent("2_showObject", obj);
}


//2 Set Answer for object
AldrovandiMind.setAnswerForObject=(isCorrect)=>
{
    var _key;
    if(state.showingObject=="A"){_key="2_Object_A_AnswerIsCorrect"}
    if(state.showingObject=="B"){_key="3_Object_B_AnswerIsCorrect"}
    const data = { key:_key , value:isCorrect.toString() }
    record.update(state.currentRecordID,data);
    Aldro_MindUI.updateReport();

    //Se l'utente ha risposto positivamente, deve trovare l'oggetto: quindi si attiva il pulsante "start search object"
    if(isCorrect)
    {
        var idTimer = "";

        if(state.showingObject=="A") idTimer = "searchObjectA";
        if(state.showingObject=="B") idTimer = "searchObjectB";

        var timerBtn =   AldrovandiMind.returnTimerBtn(idTimer);

        //clean in any case:
         if($("#searchObjectA").length>0) $("#searchObjectA").remove();
         if($("#searchObjectB").length>0) $("#searchObjectB").remove();

         var existingChild = $("#userAnswersBtnGroup");
         timerBtn.insertAfter(existingChild); 
     }
    //Se l'utente ha risposto NON correttamente, può rifare exploration n 2
    else
    {
        if(state.showingObject=="A")
        {
            var expl2Btn = AldrovandiMind.returnTimerBtn("exploration2");
            $("#exploration1").replaceWith(expl2Btn);
        }
    }

    var answer = isCorrect ? "ha risposto correttamente" : "NON ha risposto correttamente";
    Aldro_MindUI.updateStatusBar(`L'utente ${answer} alla domanda sull'oggetto ${state.showingObject}`);
}


AldrovandiMind.returnTimerBtn=(idTimer)=>
{
    const t = config.timers[idTimer];
    return UI.button({id:idTimer,text:t.startText, onpress: function(){AldrovandiMind.onTimerBtnClick(idTimer)}});     
}

AldrovandiMind.onTimerBtnClick = (idTimer)=>
{
    const _now = MIND.returnNow();
    const timers = config.timers;

    let data = {key:"", value:""}
    let t = timers[idTimer];
    let currentRecord = record.get(state.currentRecordID);
    let btnTextValue = "";

    if(currentRecord[t.delta])return;


    if(!currentRecord[t.start]) // timer START 
    {
        data.key = t.start; data.value = _now;   
        btnTextValue = t["pauseText"];
        ATON.Photon.fireEvent("1_user_startExploration");
        Aldro_MindUI.updateStatusBar("L'utente <b>VEDE</b> gli oggetti ed esplora le 2 stanze");
    }
    else //timer END and DELTA
    {
        record.update(state.currentRecordID, {key: t.end,value:_now}); 
        data.key = t.delta; data.value = _now - currentRecord[t.start];
        btnTextValue = t["endText"];
        AldrovandiMind.onTimerEnded(idTimer);
        ATON.Photon.fireEvent("1_user_stopExploration");
        Aldro_MindUI.updateStatusBar("L'utente <b>NON VEDE</b> più gli oggetti.");
    }

    Aldro_MindUI.togglePlayPauseBtn(idTimer,btnTextValue);
    record.update(state.currentRecordID, data); 
    Aldro_MindUI.updateReport(); 

}

AldrovandiMind.onTimerEnded=(idTimer)=>
{
    //Fine ricerca degli oggetti A o B:
    if(idTimer=="searchObjectA" || idTimer=="searchObjectB")
    {
        
        //create finded/not founded btn grop
        //replace
        //Set Correct Answer for Object
        var userFoundObject_Btn = UI.button({id:"userGetCorrectAnswerForObject_Btn",text:`Oggetto ${state.showingObject} trovato`, onpress: function(){AldrovandiMind.onUserFoundObjectBtnClicked(true)}});
        var userNOTFoundObject_Btn = UI.button({id:"userGetNONCorrectAnswerForObject_Btn",text:`Oggetto ${state.showingObject} NON trovato`, onpress:function(){AldrovandiMind.onUserFoundObjectBtnClicked(false)}});
        var userFoundObjectBtnGroup = UI.buttonGroup({id:Aldro_MindUI.foundedObjectsGroupBtnID, classList:"controllerSideBarGroup", buttons:[userFoundObject_Btn,userNOTFoundObject_Btn]});

        if($("#"+Aldro_MindUI.foundedObjectsGroupBtnID).length){ $("#"+Aldro_MindUI.foundedObjectsGroupBtnID).remove() }
        $("#"+idTimer).replaceWith(userFoundObjectBtnGroup);
    }
}

AldrovandiMind.onUserFoundObjectBtnClicked=(objectFounded)=>
{
    var _key;
    if(state.showingObject=="A"){_key="2_Object_A_Founded"}
    if(state.showingObject=="B"){_key="3_Object_B_Founded"}
    const data = { key:_key , value:objectFounded.toString() }
    record.update(state.currentRecordID,data);
    Aldro_MindUI.updateReport();

    var founded = objectFounded ? "ha trovato" : "NON ha trovato";
    Aldro_MindUI.updateStatusBar(`L'utente ${founded} l'oggetto ${state.showingObject}`);

    //Se l'utente ha risposto correttamente, MA non è riuscito a trovare l'oggetto A può fare exploration 2.
    if(state.showingObject=="A" && !objectFounded)
    {
        var expl2Btn = AldrovandiMind.returnTimerBtn("exploration2");
        $("#exploration1").replaceWith(expl2Btn);
      //  $("#"+ Aldro_MindUI.searchPanelID).remove();
    }
}


AldrovandiMind.endSession=()=>
{
    Aldro_MindUI.setUpControllerSidebarHome();
}

AldrovandiMind.printData=()=>
{
    MIND.downloadAllRecordsCSV();
}

//RECORD ACTION: MIND IS IN CHARGE
record = {};
record.get=(id)=>{return MIND.get(id)}
record.create=(id,data)=>{return MIND.create(id,data)}
record.update=(id,data)=>
{
    MIND.update(id,data);
    state.currentRecord = MIND.get(state.currentRecordID);
}
record.downloadCSV=(id)=>{}

record.exist=(id)=>{ return MIND.getIfExist(id)==null ? false : true }