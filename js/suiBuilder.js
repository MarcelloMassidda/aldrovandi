let suiBuilder = {
    interLine: 0.001,
    bestFit: "none", //"auto",
    fontSize: 0.3,
    height: 0.06
};

suiBuilder.set_interLine=(value)=>
{
    suiBuilder.interLine = value;
    ThreeMeshUI.update();
}
suiBuilder.set_bestFit=(value)=>
{
    suiBuilder.bestFit = value;
    ThreeMeshUI.update();
}
suiBuilder.set_fontSize=(value)=>
{
    suiBuilder.fontSize = value;
    ThreeMeshUI.update();
}   

suiBuilder.createLabel = ({ id, w, h, content, pos, rot, fSize, renderPrioritize, bestFit})=>
{

    var n = new ATON.Node(id, ATON.NTYPES.UI);
    //const  baseColor = ATON.MatHub.colors.black;
    const  baseColor = new THREE.Color(0.1,0.1,0.1)

     var container = new ThreeMeshUI.Block({
        width: (w)? w : 0.2,
        height: (h)? h: suiBuilder.height,
        padding: 0.001,
        borderRadius: 0.01,
        backgroundColor: baseColor,
        backgroundOpacity: 0.8,

        fontFamily: ATON.SUI.PATH_FONT_JSON,
        fontTexture: ATON.SUI.PATH_FONT_TEX,

        justifyContent: 'center', // could be 'center' or 'left'
        textAlign: 'center', //left,
        interLine: suiBuilder.interLine,
        bestFit: (bestFit !== undefined) ? bestFit : suiBuilder.bestFit,
    });
    
    container.position.z = 0.03;
    

    var uiText = new ThreeMeshUI.Text({ 
        content: content,
        fontSize: (fSize)? fSize : suiBuilder.fontSize, // 0.03,
        fontColor: ATON.MatHub.colors.white,
    });
    n.uiText = uiText;
    container.add(uiText);
    n.add(container);
    if (renderPrioritize) n.renderOrder = 999;

    ThreeMeshUI.update();

    if(renderPrioritize){
        // disabilitiamo depthTest/depthWrite per tutti i mesh figli
        n.traverse(obj => {
            if (obj.isMesh && obj.material) {
                obj.renderOrder = 999;
                obj.material.depthTest = false;
                obj.material.depthWrite = false;
            }
        });
    }


    n.position.x = pos.x;
    n.position.y = pos.y;
    n.position.z = pos.z;
    
    n.rotation.x = rot.x;
    n.rotation.y = rot.y;
    n.rotation.z = rot.z;
    return n;
}

/*
setText(text){
    this.uiText.set({ content: text });
    
    ThreeMeshUI.update();
    return this;
}
*/