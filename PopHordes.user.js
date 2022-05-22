// ==UserScript==
// @name            PopHordes
// @description     Aspire les infos IG quand une PopUp s'affiche
// @match           http*://www.hordes.fr/*
// @match           http*://www.die2nite.com/*
// @match           http*://www.zombinoia.com/*
// @match           http*://www.dieverdammten.de/*
// @icon            https://myhordes.eu/build/images/pictos/r_gsp.3b617d93.gif
// @version         3.4
// @updateURL       https://github.com/Croaaa/PopHordes/raw/master/PopHordes.user.js
// @downloadURL     https://github.com/Croaaa/PopHordes/raw/master/PopHordes.user.js
// @grant           unsafeWindow
// ==/UserScript==

var id=false,
    data=false,
    next=false,
    version= 3.4,
    dataStatus= "",
    town= {x:0,y:0},
    coord= {x:0,y:0},
    thelastURLFB= "",
    oldlastURLFB= "",
    hasInitialised= false;

var js= unsafeWindow.js,
    haxe= unsafeWindow.haxe,
    console= unsafeWindow.console,
    infos= unsafeWindow.__tid.infos,
    MapCommon= unsafeWindow.MapCommon,
    ExploCommon= unsafeWindow.ExploCommon,
    decodeURL= t=>decodeURIComponent(t.split("+").join(" "));


class decode{constructor(e,t){let n=decodeURIComponent(e.split("+").join(" ")),o=t?ExploCommon.genKey(n.length):MapCommon.genKey(n.length),l=t?ExploCommon.permute(n):MapCommon.permute(n);this.serial=this.binaryToMessage(o,l)}binaryToMessage(e,t){let n=[];for(let t=0,o=e.length;t<o;t++){let o=this.translate(e.charCodeAt(t));null!=o&&n.push(o)}n=n.length<1?[0]:n;let o="";for(let e=0,l=t.length;e<l;e++){let l=t.charCodeAt(e)^n[(e+t.length)%n.length];o+=String.fromCharCode(0!==l?l:t.charCodeAt(e))}return o}translate(e){return e>=65&&e<=90?e-65:e>=97&&e<=122?e-71:e>=48&&e<=57?e+4:null}}
class unserializeur{constructor(t){this.buffer=t,this.length=t.length,this.cache=[],this.scache=[],this.pos=0,this.unserialized=this.unserialize()}unserialize(){let a=this.buffer[this.pos++],b={i:"this.readDigits()",o:"this.readObject()",y:"this.readString()"};if(b.hasOwnProperty(a))return eval(b[a]);throw`Invalid char "${this.buffer[this.pos-1]}" (${this.buffer.charCodeAt(this.pos-1)}) at position ${this.pos-1}`}readDigits(){let t=0,i="-"===this.buffer[this.pos]&&(this.pos++,!0);for(;;){let i=this.buffer[this.pos];if(["0","1","2","3","4","5","6","7","8","9"].indexOf(i)<0)break;t=10*t+parseInt(i),this.pos++}return i?-1*t:t}readString(){let t=this.readDigits();if(":"!==this.buffer[this.pos++]||this.length-this.pos<t)throw"Invalid string length";{let i=decodeURL(this.buffer.slice(this.pos,this.pos+=t));return this.scache.push(i),i}}readObject(){let t={};for(;;){if(this.pos>=this.length)throw"Invalid object";if("g"===this.buffer[this.pos])break;{let i=this.unserialize();if(["number","string"].indexOf(typeof i)<0)throw"Invalid object key";{let s=this.unserialize();t[i]=s}}}return this.pos++,this.cache.push(t),t}}


const allStatus= ["status_hasEaten", "status_hasDrunk", "status_thirst", "status_dehyd", "status_drunk", "status_over", "status_clean", "status_drugged", "status_addict", "small_ghoul", "status_wound", "status_healed", "status_infect", "item_disinfect", "status_tired", "status_terror", "small_camp", "item_shield_mt", "item_shaman", "item_guide"];
// Rassasié, Désaltéré, Soif, Déshydraté, Ivre, Gueule de bois, Clean, Drogué, Dépendant, Goule, Blessé, Soigné, Infecté, Immunisé, Fatigué, Terrorisé, Campeur Avisé, Vaincre la mort, Chaman, Guide.

const banItems= ['item_reveil.gif', 'item_reveil_off.gif', 'item_photo_off.gif', 'item_photo_1.gif', 'item_photo_2.gif', 'item_photo_3.gif', 'item_basic_suit_dirt.gif', 'item_basic_suit.gif', 'small_empty_inv.gif','small_more2.gif'];
// Réveil Hurleur, Réveil Hurleur off, APAG off, APAG 1 charge, APAG 2 charges, APAG 3 charges, Habits sales, Habits normaux, Slot vide, +.

