import{j as o}from"./index-DUvZc350.js";const c="_piece3Container_r2vew_8",l="_birdsContainer_r2vew_20",h="_bird_r2vew_20",m="_poemText_r2vew_78",n={piece3Container:c,birdsContainer:l,bird:h,poemText:m},b=()=>{const s=`lack of flight   

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
                and still I bleed`,i=["𓅪","𓅫","𓅓","✮","⋆","˚","｡","𓅨","°","✩","☁︎","☾","⁺","₊","✧"],a=(t=>t.split("").map(e=>/\s/.test(e)?e:i[Math.floor(Math.random()*i.length)]))(s),r=t=>{const e=document.createElement("a");e.href=`/assets/piece3/${t}`,e.download=t,document.body.appendChild(e),e.click(),document.body.removeChild(e)},d=[{emoji:"𓅨",downloadFile:"LOF.JPG"},{emoji:"𓅩",downloadFile:"LOF.txt"},{emoji:"𓅓",downloadFile:null}];return o.jsxs("div",{className:n.piece3Container,children:[o.jsx("div",{className:n.birdsContainer,children:d.map((t,e)=>o.jsx("div",{className:n.bird,onClick:()=>t.downloadFile&&r(t.downloadFile),children:t.emoji},e))}),o.jsx("pre",{className:n.poemText,children:a})]})};export{b as default};
