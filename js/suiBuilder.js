let suiBuilder = {};

suiBuilder.customLabel = (uuid,w,h)=>
{
    var n = new ATON.Node(uuid, ATON.NTYPES.UI);
    //const  baseColor = ATON.MatHub.colors.black;
    const  baseColor = new THREE.Color(0.1,0.1,0.1)

     var container = new ThreeMeshUI.Block({
        width: (w)? w : 0.2,
        height: (h)? h: 0.05,
        padding: 0.001,
        borderRadius: 0.01,
        backgroundColor: baseColor,
        backgroundOpacity: 0.5,

        fontFamily: ATON.SUI.PATH_FONT_JSON,
        fontTexture: ATON.SUI.PATH_FONT_TEX,

        justifyContent: 'center', // could be 'center' or 'left'
        textAlign: 'left',
    });
    
    container.position.z = 0.03;
    

    var uiText = new ThreeMeshUI.Text({ 
        content: "Label",
        fontSize: 0.03,
        fontColor: ATON.MatHub.colors.white
    });
    n.uiText = uiText;
    container.add(uiText);
    n.add(container);


    ThreeMeshUI.update();

    return n;
}

/*
setText(text){
    this.uiText.set({ content: text });
    
    ThreeMeshUI.update();
    return this;
}
*/