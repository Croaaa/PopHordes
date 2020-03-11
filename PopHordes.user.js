// ==UserScript==
// @name            PopHordes
// @description     Aspire les infos IG quand une PopUp s'affiche
// @match           http*://www.hordes.fr/*
// @icon            http://data.hordes.fr/gfx/icons/item_cards.gif
// @version         1.6.1
// @updateURL       https://github.com/Croaaa/PopHordes/raw/master/PopHordes.user.js
// @downloadURL     https://github.com/Croaaa/PopHordes/raw/master/PopHordes.user.js
// @grant           unsafeWindow
// ==/UserScript==

var data=false,
    town= {x:0,y:0},
    coord= {x:0,y:0},
    js= unsafeWindow.js,
    version= 1.6,
    hasINITIALISED= false,
    theLastURLForBack= false,
    haxe= unsafeWindow.haxe,
    console= unsafeWindow.console,
    infos= unsafeWindow.__tid.infos,
    MapCommon= unsafeWindow.MapCommon,
    ExploCommon= unsafeWindow.ExploCommon,
    localStorage= unsafeWindow.localStorage,
    decodeURL= t=>decodeURIComponent(t.split("+").join(" "));

class decode{constructor(e,t){let n=decodeURIComponent(e.split("+").join(" ")),o=t?ExploCommon.genKey(n.length):MapCommon.genKey(n.length),l=t?ExploCommon.permute(n):MapCommon.permute(n);this.serial=this.binaryToMessage(o,l)}binaryToMessage(e,t){let n=[];for(let t=0,o=e.length;t<o;t++){let o=this.translate(e.charCodeAt(t));null!=o&&n.push(o)}n=n.length<1?[0]:n;let o="";for(let e=0,l=t.length;e<l;e++){let l=t.charCodeAt(e)^n[(e+t.length)%n.length];o+=String.fromCharCode(0!==l?l:t.charCodeAt(e))}return o}translate(e){return e>=65&&e<=90?e-65:e>=97&&e<=122?e-71:e>=48&&e<=57?e+4:null}}
class unserializeur{constructor(t){this.buffer=t,this.length=t.length,this.cache=[],this.scache=[],this.pos=0,this.unserialized=this.unserialize()}unserialize(){let a=this.buffer[this.pos++],b={i:"this.readDigits()",o:"this.readObject()",y:"this.readString()"};if(b.hasOwnProperty(a))return eval(b[a]);throw`Invalid char "${this.buffer[this.pos-1]}" (${this.buffer.charCodeAt(this.pos-1)}) at position ${this.pos-1}`}readDigits(){let t=0,i="-"===this.buffer[this.pos]&&(this.pos++,!0);for(;;){let i=this.buffer[this.pos];if(["0","1","2","3","4","5","6","7","8","9"].indexOf(i)<0)break;t=10*t+parseInt(i),this.pos++}return i?-1*t:t}readString(){let t=this.readDigits();if(":"!==this.buffer[this.pos++]||this.length-this.pos<t)throw"Invalid string length";{let i=decodeURL(this.buffer.slice(this.pos,this.pos+=t));return this.scache.push(i),i}}readObject(){let t={};for(;;){if(this.pos>=this.length)throw"Invalid object";if("g"===this.buffer[this.pos])break;{let i=this.unserialize();if(["number","string"].indexOf(typeof i)<0)throw"Invalid object key";{let s=this.unserialize();t[i]=s}}}return this.pos++,this.cache.push(t),t}}

