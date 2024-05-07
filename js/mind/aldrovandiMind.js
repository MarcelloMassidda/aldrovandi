/*
In questo file ci vanno le configurazioni specializzate che interagiscono con la app di Aldrovandi
per farla funzionare con l'Addon MIND.
Fa il mapping tra il MIND e Aldrovandi

LA UI del controller dovrebbe essere iniettata da qua, lasciando intatta la app Aldrovandi

il "minder" deve avere:
-setup(role) //controller or user
-config
*/

/*
Cos'è una session
*/


//Configuration:


let config;
let UI;
let SUI={};
var AldrovandiMind = {};

AldrovandiMind.config = ()=>{return APP.config.mind;}

AldrovandiMind.setup=(role)=>
{
    AldrovandiMind.role = role;

    //inject uiToolkit with callback on loaded:
    const UItoolkit_path = window.origin+"/a/uitoolkit/js/uitoolkit.js";
    const UIcss_path = window.origin+"/a/uitoolkit/styles/style.css";
    MIND.injectUI(UItoolkit_path,UIcss_path,AldrovandiMind.InitExperimentOnLoadUI);

    AldrovandiMind.setupPhotonEvents();
}

AldrovandiMind.InitExperimentOnLoadUI=(_UI)=>
{
    ATON.on("AllNodeRequestsCompleted",()=>
    {
        config = AldrovandiMind.config();
      
        UI = _UI;
        const r = AldrovandiMind.role;
    
        APP.closeWelcomePopup();

        if(r=="controller")
        {
           // helper.toggleNAV();
           // if(APP.ceiling) APP.ceiling.toggle();
            APP.closeWelcomePopup();
            MIND.requestPOV(config.homePOVController);
            Aldro_MindUI.setUpControllerSidebarHome();
            //Aldro_MindUI.setUpControllerPanel();
        }
        if(r=="user")
        {
            APP.lowObjCollection.toggle();
            ATON.getRootSemantics().toggle()
            
            //SETUP SUI:
            SUI.A = new ATON.SUI.Button("SUI-object_A");
            const objectPathA = config.popupObjectsThumb["A"];          
             SUI.A.setIcon(APP.pathContent + objectPathA, true)
             SUI.A.setPosition(1.475,1.618, 3.415);
             SUI.A.setScale(26,26,26);
             SUI.A.setRotation(-2.944,-1.55,-2.93489);
             SUI.A.visible=false;
             SUI.A.attachToRoot();
             
            SUI.B = new ATON.SUI.Button("SUI-object_B");
            const objectPathB = config.popupObjectsThumb["B"];          
            SUI.B.setIcon(APP.pathContent + objectPathB, true)
            SUI.B.setPosition(1.475,1.618, 3.415);
            SUI.B.setScale(26,26,26);
            SUI.B.setRotation(2.98141,-1.55,-2.93489);
            SUI.B.visible=false;
            SUI.B.attachToRoot();

        }
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

    //REPORT:
    var reportContainer = UI.createItem({id: Aldro_MindUI.reportID, css:{"margin-bottom":"5px"}, text: Aldro_MindUI.showRecordByID(state.currentRecordID)});

    const getBtns =()=>
    {
        //HOME
        var userHome_Btn = UI.button({id:"userHome_Btn",text:"START",tooltip:"Sposta l'utente nella posizione di partenza",onpress:AldrovandiMind.photon_SetUserToHomePov})
        
        //PLAY AUDIO
        var userPlayAudioBtn = null;
        if(state.currentRecord.audioVersion!="NO"){userPlayAudioBtn = UI.button({id:"userPlayAudio_Btn",text:`PLAY AUDIO: ${state.currentRecord.audioVersion}`, onpress:AldrovandiMind.photon_playIntroAudioForUser()});}
      
        //EXPLORATION SPACE
        //var userStartStopExploration_Btn = UI.button({id:Aldro_MindUI.exploratioBtnID,text:"START EXPLORATION", attr:{name:"state",value:"pause"},onpress:AldrovandiMind.StartStopExploration});
        var userStartStopExploration_Btn = AldrovandiMind.returnTimerBtn("exploration1");
      
        //SHOW OBJECTS
        var userShowObjectA_Btn = UI.button({id:"userShowObjectA_Btn",text:"Mostra OGGETTO A", onpress: function(){AldrovandiMind.photon_SetupToShowObject("A")}});
        var userShowObjectB_Btn = UI.button({id:"userShowObjectB_Btn",text:"Mostra OGGETTO B", onpress:function(){AldrovandiMind.photon_SetupToShowObject("B")}});
        var userShowObjectsBtnGroup = UI.buttonGroup({id:"userAudioBtnGroup", classList:"controllerSideBarGroup", buttons:[userShowObjectA_Btn,userShowObjectB_Btn]});
        
        //Set Correct Answer for Object
        var userGetCorrectAnswerForObject_Btn = UI.button({id:"userGetCorrectAnswerForObject_Btn",text:"Risposta corretta", onpress: function(){AldrovandiMind.setAnswerForObject(true)}});
        var userGetNOCorrectAnswerForObject_Btn = UI.button({id:"userGetNONCorrectAnswerForObject_Btn",text:"Risposta sbagliata", onpress:function(){AldrovandiMind.setAnswerForObject(false)}});
        var userAnswerForObjectsBtnGroup = UI.buttonGroup({id:"userAudioBtnGroup", classList:"controllerSideBarGroup", buttons:[userGetCorrectAnswerForObject_Btn,userGetNOCorrectAnswerForObject_Btn]});

        return [reportContainer,userHome_Btn,userPlayAudioBtn, userStartStopExploration_Btn, userShowObjectsBtnGroup, userAnswerForObjectsBtnGroup];

    }

    $("#"+Aldro_MindUI.createNewSessionBtnID).css("display", "none");
    $("#"+Aldro_MindUI.sideBarID).html(getBtns());
}


Aldro_MindUI.askForNewUserID=()=>
{
   return prompt("Stai creando un unovo record: Inserisci l'id del nuovo utente");
}
Aldro_MindUI.askForAudioVersion=()=>
{

   var result = prompt("Scegli tra Audio A e Audio B; scrivi 'A' o 'B' o 'NO'");
   if(result== "A" || result=="B" || result=="NO")
   {
    return result;
   }
   else
   {
    alert("NOT CORRECT");
   }
   AldrovandiMind.createNewSession();
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




//PHOTON:
AldrovandiMind.setupPhotonEvents=()=>
{
    ATON.Photon.on("0_user_pov",(p)=>{if(AldrovandiMind.role=="user") MIND.requestPOV(p);})


    ATON.Photon.on("0_user_introAudio",(audio)=>
    {
        if(AldrovandiMind.role!="user") return;

        APP._audio = document.getElementById(audio); 
       // APP._audio.currentTime = 1;
        if(APP._audio) APP._audio.play();
        
    })


    ATON.Photon.on("1_user_startExploration",()=>
    {
        console.log("STARTING SPACE EXPLORATION")
        if(AldrovandiMind.role!="user") return;
        if(APP.audio)  APP._audio.pause();
        APP.lowObjCollection.toggle();
        ATON.getRootSemantics().toggle();
    })

    ATON.Photon.on("1_user_stopExploration",()=>
    {
        console.log("END SPACE EXPLORATION")
        if(AldrovandiMind.role!="user") return;
        APP.lowObjCollection.toggle();
        ATON.getRootSemantics().toggle();
    })

    

    ATON.Photon.on("2_showObject",(obj)=>
    {
        console.log("Showing object")
        let p = config.homePOVUser;
        MIND.requestPOV(p);
        APP.lowObjCollection.visible=false;
        
        //A or B
        const _visible = obj=="A";
        SUI.A.visible= _visible;
        SUI.B.visible= !_visible;
    })
}


//CONTROLLER ACTIONS:

AldrovandiMind.createNewSession=()=>
{
    const newUserID = Aldro_MindUI.askForNewUserID();
    console.log("newuserID :" + newUserID);
    if(!newUserID) return;

    const _audioVersion = Aldro_MindUI.askForAudioVersion();
    if(!_audioVersion) return;

    const recordID = newUserID+"_"+MIND.returnNow();
    console.log("recordID :" + recordID);
    
    if(record.exist(recordID)) {console.log("exist arealdy"); alert(recordID + " esiste già"); return;}

    const r = {id:recordID, userNameSurname: newUserID, audioVersion:_audioVersion};
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

//0 START
AldrovandiMind.photon_SetUserToHomePov=()=>
{
    let p = config.homePOVUser;
    ATON.Photon.fireEvent("0_user_pov",p);
}


//0 Play audio
AldrovandiMind.photon_playIntroAudioForUser=()=>
{
   // state.currentRecord.audioVersion = audio;
    ATON.Photon.fireEvent("0_user_introAudio",state.currentRecord.audioVersion);
}


/*
//1 STARTSTOP EXPLORATION
AldrovandiMind.StartStopExploration=()=>
{
  
    console.log(state.currentRecord);
    var _now = MIND.returnNow();

    const _key = AldrovandiMind.currentExplorationValueToRecord();
    console.log(_key);
    if(!_key) return;

    //Manage Play/Pause conditions:
    if(_key=="1_AmbientExplorationEndTime")
    {
        var endTimeStampData = {key: _key, value:_now}
        record.update(state.currentRecordID,endTimeStampData);
        var _deltaData = (_now - state.currentRecord["1_AmbientExplorationStartTime"])/1000;
        record.update(state.currentRecordID, {key: "1_AmbientExplorationDelta", value:_deltaData}); 
    }
    if(_key=="2_AmbientExplorationEndTime")
    {
        var endTimeStampData = {key: _key, value:_now}
        record.update(state.currentRecordID,endTimeStampData);
        var _deltaData = (_now - state.currentRecord["2_AmbientExplorationStartTime"])/1000;
        record.update(state.currentRecordID, {key: "2_AmbientExplorationDelta", value:_deltaData}); 
    }
    else
    {
        const data = {key: _key, value:_now}
        console.log(data);
        record.update(state.currentRecordID,data);
    }
    //To change with better params
    Aldro_MindUI.togglePlayPauseBtn(Aldro_MindUI.exploratioBtnID);

    console.log(record.get(state.currentRecordID));
    Aldro_MindUI.updateReport();
}
*/


//2 SHOW OBJECT STAGE:
AldrovandiMind.photon_SetupToShowObject=(obj)=>
{
    state.showingObject = obj;
    ATON.Photon.fireEvent("2_showObject", obj);
}


//2 Set Answer for object:
AldrovandiMind.setAnswerForObject=(isCorrect)=>
{
    var _key;
    if(state.showingObject=="A"){_key="2_Object_A_AnswerIsCorrect"}
    if(state.showingObject=="B"){_key="3_Object_B_AnswerIsCorrect"}
    const data = { key:_key , value:isCorrect.toString() }
    record.update(state.currentRecordID,data);
    Aldro_MindUI.updateReport();

    if(isCorrect)
    {
        var idTimer = "";

        if(state.showingObject=="A") idTimer = "searchObjectA";
        if(state.showingObject=="B") idTimer = "searchObjectB";

        var timerBtn = AldrovandiMind.returnTimerBtn(idTimer);
        var btns = [timerBtn];

        var searchPanel = $("#"+ Aldro_MindUI.searchPanelID);
        if(searchPanel.length) searchPanel.html(btns)
        else
        {
            $("#"+ Aldro_MindUI.sideBarID).append(UI.buttonGroup({id:Aldro_MindUI.searchPanelID, buttons:btns}));
        }
    }
    else
    {
        if(state.showingObject=="A")
        {
            var expl2Btn = AldrovandiMind.returnTimerBtn("exploration2");
            $("#exploration1").replaceWith(expl2Btn);
            $("#"+ Aldro_MindUI.searchPanelID).remove();
        }
    }
}

/*
//3 Looking for object
AldrovandiMind.StartStopObjectsResearch=()=>
{
  
    console.log(state.currentRecord);
    var _now = MIND.returnNow();

    const _key = AldrovandiMind.currentExplorationValueToRecord(true);
    console.log(_key);
    if(!_key) return;

    //Manage Play/Pause conditions:
    if(_key=="2_Object_A_ResearchEndTime")
    {
        var endTimeStampData = {key: _key, value:_now}
        record.update(state.currentRecordID,endTimeStampData);
        var _deltaData = (_now - state.currentRecord["1_AmbientExplorationStartTime"])/1000;
        record.update(state.currentRecordID, {key: "1_AmbientExplorationDelta", value:_deltaData}); 
    }
    if(_key=="3_Object_B_ResearchEndTime")
    {
        var endTimeStampData = {key: _key, value:_now}
        record.update(state.currentRecordID,endTimeStampData);
        var _deltaData = (_now - state.currentRecord["2_AmbientExplorationStartTime"])/1000;
        record.update(state.currentRecordID, {key: "2_AmbientExplorationDelta", value:_deltaData}); 
    }
    else
    {
//        if(_key.includes("_A_") && state.showingObject!="a"){alert("error")}

        const data = {key: _key, value:_now}
        console.log(data);
        record.update(state.currentRecordID,data);
    }
    //To change with better params
    Aldro_MindUI.togglePlayPauseBtn(Aldro_MindUI.exploratioBtnID);

    console.log(record.get(state.currentRecordID));
    Aldro_MindUI.updateReport();
}
*/

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
        
    }
    else //timer END and DELTA
    {
        record.update(state.currentRecordID, {key: t.end,value:_now}); 
        data.key = t.delta; data.value = (_now - currentRecord[t.start]) /1000;
        btnTextValue = t["endText"];
        AldrovandiMind.onTimerEnded(idTimer);
        ATON.Photon.fireEvent("1_user_stopExploration");       
    }

    Aldro_MindUI.togglePlayPauseBtn(idTimer,btnTextValue);
    record.update(state.currentRecordID, data); 
    Aldro_MindUI.updateReport(); 

}

AldrovandiMind.onTimerEnded=(idTimer)=>
{
//    if(idTimer=="exploration1" || idTimer=="exploration2")

    if(idTimer=="searchObjectA" || idTimer=="searchObjectB")
    {
        
        //create finded/not founded btn grop
        //replace
        //Set Correct Answer for Object
        var userFoundObject_Btn = UI.button({id:"userGetCorrectAnswerForObject_Btn",text:"Oggetto trovato", onpress: function(){AldrovandiMind.onUserFoundObjectBtnClicked(true)}});
        var userNOTFoundObject_Btn = UI.button({id:"userGetNONCorrectAnswerForObject_Btn",text:"Oggetto NON trovato", onpress:function(){AldrovandiMind.onUserFoundObjectBtnClicked(false)}});
        var userFoundObjectBtnGroup = UI.buttonGroup({id:Aldro_MindUI.foundedObjectsGroupBtnID, classList:"controllerSideBarGroup", buttons:[userFoundObject_Btn,userNOTFoundObject_Btn]});

        $("#"+idTimer).replaceWith(userFoundObjectBtnGroup);
    }
}

AldrovandiMind.onUserFoundObjectBtnClicked=(objectFounded)=>
{
    //JUST PASTED: TO CHANGE:
    var _key;
    if(state.showingObject=="A"){_key="2_Object_A_Finded"}
    if(state.showingObject=="B"){_key="2_Object_B_Finded"}
    const data = { key:_key , value:objectFounded.toString() }
    record.update(state.currentRecordID,data);
    Aldro_MindUI.updateReport();

    
    var endSession_Btn = $("#endSession_Btn");
    if(!endSession_Btn.length)
    {
        endSession_Btn = UI.button({id:"endSession_Btn",text:"Termina Sessione", onpress: function(){AldrovandiMind.endSession()}});
        $("#"+Aldro_MindUI.sideBarID).append(endSession_Btn);
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

/*
//1.1 utilities
AldrovandiMind.currentExplorationValueToRecord=(lookingForObject=false)=>
{
    var valueToChange = null;
    var toCheck= 
    [
        "1_AmbientExplorationStartTime",
        "1_AmbientExplorationEndTime",
        "1_AmbientExplorationDelta",
        "2_AmbientExplorationStartTime",
        "2_AmbientExplorationEndTime",
        "2_AmbientExplorationDelta"
    ];
    if(lookingForObject)
    {
        toCheck=
        [
            "2_Object_A_ResearchStartTime",
            "2_Object_A_ResearchEndTime",
            "2_Object_A_ResearchDelta",
            "3_Object_B_ResearchStartTime",
            "3_Object_B_ResearchEndTime",
            "3_Object_B_ResearchDelta"
        ]
    }

    toCheck.some(v => {
        if(!state.currentRecord.hasOwnProperty(v))
        {
            valueToChange = v; return true;
        }
        return false;
    });

    return valueToChange;
}
*/



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


