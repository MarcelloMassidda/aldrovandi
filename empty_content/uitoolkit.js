/*

To create jsdoc:
tutorial: https://www.youtube.com/watch?v=YK-GurROGIg&ab_channel=TraversyMedia
best practices: https://medium.com/swlh/creating-better-jsdoc-documentation-8b7a65744dcb


-npm install jsdoc
-add in package.json in scripts: "build-apidoc-uitoolkit":"jsdoc -c ./wapps/uitoolkit/jsdoc.json"

npm install clean-jsdoc-theme --save-dev

-npm run build-apidoc-uitoolkit
*/


/**
 * @module UI
 */
var UI =  {};


const icon_orientations = ["top","bottom","left","right"] //connected to style css classes for createItem > Button

/*
BUTTON

id, classname, container, click, tooltip
over/blur?
icon,
icon on/off
gif?
layout display: text bottom, text top, text left, text right

mediaqueries:
desktop
tablet
mobile

VR:

*/

/*
GROUP
toolbar
list
summary
*/


/*
NOTE:
Aggiungere inline / block options?
Aggiungere modifiche dinamiche alle proprietà... tipo play/pause text?

*/


/**
 * @typedef {Object} elOptions
 * @property {string} [id] - ID of the element
 * @property {string} [tag] - tag of the html element 
 * @property {array<string>} [classList] - List of class of the element
 * @property {string|array<string>} [attr] - attribute or list of attributes wrapped in jquery .attr(name, value) 
 * 
 */


/**
 * Create jquery element
 * @param {elOptions} [options] - options 
 * @returns {Object}
 */
const createEl=(options={})=>
{   //Internal function for create generic htmlEL
    //options: id, tag, html, classList, attr:{name:"name",value:"value"} or [attr,...], css:{"display":"inline"}
    const o = options;
    const _tag = o.tag ? o.tag : "div";
    var el = $(document.createElement(_tag));
    if(o.id) el.attr("id",o.id);
    if(o.html) el.html(o.html);
    if(o.classList) el.addClass(o.classList);
    if(o.attr){var _attributes = [].concat(o.attr); _attributes.map((a)=>el.attr(a.name, a.value))}
    if(o.css){el.css(o.css)}
    return el;
}




/**
* @typedef {Object} itemOptions
* @property {string} [id] - ID of the element
* @property {Object} [icon] - icon 
* @property {string} [iconPos] - Position of the icon near to the title
* @property {string} [text] - Title of the element
* @property {string} [tooltip] - Tooltip that appear on hover 
* @property {string|array<string>} [attr] - attribute or list of attributes wrapped in jquery .attr(name, value) 
*/

/**
 *An item is an element with an object (icon) oriented near to a title (text): the object is htmlEL, es. image or input. The title is also a htmlEl
 * @alias module:UI.createItem
 * @param {itemOptions} [options] - options
 * @returns {Object}
 */
UI.createItem = (options={})=>
{
    const o = options;
    //An item is an element with an object (icon) oriented near to a title (text): the object is htmlEL, es. image or input. The title is also a htmlEl
    /*
    options:
    id,
    classnames,
    icon = can be a generic jquery object
    iconPos: ["top","left","right","bottom"]
    text,
    tooltip
    */

    let el = createEl(o);
    if(o.icon) el.append(o.icon);
    if(o.iconPos) el.addClass(o.iconPos+"Oriented");
    if(o.text) el.append(o.text);
    if(o.tooltip) el.attr("title",o.tooltip);
    
    return el;
}

/**
 * Create a jquery image object
 * @param {string} icon - name of the image 
 * @param {string} size - size of the image
 * @returns {Object}
 */
