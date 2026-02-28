import{u as l,j as o}from"./index-BcMyEq5t.js";import{u as h}from"./useTrackPiece-Dth7GyI-.js";const m="_piece3Container_r2vew_8",p="_birdsContainer_r2vew_20",u="_bird_r2vew_20",b="_poemText_r2vew_78",i={piece3Container:m,birdsContainer:p,bird:u,poemText:b},_=()=>{h("lack_of_flight");const{trackLofFile:n}=l(),r=`lack of flight   

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
                and still I bleed`,s=["𓅪","𓅫","𓅓","✮","⋆","˚","｡","𓅨","°","✩","☁︎","☾","⁺","₊","✧"],a=(t=>t.split("").map(e=>/\s/.test(e)?e:s[Math.floor(Math.random()*s.length)]))(r),d=t=>{if(!t)return;n(t);const e=document.createElement("a");e.href=`/assets/piece3/${t}`,e.download=t,document.body.appendChild(e),e.click(),document.body.removeChild(e)},c=[{emoji:"𓅨",downloadFile:"LOF.JPG"},{emoji:"𓅩",downloadFile:"LOF.txt"},{emoji:"𓅓",downloadFile:null}];return o.jsxs("div",{className:i.piece3Container,children:[o.jsx("div",{className:i.birdsContainer,children:c.map((t,e)=>o.jsx("div",{className:i.bird,onClick:()=>d(t.downloadFile),children:t.emoji},e))}),o.jsx("pre",{className:i.poemText,children:a})]})};export{_ as default};