function sel(a,b) {
    let c= b||document, d= /^(?:#([\w-]+)|\.([\w-]+))$/.test(a), e= 0;
    if(d&&a[0]===".") {
        return c.getElementsByClassName(a.slice(1))[0];
    } else if(d&&a[0]==="#") {
        return document.getElementById(a.slice(1));
    } else {
        return c.querySelector(a);
    }
}
function getPopupContent() {
    if(theLastURLForBack.search('removeFromBag')>0) {
        return "[DEPOT DESERT]";
    } else if(theLastURLForBack.search('grabItem')>0) {
        return "[PRISE DESERT]";
    } else {
        let text= sel('#notificationText').textContent;
        text= text.replace(/[\s]/g, ' ');
        text= text.replace(/[ ]{2,}/g, ' ');
        return text.trim();
    }
}
const allStatus= ["status_hasEaten", "status_hasDrunk", "status_thirst", "status_dehyd", "status_drunk", "status_over", "status_clean", "status_drugged", "status_addict", "small_ghoul", "status_wound", "status_healed", "status_infect", "item_disinfect", "status_tired", "status_terror", "small_camp", "item_shield_mt"];
// Rassasié, Désaltéré, Soif, Déshydraté, Ivre, Gueule de bois, Clean, Drogué, Dépendant, Goule, Blessé, Soigné, Infecté, Immunisé, Fatigué, Terrorisé, Campeur Avisé, Vaincre la mort
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
const banItems= ['item_reveil.gif', 'item_reveil_off.gif', 'item_photo_off.gif', 'item_photo_1.gif', 'item_photo_2.gif', 'item_photo_3.gif', 'item_basic_suit_dirt.gif', 'item_basic_suit.gif', 'item_tamed_pet.gif', 'item_tamed_pet_drug.gif', 'item_tamed_pet_off.gif', 'item_vest_on.gif', 'item_vest_off.gif', 'item_pelle.gif', 'item_keymol.gif', 'item_shield.gif', 'item_surv_book.gif', 'small_empty_inv.gif', 'small_more2.gif'];
//Réveil Hurleur, Réveil Hurleur off, APAG off, APAG 1 charge, APAG 2 charges, APAG 3 charges, Habits sales, Habits normaux, Chien appri, Chien appri drogué
function getItems() {
    let has= [];
    document.querySelectorAll('#myBag > li').forEach(a => {
        let b= a.firstElementChild.src.split('/').reverse()[0];
        if(banItems.indexOf(b)<0) {
            has.push(b);
        }
    });
    return has;
}
function getSoul() {
    let ames= [];
    if(data) {
        for(let a=0;a<data._details.length;a++) {
            if(data._details[a]._s) {
                let x= a%data._w,
                    y= (a-x)/data._h;
                x= x-town.x;
                y= town.y-y;
                ames.push(`[${x}/${y}]`);
            }
        }
    }
    let x= [];
    while(x.length<39) x.push('');
    return ames.concat(x).slice(0,39).join(',');
}
function imBan() {
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
async function init() {
    let url= this.urlForBack,
        dateHour= new Date();
    dateHour= `${dateHour.toLocaleString("fr-FR")}.${dateHour.getMilliseconds()}`;
    let notif = document.getElementById("notification");
    if(
        (notif.classList.contains("showNotif") && !notif.classList.contains("aspired"))
        || (
            (theLastURLForBack.search('removeFromBag')>0 || theLastURLForBack.search('grabItem')>0)
            && (Math.abs(coord.x)+Math.abs(coord.y)!=0)
        )
    ) {
        notif.classList += " aspired"
        console.log("[POPHORDES] Aspiration Popup en cours ..");
        let aspire= {

            hordesId: `${new unserializeur(infos).unserialized.realId}`,
            pseudo: sel('#tid_openRight .tid_name').textContent.trim(),
            cityName: sel('#clock > .name').textContent.trim(),
            cityType: getCityType(),
            cityDay: sel('#clock > .day').textContent.replace(/[^0-9]/g, ''),
            cityHour: sel('#serverTime').textContent.trim(),
            realDate: dateHour.slice(0,10),
            realHour: dateHour.slice(13,dateHour.length),
            ap: sel('.counter').textContent.trim(),
            coordX: `${coord.x}`,
            coordY: `${coord.y}`,
            soulPosition: getSoul(),
            popupContent: getPopupContent(),
            onBuilding: (sel('.outSpot h2')?sel('.outSpot h2').textContent.trim():"N"),
            driedZone: (sel('.driedZone')?"Y":"N"),
            inRuin: (sel('#FlashExplo')?"Y":"N"),
            imBan: imBan(),
            blessType: getBless(),
            listStatus: getStatus(),
            listItem: getItems().concat(["","","","","","","","","","","",""]).slice(0,12),
            scriptVersion: version
        };

        console.log(aspire);
        let localSTR= localStorage.getItem('popHordesCache'),
            dataArray= [];
        if(localSTR&&localSTR.length>0) {
            localSTR.split('\n').forEach(item=> {
                dataArray.push(JSON.parse(item));
            });
        }
        dataArray.push(aspire);
        let toTXT= [];
        dataArray.forEach(a=> {
            toTXT.push(JSON.stringify(a));
        });
        localStorage.setItem('popHordesCache', toTXT.join('\n'));
        let reponse= await fetch('https://pophordes.yj.fr/', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                data: dataArray
            })
        }).then(a=>a.json());
        if(true) {
            localStorage.removeItem('popHordesCache');
         }
    }
}
function initMap() {
    if(!hasINITIALISED&&sel('#FlashMap')) {
        let d= sel('#FlashMap').getAttribute('flashvars').slice(13);
        d= haxe.Unserializer.run(new decode(d, false).serial);
        data= d;
        let ville= {x:0,y:0};
        for(let i=0;i<d._details.length;i++) {
            if(d._details[i]._c!==1) continue;
            ville.x= i%d._w;
            ville.y= (i-ville.x)/d._h;
            break;
        }
        town= ville;
        coord.x= d._x-ville.x;
        coord.y= ville.y-d._y;
    }
    hasINITIALISED= true;
}
function urlToObj(a) {
    let x= {};
    a.split(';').forEach(a=> {
        let b= a.split('=');
        x[b[0]]= b[1];
    }); return x;
}

(function() {
    //init();
    js.XmlHttp.pophordesOnEnd= js.XmlHttp.onEnd;
    js.XmlHttp.onEnd= function() {
        theLastURLForBack= this.urlForBack;
        if(theLastURLForBack&&theLastURLForBack.startsWith('outside/go?')) {
            let i= urlToObj(theLastURLForBack.split('?')[1]);
            coord.x+= parseInt(i.x);
            coord.y-= parseInt(i.y);
        }
        initMap();
        init();
        js.XmlHttp.pophordesOnEnd();
    };
})();