UI.image = (icon, size=null)=>
{
    const _sizes=
    {
        "thumb":"100px",
        "small":"250px",
        "medium":"400px",
        "large":"600px"
    };

    if(size) {if(!_sizes[size]){throw(size + " is not a image size")}}
    let _size = size? _sizes[size] : "auto";

    //return simple img html Tag
   if (icon && !icon.includes(".")) icon = ATON.UI.PATH_RES_ICONS + icon+".png";
   return createEl({tag:"img",attr:[{name:"src",value:icon}]}).css("width",_sizes[size]);

}

UI.button = (o)=>{
    //A Button in an Item with an image icon (optional)
    /*options: createItem_options, onpress*/
    if(o.icon) o.icon = UI.image(o.icon);
   // if(o.text) o.text = $("<div>").text(o.text);
    let el = UI.createItem(o);
    el.addClass(["atonBTN", "blurredUI"]);  
    if (o.onpress) el.bind("click", o.onpress);

   return el;
};

UI.input=(o)=> //input + testo //NON FUNZIONA.... per radio ci vuole <label>\
{
    //options: createItem_options, type, value, onchange?, iconPos?, placeholder?
    const inputTypes = [
        "button",
        "checkbox",
        "color",
        "date",
        "datetime-local",
        "email",
        "file",
        "hidden",
        "image",
        "month",
        "number",
        "password",
        "radio",
        "range",
        "reset",
        "search",
        "submit",
        "tel",
        "text",
        "time",
        "url",
        "week"
      ];

    if(!inputTypes.includes(o.type)) throw(o.type + " is not a input type");

    //compose ids
    const idInput = o.id;
    const idContainerInput = idInput+"_container";

    //create input
    o.id=idInput;
    o.tag = "input";
    let _input = createEl(o);
    if(o.type) _input.attr("type",o.type);
    if(o.value) _input.attr("value",o.value);
    if(o.placeholder) _input.attr("value",o.placeholder);

    if(!o.text) return _input;

    //create btn = input + text
    o.icon = _input;
    o.iconPos = o.iconPos ? o.iconPos : "left"; //default left
    o.tag = "div";
    o.id= idContainerInput;
    let _inputBtn = UI.createItem(o);
    //if(o.onchange) _inputBtn.bind("change",o.onchange);
    return _inputBtn;
}





UI.DataEntry =
{
    create : (options)=>
    {
        /*
        o.type: "text", "radio",
        input(o)
        */
        const o = options;

        const _type = o.type;
        if(!_type) alert ("no type");
        if(!o.iconPos) o.iconPos="bottom";

        if(_type=="text")
        {
            return UI.input(o);
        }

        if(_type=="radio")
        {
            const radios = o.radios;

            var fieldset = $("<fieldset>").attr("id", o.id).addClass("PromptFieldset");
            if(o.text) $("<legend>").text(o.text).appendTo(fieldset);

            
            radios.forEach(r => {
                
                //Div
                var radioDiv = $("<div>");
                var _checked = r.checked ? true : false
                //Input
                $("<input>").attr({
                    type: "radio",
                    id: r.id,
                    name: o.id+"_radio",
                    value: r.value,
                    checked: _checked
                }).appendTo(radioDiv);
                
                //Label
                $("<label>").attr("for",r.id).text(r.text).appendTo(radioDiv);

                //FAIL: usare direttamente jquery era più semplice
                //const _radio = createEl({id:r.id, tag:"input", attr:[{name:"type",value:"radio"},{name:"value",value:r.value},{name:"name",value:o.id+"_radio"}]});
                
                fieldset.append(radioDiv);
            })

            return  fieldset;
        }
    },

    getValue:(o)=>
    {
        //o.type, o.id
        if(o.type=="text")
        {
            const idInput = o.id;
            return $("#"+idInput).val();
        }
        if(o.type=="radio")
        {
            const container = document.getElementById(o.id);
            const radioButtons = container.querySelectorAll('input');
            for (const radioButton of radioButtons) {
                if (radioButton.checked) {
                console.log("Checked value:", radioButton.value);
                return radioButton.value;
                }
            }
        }
    }
}


