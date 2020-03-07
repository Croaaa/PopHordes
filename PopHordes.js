// ==UserScript==
// @name            PopHordes
// @description     Aspire les infos IG quand une PopUp s'affiche
// @match           http*://www.hordes.fr/*
// @version         1.1
// @updateURL       https://github.com/Croaaa/PopHordes/blob/master/PopHordes.js
// @downloadURL     https://github.com/Croaaa/PopHordes/blob/master/PopHordes.js
// @grant           unsafeWindow
// ==/UserScript==

var data=false,
    town= {x:0,y:0},
    coord= {x:0,y:0},
    js= unsafeWindow.js,
    hasINITIALISED= false,
    haxe= unsafeWindow.haxe,
    console= unsafeWindow.console,
    infos= unsafeWindow.__tid.infos,
    MapCommon= unsafeWindow.MapCommon,
    localStorage= unsafeWindow.localStorage,
    decodeURL= t=>decodeURIComponent(t.split("+").join(" "));

class decode{constructor(e){let t=decodeURIComponent(e.split("+").join(" ")),l=MapCommon.genKey(t.length),n=MapCommon.permute(t);this.serial=this.binaryToMessage(l,n)}binaryToMessage(e,t){let l=[];for(let t=0,n=e.length;t<n;t++){let n=this.translate(e.charCodeAt(t));null!=n&&l.push(n)}l=l.length<1?[0]:l;let n="";for(let e=0,o=t.length;e<o;e++){let o=t.charCodeAt(e)^l[(e+t.length)%l.length];n+=String.fromCharCode(0!==o?o:t.charCodeAt(e))}return n}translate(e){return e>=65&&e<=90?e-65:e>=97&&e<=122?e-71:e>=48&&e<=57?e+4:null}}
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
    let text= sel('#notificationText').textContent;
        text= text.replace(/[\s]/g, ' ');
        text= text.replace(/[ ]{2,}/g, ' ');
    return text.trim();
}
const allStatus= [
    //Rassasié, Désaltéré, Soif, Déshydraté, Ivre
    "status_hasEaten", "status_hasDrunk", "status_thirst", "status_dehyd", "status_drunk",
    //Gueule de bois, Clean, Drogué, Dépendant, Goule
    "status_over", "status_clean", "status_drugged", "status_addict", "small_ghoul",
    //Blessé, Soigné, Infecté, Immunisé, Fatigué
    "status_wound", "status_healed", "status_infect", "item_disinfect", "status_tired",
    //Terrorisé, Campeur Avisé, Vaincre la mort
    "status_terror", "small_camp", "item_shield_mt"
];
function getStatus() {
    let has= [],
        str= [];
    document.querySelectorAll('#myStatus > li').forEach(a => {
        has.push(a.firstElementChild.src.split('/').reverse()[0].split('.')[0]);
    });
    for(let a=0;a<allStatus.length;a++) {
        str.push((has.indexOf(allStatus[a])<0)?"N":"Y");
    } return str;
}
const banItems= [
    //Réveil Hurleur, Réveil Hurleur off,APAG off, APAG 1 charge, APAG 2 charges
    'item_reveil.gif', 'item_reveil_off.gif', 'item_photo_off.gif', 'item_photo_1.gif', 'item_photo_2.gif',
    //APAG 3 charges, Habits sales, Habits normaux, Chien appri, Chien appri droguer
    'item_photo_3.gif', 'item_basic_suit_dirt.gif', 'item_basic_suit.gif', 'item_tamed_pet.gif', 'item_tamed_pet_drug.gif',
    //Chien appri mort, Eclaireure on, eclaireur off, fouine, tech
    'item_tamed_pet_off.gif', 'item_vest_on.gif', 'item_vest_off.gif', 'item_pelle.gif', 'item_keymol.gif',
    //gardien, mite, habitant, "+"
    'item_shield.gif', 'item_surv_book.gif', 'small_empty_inv.gif', 'small_more2.gif'
];
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
async function init() {
    let dateHour= new Date();
        dateHour= `${dateHour.toLocaleString("fr-FR")}.${dateHour.getMilliseconds()}`;
    let notif = document.getElementById("notification");
    if(notif.classList.contains("showNotif") && !notif.classList.contains("aspired")) {
        notif.classList += " aspired"
        console.log("[POPHORDES] Aspiration Popup en cours ...");
        let str= [
            //get l'identifiant hordes:
            `${new unserializeur(infos).unserialized.realId}`,
            //get le pseudo:
            sel('#tid_openRight .tid_name').textContent.trim(),
            //get ville name:
            sel('#clock > .name').textContent.trim(),
            //get date
            dateHour.slice(0,10),
            //get hour
            dateHour.slice(13,dateHour.length),
            //get day ig
            sel('#clock > .day').textContent.replace(/[^0-9]/g, ''),
            //get time ig
            sel('#serverTime').textContent.trim(),
            //get pa
            sel('.counter').textContent.trim(),
            //get position x - y
            `${coord.x}`,
            `${coord.y}`,
            //get position ames:
            getSoul(),
            //get popup content:
            getPopupContent()
        ];
        str= str.concat(imBan(), getStatus(), getItems(), ["","","","","","","","","","","",""]).slice(0,43);
        console.log(str);
        let localSTR= localStorage.getItem('popHordesCache'),
            dataArray= [];
        if(localSTR&&localSTR.length>0) {
            localSTR.split('\n').forEach(item=> {
                dataArray.push(JSON.parse(item));
            });
        }
        dataArray.push(str);
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
            d= haxe.Unserializer.run(new decode(d).serial);
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
    init();
    js.XmlHttp.pophordesOnEnd= js.XmlHttp.onEnd;
    js.XmlHttp.onEnd= function() {
        let url= this.urlForBack;
        if(url&&url.startsWith('outside/go?')) {
            let i= urlToObj(url.split('?')[1]);
            coord.x+= parseInt(i.x);
            coord.y-= parseInt(i.y);
        }
        initMap();
        init();
        js.XmlHttp.pophordesOnEnd();
    };
})();
