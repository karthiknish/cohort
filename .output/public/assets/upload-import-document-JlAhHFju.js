import{t as e}from"./jsx-runtime-sLPvdpSW.js";import{t}from"./utils-H1bCjDNZ.js";import{t as n}from"./createLucideIcon-YcgpsFZ2.js";import{t as r}from"./upload-storage-file-vuVzlp5P.js";import{r as i}from"./agent-attachments-BOe_oZcn.js";var a=n(`columns-3`,[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,key:`afitv7`}],[`path`,{d:`M9 3v18`,key:`fh3hqa`}],[`path`,{d:`M15 3v18`,key:`14nvp0`}]]),o=n(`file-up`,[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,key:`1oefj6`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`M12 12v6`,key:`3ahymv`}],[`path`,{d:`m15 15-3-3-3 3`,key:`15xj92`}]]),s=n(`layout-grid`,[[`rect`,{width:`7`,height:`7`,x:`3`,y:`3`,rx:`1`,key:`1g98yp`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`3`,rx:`1`,key:`6d4xhi`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`14`,rx:`1`,key:`nxv5o0`}],[`rect`,{width:`7`,height:`7`,x:`3`,y:`14`,rx:`1`,key:`1bb6yr`}]]);function c(e,t){let n=new URLSearchParams({projectId:e});return t&&n.set(`projectName`,t),`/dashboard/projects?${n.toString()}`}function l(e){let t=new URLSearchParams({projectId:e.projectId});return e.projectName&&t.set(`projectName`,e.projectName),e.clientId&&t.set(`clientId`,e.clientId),e.clientName&&t.set(`clientName`,e.clientName),e.action&&t.set(`action`,e.action),`/dashboard/tasks?${t.toString()}`}var u=e(),d=50,f=30,p=100,m=.008,h=1,g=.015,_=4,v=.004,y=1.2,b=.008,x=1.5,S=.004,C=.05,w=.008,T=.1,E=.004,D=.5,O=.008,k=2,A=`0%`,j=`5%`,M=`15%`,N=`25%`,P=1.1,F=1.2,I=1.3,ee={bg:`var(--background)`,c1:`var(--chart-5)`,c2:`var(--chart-2)`,c3:`var(--chart-1)`};function L({size:e=`192px`,className:n,colors:r,animationDuration:i=20}){let a={...ee,...r},o=Number.parseInt(e.replace(`px`,``),10),s=o<d?Math.max(o*m,h):Math.max(o*g,_),c=o<d?Math.max(o*v,y):Math.max(o*b,x),l=o<d?Math.max(o*S,C):Math.max(o*w,T),L=o<d?Math.max(o*E,D):Math.max(o*O,k),R=(e=>e<f?A:e<d?j:e<p?M:N)(o),z=(e=>e<f?P:e<d?Math.max(c*F,I):c)(o),B={width:e,height:e,"--bg":a.bg,"--c1":a.c1,"--c2":a.c2,"--c3":a.c3,"--animation-duration":`${i}s`,"--blur-amount":`${s}px`,"--contrast-amount":z,"--dot-size":`${l}px`,"--shadow-spread":`${L}px`,"--mask-radius":R};return(0,u.jsx)(`div`,{className:t(`siri-orb`,n),style:B,children:(0,u.jsx)(`style`,{children:`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .siri-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
        }

        .siri-orb::before,
        .siri-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .siri-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--c3),
              transparent 20% 80%,
              var(--c3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--c2),
              transparent 30% 60%,
              var(--c2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--c1),
              transparent 40% 60%,
              var(--c1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--c2),
              transparent 10% 90%,
              var(--c2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--c1),
              transparent 10% 90%,
              var(--c1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--c3),
              transparent 20% 80%,
              var(--c3)
            );
          box-shadow: inset var(--bg) 0 0 var(--shadow-spread)
            calc(var(--shadow-spread) * 0.2);
          filter: blur(var(--blur-amount)) contrast(var(--contrast-amount));
          animation: rotate var(--animation-duration) linear infinite;
        }

        .siri-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--bg) var(--dot-size),
            transparent var(--dot-size)
          );
          background-size: calc(var(--dot-size) * 2) calc(var(--dot-size) * 2);
          backdrop-filter: blur(calc(var(--blur-amount) * 2))
            contrast(calc(var(--contrast-amount) * 2));
          mix-blend-mode: overlay;
        }

        .siri-orb[style*="--mask-radius: 0%"]::after {
          mask-image: none;
        }

        .siri-orb:not([style*="--mask-radius: 0%"])::after {
          mask-image: radial-gradient(
            black var(--mask-radius),
            transparent 75%
          );
        }

        @keyframes rotate {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .siri-orb::before {
            animation: none;
          }
        }
      `})})}var R=new Set([`pdf`,`doc`,`docx`]),z=new Set([`png`,`jpg`,`jpeg`,`webp`,`heic`,`heif`]),B=new Set([`application/pdf`,`application/msword`,`application/vnd.openxmlformats-officedocument.wordprocessingml.document`]),V=new Set([`image/png`,`image/jpeg`,`image/jpg`,`image/webp`,`image/heic`,`image/heif`]);function H(e){return e.split(`.`).pop()?.toLowerCase()??``}function U(e){if(e.type)return e.type;let t=H(e.name);return t===`pdf`?`application/pdf`:t===`doc`?`application/msword`:t===`docx`?`application/vnd.openxmlformats-officedocument.wordprocessingml.document`:t===`png`?`image/png`:t===`jpg`||t===`jpeg`?`image/jpeg`:t===`webp`?`image/webp`:t===`heic`?`image/heic`:t===`heif`?`image/heif`:`application/octet-stream`}function W(e){let t=H(e.name);return z.has(t)?!0:V.has(e.type)}function G(e){if(W(e))return!0;let t=H(e.name);return R.has(t)?!0:B.has(e.type)}function K(e){return Array.from(e).filter(G)}function q(e){return Array.from(e.dataTransfer?.types??[]).includes(`Files`)}function J(e){let t=H(e.name),n=U(e);return t===`pdf`||n===`application/pdf`}function Y(e,t){return W(e)?!0:!(!J(e)||t.extractionStatus===`ready`&&t.extractedText?.trim())}async function X(e,t){if(W(e)){let n=await t.uploadForVision(e);return{kind:`vision`,fileName:e.name,mimeType:U(e),storageId:n}}let n=await i(e,t);if(n.extractionStatus===`failed`){let t=e.name.toLowerCase().endsWith(`.doc`);throw Error(n.errorMessage??(t?`Legacy .doc files are not supported. Save as .docx and try again.`:`Could not read this document.`))}if(Y(e,n)){let n=await t.uploadForVision(e);return{kind:`vision`,fileName:e.name,mimeType:U(e),storageId:n}}let r=n.extractedText?.trim();if(!r)throw Error(`Could not read any text from this document.`);return{kind:`text`,fileName:e.name,text:r}}function Z(e){return e.map((e,t)=>`--- Document ${t+1}: ${e.fileName} ---\n${e.text}`).join(`

`)}function Q(e){return e.length===1?e[0]?.name??`document`:`${e.length} documents`}var $=15*1024*1024;async function te(e){let{file:t,generateUploadUrl:n,syncMetadata:i}=e;if(t.size>$)throw Error(`File is too large for import (max 15 MB).`);return r({file:t,contentType:t.type||`application/octet-stream`,generateUploadUrl:n,syncMetadata:i})}export{q as a,c,o as d,a as f,K as i,l,Q as n,X as o,Z as r,L as s,te as t,s as u};