UI.Radios=(radios)=>
{
    let htmlRadios = [];
    radios.forEach(r => {
        htmlRadios.push(UI.input({type:"radio", text:r.text, id:r.id,value:r.value}))
    })
    return htmlRadios;
}


UI.responsiveTopMenu=(o)=> //https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_topnav
{   
    //options: CreateEl_options, btnList
    
    const onHamburgerMenuClicked=(e)=> {
        document.elem = e;
        var hmbtgIcon = e.target;
        
        //style.backgroundImage = "url('img_tree.png')";
        var topnav = document.getElementById(o.id);
        if (!$(topnav).hasClass("responsive"))
        {
            topnav.classList.add("responsive");
            hmbtgIcon.style.backgroundImage = 'url(./icons/close.png)';
        }
        else
        {
            topnav.classList.remove("responsive");
            hmbtgIcon.style.backgroundImage = 'url(./icons/hamburgerMenu.png)';
        }
    }
    
    var topnav = createEl(o).addClass(["topnav","blurredUI"]);
    if(o.btnList)
    {
        o.btnList.map((b)=>{ topnav.append(createEl({classList:"navItem"}).append(b)) })
    }
   
    var menuBtn = createEl({classList:"icon"}).append(createEl({id:"hamburgerMenu"}));
    menuBtn.bind("click",onHamburgerMenuClicked);
    
    topnav.append(menuBtn);
    return topnav;
}

UI.buttonGroup=(o)=>
{
    /*
    options: createEl_options, buttons
    to add:
    backgroundColor
    */

    let group = createEl(o).addClass(["atonBtnGroup", "blurredUI"]);

    if(!o.buttons) return group;
    o.buttons.map((btn)=>{btn.removeClass("blurredUI"); group.append(btn)});

    return group;
}

UI.summarize=(options)=>
{
        // options:
        // 
        // [{
        //  header (title)
        //  content (content)
        // }] 

        // to add:
        // id
        //  isOpen = false  
        //  containerClassName
        //  headerClassName
        //  panelClassName

    var summaryUnits = [];
    const  summary = (o)=>
    {
        let details = createEl({tag:"details",classList:"styled"})
        let summary = createEl({tag:"summary"}).append(o.header);
        let content = createEl({classList:"summaryContent"}).append(o.content);

        details.append(summary);
        details.append(content);

        return details;
    }

    const normalizeContent = (c)=>
    {
        //if typeof....then..
        return c;
    }

    const recurseContent = (c)=>
    {
        if(typeof(c)=="object" && Array.isArray(c))
        {
            let container = createEl();
            c.map((child)=>{container.append(recurseContent(child))});
            return container;
        }

        if(c.header && c.content)
        {
            var childEl_list = [];
            c.content = recurseContent(c.content);
            childEl_list.push (summary(c));
            return childEl_list;
        }

        var _content = normalizeContent(c);
        if(_content) return _content;
    }

    const returnSummaryContained = (summaris,idContainer)=>
    {
        let summaryContainer = createEl({id:idContainer,classList:["blurredUI","summaryContainer"]});
        summaris.map((s)=>{summaryContainer.append(s)});
        return summaryContainer;
    }

    options.forEach(o => {
            if(o.header && o.content)
            {
                o.content = recurseContent(o.content);
                summaryUnits.push(summary(o));
            }
    });
   
    return returnSummaryContained(summaryUnits, "myFinalSummary");
}



/*LAYOUT
-Containers:
Popup
Sidebars (Top, left, bottom, right)
Fullpage

-Wireframes
Grid, Columns, (Blocks)?FlexLayout

-Components:
icon+text (abstract button function)
card

*/
/**
 * @param {string} id - The id
 * @param {string} size - The size
 * @param {object} content - The content
 */

