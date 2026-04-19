import{u as l,j as o}from"./index-snAfThCm.js";import{u as h}from"./useTrackPiece-CO1MuPG9.js";const m="_piece3Container_lc937_8",p="_birdsContainer_lc937_21",_="_bird_lc937_21",w="_poemText_lc937_79",i={piece3Container:m,birdsContainer:p,bird:_,poemText:w},y=()=>{h("lack_of_flight");const{trackLofFile:n}=l(),r=`lack of flight   

I sit atop the stairs
white carpeted and stained
a place to wait for choices
a subtle space for pain

from here, 	
            I see the foyer
the front and bedroom doors
could go both ways, they say
(make-believe to play past four)

from here, 
              and looking down
I'd hit my head right at the base
I remember needing stitches
and the lies, 	your hidden face

from here, 
                I hear the stones
with two birds dead, I wonder why
they ring against 	      the door
and they echo   in my mind

ten years pass, and I'm still here
they say with everything I need
but I stay, can't move an inch
white carpet stains, 
                and still I bleed`,s=["𓅪","𓅫","𓅓","✮","⋆","˚","｡","𓅨","°","✩","☁︎","☾","⁺","₊","✧"],a=(e=>e.split("").map(t=>/\s/.test(t)?t:s[Math.floor(Math.random()*s.length)]))(r),d=e=>{if(!e)return;n(e);const t=`/assets/piece3/${e}`;e.toLowerCase().endsWith(".txt")&&window.__COLLEX_OPEN_TXT__&&window.__COLLEX_OPEN_TXT__(t)||window.open(t,"_blank")},c=[{emoji:"𓅨",downloadFile:"LOF.JPG"},{emoji:"𓅩",downloadFile:"LOF.txt"},{emoji:"𓅓",downloadFile:null}];return o.jsxs("div",{className:i.piece3Container,children:[o.jsx("div",{className:i.birdsContainer,children:c.map((e,t)=>o.jsx("div",{className:i.bird,onClick:()=>d(e.downloadFile),children:e.emoji},t))}),o.jsx("pre",{className:i.poemText,children:a})]})};export{y as default};