const heroJobs= ['item_tamed_pet.gif', 'item_tamed_pet_drug.gif', 'item_tamed_pet_off.gif', 'item_vest_on.gif', 'item_vest_off.gif', 'item_pelle.gif', 'item_keymol.gif', 'item_shield.gif', 'item_surv_book.gif'];
// Chien, Chien drogué, Chien off, Capuche on, Capuche off, Fouineur, Technicien, Gardien, Ermite.


function sel(a,b) { // No problem with this function, I just use it in the one that causes problems.
    let c= b||document, d= /^(?:#([\w-]+)|\.([\w-]+))$/.test(a), e= 0;
    if(d&&a[0]===".") {
        return c.getElementsByClassName(a.slice(1))[0];
    } else if(d&&a[0]==="#") {
        return document.getElementById(a.slice(1));
    } else {
        return c.querySelector(a);
    }
}

function addNewEl(type, parent, id, content, attrs) {
	if (['svg', 'path', 'rect', 'text'].indexOf(type) != -1)
		{ var el = document.createElementNS('http://www.w3.org/2000/svg', type); }
	else
		{ var el = document.createElement(type); }
	if (id) { el.id = id; }
	if (content) { el.innerHTML = content; }
	if (attrs) { for (i in attrs) { el.setAttribute(i, attrs[i]); } }
	if (parent) { parent.appendChild(el); }
	return el;
}

function makeId(length) {
   let result = "",
       characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return result;
}

function getStatus() {
    let has= [],
        status= [];
    document.querySelectorAll('#myStatus > li').forEach(a => {
        has.push(a.firstElementChild.src.split('/').reverse()[0].split('.')[0]);
    });
    for(let a=0;a<allStatus.length;a++) {
        status.push((has.indexOf(allStatus[a])<0)?"N":"Y");
    } return status;
}

function getJobs() {
    let jobs= 'item_basic_suit.gif';
    document.querySelectorAll('#myBag > li').forEach(a => {
        let b= a.firstElementChild.src.split('/').reverse()[0];
        if(heroJobs.indexOf(b)>0) {
            jobs= b;
        }
    });
    return jobs;
}

function getBagItems() {
    let has= [];
    document.querySelectorAll('#myBag > li').forEach(a => {
        let b= a.firstElementChild.src.split('/').reverse()[0];
        if(banItems.indexOf(b)<0 && heroJobs.indexOf(b)<0) {
            has.push(b);
        }
    });
    return has;
}

function getGroundItems() {
    let ground= [];
    document.querySelectorAll('.outInv > li > span > a').forEach(a => {
        let b= a.firstElementChild.src.split('/').reverse()[0].split('?')[0];
        ground.push(b);
    });
    document.querySelectorAll('.outInv > li > span > span').forEach(a => {
        let b= a.firstElementChild.src.split('/').reverse()[0].split('?')[0];
        ground.push(b);
    });
    return ground.join('|');
}

function getSoul() {
    let ames= [];
    if(data) {
        for(let a=0;a<data._details.length;a++) {
            if (data._details[a] != null || data._details[a] != undefined) {
                if(data._details[a]._s) {
                    let x= a%data._w,
                        y= (a-x)/data._h;
                    x= x-town.x;
                    y= town.y-y;
                    ames.push(`[${x}/${y}]`);
                }
            }
        }
    }
    let x= [];
    while(x.length<39) x.push('');
    return ames.concat(x).slice(0,39).join(',');
}

function getPopupContent() {
    if(thelastURLFB.search('removeFromBag')>0 || oldlastURLFB.search('removeFromBag')>0) {
        return "[DEPOT DESERT]";
    } else if(thelastURLFB.search('grabItem')>0 || oldlastURLFB.search('grabItem')>0) {
        return "[PRISE DESERT]";
    } else {
        let text= sel('#notificationText').textContent;
        text= text.replace(/[\s]/g, ' ');
        text= text.replace(/[ ]{2,}/g, ' ');
        return text.trim();
    }
}

function getBan() {
    let a= sel('.revoltStatus'),
        b= sel('[href^="#outside/searchGarbarge"]'),
        c= sel('[href^="#outside/hideTools"]');
    if(a||b||c) return "Y";
    return "N";
}

function getCityType() {
    if (sel('div#clock div.day span.hard')) return "PANDE";
    else if (data) {
        if (data._h > 24) return "RE";
        else if (data._h < 15) return "RNE";
    }
    else return "RE/RNE";
}

function getBless() {
    let a= sel('#myStatus img[src$="status_wound.gif"]');
    if(!a) return "N";
    return a.getAttribute('onmouseover').split("'")[1].split(':')[1].trim();
}

function getRuin() {
    if(sel('#FlashExplo')) {
        let r= sel('#FlashExplo').getAttribute('flashvars').slice(13);
        r= haxe.Unserializer.run(new decode(r, true).serial);
        return ["BUNKER", "MOTEL", "HOPITAL"][r._k];
    }
    else return "N";
}


function getSearchedBuilding() {
    if (sel('.outSpot')) {
        if (sel('.outSpot h2')) {
            let outSpot = sel('.outSpot h2').textContent.trim() ;
            let button = null;
            document.querySelectorAll('#generic_section .button').forEach(a => {
                if (
                       a.textContent.includes("Fouiller : ", outSpot) // FR
                    || a.textContent.includes("Explore: ", outSpot) // EN
                    || a.textContent.includes("erforschen ", outSpot) // DE
                    || a.textContent.includes("Hurgar: ", outSpot) // ES
                ) {
                    button = a;
                }
            })
            if (button?.className == "button off") return "Y"
            else return "N";
        }
        else return "D";
    }
    else return "X";
}

async function init(when) {

    let dateHour= new Date();
    dateHour= `${dateHour.toLocaleString("fr-FR")}.${dateHour.getMilliseconds()}`;

    let notif = document.getElementById("notification");
    if(
        (when=="AFTER" && next==true)
        ||
        ((notif.classList.contains("showNotif") && !notif.classList.contains("aspired"))
         ||
         ((thelastURLFB.search('removeFromBag')>0 || thelastURLFB.search('grabItem')>0 || oldlastURLFB.search('removeFromBag')>0 || oldlastURLFB.search('grabItem')>0)
          &&
          (Math.abs(coord.x)+Math.abs(coord.y)!=0)
         )
        )
    ) {

        if(notif.classList.contains("showNotif") && !notif.classList.contains("aspired")) {
            notif.classList += " aspired"
        }

        if ((thelastURLFB.search('removeFromBag')>0 || thelastURLFB.search('grabItem')>0) && (Math.abs(coord.x)+Math.abs(coord.y)!=0)) {
            dataStatus = "BEFORE"
        }
        else if ((oldlastURLFB.search('removeFromBag')>0 || oldlastURLFB.search('grabItem')>0) && (Math.abs(coord.x)+Math.abs(coord.y)!=0)) {
            dataStatus = "AFTER"
        }
        else {
            dataStatus = when;
            if(when=="BEFORE") { next = true }
            if(when=="AFTER") { next = false }
        }

        if (dataStatus=="BEFORE") { var idBefore = makeId(10)}
        if (dataStatus=="AFTER") { var idAfter = id}

        if (localStorage.getItem('anonymisedData') == "checked") {var anonymisation = "Y"};

        if (dataStatus=="BEFORE") {console.log("[POPHORDES] Aspiration Popup en cours ...")}
        let aspire= {

            hordesId: (anonymisation?"XXX":`${new unserializeur(infos).unserialized.realId}`),
            pseudo: (anonymisation?"XXX":sel('#tid_openRight .tid_name').textContent.trim()),
            heroJobs: getJobs(),
            cityName: (anonymisation?"XXX":sel('#clock > .name').textContent.trim()),
            cityType: getCityType(),
            cityDay: sel('#clock > .day').textContent.replace(/[^0-9]/g, ''),
            cityHour: sel('#serverTime').textContent.trim(),
            realDate: dateHour.slice(0,10),
            realHour: dateHour.slice(12,dateHour.length),
            ap: sel('.counter').textContent.trim(),
            coordX: `${coord.x}`,
            coordY: `${coord.y}`,
            humanPts: (sel('#humanPts')?sel('#humanPts').textContent.split(' ')[1]:"0"),
            zombiePts: (sel('#zombiePts')?sel('#zombiePts').textContent.split(' ')[1]:"0"),
            soulPosition: getSoul(),
            popupContent: getPopupContent(),
            onBuilding: (sel('.outSpot h2')?sel('.outSpot h2').textContent.trim():"N"),
            searchedBuilding: getSearchedBuilding(),
            driedZone: (sel('.driedZone')?"Y":"N"),
            inRuin: getRuin(),
            imBan: getBan(),
            blessType: getBless(),
            listStatus: getStatus(),
            listItem: getBagItems().concat(["","","","","","","","","","","",""]).slice(0,12),
            groundItem: getGroundItems(),
            keyStatus: (id?idAfter:idBefore),
            descStatus: dataStatus,
            scriptVersion: version,
            gameVersion: window.location.host
        };

        id = idBefore;
        oldlastURLFB = thelastURLFB;
        console.log(aspire);

        let reponse= (await fetch('https://pophordes.go.yj.fr/', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                data: aspire
            })
        }))?.text()
    }
}