UI.popup=(o)=>
{
    //options: {id,size:[large,small],content}
 
    const sizeClass = {"large":"atonPopupLarge", "small":"atonPopupCompact"}
    var _size = o.size ? sizeClass[o.size] : "small" //default size popup;
    if(!_size) throw(o.size + " is not a Popup size");

    //create Fullpage container
    let popupFullPageContainer = createEl({id:"FullPageContainer", classList:"atonPopupContainer"});
    //create Popup
    let popupContainer = createEl({id:o.id, classList:["atonPopup","blurredUI",_size]});
    //Compose
    popupContainer.append(o.content);
    popupFullPageContainer.append(popupContainer);
    return popupFullPageContainer;
}

UI.removePopup=(id)=>{$("#"+id).parent().remove();}


UI.sideBar=(o)=>
{
    //options: {id, position:[left,right],content}
    const posClass = {"left":"atonSideBar-left", "right":"atonSideBar-right"}
    if(!posClass[o.position]) throw(o.position + " is not a sideBar position");
   
    let sidebar = createEl(o).addClass(["atonSideBar", posClass[o.position]]).append(o.content);
    return sidebar;
}

UI.toolBar = (o)=>
{   //options: {id,classList,content,position}
    const posClass = {"top":"atonToolbar-top", "bottom":"atonToolbar-bottom"}
    if(!posClass[o.position])throw(o.position + " is not a toolBar position");

    let toolbar = createEl(o).addClass(["atonToolbar", posClass[o.position]]);
    if(o.content) toolbar.append(o.content);
    return toolbar;    
}

UI.topBar = (options)=>
{   
    options.position="top";
    return UI.toolBar(options);
}
UI.bottomBar=(options)=>
{
    options.position="bottom";
    return UI.toolBar(options);
}

//Wireframes:
//container/fluid-container
UI.container=(o={})=>
{
 //options:{size:fluid,centered ; id; classList; content }
 let container = createEl(o).addClass("atonContainer");
 if(o.size=="fluid") container.addClass("fluid");
 if(o.content) container.append(o.content);
 return container;
}

UI.flexBox =(o={})=>
{
 let flexBox = createEl(o).addClass("flexBox");
 if(!o.content) return flexBox;
 
 var _contentList = [].concat(o.content)
 _contentList.map((c)=>flexBox.append(c));
 
 return flexBox;
}

/*
UI.folderPanel=(o)=>
{ 
    const onClickFolder=()=>
    {

    }
    var panel = UI.flexBox({id:o.id});
    //options: data, id
    APP[o.id+"_data"] = o.data;
    document.data =o.data;
    o.data.forEach(element => {
        panel.append(UI.button({text:element.header,icon:"icons/folder.jpg"}))
    });
   return  UI.toolBar({position:"bottom",id:"myPanelToolbar",content:panel});
}
*/

/*
TODO NEEDS AND PRIORITY:
ui fast utilities for front-end/3d/dev
ui for editor
ui/logic for editor and configurator (abstract), specific (es. authoring), configurable editor pattern? Swite? templates?

TODO LAYOUT:

-handle text elements
-block1 centered / left / right
-wrapping columns function create side-left, double-side, side-right utilities


TODO INSPECTOR:
num/float
string
vector3
colorpicker
vector4?
gizmos

TODO COMPONentS:
card? create with item?

TO KNOW JQUERY:
returned $(el):
bind, css, addClass, removeClass

returned el:
classList, style

COOL:
Filestructures:     https://codemyui.com/tag/file-structure/

Done:
-or flex or grid... need to implement stretch options? Flex-grow class is OK
-in colums: add flex grow for sides purpose https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Controlling_ratios_of_flex_items_along_the_main_axis Flex-grow class is OK
-fix classList ... []concatenated
*/

UI.grid=(o)=>
{
    //options: id, classList, gridCols:"", gridRows:"", gridAreas:"", content:[ {area:"", elem:""} ];
    /*options example:
    
    id: "mygrid",
    classList: ["myCustomGridContainer"],
    gridCols: "20% 1fr",  default:auto,
    gridRows: '300px 200px 1fr 20% 3vh' default:auto;
    gridAreas: ' "header header header" "sidebar main main" "footer footer footer" '
    content:[
        {area:'header',elem:btngroupDOmEl},
        {area:'sidebar',elem: sideBtngroupDOmEl},
        {area:'main',elem: mainGroupDOmEl}
        {area:'footer',elem: footerBtngroupDOmEl}
    ]

    */
    var _grid = createEl(o).addClass("gridContainer");
    
    if(o.gridCols) _grid.css("grid-template-columns", o.gridCols)
    if(o.gridRows) _grid.css("grid-template-rows", o.gridRows)
    if(o.gridAreas)_grid.css("grid-template-areas", o.gridAreas)

    if(!o.content) return _grid;
    
    var _content = [].concat(o.content);
    _content.map((c)=>
    {  
        c.elem.css("gridArea", c.area); c.elem.addClass("gridItem");      
        _grid.append(c.elem);
    });
    return _grid;
}

/*API Services*/

UI.getModels = async()=>{return await UI.getAjax(ATON.PATH_RESTAPI+"c/models")}

UI.getAjax=(_url)=>
{
     return  $.ajax({
            type: 'GET',
            url:  _url,
            xhrFields: { withCredentials: true },     
            dataType: 'json',
            success: (data)=>{
                return data
            },
            error: ()=>{
                console.log(error);
            }
        });
}

//https://aton.ispc.cnr.it/api/
//http://aton.ispc.cnr.it:8081/aldrovandi-collection/models/S2-35-DBC_Basilisco/Basilisco.glb
//http://aton.ispc.cnr.it:8081/samples/models/aton-panel-glass.gltf

/*FileSystem Utilities*/
UI.parseInFolders=(data,onclickEl)=>
{
    const convertArrayToObject=(array)=> {
        return array.reduce((acc, path) => {
          const pathArray = path.split('/');
          let currentObj = acc;
      
          for (let i = 0; i < pathArray.length; i++)
          {
            const folderName = pathArray[i];
      
            //Last object of the path: is not a folder
            if (i === pathArray.length - 1)
            {
                const fileName = pathArray[i]  //.split('.')[0];
                currentObj.push(UI.button({text:fileName,attr:{name:"data-path",value:path}, onpress: onclickEl}));
            }
            else
            {
                // Check if folder already exists in currentObj
                const existingFolder = currentObj.find(obj => obj.header === folderName);
        
                if (existingFolder) {
                currentObj = existingFolder.content;
                } else {
                const newFolder = {
                    header: folderName,
                    content: []
                };
                currentObj.push(newFolder);
                currentObj = newFolder.content;
                }
            }

        }
          return acc;
        }, []);
      }
      
      const paths = data;
      
      const result = convertArrayToObject(paths);
    return result;
}

/*Fast Viewer Example */
UI.testData = async ()=>
{
    const ShowModel= async (path)=>
    {
        ATON.getRootScene().removeChildren(); //reset models in scene
        ATON.useGizmo(false) //detach current gizmos

        var currentNode =  ATON.createSceneNode("sample").load(path,()=>
        {
            currentNode.attachToRoot().setPosition(0,0,0);
            ATON.Nav.requestPOVbyNode(currentNode, 0.5);
            ATON.useGizmo(true);
            ATON._gizmo.setMode("translate");           
            ATON.FE.attachGizmoToNode("sample");
        });
       
   }

    const onclickEl = (e)=>
    {
      const simplePath = e.target.parentNode.dataset.path;
      console.log(simplePath);
      ShowModel(simplePath);
    }

    var stringData = await UI.getModels();
    //filter only bastet: vedo anche i samples/ ma non so come raggiungerli... invece da shu/auth vedo almeno la collection dir di bastet 
   // var bastetData = [];
   // stringData.map((s)=>{if(s.includes("bastet")) bastetData.push(s)});
    var parsedData = UI.parseInFolders(stringData,onclickEl);
    document.data = parsedData;
    var summary = UI.summarize(parsedData);
    $("body").append(UI.sideBar({position:"left",content:summary}));
  //$("body").append(UI.folderPanel({data:parsedData, id:"folders"}));
  
}