function getParentNode(NodeName, target) {
    let CurrentNode = target;
    do {
        if(CurrentNode.nodeName === NodeName) {
            return CurrentNode;
        }
        CurrentNode = CurrentNode.parentNode;
    } while(CurrentNode);
    return false;
}

function anonymised(event) {
    var form = getParentNode("FORM", event.target);
    if(form) {
        var data = new FormData(form);
            data = Object.fromEntries(data.entries());
        var isChecked = data.anonymisedData ? "checked" : "";
        localStorage.setItem('anonymisedData', isChecked );
    } else {
        console.log("Unknown node");
    }
}


function popOptions() {

    var ghostpage = sel('#ghost_pages');
    if (ghostpage && sel('.options', ghostpage)) {

        if (localStorage.getItem('anonymisedData') == null) {
            localStorage.setItem('anonymisedData', 'checked')
        }

        var isChecked = localStorage.getItem('anonymisedData');

        sel('.misc').insertBefore(addNewEl('div', null, null, null, { class: 'row ph1' }), sel('.misc input+ .row'));
        sel('.ph1').insertBefore(addNewEl('label', null, null, "Anonymiser les données PopHordes"), sel('ph1'));

        var checkboxOptions = { type: 'checkbox', name: 'anonymisedData', id: 'anonymisedData', value: '1', tabindex: '1' };
        if (isChecked == "checked") {
            checkboxOptions.checked = "checked";
        }
        sel('.ph1').insertBefore(addNewEl('input', null, null, null, checkboxOptions), sel('ph1'));
        sel('.ph1').insertBefore(addNewEl('a', null, null, null, {href: '#', onclick: 'return false;', onmouseover: "js.HordeTip.showHelp(this,'<p>Cette option permet de supprimer les données personnelles récoltées par PopHordes</p><p><em> (ID, pseudo et ville).</em></p>')", onmouseout: 'js.HordeTip.hide()', class: 'helpLink ph2' }), sel('ph2'));
        sel('.ph2').insertBefore(addNewEl('img', null, null, null, { src: 'http://data.hordes.fr/gfx/loc/fr/helpLink.gif', alt: ''}), sel('ph2'));

        var popForm = sel('#anonymisedData');
        popForm.addEventListener('change', anonymised)
    }
};