/*Card*/
UI.card=(o)=>
{
    //options: (id, classList, attr), size:[big, medium, small], title, subtitle, content, image, imagePos, onclick, onhover
    
    const sizes=["big","medium","small"];
    var _size = o.size ? o.size : "medium" //default size.
    if(!sizes.includes(_size)) throw(_size + " is not a card size");

    let _card = createEl(o).addClass("atonCard").addClass(_size);
    
    //let _image = o.image ? createEl({classList:"cardImageContainer"}).css("background-image","url("+o.image+")") : null;

    let _image = o.image ? createEl({classList:"cardImageContainer"}).append(createEl({tag:"img",attr:{name:"src",value:o.image},classList:"cardImage"})) :null;

    let _cardInfoContainer = createEl({classList:"cardInfoContainer"});
    if(o.title) _cardInfoContainer.append($("<h2>").addClass("cardTitle").text(o.title)); 
    if(o.subtitle) _cardInfoContainer.append($("<label>").addClass("cardSubtitle").text(o.subtitle));
    if(o.content) _cardInfoContainer.append($("<p>").addClass("cardContent").text(o.content)); 
    
    if(!_image)
    {
        return _card.append(_cardInfoContainer);            
    } 

    var imagePos = o.imagePos ? o.imagePos : "top" //default image Position Top:
    if(_cardInfoContainer.children().length > 0) _card.append(_cardInfoContainer);
    _card = UI.createItem({id:o.id,text:_cardInfoContainer,icon:_image,iconPos:imagePos}).addClass(["atonCard",_size]);
    return _card;

}


/*UI TESTs */
UI.simpleTestCard=(pos="top")=>
{
    let c1 = UI.testCreateCard(pos);
    let c2 = UI.testCreateCard(pos);
    let c3 = UI.testCreateCard(pos);
    let c4 = UI.testCreateCard(pos);
    
    var flexBox = UI.flexBox({id:"myFlexBox",content:[c1,c2,c3,c4]});
  /*options example:
    
    id: "mygrid",
    classList: ["myCustomGridContainer"],
    gridCols: "20% 1fr",  default:auto,
    gridRows: '300px 200px 1fr 20% 3vh' default:auto;
    gridAreas: ' "header header header" "sidebar main main" "footer footer footer" '
    content:[
        {area:'header',elem:btngroupDOmEl},
        {area:'sidebar',elem: sideBtngroupDOmEl},
        {area:'main',elem: mainGroupDOmEl}
        {area:'footer',elem: footerBtngroupDOmEl}
    ]

    */

    $("body").append(UI.container({content:flexBox}));


//   $("#idTopToolbar").append(card);
}

UI.testCreateCard=(pos="top")=>
{
    const image = "https://lh3.googleusercontent.com/ci/AJFM8rzA8pGMKq55GWgkO8d6NrLnU6yJ5LqZiQqz59jrBLwuhG_P8oAMpRt2twKv81t4oFWud-wQ    "
    const content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    var card = UI.createItem({
        id:"myCard",
        icon: UI.image(image),
        text: $("<p>").text(content),
        iconPos:pos,
        classList:["debugUI","simpleCard"]
    });
    return card;
}

UI.testCard=(pos="left",_size="medium")=>
{
    const idCard = "myCard";
    var x = document.getElementById(idCard); if(x){x.remove()}

    const title = "my long hyper Title for this card"
    const subtitle = "mySubTitle"
    const image = "https://lh3.googleusercontent.com/ci/AJFM8rzA8pGMKq55GWgkO8d6NrLnU6yJ5LqZiQqz59jrBLwuhG_P8oAMpRt2twKv81t4oFWud-wQ    "
    const content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    var card = UI.card({id:idCard,title,subtitle,image,content,imagePos:pos,size:_size});
    document.card = card;
    $("#idTopToolbar").append(card);

}