function initMap() {

    if(!hasInitialised&&sel('#FlashMap')) {

        var d;
        var node = document.querySelector("#FlashMap");
        if (node.nodeName.toUpperCase() === "OBJECT") {
            d = document.querySelector('#FlashMap param[name="flashvars"]').getAttribute("value").substring(13)
        } else {
            d = node.getAttribute("flashvars").substring(13)
        }

        d= haxe.Unserializer.run(new decode(d, false).serial);
        data= d;
        let ville= {x:0,y:0};
        for(let i=0;i<d._details.length;i++) {
            if(d._details[i] == undefined || d._details[i] == null || d._details[i]._c!==1) continue;
            ville.x= i%d._w;
            ville.y= (i-ville.x)/d._h;
            break;
        }
        town= ville;
        coord.x= d._x-ville.x;
        coord.y= ville.y-d._y;
    }
    hasInitialised= true;
}

function urlToObj(a) {
    let x= {};
    a.split(';').forEach(a=> {
        let b= a.split('=');
        x[b[0]]= b[1];
    }); return x;
}

(function() {
    let notification= sel("#notification");
    let observer= new MutationObserver(function(a,b) {
        if(notification.classList.contains('showNotif')) { return false; }
        else { init("AFTER"); }
    });
    observer.observe(notification, { attributes: true });
    js.XmlHttp.pophordesOnEnd= js.XmlHttp.onEnd;
    js.XmlHttp.onEnd= function() {
        thelastURLFB= this.urlForBack;
        if(thelastURLFB&&thelastURLFB.startsWith('outside/go?')) {
            let i= urlToObj(thelastURLFB.split('?')[1]);
            coord.x+= parseInt(i.x);
            coord.y-= parseInt(i.y);
        }
        popOptions();
        initMap();
        init("BEFORE");
        js.XmlHttp.pophordesOnEnd();
    };
})();