UI.testInput=(_type="checkbox",_pos="left")=>
{
    //createItem_options, type, value
    const _onchange = (e)=>{console.log(e);}
    let _input = UI.input({type:_type,value:"myValue",text:"myinput", onchange:_onchange, iconPos:_pos});
    document._input = _input;
    $("#idTopToolbar").append(_input);
}

UI.testGrid=()=>
{
    var header = UI.testGroup();
    var side = UI.testSummary();
    var main = UI.testBtn();
    console.log(main)
  //  main.style.backgroundColor = "red";
    var footer = UI.testGroup();

    var gridOptions = 
    {
        id: "mygrid",
        classList: ["myCustomGridContainer"],
        gridAreas: ' "header header header" "sidebar main main" "footer footer footer"',
        gridRows:'15vh 60vh 15vh',
        gridCols: '30% 1fr',
        content:[
            {area:'header', elem:header},
            {area:'sidebar', elem: side},
            {area:'main', elem: main},
            {area:'footer', elem: footer}
        ]
    }
    var grid = UI.grid(gridOptions);
    $("body").append(UI.container({content:grid}));
    
}


UI.testFlexBox=()=>
{
   //Single Group Example
   const _content = UI.testGroup(); //.css("flex-grow","1");

   //List of items Example
   //const _contentA = createEl({id:"cA",classList:"debugUI"}).append("Content A");
   //const _contentB = createEl({id:"cB",classList:"debugUI"}).append("Content B");
   //const _contentC = createEl({id:"cC",classList:"debugUI"}).append("Content C");
   //const _content=[_contentA,_contentB,_contentC];

   var flexBox = UI.flexBox({id:"myFlexBox",content:_content});

    var _container = UI.container({content: flexBox})
    $("body").append(_container);
}

UI.testFlexBoxWithGrow=()=>
{
    var c1 = UI.testSummary(); c1.css("flex-grow", "1");
    var c2 = UI.testGroup();  c2.css("flex-grow", "1");
    var c3 = "Terza colonna solo di testo. Da testare con tag HTML";

    var flexGrowedContent = UI.flexBox({id:"myFlexGrowContent",content:[c1,c2,c3]});
    $("body").append( UI.container({content: flexGrowedContent}));
}

UI.testFlexBtns=()=>
{
    const _btns = UI.testCreateBtns();
    _btns.map((b)=>{b.css("flex-grow","1")});
    var flexGrowedContent = UI.flexBox({id:"myFlexGrowContent",content:_btns});
    $("body").append( UI.container({content: flexGrowedContent}));
}


UI.testTopBar=()=>
{
    $("body").append(UI.topBar({id:`myTOPBar`,content:"Yo best content"}))    
}
UI.testBottomBar=()=>
{
    $("body").append(UI.bottomBar({id:`myBOttomBar`,content:"Yo best content"}))    
}
UI.testToolbar=(pos)=>
{
    $("body").append(UI.toolBar({id:`my${pos}Bar`,content:"Yo best content",position:pos}))
}


UI.testSideBar=(pos)=>
{
    

    let mySideBar = UI.sideBar({
        id:"mySideBar",
        position:pos,
        content: `Halo my sidebar ${pos}!!`
    })

    $("body").append(mySideBar);
}



UI.testPopup=(_size)=>
{
//    const content = "<p>This is a simple <b>content</b></p>";
    const content = UI.button({id:"myTest",icon:"add",text:"my button 1",tooltip:"myTestTooltip"});
    const id = "MyPopup";
    const size = _size;
    const popup = UI.popup({id,size,content});
    console.log(popup)
    $("body").append(popup);
}

UI.testBtn=(_iconPos ="top")=>
{
    var btn = UI.button(
        {
            id:"myTest",
            icon:"add",
            iconPos:_iconPos,
            text:"my button",
            tooltip:"myTestTooltip"
        });
    console.log(btn);
   // $("#idBottomToolbar").append(btn);
    return btn;
}   

UI.testCreateBtns=()=>
{
    const onClick = (e)=>{console.log(e)};
    const btn1 = UI.button({id:"myTest",icon:"add",text:"my button 1",tooltip:"myTestTooltip", onpress:onClick});
    const btn2 = UI.button({id:"myTest",icon:"ar",tooltip:"myTestTooltip",onpress:onClick});
    const btn3 = UI.button({id:"myTest",icon:"note",tooltip:"myTestTooltip", onpress:onClick});
    const btn4 = UI.button({id:"myTest",icon:"rec",tooltip:"myTestTooltip", onpress:onClick});
    const btn5 = UI.button({id:"myTest",icon:"scene",text:"my button 5 longer",tooltip:"myTestTooltip", onpress:onClick});
    const btns = [btn1,btn2,btn3,btn4,btn5];
    return btns;
}


UI.testBtnWithOnlyImage=()=>
{
    var btn = UI.button({id:"myTest",icon:"add",tooltip:"myTestTooltip"});
    console.log(btn);
   // $("#idTopToolbar").append(btn);
   return btn;
}



UI.testGroup=(build=false)=>
{
    const btns = UI.testCreateBtns();
    let BtnGroup = UI.buttonGroup({id:"buttonGroup", buttons: btns});

    if(build) $("#idTopToolbar").append(BtnGroup);
    return BtnGroup;
}

UI.testSummary=()=>
{
    
    var _btn = UI.button({id:"myTest",icon:"add",iconPos:"left",text:"my button",tooltip:"myTestTooltip"});
    const simpleSummaryOptions = 
    [
        {
            header:"header1",
            content:UI.testBtnWithOnlyImage()
        },
         {
            header:"header1",
            content:UI.testBtnWithOnlyImage()
        },
         {
            header:"header1",
            content:_btn
        },
        {
            header:"header2",
            content:["ciao","ciao2","ciao3"]
        },
        {
            header:"header3",
            content:
            [
                {
                header:"header3a",
                content:"content3a"
                },
                {
                    header:"header3b",
                    content: {
                                header:"header3b_1",
                                content:{
                                        header:"header3b_2",
                                        content:{
                                                header:"header3b_3",
                                                content:{
                                                            header:"header3b_4",
                                                            content:"content3b_4"
                                                        }
                                            }
                                    }
                            }
                }]
        }
    ];
   // $("#idTopToolbar").append(UI.summarize(simpleSummaryOptions));
    return UI.summarize(simpleSummaryOptions);
}
   
UI.responsiveTopMenuTest = ()=>
{
    const btn1 = UI.button({id:"myTest",icon:"add",iconPos:"left", text:"my button 1",tooltip:"myTestTooltip"});
    const btn2 = UI.button({id:"myTest",icon:"ar",iconPos:"left", text:"my button 2 ",tooltip:"myTestTooltip"});
    const btn3 = UI.button({id:"myTest",icon:"note",iconPos:"left", text:"my button 3",tooltip:"myTestTooltip"});
    const btn4 = UI.button({id:"myTest",icon:"rec",iconPos:"left", text:"my button 4",tooltip:"myTestTooltip"});
    const btn5 = UI.button({id:"myTest",icon:"scene",iconPos:"left", text:"my button 5",tooltip:"myTestTooltip"});
    const btns = [btn1,btn2,btn3,btn4,btn5];
    var topnav = UI.responsiveTopMenu({id:"myTopNav", btnList:btns});
    document.topnav = topnav;
    $('body').append(topnav);
}


window.UI = UI;
export {UI};


