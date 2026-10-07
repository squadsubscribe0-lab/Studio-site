(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ja="169",Jh=0,Cl=1,jh=2,Yc=1,Qh=2,Cn=3,qn=0,Ze=1,Ye=2,Wn=0,qi=1,Pl=2,Ll=3,Il=4,tu=5,ri=100,eu=101,nu=102,iu=103,su=104,ru=200,ou=201,au=202,lu=203,sa=204,ra=205,cu=206,hu=207,uu=208,du=209,fu=210,pu=211,mu=212,gu=213,_u=214,oa=0,aa=1,la=2,Ji=3,ca=4,ha=5,ua=6,da=7,Qr=0,vu=1,xu=2,Xn=0,Mu=1,yu=2,Su=3,bu=4,wu=5,Eu=6,Tu=7,Zc=300,ji=301,Qi=302,fa=303,pa=304,to=306,Br=1e3,hi=1001,ma=1002,on=1003,Au=1004,Ks=1005,dn=1006,uo=1007,ui=1008,Un=1009,Kc=1010,Jc=1011,Os=1012,Qa=1013,fi=1014,Ln=1015,Xs=1016,tl=1017,el=1018,ts=1020,jc=35902,Qc=1021,th=1022,pn=1023,eh=1024,nh=1025,$i=1026,es=1027,ih=1028,nl=1029,sh=1030,il=1031,sl=1033,Cr=33776,Pr=33777,Lr=33778,Ir=33779,ga=35840,_a=35841,va=35842,xa=35843,Ma=36196,ya=37492,Sa=37496,ba=37808,wa=37809,Ea=37810,Ta=37811,Aa=37812,Ra=37813,Ca=37814,Pa=37815,La=37816,Ia=37817,Ua=37818,Da=37819,Na=37820,Fa=37821,Ur=36492,ka=36494,Oa=36495,rh=36283,Ba=36284,za=36285,Ha=36286,Ru=3200,Cu=3201,rl=0,Pu=1,Gn="",tn="srgb",Yn="srgb-linear",ol="display-p3",eo="display-p3-linear",zr="linear",fe="srgb",Hr="rec709",Vr="p3",Si=7680,Ul=519,Lu=512,Iu=513,Uu=514,oh=515,Du=516,Nu=517,Fu=518,ku=519,Dl=35044,Nl="300 es",In=2e3,Gr=2001;class rs{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const Oe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Fl=1234567;const As=Math.PI/180,Bs=180/Math.PI;function gi(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Oe[i&255]+Oe[i>>8&255]+Oe[i>>16&255]+Oe[i>>24&255]+"-"+Oe[t&255]+Oe[t>>8&255]+"-"+Oe[t>>16&15|64]+Oe[t>>24&255]+"-"+Oe[e&63|128]+Oe[e>>8&255]+"-"+Oe[e>>16&255]+Oe[e>>24&255]+Oe[n&255]+Oe[n>>8&255]+Oe[n>>16&255]+Oe[n>>24&255]).toLowerCase()}function Ue(i,t,e){return Math.max(t,Math.min(e,i))}function al(i,t){return(i%t+t)%t}function Ou(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function Bu(i,t,e){return i!==t?(e-i)/(t-i):0}function Rs(i,t,e){return(1-e)*i+e*t}function zu(i,t,e,n){return Rs(i,t,1-Math.exp(-e*n))}function Hu(i,t=1){return t-Math.abs(al(i,t*2)-t)}function Vu(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Gu(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Wu(i,t){return i+Math.floor(Math.random()*(t-i+1))}function Xu(i,t){return i+Math.random()*(t-i)}function qu(i){return i*(.5-Math.random())}function $u(i){i!==void 0&&(Fl=i);let t=Fl+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Yu(i){return i*As}function Zu(i){return i*Bs}function Ku(i){return(i&i-1)===0&&i!==0}function Ju(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function ju(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Qu(i,t,e,n,s){const r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),h=o((t+n)/2),u=r((t-n)/2),d=o((t-n)/2),f=r((n-t)/2),g=o((n-t)/2);switch(s){case"XYX":i.set(a*h,l*u,l*d,a*c);break;case"YZY":i.set(l*d,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*d,a*h,a*c);break;case"XZX":i.set(a*h,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*h,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ki(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function He(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Ss={DEG2RAD:As,RAD2DEG:Bs,generateUUID:gi,clamp:Ue,euclideanModulo:al,mapLinear:Ou,inverseLerp:Bu,lerp:Rs,damp:zu,pingpong:Hu,smoothstep:Vu,smootherstep:Gu,randInt:Wu,randFloat:Xu,randFloatSpread:qu,seededRandom:$u,degToRad:Yu,radToDeg:Zu,isPowerOfTwo:Ku,ceilPowerOfTwo:Ju,floorPowerOfTwo:ju,setQuaternionFromProperEuler:Qu,normalize:He,denormalize:ki};class it{constructor(t=0,e=0){it.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ue(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class qt{constructor(t,e,n,s,r,o,a,l,c){qt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],v=s[0],p=s[3],m=s[6],S=s[1],M=s[4],x=s[7],L=s[2],E=s[5],A=s[8];return r[0]=o*v+a*S+l*L,r[3]=o*p+a*M+l*E,r[6]=o*m+a*x+l*A,r[1]=c*v+h*S+u*L,r[4]=c*p+h*M+u*E,r[7]=c*m+h*x+u*A,r[2]=d*v+f*S+g*L,r[5]=d*p+f*M+g*E,r[8]=d*m+f*x+g*A,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,g=e*u+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return t[0]=u*v,t[1]=(s*c-h*n)*v,t[2]=(a*n-s*o)*v,t[3]=d*v,t[4]=(h*e-s*l)*v,t[5]=(s*r-a*e)*v,t[6]=f*v,t[7]=(n*l-c*e)*v,t[8]=(o*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(fo.makeScale(t,e)),this}rotate(t){return this.premultiply(fo.makeRotation(-t)),this}translate(t,e){return this.premultiply(fo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const fo=new qt;function ah(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Wr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function td(){const i=Wr("canvas");return i.style.display="block",i}const kl={};function Dr(i){i in kl||(kl[i]=!0,console.warn(i))}function ed(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function nd(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function id(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Ol=new qt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Bl=new qt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ls={[Yn]:{transfer:zr,primaries:Hr,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[tn]:{transfer:fe,primaries:Hr,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[eo]:{transfer:zr,primaries:Vr,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(Bl),fromReference:i=>i.applyMatrix3(Ol)},[ol]:{transfer:fe,primaries:Vr,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(Bl),fromReference:i=>i.applyMatrix3(Ol).convertLinearToSRGB()}},sd=new Set([Yn,eo]),ae={enabled:!0,_workingColorSpace:Yn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!sd.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;const n=ls[t].toReference,s=ls[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return ls[i].primaries},getTransfer:function(i){return i===Gn?zr:ls[i].transfer},getLuminanceCoefficients:function(i,t=this._workingColorSpace){return i.fromArray(ls[t].luminanceCoefficients)}};function Yi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function po(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let bi;class rd{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{bi===void 0&&(bi=Wr("canvas")),bi.width=t.width,bi.height=t.height;const n=bi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=bi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Wr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Yi(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Yi(e[n]/255)*255):e[n]=Yi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let od=0;class lh{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:od++}),this.uuid=gi(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(mo(s[o].image)):r.push(mo(s[o]))}else r=mo(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function mo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?rd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let ad=0;class Ge extends rs{constructor(t=Ge.DEFAULT_IMAGE,e=Ge.DEFAULT_MAPPING,n=hi,s=hi,r=dn,o=ui,a=pn,l=Un,c=Ge.DEFAULT_ANISOTROPY,h=Gn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ad++}),this.uuid=gi(),this.name="",this.source=new lh(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new it(0,0),this.repeat=new it(1,1),this.center=new it(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new qt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Zc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Br:t.x=t.x-Math.floor(t.x);break;case hi:t.x=t.x<0?0:1;break;case ma:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Br:t.y=t.y-Math.floor(t.y);break;case hi:t.y=t.y<0?0:1;break;case ma:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ge.DEFAULT_IMAGE=null;Ge.DEFAULT_MAPPING=Zc;Ge.DEFAULT_ANISOTROPY=1;class Me{constructor(t=0,e=0,n=0,s=1){Me.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],v=l[2],p=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const M=(c+1)/2,x=(f+1)/2,L=(m+1)/2,E=(h+d)/4,A=(u+v)/4,P=(g+p)/4;return M>x&&M>L?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=E/n,r=A/n):x>L?x<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),n=E/s,r=P/s):L<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(L),n=A/r,s=P/r),this.set(n,s,r,e),this}let S=Math.sqrt((p-g)*(p-g)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(S)<.001&&(S=1),this.x=(p-g)/S,this.y=(u-v)/S,this.z=(d-h)/S,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ld extends rs{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Me(0,0,t,e),this.scissorTest=!1,this.viewport=new Me(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:dn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ge(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new lh(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class pi extends ld{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class ch extends Ge{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=on,this.minFilter=on,this.wrapR=hi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class cd extends Ge{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=on,this.minFilter=on,this.wrapR=hi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class qs{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const d=r[o+0],f=r[o+1],g=r[o+2],v=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(a===1){t[e+0]=d,t[e+1]=f,t[e+2]=g,t[e+3]=v;return}if(u!==v||l!==d||c!==f||h!==g){let p=1-a;const m=l*d+c*f+h*g+u*v,S=m>=0?1:-1,M=1-m*m;if(M>Number.EPSILON){const L=Math.sqrt(M),E=Math.atan2(L,m*S);p=Math.sin(p*E)/L,a=Math.sin(a*E)/L}const x=a*S;if(l=l*p+d*x,c=c*p+f*x,h=h*p+g*x,u=u*p+v*x,p===1-a){const L=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=L,c*=L,h*=L,u*=L}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*u+l*f-c*d,t[e+1]=l*g+h*d+c*u-a*f,t[e+2]=c*g+h*f+a*d-l*u,t[e+3]=h*g-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+a+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>u){const f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ue(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*s+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-e)*h)/c,d=Math.sin(e*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=s*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class C{constructor(t=0,e=0,n=0){C.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(zl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(zl.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),h=2*(a*e-r*s),u=2*(r*n-o*e);return this.x=e+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return go.copy(this).projectOnVector(t),this.sub(go)}reflect(t){return this.sub(go.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ue(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const go=new C,zl=new qs;class $s{constructor(t=new C(1/0,1/0,1/0),e=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(ln.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(ln.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=ln.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,ln):ln.fromBufferAttribute(r,o),ln.applyMatrix4(t.matrixWorld),this.expandByPoint(ln);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Js.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Js.copy(n.boundingBox)),Js.applyMatrix4(t.matrixWorld),this.union(Js)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ln),ln.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(cs),js.subVectors(this.max,cs),wi.subVectors(t.a,cs),Ei.subVectors(t.b,cs),Ti.subVectors(t.c,cs),Fn.subVectors(Ei,wi),kn.subVectors(Ti,Ei),Kn.subVectors(wi,Ti);let e=[0,-Fn.z,Fn.y,0,-kn.z,kn.y,0,-Kn.z,Kn.y,Fn.z,0,-Fn.x,kn.z,0,-kn.x,Kn.z,0,-Kn.x,-Fn.y,Fn.x,0,-kn.y,kn.x,0,-Kn.y,Kn.x,0];return!_o(e,wi,Ei,Ti,js)||(e=[1,0,0,0,1,0,0,0,1],!_o(e,wi,Ei,Ti,js))?!1:(Qs.crossVectors(Fn,kn),e=[Qs.x,Qs.y,Qs.z],_o(e,wi,Ei,Ti,js))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ln).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ln).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(wn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),wn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),wn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),wn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),wn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),wn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),wn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),wn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(wn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const wn=[new C,new C,new C,new C,new C,new C,new C,new C],ln=new C,Js=new $s,wi=new C,Ei=new C,Ti=new C,Fn=new C,kn=new C,Kn=new C,cs=new C,js=new C,Qs=new C,Jn=new C;function _o(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Jn.fromArray(i,r);const a=s.x*Math.abs(Jn.x)+s.y*Math.abs(Jn.y)+s.z*Math.abs(Jn.z),l=t.dot(Jn),c=e.dot(Jn),h=n.dot(Jn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const hd=new $s,hs=new C,vo=new C;class no{constructor(t=new C,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):hd.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;hs.subVectors(t,this.center);const e=hs.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(hs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(vo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(hs.copy(t.center).add(vo)),this.expandByPoint(hs.copy(t.center).sub(vo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const En=new C,xo=new C,tr=new C,On=new C,Mo=new C,er=new C,yo=new C;class hh{constructor(t=new C,e=new C(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,En)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=En.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(En.copy(this.origin).addScaledVector(this.direction,e),En.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){xo.copy(t).add(e).multiplyScalar(.5),tr.copy(e).sub(t).normalize(),On.copy(this.origin).sub(xo);const r=t.distanceTo(e)*.5,o=-this.direction.dot(tr),a=On.dot(this.direction),l=-On.dot(tr),c=On.lengthSq(),h=Math.abs(1-o*o);let u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const v=1/h;u*=v,d*=v,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(xo).addScaledVector(tr,d),f}intersectSphere(t,e){En.subVectors(t.center,this.origin);const n=En.dot(this.direction),s=En.dot(En)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,En)!==null}intersectTriangle(t,e,n,s,r){Mo.subVectors(e,t),er.subVectors(n,t),yo.crossVectors(Mo,er);let o=this.direction.dot(yo),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;On.subVectors(this.origin,t);const l=a*this.direction.dot(er.crossVectors(On,er));if(l<0)return null;const c=a*this.direction.dot(Mo.cross(On));if(c<0||l+c>o)return null;const h=-a*On.dot(yo);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class pe{constructor(t,e,n,s,r,o,a,l,c,h,u,d,f,g,v,p){pe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,h,u,d,f,g,v,p)}set(t,e,n,s,r,o,a,l,c,h,u,d,f,g,v,p){const m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=g,m[11]=v,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new pe().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/Ai.setFromMatrixColumn(t,0).length(),r=1/Ai.setFromMatrixColumn(t,1).length(),o=1/Ai.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const d=o*h,f=o*u,g=a*h,v=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+g*c,e[5]=d-v*c,e[9]=-a*l,e[2]=v-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){const d=l*h,f=l*u,g=c*h,v=c*u;e[0]=d+v*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=v+d*a,e[10]=o*l}else if(t.order==="ZXY"){const d=l*h,f=l*u,g=c*h,v=c*u;e[0]=d-v*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=v-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const d=o*h,f=o*u,g=a*h,v=a*u;e[0]=l*h,e[4]=g*c-f,e[8]=d*c+v,e[1]=l*u,e[5]=v*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const d=o*l,f=o*c,g=a*l,v=a*c;e[0]=l*h,e[4]=v-d*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+g,e[10]=d-v*u}else if(t.order==="XZY"){const d=o*l,f=o*c,g=a*l,v=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+v,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=v*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ud,t,dd)}lookAt(t,e,n){const s=this.elements;return je.subVectors(t,e),je.lengthSq()===0&&(je.z=1),je.normalize(),Bn.crossVectors(n,je),Bn.lengthSq()===0&&(Math.abs(n.z)===1?je.x+=1e-4:je.z+=1e-4,je.normalize(),Bn.crossVectors(n,je)),Bn.normalize(),nr.crossVectors(je,Bn),s[0]=Bn.x,s[4]=nr.x,s[8]=je.x,s[1]=Bn.y,s[5]=nr.y,s[9]=je.y,s[2]=Bn.z,s[6]=nr.z,s[10]=je.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],v=n[6],p=n[10],m=n[14],S=n[3],M=n[7],x=n[11],L=n[15],E=s[0],A=s[4],P=s[8],V=s[12],_=s[1],b=s[5],B=s[9],D=s[13],F=s[2],X=s[6],O=s[10],Q=s[14],G=s[3],ct=s[7],ft=s[11],pt=s[15];return r[0]=o*E+a*_+l*F+c*G,r[4]=o*A+a*b+l*X+c*ct,r[8]=o*P+a*B+l*O+c*ft,r[12]=o*V+a*D+l*Q+c*pt,r[1]=h*E+u*_+d*F+f*G,r[5]=h*A+u*b+d*X+f*ct,r[9]=h*P+u*B+d*O+f*ft,r[13]=h*V+u*D+d*Q+f*pt,r[2]=g*E+v*_+p*F+m*G,r[6]=g*A+v*b+p*X+m*ct,r[10]=g*P+v*B+p*O+m*ft,r[14]=g*V+v*D+p*Q+m*pt,r[3]=S*E+M*_+x*F+L*G,r[7]=S*A+M*b+x*X+L*ct,r[11]=S*P+M*B+x*O+L*ft,r[15]=S*V+M*D+x*Q+L*pt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],v=t[7],p=t[11],m=t[15];return g*(+r*l*u-s*c*u-r*a*d+n*c*d+s*a*f-n*l*f)+v*(+e*l*f-e*c*d+r*o*d-s*o*f+s*c*h-r*l*h)+p*(+e*c*u-e*a*f-r*o*u+n*o*f+r*a*h-n*c*h)+m*(-s*a*h-e*l*u+e*a*d+s*o*u-n*o*d+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],v=t[13],p=t[14],m=t[15],S=u*p*c-v*d*c+v*l*f-a*p*f-u*l*m+a*d*m,M=g*d*c-h*p*c-g*l*f+o*p*f+h*l*m-o*d*m,x=h*v*c-g*u*c+g*a*f-o*v*f-h*a*m+o*u*m,L=g*u*l-h*v*l-g*a*d+o*v*d+h*a*p-o*u*p,E=e*S+n*M+s*x+r*L;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/E;return t[0]=S*A,t[1]=(v*d*r-u*p*r-v*s*f+n*p*f+u*s*m-n*d*m)*A,t[2]=(a*p*r-v*l*r+v*s*c-n*p*c-a*s*m+n*l*m)*A,t[3]=(u*l*r-a*d*r-u*s*c+n*d*c+a*s*f-n*l*f)*A,t[4]=M*A,t[5]=(h*p*r-g*d*r+g*s*f-e*p*f-h*s*m+e*d*m)*A,t[6]=(g*l*r-o*p*r-g*s*c+e*p*c+o*s*m-e*l*m)*A,t[7]=(o*d*r-h*l*r+h*s*c-e*d*c-o*s*f+e*l*f)*A,t[8]=x*A,t[9]=(g*u*r-h*v*r-g*n*f+e*v*f+h*n*m-e*u*m)*A,t[10]=(o*v*r-g*a*r+g*n*c-e*v*c-o*n*m+e*a*m)*A,t[11]=(h*a*r-o*u*r-h*n*c+e*u*c+o*n*f-e*a*f)*A,t[12]=L*A,t[13]=(h*v*s-g*u*s+g*n*d-e*v*d-h*n*p+e*u*p)*A,t[14]=(g*a*s-o*v*s-g*n*l+e*v*l+o*n*p-e*a*p)*A,t[15]=(o*u*s-h*a*s+h*n*l-e*u*l-o*n*d+e*a*d)*A,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,g=r*u,v=o*h,p=o*u,m=a*u,S=l*c,M=l*h,x=l*u,L=n.x,E=n.y,A=n.z;return s[0]=(1-(v+m))*L,s[1]=(f+x)*L,s[2]=(g-M)*L,s[3]=0,s[4]=(f-x)*E,s[5]=(1-(d+m))*E,s[6]=(p+S)*E,s[7]=0,s[8]=(g+M)*A,s[9]=(p-S)*A,s[10]=(1-(d+v))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=Ai.set(s[0],s[1],s[2]).length();const o=Ai.set(s[4],s[5],s[6]).length(),a=Ai.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],cn.copy(this);const c=1/r,h=1/o,u=1/a;return cn.elements[0]*=c,cn.elements[1]*=c,cn.elements[2]*=c,cn.elements[4]*=h,cn.elements[5]*=h,cn.elements[6]*=h,cn.elements[8]*=u,cn.elements[9]*=u,cn.elements[10]*=u,e.setFromRotationMatrix(cn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=In){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),d=(n+s)/(n-s);let f,g;if(a===In)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===Gr)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=In){const l=this.elements,c=1/(e-t),h=1/(n-s),u=1/(o-r),d=(e+t)*c,f=(n+s)*h;let g,v;if(a===In)g=(o+r)*u,v=-2*u;else if(a===Gr)g=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Ai=new C,cn=new pe,ud=new C(0,0,0),dd=new C(1,1,1),Bn=new C,nr=new C,je=new C,Hl=new pe,Vl=new qs;class gn{constructor(t=0,e=0,n=0,s=gn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(Ue(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ue(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ue(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ue(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ue(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ue(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Hl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Hl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Vl.setFromEuler(this),this.setFromQuaternion(Vl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}gn.DEFAULT_ORDER="XYZ";class uh{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let fd=0;const Gl=new C,Ri=new qs,Tn=new pe,ir=new C,us=new C,pd=new C,md=new qs,Wl=new C(1,0,0),Xl=new C(0,1,0),ql=new C(0,0,1),$l={type:"added"},gd={type:"removed"},Ci={type:"childadded",child:null},So={type:"childremoved",child:null};class Ne extends rs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:fd++}),this.uuid=gi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ne.DEFAULT_UP.clone();const t=new C,e=new gn,n=new qs,s=new C(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new pe},normalMatrix:{value:new qt}}),this.matrix=new pe,this.matrixWorld=new pe,this.matrixAutoUpdate=Ne.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ne.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new uh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ri.setFromAxisAngle(t,e),this.quaternion.multiply(Ri),this}rotateOnWorldAxis(t,e){return Ri.setFromAxisAngle(t,e),this.quaternion.premultiply(Ri),this}rotateX(t){return this.rotateOnAxis(Wl,t)}rotateY(t){return this.rotateOnAxis(Xl,t)}rotateZ(t){return this.rotateOnAxis(ql,t)}translateOnAxis(t,e){return Gl.copy(t).applyQuaternion(this.quaternion),this.position.add(Gl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Wl,t)}translateY(t){return this.translateOnAxis(Xl,t)}translateZ(t){return this.translateOnAxis(ql,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Tn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ir.copy(t):ir.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),us.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Tn.lookAt(us,ir,this.up):Tn.lookAt(ir,us,this.up),this.quaternion.setFromRotationMatrix(Tn),s&&(Tn.extractRotation(s.matrixWorld),Ri.setFromRotationMatrix(Tn),this.quaternion.premultiply(Ri.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent($l),Ci.child=t,this.dispatchEvent(Ci),Ci.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(gd),So.child=t,this.dispatchEvent(So),So.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Tn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Tn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Tn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent($l),Ci.child=t,this.dispatchEvent(Ci),Ci.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(us,t,pd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(us,md,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}Ne.DEFAULT_UP=new C(0,1,0);Ne.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ne.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const hn=new C,An=new C,bo=new C,Rn=new C,Pi=new C,Li=new C,Yl=new C,wo=new C,Eo=new C,To=new C,Ao=new Me,Ro=new Me,Co=new Me;class fn{constructor(t=new C,e=new C,n=new C){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),hn.subVectors(t,e),s.cross(hn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){hn.subVectors(s,e),An.subVectors(n,e),bo.subVectors(t,e);const o=hn.dot(hn),a=hn.dot(An),l=hn.dot(bo),c=An.dot(An),h=An.dot(bo),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Rn)===null?!1:Rn.x>=0&&Rn.y>=0&&Rn.x+Rn.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,Rn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Rn.x),l.addScaledVector(o,Rn.y),l.addScaledVector(a,Rn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return Ao.setScalar(0),Ro.setScalar(0),Co.setScalar(0),Ao.fromBufferAttribute(t,e),Ro.fromBufferAttribute(t,n),Co.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(Ao,r.x),o.addScaledVector(Ro,r.y),o.addScaledVector(Co,r.z),o}static isFrontFacing(t,e,n,s){return hn.subVectors(n,e),An.subVectors(t,e),hn.cross(An).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return hn.subVectors(this.c,this.b),An.subVectors(this.a,this.b),hn.cross(An).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return fn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return fn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return fn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return fn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return fn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;Pi.subVectors(s,n),Li.subVectors(r,n),wo.subVectors(t,n);const l=Pi.dot(wo),c=Li.dot(wo);if(l<=0&&c<=0)return e.copy(n);Eo.subVectors(t,s);const h=Pi.dot(Eo),u=Li.dot(Eo);if(h>=0&&u<=h)return e.copy(s);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Pi,o);To.subVectors(t,r);const f=Pi.dot(To),g=Li.dot(To);if(g>=0&&f<=g)return e.copy(r);const v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(Li,a);const p=h*g-f*u;if(p<=0&&u-h>=0&&f-g>=0)return Yl.subVectors(r,s),a=(u-h)/(u-h+(f-g)),e.copy(s).addScaledVector(Yl,a);const m=1/(p+v+d);return o=v*m,a=d*m,e.copy(n).addScaledVector(Pi,o).addScaledVector(Li,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const dh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},zn={h:0,s:0,l:0},sr={h:0,s:0,l:0};function Po(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Gt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=tn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ae.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=ae.workingColorSpace){return this.r=t,this.g=e,this.b=n,ae.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=ae.workingColorSpace){if(t=al(t,1),e=Ue(e,0,1),n=Ue(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Po(o,r,t+1/3),this.g=Po(o,r,t),this.b=Po(o,r,t-1/3)}return ae.toWorkingColorSpace(this,s),this}setStyle(t,e=tn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=tn){const n=dh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Yi(t.r),this.g=Yi(t.g),this.b=Yi(t.b),this}copyLinearToSRGB(t){return this.r=po(t.r),this.g=po(t.g),this.b=po(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=tn){return ae.fromWorkingColorSpace(Be.copy(this),t),Math.round(Ue(Be.r*255,0,255))*65536+Math.round(Ue(Be.g*255,0,255))*256+Math.round(Ue(Be.b*255,0,255))}getHexString(t=tn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ae.workingColorSpace){ae.fromWorkingColorSpace(Be.copy(this),e);const n=Be.r,s=Be.g,r=Be.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ae.workingColorSpace){return ae.fromWorkingColorSpace(Be.copy(this),e),t.r=Be.r,t.g=Be.g,t.b=Be.b,t}getStyle(t=tn){ae.fromWorkingColorSpace(Be.copy(this),t);const e=Be.r,n=Be.g,s=Be.b;return t!==tn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(zn),this.setHSL(zn.h+t,zn.s+e,zn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(zn),t.getHSL(sr);const n=Rs(zn.h,sr.h,e),s=Rs(zn.s,sr.s,e),r=Rs(zn.l,sr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Be=new Gt;Gt.NAMES=dh;let _d=0;class _i extends rs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_d++}),this.uuid=gi(),this.name="",this.type="Material",this.blending=qi,this.side=qn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=sa,this.blendDst=ra,this.blendEquation=ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Gt(0,0,0),this.blendAlpha=0,this.depthFunc=Ji,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ul,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Si,this.stencilZFail=Si,this.stencilZPass=Si,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==qi&&(n.blending=this.blending),this.side!==qn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==sa&&(n.blendSrc=this.blendSrc),this.blendDst!==ra&&(n.blendDst=this.blendDst),this.blendEquation!==ri&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ji&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ul&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Si&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Si&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Si&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Re extends _i{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.combine=Qr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const we=new C,rr=new it;class mn{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Dl,this.updateRanges=[],this.gpuType=Ln,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)rr.fromBufferAttribute(this,e),rr.applyMatrix3(t),this.setXY(e,rr.x,rr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)we.fromBufferAttribute(this,e),we.applyMatrix3(t),this.setXYZ(e,we.x,we.y,we.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)we.fromBufferAttribute(this,e),we.applyMatrix4(t),this.setXYZ(e,we.x,we.y,we.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)we.fromBufferAttribute(this,e),we.applyNormalMatrix(t),this.setXYZ(e,we.x,we.y,we.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)we.fromBufferAttribute(this,e),we.transformDirection(t),this.setXYZ(e,we.x,we.y,we.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ki(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=He(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ki(e,this.array)),e}setX(t,e){return this.normalized&&(e=He(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ki(e,this.array)),e}setY(t,e){return this.normalized&&(e=He(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ki(e,this.array)),e}setZ(t,e){return this.normalized&&(e=He(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ki(e,this.array)),e}setW(t,e){return this.normalized&&(e=He(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=He(e,this.array),n=He(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=He(e,this.array),n=He(n,this.array),s=He(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=He(e,this.array),n=He(n,this.array),s=He(s,this.array),r=He(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Dl&&(t.usage=this.usage),t}}class fh extends mn{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class ph extends mn{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class se extends mn{constructor(t,e,n){super(new Float32Array(t),e,n)}}let vd=0;const rn=new pe,Lo=new Ne,Ii=new C,Qe=new $s,ds=new $s,Le=new C;class Fe extends rs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:vd++}),this.uuid=gi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(ah(t)?ph:fh)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new qt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return rn.makeRotationFromQuaternion(t),this.applyMatrix4(rn),this}rotateX(t){return rn.makeRotationX(t),this.applyMatrix4(rn),this}rotateY(t){return rn.makeRotationY(t),this.applyMatrix4(rn),this}rotateZ(t){return rn.makeRotationZ(t),this.applyMatrix4(rn),this}translate(t,e,n){return rn.makeTranslation(t,e,n),this.applyMatrix4(rn),this}scale(t,e,n){return rn.makeScale(t,e,n),this.applyMatrix4(rn),this}lookAt(t){return Lo.lookAt(t),Lo.updateMatrix(),this.applyMatrix4(Lo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ii).negate(),this.translate(Ii.x,Ii.y,Ii.z),this}setFromPoints(t){const e=[];for(let n=0,s=t.length;n<s;n++){const r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new se(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new $s);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];Qe.setFromBufferAttribute(r),this.morphTargetsRelative?(Le.addVectors(this.boundingBox.min,Qe.min),this.boundingBox.expandByPoint(Le),Le.addVectors(this.boundingBox.max,Qe.max),this.boundingBox.expandByPoint(Le)):(this.boundingBox.expandByPoint(Qe.min),this.boundingBox.expandByPoint(Qe.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new no);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(t){const n=this.boundingSphere.center;if(Qe.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];ds.setFromBufferAttribute(a),this.morphTargetsRelative?(Le.addVectors(Qe.min,ds.min),Qe.expandByPoint(Le),Le.addVectors(Qe.max,ds.max),Qe.expandByPoint(Le)):(Qe.expandByPoint(ds.min),Qe.expandByPoint(ds.max))}Qe.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Le.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Le));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Le.fromBufferAttribute(a,c),l&&(Ii.fromBufferAttribute(t,c),Le.add(Ii)),s=Math.max(s,n.distanceToSquared(Le))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new mn(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new C,l[P]=new C;const c=new C,h=new C,u=new C,d=new it,f=new it,g=new it,v=new C,p=new C;function m(P,V,_){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,V),u.fromBufferAttribute(n,_),d.fromBufferAttribute(r,P),f.fromBufferAttribute(r,V),g.fromBufferAttribute(r,_),h.sub(c),u.sub(c),f.sub(d),g.sub(d);const b=1/(f.x*g.y-g.x*f.y);isFinite(b)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(b),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(b),a[P].add(v),a[V].add(v),a[_].add(v),l[P].add(p),l[V].add(p),l[_].add(p))}let S=this.groups;S.length===0&&(S=[{start:0,count:t.count}]);for(let P=0,V=S.length;P<V;++P){const _=S[P],b=_.start,B=_.count;for(let D=b,F=b+B;D<F;D+=3)m(t.getX(D+0),t.getX(D+1),t.getX(D+2))}const M=new C,x=new C,L=new C,E=new C;function A(P){L.fromBufferAttribute(s,P),E.copy(L);const V=a[P];M.copy(V),M.sub(L.multiplyScalar(L.dot(V))).normalize(),x.crossVectors(E,V);const b=x.dot(l[P])<0?-1:1;o.setXYZW(P,M.x,M.y,M.z,b)}for(let P=0,V=S.length;P<V;++P){const _=S[P],b=_.start,B=_.count;for(let D=b,F=b+B;D<F;D+=3)A(t.getX(D+0)),A(t.getX(D+1)),A(t.getX(D+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new mn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new C,r=new C,o=new C,a=new C,l=new C,c=new C,h=new C,u=new C;if(t)for(let d=0,f=t.count;d<f;d+=3){const g=t.getX(d+0),v=t.getX(d+1),p=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),o.fromBufferAttribute(e,p),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Le.fromBufferAttribute(t,e),Le.normalize(),t.setXYZ(e,Le.x,Le.y,Le.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let f=0,g=0;for(let v=0,p=l.length;v<p;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*h;for(let m=0;m<h;m++)d[g++]=c[f++]}return new mn(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Fe,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Zl=new pe,jn=new hh,or=new no,Kl=new C,ar=new C,lr=new C,cr=new C,Io=new C,hr=new C,Jl=new C,ur=new C;class q extends Ne{constructor(t=new Fe,e=new Re){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){hr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(Io.fromBufferAttribute(u,t),o?hr.addScaledVector(Io,h):hr.addScaledVector(Io.sub(e),h))}e.add(hr)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),or.copy(n.boundingSphere),or.applyMatrix4(r),jn.copy(t.ray).recast(t.near),!(or.containsPoint(jn.origin)===!1&&(jn.intersectSphere(or,Kl)===null||jn.origin.distanceToSquared(Kl)>(t.far-t.near)**2))&&(Zl.copy(r).invert(),jn.copy(t.ray).applyMatrix4(Zl),!(n.boundingBox!==null&&jn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,jn)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=d.length;g<v;g++){const p=d[g],m=o[p.materialIndex],S=Math.max(p.start,f.start),M=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let x=S,L=M;x<L;x+=3){const E=a.getX(x),A=a.getX(x+1),P=a.getX(x+2);s=dr(this,m,t,n,c,h,u,E,A,P),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let p=g,m=v;p<m;p+=3){const S=a.getX(p),M=a.getX(p+1),x=a.getX(p+2);s=dr(this,o,t,n,c,h,u,S,M,x),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,v=d.length;g<v;g++){const p=d[g],m=o[p.materialIndex],S=Math.max(p.start,f.start),M=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let x=S,L=M;x<L;x+=3){const E=x,A=x+1,P=x+2;s=dr(this,m,t,n,c,h,u,E,A,P),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=g,m=v;p<m;p+=3){const S=p,M=p+1,x=p+2;s=dr(this,o,t,n,c,h,u,S,M,x),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}}function xd(i,t,e,n,s,r,o,a){let l;if(t.side===Ze?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===qn,a),l===null)return null;ur.copy(a),ur.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(ur);return c<e.near||c>e.far?null:{distance:c,point:ur.clone(),object:i}}function dr(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,ar),i.getVertexPosition(l,lr),i.getVertexPosition(c,cr);const h=xd(i,t,e,n,ar,lr,cr,Jl);if(h){const u=new C;fn.getBarycoord(Jl,ar,lr,cr,u),s&&(h.uv=fn.getInterpolatedAttribute(s,a,l,c,u,new it)),r&&(h.uv1=fn.getInterpolatedAttribute(r,a,l,c,u,new it)),o&&(h.normal=fn.getInterpolatedAttribute(o,a,l,c,u,new C),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new C,materialIndex:0};fn.getNormal(ar,lr,cr,d.normal),h.face=d,h.barycoord=u}return h}class he extends Fe{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(u,2));function g(v,p,m,S,M,x,L,E,A,P,V){const _=x/A,b=L/P,B=x/2,D=L/2,F=E/2,X=A+1,O=P+1;let Q=0,G=0;const ct=new C;for(let ft=0;ft<O;ft++){const pt=ft*b-D;for(let Wt=0;Wt<X;Wt++){const Jt=Wt*_-B;ct[v]=Jt*S,ct[p]=pt*M,ct[m]=F,c.push(ct.x,ct.y,ct.z),ct[v]=0,ct[p]=0,ct[m]=E>0?1:-1,h.push(ct.x,ct.y,ct.z),u.push(Wt/A),u.push(1-ft/P),Q+=1}}for(let ft=0;ft<P;ft++)for(let pt=0;pt<A;pt++){const Wt=d+pt+X*ft,Jt=d+pt+X*(ft+1),$=d+(pt+1)+X*(ft+1),et=d+(pt+1)+X*ft;l.push(Wt,Jt,et),l.push(Jt,$,et),G+=6}a.addGroup(f,G,V),f+=G,d+=Q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new he(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function ns(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ve(i){const t={};for(let e=0;e<i.length;e++){const n=ns(i[e]);for(const s in n)t[s]=n[s]}return t}function Md(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function mh(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ae.workingColorSpace}const yd={clone:ns,merge:Ve};var Sd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class $n extends _i{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Sd,this.fragmentShader=bd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ns(t.uniforms),this.uniformsGroups=Md(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class gh extends Ne{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new pe,this.projectionMatrix=new pe,this.projectionMatrixInverse=new pe,this.coordinateSystem=In}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Hn=new C,jl=new it,Ql=new it;class ze extends gh{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Bs*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(As*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Bs*2*Math.atan(Math.tan(As*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Hn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Hn.x,Hn.y).multiplyScalar(-t/Hn.z),Hn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Hn.x,Hn.y).multiplyScalar(-t/Hn.z)}getViewSize(t,e){return this.getViewBounds(t,jl,Ql),e.subVectors(Ql,jl)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(As*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ui=-90,Di=1;class wd extends Ne{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new ze(Ui,Di,t,e);s.layers=this.layers,this.add(s);const r=new ze(Ui,Di,t,e);r.layers=this.layers,this.add(r);const o=new ze(Ui,Di,t,e);o.layers=this.layers,this.add(o);const a=new ze(Ui,Di,t,e);a.layers=this.layers,this.add(a);const l=new ze(Ui,Di,t,e);l.layers=this.layers,this.add(l);const c=new ze(Ui,Di,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===In)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Gr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class _h extends Ge{constructor(t,e,n,s,r,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:ji,super(t,e,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Ed extends pi{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new _h(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:dn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new he(5,5,5),r=new $n({name:"CubemapFromEquirect",uniforms:ns(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ze,blending:Wn});r.uniforms.tEquirect.value=e;const o=new q(s,r),a=e.minFilter;return e.minFilter===ui&&(e.minFilter=dn),new wd(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}const Uo=new C,Td=new C,Ad=new qt;class ii{constructor(t=new C(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=Uo.subVectors(n,e).cross(Td.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(Uo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Ad.getNormalMatrix(t),s=this.coplanarPoint(Uo).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Qn=new no,fr=new C;class ll{constructor(t=new ii,e=new ii,n=new ii,s=new ii,r=new ii,o=new ii){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=In){const n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],u=s[6],d=s[7],f=s[8],g=s[9],v=s[10],p=s[11],m=s[12],S=s[13],M=s[14],x=s[15];if(n[0].setComponents(l-r,d-c,p-f,x-m).normalize(),n[1].setComponents(l+r,d+c,p+f,x+m).normalize(),n[2].setComponents(l+o,d+h,p+g,x+S).normalize(),n[3].setComponents(l-o,d-h,p-g,x-S).normalize(),n[4].setComponents(l-a,d-u,p-v,x-M).normalize(),e===In)n[5].setComponents(l+a,d+u,p+v,x+M).normalize();else if(e===Gr)n[5].setComponents(a,u,v,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Qn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Qn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Qn)}intersectsSprite(t){return Qn.center.set(0,0,0),Qn.radius=.7071067811865476,Qn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Qn)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(fr.x=s.normal.x>0?t.max.x:t.min.x,fr.y=s.normal.y>0?t.max.y:t.min.y,fr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(fr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function vh(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Rd(i){const t=new WeakMap;function e(a,l){const c=a.array,h=a.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){const g=u[d],v=u[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){const v=u[f];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class vi extends Fe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=t/a,d=e/l,f=[],g=[],v=[],p=[];for(let m=0;m<h;m++){const S=m*d-o;for(let M=0;M<c;M++){const x=M*u-r;g.push(x,-S,0),v.push(0,0,1),p.push(M/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let S=0;S<a;S++){const M=S+c*m,x=S+c*(m+1),L=S+1+c*(m+1),E=S+1+c*m;f.push(M,x,E),f.push(x,L,E)}this.setIndex(f),this.setAttribute("position",new se(g,3)),this.setAttribute("normal",new se(v,3)),this.setAttribute("uv",new se(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new vi(t.width,t.height,t.widthSegments,t.heightSegments)}}var Cd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Pd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ld=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Id=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ud=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Dd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Nd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Fd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,kd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Od=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Bd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,zd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Hd=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Vd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Gd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Wd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Xd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,qd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$d=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Yd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Zd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Kd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Jd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,jd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Qd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,tf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,ef=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,nf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,sf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,rf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,of="gl_FragColor = linearToOutputTexel( gl_FragColor );",af=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,lf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,cf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,hf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,uf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,df=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ff=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,pf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,mf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,gf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,_f=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,vf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,xf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Mf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,yf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Sf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,bf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,wf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ef=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Tf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Af=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Rf=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Cf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Pf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Lf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,If=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Uf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Df=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Nf=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ff=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,kf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Of=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Bf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Hf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Vf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Gf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Wf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,qf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$f=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Yf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Zf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Kf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Jf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,jf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Qf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,tp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ep=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,np=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ip=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,sp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,rp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,op=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ap=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,lp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,cp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,hp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,up=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,dp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,fp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,pp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,mp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,gp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,_p=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,vp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,xp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Mp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,yp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Sp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,bp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,wp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ep=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Tp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ap=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Rp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Cp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Pp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ip=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Up=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Dp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Np=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Fp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,kp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Op=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Bp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,zp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Vp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Gp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Wp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$p=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Yp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Kp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Jp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,tm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,em=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,im=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,sm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,rm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,om=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,am=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xt={alphahash_fragment:Cd,alphahash_pars_fragment:Pd,alphamap_fragment:Ld,alphamap_pars_fragment:Id,alphatest_fragment:Ud,alphatest_pars_fragment:Dd,aomap_fragment:Nd,aomap_pars_fragment:Fd,batching_pars_vertex:kd,batching_vertex:Od,begin_vertex:Bd,beginnormal_vertex:zd,bsdfs:Hd,iridescence_fragment:Vd,bumpmap_pars_fragment:Gd,clipping_planes_fragment:Wd,clipping_planes_pars_fragment:Xd,clipping_planes_pars_vertex:qd,clipping_planes_vertex:$d,color_fragment:Yd,color_pars_fragment:Zd,color_pars_vertex:Kd,color_vertex:Jd,common:jd,cube_uv_reflection_fragment:Qd,defaultnormal_vertex:tf,displacementmap_pars_vertex:ef,displacementmap_vertex:nf,emissivemap_fragment:sf,emissivemap_pars_fragment:rf,colorspace_fragment:of,colorspace_pars_fragment:af,envmap_fragment:lf,envmap_common_pars_fragment:cf,envmap_pars_fragment:hf,envmap_pars_vertex:uf,envmap_physical_pars_fragment:Sf,envmap_vertex:df,fog_vertex:ff,fog_pars_vertex:pf,fog_fragment:mf,fog_pars_fragment:gf,gradientmap_pars_fragment:_f,lightmap_pars_fragment:vf,lights_lambert_fragment:xf,lights_lambert_pars_fragment:Mf,lights_pars_begin:yf,lights_toon_fragment:bf,lights_toon_pars_fragment:wf,lights_phong_fragment:Ef,lights_phong_pars_fragment:Tf,lights_physical_fragment:Af,lights_physical_pars_fragment:Rf,lights_fragment_begin:Cf,lights_fragment_maps:Pf,lights_fragment_end:Lf,logdepthbuf_fragment:If,logdepthbuf_pars_fragment:Uf,logdepthbuf_pars_vertex:Df,logdepthbuf_vertex:Nf,map_fragment:Ff,map_pars_fragment:kf,map_particle_fragment:Of,map_particle_pars_fragment:Bf,metalnessmap_fragment:zf,metalnessmap_pars_fragment:Hf,morphinstance_vertex:Vf,morphcolor_vertex:Gf,morphnormal_vertex:Wf,morphtarget_pars_vertex:Xf,morphtarget_vertex:qf,normal_fragment_begin:$f,normal_fragment_maps:Yf,normal_pars_fragment:Zf,normal_pars_vertex:Kf,normal_vertex:Jf,normalmap_pars_fragment:jf,clearcoat_normal_fragment_begin:Qf,clearcoat_normal_fragment_maps:tp,clearcoat_pars_fragment:ep,iridescence_pars_fragment:np,opaque_fragment:ip,packing:sp,premultiplied_alpha_fragment:rp,project_vertex:op,dithering_fragment:ap,dithering_pars_fragment:lp,roughnessmap_fragment:cp,roughnessmap_pars_fragment:hp,shadowmap_pars_fragment:up,shadowmap_pars_vertex:dp,shadowmap_vertex:fp,shadowmask_pars_fragment:pp,skinbase_vertex:mp,skinning_pars_vertex:gp,skinning_vertex:_p,skinnormal_vertex:vp,specularmap_fragment:xp,specularmap_pars_fragment:Mp,tonemapping_fragment:yp,tonemapping_pars_fragment:Sp,transmission_fragment:bp,transmission_pars_fragment:wp,uv_pars_fragment:Ep,uv_pars_vertex:Tp,uv_vertex:Ap,worldpos_vertex:Rp,background_vert:Cp,background_frag:Pp,backgroundCube_vert:Lp,backgroundCube_frag:Ip,cube_vert:Up,cube_frag:Dp,depth_vert:Np,depth_frag:Fp,distanceRGBA_vert:kp,distanceRGBA_frag:Op,equirect_vert:Bp,equirect_frag:zp,linedashed_vert:Hp,linedashed_frag:Vp,meshbasic_vert:Gp,meshbasic_frag:Wp,meshlambert_vert:Xp,meshlambert_frag:qp,meshmatcap_vert:$p,meshmatcap_frag:Yp,meshnormal_vert:Zp,meshnormal_frag:Kp,meshphong_vert:Jp,meshphong_frag:jp,meshphysical_vert:Qp,meshphysical_frag:tm,meshtoon_vert:em,meshtoon_frag:nm,points_vert:im,points_frag:sm,shadow_vert:rm,shadow_frag:om,sprite_vert:am,sprite_frag:lm},ut={common:{diffuse:{value:new Gt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new qt},alphaMap:{value:null},alphaMapTransform:{value:new qt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new qt}},envmap:{envMap:{value:null},envMapRotation:{value:new qt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new qt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new qt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new qt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new qt},normalScale:{value:new it(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new qt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new qt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new qt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new qt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Gt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Gt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new qt},alphaTest:{value:0},uvTransform:{value:new qt}},sprite:{diffuse:{value:new Gt(16777215)},opacity:{value:1},center:{value:new it(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new qt},alphaMap:{value:null},alphaMapTransform:{value:new qt},alphaTest:{value:0}}},xn={basic:{uniforms:Ve([ut.common,ut.specularmap,ut.envmap,ut.aomap,ut.lightmap,ut.fog]),vertexShader:Xt.meshbasic_vert,fragmentShader:Xt.meshbasic_frag},lambert:{uniforms:Ve([ut.common,ut.specularmap,ut.envmap,ut.aomap,ut.lightmap,ut.emissivemap,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.fog,ut.lights,{emissive:{value:new Gt(0)}}]),vertexShader:Xt.meshlambert_vert,fragmentShader:Xt.meshlambert_frag},phong:{uniforms:Ve([ut.common,ut.specularmap,ut.envmap,ut.aomap,ut.lightmap,ut.emissivemap,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.fog,ut.lights,{emissive:{value:new Gt(0)},specular:{value:new Gt(1118481)},shininess:{value:30}}]),vertexShader:Xt.meshphong_vert,fragmentShader:Xt.meshphong_frag},standard:{uniforms:Ve([ut.common,ut.envmap,ut.aomap,ut.lightmap,ut.emissivemap,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.roughnessmap,ut.metalnessmap,ut.fog,ut.lights,{emissive:{value:new Gt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xt.meshphysical_vert,fragmentShader:Xt.meshphysical_frag},toon:{uniforms:Ve([ut.common,ut.aomap,ut.lightmap,ut.emissivemap,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.gradientmap,ut.fog,ut.lights,{emissive:{value:new Gt(0)}}]),vertexShader:Xt.meshtoon_vert,fragmentShader:Xt.meshtoon_frag},matcap:{uniforms:Ve([ut.common,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.fog,{matcap:{value:null}}]),vertexShader:Xt.meshmatcap_vert,fragmentShader:Xt.meshmatcap_frag},points:{uniforms:Ve([ut.points,ut.fog]),vertexShader:Xt.points_vert,fragmentShader:Xt.points_frag},dashed:{uniforms:Ve([ut.common,ut.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xt.linedashed_vert,fragmentShader:Xt.linedashed_frag},depth:{uniforms:Ve([ut.common,ut.displacementmap]),vertexShader:Xt.depth_vert,fragmentShader:Xt.depth_frag},normal:{uniforms:Ve([ut.common,ut.bumpmap,ut.normalmap,ut.displacementmap,{opacity:{value:1}}]),vertexShader:Xt.meshnormal_vert,fragmentShader:Xt.meshnormal_frag},sprite:{uniforms:Ve([ut.sprite,ut.fog]),vertexShader:Xt.sprite_vert,fragmentShader:Xt.sprite_frag},background:{uniforms:{uvTransform:{value:new qt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xt.background_vert,fragmentShader:Xt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new qt}},vertexShader:Xt.backgroundCube_vert,fragmentShader:Xt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xt.cube_vert,fragmentShader:Xt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xt.equirect_vert,fragmentShader:Xt.equirect_frag},distanceRGBA:{uniforms:Ve([ut.common,ut.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xt.distanceRGBA_vert,fragmentShader:Xt.distanceRGBA_frag},shadow:{uniforms:Ve([ut.lights,ut.fog,{color:{value:new Gt(0)},opacity:{value:1}}]),vertexShader:Xt.shadow_vert,fragmentShader:Xt.shadow_frag}};xn.physical={uniforms:Ve([xn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new qt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new qt},clearcoatNormalScale:{value:new it(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new qt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new qt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new qt},sheen:{value:0},sheenColor:{value:new Gt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new qt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new qt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new qt},transmissionSamplerSize:{value:new it},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new qt},attenuationDistance:{value:0},attenuationColor:{value:new Gt(0)},specularColor:{value:new Gt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new qt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new qt},anisotropyVector:{value:new it},anisotropyMap:{value:null},anisotropyMapTransform:{value:new qt}}]),vertexShader:Xt.meshphysical_vert,fragmentShader:Xt.meshphysical_frag};const pr={r:0,b:0,g:0},ti=new gn,cm=new pe;function hm(i,t,e,n,s,r,o){const a=new Gt(0);let l=r===!0?0:1,c,h,u=null,d=0,f=null;function g(S){let M=S.isScene===!0?S.background:null;return M&&M.isTexture&&(M=(S.backgroundBlurriness>0?e:t).get(M)),M}function v(S){let M=!1;const x=g(S);x===null?m(a,l):x&&x.isColor&&(m(x,1),M=!0);const L=i.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,o):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(S,M){const x=g(M);x&&(x.isCubeTexture||x.mapping===to)?(h===void 0&&(h=new q(new he(1,1,1),new $n({name:"BackgroundCubeMaterial",uniforms:ns(xn.backgroundCube.uniforms),vertexShader:xn.backgroundCube.vertexShader,fragmentShader:xn.backgroundCube.fragmentShader,side:Ze,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(L,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),ti.copy(M.backgroundRotation),ti.x*=-1,ti.y*=-1,ti.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(ti.y*=-1,ti.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(cm.makeRotationFromEuler(ti)),h.material.toneMapped=ae.getTransfer(x.colorSpace)!==fe,(u!==x||d!==x.version||f!==i.toneMapping)&&(h.material.needsUpdate=!0,u=x,d=x.version,f=i.toneMapping),h.layers.enableAll(),S.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new q(new vi(2,2),new $n({name:"BackgroundMaterial",uniforms:ns(xn.background.uniforms),vertexShader:xn.background.vertexShader,fragmentShader:xn.background.fragmentShader,side:qn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=ae.getTransfer(x.colorSpace)!==fe,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||d!==x.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,u=x,d=x.version,f=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function m(S,M){S.getRGB(pr,mh(i)),n.buffers.color.setClear(pr.r,pr.g,pr.b,M,o)}return{getClearColor:function(){return a},setClearColor:function(S,M=1){a.set(S),l=M,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,m(a,l)},render:v,addToRenderList:p}}function um(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,o=!1;function a(_,b,B,D,F){let X=!1;const O=u(D,B,b);r!==O&&(r=O,c(r.object)),X=f(_,D,B,F),X&&g(_,D,B,F),F!==null&&t.update(F,i.ELEMENT_ARRAY_BUFFER),(X||o)&&(o=!1,x(_,b,B,D),F!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(F).buffer))}function l(){return i.createVertexArray()}function c(_){return i.bindVertexArray(_)}function h(_){return i.deleteVertexArray(_)}function u(_,b,B){const D=B.wireframe===!0;let F=n[_.id];F===void 0&&(F={},n[_.id]=F);let X=F[b.id];X===void 0&&(X={},F[b.id]=X);let O=X[D];return O===void 0&&(O=d(l()),X[D]=O),O}function d(_){const b=[],B=[],D=[];for(let F=0;F<e;F++)b[F]=0,B[F]=0,D[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:b,enabledAttributes:B,attributeDivisors:D,object:_,attributes:{},index:null}}function f(_,b,B,D){const F=r.attributes,X=b.attributes;let O=0;const Q=B.getAttributes();for(const G in Q)if(Q[G].location>=0){const ft=F[G];let pt=X[G];if(pt===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(pt=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(pt=_.instanceColor)),ft===void 0||ft.attribute!==pt||pt&&ft.data!==pt.data)return!0;O++}return r.attributesNum!==O||r.index!==D}function g(_,b,B,D){const F={},X=b.attributes;let O=0;const Q=B.getAttributes();for(const G in Q)if(Q[G].location>=0){let ft=X[G];ft===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(ft=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(ft=_.instanceColor));const pt={};pt.attribute=ft,ft&&ft.data&&(pt.data=ft.data),F[G]=pt,O++}r.attributes=F,r.attributesNum=O,r.index=D}function v(){const _=r.newAttributes;for(let b=0,B=_.length;b<B;b++)_[b]=0}function p(_){m(_,0)}function m(_,b){const B=r.newAttributes,D=r.enabledAttributes,F=r.attributeDivisors;B[_]=1,D[_]===0&&(i.enableVertexAttribArray(_),D[_]=1),F[_]!==b&&(i.vertexAttribDivisor(_,b),F[_]=b)}function S(){const _=r.newAttributes,b=r.enabledAttributes;for(let B=0,D=b.length;B<D;B++)b[B]!==_[B]&&(i.disableVertexAttribArray(B),b[B]=0)}function M(_,b,B,D,F,X,O){O===!0?i.vertexAttribIPointer(_,b,B,F,X):i.vertexAttribPointer(_,b,B,D,F,X)}function x(_,b,B,D){v();const F=D.attributes,X=B.getAttributes(),O=b.defaultAttributeValues;for(const Q in X){const G=X[Q];if(G.location>=0){let ct=F[Q];if(ct===void 0&&(Q==="instanceMatrix"&&_.instanceMatrix&&(ct=_.instanceMatrix),Q==="instanceColor"&&_.instanceColor&&(ct=_.instanceColor)),ct!==void 0){const ft=ct.normalized,pt=ct.itemSize,Wt=t.get(ct);if(Wt===void 0)continue;const Jt=Wt.buffer,$=Wt.type,et=Wt.bytesPerElement,St=$===i.INT||$===i.UNSIGNED_INT||ct.gpuType===Qa;if(ct.isInterleavedBufferAttribute){const dt=ct.data,Ut=dt.stride,It=ct.offset;if(dt.isInstancedInterleavedBuffer){for(let Bt=0;Bt<G.locationSize;Bt++)m(G.location+Bt,dt.meshPerAttribute);_.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=dt.meshPerAttribute*dt.count)}else for(let Bt=0;Bt<G.locationSize;Bt++)p(G.location+Bt);i.bindBuffer(i.ARRAY_BUFFER,Jt);for(let Bt=0;Bt<G.locationSize;Bt++)M(G.location+Bt,pt/G.locationSize,$,ft,Ut*et,(It+pt/G.locationSize*Bt)*et,St)}else{if(ct.isInstancedBufferAttribute){for(let dt=0;dt<G.locationSize;dt++)m(G.location+dt,ct.meshPerAttribute);_.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=ct.meshPerAttribute*ct.count)}else for(let dt=0;dt<G.locationSize;dt++)p(G.location+dt);i.bindBuffer(i.ARRAY_BUFFER,Jt);for(let dt=0;dt<G.locationSize;dt++)M(G.location+dt,pt/G.locationSize,$,ft,pt*et,pt/G.locationSize*dt*et,St)}}else if(O!==void 0){const ft=O[Q];if(ft!==void 0)switch(ft.length){case 2:i.vertexAttrib2fv(G.location,ft);break;case 3:i.vertexAttrib3fv(G.location,ft);break;case 4:i.vertexAttrib4fv(G.location,ft);break;default:i.vertexAttrib1fv(G.location,ft)}}}}S()}function L(){P();for(const _ in n){const b=n[_];for(const B in b){const D=b[B];for(const F in D)h(D[F].object),delete D[F];delete b[B]}delete n[_]}}function E(_){if(n[_.id]===void 0)return;const b=n[_.id];for(const B in b){const D=b[B];for(const F in D)h(D[F].object),delete D[F];delete b[B]}delete n[_.id]}function A(_){for(const b in n){const B=n[b];if(B[_.id]===void 0)continue;const D=B[_.id];for(const F in D)h(D[F].object),delete D[F];delete B[_.id]}}function P(){V(),o=!0,r!==s&&(r=s,c(r.object))}function V(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:P,resetDefaultState:V,dispose:L,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:p,disableUnusedAttributes:S}}function dm(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function o(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function a(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];e.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v];for(let v=0;v<d.length;v++)e.update(g,n,d[v])}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function fm(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const A=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==pn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const P=A===Xs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==Un&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Ln&&!P)}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(d===!0){const A=t.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),L=g>0,E=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:S,maxVaryings:M,maxFragmentUniforms:x,vertexTextures:L,maxSamples:E}}function pm(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new ii,a=new qt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){const g=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,m=i.get(u);if(!s||g===null||g.length===0||r&&!p)r?h(null):c();else{const S=r?0:n,M=S*4;let x=m.clippingState||null;l.value=x,x=h(g,d,M,f);for(let L=0;L!==M;++L)x[L]=e[L];m.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,g){const v=u!==null?u.length:0;let p=null;if(v!==0){if(p=l.value,g!==!0||p===null){const m=f+v*4,S=d.matrixWorldInverse;a.getNormalMatrix(S),(p===null||p.length<m)&&(p=new Float32Array(m));for(let M=0,x=f;M!==v;++M,x+=4)o.copy(u[M]).applyMatrix4(S,a),o.normal.toArray(p,x),p[x+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}function mm(i){let t=new WeakMap;function e(o,a){return a===fa?o.mapping=ji:a===pa&&(o.mapping=Qi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===fa||a===pa)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Ed(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class xh extends gh{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const zi=4,tc=[.125,.215,.35,.446,.526,.582],oi=20,Do=new xh,ec=new Gt;let No=null,Fo=0,ko=0,Oo=!1;const si=(1+Math.sqrt(5))/2,Ni=1/si,nc=[new C(-si,Ni,0),new C(si,Ni,0),new C(-Ni,0,si),new C(Ni,0,si),new C(0,si,-Ni),new C(0,si,Ni),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)];class ic{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){No=this._renderer.getRenderTarget(),Fo=this._renderer.getActiveCubeFace(),ko=this._renderer.getActiveMipmapLevel(),Oo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=oc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=rc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(No,Fo,ko),this._renderer.xr.enabled=Oo,t.scissorTest=!1,mr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ji||t.mapping===Qi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),No=this._renderer.getRenderTarget(),Fo=this._renderer.getActiveCubeFace(),ko=this._renderer.getActiveMipmapLevel(),Oo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:dn,minFilter:dn,generateMipmaps:!1,type:Xs,format:pn,colorSpace:Yn,depthBuffer:!1},s=sc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=sc(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=gm(r)),this._blurMaterial=_m(r,t,e)}return s}_compileMaterial(t){const e=new q(this._lodPlanes[0],t);this._renderer.compile(e,Do)}_sceneToCubeUV(t,e,n,s){const a=new ze(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(ec),h.toneMapping=Xn,h.autoClear=!1;const f=new Re({name:"PMREM.Background",side:Ze,depthWrite:!1,depthTest:!1}),g=new q(new he,f);let v=!1;const p=t.background;p?p.isColor&&(f.color.copy(p),t.background=null,v=!0):(f.color.copy(ec),v=!0);for(let m=0;m<6;m++){const S=m%3;S===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):S===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));const M=this._cubeSize;mr(s,S*M,m>2?M:0,M,M),h.setRenderTarget(s),v&&h.render(g,a),h.render(t,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,t.background=p}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===ji||t.mapping===Qi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=oc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=rc());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new q(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;mr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,Do)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=nc[(s-r-1)%nc.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new q(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*oi-1),v=r/g,p=isFinite(r)?1+Math.floor(h*v):oi;p>oi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${oi}`);const m=[];let S=0;for(let A=0;A<oi;++A){const P=A/v,V=Math.exp(-P*P/2);m.push(V),A===0?S+=V:A<p&&(S+=2*V)}for(let A=0;A<m.length;A++)m[A]=m[A]/S;d.envMap.value=t.texture,d.samples.value=p,d.weights.value=m,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:M}=this;d.dTheta.value=g,d.mipInt.value=M-n;const x=this._sizeLods[s],L=3*x*(s>M-zi?s-M+zi:0),E=4*(this._cubeSize-x);mr(e,L,E,3*x,2*x),l.setRenderTarget(e),l.render(u,Do)}}function gm(i){const t=[],e=[],n=[];let s=i;const r=i-zi+1+tc.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>i-zi?l=tc[o-i+zi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,v=3,p=2,m=1,S=new Float32Array(v*g*f),M=new Float32Array(p*g*f),x=new Float32Array(m*g*f);for(let E=0;E<f;E++){const A=E%3*2/3-1,P=E>2?0:-1,V=[A,P,0,A+2/3,P,0,A+2/3,P+1,0,A,P,0,A+2/3,P+1,0,A,P+1,0];S.set(V,v*g*E),M.set(d,p*g*E);const _=[E,E,E,E,E,E];x.set(_,m*g*E)}const L=new Fe;L.setAttribute("position",new mn(S,v)),L.setAttribute("uv",new mn(M,p)),L.setAttribute("faceIndex",new mn(x,m)),t.push(L),s>zi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function sc(i,t,e){const n=new pi(i,t,e);return n.texture.mapping=to,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function mr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function _m(i,t,e){const n=new Float32Array(oi),s=new C(0,1,0);return new $n({name:"SphericalGaussianBlur",defines:{n:oi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function rc(){return new $n({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function oc(){return new $n({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function cl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function vm(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===fa||l===pa,h=l===ji||l===Qi;if(c||h){let u=t.get(a);const d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new ic(i)),u=c?e.fromEquirectangular(a,u):e.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&s(f)?(e===null&&(e=new ic(i)),u=c?e.fromEquirectangular(a):e.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function xm(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&Dr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Mm(i,t,e,n){const s={},r=new WeakMap;function o(u){const d=u.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);for(const g in d.morphAttributes){const v=d.morphAttributes[g];for(let p=0,m=v.length;p<m;p++)t.remove(v[p])}d.removeEventListener("dispose",o),delete s[d.id];const f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function l(u){const d=u.attributes;for(const g in d)t.update(d[g],i.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const v=f[g];for(let p=0,m=v.length;p<m;p++)t.update(v[p],i.ARRAY_BUFFER)}}function c(u){const d=[],f=u.index,g=u.attributes.position;let v=0;if(f!==null){const S=f.array;v=f.version;for(let M=0,x=S.length;M<x;M+=3){const L=S[M+0],E=S[M+1],A=S[M+2];d.push(L,E,E,A,A,L)}}else if(g!==void 0){const S=g.array;v=g.version;for(let M=0,x=S.length/3-1;M<x;M+=3){const L=M+0,E=M+1,A=M+2;d.push(L,E,E,A,A,L)}}else return;const p=new(ah(d)?ph:fh)(d,1);p.version=v;const m=r.get(u);m&&t.remove(m),r.set(u,p)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function ym(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*o),e.update(f,n,1)}function c(d,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,d*o,g),e.update(f,n,g))}function h(d,f,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let p=0;for(let m=0;m<g;m++)p+=f[m];e.update(p,n,1)}function u(d,f,g,v){if(g===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<d.length;m++)c(d[m]/o,f[m],v[m]);else{p.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,v,0,g);let m=0;for(let S=0;S<g;S++)m+=f[S];for(let S=0;S<v.length;S++)e.update(m,n,v[S])}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Sm(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function bm(i,t,e){const n=new WeakMap,s=new Me;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(a);if(d===void 0||d.count!==u){let V=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",V)};d!==void 0&&d.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],S=a.morphAttributes.color||[];let M=0;f===!0&&(M=1),g===!0&&(M=2),v===!0&&(M=3);let x=a.attributes.position.count*M,L=1;x>t.maxTextureSize&&(L=Math.ceil(x/t.maxTextureSize),x=t.maxTextureSize);const E=new Float32Array(x*L*4*u),A=new ch(E,x,L,u);A.type=Ln,A.needsUpdate=!0;const P=M*4;for(let _=0;_<u;_++){const b=p[_],B=m[_],D=S[_],F=x*L*4*_;for(let X=0;X<b.count;X++){const O=X*P;f===!0&&(s.fromBufferAttribute(b,X),E[F+O+0]=s.x,E[F+O+1]=s.y,E[F+O+2]=s.z,E[F+O+3]=0),g===!0&&(s.fromBufferAttribute(B,X),E[F+O+4]=s.x,E[F+O+5]=s.y,E[F+O+6]=s.z,E[F+O+7]=0),v===!0&&(s.fromBufferAttribute(D,X),E[F+O+8]=s.x,E[F+O+9]=s.y,E[F+O+10]=s.z,E[F+O+11]=D.itemSize===4?s.w:1)}}d={count:u,texture:A,size:new it(x,L)},n.set(a,d),a.addEventListener("dispose",V)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function wm(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return u}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}class Mh extends Ge{constructor(t,e,n,s,r,o,a,l,c,h=$i){if(h!==$i&&h!==es)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===$i&&(n=fi),n===void 0&&h===es&&(n=ts),super(null,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:on,this.minFilter=l!==void 0?l:on,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const yh=new Ge,ac=new Mh(1,1),Sh=new ch,bh=new cd,wh=new _h,lc=[],cc=[],hc=new Float32Array(16),uc=new Float32Array(9),dc=new Float32Array(4);function os(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=lc[s];if(r===void 0&&(r=new Float32Array(s),lc[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Ce(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Pe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function io(i,t){let e=cc[t];e===void 0&&(e=new Int32Array(t),cc[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Em(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Tm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ce(e,t))return;i.uniform2fv(this.addr,t),Pe(e,t)}}function Am(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ce(e,t))return;i.uniform3fv(this.addr,t),Pe(e,t)}}function Rm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ce(e,t))return;i.uniform4fv(this.addr,t),Pe(e,t)}}function Cm(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ce(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Pe(e,t)}else{if(Ce(e,n))return;dc.set(n),i.uniformMatrix2fv(this.addr,!1,dc),Pe(e,n)}}function Pm(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ce(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Pe(e,t)}else{if(Ce(e,n))return;uc.set(n),i.uniformMatrix3fv(this.addr,!1,uc),Pe(e,n)}}function Lm(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ce(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Pe(e,t)}else{if(Ce(e,n))return;hc.set(n),i.uniformMatrix4fv(this.addr,!1,hc),Pe(e,n)}}function Im(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Um(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ce(e,t))return;i.uniform2iv(this.addr,t),Pe(e,t)}}function Dm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ce(e,t))return;i.uniform3iv(this.addr,t),Pe(e,t)}}function Nm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ce(e,t))return;i.uniform4iv(this.addr,t),Pe(e,t)}}function Fm(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function km(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ce(e,t))return;i.uniform2uiv(this.addr,t),Pe(e,t)}}function Om(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ce(e,t))return;i.uniform3uiv(this.addr,t),Pe(e,t)}}function Bm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ce(e,t))return;i.uniform4uiv(this.addr,t),Pe(e,t)}}function zm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(ac.compareFunction=oh,r=ac):r=yh,e.setTexture2D(t||r,s)}function Hm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||bh,s)}function Vm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||wh,s)}function Gm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Sh,s)}function Wm(i){switch(i){case 5126:return Em;case 35664:return Tm;case 35665:return Am;case 35666:return Rm;case 35674:return Cm;case 35675:return Pm;case 35676:return Lm;case 5124:case 35670:return Im;case 35667:case 35671:return Um;case 35668:case 35672:return Dm;case 35669:case 35673:return Nm;case 5125:return Fm;case 36294:return km;case 36295:return Om;case 36296:return Bm;case 35678:case 36198:case 36298:case 36306:case 35682:return zm;case 35679:case 36299:case 36307:return Hm;case 35680:case 36300:case 36308:case 36293:return Vm;case 36289:case 36303:case 36311:case 36292:return Gm}}function Xm(i,t){i.uniform1fv(this.addr,t)}function qm(i,t){const e=os(t,this.size,2);i.uniform2fv(this.addr,e)}function $m(i,t){const e=os(t,this.size,3);i.uniform3fv(this.addr,e)}function Ym(i,t){const e=os(t,this.size,4);i.uniform4fv(this.addr,e)}function Zm(i,t){const e=os(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Km(i,t){const e=os(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Jm(i,t){const e=os(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function jm(i,t){i.uniform1iv(this.addr,t)}function Qm(i,t){i.uniform2iv(this.addr,t)}function t0(i,t){i.uniform3iv(this.addr,t)}function e0(i,t){i.uniform4iv(this.addr,t)}function n0(i,t){i.uniform1uiv(this.addr,t)}function i0(i,t){i.uniform2uiv(this.addr,t)}function s0(i,t){i.uniform3uiv(this.addr,t)}function r0(i,t){i.uniform4uiv(this.addr,t)}function o0(i,t,e){const n=this.cache,s=t.length,r=io(e,s);Ce(n,r)||(i.uniform1iv(this.addr,r),Pe(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||yh,r[o])}function a0(i,t,e){const n=this.cache,s=t.length,r=io(e,s);Ce(n,r)||(i.uniform1iv(this.addr,r),Pe(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||bh,r[o])}function l0(i,t,e){const n=this.cache,s=t.length,r=io(e,s);Ce(n,r)||(i.uniform1iv(this.addr,r),Pe(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||wh,r[o])}function c0(i,t,e){const n=this.cache,s=t.length,r=io(e,s);Ce(n,r)||(i.uniform1iv(this.addr,r),Pe(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Sh,r[o])}function h0(i){switch(i){case 5126:return Xm;case 35664:return qm;case 35665:return $m;case 35666:return Ym;case 35674:return Zm;case 35675:return Km;case 35676:return Jm;case 5124:case 35670:return jm;case 35667:case 35671:return Qm;case 35668:case 35672:return t0;case 35669:case 35673:return e0;case 5125:return n0;case 36294:return i0;case 36295:return s0;case 36296:return r0;case 35678:case 36198:case 36298:case 36306:case 35682:return o0;case 35679:case 36299:case 36307:return a0;case 35680:case 36300:case 36308:case 36293:return l0;case 36289:case 36303:case 36311:case 36292:return c0}}class u0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Wm(e.type)}}class d0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=h0(e.type)}}class f0{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const Bo=/(\w+)(\])?(\[|\.)?/g;function fc(i,t){i.seq.push(t),i.map[t.id]=t}function p0(i,t,e){const n=i.name,s=n.length;for(Bo.lastIndex=0;;){const r=Bo.exec(n),o=Bo.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){fc(e,c===void 0?new u0(a,i,t):new d0(a,i,t));break}else{let u=e.map[a];u===void 0&&(u=new f0(a),fc(e,u)),e=u}}}class Nr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);p0(r,o,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function pc(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const m0=37297;let g0=0;function _0(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function v0(i){const t=ae.getPrimaries(ae.workingColorSpace),e=ae.getPrimaries(i);let n;switch(t===e?n="":t===Vr&&e===Hr?n="LinearDisplayP3ToLinearSRGB":t===Hr&&e===Vr&&(n="LinearSRGBToLinearDisplayP3"),i){case Yn:case eo:return[n,"LinearTransferOETF"];case tn:case ol:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function mc(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+_0(i.getShaderSource(t),o)}else return s}function x0(i,t){const e=v0(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function M0(i,t){let e;switch(t){case Mu:e="Linear";break;case yu:e="Reinhard";break;case Su:e="Cineon";break;case bu:e="ACESFilmic";break;case Eu:e="AgX";break;case Tu:e="Neutral";break;case wu:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const gr=new C;function y0(){ae.getLuminanceCoefficients(gr);const i=gr.x.toFixed(4),t=gr.y.toFixed(4),e=gr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function S0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(bs).join(`
`)}function b0(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function w0(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function bs(i){return i!==""}function gc(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function _c(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const E0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Va(i){return i.replace(E0,A0)}const T0=new Map;function A0(i,t){let e=Xt[t];if(e===void 0){const n=T0.get(t);if(n!==void 0)e=Xt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Va(e)}const R0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vc(i){return i.replace(R0,C0)}function C0(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function xc(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function P0(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Yc?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===Qh?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Cn&&(t="SHADOWMAP_TYPE_VSM"),t}function L0(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ji:case Qi:t="ENVMAP_TYPE_CUBE";break;case to:t="ENVMAP_TYPE_CUBE_UV";break}return t}function I0(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Qi:t="ENVMAP_MODE_REFRACTION";break}return t}function U0(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Qr:t="ENVMAP_BLENDING_MULTIPLY";break;case vu:t="ENVMAP_BLENDING_MIX";break;case xu:t="ENVMAP_BLENDING_ADD";break}return t}function D0(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function N0(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=P0(e),c=L0(e),h=I0(e),u=U0(e),d=D0(e),f=S0(e),g=b0(r),v=s.createProgram();let p,m,S=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(bs).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(bs).join(`
`),m.length>0&&(m+=`
`)):(p=[xc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(bs).join(`
`),m=[xc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Xn?"#define TONE_MAPPING":"",e.toneMapping!==Xn?Xt.tonemapping_pars_fragment:"",e.toneMapping!==Xn?M0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Xt.colorspace_pars_fragment,x0("linearToOutputTexel",e.outputColorSpace),y0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(bs).join(`
`)),o=Va(o),o=gc(o,e),o=_c(o,e),a=Va(a),a=gc(a,e),a=_c(a,e),o=vc(o),a=vc(a),e.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Nl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Nl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const M=S+p+o,x=S+m+a,L=pc(s,s.VERTEX_SHADER,M),E=pc(s,s.FRAGMENT_SHADER,x);s.attachShader(v,L),s.attachShader(v,E),e.index0AttributeName!==void 0?s.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function A(b){if(i.debug.checkShaderErrors){const B=s.getProgramInfoLog(v).trim(),D=s.getShaderInfoLog(L).trim(),F=s.getShaderInfoLog(E).trim();let X=!0,O=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,L,E);else{const Q=mc(s,L,"vertex"),G=mc(s,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+b.name+`
Material Type: `+b.type+`

Program Info Log: `+B+`
`+Q+`
`+G)}else B!==""?console.warn("THREE.WebGLProgram: Program Info Log:",B):(D===""||F==="")&&(O=!1);O&&(b.diagnostics={runnable:X,programLog:B,vertexShader:{log:D,prefix:p},fragmentShader:{log:F,prefix:m}})}s.deleteShader(L),s.deleteShader(E),P=new Nr(s,v),V=w0(s,v)}let P;this.getUniforms=function(){return P===void 0&&A(this),P};let V;this.getAttributes=function(){return V===void 0&&A(this),V};let _=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=s.getProgramParameter(v,m0)),_},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=g0++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=L,this.fragmentShader=E,this}let F0=0;class k0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new O0(t),e.set(t,n)),n}}class O0{constructor(t){this.id=F0++,this.code=t,this.usedTimes=0}}function B0(i,t,e,n,s,r,o){const a=new uh,l=new k0,c=new Set,h=[],u=s.logarithmicDepthBuffer,d=s.reverseDepthBuffer,f=s.vertexTextures;let g=s.precision;const v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(_){return c.add(_),_===0?"uv":`uv${_}`}function m(_,b,B,D,F){const X=D.fog,O=F.geometry,Q=_.isMeshStandardMaterial?D.environment:null,G=(_.isMeshStandardMaterial?e:t).get(_.envMap||Q),ct=G&&G.mapping===to?G.image.height:null,ft=v[_.type];_.precision!==null&&(g=s.getMaxPrecision(_.precision),g!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",g,"instead."));const pt=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Wt=pt!==void 0?pt.length:0;let Jt=0;O.morphAttributes.position!==void 0&&(Jt=1),O.morphAttributes.normal!==void 0&&(Jt=2),O.morphAttributes.color!==void 0&&(Jt=3);let $,et,St,dt;if(ft){const Xe=xn[ft];$=Xe.vertexShader,et=Xe.fragmentShader}else $=_.vertexShader,et=_.fragmentShader,l.update(_),St=l.getVertexShaderID(_),dt=l.getFragmentShaderID(_);const Ut=i.getRenderTarget(),It=F.isInstancedMesh===!0,Bt=F.isBatchedMesh===!0,Zt=!!_.map,K=!!_.matcap,R=!!G,at=!!_.aoMap,ot=!!_.lightMap,tt=!!_.bumpMap,lt=!!_.normalMap,Ct=!!_.displacementMap,_t=!!_.emissiveMap,T=!!_.metalnessMap,y=!!_.roughnessMap,k=_.anisotropy>0,Y=_.clearcoat>0,J=_.dispersion>0,Z=_.iridescence>0,Et=_.sheen>0,ht=_.transmission>0,Mt=k&&!!_.anisotropyMap,Qt=Y&&!!_.clearcoatMap,nt=Y&&!!_.clearcoatNormalMap,yt=Y&&!!_.clearcoatRoughnessMap,kt=Z&&!!_.iridescenceMap,Ot=Z&&!!_.iridescenceThicknessMap,bt=Et&&!!_.sheenColorMap,te=Et&&!!_.sheenRoughnessMap,Ht=!!_.specularMap,ue=!!_.specularColorMap,I=!!_.specularIntensityMap,vt=ht&&!!_.transmissionMap,W=ht&&!!_.thicknessMap,j=!!_.gradientMap,mt=!!_.alphaMap,xt=_.alphaTest>0,ee=!!_.alphaHash,be=!!_.extensions;let We=Xn;_.toneMapped&&(Ut===null||Ut.isXRRenderTarget===!0)&&(We=i.toneMapping);const ie={shaderID:ft,shaderType:_.type,shaderName:_.name,vertexShader:$,fragmentShader:et,defines:_.defines,customVertexShaderID:St,customFragmentShaderID:dt,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:g,batching:Bt,batchingColor:Bt&&F._colorsTexture!==null,instancing:It,instancingColor:It&&F.instanceColor!==null,instancingMorph:It&&F.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:Ut===null?i.outputColorSpace:Ut.isXRRenderTarget===!0?Ut.texture.colorSpace:Yn,alphaToCoverage:!!_.alphaToCoverage,map:Zt,matcap:K,envMap:R,envMapMode:R&&G.mapping,envMapCubeUVHeight:ct,aoMap:at,lightMap:ot,bumpMap:tt,normalMap:lt,displacementMap:f&&Ct,emissiveMap:_t,normalMapObjectSpace:lt&&_.normalMapType===Pu,normalMapTangentSpace:lt&&_.normalMapType===rl,metalnessMap:T,roughnessMap:y,anisotropy:k,anisotropyMap:Mt,clearcoat:Y,clearcoatMap:Qt,clearcoatNormalMap:nt,clearcoatRoughnessMap:yt,dispersion:J,iridescence:Z,iridescenceMap:kt,iridescenceThicknessMap:Ot,sheen:Et,sheenColorMap:bt,sheenRoughnessMap:te,specularMap:Ht,specularColorMap:ue,specularIntensityMap:I,transmission:ht,transmissionMap:vt,thicknessMap:W,gradientMap:j,opaque:_.transparent===!1&&_.blending===qi&&_.alphaToCoverage===!1,alphaMap:mt,alphaTest:xt,alphaHash:ee,combine:_.combine,mapUv:Zt&&p(_.map.channel),aoMapUv:at&&p(_.aoMap.channel),lightMapUv:ot&&p(_.lightMap.channel),bumpMapUv:tt&&p(_.bumpMap.channel),normalMapUv:lt&&p(_.normalMap.channel),displacementMapUv:Ct&&p(_.displacementMap.channel),emissiveMapUv:_t&&p(_.emissiveMap.channel),metalnessMapUv:T&&p(_.metalnessMap.channel),roughnessMapUv:y&&p(_.roughnessMap.channel),anisotropyMapUv:Mt&&p(_.anisotropyMap.channel),clearcoatMapUv:Qt&&p(_.clearcoatMap.channel),clearcoatNormalMapUv:nt&&p(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:yt&&p(_.clearcoatRoughnessMap.channel),iridescenceMapUv:kt&&p(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ot&&p(_.iridescenceThicknessMap.channel),sheenColorMapUv:bt&&p(_.sheenColorMap.channel),sheenRoughnessMapUv:te&&p(_.sheenRoughnessMap.channel),specularMapUv:Ht&&p(_.specularMap.channel),specularColorMapUv:ue&&p(_.specularColorMap.channel),specularIntensityMapUv:I&&p(_.specularIntensityMap.channel),transmissionMapUv:vt&&p(_.transmissionMap.channel),thicknessMapUv:W&&p(_.thicknessMap.channel),alphaMapUv:mt&&p(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(lt||k),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!O.attributes.uv&&(Zt||mt),fog:!!X,useFog:_.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:_.flatShading===!0,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:d,skinning:F.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Wt,morphTextureStride:Jt,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&B.length>0,shadowMapType:i.shadowMap.type,toneMapping:We,decodeVideoTexture:Zt&&_.map.isVideoTexture===!0&&ae.getTransfer(_.map.colorSpace)===fe,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Ye,flipSided:_.side===Ze,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:be&&_.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(be&&_.extensions.multiDraw===!0||Bt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return ie.vertexUv1s=c.has(1),ie.vertexUv2s=c.has(2),ie.vertexUv3s=c.has(3),c.clear(),ie}function S(_){const b=[];if(_.shaderID?b.push(_.shaderID):(b.push(_.customVertexShaderID),b.push(_.customFragmentShaderID)),_.defines!==void 0)for(const B in _.defines)b.push(B),b.push(_.defines[B]);return _.isRawShaderMaterial===!1&&(M(b,_),x(b,_),b.push(i.outputColorSpace)),b.push(_.customProgramCacheKey),b.join()}function M(_,b){_.push(b.precision),_.push(b.outputColorSpace),_.push(b.envMapMode),_.push(b.envMapCubeUVHeight),_.push(b.mapUv),_.push(b.alphaMapUv),_.push(b.lightMapUv),_.push(b.aoMapUv),_.push(b.bumpMapUv),_.push(b.normalMapUv),_.push(b.displacementMapUv),_.push(b.emissiveMapUv),_.push(b.metalnessMapUv),_.push(b.roughnessMapUv),_.push(b.anisotropyMapUv),_.push(b.clearcoatMapUv),_.push(b.clearcoatNormalMapUv),_.push(b.clearcoatRoughnessMapUv),_.push(b.iridescenceMapUv),_.push(b.iridescenceThicknessMapUv),_.push(b.sheenColorMapUv),_.push(b.sheenRoughnessMapUv),_.push(b.specularMapUv),_.push(b.specularColorMapUv),_.push(b.specularIntensityMapUv),_.push(b.transmissionMapUv),_.push(b.thicknessMapUv),_.push(b.combine),_.push(b.fogExp2),_.push(b.sizeAttenuation),_.push(b.morphTargetsCount),_.push(b.morphAttributeCount),_.push(b.numDirLights),_.push(b.numPointLights),_.push(b.numSpotLights),_.push(b.numSpotLightMaps),_.push(b.numHemiLights),_.push(b.numRectAreaLights),_.push(b.numDirLightShadows),_.push(b.numPointLightShadows),_.push(b.numSpotLightShadows),_.push(b.numSpotLightShadowsWithMaps),_.push(b.numLightProbes),_.push(b.shadowMapType),_.push(b.toneMapping),_.push(b.numClippingPlanes),_.push(b.numClipIntersection),_.push(b.depthPacking)}function x(_,b){a.disableAll(),b.supportsVertexTextures&&a.enable(0),b.instancing&&a.enable(1),b.instancingColor&&a.enable(2),b.instancingMorph&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),b.dispersion&&a.enable(20),b.batchingColor&&a.enable(21),_.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reverseDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.alphaToCoverage&&a.enable(20),_.push(a.mask)}function L(_){const b=v[_.type];let B;if(b){const D=xn[b];B=yd.clone(D.uniforms)}else B=_.uniforms;return B}function E(_,b){let B;for(let D=0,F=h.length;D<F;D++){const X=h[D];if(X.cacheKey===b){B=X,++B.usedTimes;break}}return B===void 0&&(B=new N0(i,b,_,r),h.push(B)),B}function A(_){if(--_.usedTimes===0){const b=h.indexOf(_);h[b]=h[h.length-1],h.pop(),_.destroy()}}function P(_){l.remove(_)}function V(){l.dispose()}return{getParameters:m,getProgramCacheKey:S,getUniforms:L,acquireProgram:E,releaseProgram:A,releaseShaderCache:P,programs:h,dispose:V}}function z0(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function H0(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Mc(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function yc(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(u,d,f,g,v,p){let m=i[t];return m===void 0?(m={id:u.id,object:u,geometry:d,material:f,groupOrder:g,renderOrder:u.renderOrder,z:v,group:p},i[t]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=f,m.groupOrder=g,m.renderOrder=u.renderOrder,m.z=v,m.group=p),t++,m}function a(u,d,f,g,v,p){const m=o(u,d,f,g,v,p);f.transmission>0?n.push(m):f.transparent===!0?s.push(m):e.push(m)}function l(u,d,f,g,v,p){const m=o(u,d,f,g,v,p);f.transmission>0?n.unshift(m):f.transparent===!0?s.unshift(m):e.unshift(m)}function c(u,d){e.length>1&&e.sort(u||H0),n.length>1&&n.sort(d||Mc),s.length>1&&s.sort(d||Mc)}function h(){for(let u=t,d=i.length;u<d;u++){const f=i[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function V0(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new yc,i.set(n,[o])):s>=r.length?(o=new yc,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function G0(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new C,color:new Gt};break;case"SpotLight":e={position:new C,direction:new C,color:new Gt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new C,color:new Gt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new C,skyColor:new Gt,groundColor:new Gt};break;case"RectAreaLight":e={color:new Gt,position:new C,halfWidth:new C,halfHeight:new C};break}return i[t.id]=e,e}}}function W0(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let X0=0;function q0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function $0(i){const t=new G0,e=W0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);const s=new C,r=new pe,o=new pe;function a(c){let h=0,u=0,d=0;for(let V=0;V<9;V++)n.probe[V].set(0,0,0);let f=0,g=0,v=0,p=0,m=0,S=0,M=0,x=0,L=0,E=0,A=0;c.sort(q0);for(let V=0,_=c.length;V<_;V++){const b=c[V],B=b.color,D=b.intensity,F=b.distance,X=b.shadow&&b.shadow.map?b.shadow.map.texture:null;if(b.isAmbientLight)h+=B.r*D,u+=B.g*D,d+=B.b*D;else if(b.isLightProbe){for(let O=0;O<9;O++)n.probe[O].addScaledVector(b.sh.coefficients[O],D);A++}else if(b.isDirectionalLight){const O=t.get(b);if(O.color.copy(b.color).multiplyScalar(b.intensity),b.castShadow){const Q=b.shadow,G=e.get(b);G.shadowIntensity=Q.intensity,G.shadowBias=Q.bias,G.shadowNormalBias=Q.normalBias,G.shadowRadius=Q.radius,G.shadowMapSize=Q.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=X,n.directionalShadowMatrix[f]=b.shadow.matrix,S++}n.directional[f]=O,f++}else if(b.isSpotLight){const O=t.get(b);O.position.setFromMatrixPosition(b.matrixWorld),O.color.copy(B).multiplyScalar(D),O.distance=F,O.coneCos=Math.cos(b.angle),O.penumbraCos=Math.cos(b.angle*(1-b.penumbra)),O.decay=b.decay,n.spot[v]=O;const Q=b.shadow;if(b.map&&(n.spotLightMap[L]=b.map,L++,Q.updateMatrices(b),b.castShadow&&E++),n.spotLightMatrix[v]=Q.matrix,b.castShadow){const G=e.get(b);G.shadowIntensity=Q.intensity,G.shadowBias=Q.bias,G.shadowNormalBias=Q.normalBias,G.shadowRadius=Q.radius,G.shadowMapSize=Q.mapSize,n.spotShadow[v]=G,n.spotShadowMap[v]=X,x++}v++}else if(b.isRectAreaLight){const O=t.get(b);O.color.copy(B).multiplyScalar(D),O.halfWidth.set(b.width*.5,0,0),O.halfHeight.set(0,b.height*.5,0),n.rectArea[p]=O,p++}else if(b.isPointLight){const O=t.get(b);if(O.color.copy(b.color).multiplyScalar(b.intensity),O.distance=b.distance,O.decay=b.decay,b.castShadow){const Q=b.shadow,G=e.get(b);G.shadowIntensity=Q.intensity,G.shadowBias=Q.bias,G.shadowNormalBias=Q.normalBias,G.shadowRadius=Q.radius,G.shadowMapSize=Q.mapSize,G.shadowCameraNear=Q.camera.near,G.shadowCameraFar=Q.camera.far,n.pointShadow[g]=G,n.pointShadowMap[g]=X,n.pointShadowMatrix[g]=b.shadow.matrix,M++}n.point[g]=O,g++}else if(b.isHemisphereLight){const O=t.get(b);O.skyColor.copy(b.color).multiplyScalar(D),O.groundColor.copy(b.groundColor).multiplyScalar(D),n.hemi[m]=O,m++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ut.LTC_FLOAT_1,n.rectAreaLTC2=ut.LTC_FLOAT_2):(n.rectAreaLTC1=ut.LTC_HALF_1,n.rectAreaLTC2=ut.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const P=n.hash;(P.directionalLength!==f||P.pointLength!==g||P.spotLength!==v||P.rectAreaLength!==p||P.hemiLength!==m||P.numDirectionalShadows!==S||P.numPointShadows!==M||P.numSpotShadows!==x||P.numSpotMaps!==L||P.numLightProbes!==A)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=p,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=S,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=x+L-E,n.spotLightMap.length=L,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=A,P.directionalLength=f,P.pointLength=g,P.spotLength=v,P.rectAreaLength=p,P.hemiLength=m,P.numDirectionalShadows=S,P.numPointShadows=M,P.numSpotShadows=x,P.numSpotMaps=L,P.numLightProbes=A,n.version=X0++)}function l(c,h){let u=0,d=0,f=0,g=0,v=0;const p=h.matrixWorldInverse;for(let m=0,S=c.length;m<S;m++){const M=c[m];if(M.isDirectionalLight){const x=n.directional[u];x.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(p),u++}else if(M.isSpotLight){const x=n.spot[f];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(p),x.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(p),f++}else if(M.isRectAreaLight){const x=n.rectArea[g];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(p),o.identity(),r.copy(M.matrixWorld),r.premultiply(p),o.extractRotation(r),x.halfWidth.set(M.width*.5,0,0),x.halfHeight.set(0,M.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(M.isPointLight){const x=n.point[d];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(p),d++}else if(M.isHemisphereLight){const x=n.hemi[v];x.direction.setFromMatrixPosition(M.matrixWorld),x.direction.transformDirection(p),v++}}}return{setup:a,setupView:l,state:n}}function Sc(i){const t=new $0(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function Y0(i){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new Sc(i),t.set(s,[a])):r>=o.length?(a=new Sc(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class Z0 extends _i{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ru,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class K0 extends _i{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const J0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,j0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Q0(i,t,e){let n=new ll;const s=new it,r=new it,o=new Me,a=new Z0({depthPacking:Cu}),l=new K0,c={},h=e.maxTextureSize,u={[qn]:Ze,[Ze]:qn,[Ye]:Ye},d=new $n({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new it},radius:{value:4}},vertexShader:J0,fragmentShader:j0}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new Fe;g.setAttribute("position",new mn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new q(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Yc;let m=this.type;this.render=function(E,A,P){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;const V=i.getRenderTarget(),_=i.getActiveCubeFace(),b=i.getActiveMipmapLevel(),B=i.state;B.setBlending(Wn),B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const D=m!==Cn&&this.type===Cn,F=m===Cn&&this.type!==Cn;for(let X=0,O=E.length;X<O;X++){const Q=E[X],G=Q.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);const ct=G.getFrameExtents();if(s.multiply(ct),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ct.x),s.x=r.x*ct.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ct.y),s.y=r.y*ct.y,G.mapSize.y=r.y)),G.map===null||D===!0||F===!0){const pt=this.type!==Cn?{minFilter:on,magFilter:on}:{};G.map!==null&&G.map.dispose(),G.map=new pi(s.x,s.y,pt),G.map.texture.name=Q.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();const ft=G.getViewportCount();for(let pt=0;pt<ft;pt++){const Wt=G.getViewport(pt);o.set(r.x*Wt.x,r.y*Wt.y,r.x*Wt.z,r.y*Wt.w),B.viewport(o),G.updateMatrices(Q,pt),n=G.getFrustum(),x(A,P,G.camera,Q,this.type)}G.isPointLightShadow!==!0&&this.type===Cn&&S(G,P),G.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(V,_,b)};function S(E,A){const P=t.update(v);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new pi(s.x,s.y)),d.uniforms.shadow_pass.value=E.map.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(A,null,P,d,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(A,null,P,f,v,null)}function M(E,A,P,V){let _=null;const b=P.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(b!==void 0)_=b;else if(_=P.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const B=_.uuid,D=A.uuid;let F=c[B];F===void 0&&(F={},c[B]=F);let X=F[D];X===void 0&&(X=_.clone(),F[D]=X,A.addEventListener("dispose",L)),_=X}if(_.visible=A.visible,_.wireframe=A.wireframe,V===Cn?_.side=A.shadowSide!==null?A.shadowSide:A.side:_.side=A.shadowSide!==null?A.shadowSide:u[A.side],_.alphaMap=A.alphaMap,_.alphaTest=A.alphaTest,_.map=A.map,_.clipShadows=A.clipShadows,_.clippingPlanes=A.clippingPlanes,_.clipIntersection=A.clipIntersection,_.displacementMap=A.displacementMap,_.displacementScale=A.displacementScale,_.displacementBias=A.displacementBias,_.wireframeLinewidth=A.wireframeLinewidth,_.linewidth=A.linewidth,P.isPointLight===!0&&_.isMeshDistanceMaterial===!0){const B=i.properties.get(_);B.light=P}return _}function x(E,A,P,V,_){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&_===Cn)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,E.matrixWorld);const D=t.update(E),F=E.material;if(Array.isArray(F)){const X=D.groups;for(let O=0,Q=X.length;O<Q;O++){const G=X[O],ct=F[G.materialIndex];if(ct&&ct.visible){const ft=M(E,ct,V,_);E.onBeforeShadow(i,E,A,P,D,ft,G),i.renderBufferDirect(P,null,D,ft,E,G),E.onAfterShadow(i,E,A,P,D,ft,G)}}}else if(F.visible){const X=M(E,F,V,_);E.onBeforeShadow(i,E,A,P,D,X,null),i.renderBufferDirect(P,null,D,X,E,null),E.onAfterShadow(i,E,A,P,D,X,null)}}const B=E.children;for(let D=0,F=B.length;D<F;D++)x(B[D],A,P,V,_)}function L(E){E.target.removeEventListener("dispose",L);for(const P in c){const V=c[P],_=E.target.uuid;_ in V&&(V[_].dispose(),delete V[_])}}}const tg={[oa]:aa,[la]:ua,[ca]:da,[Ji]:ha,[aa]:oa,[ua]:la,[da]:ca,[ha]:Ji};function eg(i){function t(){let I=!1;const vt=new Me;let W=null;const j=new Me(0,0,0,0);return{setMask:function(mt){W!==mt&&!I&&(i.colorMask(mt,mt,mt,mt),W=mt)},setLocked:function(mt){I=mt},setClear:function(mt,xt,ee,be,We){We===!0&&(mt*=be,xt*=be,ee*=be),vt.set(mt,xt,ee,be),j.equals(vt)===!1&&(i.clearColor(mt,xt,ee,be),j.copy(vt))},reset:function(){I=!1,W=null,j.set(-1,0,0,0)}}}function e(){let I=!1,vt=!1,W=null,j=null,mt=null;return{setReversed:function(xt){vt=xt},setTest:function(xt){xt?St(i.DEPTH_TEST):dt(i.DEPTH_TEST)},setMask:function(xt){W!==xt&&!I&&(i.depthMask(xt),W=xt)},setFunc:function(xt){if(vt&&(xt=tg[xt]),j!==xt){switch(xt){case oa:i.depthFunc(i.NEVER);break;case aa:i.depthFunc(i.ALWAYS);break;case la:i.depthFunc(i.LESS);break;case Ji:i.depthFunc(i.LEQUAL);break;case ca:i.depthFunc(i.EQUAL);break;case ha:i.depthFunc(i.GEQUAL);break;case ua:i.depthFunc(i.GREATER);break;case da:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}j=xt}},setLocked:function(xt){I=xt},setClear:function(xt){mt!==xt&&(i.clearDepth(xt),mt=xt)},reset:function(){I=!1,W=null,j=null,mt=null}}}function n(){let I=!1,vt=null,W=null,j=null,mt=null,xt=null,ee=null,be=null,We=null;return{setTest:function(ie){I||(ie?St(i.STENCIL_TEST):dt(i.STENCIL_TEST))},setMask:function(ie){vt!==ie&&!I&&(i.stencilMask(ie),vt=ie)},setFunc:function(ie,Xe,bn){(W!==ie||j!==Xe||mt!==bn)&&(i.stencilFunc(ie,Xe,bn),W=ie,j=Xe,mt=bn)},setOp:function(ie,Xe,bn){(xt!==ie||ee!==Xe||be!==bn)&&(i.stencilOp(ie,Xe,bn),xt=ie,ee=Xe,be=bn)},setLocked:function(ie){I=ie},setClear:function(ie){We!==ie&&(i.clearStencil(ie),We=ie)},reset:function(){I=!1,vt=null,W=null,j=null,mt=null,xt=null,ee=null,be=null,We=null}}}const s=new t,r=new e,o=new n,a=new WeakMap,l=new WeakMap;let c={},h={},u=new WeakMap,d=[],f=null,g=!1,v=null,p=null,m=null,S=null,M=null,x=null,L=null,E=new Gt(0,0,0),A=0,P=!1,V=null,_=null,b=null,B=null,D=null;const F=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,O=0;const Q=i.getParameter(i.VERSION);Q.indexOf("WebGL")!==-1?(O=parseFloat(/^WebGL (\d)/.exec(Q)[1]),X=O>=1):Q.indexOf("OpenGL ES")!==-1&&(O=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),X=O>=2);let G=null,ct={};const ft=i.getParameter(i.SCISSOR_BOX),pt=i.getParameter(i.VIEWPORT),Wt=new Me().fromArray(ft),Jt=new Me().fromArray(pt);function $(I,vt,W,j){const mt=new Uint8Array(4),xt=i.createTexture();i.bindTexture(I,xt),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ee=0;ee<W;ee++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(vt,0,i.RGBA,1,1,j,0,i.RGBA,i.UNSIGNED_BYTE,mt):i.texImage2D(vt+ee,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,mt);return xt}const et={};et[i.TEXTURE_2D]=$(i.TEXTURE_2D,i.TEXTURE_2D,1),et[i.TEXTURE_CUBE_MAP]=$(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[i.TEXTURE_2D_ARRAY]=$(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),et[i.TEXTURE_3D]=$(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),o.setClear(0),St(i.DEPTH_TEST),r.setFunc(Ji),ot(!1),tt(Cl),St(i.CULL_FACE),R(Wn);function St(I){c[I]!==!0&&(i.enable(I),c[I]=!0)}function dt(I){c[I]!==!1&&(i.disable(I),c[I]=!1)}function Ut(I,vt){return h[I]!==vt?(i.bindFramebuffer(I,vt),h[I]=vt,I===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=vt),I===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=vt),!0):!1}function It(I,vt){let W=d,j=!1;if(I){W=u.get(vt),W===void 0&&(W=[],u.set(vt,W));const mt=I.textures;if(W.length!==mt.length||W[0]!==i.COLOR_ATTACHMENT0){for(let xt=0,ee=mt.length;xt<ee;xt++)W[xt]=i.COLOR_ATTACHMENT0+xt;W.length=mt.length,j=!0}}else W[0]!==i.BACK&&(W[0]=i.BACK,j=!0);j&&i.drawBuffers(W)}function Bt(I){return f!==I?(i.useProgram(I),f=I,!0):!1}const Zt={[ri]:i.FUNC_ADD,[eu]:i.FUNC_SUBTRACT,[nu]:i.FUNC_REVERSE_SUBTRACT};Zt[iu]=i.MIN,Zt[su]=i.MAX;const K={[ru]:i.ZERO,[ou]:i.ONE,[au]:i.SRC_COLOR,[sa]:i.SRC_ALPHA,[fu]:i.SRC_ALPHA_SATURATE,[uu]:i.DST_COLOR,[cu]:i.DST_ALPHA,[lu]:i.ONE_MINUS_SRC_COLOR,[ra]:i.ONE_MINUS_SRC_ALPHA,[du]:i.ONE_MINUS_DST_COLOR,[hu]:i.ONE_MINUS_DST_ALPHA,[pu]:i.CONSTANT_COLOR,[mu]:i.ONE_MINUS_CONSTANT_COLOR,[gu]:i.CONSTANT_ALPHA,[_u]:i.ONE_MINUS_CONSTANT_ALPHA};function R(I,vt,W,j,mt,xt,ee,be,We,ie){if(I===Wn){g===!0&&(dt(i.BLEND),g=!1);return}if(g===!1&&(St(i.BLEND),g=!0),I!==tu){if(I!==v||ie!==P){if((p!==ri||M!==ri)&&(i.blendEquation(i.FUNC_ADD),p=ri,M=ri),ie)switch(I){case qi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Pl:i.blendFunc(i.ONE,i.ONE);break;case Ll:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Il:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case qi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Pl:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Ll:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Il:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}m=null,S=null,x=null,L=null,E.set(0,0,0),A=0,v=I,P=ie}return}mt=mt||vt,xt=xt||W,ee=ee||j,(vt!==p||mt!==M)&&(i.blendEquationSeparate(Zt[vt],Zt[mt]),p=vt,M=mt),(W!==m||j!==S||xt!==x||ee!==L)&&(i.blendFuncSeparate(K[W],K[j],K[xt],K[ee]),m=W,S=j,x=xt,L=ee),(be.equals(E)===!1||We!==A)&&(i.blendColor(be.r,be.g,be.b,We),E.copy(be),A=We),v=I,P=!1}function at(I,vt){I.side===Ye?dt(i.CULL_FACE):St(i.CULL_FACE);let W=I.side===Ze;vt&&(W=!W),ot(W),I.blending===qi&&I.transparent===!1?R(Wn):R(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),r.setFunc(I.depthFunc),r.setTest(I.depthTest),r.setMask(I.depthWrite),s.setMask(I.colorWrite);const j=I.stencilWrite;o.setTest(j),j&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Ct(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?St(i.SAMPLE_ALPHA_TO_COVERAGE):dt(i.SAMPLE_ALPHA_TO_COVERAGE)}function ot(I){V!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),V=I)}function tt(I){I!==Jh?(St(i.CULL_FACE),I!==_&&(I===Cl?i.cullFace(i.BACK):I===jh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):dt(i.CULL_FACE),_=I}function lt(I){I!==b&&(X&&i.lineWidth(I),b=I)}function Ct(I,vt,W){I?(St(i.POLYGON_OFFSET_FILL),(B!==vt||D!==W)&&(i.polygonOffset(vt,W),B=vt,D=W)):dt(i.POLYGON_OFFSET_FILL)}function _t(I){I?St(i.SCISSOR_TEST):dt(i.SCISSOR_TEST)}function T(I){I===void 0&&(I=i.TEXTURE0+F-1),G!==I&&(i.activeTexture(I),G=I)}function y(I,vt,W){W===void 0&&(G===null?W=i.TEXTURE0+F-1:W=G);let j=ct[W];j===void 0&&(j={type:void 0,texture:void 0},ct[W]=j),(j.type!==I||j.texture!==vt)&&(G!==W&&(i.activeTexture(W),G=W),i.bindTexture(I,vt||et[I]),j.type=I,j.texture=vt)}function k(){const I=ct[G];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Y(){try{i.compressedTexImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{i.compressedTexImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Z(){try{i.texSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Et(){try{i.texSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ht(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Mt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Qt(){try{i.texStorage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function nt(){try{i.texStorage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function yt(){try{i.texImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function kt(){try{i.texImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ot(I){Wt.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),Wt.copy(I))}function bt(I){Jt.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),Jt.copy(I))}function te(I,vt){let W=l.get(vt);W===void 0&&(W=new WeakMap,l.set(vt,W));let j=W.get(I);j===void 0&&(j=i.getUniformBlockIndex(vt,I.name),W.set(I,j))}function Ht(I,vt){const j=l.get(vt).get(I);a.get(vt)!==j&&(i.uniformBlockBinding(vt,j,I.__bindingPointIndex),a.set(vt,j))}function ue(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},G=null,ct={},h={},u=new WeakMap,d=[],f=null,g=!1,v=null,p=null,m=null,S=null,M=null,x=null,L=null,E=new Gt(0,0,0),A=0,P=!1,V=null,_=null,b=null,B=null,D=null,Wt.set(0,0,i.canvas.width,i.canvas.height),Jt.set(0,0,i.canvas.width,i.canvas.height),s.reset(),r.reset(),o.reset()}return{buffers:{color:s,depth:r,stencil:o},enable:St,disable:dt,bindFramebuffer:Ut,drawBuffers:It,useProgram:Bt,setBlending:R,setMaterial:at,setFlipSided:ot,setCullFace:tt,setLineWidth:lt,setPolygonOffset:Ct,setScissorTest:_t,activeTexture:T,bindTexture:y,unbindTexture:k,compressedTexImage2D:Y,compressedTexImage3D:J,texImage2D:yt,texImage3D:kt,updateUBOMapping:te,uniformBlockBinding:Ht,texStorage2D:Qt,texStorage3D:nt,texSubImage2D:Z,texSubImage3D:Et,compressedTexSubImage2D:ht,compressedTexSubImage3D:Mt,scissor:Ot,viewport:bt,reset:ue}}function bc(i,t,e,n){const s=ng(n);switch(e){case Qc:return i*t;case eh:return i*t;case nh:return i*t*2;case ih:return i*t/s.components*s.byteLength;case nl:return i*t/s.components*s.byteLength;case sh:return i*t*2/s.components*s.byteLength;case il:return i*t*2/s.components*s.byteLength;case th:return i*t*3/s.components*s.byteLength;case pn:return i*t*4/s.components*s.byteLength;case sl:return i*t*4/s.components*s.byteLength;case Cr:case Pr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Lr:case Ir:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case _a:case xa:return Math.max(i,16)*Math.max(t,8)/4;case ga:case va:return Math.max(i,8)*Math.max(t,8)/2;case Ma:case ya:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Sa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ba:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case wa:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Ea:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ta:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Aa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Ra:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Ca:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Pa:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case La:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Ia:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Ua:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Da:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Na:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Fa:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Ur:case ka:case Oa:return Math.ceil(i/4)*Math.ceil(t/4)*16;case rh:case Ba:return Math.ceil(i/4)*Math.ceil(t/4)*8;case za:case Ha:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function ng(i){switch(i){case Un:case Kc:return{byteLength:1,components:1};case Os:case Jc:case Xs:return{byteLength:2,components:1};case tl:case el:return{byteLength:2,components:4};case fi:case Qa:case Ln:return{byteLength:4,components:1};case jc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function ig(i,t,e,n,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new it,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,y){return f?new OffscreenCanvas(T,y):Wr("canvas")}function v(T,y,k){let Y=1;const J=_t(T);if((J.width>k||J.height>k)&&(Y=k/Math.max(J.width,J.height)),Y<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const Z=Math.floor(Y*J.width),Et=Math.floor(Y*J.height);u===void 0&&(u=g(Z,Et));const ht=y?g(Z,Et):u;return ht.width=Z,ht.height=Et,ht.getContext("2d").drawImage(T,0,0,Z,Et),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+Z+"x"+Et+")."),ht}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),T;return T}function p(T){return T.generateMipmaps&&T.minFilter!==on&&T.minFilter!==dn}function m(T){i.generateMipmap(T)}function S(T,y,k,Y,J=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let Z=y;if(y===i.RED&&(k===i.FLOAT&&(Z=i.R32F),k===i.HALF_FLOAT&&(Z=i.R16F),k===i.UNSIGNED_BYTE&&(Z=i.R8)),y===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(Z=i.R8UI),k===i.UNSIGNED_SHORT&&(Z=i.R16UI),k===i.UNSIGNED_INT&&(Z=i.R32UI),k===i.BYTE&&(Z=i.R8I),k===i.SHORT&&(Z=i.R16I),k===i.INT&&(Z=i.R32I)),y===i.RG&&(k===i.FLOAT&&(Z=i.RG32F),k===i.HALF_FLOAT&&(Z=i.RG16F),k===i.UNSIGNED_BYTE&&(Z=i.RG8)),y===i.RG_INTEGER&&(k===i.UNSIGNED_BYTE&&(Z=i.RG8UI),k===i.UNSIGNED_SHORT&&(Z=i.RG16UI),k===i.UNSIGNED_INT&&(Z=i.RG32UI),k===i.BYTE&&(Z=i.RG8I),k===i.SHORT&&(Z=i.RG16I),k===i.INT&&(Z=i.RG32I)),y===i.RGB_INTEGER&&(k===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),k===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),k===i.UNSIGNED_INT&&(Z=i.RGB32UI),k===i.BYTE&&(Z=i.RGB8I),k===i.SHORT&&(Z=i.RGB16I),k===i.INT&&(Z=i.RGB32I)),y===i.RGBA_INTEGER&&(k===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),k===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),k===i.UNSIGNED_INT&&(Z=i.RGBA32UI),k===i.BYTE&&(Z=i.RGBA8I),k===i.SHORT&&(Z=i.RGBA16I),k===i.INT&&(Z=i.RGBA32I)),y===i.RGB&&k===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),y===i.RGBA){const Et=J?zr:ae.getTransfer(Y);k===i.FLOAT&&(Z=i.RGBA32F),k===i.HALF_FLOAT&&(Z=i.RGBA16F),k===i.UNSIGNED_BYTE&&(Z=Et===fe?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function M(T,y){let k;return T?y===null||y===fi||y===ts?k=i.DEPTH24_STENCIL8:y===Ln?k=i.DEPTH32F_STENCIL8:y===Os&&(k=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===fi||y===ts?k=i.DEPTH_COMPONENT24:y===Ln?k=i.DEPTH_COMPONENT32F:y===Os&&(k=i.DEPTH_COMPONENT16),k}function x(T,y){return p(T)===!0||T.isFramebufferTexture&&T.minFilter!==on&&T.minFilter!==dn?Math.log2(Math.max(y.width,y.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?y.mipmaps.length:1}function L(T){const y=T.target;y.removeEventListener("dispose",L),A(y),y.isVideoTexture&&h.delete(y)}function E(T){const y=T.target;y.removeEventListener("dispose",E),V(y)}function A(T){const y=n.get(T);if(y.__webglInit===void 0)return;const k=T.source,Y=d.get(k);if(Y){const J=Y[y.__cacheKey];J.usedTimes--,J.usedTimes===0&&P(T),Object.keys(Y).length===0&&d.delete(k)}n.remove(T)}function P(T){const y=n.get(T);i.deleteTexture(y.__webglTexture);const k=T.source,Y=d.get(k);delete Y[y.__cacheKey],o.memory.textures--}function V(T){const y=n.get(T);if(T.depthTexture&&T.depthTexture.dispose(),T.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(y.__webglFramebuffer[Y]))for(let J=0;J<y.__webglFramebuffer[Y].length;J++)i.deleteFramebuffer(y.__webglFramebuffer[Y][J]);else i.deleteFramebuffer(y.__webglFramebuffer[Y]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[Y])}else{if(Array.isArray(y.__webglFramebuffer))for(let Y=0;Y<y.__webglFramebuffer.length;Y++)i.deleteFramebuffer(y.__webglFramebuffer[Y]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let Y=0;Y<y.__webglColorRenderbuffer.length;Y++)y.__webglColorRenderbuffer[Y]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[Y]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const k=T.textures;for(let Y=0,J=k.length;Y<J;Y++){const Z=n.get(k[Y]);Z.__webglTexture&&(i.deleteTexture(Z.__webglTexture),o.memory.textures--),n.remove(k[Y])}n.remove(T)}let _=0;function b(){_=0}function B(){const T=_;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),_+=1,T}function D(T){const y=[];return y.push(T.wrapS),y.push(T.wrapT),y.push(T.wrapR||0),y.push(T.magFilter),y.push(T.minFilter),y.push(T.anisotropy),y.push(T.internalFormat),y.push(T.format),y.push(T.type),y.push(T.generateMipmaps),y.push(T.premultiplyAlpha),y.push(T.flipY),y.push(T.unpackAlignment),y.push(T.colorSpace),y.join()}function F(T,y){const k=n.get(T);if(T.isVideoTexture&&lt(T),T.isRenderTargetTexture===!1&&T.version>0&&k.__version!==T.version){const Y=T.image;if(Y===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Jt(k,T,y);return}}e.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+y)}function X(T,y){const k=n.get(T);if(T.version>0&&k.__version!==T.version){Jt(k,T,y);return}e.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+y)}function O(T,y){const k=n.get(T);if(T.version>0&&k.__version!==T.version){Jt(k,T,y);return}e.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+y)}function Q(T,y){const k=n.get(T);if(T.version>0&&k.__version!==T.version){$(k,T,y);return}e.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+y)}const G={[Br]:i.REPEAT,[hi]:i.CLAMP_TO_EDGE,[ma]:i.MIRRORED_REPEAT},ct={[on]:i.NEAREST,[Au]:i.NEAREST_MIPMAP_NEAREST,[Ks]:i.NEAREST_MIPMAP_LINEAR,[dn]:i.LINEAR,[uo]:i.LINEAR_MIPMAP_NEAREST,[ui]:i.LINEAR_MIPMAP_LINEAR},ft={[Lu]:i.NEVER,[ku]:i.ALWAYS,[Iu]:i.LESS,[oh]:i.LEQUAL,[Uu]:i.EQUAL,[Fu]:i.GEQUAL,[Du]:i.GREATER,[Nu]:i.NOTEQUAL};function pt(T,y){if(y.type===Ln&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===dn||y.magFilter===uo||y.magFilter===Ks||y.magFilter===ui||y.minFilter===dn||y.minFilter===uo||y.minFilter===Ks||y.minFilter===ui)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,G[y.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,G[y.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,G[y.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,ct[y.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,ct[y.minFilter]),y.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,ft[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===on||y.minFilter!==Ks&&y.minFilter!==ui||y.type===Ln&&t.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const k=t.get("EXT_texture_filter_anisotropic");i.texParameterf(T,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Wt(T,y){let k=!1;T.__webglInit===void 0&&(T.__webglInit=!0,y.addEventListener("dispose",L));const Y=y.source;let J=d.get(Y);J===void 0&&(J={},d.set(Y,J));const Z=D(y);if(Z!==T.__cacheKey){J[Z]===void 0&&(J[Z]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,k=!0),J[Z].usedTimes++;const Et=J[T.__cacheKey];Et!==void 0&&(J[T.__cacheKey].usedTimes--,Et.usedTimes===0&&P(y)),T.__cacheKey=Z,T.__webglTexture=J[Z].texture}return k}function Jt(T,y,k){let Y=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(Y=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(Y=i.TEXTURE_3D);const J=Wt(T,y),Z=y.source;e.bindTexture(Y,T.__webglTexture,i.TEXTURE0+k);const Et=n.get(Z);if(Z.version!==Et.__version||J===!0){e.activeTexture(i.TEXTURE0+k);const ht=ae.getPrimaries(ae.workingColorSpace),Mt=y.colorSpace===Gn?null:ae.getPrimaries(y.colorSpace),Qt=y.colorSpace===Gn||ht===Mt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Qt);let nt=v(y.image,!1,s.maxTextureSize);nt=Ct(y,nt);const yt=r.convert(y.format,y.colorSpace),kt=r.convert(y.type);let Ot=S(y.internalFormat,yt,kt,y.colorSpace,y.isVideoTexture);pt(Y,y);let bt;const te=y.mipmaps,Ht=y.isVideoTexture!==!0,ue=Et.__version===void 0||J===!0,I=Z.dataReady,vt=x(y,nt);if(y.isDepthTexture)Ot=M(y.format===es,y.type),ue&&(Ht?e.texStorage2D(i.TEXTURE_2D,1,Ot,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,Ot,nt.width,nt.height,0,yt,kt,null));else if(y.isDataTexture)if(te.length>0){Ht&&ue&&e.texStorage2D(i.TEXTURE_2D,vt,Ot,te[0].width,te[0].height);for(let W=0,j=te.length;W<j;W++)bt=te[W],Ht?I&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,kt,bt.data):e.texImage2D(i.TEXTURE_2D,W,Ot,bt.width,bt.height,0,yt,kt,bt.data);y.generateMipmaps=!1}else Ht?(ue&&e.texStorage2D(i.TEXTURE_2D,vt,Ot,nt.width,nt.height),I&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,nt.width,nt.height,yt,kt,nt.data)):e.texImage2D(i.TEXTURE_2D,0,Ot,nt.width,nt.height,0,yt,kt,nt.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Ht&&ue&&e.texStorage3D(i.TEXTURE_2D_ARRAY,vt,Ot,te[0].width,te[0].height,nt.depth);for(let W=0,j=te.length;W<j;W++)if(bt=te[W],y.format!==pn)if(yt!==null)if(Ht){if(I)if(y.layerUpdates.size>0){const mt=bc(bt.width,bt.height,y.format,y.type);for(const xt of y.layerUpdates){const ee=bt.data.subarray(xt*mt/bt.data.BYTES_PER_ELEMENT,(xt+1)*mt/bt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,xt,bt.width,bt.height,1,yt,ee,0,0)}y.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,bt.width,bt.height,nt.depth,yt,bt.data,0,0)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,W,Ot,bt.width,bt.height,nt.depth,0,bt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ht?I&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,bt.width,bt.height,nt.depth,yt,kt,bt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,W,Ot,bt.width,bt.height,nt.depth,0,yt,kt,bt.data)}else{Ht&&ue&&e.texStorage2D(i.TEXTURE_2D,vt,Ot,te[0].width,te[0].height);for(let W=0,j=te.length;W<j;W++)bt=te[W],y.format!==pn?yt!==null?Ht?I&&e.compressedTexSubImage2D(i.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,bt.data):e.compressedTexImage2D(i.TEXTURE_2D,W,Ot,bt.width,bt.height,0,bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ht?I&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,kt,bt.data):e.texImage2D(i.TEXTURE_2D,W,Ot,bt.width,bt.height,0,yt,kt,bt.data)}else if(y.isDataArrayTexture)if(Ht){if(ue&&e.texStorage3D(i.TEXTURE_2D_ARRAY,vt,Ot,nt.width,nt.height,nt.depth),I)if(y.layerUpdates.size>0){const W=bc(nt.width,nt.height,y.format,y.type);for(const j of y.layerUpdates){const mt=nt.data.subarray(j*W/nt.data.BYTES_PER_ELEMENT,(j+1)*W/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,j,nt.width,nt.height,1,yt,kt,mt)}y.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,yt,kt,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ot,nt.width,nt.height,nt.depth,0,yt,kt,nt.data);else if(y.isData3DTexture)Ht?(ue&&e.texStorage3D(i.TEXTURE_3D,vt,Ot,nt.width,nt.height,nt.depth),I&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,yt,kt,nt.data)):e.texImage3D(i.TEXTURE_3D,0,Ot,nt.width,nt.height,nt.depth,0,yt,kt,nt.data);else if(y.isFramebufferTexture){if(ue)if(Ht)e.texStorage2D(i.TEXTURE_2D,vt,Ot,nt.width,nt.height);else{let W=nt.width,j=nt.height;for(let mt=0;mt<vt;mt++)e.texImage2D(i.TEXTURE_2D,mt,Ot,W,j,0,yt,kt,null),W>>=1,j>>=1}}else if(te.length>0){if(Ht&&ue){const W=_t(te[0]);e.texStorage2D(i.TEXTURE_2D,vt,Ot,W.width,W.height)}for(let W=0,j=te.length;W<j;W++)bt=te[W],Ht?I&&e.texSubImage2D(i.TEXTURE_2D,W,0,0,yt,kt,bt):e.texImage2D(i.TEXTURE_2D,W,Ot,yt,kt,bt);y.generateMipmaps=!1}else if(Ht){if(ue){const W=_t(nt);e.texStorage2D(i.TEXTURE_2D,vt,Ot,W.width,W.height)}I&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,yt,kt,nt)}else e.texImage2D(i.TEXTURE_2D,0,Ot,yt,kt,nt);p(y)&&m(Y),Et.__version=Z.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function $(T,y,k){if(y.image.length!==6)return;const Y=Wt(T,y),J=y.source;e.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+k);const Z=n.get(J);if(J.version!==Z.__version||Y===!0){e.activeTexture(i.TEXTURE0+k);const Et=ae.getPrimaries(ae.workingColorSpace),ht=y.colorSpace===Gn?null:ae.getPrimaries(y.colorSpace),Mt=y.colorSpace===Gn||Et===ht?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt);const Qt=y.isCompressedTexture||y.image[0].isCompressedTexture,nt=y.image[0]&&y.image[0].isDataTexture,yt=[];for(let j=0;j<6;j++)!Qt&&!nt?yt[j]=v(y.image[j],!0,s.maxCubemapSize):yt[j]=nt?y.image[j].image:y.image[j],yt[j]=Ct(y,yt[j]);const kt=yt[0],Ot=r.convert(y.format,y.colorSpace),bt=r.convert(y.type),te=S(y.internalFormat,Ot,bt,y.colorSpace),Ht=y.isVideoTexture!==!0,ue=Z.__version===void 0||Y===!0,I=J.dataReady;let vt=x(y,kt);pt(i.TEXTURE_CUBE_MAP,y);let W;if(Qt){Ht&&ue&&e.texStorage2D(i.TEXTURE_CUBE_MAP,vt,te,kt.width,kt.height);for(let j=0;j<6;j++){W=yt[j].mipmaps;for(let mt=0;mt<W.length;mt++){const xt=W[mt];y.format!==pn?Ot!==null?Ht?I&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt,0,0,xt.width,xt.height,Ot,xt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt,te,xt.width,xt.height,0,xt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ht?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt,0,0,xt.width,xt.height,Ot,bt,xt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt,te,xt.width,xt.height,0,Ot,bt,xt.data)}}}else{if(W=y.mipmaps,Ht&&ue){W.length>0&&vt++;const j=_t(yt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,vt,te,j.width,j.height)}for(let j=0;j<6;j++)if(nt){Ht?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,yt[j].width,yt[j].height,Ot,bt,yt[j].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,te,yt[j].width,yt[j].height,0,Ot,bt,yt[j].data);for(let mt=0;mt<W.length;mt++){const ee=W[mt].image[j].image;Ht?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt+1,0,0,ee.width,ee.height,Ot,bt,ee.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt+1,te,ee.width,ee.height,0,Ot,bt,ee.data)}}else{Ht?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Ot,bt,yt[j]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,te,Ot,bt,yt[j]);for(let mt=0;mt<W.length;mt++){const xt=W[mt];Ht?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt+1,0,0,Ot,bt,xt.image[j]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,mt+1,te,Ot,bt,xt.image[j])}}}p(y)&&m(i.TEXTURE_CUBE_MAP),Z.__version=J.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function et(T,y,k,Y,J,Z){const Et=r.convert(k.format,k.colorSpace),ht=r.convert(k.type),Mt=S(k.internalFormat,Et,ht,k.colorSpace);if(!n.get(y).__hasExternalTextures){const nt=Math.max(1,y.width>>Z),yt=Math.max(1,y.height>>Z);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?e.texImage3D(J,Z,Mt,nt,yt,y.depth,0,Et,ht,null):e.texImage2D(J,Z,Mt,nt,yt,0,Et,ht,null)}e.bindFramebuffer(i.FRAMEBUFFER,T),tt(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Y,J,n.get(k).__webglTexture,0,ot(y)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Y,J,n.get(k).__webglTexture,Z),e.bindFramebuffer(i.FRAMEBUFFER,null)}function St(T,y,k){if(i.bindRenderbuffer(i.RENDERBUFFER,T),y.depthBuffer){const Y=y.depthTexture,J=Y&&Y.isDepthTexture?Y.type:null,Z=M(y.stencilBuffer,J),Et=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ht=ot(y);tt(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht,Z,y.width,y.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht,Z,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,Z,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Et,i.RENDERBUFFER,T)}else{const Y=y.textures;for(let J=0;J<Y.length;J++){const Z=Y[J],Et=r.convert(Z.format,Z.colorSpace),ht=r.convert(Z.type),Mt=S(Z.internalFormat,Et,ht,Z.colorSpace),Qt=ot(y);k&&tt(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Qt,Mt,y.width,y.height):tt(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Qt,Mt,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,Mt,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function dt(T,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,T),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(y.depthTexture).__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),F(y.depthTexture,0);const Y=n.get(y.depthTexture).__webglTexture,J=ot(y);if(y.depthTexture.format===$i)tt(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Y,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Y,0);else if(y.depthTexture.format===es)tt(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Y,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Y,0);else throw new Error("Unknown depthTexture format")}function Ut(T){const y=n.get(T),k=T.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==T.depthTexture){const Y=T.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),Y){const J=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,Y.removeEventListener("dispose",J)};Y.addEventListener("dispose",J),y.__depthDisposeCallback=J}y.__boundDepthTexture=Y}if(T.depthTexture&&!y.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");dt(y.__webglFramebuffer,T)}else if(k){y.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[Y]),y.__webglDepthbuffer[Y]===void 0)y.__webglDepthbuffer[Y]=i.createRenderbuffer(),St(y.__webglDepthbuffer[Y],T,!1);else{const J=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=y.__webglDepthbuffer[Y];i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,Z)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),St(y.__webglDepthbuffer,T,!1);else{const Y=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,J=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,J),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,J)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function It(T,y,k){const Y=n.get(T);y!==void 0&&et(Y.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&Ut(T)}function Bt(T){const y=T.texture,k=n.get(T),Y=n.get(y);T.addEventListener("dispose",E);const J=T.textures,Z=T.isWebGLCubeRenderTarget===!0,Et=J.length>1;if(Et||(Y.__webglTexture===void 0&&(Y.__webglTexture=i.createTexture()),Y.__version=y.version,o.memory.textures++),Z){k.__webglFramebuffer=[];for(let ht=0;ht<6;ht++)if(y.mipmaps&&y.mipmaps.length>0){k.__webglFramebuffer[ht]=[];for(let Mt=0;Mt<y.mipmaps.length;Mt++)k.__webglFramebuffer[ht][Mt]=i.createFramebuffer()}else k.__webglFramebuffer[ht]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){k.__webglFramebuffer=[];for(let ht=0;ht<y.mipmaps.length;ht++)k.__webglFramebuffer[ht]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(Et)for(let ht=0,Mt=J.length;ht<Mt;ht++){const Qt=n.get(J[ht]);Qt.__webglTexture===void 0&&(Qt.__webglTexture=i.createTexture(),o.memory.textures++)}if(T.samples>0&&tt(T)===!1){k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let ht=0;ht<J.length;ht++){const Mt=J[ht];k.__webglColorRenderbuffer[ht]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[ht]);const Qt=r.convert(Mt.format,Mt.colorSpace),nt=r.convert(Mt.type),yt=S(Mt.internalFormat,Qt,nt,Mt.colorSpace,T.isXRRenderTarget===!0),kt=ot(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,kt,yt,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.RENDERBUFFER,k.__webglColorRenderbuffer[ht])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),St(k.__webglDepthRenderbuffer,T,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Z){e.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),pt(i.TEXTURE_CUBE_MAP,y);for(let ht=0;ht<6;ht++)if(y.mipmaps&&y.mipmaps.length>0)for(let Mt=0;Mt<y.mipmaps.length;Mt++)et(k.__webglFramebuffer[ht][Mt],T,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Mt);else et(k.__webglFramebuffer[ht],T,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0);p(y)&&m(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Et){for(let ht=0,Mt=J.length;ht<Mt;ht++){const Qt=J[ht],nt=n.get(Qt);e.bindTexture(i.TEXTURE_2D,nt.__webglTexture),pt(i.TEXTURE_2D,Qt),et(k.__webglFramebuffer,T,Qt,i.COLOR_ATTACHMENT0+ht,i.TEXTURE_2D,0),p(Qt)&&m(i.TEXTURE_2D)}e.unbindTexture()}else{let ht=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ht=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ht,Y.__webglTexture),pt(ht,y),y.mipmaps&&y.mipmaps.length>0)for(let Mt=0;Mt<y.mipmaps.length;Mt++)et(k.__webglFramebuffer[Mt],T,y,i.COLOR_ATTACHMENT0,ht,Mt);else et(k.__webglFramebuffer,T,y,i.COLOR_ATTACHMENT0,ht,0);p(y)&&m(ht),e.unbindTexture()}T.depthBuffer&&Ut(T)}function Zt(T){const y=T.textures;for(let k=0,Y=y.length;k<Y;k++){const J=y[k];if(p(J)){const Z=T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,Et=n.get(J).__webglTexture;e.bindTexture(Z,Et),m(Z),e.unbindTexture()}}}const K=[],R=[];function at(T){if(T.samples>0){if(tt(T)===!1){const y=T.textures,k=T.width,Y=T.height;let J=i.COLOR_BUFFER_BIT;const Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Et=n.get(T),ht=y.length>1;if(ht)for(let Mt=0;Mt<y.length;Mt++)e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Et.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Et.__webglFramebuffer);for(let Mt=0;Mt<y.length;Mt++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),ht){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Et.__webglColorRenderbuffer[Mt]);const Qt=n.get(y[Mt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Qt,0)}i.blitFramebuffer(0,0,k,Y,0,0,k,Y,J,i.NEAREST),l===!0&&(K.length=0,R.length=0,K.push(i.COLOR_ATTACHMENT0+Mt),T.depthBuffer&&T.resolveDepthBuffer===!1&&(K.push(Z),R.push(Z),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,R)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,K))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ht)for(let Mt=0;Mt<y.length;Mt++){e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.RENDERBUFFER,Et.__webglColorRenderbuffer[Mt]);const Qt=n.get(y[Mt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.TEXTURE_2D,Qt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Et.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const y=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function ot(T){return Math.min(s.maxSamples,T.samples)}function tt(T){const y=n.get(T);return T.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function lt(T){const y=o.render.frame;h.get(T)!==y&&(h.set(T,y),T.update())}function Ct(T,y){const k=T.colorSpace,Y=T.format,J=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||k!==Yn&&k!==Gn&&(ae.getTransfer(k)===fe?(Y!==pn||J!==Un)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),y}function _t(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=b,this.setTexture2D=F,this.setTexture2DArray=X,this.setTexture3D=O,this.setTextureCube=Q,this.rebindTextures=It,this.setupRenderTarget=Bt,this.updateRenderTargetMipmap=Zt,this.updateMultisampleRenderTarget=at,this.setupDepthRenderbuffer=Ut,this.setupFrameBufferTexture=et,this.useMultisampledRTT=tt}function sg(i,t){function e(n,s=Gn){let r;const o=ae.getTransfer(s);if(n===Un)return i.UNSIGNED_BYTE;if(n===tl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===el)return i.UNSIGNED_SHORT_5_5_5_1;if(n===jc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Kc)return i.BYTE;if(n===Jc)return i.SHORT;if(n===Os)return i.UNSIGNED_SHORT;if(n===Qa)return i.INT;if(n===fi)return i.UNSIGNED_INT;if(n===Ln)return i.FLOAT;if(n===Xs)return i.HALF_FLOAT;if(n===Qc)return i.ALPHA;if(n===th)return i.RGB;if(n===pn)return i.RGBA;if(n===eh)return i.LUMINANCE;if(n===nh)return i.LUMINANCE_ALPHA;if(n===$i)return i.DEPTH_COMPONENT;if(n===es)return i.DEPTH_STENCIL;if(n===ih)return i.RED;if(n===nl)return i.RED_INTEGER;if(n===sh)return i.RG;if(n===il)return i.RG_INTEGER;if(n===sl)return i.RGBA_INTEGER;if(n===Cr||n===Pr||n===Lr||n===Ir)if(o===fe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Cr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Pr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Lr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Cr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Pr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Lr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ir)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ga||n===_a||n===va||n===xa)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ga)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===_a)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===va)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===xa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ma||n===ya||n===Sa)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ma||n===ya)return o===fe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Sa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ba||n===wa||n===Ea||n===Ta||n===Aa||n===Ra||n===Ca||n===Pa||n===La||n===Ia||n===Ua||n===Da||n===Na||n===Fa)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ba)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===wa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ea)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ta)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Aa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ra)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ca)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Pa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===La)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ia)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ua)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Da)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Na)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Fa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ur||n===ka||n===Oa)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Ur)return o===fe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ka)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Oa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===rh||n===Ba||n===za||n===Ha)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ur)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ba)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===za)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ha)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ts?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class rg extends ze{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Se extends Ne{constructor(){super(),this.isGroup=!0,this.type="Group"}}const og={type:"move"};class zo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Se,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Se,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Se,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const v of t.hand.values()){const p=e.getJointPose(v,n),m=this._getHandJoint(c,v);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(og)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Se;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const ag=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,lg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class cg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new Ge,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new $n({vertexShader:ag,fragmentShader:lg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new q(new vi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class hg extends rs{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null;const v=new cg,p=e.getContextAttributes();let m=null,S=null;const M=[],x=[],L=new it;let E=null;const A=new ze;A.layers.enable(1),A.viewport=new Me;const P=new ze;P.layers.enable(2),P.viewport=new Me;const V=[A,P],_=new rg;_.layers.enable(1),_.layers.enable(2);let b=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let et=M[$];return et===void 0&&(et=new zo,M[$]=et),et.getTargetRaySpace()},this.getControllerGrip=function($){let et=M[$];return et===void 0&&(et=new zo,M[$]=et),et.getGripSpace()},this.getHand=function($){let et=M[$];return et===void 0&&(et=new zo,M[$]=et),et.getHandSpace()};function D($){const et=x.indexOf($.inputSource);if(et===-1)return;const St=M[et];St!==void 0&&(St.update($.inputSource,$.frame,c||o),St.dispatchEvent({type:$.type,data:$.inputSource}))}function F(){s.removeEventListener("select",D),s.removeEventListener("selectstart",D),s.removeEventListener("selectend",D),s.removeEventListener("squeeze",D),s.removeEventListener("squeezestart",D),s.removeEventListener("squeezeend",D),s.removeEventListener("end",F),s.removeEventListener("inputsourceschange",X);for(let $=0;$<M.length;$++){const et=x[$];et!==null&&(x[$]=null,M[$].disconnect(et))}b=null,B=null,v.reset(),t.setRenderTarget(m),f=null,d=null,u=null,s=null,S=null,Jt.stop(),n.isPresenting=!1,t.setPixelRatio(E),t.setSize(L.width,L.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function($){if(s=$,s!==null){if(m=t.getRenderTarget(),s.addEventListener("select",D),s.addEventListener("selectstart",D),s.addEventListener("selectend",D),s.addEventListener("squeeze",D),s.addEventListener("squeezestart",D),s.addEventListener("squeezeend",D),s.addEventListener("end",F),s.addEventListener("inputsourceschange",X),p.xrCompatible!==!0&&await e.makeXRCompatible(),E=t.getPixelRatio(),t.getSize(L),s.renderState.layers===void 0){const et={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,et),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),S=new pi(f.framebufferWidth,f.framebufferHeight,{format:pn,type:Un,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil})}else{let et=null,St=null,dt=null;p.depth&&(dt=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=p.stencil?es:$i,St=p.stencil?ts:fi);const Ut={colorFormat:e.RGBA8,depthFormat:dt,scaleFactor:r};u=new XRWebGLBinding(s,e),d=u.createProjectionLayer(Ut),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),S=new pi(d.textureWidth,d.textureHeight,{format:pn,type:Un,depthTexture:new Mh(d.textureWidth,d.textureHeight,St,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Jt.setContext(s),Jt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function X($){for(let et=0;et<$.removed.length;et++){const St=$.removed[et],dt=x.indexOf(St);dt>=0&&(x[dt]=null,M[dt].disconnect(St))}for(let et=0;et<$.added.length;et++){const St=$.added[et];let dt=x.indexOf(St);if(dt===-1){for(let It=0;It<M.length;It++)if(It>=x.length){x.push(St),dt=It;break}else if(x[It]===null){x[It]=St,dt=It;break}if(dt===-1)break}const Ut=M[dt];Ut&&Ut.connect(St)}}const O=new C,Q=new C;function G($,et,St){O.setFromMatrixPosition(et.matrixWorld),Q.setFromMatrixPosition(St.matrixWorld);const dt=O.distanceTo(Q),Ut=et.projectionMatrix.elements,It=St.projectionMatrix.elements,Bt=Ut[14]/(Ut[10]-1),Zt=Ut[14]/(Ut[10]+1),K=(Ut[9]+1)/Ut[5],R=(Ut[9]-1)/Ut[5],at=(Ut[8]-1)/Ut[0],ot=(It[8]+1)/It[0],tt=Bt*at,lt=Bt*ot,Ct=dt/(-at+ot),_t=Ct*-at;if(et.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(_t),$.translateZ(Ct),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),Ut[10]===-1)$.projectionMatrix.copy(et.projectionMatrix),$.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{const T=Bt+Ct,y=Zt+Ct,k=tt-_t,Y=lt+(dt-_t),J=K*Zt/y*T,Z=R*Zt/y*T;$.projectionMatrix.makePerspective(k,Y,J,Z,T,y),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function ct($,et){et===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(et.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(s===null)return;let et=$.near,St=$.far;v.texture!==null&&(v.depthNear>0&&(et=v.depthNear),v.depthFar>0&&(St=v.depthFar)),_.near=P.near=A.near=et,_.far=P.far=A.far=St,(b!==_.near||B!==_.far)&&(s.updateRenderState({depthNear:_.near,depthFar:_.far}),b=_.near,B=_.far);const dt=$.parent,Ut=_.cameras;ct(_,dt);for(let It=0;It<Ut.length;It++)ct(Ut[It],dt);Ut.length===2?G(_,A,P):_.projectionMatrix.copy(A.projectionMatrix),ft($,_,dt)};function ft($,et,St){St===null?$.matrix.copy(et.matrixWorld):($.matrix.copy(St.matrixWorld),$.matrix.invert(),$.matrix.multiply(et.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(et.projectionMatrix),$.projectionMatrixInverse.copy(et.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=Bs*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function($){l=$,d!==null&&(d.fixedFoveation=$),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=$)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(_)};let pt=null;function Wt($,et){if(h=et.getViewerPose(c||o),g=et,h!==null){const St=h.views;f!==null&&(t.setRenderTargetFramebuffer(S,f.framebuffer),t.setRenderTarget(S));let dt=!1;St.length!==_.cameras.length&&(_.cameras.length=0,dt=!0);for(let It=0;It<St.length;It++){const Bt=St[It];let Zt=null;if(f!==null)Zt=f.getViewport(Bt);else{const R=u.getViewSubImage(d,Bt);Zt=R.viewport,It===0&&(t.setRenderTargetTextures(S,R.colorTexture,d.ignoreDepthValues?void 0:R.depthStencilTexture),t.setRenderTarget(S))}let K=V[It];K===void 0&&(K=new ze,K.layers.enable(It),K.viewport=new Me,V[It]=K),K.matrix.fromArray(Bt.transform.matrix),K.matrix.decompose(K.position,K.quaternion,K.scale),K.projectionMatrix.fromArray(Bt.projectionMatrix),K.projectionMatrixInverse.copy(K.projectionMatrix).invert(),K.viewport.set(Zt.x,Zt.y,Zt.width,Zt.height),It===0&&(_.matrix.copy(K.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),dt===!0&&_.cameras.push(K)}const Ut=s.enabledFeatures;if(Ut&&Ut.includes("depth-sensing")){const It=u.getDepthInformation(St[0]);It&&It.isValid&&It.texture&&v.init(t,It,s.renderState)}}for(let St=0;St<M.length;St++){const dt=x[St],Ut=M[St];dt!==null&&Ut!==void 0&&Ut.update(dt,et,c||o)}pt&&pt($,et),et.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:et}),g=null}const Jt=new vh;Jt.setAnimationLoop(Wt),this.setAnimationLoop=function($){pt=$},this.dispose=function(){}}}const ei=new gn,ug=new pe;function dg(i,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,mh(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,S,M,x){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(p,m):m.isMeshToonMaterial?(r(p,m),u(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m)):m.isMeshStandardMaterial?(r(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,x)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),v(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,S,M):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Ze&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Ze&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);const S=t.get(m),M=S.envMap,x=S.envMapRotation;M&&(p.envMap.value=M,ei.copy(x),ei.x*=-1,ei.y*=-1,ei.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(ei.y*=-1,ei.z*=-1),p.envMapRotation.value.setFromMatrix4(ug.makeRotationFromEuler(ei)),p.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,S,M){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*S,p.scale.value=M*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,S){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Ze&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=S.texture,p.transmissionSamplerSize.value.set(S.width,S.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function v(p,m){const S=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(S.matrixWorld),p.nearDistance.value=S.shadow.camera.near,p.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function fg(i,t,e,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,M){const x=M.program;n.uniformBlockBinding(S,x)}function c(S,M){let x=s[S.id];x===void 0&&(g(S),x=h(S),s[S.id]=x,S.addEventListener("dispose",p));const L=M.program;n.updateUBOMapping(S,L);const E=t.render.frame;r[S.id]!==E&&(d(S),r[S.id]=E)}function h(S){const M=u();S.__bindingPointIndex=M;const x=i.createBuffer(),L=S.__size,E=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,x),i.bufferData(i.UNIFORM_BUFFER,L,E),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,x),x}function u(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(S){const M=s[S.id],x=S.uniforms,L=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let E=0,A=x.length;E<A;E++){const P=Array.isArray(x[E])?x[E]:[x[E]];for(let V=0,_=P.length;V<_;V++){const b=P[V];if(f(b,E,V,L)===!0){const B=b.__offset,D=Array.isArray(b.value)?b.value:[b.value];let F=0;for(let X=0;X<D.length;X++){const O=D[X],Q=v(O);typeof O=="number"||typeof O=="boolean"?(b.__data[0]=O,i.bufferSubData(i.UNIFORM_BUFFER,B+F,b.__data)):O.isMatrix3?(b.__data[0]=O.elements[0],b.__data[1]=O.elements[1],b.__data[2]=O.elements[2],b.__data[3]=0,b.__data[4]=O.elements[3],b.__data[5]=O.elements[4],b.__data[6]=O.elements[5],b.__data[7]=0,b.__data[8]=O.elements[6],b.__data[9]=O.elements[7],b.__data[10]=O.elements[8],b.__data[11]=0):(O.toArray(b.__data,F),F+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,B,b.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(S,M,x,L){const E=S.value,A=M+"_"+x;if(L[A]===void 0)return typeof E=="number"||typeof E=="boolean"?L[A]=E:L[A]=E.clone(),!0;{const P=L[A];if(typeof E=="number"||typeof E=="boolean"){if(P!==E)return L[A]=E,!0}else if(P.equals(E)===!1)return P.copy(E),!0}return!1}function g(S){const M=S.uniforms;let x=0;const L=16;for(let A=0,P=M.length;A<P;A++){const V=Array.isArray(M[A])?M[A]:[M[A]];for(let _=0,b=V.length;_<b;_++){const B=V[_],D=Array.isArray(B.value)?B.value:[B.value];for(let F=0,X=D.length;F<X;F++){const O=D[F],Q=v(O),G=x%L,ct=G%Q.boundary,ft=G+ct;x+=ct,ft!==0&&L-ft<Q.storage&&(x+=L-ft),B.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=x,x+=Q.storage}}}const E=x%L;return E>0&&(x+=L-E),S.__size=x,S.__cache={},this}function v(S){const M={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(M.boundary=4,M.storage=4):S.isVector2?(M.boundary=8,M.storage=8):S.isVector3||S.isColor?(M.boundary=16,M.storage=12):S.isVector4?(M.boundary=16,M.storage=16):S.isMatrix3?(M.boundary=48,M.storage=48):S.isMatrix4?(M.boundary=64,M.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),M}function p(S){const M=S.target;M.removeEventListener("dispose",p);const x=o.indexOf(M.__bindingPointIndex);o.splice(x,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function m(){for(const S in s)i.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:m}}class Eh{constructor(t={}){const{canvas:e=td(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const f=new Uint32Array(4),g=new Int32Array(4);let v=null,p=null;const m=[],S=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=tn,this.toneMapping=Xn,this.toneMappingExposure=1;const M=this;let x=!1,L=0,E=0,A=null,P=-1,V=null;const _=new Me,b=new Me;let B=null;const D=new Gt(0);let F=0,X=e.width,O=e.height,Q=1,G=null,ct=null;const ft=new Me(0,0,X,O),pt=new Me(0,0,X,O);let Wt=!1;const Jt=new ll;let $=!1,et=!1;const St=new pe,dt=new pe,Ut=new C,It=new Me,Bt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Zt=!1;function K(){return A===null?Q:1}let R=n;function at(w,U){return e.getContext(w,U)}try{const w={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${ja}`),e.addEventListener("webglcontextlost",j,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",xt,!1),R===null){const U="webgl2";if(R=at(U,w),R===null)throw at(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let ot,tt,lt,Ct,_t,T,y,k,Y,J,Z,Et,ht,Mt,Qt,nt,yt,kt,Ot,bt,te,Ht,ue,I;function vt(){ot=new xm(R),ot.init(),Ht=new sg(R,ot),tt=new fm(R,ot,t,Ht),lt=new eg(R),tt.reverseDepthBuffer&&lt.buffers.depth.setReversed(!0),Ct=new Sm(R),_t=new z0,T=new ig(R,ot,lt,_t,tt,Ht,Ct),y=new mm(M),k=new vm(M),Y=new Rd(R),ue=new um(R,Y),J=new Mm(R,Y,Ct,ue),Z=new wm(R,J,Y,Ct),Ot=new bm(R,tt,T),nt=new pm(_t),Et=new B0(M,y,k,ot,tt,ue,nt),ht=new dg(M,_t),Mt=new V0,Qt=new Y0(ot),kt=new hm(M,y,k,lt,Z,d,l),yt=new Q0(M,Z,tt),I=new fg(R,Ct,tt,lt),bt=new dm(R,ot,Ct),te=new ym(R,ot,Ct),Ct.programs=Et.programs,M.capabilities=tt,M.extensions=ot,M.properties=_t,M.renderLists=Mt,M.shadowMap=yt,M.state=lt,M.info=Ct}vt();const W=new hg(M,R);this.xr=W,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){const w=ot.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=ot.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(w){w!==void 0&&(Q=w,this.setSize(X,O,!1))},this.getSize=function(w){return w.set(X,O)},this.setSize=function(w,U,z=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=w,O=U,e.width=Math.floor(w*Q),e.height=Math.floor(U*Q),z===!0&&(e.style.width=w+"px",e.style.height=U+"px"),this.setViewport(0,0,w,U)},this.getDrawingBufferSize=function(w){return w.set(X*Q,O*Q).floor()},this.setDrawingBufferSize=function(w,U,z){X=w,O=U,Q=z,e.width=Math.floor(w*z),e.height=Math.floor(U*z),this.setViewport(0,0,w,U)},this.getCurrentViewport=function(w){return w.copy(_)},this.getViewport=function(w){return w.copy(ft)},this.setViewport=function(w,U,z,H){w.isVector4?ft.set(w.x,w.y,w.z,w.w):ft.set(w,U,z,H),lt.viewport(_.copy(ft).multiplyScalar(Q).round())},this.getScissor=function(w){return w.copy(pt)},this.setScissor=function(w,U,z,H){w.isVector4?pt.set(w.x,w.y,w.z,w.w):pt.set(w,U,z,H),lt.scissor(b.copy(pt).multiplyScalar(Q).round())},this.getScissorTest=function(){return Wt},this.setScissorTest=function(w){lt.setScissorTest(Wt=w)},this.setOpaqueSort=function(w){G=w},this.setTransparentSort=function(w){ct=w},this.getClearColor=function(w){return w.copy(kt.getClearColor())},this.setClearColor=function(){kt.setClearColor.apply(kt,arguments)},this.getClearAlpha=function(){return kt.getClearAlpha()},this.setClearAlpha=function(){kt.setClearAlpha.apply(kt,arguments)},this.clear=function(w=!0,U=!0,z=!0){let H=0;if(w){let N=!1;if(A!==null){const st=A.texture.format;N=st===sl||st===il||st===nl}if(N){const st=A.texture.type,gt=st===Un||st===fi||st===Os||st===ts||st===tl||st===el,wt=kt.getClearColor(),Tt=kt.getClearAlpha(),Dt=wt.r,Nt=wt.g,At=wt.b;gt?(f[0]=Dt,f[1]=Nt,f[2]=At,f[3]=Tt,R.clearBufferuiv(R.COLOR,0,f)):(g[0]=Dt,g[1]=Nt,g[2]=At,g[3]=Tt,R.clearBufferiv(R.COLOR,0,g))}else H|=R.COLOR_BUFFER_BIT}U&&(H|=R.DEPTH_BUFFER_BIT,R.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),z&&(H|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",j,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",xt,!1),Mt.dispose(),Qt.dispose(),_t.dispose(),y.dispose(),k.dispose(),Z.dispose(),ue.dispose(),I.dispose(),Et.dispose(),W.dispose(),W.removeEventListener("sessionstart",yl),W.removeEventListener("sessionend",Sl),Zn.stop()};function j(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),x=!0}function mt(){console.log("THREE.WebGLRenderer: Context Restored."),x=!1;const w=Ct.autoReset,U=yt.enabled,z=yt.autoUpdate,H=yt.needsUpdate,N=yt.type;vt(),Ct.autoReset=w,yt.enabled=U,yt.autoUpdate=z,yt.needsUpdate=H,yt.type=N}function xt(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function ee(w){const U=w.target;U.removeEventListener("dispose",ee),be(U)}function be(w){We(w),_t.remove(w)}function We(w){const U=_t.get(w).programs;U!==void 0&&(U.forEach(function(z){Et.releaseProgram(z)}),w.isShaderMaterial&&Et.releaseShaderCache(w))}this.renderBufferDirect=function(w,U,z,H,N,st){U===null&&(U=Bt);const gt=N.isMesh&&N.matrixWorld.determinant()<0,wt=$h(w,U,z,H,N);lt.setMaterial(H,gt);let Tt=z.index,Dt=1;if(H.wireframe===!0){if(Tt=J.getWireframeAttribute(z),Tt===void 0)return;Dt=2}const Nt=z.drawRange,At=z.attributes.position;let le=Nt.start*Dt,de=(Nt.start+Nt.count)*Dt;st!==null&&(le=Math.max(le,st.start*Dt),de=Math.min(de,(st.start+st.count)*Dt)),Tt!==null?(le=Math.max(le,0),de=Math.min(de,Tt.count)):At!=null&&(le=Math.max(le,0),de=Math.min(de,At.count));const ve=de-le;if(ve<0||ve===1/0)return;ue.setup(N,H,wt,z,Tt);let Ke,re=bt;if(Tt!==null&&(Ke=Y.get(Tt),re=te,re.setIndex(Ke)),N.isMesh)H.wireframe===!0?(lt.setLineWidth(H.wireframeLinewidth*K()),re.setMode(R.LINES)):re.setMode(R.TRIANGLES);else if(N.isLine){let Pt=H.linewidth;Pt===void 0&&(Pt=1),lt.setLineWidth(Pt*K()),N.isLineSegments?re.setMode(R.LINES):N.isLineLoop?re.setMode(R.LINE_LOOP):re.setMode(R.LINE_STRIP)}else N.isPoints?re.setMode(R.POINTS):N.isSprite&&re.setMode(R.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)re.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(ot.get("WEBGL_multi_draw"))re.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Pt=N._multiDrawStarts,ke=N._multiDrawCounts,oe=N._multiDrawCount,an=Tt?Y.get(Tt).bytesPerElement:1,yi=_t.get(H).currentProgram.getUniforms();for(let Je=0;Je<oe;Je++)yi.setValue(R,"_gl_DrawID",Je),re.render(Pt[Je]/an,ke[Je])}else if(N.isInstancedMesh)re.renderInstances(le,ve,N.count);else if(z.isInstancedBufferGeometry){const Pt=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,ke=Math.min(z.instanceCount,Pt);re.renderInstances(le,ve,ke)}else re.render(le,ve)};function ie(w,U,z){w.transparent===!0&&w.side===Ye&&w.forceSinglePass===!1?(w.side=Ze,w.needsUpdate=!0,Zs(w,U,z),w.side=qn,w.needsUpdate=!0,Zs(w,U,z),w.side=Ye):Zs(w,U,z)}this.compile=function(w,U,z=null){z===null&&(z=w),p=Qt.get(z),p.init(U),S.push(p),z.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),w!==z&&w.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),p.setupLights();const H=new Set;return w.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const st=N.material;if(st)if(Array.isArray(st))for(let gt=0;gt<st.length;gt++){const wt=st[gt];ie(wt,z,N),H.add(wt)}else ie(st,z,N),H.add(st)}),S.pop(),p=null,H},this.compileAsync=function(w,U,z=null){const H=this.compile(w,U,z);return new Promise(N=>{function st(){if(H.forEach(function(gt){_t.get(gt).currentProgram.isReady()&&H.delete(gt)}),H.size===0){N(w);return}setTimeout(st,10)}ot.get("KHR_parallel_shader_compile")!==null?st():setTimeout(st,10)})};let Xe=null;function bn(w){Xe&&Xe(w)}function yl(){Zn.stop()}function Sl(){Zn.start()}const Zn=new vh;Zn.setAnimationLoop(bn),typeof self<"u"&&Zn.setContext(self),this.setAnimationLoop=function(w){Xe=w,W.setAnimationLoop(w),w===null?Zn.stop():Zn.start()},W.addEventListener("sessionstart",yl),W.addEventListener("sessionend",Sl),this.render=function(w,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(x===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(U),U=W.getCamera()),w.isScene===!0&&w.onBeforeRender(M,w,U,A),p=Qt.get(w,S.length),p.init(U),S.push(p),dt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Jt.setFromProjectionMatrix(dt),et=this.localClippingEnabled,$=nt.init(this.clippingPlanes,et),v=Mt.get(w,m.length),v.init(),m.push(v),W.enabled===!0&&W.isPresenting===!0){const st=M.xr.getDepthSensingMesh();st!==null&&ao(st,U,-1/0,M.sortObjects)}ao(w,U,0,M.sortObjects),v.finish(),M.sortObjects===!0&&v.sort(G,ct),Zt=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,Zt&&kt.addToRenderList(v,w),this.info.render.frame++,$===!0&&nt.beginShadows();const z=p.state.shadowsArray;yt.render(z,w,U),$===!0&&nt.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=v.opaque,N=v.transmissive;if(p.setupLights(),U.isArrayCamera){const st=U.cameras;if(N.length>0)for(let gt=0,wt=st.length;gt<wt;gt++){const Tt=st[gt];wl(H,N,w,Tt)}Zt&&kt.render(w);for(let gt=0,wt=st.length;gt<wt;gt++){const Tt=st[gt];bl(v,w,Tt,Tt.viewport)}}else N.length>0&&wl(H,N,w,U),Zt&&kt.render(w),bl(v,w,U);A!==null&&(T.updateMultisampleRenderTarget(A),T.updateRenderTargetMipmap(A)),w.isScene===!0&&w.onAfterRender(M,w,U),ue.resetDefaultState(),P=-1,V=null,S.pop(),S.length>0?(p=S[S.length-1],$===!0&&nt.setGlobalState(M.clippingPlanes,p.state.camera)):p=null,m.pop(),m.length>0?v=m[m.length-1]:v=null};function ao(w,U,z,H){if(w.visible===!1)return;if(w.layers.test(U.layers)){if(w.isGroup)z=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(U);else if(w.isLight)p.pushLight(w),w.castShadow&&p.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||Jt.intersectsSprite(w)){H&&It.setFromMatrixPosition(w.matrixWorld).applyMatrix4(dt);const gt=Z.update(w),wt=w.material;wt.visible&&v.push(w,gt,wt,z,It.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||Jt.intersectsObject(w))){const gt=Z.update(w),wt=w.material;if(H&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),It.copy(w.boundingSphere.center)):(gt.boundingSphere===null&&gt.computeBoundingSphere(),It.copy(gt.boundingSphere.center)),It.applyMatrix4(w.matrixWorld).applyMatrix4(dt)),Array.isArray(wt)){const Tt=gt.groups;for(let Dt=0,Nt=Tt.length;Dt<Nt;Dt++){const At=Tt[Dt],le=wt[At.materialIndex];le&&le.visible&&v.push(w,gt,le,z,It.z,At)}}else wt.visible&&v.push(w,gt,wt,z,It.z,null)}}const st=w.children;for(let gt=0,wt=st.length;gt<wt;gt++)ao(st[gt],U,z,H)}function bl(w,U,z,H){const N=w.opaque,st=w.transmissive,gt=w.transparent;p.setupLightsView(z),$===!0&&nt.setGlobalState(M.clippingPlanes,z),H&&lt.viewport(_.copy(H)),N.length>0&&Ys(N,U,z),st.length>0&&Ys(st,U,z),gt.length>0&&Ys(gt,U,z),lt.buffers.depth.setTest(!0),lt.buffers.depth.setMask(!0),lt.buffers.color.setMask(!0),lt.setPolygonOffset(!1)}function wl(w,U,z,H){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[H.id]===void 0&&(p.state.transmissionRenderTarget[H.id]=new pi(1,1,{generateMipmaps:!0,type:ot.has("EXT_color_buffer_half_float")||ot.has("EXT_color_buffer_float")?Xs:Un,minFilter:ui,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ae.workingColorSpace}));const st=p.state.transmissionRenderTarget[H.id],gt=H.viewport||_;st.setSize(gt.z,gt.w);const wt=M.getRenderTarget();M.setRenderTarget(st),M.getClearColor(D),F=M.getClearAlpha(),F<1&&M.setClearColor(16777215,.5),M.clear(),Zt&&kt.render(z);const Tt=M.toneMapping;M.toneMapping=Xn;const Dt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),p.setupLightsView(H),$===!0&&nt.setGlobalState(M.clippingPlanes,H),Ys(w,z,H),T.updateMultisampleRenderTarget(st),T.updateRenderTargetMipmap(st),ot.has("WEBGL_multisampled_render_to_texture")===!1){let Nt=!1;for(let At=0,le=U.length;At<le;At++){const de=U[At],ve=de.object,Ke=de.geometry,re=de.material,Pt=de.group;if(re.side===Ye&&ve.layers.test(H.layers)){const ke=re.side;re.side=Ze,re.needsUpdate=!0,El(ve,z,H,Ke,re,Pt),re.side=ke,re.needsUpdate=!0,Nt=!0}}Nt===!0&&(T.updateMultisampleRenderTarget(st),T.updateRenderTargetMipmap(st))}M.setRenderTarget(wt),M.setClearColor(D,F),Dt!==void 0&&(H.viewport=Dt),M.toneMapping=Tt}function Ys(w,U,z){const H=U.isScene===!0?U.overrideMaterial:null;for(let N=0,st=w.length;N<st;N++){const gt=w[N],wt=gt.object,Tt=gt.geometry,Dt=H===null?gt.material:H,Nt=gt.group;wt.layers.test(z.layers)&&El(wt,U,z,Tt,Dt,Nt)}}function El(w,U,z,H,N,st){w.onBeforeRender(M,U,z,H,N,st),w.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),N.onBeforeRender(M,U,z,H,w,st),N.transparent===!0&&N.side===Ye&&N.forceSinglePass===!1?(N.side=Ze,N.needsUpdate=!0,M.renderBufferDirect(z,U,H,N,w,st),N.side=qn,N.needsUpdate=!0,M.renderBufferDirect(z,U,H,N,w,st),N.side=Ye):M.renderBufferDirect(z,U,H,N,w,st),w.onAfterRender(M,U,z,H,N,st)}function Zs(w,U,z){U.isScene!==!0&&(U=Bt);const H=_t.get(w),N=p.state.lights,st=p.state.shadowsArray,gt=N.state.version,wt=Et.getParameters(w,N.state,st,U,z),Tt=Et.getProgramCacheKey(wt);let Dt=H.programs;H.environment=w.isMeshStandardMaterial?U.environment:null,H.fog=U.fog,H.envMap=(w.isMeshStandardMaterial?k:y).get(w.envMap||H.environment),H.envMapRotation=H.environment!==null&&w.envMap===null?U.environmentRotation:w.envMapRotation,Dt===void 0&&(w.addEventListener("dispose",ee),Dt=new Map,H.programs=Dt);let Nt=Dt.get(Tt);if(Nt!==void 0){if(H.currentProgram===Nt&&H.lightsStateVersion===gt)return Al(w,wt),Nt}else wt.uniforms=Et.getUniforms(w),w.onBeforeCompile(wt,M),Nt=Et.acquireProgram(wt,Tt),Dt.set(Tt,Nt),H.uniforms=wt.uniforms;const At=H.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(At.clippingPlanes=nt.uniform),Al(w,wt),H.needsLights=Zh(w),H.lightsStateVersion=gt,H.needsLights&&(At.ambientLightColor.value=N.state.ambient,At.lightProbe.value=N.state.probe,At.directionalLights.value=N.state.directional,At.directionalLightShadows.value=N.state.directionalShadow,At.spotLights.value=N.state.spot,At.spotLightShadows.value=N.state.spotShadow,At.rectAreaLights.value=N.state.rectArea,At.ltc_1.value=N.state.rectAreaLTC1,At.ltc_2.value=N.state.rectAreaLTC2,At.pointLights.value=N.state.point,At.pointLightShadows.value=N.state.pointShadow,At.hemisphereLights.value=N.state.hemi,At.directionalShadowMap.value=N.state.directionalShadowMap,At.directionalShadowMatrix.value=N.state.directionalShadowMatrix,At.spotShadowMap.value=N.state.spotShadowMap,At.spotLightMatrix.value=N.state.spotLightMatrix,At.spotLightMap.value=N.state.spotLightMap,At.pointShadowMap.value=N.state.pointShadowMap,At.pointShadowMatrix.value=N.state.pointShadowMatrix),H.currentProgram=Nt,H.uniformsList=null,Nt}function Tl(w){if(w.uniformsList===null){const U=w.currentProgram.getUniforms();w.uniformsList=Nr.seqWithValue(U.seq,w.uniforms)}return w.uniformsList}function Al(w,U){const z=_t.get(w);z.outputColorSpace=U.outputColorSpace,z.batching=U.batching,z.batchingColor=U.batchingColor,z.instancing=U.instancing,z.instancingColor=U.instancingColor,z.instancingMorph=U.instancingMorph,z.skinning=U.skinning,z.morphTargets=U.morphTargets,z.morphNormals=U.morphNormals,z.morphColors=U.morphColors,z.morphTargetsCount=U.morphTargetsCount,z.numClippingPlanes=U.numClippingPlanes,z.numIntersection=U.numClipIntersection,z.vertexAlphas=U.vertexAlphas,z.vertexTangents=U.vertexTangents,z.toneMapping=U.toneMapping}function $h(w,U,z,H,N){U.isScene!==!0&&(U=Bt),T.resetTextureUnits();const st=U.fog,gt=H.isMeshStandardMaterial?U.environment:null,wt=A===null?M.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Yn,Tt=(H.isMeshStandardMaterial?k:y).get(H.envMap||gt),Dt=H.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Nt=!!z.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),At=!!z.morphAttributes.position,le=!!z.morphAttributes.normal,de=!!z.morphAttributes.color;let ve=Xn;H.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ve=M.toneMapping);const Ke=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,re=Ke!==void 0?Ke.length:0,Pt=_t.get(H),ke=p.state.lights;if($===!0&&(et===!0||w!==V)){const sn=w===V&&H.id===P;nt.setState(H,w,sn)}let oe=!1;H.version===Pt.__version?(Pt.needsLights&&Pt.lightsStateVersion!==ke.state.version||Pt.outputColorSpace!==wt||N.isBatchedMesh&&Pt.batching===!1||!N.isBatchedMesh&&Pt.batching===!0||N.isBatchedMesh&&Pt.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Pt.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Pt.instancing===!1||!N.isInstancedMesh&&Pt.instancing===!0||N.isSkinnedMesh&&Pt.skinning===!1||!N.isSkinnedMesh&&Pt.skinning===!0||N.isInstancedMesh&&Pt.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Pt.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Pt.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Pt.instancingMorph===!1&&N.morphTexture!==null||Pt.envMap!==Tt||H.fog===!0&&Pt.fog!==st||Pt.numClippingPlanes!==void 0&&(Pt.numClippingPlanes!==nt.numPlanes||Pt.numIntersection!==nt.numIntersection)||Pt.vertexAlphas!==Dt||Pt.vertexTangents!==Nt||Pt.morphTargets!==At||Pt.morphNormals!==le||Pt.morphColors!==de||Pt.toneMapping!==ve||Pt.morphTargetsCount!==re)&&(oe=!0):(oe=!0,Pt.__version=H.version);let an=Pt.currentProgram;oe===!0&&(an=Zs(H,U,N));let yi=!1,Je=!1,lo=!1;const ye=an.getUniforms(),Nn=Pt.uniforms;if(lt.useProgram(an.program)&&(yi=!0,Je=!0,lo=!0),H.id!==P&&(P=H.id,Je=!0),yi||V!==w){tt.reverseDepthBuffer?(St.copy(w.projectionMatrix),nd(St),id(St),ye.setValue(R,"projectionMatrix",St)):ye.setValue(R,"projectionMatrix",w.projectionMatrix),ye.setValue(R,"viewMatrix",w.matrixWorldInverse);const sn=ye.map.cameraPosition;sn!==void 0&&sn.setValue(R,Ut.setFromMatrixPosition(w.matrixWorld)),tt.logarithmicDepthBuffer&&ye.setValue(R,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&ye.setValue(R,"isOrthographic",w.isOrthographicCamera===!0),V!==w&&(V=w,Je=!0,lo=!0)}if(N.isSkinnedMesh){ye.setOptional(R,N,"bindMatrix"),ye.setOptional(R,N,"bindMatrixInverse");const sn=N.skeleton;sn&&(sn.boneTexture===null&&sn.computeBoneTexture(),ye.setValue(R,"boneTexture",sn.boneTexture,T))}N.isBatchedMesh&&(ye.setOptional(R,N,"batchingTexture"),ye.setValue(R,"batchingTexture",N._matricesTexture,T),ye.setOptional(R,N,"batchingIdTexture"),ye.setValue(R,"batchingIdTexture",N._indirectTexture,T),ye.setOptional(R,N,"batchingColorTexture"),N._colorsTexture!==null&&ye.setValue(R,"batchingColorTexture",N._colorsTexture,T));const co=z.morphAttributes;if((co.position!==void 0||co.normal!==void 0||co.color!==void 0)&&Ot.update(N,z,an),(Je||Pt.receiveShadow!==N.receiveShadow)&&(Pt.receiveShadow=N.receiveShadow,ye.setValue(R,"receiveShadow",N.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Nn.envMap.value=Tt,Nn.flipEnvMap.value=Tt.isCubeTexture&&Tt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&U.environment!==null&&(Nn.envMapIntensity.value=U.environmentIntensity),Je&&(ye.setValue(R,"toneMappingExposure",M.toneMappingExposure),Pt.needsLights&&Yh(Nn,lo),st&&H.fog===!0&&ht.refreshFogUniforms(Nn,st),ht.refreshMaterialUniforms(Nn,H,Q,O,p.state.transmissionRenderTarget[w.id]),Nr.upload(R,Tl(Pt),Nn,T)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Nr.upload(R,Tl(Pt),Nn,T),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&ye.setValue(R,"center",N.center),ye.setValue(R,"modelViewMatrix",N.modelViewMatrix),ye.setValue(R,"normalMatrix",N.normalMatrix),ye.setValue(R,"modelMatrix",N.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const sn=H.uniformsGroups;for(let ho=0,Kh=sn.length;ho<Kh;ho++){const Rl=sn[ho];I.update(Rl,an),I.bind(Rl,an)}}return an}function Yh(w,U){w.ambientLightColor.needsUpdate=U,w.lightProbe.needsUpdate=U,w.directionalLights.needsUpdate=U,w.directionalLightShadows.needsUpdate=U,w.pointLights.needsUpdate=U,w.pointLightShadows.needsUpdate=U,w.spotLights.needsUpdate=U,w.spotLightShadows.needsUpdate=U,w.rectAreaLights.needsUpdate=U,w.hemisphereLights.needsUpdate=U}function Zh(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(w,U,z){_t.get(w.texture).__webglTexture=U,_t.get(w.depthTexture).__webglTexture=z;const H=_t.get(w);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=z===void 0,H.__autoAllocateDepthBuffer||ot.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(w,U){const z=_t.get(w);z.__webglFramebuffer=U,z.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(w,U=0,z=0){A=w,L=U,E=z;let H=!0,N=null,st=!1,gt=!1;if(w){const Tt=_t.get(w);if(Tt.__useDefaultFramebuffer!==void 0)lt.bindFramebuffer(R.FRAMEBUFFER,null),H=!1;else if(Tt.__webglFramebuffer===void 0)T.setupRenderTarget(w);else if(Tt.__hasExternalTextures)T.rebindTextures(w,_t.get(w.texture).__webglTexture,_t.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const At=w.depthTexture;if(Tt.__boundDepthTexture!==At){if(At!==null&&_t.has(At)&&(w.width!==At.image.width||w.height!==At.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(w)}}const Dt=w.texture;(Dt.isData3DTexture||Dt.isDataArrayTexture||Dt.isCompressedArrayTexture)&&(gt=!0);const Nt=_t.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Nt[U])?N=Nt[U][z]:N=Nt[U],st=!0):w.samples>0&&T.useMultisampledRTT(w)===!1?N=_t.get(w).__webglMultisampledFramebuffer:Array.isArray(Nt)?N=Nt[z]:N=Nt,_.copy(w.viewport),b.copy(w.scissor),B=w.scissorTest}else _.copy(ft).multiplyScalar(Q).floor(),b.copy(pt).multiplyScalar(Q).floor(),B=Wt;if(lt.bindFramebuffer(R.FRAMEBUFFER,N)&&H&&lt.drawBuffers(w,N),lt.viewport(_),lt.scissor(b),lt.setScissorTest(B),st){const Tt=_t.get(w.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+U,Tt.__webglTexture,z)}else if(gt){const Tt=_t.get(w.texture),Dt=U||0;R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,Tt.__webglTexture,z||0,Dt)}P=-1},this.readRenderTargetPixels=function(w,U,z,H,N,st,gt){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let wt=_t.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&gt!==void 0&&(wt=wt[gt]),wt){lt.bindFramebuffer(R.FRAMEBUFFER,wt);try{const Tt=w.texture,Dt=Tt.format,Nt=Tt.type;if(!tt.textureFormatReadable(Dt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!tt.textureTypeReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=w.width-H&&z>=0&&z<=w.height-N&&R.readPixels(U,z,H,N,Ht.convert(Dt),Ht.convert(Nt),st)}finally{const Tt=A!==null?_t.get(A).__webglFramebuffer:null;lt.bindFramebuffer(R.FRAMEBUFFER,Tt)}}},this.readRenderTargetPixelsAsync=async function(w,U,z,H,N,st,gt){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let wt=_t.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&gt!==void 0&&(wt=wt[gt]),wt){const Tt=w.texture,Dt=Tt.format,Nt=Tt.type;if(!tt.textureFormatReadable(Dt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!tt.textureTypeReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=w.width-H&&z>=0&&z<=w.height-N){lt.bindFramebuffer(R.FRAMEBUFFER,wt);const At=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,At),R.bufferData(R.PIXEL_PACK_BUFFER,st.byteLength,R.STREAM_READ),R.readPixels(U,z,H,N,Ht.convert(Dt),Ht.convert(Nt),0);const le=A!==null?_t.get(A).__webglFramebuffer:null;lt.bindFramebuffer(R.FRAMEBUFFER,le);const de=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await ed(R,de,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,At),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,st),R.deleteBuffer(At),R.deleteSync(de),st}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(w,U=null,z=0){w.isTexture!==!0&&(Dr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,w=arguments[1]);const H=Math.pow(2,-z),N=Math.floor(w.image.width*H),st=Math.floor(w.image.height*H),gt=U!==null?U.x:0,wt=U!==null?U.y:0;T.setTexture2D(w,0),R.copyTexSubImage2D(R.TEXTURE_2D,z,0,0,gt,wt,N,st),lt.unbindTexture()},this.copyTextureToTexture=function(w,U,z=null,H=null,N=0){w.isTexture!==!0&&(Dr("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,w=arguments[1],U=arguments[2],N=arguments[3]||0,z=null);let st,gt,wt,Tt,Dt,Nt;z!==null?(st=z.max.x-z.min.x,gt=z.max.y-z.min.y,wt=z.min.x,Tt=z.min.y):(st=w.image.width,gt=w.image.height,wt=0,Tt=0),H!==null?(Dt=H.x,Nt=H.y):(Dt=0,Nt=0);const At=Ht.convert(U.format),le=Ht.convert(U.type);T.setTexture2D(U,0),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,U.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,U.unpackAlignment);const de=R.getParameter(R.UNPACK_ROW_LENGTH),ve=R.getParameter(R.UNPACK_IMAGE_HEIGHT),Ke=R.getParameter(R.UNPACK_SKIP_PIXELS),re=R.getParameter(R.UNPACK_SKIP_ROWS),Pt=R.getParameter(R.UNPACK_SKIP_IMAGES),ke=w.isCompressedTexture?w.mipmaps[N]:w.image;R.pixelStorei(R.UNPACK_ROW_LENGTH,ke.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,ke.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,wt),R.pixelStorei(R.UNPACK_SKIP_ROWS,Tt),w.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,N,Dt,Nt,st,gt,At,le,ke.data):w.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,N,Dt,Nt,ke.width,ke.height,At,ke.data):R.texSubImage2D(R.TEXTURE_2D,N,Dt,Nt,st,gt,At,le,ke),R.pixelStorei(R.UNPACK_ROW_LENGTH,de),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,ve),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Ke),R.pixelStorei(R.UNPACK_SKIP_ROWS,re),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Pt),N===0&&U.generateMipmaps&&R.generateMipmap(R.TEXTURE_2D),lt.unbindTexture()},this.copyTextureToTexture3D=function(w,U,z=null,H=null,N=0){w.isTexture!==!0&&(Dr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,H=arguments[1]||null,w=arguments[2],U=arguments[3],N=arguments[4]||0);let st,gt,wt,Tt,Dt,Nt,At,le,de;const ve=w.isCompressedTexture?w.mipmaps[N]:w.image;z!==null?(st=z.max.x-z.min.x,gt=z.max.y-z.min.y,wt=z.max.z-z.min.z,Tt=z.min.x,Dt=z.min.y,Nt=z.min.z):(st=ve.width,gt=ve.height,wt=ve.depth,Tt=0,Dt=0,Nt=0),H!==null?(At=H.x,le=H.y,de=H.z):(At=0,le=0,de=0);const Ke=Ht.convert(U.format),re=Ht.convert(U.type);let Pt;if(U.isData3DTexture)T.setTexture3D(U,0),Pt=R.TEXTURE_3D;else if(U.isDataArrayTexture||U.isCompressedArrayTexture)T.setTexture2DArray(U,0),Pt=R.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,U.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,U.unpackAlignment);const ke=R.getParameter(R.UNPACK_ROW_LENGTH),oe=R.getParameter(R.UNPACK_IMAGE_HEIGHT),an=R.getParameter(R.UNPACK_SKIP_PIXELS),yi=R.getParameter(R.UNPACK_SKIP_ROWS),Je=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,ve.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,ve.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Tt),R.pixelStorei(R.UNPACK_SKIP_ROWS,Dt),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Nt),w.isDataTexture||w.isData3DTexture?R.texSubImage3D(Pt,N,At,le,de,st,gt,wt,Ke,re,ve.data):U.isCompressedArrayTexture?R.compressedTexSubImage3D(Pt,N,At,le,de,st,gt,wt,Ke,ve.data):R.texSubImage3D(Pt,N,At,le,de,st,gt,wt,Ke,re,ve),R.pixelStorei(R.UNPACK_ROW_LENGTH,ke),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,oe),R.pixelStorei(R.UNPACK_SKIP_PIXELS,an),R.pixelStorei(R.UNPACK_SKIP_ROWS,yi),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Je),N===0&&U.generateMipmaps&&R.generateMipmap(Pt),lt.unbindTexture()},this.initRenderTarget=function(w){_t.get(w).__webglFramebuffer===void 0&&T.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?T.setTextureCube(w,0):w.isData3DTexture?T.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?T.setTexture2DArray(w,0):T.setTexture2D(w,0),lt.unbindTexture()},this.resetState=function(){L=0,E=0,A=null,lt.reset(),ue.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return In}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===ol?"display-p3":"srgb",e.unpackColorSpace=ae.workingColorSpace===eo?"display-p3":"srgb"}}class so{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new Gt(t),this.near=e,this.far=n}clone(){return new so(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Cs extends Ne{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new gn,this.environmentIntensity=1,this.environmentRotation=new gn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Th extends _i{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Gt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Xr=new C,qr=new C,wc=new pe,fs=new hh,_r=new no,Ho=new C,Ec=new C;class pg extends Ne{constructor(t=new Fe,e=new Th){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Xr.fromBufferAttribute(e,s-1),qr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Xr.distanceTo(qr);t.setAttribute("lineDistance",new se(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_r.copy(n.boundingSphere),_r.applyMatrix4(s),_r.radius+=r,t.ray.intersectsSphere(_r)===!1)return;wc.copy(s).invert(),fs.copy(t.ray).applyMatrix4(wc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=f,p=g-1;v<p;v+=c){const m=h.getX(v),S=h.getX(v+1),M=vr(this,t,fs,l,m,S);M&&e.push(M)}if(this.isLineLoop){const v=h.getX(g-1),p=h.getX(f),m=vr(this,t,fs,l,v,p);m&&e.push(m)}}else{const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let v=f,p=g-1;v<p;v+=c){const m=vr(this,t,fs,l,v,v+1);m&&e.push(m)}if(this.isLineLoop){const v=vr(this,t,fs,l,g-1,f);v&&e.push(v)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function vr(i,t,e,n,s,r){const o=i.geometry.attributes.position;if(Xr.fromBufferAttribute(o,s),qr.fromBufferAttribute(o,r),e.distanceSqToSegment(Xr,qr,Ho,Ec)>n)return;Ho.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Ho);if(!(l<t.near||l>t.far))return{distance:l,point:Ec.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}class mg extends Ge{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Sn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let s=0;const r=n.length;let o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);const h=n[s],d=n[s+1]-h,f=(o-h)/d;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new it:new C);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new C,s=[],r=[],o=[],a=new C,l=new pe;for(let f=0;f<=t;f++){const g=f/t;s[f]=this.getTangentAt(g,new C)}r[0]=new C,o[0]=new C;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Ue(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(Ue(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class hl extends Sn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new it){const n=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class gg extends hl{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function ul(){let i=0,t=0,e=0,n=0;function s(r,o,a,l){i=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,s(o,a,d,f)},calc:function(r){const o=r*r,a=o*r;return i+t*r+e*o+n*a}}}const xr=new C,Vo=new ul,Go=new ul,Wo=new ul;class _g extends Sn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new C){const n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(xr.subVectors(s[0],s[1]).add(s[0]),c=xr);const u=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(xr.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=xr),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),g<1e-4&&(g=v),p<1e-4&&(p=v),Vo.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,v,p),Go.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,v,p),Wo.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,v,p)}else this.curveType==="catmullrom"&&(Vo.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Go.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Wo.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Vo.calc(l),Go.calc(l),Wo.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new C().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Tc(i,t,e,n,s){const r=(n-t)*.5,o=(s-e)*.5,a=i*i,l=i*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*i+e}function vg(i,t){const e=1-i;return e*e*t}function xg(i,t){return 2*(1-i)*i*t}function Mg(i,t){return i*i*t}function Ps(i,t,e,n){return vg(i,t)+xg(i,e)+Mg(i,n)}function yg(i,t){const e=1-i;return e*e*e*t}function Sg(i,t){const e=1-i;return 3*e*e*i*t}function bg(i,t){return 3*(1-i)*i*i*t}function wg(i,t){return i*i*i*t}function Ls(i,t,e,n,s){return yg(i,t)+Sg(i,e)+bg(i,n)+wg(i,s)}class Ah extends Sn{constructor(t=new it,e=new it,n=new it,s=new it){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new it){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ls(t,s.x,r.x,o.x,a.x),Ls(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Eg extends Sn{constructor(t=new C,e=new C,n=new C,s=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new C){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ls(t,s.x,r.x,o.x,a.x),Ls(t,s.y,r.y,o.y,a.y),Ls(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Rh extends Sn{constructor(t=new it,e=new it){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new it){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new it){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Tg extends Sn{constructor(t=new C,e=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new C){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new C){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Ch extends Sn{constructor(t=new it,e=new it,n=new it){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new it){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Ps(t,s.x,r.x,o.x),Ps(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Ag extends Sn{constructor(t=new C,e=new C,n=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new C){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Ps(t,s.x,r.x,o.x),Ps(t,s.y,r.y,o.y),Ps(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Ph extends Sn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new it){const n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(Tc(a,l.x,c.x,h.x,u.x),Tc(a,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new it().fromArray(s))}return this}}var Ga=Object.freeze({__proto__:null,ArcCurve:gg,CatmullRomCurve3:_g,CubicBezierCurve:Ah,CubicBezierCurve3:Eg,EllipseCurve:hl,LineCurve:Rh,LineCurve3:Tg,QuadraticBezierCurve:Ch,QuadraticBezierCurve3:Ag,SplineCurve:Ph});class Rg extends Sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ga[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(new Ga[s.type]().fromJSON(s))}return this}}class Wa extends Rg{constructor(t){super(),this.type="Path",this.currentPoint=new it,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new Rh(this.currentPoint.clone(),new it(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){const r=new Ch(this.currentPoint.clone(),new it(t,e),new it(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){const a=new Ah(this.currentPoint.clone(),new it(t,e),new it(n,s),new it(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new Ph(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,s,r,o,a,l),this}absellipse(t,e,n,s,r,o,a,l){const c=new hl(t,e,n,s,r,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class xi extends Fe{constructor(t=[new it(0,-.5),new it(.5,0),new it(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=Ue(s,0,Math.PI*2);const r=[],o=[],a=[],l=[],c=[],h=1/e,u=new C,d=new it,f=new C,g=new C,v=new C;let p=0,m=0;for(let S=0;S<=t.length-1;S++)switch(S){case 0:p=t[S+1].x-t[S].x,m=t[S+1].y-t[S].y,f.x=m*1,f.y=-p,f.z=m*0,v.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(v.x,v.y,v.z);break;default:p=t[S+1].x-t[S].x,m=t[S+1].y-t[S].y,f.x=m*1,f.y=-p,f.z=m*0,g.copy(f),f.x+=v.x,f.y+=v.y,f.z+=v.z,f.normalize(),l.push(f.x,f.y,f.z),v.copy(g)}for(let S=0;S<=e;S++){const M=n+S*h*s,x=Math.sin(M),L=Math.cos(M);for(let E=0;E<=t.length-1;E++){u.x=t[E].x*x,u.y=t[E].y,u.z=t[E].x*L,o.push(u.x,u.y,u.z),d.x=S/e,d.y=E/(t.length-1),a.push(d.x,d.y);const A=l[3*E+0]*x,P=l[3*E+1],V=l[3*E+0]*L;c.push(A,P,V)}}for(let S=0;S<e;S++)for(let M=0;M<t.length-1;M++){const x=M+S*t.length,L=x,E=x+t.length,A=x+t.length+1,P=x+1;r.push(L,E,P),r.push(A,P,E)}this.setIndex(r),this.setAttribute("position",new se(o,3)),this.setAttribute("uv",new se(a,2)),this.setAttribute("normal",new se(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new xi(t.points,t.segments,t.phiStart,t.phiLength)}}class is extends xi{constructor(t=1,e=1,n=4,s=8){const r=new Wa;r.absarc(0,-e/2,t,Math.PI*1.5,0),r.absarc(0,e/2,t,0,Math.PI*.5),super(r.getPoints(n),s),this.type="CapsuleGeometry",this.parameters={radius:t,length:e,capSegments:n,radialSegments:s}}static fromJSON(t){return new is(t.radius,t.length,t.capSegments,t.radialSegments)}}class Mi extends Fe{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);const r=[],o=[],a=[],l=[],c=new C,h=new it;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){const f=n+u/e*s;c.x=t*Math.cos(f),c.y=t*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/t+1)/2,h.y=(o[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new se(o,3)),this.setAttribute("normal",new se(a,3)),this.setAttribute("uv",new se(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Mi(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class De extends Fe{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],d=[],f=[];let g=0;const v=[],p=n/2;let m=0;S(),o===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new se(u,3)),this.setAttribute("normal",new se(d,3)),this.setAttribute("uv",new se(f,2));function S(){const x=new C,L=new C;let E=0;const A=(e-t)/n;for(let P=0;P<=r;P++){const V=[],_=P/r,b=_*(e-t)+t;for(let B=0;B<=s;B++){const D=B/s,F=D*l+a,X=Math.sin(F),O=Math.cos(F);L.x=b*X,L.y=-_*n+p,L.z=b*O,u.push(L.x,L.y,L.z),x.set(X,A,O).normalize(),d.push(x.x,x.y,x.z),f.push(D,1-_),V.push(g++)}v.push(V)}for(let P=0;P<s;P++)for(let V=0;V<r;V++){const _=v[V][P],b=v[V+1][P],B=v[V+1][P+1],D=v[V][P+1];t>0&&(h.push(_,b,D),E+=3),e>0&&(h.push(b,B,D),E+=3)}c.addGroup(m,E,0),m+=E}function M(x){const L=g,E=new it,A=new C;let P=0;const V=x===!0?t:e,_=x===!0?1:-1;for(let B=1;B<=s;B++)u.push(0,p*_,0),d.push(0,_,0),f.push(.5,.5),g++;const b=g;for(let B=0;B<=s;B++){const F=B/s*l+a,X=Math.cos(F),O=Math.sin(F);A.x=V*O,A.y=p*_,A.z=V*X,u.push(A.x,A.y,A.z),d.push(0,_,0),E.x=X*.5+.5,E.y=O*.5*_+.5,f.push(E.x,E.y),g++}for(let B=0;B<s;B++){const D=L+B,F=b+B;x===!0?h.push(F,F+1,D):h.push(F+1,F,D),P+=3}c.addGroup(m,P,x===!0?1:2),m+=P}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new De(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Hi extends De{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Hi(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class as extends Fe{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const r=[],o=[];a(s),c(n),h(),this.setAttribute("position",new se(r,3)),this.setAttribute("normal",new se(r.slice(),3)),this.setAttribute("uv",new se(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(S){const M=new C,x=new C,L=new C;for(let E=0;E<e.length;E+=3)f(e[E+0],M),f(e[E+1],x),f(e[E+2],L),l(M,x,L,S)}function l(S,M,x,L){const E=L+1,A=[];for(let P=0;P<=E;P++){A[P]=[];const V=S.clone().lerp(x,P/E),_=M.clone().lerp(x,P/E),b=E-P;for(let B=0;B<=b;B++)B===0&&P===E?A[P][B]=V:A[P][B]=V.clone().lerp(_,B/b)}for(let P=0;P<E;P++)for(let V=0;V<2*(E-P)-1;V++){const _=Math.floor(V/2);V%2===0?(d(A[P][_+1]),d(A[P+1][_]),d(A[P][_])):(d(A[P][_+1]),d(A[P+1][_+1]),d(A[P+1][_]))}}function c(S){const M=new C;for(let x=0;x<r.length;x+=3)M.x=r[x+0],M.y=r[x+1],M.z=r[x+2],M.normalize().multiplyScalar(S),r[x+0]=M.x,r[x+1]=M.y,r[x+2]=M.z}function h(){const S=new C;for(let M=0;M<r.length;M+=3){S.x=r[M+0],S.y=r[M+1],S.z=r[M+2];const x=p(S)/2/Math.PI+.5,L=m(S)/Math.PI+.5;o.push(x,1-L)}g(),u()}function u(){for(let S=0;S<o.length;S+=6){const M=o[S+0],x=o[S+2],L=o[S+4],E=Math.max(M,x,L),A=Math.min(M,x,L);E>.9&&A<.1&&(M<.2&&(o[S+0]+=1),x<.2&&(o[S+2]+=1),L<.2&&(o[S+4]+=1))}}function d(S){r.push(S.x,S.y,S.z)}function f(S,M){const x=S*3;M.x=t[x+0],M.y=t[x+1],M.z=t[x+2]}function g(){const S=new C,M=new C,x=new C,L=new C,E=new it,A=new it,P=new it;for(let V=0,_=0;V<r.length;V+=9,_+=6){S.set(r[V+0],r[V+1],r[V+2]),M.set(r[V+3],r[V+4],r[V+5]),x.set(r[V+6],r[V+7],r[V+8]),E.set(o[_+0],o[_+1]),A.set(o[_+2],o[_+3]),P.set(o[_+4],o[_+5]),L.copy(S).add(M).add(x).divideScalar(3);const b=p(L);v(E,_+0,S,b),v(A,_+2,M,b),v(P,_+4,x,b)}}function v(S,M,x,L){L<0&&S.x===1&&(o[M]=S.x-1),x.x===0&&x.z===0&&(o[M]=L/2/Math.PI+.5)}function p(S){return Math.atan2(S.z,-S.x)}function m(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new as(t.vertices,t.indices,t.radius,t.details)}}class ss extends as{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new ss(t.radius,t.detail)}}class Lh extends Wa{constructor(t){super(t),this.uuid=gi(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(new Wa().fromJSON(s))}return this}}const Cg={triangulate:function(i,t,e=2){const n=t&&t.length,s=n?t[0]*e:i.length;let r=Ih(i,0,s,e,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,u,d,f;if(n&&(r=Dg(i,t,r,e)),i.length>80*e){a=c=i[0],l=h=i[1];for(let g=e;g<s;g+=e)u=i[g],d=i[g+1],u<a&&(a=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return zs(r,o,e,a,l,f,0),o}};function Ih(i,t,e,n,s){let r,o;if(s===Xg(i,t,e,n)>0)for(r=t;r<e;r+=n)o=Ac(r,i[r],i[r+1],o);else for(r=e-n;r>=t;r-=n)o=Ac(r,i[r],i[r+1],o);return o&&ro(o,o.next)&&(Vs(o),o=o.next),o}function mi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(ro(e,e.next)||_e(e.prev,e,e.next)===0)){if(Vs(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function zs(i,t,e,n,s,r,o){if(!i)return;!o&&r&&Bg(i,n,s,r);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,r?Lg(i,n,s,r):Pg(i)){t.push(l.i/e|0),t.push(i.i/e|0),t.push(c.i/e|0),Vs(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Ig(mi(i),t,e),zs(i,t,e,n,s,r,2)):o===2&&Ug(i,t,e,n,s,r):zs(mi(i),t,e,n,s,r,1);break}}}function Pg(i){const t=i.prev,e=i,n=i.next;if(_e(t,e,n)>=0)return!1;const s=t.x,r=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=s<r?s<o?s:o:r<o?r:o,u=a<l?a<c?a:c:l<c?l:c,d=s>r?s>o?s:o:r>o?r:o,f=a>l?a>c?a:c:l>c?l:c;let g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&Vi(s,a,r,l,o,c,g.x,g.y)&&_e(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Lg(i,t,e,n){const s=i.prev,r=i,o=i.next;if(_e(s,r,o)>=0)return!1;const a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,d=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<d?h:d:u<d?u:d,v=a>l?a>c?a:c:l>c?l:c,p=h>u?h>d?h:d:u>d?u:d,m=Xa(f,g,t,e,n),S=Xa(v,p,t,e,n);let M=i.prevZ,x=i.nextZ;for(;M&&M.z>=m&&x&&x.z<=S;){if(M.x>=f&&M.x<=v&&M.y>=g&&M.y<=p&&M!==s&&M!==o&&Vi(a,h,l,u,c,d,M.x,M.y)&&_e(M.prev,M,M.next)>=0||(M=M.prevZ,x.x>=f&&x.x<=v&&x.y>=g&&x.y<=p&&x!==s&&x!==o&&Vi(a,h,l,u,c,d,x.x,x.y)&&_e(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;M&&M.z>=m;){if(M.x>=f&&M.x<=v&&M.y>=g&&M.y<=p&&M!==s&&M!==o&&Vi(a,h,l,u,c,d,M.x,M.y)&&_e(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;x&&x.z<=S;){if(x.x>=f&&x.x<=v&&x.y>=g&&x.y<=p&&x!==s&&x!==o&&Vi(a,h,l,u,c,d,x.x,x.y)&&_e(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Ig(i,t,e){let n=i;do{const s=n.prev,r=n.next.next;!ro(s,r)&&Uh(s,n,n.next,r)&&Hs(s,r)&&Hs(r,s)&&(t.push(s.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Vs(n),Vs(n.next),n=i=r),n=n.next}while(n!==i);return mi(n)}function Ug(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Vg(o,a)){let l=Dh(o,a);o=mi(o,o.next),l=mi(l,l.next),zs(o,t,e,n,s,r,0),zs(l,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Dg(i,t,e,n){const s=[];let r,o,a,l,c;for(r=0,o=t.length;r<o;r++)a=t[r]*n,l=r<o-1?t[r+1]*n:i.length,c=Ih(i,a,l,n,!1),c===c.next&&(c.steiner=!0),s.push(Hg(c));for(s.sort(Ng),r=0;r<s.length;r++)e=Fg(s[r],e);return e}function Ng(i,t){return i.x-t.x}function Fg(i,t){const e=kg(i,t);if(!e)return t;const n=Dh(e,i);return mi(n,n.next),mi(e,e.next)}function kg(i,t){let e=t,n=-1/0,s;const r=i.x,o=i.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){const d=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=r&&d>n&&(n=d,s=e.x<e.next.x?e:e.next,d===r))return s}e=e.next}while(e!==t);if(!s)return null;const a=s,l=s.x,c=s.y;let h=1/0,u;e=s;do r>=e.x&&e.x>=l&&r!==e.x&&Vi(o<c?r:n,o,l,c,o<c?n:r,o,e.x,e.y)&&(u=Math.abs(o-e.y)/(r-e.x),Hs(e,i)&&(u<h||u===h&&(e.x>s.x||e.x===s.x&&Og(s,e)))&&(s=e,h=u)),e=e.next;while(e!==a);return s}function Og(i,t){return _e(i.prev,i,t.prev)<0&&_e(t.next,i,i.next)<0}function Bg(i,t,e,n){let s=i;do s.z===0&&(s.z=Xa(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,zg(s)}function zg(i){let t,e,n,s,r,o,a,l,c=1;do{for(e=i,i=null,r=null,o=0;e;){for(o++,n=e,a=0,t=0;t<c&&(a++,n=n.nextZ,!!n);t++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||e.z<=n.z)?(s=e,e=e.nextZ,a--):(s=n,n=n.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;e=n}r.nextZ=null,c*=2}while(o>1);return i}function Xa(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Hg(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Vi(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function Vg(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!Gg(i,t)&&(Hs(i,t)&&Hs(t,i)&&Wg(i,t)&&(_e(i.prev,i,t.prev)||_e(i,t.prev,t))||ro(i,t)&&_e(i.prev,i,i.next)>0&&_e(t.prev,t,t.next)>0)}function _e(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function ro(i,t){return i.x===t.x&&i.y===t.y}function Uh(i,t,e,n){const s=yr(_e(i,t,e)),r=yr(_e(i,t,n)),o=yr(_e(e,n,i)),a=yr(_e(e,n,t));return!!(s!==r&&o!==a||s===0&&Mr(i,e,t)||r===0&&Mr(i,n,t)||o===0&&Mr(e,i,n)||a===0&&Mr(e,t,n))}function Mr(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function yr(i){return i>0?1:i<0?-1:0}function Gg(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Uh(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Hs(i,t){return _e(i.prev,i,i.next)<0?_e(i,t,i.next)>=0&&_e(i,i.prev,t)>=0:_e(i,t,i.prev)<0||_e(i,i.next,t)<0}function Wg(i,t){let e=i,n=!1;const s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Dh(i,t){const e=new qa(i.i,i.x,i.y),n=new qa(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Ac(i,t,e,n){const s=new qa(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Vs(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function qa(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Xg(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}class Is{static area(t){const e=t.length;let n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return Is.area(t)<0}static triangulateShape(t,e){const n=[],s=[],r=[];Rc(t),Cc(n,t);let o=t.length;e.forEach(Rc);for(let l=0;l<e.length;l++)s.push(o),o+=e[l].length,Cc(n,e[l]);const a=Cg.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function Rc(i){const t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Cc(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}class dl extends Fe{constructor(t=new Lh([new it(.5,.5),new it(-.5,.5),new it(-.5,-.5),new it(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,s=[],r=[];for(let a=0,l=t.length;a<l;a++){const c=t[a];o(c)}this.setAttribute("position",new se(s,3)),this.setAttribute("uv",new se(r,2)),this.computeVertexNormals();function o(a){const l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1;let d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3;const m=e.extrudePath,S=e.UVGenerator!==void 0?e.UVGenerator:qg;let M,x=!1,L,E,A,P;m&&(M=m.getSpacedPoints(h),x=!0,d=!1,L=m.computeFrenetFrames(h,!1),E=new C,A=new C,P=new C),d||(p=0,f=0,g=0,v=0);const V=a.extractPoints(c);let _=V.shape;const b=V.holes;if(!Is.isClockWise(_)){_=_.reverse();for(let K=0,R=b.length;K<R;K++){const at=b[K];Is.isClockWise(at)&&(b[K]=at.reverse())}}const D=Is.triangulateShape(_,b),F=_;for(let K=0,R=b.length;K<R;K++){const at=b[K];_=_.concat(at)}function X(K,R,at){return R||console.error("THREE.ExtrudeGeometry: vec does not exist"),K.clone().addScaledVector(R,at)}const O=_.length,Q=D.length;function G(K,R,at){let ot,tt,lt;const Ct=K.x-R.x,_t=K.y-R.y,T=at.x-K.x,y=at.y-K.y,k=Ct*Ct+_t*_t,Y=Ct*y-_t*T;if(Math.abs(Y)>Number.EPSILON){const J=Math.sqrt(k),Z=Math.sqrt(T*T+y*y),Et=R.x-_t/J,ht=R.y+Ct/J,Mt=at.x-y/Z,Qt=at.y+T/Z,nt=((Mt-Et)*y-(Qt-ht)*T)/(Ct*y-_t*T);ot=Et+Ct*nt-K.x,tt=ht+_t*nt-K.y;const yt=ot*ot+tt*tt;if(yt<=2)return new it(ot,tt);lt=Math.sqrt(yt/2)}else{let J=!1;Ct>Number.EPSILON?T>Number.EPSILON&&(J=!0):Ct<-Number.EPSILON?T<-Number.EPSILON&&(J=!0):Math.sign(_t)===Math.sign(y)&&(J=!0),J?(ot=-_t,tt=Ct,lt=Math.sqrt(k)):(ot=Ct,tt=_t,lt=Math.sqrt(k/2))}return new it(ot/lt,tt/lt)}const ct=[];for(let K=0,R=F.length,at=R-1,ot=K+1;K<R;K++,at++,ot++)at===R&&(at=0),ot===R&&(ot=0),ct[K]=G(F[K],F[at],F[ot]);const ft=[];let pt,Wt=ct.concat();for(let K=0,R=b.length;K<R;K++){const at=b[K];pt=[];for(let ot=0,tt=at.length,lt=tt-1,Ct=ot+1;ot<tt;ot++,lt++,Ct++)lt===tt&&(lt=0),Ct===tt&&(Ct=0),pt[ot]=G(at[ot],at[lt],at[Ct]);ft.push(pt),Wt=Wt.concat(pt)}for(let K=0;K<p;K++){const R=K/p,at=f*Math.cos(R*Math.PI/2),ot=g*Math.sin(R*Math.PI/2)+v;for(let tt=0,lt=F.length;tt<lt;tt++){const Ct=X(F[tt],ct[tt],ot);dt(Ct.x,Ct.y,-at)}for(let tt=0,lt=b.length;tt<lt;tt++){const Ct=b[tt];pt=ft[tt];for(let _t=0,T=Ct.length;_t<T;_t++){const y=X(Ct[_t],pt[_t],ot);dt(y.x,y.y,-at)}}}const Jt=g+v;for(let K=0;K<O;K++){const R=d?X(_[K],Wt[K],Jt):_[K];x?(A.copy(L.normals[0]).multiplyScalar(R.x),E.copy(L.binormals[0]).multiplyScalar(R.y),P.copy(M[0]).add(A).add(E),dt(P.x,P.y,P.z)):dt(R.x,R.y,0)}for(let K=1;K<=h;K++)for(let R=0;R<O;R++){const at=d?X(_[R],Wt[R],Jt):_[R];x?(A.copy(L.normals[K]).multiplyScalar(at.x),E.copy(L.binormals[K]).multiplyScalar(at.y),P.copy(M[K]).add(A).add(E),dt(P.x,P.y,P.z)):dt(at.x,at.y,u/h*K)}for(let K=p-1;K>=0;K--){const R=K/p,at=f*Math.cos(R*Math.PI/2),ot=g*Math.sin(R*Math.PI/2)+v;for(let tt=0,lt=F.length;tt<lt;tt++){const Ct=X(F[tt],ct[tt],ot);dt(Ct.x,Ct.y,u+at)}for(let tt=0,lt=b.length;tt<lt;tt++){const Ct=b[tt];pt=ft[tt];for(let _t=0,T=Ct.length;_t<T;_t++){const y=X(Ct[_t],pt[_t],ot);x?dt(y.x,y.y+M[h-1].y,M[h-1].x+at):dt(y.x,y.y,u+at)}}}$(),et();function $(){const K=s.length/3;if(d){let R=0,at=O*R;for(let ot=0;ot<Q;ot++){const tt=D[ot];Ut(tt[2]+at,tt[1]+at,tt[0]+at)}R=h+p*2,at=O*R;for(let ot=0;ot<Q;ot++){const tt=D[ot];Ut(tt[0]+at,tt[1]+at,tt[2]+at)}}else{for(let R=0;R<Q;R++){const at=D[R];Ut(at[2],at[1],at[0])}for(let R=0;R<Q;R++){const at=D[R];Ut(at[0]+O*h,at[1]+O*h,at[2]+O*h)}}n.addGroup(K,s.length/3-K,0)}function et(){const K=s.length/3;let R=0;St(F,R),R+=F.length;for(let at=0,ot=b.length;at<ot;at++){const tt=b[at];St(tt,R),R+=tt.length}n.addGroup(K,s.length/3-K,1)}function St(K,R){let at=K.length;for(;--at>=0;){const ot=at;let tt=at-1;tt<0&&(tt=K.length-1);for(let lt=0,Ct=h+p*2;lt<Ct;lt++){const _t=O*lt,T=O*(lt+1),y=R+ot+_t,k=R+tt+_t,Y=R+tt+T,J=R+ot+T;It(y,k,Y,J)}}}function dt(K,R,at){l.push(K),l.push(R),l.push(at)}function Ut(K,R,at){Bt(K),Bt(R),Bt(at);const ot=s.length/3,tt=S.generateTopUV(n,s,ot-3,ot-2,ot-1);Zt(tt[0]),Zt(tt[1]),Zt(tt[2])}function It(K,R,at,ot){Bt(K),Bt(R),Bt(ot),Bt(R),Bt(at),Bt(ot);const tt=s.length/3,lt=S.generateSideWallUV(n,s,tt-6,tt-3,tt-2,tt-1);Zt(lt[0]),Zt(lt[1]),Zt(lt[3]),Zt(lt[1]),Zt(lt[2]),Zt(lt[3])}function Bt(K){s.push(l[K*3+0]),s.push(l[K*3+1]),s.push(l[K*3+2])}function Zt(K){r.push(K.x),r.push(K.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return $g(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,o=t.shapes.length;r<o;r++){const a=e[t.shapes[r]];n.push(a)}const s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Ga[s.type]().fromJSON(s)),new dl(n,t.options)}}const qg={generateTopUV:function(i,t,e,n,s){const r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[s*3],h=t[s*3+1];return[new it(r,o),new it(a,l),new it(c,h)]},generateSideWallUV:function(i,t,e,n,s,r){const o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[s*3],f=t[s*3+1],g=t[s*3+2],v=t[r*3],p=t[r*3+1],m=t[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new it(o,1-l),new it(c,1-u),new it(d,1-g),new it(v,1-m)]:[new it(a,1-l),new it(h,1-u),new it(f,1-g),new it(p,1-m)]}};function $g(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class fl extends as{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new fl(t.radius,t.detail)}}class di extends as{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new di(t.radius,t.detail)}}class oo extends Fe{constructor(t=.5,e=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],h=[];let u=t;const d=(e-t)/s,f=new C,g=new it;for(let v=0;v<=s;v++){for(let p=0;p<=n;p++){const m=r+p/n*o;f.x=u*Math.cos(m),f.y=u*Math.sin(m),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,h.push(g.x,g.y)}u+=d}for(let v=0;v<s;v++){const p=v*(n+1);for(let m=0;m<n;m++){const S=m+p,M=S,x=S+n+1,L=S+n+2,E=S+1;a.push(M,x,E),a.push(x,L,E)}}this.setIndex(a),this.setAttribute("position",new se(l,3)),this.setAttribute("normal",new se(c,3)),this.setAttribute("uv",new se(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new oo(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class ge extends Fe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new C,d=new C,f=[],g=[],v=[],p=[];for(let m=0;m<=n;m++){const S=[],M=m/n;let x=0;m===0&&o===0?x=.5/e:m===n&&l===Math.PI&&(x=-.5/e);for(let L=0;L<=e;L++){const E=L/e;u.x=-t*Math.cos(s+E*r)*Math.sin(o+M*a),u.y=t*Math.cos(o+M*a),u.z=t*Math.sin(s+E*r)*Math.sin(o+M*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),p.push(E+x,1-M),S.push(c++)}h.push(S)}for(let m=0;m<n;m++)for(let S=0;S<e;S++){const M=h[m][S+1],x=h[m][S],L=h[m+1][S],E=h[m+1][S+1];(m!==0||o>0)&&f.push(M,x,E),(m!==n-1||l<Math.PI)&&f.push(x,L,E)}this.setIndex(f),this.setAttribute("position",new se(g,3)),this.setAttribute("normal",new se(v,3)),this.setAttribute("uv",new se(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ge(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class pl extends as{constructor(t=1,e=0){const n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],s=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,s,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new pl(t.radius,t.detail)}}class Dn extends Fe{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const o=[],a=[],l=[],c=[],h=new C,u=new C,d=new C;for(let f=0;f<=n;f++)for(let g=0;g<=s;g++){const v=g/s*r,p=f/n*Math.PI*2;u.x=(t+e*Math.cos(p))*Math.cos(v),u.y=(t+e*Math.cos(p))*Math.sin(v),u.z=e*Math.sin(p),a.push(u.x,u.y,u.z),h.x=t*Math.cos(v),h.y=t*Math.sin(v),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(g/s),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=s;g++){const v=(s+1)*f+g-1,p=(s+1)*(f-1)+g-1,m=(s+1)*(f-1)+g,S=(s+1)*f+g;o.push(v,p,S),o.push(p,m,S)}this.setIndex(o),this.setAttribute("position",new se(a,3)),this.setAttribute("normal",new se(l,3)),this.setAttribute("uv",new se(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Dn(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class Gi extends _i{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Gt(16777215),this.specular=new Gt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=rl,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.combine=Qr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Te extends _i{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=rl,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.combine=Qr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Nh extends Ne{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Gt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Us extends Nh{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ne.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Gt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const Xo=new pe,Pc=new C,Lc=new C;class Yg{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new it(512,512),this.map=null,this.mapPass=null,this.matrix=new pe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ll,this._frameExtents=new it(1,1),this._viewportCount=1,this._viewports=[new Me(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Pc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Pc),Lc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Lc),e.updateMatrixWorld(),Xo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Xo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Xo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Zg extends Yg{constructor(){super(new xh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ds extends Nh{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ne.DEFAULT_UP),this.updateMatrix(),this.target=new Ne,this.shadow=new Zg}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ja}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ja);let Ee=null,qe=!1,Sr=!1,br=-1/0;const Ic=1100,Uc=[],en={async init(){var i,t;try{if(window.CrazyGames&&window.CrazyGames.SDK){Ee=window.CrazyGames.SDK,await Ee.init(),qe=!0;try{(t=(i=Ee.game).addSettingsChangeListener)==null||t.call(i,e=>Uc.forEach(n=>n(e)))}catch{}}}catch(e){console.warn("CrazyGames SDK init failed, running standalone",e),Ee=null,qe=!1}},get available(){return qe},get environment(){try{return(Ee==null?void 0:Ee.environment)||"none"}catch{return"none"}},loadingStart(){try{qe&&Ee.game.loadingStart()}catch{}},loadingStop(){try{qe&&Ee.game.loadingStop()}catch{}},gameplayStart(){if(!(Sr||performance.now()-br<Ic)){Sr=!0,br=performance.now();try{qe&&Ee.game.gameplayStart()}catch{}}},gameplayStop(){if(!(!Sr||performance.now()-br<Ic)){Sr=!1,br=performance.now();try{qe&&Ee.game.gameplayStop()}catch{}}},happytime(){try{qe&&Ee.game.happytime()}catch{}},get muteAudio(){var i;try{return!!(qe&&((i=Ee.game.settings)!=null&&i.muteAudio))}catch{return!1}},onSettings(i){Uc.push(i)},async hasAdblock(){if(!qe)return!0;try{return!!await Ee.ad.hasAdblock()}catch{return!1}},rewarded(i={}){return new Promise(t=>{var e;if(!qe){t(!1);return}try{Ee.ad.requestAd("rewarded",{adStarted:()=>{var n;return(n=i.onStart)==null?void 0:n.call(i)},adFinished:()=>{var n;(n=i.onEnd)==null||n.call(i),t(!0)},adError:n=>{var s,r;(s=i.onEnd)==null||s.call(i),(r=i.onError)==null||r.call(i,n),t(!1)}})}catch{(e=i.onEnd)==null||e.call(i),t(!1)}})},midgame(i={}){return new Promise(t=>{var e;if(!qe){t();return}try{Ee.ad.requestAd("midgame",{adStarted:()=>{var n;return(n=i.onStart)==null?void 0:n.call(i)},adFinished:()=>{var n;(n=i.onEnd)==null||n.call(i),t()},adError:()=>{var n;(n=i.onEnd)==null||n.call(i),t()}})}catch{(e=i.onEnd)==null||e.call(i),t()}})},getItem(i){try{if(qe&&Ee.data)return Ee.data.getItem(i)}catch{}try{return localStorage.getItem(i)}catch{return null}},setItem(i,t){try{if(qe&&Ee.data){Ee.data.setItem(i,t);return}}catch{}try{localStorage.setItem(i,t)}catch{}}},$e=[{id:0,name:"Common",color:"#9aa4b5",dark:"#5d6679",mult:1},{id:1,name:"Uncommon",color:"#4fd16b",dark:"#23833a",mult:1.8},{id:2,name:"Rare",color:"#3fa2ff",dark:"#1d5fb3",mult:3.2},{id:3,name:"Epic",color:"#b25cff",dark:"#6b27b0",mult:5.6},{id:4,name:"Legendary",color:"#ffc531",dark:"#b17c00",mult:9.5},{id:5,name:"Mythic",color:"#ff4d5e",dark:"#a8182a",mult:16}],vn=[{id:"gloves",name:"Gloves",stat:"atk",base:4},{id:"helmet",name:"Helmet",stat:"hp",base:22},{id:"armor",name:"Armor",stat:"hp",base:30},{id:"belt",name:"Belt",stat:"atk",base:3},{id:"pants",name:"Pants",stat:"hp",base:18},{id:"shoes",name:"Shoes",stat:"atk",base:2}],Dc=[10,15,20,30,40,50];function Ns(i){const t=vn.find(n=>n.id===i.slot),e=$e[i.rarity];return Math.round(t.base*e.mult*(1+.12*(i.lvl-1)))}function Nc(i){return Math.round(40*Math.pow(1.16,i.lvl-1)*(1+i.rarity*.6))}const un=[{id:"pebbit",name:"Drip",rarity:0,color:"#4fc3ff",stat:"hp",base:3,element:"water",skill:{name:"Tidal Splash",desc:"A wave that knocks enemies back"},costume:{cape:"#ffd23f",mask:"#1b3a8c"}},{id:"snork",name:"Pebble",rarity:0,color:"#c9a27a",stat:"atk",base:3,element:"rock",skill:{name:"Boulder Toss",desc:"Hurls a boulder that stuns on impact"},costume:{cape:"#5a7d3a",mask:"#3b2a1c"}},{id:"mossy",name:"Sprout",rarity:0,color:"#6fdc5a",stat:"xp",base:4,element:"leaf",skill:{name:"Healing Bloom",desc:"Heals you and slows nearby enemies"},costume:{cape:"#ff8fc8",mask:"#2a6b1f"}},{id:"fizzle",name:"Ember",rarity:1,color:"#ff7a2e",stat:"atk",base:5,element:"fire",skill:{name:"Flamethrower",desc:"Sprays a cone of burning fire"},costume:{cape:"#2b2d42",mask:"#ffd23f"}},{id:"crumble",name:"Frosty",rarity:1,color:"#9fe8ff",stat:"hp",base:5,element:"ice",skill:{name:"Frost Nova",desc:"Freezes every enemy around it"},costume:{cape:"#ffffff",mask:"#2f6fb8"}},{id:"zapzap",name:"Zappy",rarity:1,color:"#ffe14a",stat:"gold",base:6,element:"spark",skill:{name:"Chain Lightning",desc:"A bolt that jumps between 5 enemies"},costume:{cape:"#3a2bb8",mask:"#1a1030"}},{id:"glub",name:"Toxi",rarity:2,color:"#9b6bff",stat:"atk",base:8,element:"poison",skill:{name:"Toxic Cloud",desc:"Leaves a poison cloud that eats HP"},costume:{cape:"#8dff5a",mask:"#2a1650"}},{id:"thornling",name:"Bubbly",rarity:2,color:"#ff8fd0",stat:"hp",base:8,element:"bubble",skill:{name:"Bubble Trap",desc:"Traps an enemy in a bubble, then pops"},costume:{cape:"#5ad8ff",mask:"#ffffff"}},{id:"wisp",name:"Nebby",rarity:3,color:"#7d6bff",stat:"xp",base:12,element:"cosmic",skill:{name:"Meteor Shower",desc:"Calls down a rain of meteors"},costume:{cape:"#101535",mask:"#ffd6f5"}},{id:"brambo",name:"Magmo",rarity:3,color:"#e8452a",stat:"atk",base:12,element:"lava",skill:{name:"Lava Pool",desc:"Melts the ground into burning lava"},costume:{cape:"#3a2626",mask:"#ffb347"}},{id:"sunpuff",name:"Aurum",rarity:4,color:"#ffc93a",stat:"gold",base:18,element:"gold",skill:{name:"Midas Strike",desc:"A golden blow that drops extra coins"},costume:{cape:"#b0122e",mask:"#6b3fd6"}},{id:"voidlet",name:"Voidling",rarity:5,color:"#4b2a8c",stat:"atk",base:25,element:"void",skill:{name:"Black Hole",desc:"Sucks enemies in, then detonates"},costume:{cape:"#d06bff",mask:"#0b0618"}}],qo=[52,28,12,5.5,2,.5];function ps(i){return 2+i*3}function Oi(i,t){return i.base*(1+.35*(t-1))}const ms=["Rookie-1","Rookie-2","Amateur-1","Amateur-2","Pro-1","Pro-2","Champion-1","Champion-2","Legend-1","Legend-2","Titan-1","Titan-2"],Wi=[{id:"atk",name:"Power Fist",stat:"atk",per:4,desc:"+{v}% Attack"},{id:"hp",name:"Iron Body",stat:"hp",per:5,desc:"+{v}% Max HP"},{id:"xp",name:"Fast Learner",stat:"xp",per:5,desc:"+{v}% Fight EXP"},{id:"gold",name:"Gold Rush",stat:"gold",per:6,desc:"+{v}% Gold"}],Fi=3;function $o(i,t){return Math.round(120*Math.pow(1.55,i)*(1+t*.5))}const Xi=[{name:"Backyard Brawl",color:"#8a5a33",rope:"#d33"},{name:"Street Pit",color:"#6b6b73",rope:"#f5a623"},{name:"Crown Arena",color:"#3b4c7a",rope:"#9b4dff"},{name:"Steel Colosseum",color:"#4b5560",rope:"#27d3ff"},{name:"Volcano Arena",color:"#5a2320",rope:"#ff6a00"},{name:"Sky Palace",color:"#e8e3d6",rope:"#ffd54a"}],Fh=[{tier:0,key:"burnBoost",desc:"Burn damage +25%"},{tier:1,key:"armBoost",desc:"Each extra arm +20% punch damage"},{tier:2,key:"lvlHeal",desc:"Level ups restore 3% HP"},{tier:3,key:"reflect",desc:"Reflect 15% of damage received"},{tier:4,key:"startSkill",desc:"Start every fight with a free skill"},{tier:5,key:"bossDmg",desc:"+30% damage to bosses"}];function Fr(i,t){const e=i*10+t;return{hp:e*10,atk:e*5,def:e*1}}function Fc(i,t){return Math.round(150*Math.pow(1.13,i*10+t))}const Kg=[{id:"dmg",name:"Heavy Hands",max:10,desc:"Punch damage +20%",icon:"fist",color:"#ff5a5a"},{id:"rate",name:"Quick Jabs",max:8,desc:"Punch speed +15%",icon:"bolt",color:"#ffd23f"},{id:"range",name:"Long Reach",max:6,desc:"Punch range +4 feet",icon:"range",color:"#4fd1ff"},{id:"arm",name:"Extra Arm",max:4,desc:"Grow one more punching arm",icon:"arm",color:"#b25cff"},{id:"hp",name:"Thick Skin",max:8,desc:"Max HP +20% and heal 30%",icon:"heart",color:"#ff4d7a"},{id:"burn",name:"Fire Gloves",max:5,desc:"Punches set enemies ablaze",icon:"fire",color:"#ff8a2a"},{id:"chain",name:"Shock Knuckle",max:5,desc:"Hits chain lightning",icon:"bolt",color:"#6be3ff"},{id:"slam",name:"Ground Slam",max:5,desc:"Periodic shockwave around you",icon:"slam",color:"#f0a060"},{id:"crit",name:"Lucky Strike",max:6,desc:"Crit chance +8%",icon:"star",color:"#ffe066"},{id:"leech",name:"Vampire Fist",max:5,desc:"Heal 3% of damage dealt",icon:"drop",color:"#e0354b"},{id:"magnet",name:"Magnet",max:3,desc:"Pick up gems from further",icon:"magnet",color:"#9ad0ff"},{id:"splash",name:"Shockwave Fist",max:4,desc:"Punches hit nearby enemies",icon:"burst",color:"#ffae4f"}],gs={grunt:{hp:1,dmg:1,speed:2.1,scale:1,color:"#e8343f",xp:1,from:1},runner:{hp:.6,dmg:.7,speed:3.6,scale:.8,color:"#ff6a4f",xp:1,from:2},brute:{hp:4.5,dmg:2.2,speed:1.4,scale:1.45,color:"#b01e2e",xp:4,from:3},thrower:{hp:.9,dmg:1.2,speed:1.8,scale:.95,color:"#d44fa0",xp:2,from:4,ranged:!0},boss:{hp:20,dmg:2,speed:1.4,scale:2.4,color:"#8e0f1f",xp:25,boss:!0}},ws=[{id:"lvl",text:"Gain {n} levels in fights",stat:"levels",base:15},{id:"kill",text:"Defeat {n} enemies",stat:"kills",base:150},{id:"stage",text:"Clear {n} stages",stat:"stages",base:2},{id:"gear",text:"Upgrade gear {n} times",stat:"gearUps",base:4},{id:"boss",text:"Defeat {n} bosses",stat:"bosses",base:2},{id:"pet",text:"Summon {n} pets",stat:"summons",base:5}],kc="punchhorde_save_v1";function _s(){const i={},t=[];let e=1;for(const n of["gloves","shoes"]){const s={uid:e++,slot:n,rarity:0,lvl:1};t.push(s),i[n]=s.uid}return t.push({uid:e++,slot:"helmet",rarity:0,lvl:1}),t.push({uid:e++,slot:"gloves",rarity:0,lvl:1}),{v:1,coins:150,gems:30,shards:20,stage:1,bestStage:1,uid:e,items:t,equipped:i,pets:{},petSlots:[null,null,null],talents:{},talentTier:0,ring:{tier:0,star:0},stats:{levels:0,kills:0,stages:0,gearUps:0,bosses:0,summons:0},mission:{idx:0,round:0,startVal:0},speedUnlocked:!1,lastEvent:0,lastSeen:Date.now(),muted:!1,musicMuted:!1,tutorialDone:!1}}const Rt={state:_s(),load(){try{const i=en.getItem(kc);if(i){const t=JSON.parse(i);this.state=Object.assign(_s(),t),this.state.stats=Object.assign(_s().stats,t.stats||{})}}catch(i){console.warn("Save corrupted, starting fresh",i),this.state=_s()}for(const i of Object.keys(this.state.equipped))vn.find(t=>t.id===i)||delete this.state.equipped[i];return this.state.mission.idx>=ws.length&&(this.state.mission.idx=0),this.state},save(){this.state.lastSeen=Date.now();try{en.setItem(kc,JSON.stringify(this.state))}catch{}},reset(){this.state=_s(),this.save()}};let Yo=null;function Ae(){Yo||(Yo=setTimeout(()=>{Yo=null,Rt.save()},800))}const me={torso:new is(.3,.45,4,10),head:new ge(.3,16,12),limb:new is(.11,.5,3,8),shoulder:new ge(.14,10,8),glove:new ge(.24,14,10),cuff:new De(.16,.19,.16,12),armTube:new De(.085,.085,1,8,1,!0).translate(0,.5,0),eye:new ge(.055,8,6),gem:new di(.2,0),coin:new De(.2,.2,.06,14),spark:new pl(.12,0),rock:new ge(.22,7,5),helmet:new ge(.34,16,10,0,Math.PI*2,0,Math.PI*.55),belt:new Dn(.31,.06,6,18),shoe:new he(.22,.14,.34),headband:new Dn(.3,.05,6,18),crown:new De(.28,.22,.22,6,1,!0),plane:new vi(1,1)},Zo=new Map;function Ft(i,t={}){const{unique:e,...n}=t,s=i+JSON.stringify(n);if(!e&&Zo.has(s))return Zo.get(s);const r=new Te({color:i,...n});return e||Zo.set(s,r),r}function ml(i,t,e){const n=document.createElement("canvas");n.width=i,n.height=t,e(n.getContext("2d"),i,t);const s=new mg(n);return s.colorSpace=tn,s.anisotropy=4,s}const Jg=ml(64,64,(i,t,e)=>{const n=i.createRadialGradient(t/2,e/2,2,t/2,e/2,t/2);n.addColorStop(0,"rgba(0,0,0,0.55)"),n.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=n,i.fillRect(0,0,t,e)}),jg=new Re({map:Jg,transparent:!0,depthWrite:!1});function gl(i=1.2){const t=new q(me.plane,jg);return t.rotation.x=-Math.PI/2,t.scale.set(i,i,1),t.position.y=.02,t.renderOrder=1,t}function $r({color:i="#e8343f",player:t=!1,uniqueMat:e=!1}={}){const n=new Se,s=new Se;n.add(s);const r=e?new Te({color:i}):Ft(i),o=new q(me.torso,r);o.position.y=1.25,s.add(o);const a=new q(me.head,r);a.position.y=1.95,s.add(a);const l=Ft("#ffffff"),c=Ft("#111418");for(const g of[-1,1]){const v=new q(me.eye,t?l:c);v.position.set(.11*g,1.99,.26),v.scale.set(t?1.2:.9,t?1.5:1.2,.6),s.add(v)}const h=[];for(const g of[-1,1]){const v=new Se;v.position.set(.15*g,.88,0);const p=new q(me.limb,r);p.position.y=-.4,v.add(p),s.add(v),h.push(v)}const u=[],d=[];for(const g of[-1,1]){const v=new q(me.shoulder,r);if(v.position.set(.36*g,1.52,0),s.add(v),u.push(v),!t){const p=new Se;p.position.copy(v.position);const m=new q(me.limb,r);m.position.y=-.35,p.add(m),p.rotation.x=-.6,s.add(p),d.push(p)}}const f=gl(t?1.6:1.3);return n.add(f),{root:n,body:s,torso:o,head:a,legs:h,arms:d,shoulders:u,mat:r,shadow:f}}function _l(i){const t=new q(me.headband,Ft("#ff7a1a",{unique:!0}));t.position.y=2.03,t.rotation.x=Math.PI/2,i.body.add(t);const e=new q(me.helmet,Ft("#9aa4b5",{unique:!0}));e.position.y=1.98,i.body.add(e);const n=new q(me.belt,Ft("#9aa4b5",{unique:!0}));n.position.y=.98,n.rotation.x=Math.PI/2,i.body.add(n);const s=new q(new is(.33,.25,4,10),Ft("#9aa4b5",{unique:!0}));s.position.y=1.35,i.body.add(s);const r=[],o=[];for(const a of i.legs){const l=new q(me.shoe,Ft("#9aa4b5",{unique:!0}));l.position.set(0,-.78,.06),a.add(l),r.push(l);const c=new q(new is(.14,.28,3,8),Ft("#9aa4b5",{unique:!0}));c.position.y=-.2,a.add(c),o.push(c)}return i.gear={helmet:e,belt:n,armor:s,shoes:r,pants:o,band:t},i}function vl(i="#e23"){const t=new Se,e=new q(me.glove,Ft(i,{unique:!0}));e.scale.set(1,.95,1.15),t.add(e);const n=new q(me.cuff,Ft("#f4f4f4"));return n.rotation.x=Math.PI/2,n.position.z=-.22,t.add(n),t.userData.ball=e,t}function Qg(i){const t=new q(me.crown,Ft("#ffcc33",{emissive:"#553300"}));return t.position.y=2.32,i.body.add(t),t}const xl=[[0,0],[.28,0],[.4,.03],[.46,.1],[.47,.2],[.44,.31],[.37,.43],[.27,.54],[.17,.63],[.08,.71],[.03,.77],[0,.8]].map(([i,t])=>new it(i,t)),t_=new xi(xl,28),Oc=new xi(xl.map(i=>new it(i.x*.62,i.y*.62)),20),e_=new ge(.1,14,10),n_=new ge(.06,12,8),i_=new ge(.022,8,6),s_=new Mi(.05,12),r_=new Dn(.045,.013,6,14,Math.PI);function _n(i,t=.8){return new Te({color:i,emissive:i,emissiveIntensity:t})}function o_(i,t){const e=[],n=(s,r,o,a)=>(s.position.set(r,o,a),t.add(s),s);switch(i){case"water":{const s=n(new q(new xi(xl,16),new Gi({color:"#bfefff",transparent:!0,opacity:.85,shininess:120})),0,.84,0);s.scale.setScalar(.28),e.push(r=>{s.position.y=.84+Math.sin(r*4)*.03});break}case"rock":{const s=Ft("#7c7f8c");[[-.14,.62,.05,.11],[.12,.66,-.02,.13],[0,.78,0,.09]].forEach(([r,o,a,l])=>{n(new q(new ss(l,0),s),r,o,a).rotation.set(r*5,o*3,a)});break}case"leaf":{const s=Ft("#3fae2a"),r=n(new q(new De(.018,.022,.16,6),Ft("#2f7a1f")),0,.86,0);r.rotation.z=.1;for(const o of[-1,1]){const a=n(new q(new ge(.12,10,6),s),.11*o,.95,0);a.scale.set(1,.3,.55),e.push(l=>{a.rotation.z=o*(.5+Math.sin(l*3)*.12)})}break}case"fire":{[["#ff5a1a",.26,0,0],["#ffb02e",.19,-.1,.03],["#ffe066",.13,.09,.04]].forEach(([s,r,o,a],l)=>{const c=n(new q(new Hi(.08+r*.2,r,8),_n(s,.9)),o,.74+r/2,a);e.push(h=>{c.scale.y=1+Math.sin(h*14+l*2)*.18,c.rotation.z=Math.sin(h*9+l)*.15})});break}case"ice":{const s=new Gi({color:"#e4fbff",emissive:"#4fb8e6",emissiveIntensity:.35,shininess:140,transparent:!0,opacity:.92});[[-.12,.68,-.35,1.6],[.02,.82,0,2.2],[.14,.68,.4,1.5]].forEach(([r,o,a,l])=>{const c=n(new q(new di(.07,0),s),r,o,0);c.scale.set(1,l,1),c.rotation.z=a});break}case"spark":{const s=new Lh;s.moveTo(0,0),s.lineTo(.06,.1),s.lineTo(.01,.1),s.lineTo(.07,.22),s.lineTo(-.03,.08),s.lineTo(.02,.08),s.lineTo(-.03,0);const r=n(new q(new dl(s,{depth:.03,bevelEnabled:!1}),_n("#fff27a",.9)),-.02,.76,-.015),o=n(new q(new ge(.05,10,8),_n("#ffffff",1)),.05,1,0);e.push(a=>{o.scale.setScalar(.8+Math.abs(Math.sin(a*12))*.5),r.rotation.y=Math.sin(a*6)*.3});break}case"poison":{const s=new Gi({color:"#8dff5a",emissive:"#2a8a10",transparent:!0,opacity:.85,shininess:100}),r=[0,1,2].map(o=>n(new q(new ge(.035+o*.012,10,8),s),0,.8,0));e.push(o=>r.forEach((a,l)=>{const c=(o*.6+l/3)%1;a.position.set(Math.sin(l*2.1)*.12,.78+c*.35,Math.cos(l*2.1)*.08),a.scale.setScalar(1-c*.6)}));break}case"bubble":{const s=Ft("#ffffff");for(const r of[-1,1]){const o=n(new q(new Hi(.08,.16,4),s),.09*r,.72,.02);o.rotation.z=r*Math.PI/2}n(new q(new ge(.04,10,8),s),0,.72,.03);break}case"cosmic":{const s=n(new q(new Dn(.62,.03,8,40),_n("#c9b8ff",.5)),0,.3,0);s.rotation.set(Math.PI/2-.35,0,.25);const r=[0,1,2].map(()=>n(new q(new di(.04,0),_n("#fff6a8",1)),0,.5,0));e.push(o=>{s.rotation.z=.25+o*.8,r.forEach((a,l)=>{const c=o*1.5+l*2.1;a.position.set(Math.cos(c)*.55,.45+Math.sin(c*1.3)*.2,Math.sin(c)*.4),a.rotation.y=o*4})});break}case"lava":{const s=Ft("#3a2626");[[-.15,.58,.18,.1],[.16,.6,.12,.09],[0,.74,.02,.1]].forEach(([o,a,l,c])=>n(new q(new ss(c,0),s),o,a,l));const r=n(new q(new ge(.06,8,6),_n("#ffb347",1)),0,.9,0);e.push(o=>{const a=o*.8%1;r.position.y=.85+a*.3,r.scale.setScalar(Math.max(.01,1-a))});break}case"gold":{const s=new Gi({color:"#ffd23f",emissive:"#6b4a00",shininess:120,side:Ye});n(new q(new De(.15,.13,.12,8,1,!0),s),0,.76,0);for(let r=0;r<4;r++){const o=r/4*Math.PI*2;n(new q(new Hi(.03,.08,4),s),Math.cos(o)*.14,.86,Math.sin(o)*.14)}n(new q(new di(.035,0),_n("#ff3b5c",.6)),0,.78,.15);break}case"void":{const s=Ft("#1c1030");for(const o of[-1,1]){const a=n(new q(new Hi(.05,.28,8),s),.17*o,.68,0);a.rotation.z=-o*.55}const r=n(new q(new Dn(.16,.018,6,24),_n("#d06bff",1)),0,.98,0);r.rotation.x=Math.PI/2,e.push(o=>{r.position.y=.98+Math.sin(o*3)*.04});break}}return e}const a_=[[.468,.235],[.46,.27],[.448,.31],[.43,.35],[.41,.375]].map(([i,t])=>new it(i*1.035,t)),l_=new xi(a_,18,-1.25,2.5),c_=new Mi(.085,20),h_=new oo(.085,.108,20),u_=7,d_=9,Vn=new C,Bc=new pe;function f_(i,t){const e=u_,n=d_,s=e*n,r=[];for(let x=0;x<n;x++){const L=x/(n-1),E=.215+L*.3,A=.6-L*.56;for(let P=0;P<e;P++){const V=Math.PI+(P/(e-1)-.5)*1.75;r.push(new C(Math.sin(V)*E,A,Math.cos(V)*E))}}const o=new Float32Array(s*3);r.forEach((x,L)=>x.toArray(o,L*3));const a=new Fe;a.setAttribute("position",new mn(o,3));const l=[];for(let x=0;x<n-1;x++)for(let L=0;L<e-1;L++){const E=x*e+L,A=E+1,P=E+e,V=P+1;l.push(E,P,A,A,P,V)}a.setIndex(l),a.computeVertexNormals();const c=new q(a,t);c.frustumCulled=!1,i.add(c);const h=[],u=(x,L)=>h.push([x,L,r[x].distanceTo(r[L])]);for(let x=0;x<n;x++)for(let L=0;L<e;L++){const E=x*e+L;L<e-1&&u(E,E+1),x<n-1&&u(E,E+e),x<n-1&&L<e-1&&(u(E,E+e+1),u(E+1,E+e))}const d=r.map(x=>x.clone()),f=r.map(x=>x.clone()),g=new C,v=new C,p=new C;let m=!1,S=Math.random()*10;function M(x){if(!(x>0))return;x=Math.min(x,1/30),i.updateWorldMatrix(!0,!1);const L=i.matrixWorld;(i.parent||i).getWorldScale(v);const E=v.x;if(!m){for(let D=0;D<s;D++)d[D].copy(r[D]).applyMatrix4(L),f[D].copy(d[D]);m=!0}S+=x;const A=x*x,P=-14*E*A,V=Math.sin(S*1.9)*1.2*E*A,_=Math.cos(S*1.4)*1.2*E*A;for(let D=e;D<s;D++){const F=d[D],X=f[D],O=D/e|0,Q=D%e,G=O/(n-1),ct=(F.x-X.x)*.95,ft=(F.y-X.y)*.95,pt=(F.z-X.z)*.95,Wt=Math.min(1,Math.hypot(ct,pt)/(.04*E)),Jt=Math.sin(S*11+O*.9+Q*1.3)*(.6+Wt*2.2)*E*A*G;X.copy(F),F.x+=ct+V*G+Jt,F.y+=ft+P+Math.cos(S*9+Q*1.1+O*.7)*Jt*.8,F.z+=pt+_*G-Jt}for(let D=0;D<e;D++)d[D].copy(r[D]).applyMatrix4(L),f[D].copy(d[D]);g.set(0,.3,0).applyMatrix4(L);const b=.5*E,B=(i.parent?i.parent.getWorldPosition(p).y:0)+.02;for(let D=0;D<4;D++){for(const[F,X,O]of h){const Q=d[F],G=d[X];Vn.subVectors(G,Q);const ct=Vn.length()||1e-6,ft=(ct-O*E)/ct,pt=F<e?0:X<e?1:.5,Wt=X<e?0:F<e?1:.5;Q.addScaledVector(Vn,ft*pt),G.addScaledVector(Vn,-ft*Wt)}for(let F=e;F<s;F++){Vn.subVectors(d[F],g);const X=Vn.length();X<b&&d[F].addScaledVector(Vn,(b-X)/(X||1)),d[F].y<B&&(d[F].y=B)}}Bc.copy(L).invert();for(let D=0;D<s;D++)Vn.copy(d[D]).applyMatrix4(Bc).toArray(o,D*3);a.attributes.position.needsUpdate=!0,a.computeVertexNormals()}return{step:M,mesh:c,reset(){m=!1}}}function p_(i,t,e){const n=new Te({color:t.cape,side:Ye}),s=f_(i,n),r=new q(new Dn(.205,.028,6,20,Math.PI*1.1),n);r.rotation.set(Math.PI/2,0,Math.PI*.45),r.position.y=.6,i.add(r);const o=new q(l_,new Te({color:t.mask,side:Ye}));i.add(o);const a=new q(h_,new Te({color:"#ffd23f",emissive:"#5a3a00"})),l=new q(c_,new Te({color:e,emissive:e,emissiveIntensity:.35}));for(const c of[l,a])c.position.set(0,.1,.472),c.rotation.x=-.08,i.add(c);return s}function kh(i,t="water",e=null){const n=new Se,s=new Se;n.add(s);const r=new Gt(i),o=t==="lava",a=new Gi({color:r,transparent:!0,opacity:t==="void"?.95:.82,shininess:110,specular:new Gt("#ffffff"),emissive:o?new Gt("#ff3a0a"):r.clone().multiplyScalar(.12),emissiveIntensity:o?.35:1}),l=new q(t_,a);l.renderOrder=2,s.add(l);const c=o||t==="void"?new q(Oc,_n(o?"#ffcf4a":"#b04dff",.9)):new q(Oc,Ft("#"+r.clone().multiplyScalar(.55).getHexString()));c.position.y=.04,s.add(c);const h=new q(new ge(.08,10,8),new Re({color:"#ffffff",transparent:!0,opacity:.75}));h.scale.set(.6,1.3,.35),h.position.set(-.22,.42,.28),h.rotation.z=.5,s.add(h);const u=Ft("#ffffff"),d=t==="void"?_n("#ffd84a",1):Ft("#1a1030"),f=new Re({color:"#ffffff"}),g=new Re({color:"#ff7aa8",transparent:!0,opacity:.55}),v=e?.045:0;for(const S of[-1,1]){const M=new q(e_,u);M.scale.set(.9,1.15,.5),M.position.set(.13*S,.3,.39+v),s.add(M);const x=new q(n_,d);x.scale.set(.9,1.2,.5),x.position.set(.13*S,.29,.44+v),s.add(x);const L=new q(i_,f);L.position.set(.13*S-.025,.33,.47+v),s.add(L);const E=new q(s_,g);E.position.set(.25*S,.2,.39),E.rotation.y=S*.55,s.add(E)}const p=new q(r_,Ft("#1a1030"));p.position.set(0,.2,.44),p.rotation.z=Math.PI,s.add(p);const m=o_(t,s);return e&&(n.userData.cloth=p_(s,e,i)),n.add(gl(.9)),n.userData.body=s,n.userData.tick=S=>m.forEach(M=>M(S)),n}function m_(i){return ml(512,512,(t,e,n)=>{t.fillStyle=i,t.fillRect(0,0,e,n);const s=10,r=n/s;for(let o=0;o<s;o++){const a=Math.random()*.18-.09;t.fillStyle=a>0?`rgba(255,230,190,${a})`:`rgba(0,0,0,${-a})`,t.fillRect(0,o*r,e,r),t.fillStyle="rgba(0,0,0,0.35)",t.fillRect(0,o*r,e,3);const l=Math.random()*e;t.fillRect(l,o*r,3,r);for(let c=0;c<18;c++){t.strokeStyle=`rgba(0,0,0,${.05+Math.random()*.08})`,t.beginPath();const h=o*r+Math.random()*r;t.moveTo(0,h),t.bezierCurveTo(e*.3,h+4,e*.6,h-4,e,h+2),t.stroke()}}})}function g_(){const i=ml(256,256,(t,e,n)=>{t.fillStyle="#2b3347",t.fillRect(0,0,e,n);for(let s=0;s<1400;s++){t.fillStyle=`rgba(${Math.random()>.5?"255,255,255":"0,0,0"},${Math.random()*.06})`;const r=2+Math.random()*8;t.fillRect(Math.random()*e,Math.random()*n,r,r)}});return i.wrapS=i.wrapT=Br,i.repeat.set(12,12),i}const Pn=8;function __(){const i=new Se,t=new q(new vi(140,140),new Te({map:g_()}));t.rotation.x=-Math.PI/2,t.position.y=-.6,i.add(t);const e=new Te({map:m_("#9a6a3e")}),n=Ft("#5b3a1f"),s=new q(new he(Pn*2+.6,.6,Pn*2+.6),[n,n,e,n,n,n]);s.position.y=-.3,i.add(s);const r=new q(new he(Pn*2+1.2,.25,Pn*2+1.2),Ft("#3a2412"));r.position.y=-.52,i.add(r);const o=Ft("#d8d8d8"),a=new Te({color:"#d33"}),l=new Te({color:"#d33"}),c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([E,A])=>new C(E*Pn,0,A*Pn));for(const E of c){const A=new q(new De(.16,.2,1.9,10),o);A.position.set(E.x,.95,E.z),i.add(A);const P=new q(new he(.42,1.1,.42),l);P.position.set(E.x,1.05,E.z),i.add(P)}const h=new De(.05,.05,1,6).rotateZ(Math.PI/2);for(let E=0;E<4;E++){const A=c[E],P=c[(E+1)%4];for(const V of[.55,1,1.45]){const _=new q(h,a);_.position.set((A.x+P.x)/2,V,(A.z+P.z)/2),_.scale.x=A.distanceTo(P),_.rotation.y=-Math.atan2(P.z-A.z,P.x-A.x),i.add(_)}}const u=Ft("#8f97a6"),d=Ft("#5a4030"),f=12.5,g=new he(1.1,.08,.22),v=new he(.07,.08,1);for(let E=0;E<4;E++){for(let A=-f;A<=f;A+=.7){const P=new q(g,d),V=E%2===0?A:E===1?f:-f,_=E%2===0?E===0?-f:f:A;P.position.set(V,-.54,_),E%2===0&&(P.rotation.y=Math.PI/2),i.add(P)}for(const A of[-.35,.35]){const P=new q(v,u);E%2===0?(P.position.set(0,-.46,(E===0?-f:f)+A),P.rotation.y=Math.PI/2):P.position.set((E===1?f:-f)+A,-.46,0),P.scale.z=f*2+.7,i.add(P)}}const p=new Te({color:"#46b8ff",emissive:"#0f4c8a"}),m=new di(.5,0),S=Ft("#4a5263"),M=new ss(.8,0),x=Oh(7);for(let E=0;E<70;E++){const A=x()*Math.PI*2,P=15+x()*22,V=Math.cos(A)*P,_=Math.sin(A)*P;if(x()<.45){const b=new Se,B=2+Math.floor(x()*4);for(let D=0;D<B;D++){const F=new q(m,p);F.scale.set(.5+x()*.4,1+x()*1.6,.5+x()*.4),F.position.set((x()-.5)*1.2,0,(x()-.5)*1.2),F.rotation.set((x()-.5)*.6,x()*3,(x()-.5)*.6),b.add(F)}b.position.set(V,-.4,_),i.add(b)}else{const b=new q(M,S);b.scale.set(1+x()*1.5,.6+x(),1+x()*1.5),b.position.set(V,-.5,_),b.rotation.y=x()*3,i.add(b)}}const L=new Re({color:"#ffdd88"});for(const[E,A]of[[-14,-6],[14,5],[-5,15],[6,-15]]){const P=new q(new De(.08,.1,2.6,6),Ft("#333842"));P.position.set(E,.7,A),i.add(P);const V=new q(new ge(.25,10,8),L);V.position.set(E,2.1,A),i.add(V)}return{root:i,floorMat:e,ropeMat:a,padMat:l,sideMat:n}}function v_(i,t){const e=["#ffffff","#c9ccd4","#b9c7ff","#b6c7d4","#ffb38a","#fff8e6"];i.floorMat.color.set(e[t%e.length]);const n=["#dd3333","#f5a623","#9b4dff","#27d3ff","#ff6a00","#ffd54a"];i.ropeMat.color.set(n[t%n.length]),i.padMat.color.set(n[t%n.length])}function x_(){const i=new Se,t=new Te({color:"#c8262e"}),e=Ft("#1d2230"),n=new Te({color:"#8fc4e8",emissive:"#1c3350"}),s=Ft("#d7dbe0"),r=[],o=(v,p=!0)=>(i.add(v),p&&r.push(v),v),a=new q(new he(4.4,.8,2),t);a.position.y=.8,i.add(a);const l=new q(new he(2.3,.7,1.8),t);l.position.set(-.2,1.55,0),i.add(l);const c=o(new q(new he(.08,.6,1.6),n));c.position.set(.95,1.55,0),c.rotation.z=-.35;for(const v of[-1,1])o(new q(new he(1.9,.5,.05),n)).position.set(-.2,1.58,.91*v),o(new q(new he(1.2,.6,.06),t)).position.set(.2,.85,1.02*v),o(new q(new he(.15,.12,.2),t)).position.set(.85,1.3,1.08*v);o(new q(new he(.2,.3,2.1),s)).position.set(2.25,.55,0),o(new q(new he(.2,.3,2.1),s)).position.set(-2.25,.55,0),o(new q(new he(1.3,.08,1.9),t)).position.set(1.5,1.22,0);for(const v of[-1,1])o(new q(new he(.06,.18,.35),new Re({color:"#fff6c0"}))).position.set(2.21,.9,.7*v);const f=new De(.45,.45,.35,16).rotateX(Math.PI/2);for(const[v,p]of[[1.4,1],[-1.4,1],[1.4,-1],[-1.4,-1]])o(new q(f,e)).position.set(v,.45,p);const g=gl(5);return g.scale.set(5.5,3,1),i.add(g),{root:i,body:a,cabin:l,paint:t,parts:r}}function M_(){const i=new Se,t=new q(new vi(200,200),Ft("#c98d62"));t.rotation.x=-Math.PI/2,i.add(t);const e=Oh(3),n=["#5a5f6b","#6b4a3a","#44505e","#7a6a5a","#3e3f48"];for(let a=0;a<26;a++){const l=new Se,c=Ft(n[a%n.length]),h=new q(new he(4,.9,1.9),c);h.position.y=.6,l.add(h);const u=new q(new he(2,.6,1.7),c);u.position.y=1.35,l.add(u),l.position.set(-30+e()*60,e()<.3?1.2:0,-10-e()*30),l.rotation.y=e()*Math.PI,l.position.y>0&&(l.rotation.z=.1),i.add(l)}const s=Ft("#7c5a44"),r=new q(new he(.5,16,.5),s);r.position.set(6,8,-32),i.add(r);const o=new q(new he(18,.4,.4),s);o.position.set(0,15.5,-32),o.rotation.z=.12,i.add(o);for(let a=0;a<6;a++){const l=new Se,c=new q(new De(.15,.25,3,6),Ft("#6b4a34"));c.position.y=1.5,l.add(c);const h=new q(new De(2.4,2.4,.4,10),Ft("#8d6a47"));h.position.y=3.2,l.add(h),l.position.set(-25+e()*50,0,-18-e()*20),i.add(l)}return i}function Oh(i){return function(){i|=0,i=i+1831565813|0;let t=Math.imul(i^i>>>15,1|i);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function Mn(i){return Rt.state.items.find(t=>t.uid===i)}function Zi(){const i=Rt.state;let t=10,e=100,n=0;const s={atk:0,hp:0,xp:0,gold:0};for(const a of vn){const l=Mn(i.equipped[a.id]);l&&(a.stat==="atk"?t+=Ns(l):e+=Ns(l))}for(const[a,l]of Object.entries(i.talents)){const c=Wi.find(h=>h.id===a.split(":")[1]);c&&(s[c.stat]+=c.per*l)}for(const a of i.petSlots){if(!a)continue;const l=un.find(h=>h.id===a),c=i.pets[a];l&&c&&(s[l.stat]+=Oi(l,c.lvl))}const r=Fr(i.ring.tier,i.ring.star);t+=r.atk*.2,e+=r.hp,n+=r.def,t=Math.round(t*(1+s.atk/100)),e=Math.round(e*(1+s.hp/100));const o={};for(const a of Fh)(i.ring.tier>a.tier||i.ring.tier===a.tier&&i.ring.star>=5)&&(o[a.key]=!0);return{atk:t,hp:e,def:n,xpMult:1+s.xp/100,goldMult:1+s.gold/100,traits:o,power:Math.round(t*12+e*1.5+n*8)}}function y_(i){return Wi.every(t=>(Rt.state.talents[`${i}:${t.id}`]||0)>=3)}function xe(i){if(i=Math.floor(i),i<1e3)return String(i);const t=["K","M","B","T","aa","ab","ac"];let e=-1,n=i;for(;n>=1e3&&e<t.length-1;)n/=1e3,e++;return(n>=100?n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2)).replace(/\.0+$/,"")+t[e]}let Kt=null,ai=null,Yr=null,Fs=null,kr=!1,Zr=!1,$a=!1,Ya=!1;const Ko={},Bh=.18,zh=.28;function S_(){if(Kt)return Kt;try{Kt=new(window.AudioContext||window.webkitAudioContext),ai=Kt.createGain(),ai.gain.value=Bh,ai.connect(Kt.destination),Yr=Kt.createGain(),Yr.connect(ai),Fs=Kt.createGain(),Fs.gain.value=Zr?0:zh,Fs.connect(ai)}catch{Kt=null}return Kt}function vs(){if(!ai)return;const i=Kt.currentTime;ai.gain.setTargetAtTime(kr||$a||Ya?0:Bh,i,.03),Fs.gain.setTargetAtTime(Zr?0:zh*(Kr==="menu"?.7:1),i,.2)}function Yt({f:i=440,f2:t=null,dur:e=.1,type:n="sine",vol:s=.5,delay:r=0,bus:o=Yr,attack:a=0}){const l=Kt.currentTime+r,c=Kt.createOscillator(),h=Kt.createGain();c.type=n,c.frequency.setValueAtTime(i,l),t&&c.frequency.exponentialRampToValueAtTime(t,l+e),a?(h.gain.setValueAtTime(1e-4,l),h.gain.exponentialRampToValueAtTime(s,l+a)):h.gain.setValueAtTime(s,l),h.gain.exponentialRampToValueAtTime(1e-4,l+e),c.connect(h),h.connect(o),c.start(l),c.stop(l+e+.02)}let wr=null;function Ie({dur:i=.08,vol:t=.4,freq:e=800,freq2:n=null,type:s="lowpass",q:r=1,delay:o=0,bus:a=Yr,attack:l=0}){const c=Kt.currentTime+o;if(!wr){wr=Kt.createBuffer(1,Kt.sampleRate,Kt.sampleRate);const f=wr.getChannelData(0);for(let g=0;g<f.length;g++)f[g]=Math.random()*2-1}const h=Kt.createBufferSource();h.buffer=wr,h.loop=!0;const u=Kt.createBiquadFilter();u.type=s,u.Q.value=r,u.frequency.setValueAtTime(e,c),n&&u.frequency.exponentialRampToValueAtTime(n,c+i);const d=Kt.createGain();l?(d.gain.setValueAtTime(1e-4,c),d.gain.exponentialRampToValueAtTime(t,c+l)):d.gain.setValueAtTime(t,c),d.gain.exponentialRampToValueAtTime(1e-4,c+i),h.connect(u),u.connect(d),d.connect(a),h.start(c,Math.random()*.5),h.stop(c+i+.02)}const Jo={punch:()=>{Ie({dur:.07,vol:.35,freq:1200}),Yt({f:160,f2:60,dur:.08,type:"triangle",vol:.4})},hit:()=>{Ie({dur:.05,vol:.25,freq:2500})},crit:()=>{Ie({dur:.1,vol:.4,freq:3e3}),Yt({f:900,f2:300,dur:.12,type:"square",vol:.12})},die:()=>{Yt({f:300,f2:90,dur:.15,type:"sawtooth",vol:.12})},hurt:()=>{Yt({f:200,f2:80,dur:.12,type:"square",vol:.15})},throw:()=>{Ie({dur:.18,vol:.18,freq:600,freq2:2400,type:"bandpass",q:2})},boss:()=>{Yt({f:110,f2:55,dur:.6,type:"sawtooth",vol:.3}),Yt({f:82,f2:41,dur:.8,type:"square",vol:.15,delay:.1})},slam:()=>{Ie({dur:.3,vol:.5,freq:400}),Yt({f:90,f2:40,dur:.3,type:"sine",vol:.5})},zap:()=>{Ie({dur:.06,vol:.2,freq:5e3}),Yt({f:1800,f2:600,dur:.07,type:"sawtooth",vol:.06})},metal:()=>{Ie({dur:.12,vol:.4,freq:3500}),Yt({f:420,f2:300,dur:.15,type:"square",vol:.1})},crash:()=>{Ie({dur:.35,vol:.45,freq:5e3,freq2:900}),Yt({f:260,f2:120,dur:.25,type:"square",vol:.08})},pew:()=>{Yt({f:900,f2:1500,dur:.06,type:"sine",vol:.08})},gem:()=>{Yt({f:1200,f2:1800,dur:.06,type:"sine",vol:.12})},coin:()=>{Yt({f:1400,dur:.05,type:"square",vol:.08}),Yt({f:2100,dur:.08,type:"square",vol:.08,delay:.05})},level:()=>{[523,659,784,1046].forEach((i,t)=>Yt({f:i,dur:.14,type:"triangle",vol:.3,delay:t*.07}))},win:()=>{[523,659,784,1046,1318].forEach((i,t)=>Yt({f:i,dur:.2,type:"triangle",vol:.3,delay:t*.09}))},lose:()=>{[392,330,262,196].forEach((i,t)=>Yt({f:i,dur:.25,type:"triangle",vol:.3,delay:t*.12}))},reward:()=>{[784,988,1175,1568].forEach((i,t)=>Yt({f:i,dur:.18,type:"sine",vol:.22,delay:t*.06})),Ie({dur:.4,vol:.08,freq:7e3,type:"highpass",delay:.05})},heal:()=>{[659,880,1109].forEach((i,t)=>Yt({f:i,dur:.3,type:"sine",vol:.18,delay:t*.08,attack:.02}))},click:()=>{Yt({f:700,f2:500,dur:.05,type:"sine",vol:.2})},buy:()=>{Yt({f:660,dur:.07,type:"triangle",vol:.3}),Yt({f:990,dur:.1,type:"triangle",vol:.3,delay:.06})},open:()=>{Ie({dur:.14,vol:.12,freq:700,freq2:2600,type:"bandpass",q:1.5}),Yt({f:440,f2:660,dur:.1,type:"sine",vol:.1})},error:()=>{Yt({f:220,dur:.09,type:"square",vol:.1}),Yt({f:175,dur:.14,type:"square",vol:.1,delay:.09})},tick:()=>{Yt({f:1500,dur:.02,type:"square",vol:.05})},splash:()=>{Ie({dur:.45,vol:.35,freq:2500,freq2:400}),Yt({f:300,f2:120,dur:.2,type:"sine",vol:.2})},whoosh:()=>{Ie({dur:.5,vol:.3,freq:300,freq2:1600,type:"bandpass",q:.8,attack:.08})},sizzle:()=>{Ie({dur:.2,vol:.1,freq:4e3,type:"highpass"})},freeze:()=>{[1760,2093,2637].forEach((i,t)=>Yt({f:i,f2:i*1.02,dur:.35,type:"sine",vol:.12,delay:t*.04})),Ie({dur:.35,vol:.18,freq:6e3,type:"highpass"})},pop:()=>{Yt({f:500,f2:1400,dur:.07,type:"sine",vol:.25}),Ie({dur:.04,vol:.1,freq:3e3,delay:.03})},meteor:()=>{Yt({f:1600,f2:300,dur:.4,type:"sine",vol:.1})},hum:()=>{Yt({f:70,f2:45,dur:1.8,type:"sawtooth",vol:.12,attack:.3}),Yt({f:140,f2:90,dur:1.8,type:"sine",vol:.1,attack:.3})},bell:()=>{[1318,1976,2637].forEach((i,t)=>Yt({f:i,dur:.5-t*.1,type:"sine",vol:.14/(t+1)}))},bubble:()=>{for(let i=0;i<4;i++)Yt({f:300+Math.random()*400,f2:700+Math.random()*500,dur:.06,type:"sine",vol:.08,delay:i*.07})},grow:()=>{Ie({dur:.4,vol:.12,freq:800,freq2:2400,type:"bandpass",q:2})}},b_=104,Es=60/b_/4,w_=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],E_=[0,1,2,1,0,2,1,2],T_=[76,-1,-1,74,-1,72,-1,-1,69,-1,72,-1,74,-1,-1,-1,76,-1,79,-1,76,-1,74,-1,72,-1,-1,69,-1,-1,-1,-1],Er=i=>440*Math.pow(2,(i-69)/12);let Kr="battle",Ts=!1,Za=0,Ki=0;function A_(i,t){const e=Math.floor(i/16)%4,n=i%16,s=w_[e],r=Fs,o=t-Kt.currentTime,a=Kr==="battle";a&&(n===0||n===8)&&Yt({f:120,f2:45,dur:.18,type:"sine",vol:.5,delay:o,bus:r}),a&&n%4===2&&Ie({dur:.03,vol:.12,freq:8e3,type:"highpass",delay:o,bus:r}),a&&(n===4||n===12)&&Ie({dur:.09,vol:.14,freq:1800,type:"bandpass",q:.7,delay:o,bus:r}),n%4===0&&Yt({f:Er(s[0]-12+(n===8?12:0)),dur:Es*3.2,type:"triangle",vol:.32,delay:o,bus:r}),n===0&&s.forEach(h=>Yt({f:Er(h),dur:Es*16,type:"sine",vol:.06,delay:o,bus:r,attack:.25})),n%2===0&&Yt({f:Er(s[E_[n/2%8]]+12),dur:Es*1.6,type:"triangle",vol:.07,delay:o,bus:r});const l=Math.floor(i/32)%2,c=T_[i%32];a&&l===1&&c>0&&Yt({f:Er(c),dur:Es*2.5,type:"square",vol:.035,delay:o,bus:r,attack:.01})}function R_(){if(!(!Kt||!Ts))for(;Ki<Kt.currentTime+.25;)A_(Za,Ki),Za++,Ki+=Es}const rt={unlock(){S_(),Kt&&Kt.state==="suspended"&&Kt.resume(),Kt&&!Ts&&this.startMusic()},play(i,t=.03){var n;if(!Kt||kr||$a||Ya)return;const e=Kt.currentTime;if(!(Ko[i]&&e-Ko[i]<t)){Ko[i]=e;try{(n=Jo[i])==null||n.call(Jo)}catch{}}},startMusic(){!Kt||Ts||(Ts=!0,Ki=Kt.currentTime+.1,setInterval(R_,60))},setMusicMode(i){Kr=i,Kt&&vs()},setMuted(i){kr=i,vs()},setMusicMuted(i){Zr=i,vs()},setSdkMuted(i){$a=i,vs()},setPaused(i){Ya=i,vs(),Kt&&!i&&(Ki=Math.max(Ki,Kt.currentTime+.05))},get muted(){return kr},get debug(){return{state:(Kt==null?void 0:Kt.state)||"none",musicOn:Ts,step:Za,mode:Kr}},get musicMuted(){return Zr}};function C_(i,t,e){return i*(1+.15*(e-1))*(1+.25*t.rarity)}const li=new C,zc=new C(0,1,0);function xs(i){return i.root.position.clone().setY(.45)}function Hc(i,t){return li.subVectors(t.f.root.position,i.root.position).setY(0).normalize().clone()}function Vc(i,t,e,n,s){return i.enemies.filter(r=>{if(!r.alive)return!1;const o=li.subVectors(r.f.root.position,t).setY(0),a=o.length();return a<n&&(a<.6||o.divideScalar(a).dot(e)>s)})}function P_(i,t,e=!0){const n=e?new Te({color:t,emissive:t,emissiveIntensity:.7}):new Te({color:t});return new q(new ge(i,14,10),n)}function jo(i,t,e=.55){const n=new q(new Mi(i,36),new Re({color:t,transparent:!0,opacity:e,depthWrite:!1}));return n.rotation.x=-Math.PI/2,n.renderOrder=1,n}const L_={water:{cd:5,range:4.5,cast(i,t,e,n){const s=t.root.position.clone(),r=Hc(t,e);for(let o=0;o<26;o++){const a=(Math.random()-.5)*1.3,l=r.clone().applyAxisAngle(zc,a).multiplyScalar(7+Math.random()*4);l.y=1.5+Math.random()*2,i.puff(xs(t),l,o%3?"#4fc3ff":"#d8f6ff",.18,.55)}for(const o of Vc(i,s,r,5.5,Math.cos(.7)))i.damageEnemy(o,n*.8,"zap",!1),o.knock.addScaledVector(r,o.def.boss?1.5:12);rt.play("splash",.1)}},rock:{cd:5.5,range:8,cast(i,t,e,n){const s=new q(new ss(.45,0),new Te({color:"#8a7a66"}));rt.play("throw",.1),i.launch({mesh:s,from:xs(t),to:e.f.root.position.clone().setY(.4),dur:.75,arc:3.2,onHit:r=>{i.ringBlast(r.setY(.05),2.2,"#d9b98a"),i.spawnSparks(r,8,"#c9a27a"),i.shake=Math.max(i.shake,.2),rt.play("slam",.1);for(const o of i.enemiesNear(r,2.2))i.damageEnemy(o,n*1.4,"hit",!0),i.stunEnemy(o,1.3,"rock")}})}},leaf:{cd:7,selfCast:!0,cast(i,t,e,n){const s=i.player.root.position;i.heal(i.maxHp*.06+n*.5),i.ringBlast(s,3,"#7be34a");for(let r=0;r<12;r++){const o=r/12*Math.PI*2;i.puff(s.clone().add(new C(Math.cos(o)*.8,.3,Math.sin(o)*.8)),new C(Math.cos(o)*2,3,Math.sin(o)*2),r%2?"#7be34a":"#ff9ad5",.14,.7)}for(const r of i.enemiesNear(s,3.5))i.slowEnemy(r,3);rt.play("heal",.2),rt.play("grow",.2)}},fire:{cd:4.5,range:5,cast(i,t,e,n){let s=0;return rt.play("whoosh",.1),{dur:1.4,update(r){const o=e.alive?e:i.nearest;if(!o)return;const a=Hc(t,o);t.root.rotation.y=Math.atan2(a.x,a.z);for(let l=0;l<3;l++){const c=a.clone().applyAxisAngle(zc,(Math.random()-.5)*.7).multiplyScalar(8+Math.random()*3);c.y=.6+Math.random()*1.2,i.puff(xs(t),c,["#ff5a1a","#ffb02e","#ffe066"][l],.16,.45)}if(s-=r,s<=0){s=.2,rt.play("sizzle",.15);for(const l of Vc(i,t.root.position,a,5.2,Math.cos(.45)))i.damageEnemy(l,n*.22,"burn",!1),l.burn=2.5,l.burnDps=Math.max(l.burnDps,n*.25)}}}}},ice:{cd:6,range:3.8,cast(i,t,e,n){const s=t.root.position;i.ringBlast(s,4,"#bff4ff"),i.ringBlast(s,2.5,"#ffffff");for(let r=0;r<16;r++){const o=r/16*Math.PI*2;i.puff(s.clone().setY(.4),new C(Math.cos(o)*7,.8,Math.sin(o)*7),r%2?"#bff4ff":"#ffffff",.15,.5)}for(const r of i.enemiesNear(s,4))i.damageEnemy(r,n*.6,"zap",!1),i.stunEnemy(r,2,"ice");rt.play("freeze",.1)}},spark:{cd:3.2,range:7,cast(i,t,e,n){i.damageEnemy(e,n*.9,"zap",!0),i.chainLightning(e,n*.8,4),i.spawnSparks(e.f.root.position.clone().setY(1.2),6,"#8ff3ff")}},poison:{cd:6,range:7,cast(i,t,e,n){const s=e.f.root.position.clone().setY(.05),r=new Se;r.add(jo(2.3,"#7bff3a",.35));const o=new q(new ge(2.1,18,10),new Re({color:"#9b6bff",transparent:!0,opacity:.22,depthWrite:!1}));o.scale.y=.35,o.position.y=.5,r.add(o),i.addZone({pos:s,radius:2.3,life:4,interval:.4,mesh:r,onTick:a=>{i.damageEnemy(a,n*.2,"poison",!1),i.slowEnemy(a,.6)},onFrame:(a,l)=>{o.scale.set(1+Math.sin(l*20)*.04,.35,1+Math.cos(l*20)*.04),Math.random()<.3&&i.puff(a.pos.clone().add(new C((Math.random()-.5)*3,.2,(Math.random()-.5)*3)),new C(0,1.5,0),"#8dff5a",.12,.8)}}),rt.play("bubble",.1),rt.play("sizzle",.1)}},bubble:{cd:5,range:7,cast(i,t,e,n){const s=new q(new ge(.3,14,10),i.bubbleMat);i.launch({mesh:s,from:xs(t),to:e.f.root.position.clone().setY(1),target:e,dur:.5,onHit:()=>{e.alive&&i.trapInBubble(e,2.4,n*1.7)}}),rt.play("pop",.1)}},cosmic:{cd:7,range:8,cast(i,t,e,n){const s=e.f.root.position.clone();let r=0;return{dur:1.3,update(o,a){for(;r<5&&a>r*.22;){r++;const l=i.enemiesNear(s,4),c=l.length?l[Math.floor(Math.random()*l.length)].f.root.position.clone():s.clone().add(new C((Math.random()-.5)*4,0,(Math.random()-.5)*4));c.y=.1;const h=P_(.35,"#ffb347");rt.play("meteor",.05),i.launch({mesh:h,from:c.clone().add(new C(-3,11,-3)),to:c,dur:.45,onHit:u=>{i.ringBlast(u.setY(.05),1.6,"#ffd6a0"),i.spawnSparks(u,6,"#ffe066"),i.shake=Math.max(i.shake,.12),rt.play("slam",.08);for(const d of i.enemiesNear(u,1.6))i.damageEnemy(d,n*.75,"crit",!1)}})}}}}},lava:{cd:6,range:7,cast(i,t,e,n){const s=e.f.root.position.clone().setY(.04),r=new Se,o=jo(2,"#ff5a1a",.75);r.add(o),r.add(jo(1.2,"#ffcf4a",.6)),i.addZone({pos:s,radius:2,life:4.5,interval:.35,mesh:r,onTick:a=>{i.damageEnemy(a,n*.22,"burn",!1),a.burn=2,a.burnDps=Math.max(a.burnDps,n*.2)},onFrame:(a,l)=>{o.material.opacity=.6+Math.sin(l*30)*.15,r.scale.setScalar(Math.min(1,l*8)*(l>.9?(1-l)*10:1)),Math.random()<.25&&i.puff(a.pos.clone().add(new C((Math.random()-.5)*2.5,.1,(Math.random()-.5)*2.5)),new C(0,2.2,0),"#ffb347",.1,.5),Math.random()<.04&&rt.play("sizzle",.3)}}),rt.play("sizzle",.1),rt.play("bubble",.1)}},gold:{cd:4,range:8,cast(i,t,e,n){const s=new q(new De(.32,.32,.08,18),new Te({color:"#ffd23f",emissive:"#8a5a00"}));i.launch({mesh:s,from:xs(t),to:e.f.root.position.clone().setY(1),target:e,dur:.4,onHit:r=>{i.spawnSparks(r,10,"#ffe066"),rt.play("bell",.05),rt.play("coin",.05),e.alive&&i.damageEnemy(e,n*2.2,"gold",!0);for(let o=0;o<2;o++)i.spawnDrop("coin",r,Math.ceil(3*Math.pow(1.18,i.stage-1)))}})}},void:{cd:8,range:8,cast(i,t,e,n){const s=e.f.root.position.clone().setY(1),r=new Se,o=new q(new ge(.55,18,12),new Re({color:"#07020f"})),a=new q(new Dn(.95,.07,8,32),new Re({color:"#d06bff"}));a.rotation.x=Math.PI/2.4,r.add(o,a),i.addZone({pos:s,radius:4.8,life:2.2,interval:.05,mesh:r,onTick:(l,c)=>{l.def.boss||(li.subVectors(c.pos,l.f.root.position).setY(0),l.knock.addScaledVector(li.normalize(),1.4),i.stunEnemy(l,.1,"void"))},onFrame:(l,c)=>{if(a.rotation.z+=.3,r.scale.setScalar(.6+c*.7),Math.random()<.6){const h=Math.random()*Math.PI*2,u=l.pos.clone().add(new C(Math.cos(h)*3.5,-.6,Math.sin(h)*3.5));i.puff(u,li.subVectors(l.pos,u).multiplyScalar(2).clone(),"#b04dff",.1,.45)}},onEnd:l=>{i.ringBlast(l.pos.clone().setY(.05),3,"#d06bff"),i.shake=Math.max(i.shake,.35),rt.play("slam");for(const c of i.enemiesNear(l.pos,3))i.damageEnemy(c,n*2.4,"crit",!0),li.subVectors(c.f.root.position,l.pos).setY(0).normalize(),c.knock.addScaledVector(li,c.def.boss?1:10)}}),rt.play("hum",.3)}}},I_={ice:"#2a7fb8",rock:"#6b5a2a",bubble:"#8a3a7a",void:"#4a1a8a"},U_=new ge(.75,20,14),D_=new fl(1,0),Qo=new Map;function N_(i){return Qo.has(i)||Qo.set(i,new Re({color:i,transparent:!0,opacity:.85,depthWrite:!1})),Qo.get(i)}const ce=new C,Ms=new C,ni=new C,F_=new C(0,1,0),Tr=Pn-.8,Gc=70,Wc=[[-.36,1.52,0],[.36,1.52,0],[-.32,1.25,-.18],[.32,1.25,-.18],[-.22,1.78,-.2],[.22,1.78,-.2]],Ar=[[-.32,1.42,.62],[.32,1.42,.62],[-.95,1.1,.25],[.95,1.1,.25],[-.8,2.2,.1],[.8,2.2,.1]];class k_{constructor(t,e){this.renderer=t,this.hooks=e,this.scene=new Cs,this.scene.background=new Gt("#1b2233"),this.scene.fog=new so("#1b2233",30,70),this.camera=new ze(38,1,.5,200),this.camTarget=new C,this.shake=0;const n=new Us("#bcd4ff","#3a2a22",1.3);this.scene.add(n);const s=new Ds("#fff1dc",1.6);s.position.set(-8,20,10),this.scene.add(s),this.arena=__(),this.scene.add(this.arena.root),this.buildPlayer(),this.enemies=[],this.enemyPool={grunt:[],runner:[],brute:[],thrower:[],boss:[]},this.drops=[],this.dropPool=[],this.projectiles=[],this.effects=[],this.zones=[],this.pets=[],this.input={x:0,z:0},this.timeScale=1,this.running=!1,this.paused=!1,this.floatLayer=document.getElementById("floaters"),this.floaters=[];for(let r=0;r<Gc;r++){const o=document.createElement("div");o.className="floater",o.style.display="none",this.floatLayer.appendChild(o),this.floaters.push({el:o,life:0,pos:new C,vy:0})}this.floatIdx=0,this.sparkMat=new Re({color:"#fff3b0"}),this.gemMat=new Te({color:"#3dff7a",emissive:"#0d6b2a"}),this.coinMat=new Te({color:"#ffd23f",emissive:"#6b4d00"}),this.rockMat=Ft("#6d5a4a"),this.ringFxMat=new Re({color:"#ffd9a0",transparent:!0,opacity:.8,side:Ye,depthWrite:!1}),this.warnMat=new Re({color:"#ff2a2a",transparent:!0,opacity:.35,side:Ye,depthWrite:!1}),this.boltMat=new Th({color:"#8ff3ff"}),this.bubbleMat=new Gi({color:"#ffc6ee",transparent:!0,opacity:.4,shininess:120,specular:"#ffffff",depthWrite:!1})}buildPlayer(){const t=_l($r({color:"#2fb4ff",player:!0}));this.player=t,this.scene.add(t.root),this.arms=[],this.armMat=Ft("#2fb4ff");for(let e=0;e<Wc.length;e++){const n=new q(me.armTube,this.armMat),s=vl("#e23");this.scene.add(n),this.scene.add(s),this.arms.push({tube:n,glove:s,idx:e,state:"idle",t:0,cd:.2+e*.13,target:null,aim:new C,from:new C,pos:new C})}}applyLooks(){const t=Rt.state,e=this.player.gear,n=a=>{const l=Mn(t.equipped[a]);return l?$e[l.rarity].color:null},s=(a,l)=>{const c=n(l);a.visible=!!c,c&&a.material.color.set(c)};s(e.helmet,"helmet"),s(e.belt,"belt"),s(e.armor,"armor"),e.shoes.forEach(a=>s(a,"shoes")),e.pants.forEach(a=>s(a,"pants")),e.band.visible=!e.helmet.visible;const r=Mn(t.equipped.gloves),o=!r||r.rarity===0?"#e23b3b":$e[r.rarity].color;for(const a of this.arms)a.glove.userData.ball.material.color.set(o);v_(this.arena,t.ring.tier),this.buildPets()}buildPets(){for(const t of this.pets)this.scene.remove(t.root);this.pets=[],Rt.state.petSlots.forEach((t,e)=>{if(!t)return;const n=un.find(r=>r.id===t);if(!n)return;const s=kh(n.color,n.element,n.costume);s.scale.setScalar(.9),s.position.set(this.player.root.position.x+(e-1)*1.2,0,this.player.root.position.z-1.5),this.scene.add(s),this.pets.push({root:s,def:n,cd:1+e*.4,slot:e,bob:Math.random()*6,skillCd:2+e*1.2,channel:null})})}resize(t,e){this.camera.aspect=t/e;const n=Ss.degToRad(this.camera.fov),s=this.camera.aspect>1?13:11.5,r=10,o=s/Math.tan(n/2),a=r/(Math.tan(n/2)*this.camera.aspect);this.camDist=Math.max(o,a),this.camera.far=this.camDist+120,this.scene.fog.near=this.camDist+4,this.scene.fog.far=this.camDist+45,this.camera.updateProjectionMatrix()}start(t){var e,n;this.clearAll(),this.stats=Zi(),this.stage=t,this.skills={},this.level=1,this.xp=0,this.xpNext=this.xpFor(1),this.maxHp=this.stats.hp,this.hp=this.maxHp,this.kills=0,this.killsNeeded=Math.min(90,28+t*4),this.boss=null,this.bossSpawned=!1,this.spawnT=.5,this.slamT=0,this.runCoins=0,this.runGems=0,this.pendingLevels=0,this.time=0,this.over=!1,this.hurtCd=0,this.player.root.position.set(0,0,0),this.player.root.rotation.y=Math.PI*.25,this.camTarget.set(0,0,0),this.applyLooks();for(const s of this.arms)s.state="idle",s.target=null;this.running=!0,this.paused=!1,this.stats.traits.startSkill&&this.queueLevelUp(),(n=(e=this.hooks).onHud)==null||n.call(e)}clearAll(){for(const t of this.enemies)this.scene.remove(t.f.root),this.enemyPool[t.type].push(t);this.enemies=[];for(const t of this.drops)this.scene.remove(t.mesh);this.drops=[];for(const t of this.projectiles)this.scene.remove(t.mesh);this.projectiles=[];for(const t of this.effects)this.scene.remove(t.obj);this.effects=[];for(const t of this.zones)this.scene.remove(t.mesh);this.zones=[];for(const t of this.floaters)t.life=0,t.el.style.display="none"}xpFor(t){return Math.round(4+t*3.2+t*t*.35)}sk(t){return this.skills[t]||0}get punchDamage(){let t=this.stats.atk*(1+.2*this.sk("dmg"));return this.stats.traits.armBoost&&(t*=1+.2*this.sk("arm")),t}get punchInterval(){return .95/(1+.15*this.sk("rate"))}get range(){return 3.6+this.sk("range")*1.1}get armCount(){return 2+this.sk("arm")}get critChance(){return .05+.08*this.sk("crit")}get magnetRange(){return 2.4+this.sk("magnet")*1.8}update(t){if(!this.running)return;const e=Math.min(t,.05)*(this.paused?0:this.timeScale);e>0&&!this.over&&(this.time+=e,this.updateSpawns(e),this.updatePlayer(e),this.updateArms(e),this.updateEnemies(e),this.updatePets(e),this.updateProjectiles(e),this.updateZones(e),this.updateDrops(e),this.updateSlam(e)),this.updateEffects(e),this.updateFloaters(Math.min(t,.05)),this.updateCamera(Math.min(t,.05)),this.syncArms()}enemyStats(t){const e=gs[t],n=this.stage,s=14*Math.pow(1.21,n-1)*e.hp,r=5*Math.pow(1.16,n-1)*e.dmg;return{hp:s,dmg:r}}updateSpawns(t){var n,s;this.kills>=this.killsNeeded&&!this.bossSpawned&&(this.bossSpawned=!0,this.boss=this.spawnEnemy("boss"),rt.play("boss"),(s=(n=this.hooks).onBoss)==null||s.call(n,!0),this.shake=.5),this.spawnT-=t;const e=Math.min(70,26+this.stage*2);if(this.spawnT<=0&&this.enemies.length<e){const r=Math.max(.28,1-this.stage*.035)*(this.bossSpawned?2.2:1);this.spawnT=r;const o=1+Math.floor(Math.random()*Math.min(4,1+this.stage/3));for(let a=0;a<o;a++)this.spawnEnemy(this.pickType())}}pickType(){const t=this.stage,e=Math.random();return t>=gs.thrower.from&&e<.1?"thrower":t>=gs.brute.from&&e<.2?"brute":t>=gs.runner.from&&e<.42?"runner":"grunt"}spawnEnemy(t){const e=gs[t];let n=this.enemyPool[t].pop();if(!n){const a=$r({color:e.color,uniqueMat:!0});a.root.scale.setScalar(e.scale),e.boss&&Qg(a),n={f:a,type:t,def:e}}const s=this.enemyStats(t),r=Math.random()*Math.PI*2,o=11+Math.random()*3;return n.f.root.position.set(Math.cos(r)*o,-.6,Math.sin(r)*o),n.f.root.rotation.set(0,0,0),n.f.body.rotation.set(0,0,0),n.f.body.position.set(0,0,0),n.f.mat.emissive.set("#000000"),n.f.mat.transparent=!1,n.f.mat.opacity=1,n.f.shadow.visible=!0,n.hp=n.maxHp=s.hp,n.dmg=s.dmg,n.speed=e.speed*(.9+Math.random()*.2),n.alive=!0,n.dying=0,n.vel=new C,n.atkCd=.6+Math.random()*.5,n.burn=0,n.burnDps=0,n.burnTick=0,n.flash=0,n.walk=Math.random()*6,n.targetedBy=0,n.knock=new C,n.slamT=3,n.warn=null,n.stun=0,n.stunKind=null,n.slow=0,n.bubble&&(this.scene.remove(n.bubble.mesh),n.bubble=null),this.scene.add(n.f.root),this.enemies.push(n),n}updatePlayer(t){const e=this.player.root.position;let n=this.input.x,s=this.input.z;const r=Math.abs(n)+Math.abs(s)>.05;let o=null,a=1/0;for(const d of this.enemies){if(!d.alive)continue;const f=d.f.root.position.distanceToSquared(e);f<a&&(a=f,o=d)}this.nearest=o;let l=5.2;!r&&o&&Math.sqrt(a)>this.range*.85&&(ce.subVectors(o.f.root.position,e).setY(0).normalize(),n=ce.x,s=ce.z,l=2.6);const c=Math.hypot(n,s);if(this.moving=c>.05,this.moving){const d=Math.min(1,c);e.x+=n/c*l*d*t,e.z+=s/c*l*d*t,e.x=Ss.clamp(e.x,-Tr,Tr),e.z=Ss.clamp(e.z,-Tr,Tr)}let h=null;if(o?h=Math.atan2(o.f.root.position.x-e.x,o.f.root.position.z-e.z):this.moving&&(h=Math.atan2(n,s)),h!==null){let d=h-this.player.root.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d)),this.player.root.rotation.y+=d*Math.min(1,t*10)}this.walkT=(this.walkT||0)+t*(this.moving?12:3);const u=this.moving?.7:.05;this.player.legs[0].rotation.x=Math.sin(this.walkT)*u,this.player.legs[1].rotation.x=-Math.sin(this.walkT)*u,this.player.body.position.y=this.moving?Math.abs(Math.sin(this.walkT))*.08:Math.sin(this.time*3)*.03,this.hurtCd-=t,this.hurtFlash>0&&(this.hurtFlash-=t,this.player.mat.emissive.set(this.hurtFlash>0?"#ff2020":"#000000"))}pickTarget(t){const e=this.player.root.position,n=this.range*this.range;let s=null,r=1/0;for(const o of this.enemies){if(!o.alive)continue;const a=o.f.root.position.distanceToSquared(e);if(a>n)continue;const l=a+o.targetedBy*6;l<r&&(r=l,s=o)}return s}updateArms(t){const e=this.armCount;for(let n=0;n<this.arms.length;n++){const s=this.arms[n],r=n<e;if(s.tube.visible=s.glove.visible=r,!!r)if(s.state==="idle"){if(s.cd-=t,s.cd<=0){const o=this.pickTarget(s);if(o){s.target=o,o.targetedBy++,s.state="out",s.t=0,s.from.copy(s.pos),s.aim.copy(o.f.root.position).setY(o.f.root.position.y+1.2*o.def.scale);const a=s.from.distanceTo(s.aim);s.dur=Math.max(.07,a/34),rt.play("punch",.05)}else s.cd=.1}}else s.state==="out"?(s.t+=t,s.target&&s.target.alive&&s.aim.copy(s.target.f.root.position).setY(s.target.f.root.position.y+1.2*s.target.def.scale),s.t>=s.dur&&(s.target&&(s.target.targetedBy=Math.max(0,s.target.targetedBy-1),s.target.alive&&this.landPunch(s.target,s.aim)),s.target=null,s.state="hold",s.t=0)):s.state==="hold"?(s.t+=t,s.t>=.04&&(s.state="back",s.t=0,s.from.copy(s.aim))):s.state==="back"&&(s.t+=t,s.t>=.13&&(s.state="idle",s.cd=Math.max(.02,this.punchInterval-s.dur-.17)*(.85+Math.random()*.3)))}}syncArms(){const t=this.player.body;t.updateWorldMatrix(!0,!1);const e=this.armCount||2,n=Math.sin((this.time||0)*6);for(let s=0;s<this.arms.length;s++){const r=this.arms[s];if(s>=e){r.tube.visible=r.glove.visible=!1;continue}const o=ce.set(...Wc[s]);t.localToWorld(o);const a=Ms.set(Ar[s][0],Ar[s][1]+n*.04*(s%2?1:-1),Ar[s][2]);if(t.localToWorld(a),r.state==="out"){const c=Math.min(1,r.t/r.dur);r.pos.lerpVectors(r.from,r.aim,1-Math.pow(1-c,2))}else if(r.state==="hold")r.pos.copy(r.aim);else if(r.state==="back"){const c=Math.min(1,r.t/.13);r.pos.lerpVectors(r.from,a,c*c)}else r.pos.lerp(a,.5);r.glove.position.copy(r.pos),ni.subVectors(r.pos,o);const l=ni.length();l>.001&&(r.tube.position.copy(o),r.tube.quaternion.setFromUnitVectors(F_,ni.normalize()),r.tube.scale.set(1,l,1),r.glove.lookAt(Ms.copy(r.pos).add(ni))),r.tube.visible=r.glove.visible=!0}}landPunch(t,e){let n=this.punchDamage*(.9+Math.random()*.2);const s=Math.random()<this.critChance;s&&(n*=2.2),this.damageEnemy(t,n,s?"crit":"hit",!0),this.spawnSparks(e,s?7:4,s?"#ffe45c":"#fff3b0"),s?(rt.play("crit"),this.shake=Math.max(this.shake,.12)):rt.play("hit"),ce.subVectors(t.f.root.position,this.player.root.position).setY(0).normalize();const r=t.def.boss?.4:t.type==="brute"?1.5:4.5;if(t.knock.addScaledVector(ce,r),this.sk("burn")){const o=this.stats.traits.burnBoost?1.25:1;t.burn=3,t.burnDps=this.stats.atk*.22*this.sk("burn")*o}if(this.sk("splash")){const o=1.3+.3*this.sk("splash");for(const a of this.enemies)a===t||!a.alive||a.f.root.position.distanceTo(t.f.root.position)<o&&this.damageEnemy(a,n*.3*this.sk("splash"),"hit",!1)}this.sk("chain")&&Math.random()<.35+this.sk("chain")*.08&&this.chainLightning(t,n*.55,this.sk("chain")),this.sk("leech")&&this.heal(n*.03*this.sk("leech"),!1)}chainLightning(t,e,n){let s=t;const r=new Set([t]),o=[s.f.root.position.clone().setY(s.f.root.position.y+1.2)];for(let a=0;a<n+1;a++){let l=null,c=12;for(const h of this.enemies){if(!h.alive||r.has(h))continue;const u=h.f.root.position.distanceToSquared(s.f.root.position);u<c&&(c=u,l=h)}if(!l)break;r.add(l),o.push(l.f.root.position.clone().setY(l.f.root.position.y+1.2)),this.damageEnemy(l,e,"zap",!1),s=l}if(o.length>1){const a=[];for(let h=0;h<o.length-1;h++)for(let u=0;u<4;u++){const d=o[h].clone().lerp(o[h+1],u/4);u&&d.add(new C((Math.random()-.5)*.5,(Math.random()-.5)*.5,(Math.random()-.5)*.5)),a.push(d)}a.push(o[o.length-1]);const l=new Fe().setFromPoints(a),c=new pg(l,this.boltMat);this.scene.add(c),this.effects.push({obj:c,life:.15,max:.15,kind:"bolt"}),rt.play("zap")}}damageEnemy(t,e,n,s){var o,a;if(!t.alive)return;t.def.boss&&this.stats.traits.bossDmg&&(e*=1.3),t.hp-=e,t.flash=.1;const r=ce.copy(t.f.root.position);r.y+=2.2*t.def.scale,this.floatText(r,xe(Math.max(1,e)),n,s),t.hp<=0&&this.killEnemy(t),t===this.boss&&((a=(o=this.hooks).onHud)==null||a.call(o))}killEnemy(t){var s,r,o,a;t.alive=!1,t.bubble&&this.popBubble(t,!1),t.dying=1.2,ce.subVectors(t.f.root.position,this.player.root.position).setY(0).normalize(),t.vel.set(ce.x*9,7+Math.random()*3,ce.z*9),t.spin=(Math.random()-.5)*20,t.f.shadow.visible=!1,rt.play("die",.06),this.kills++,Rt.state.stats.kills++;const e=t.f.root.position,n=t.def.xp;for(let l=0;l<Math.min(n,6);l++)this.spawnDrop("xp",e,Math.ceil(n/Math.min(n,6)));if(Math.random()<(t.def.boss?1:.12)){const l=t.def.boss?8:1;for(let c=0;c<l;c++)this.spawnDrop("coin",e,Math.ceil(3*Math.pow(1.18,this.stage-1)))}t===this.boss&&(this.boss=null,(r=(s=this.hooks).onBoss)==null||r.call(s,!1),Rt.state.stats.bosses++,this.victory()),(a=(o=this.hooks).onHud)==null||a.call(o)}updateEnemies(t){const e=this.player.root.position,n=this.enemies;for(let s=n.length-1;s>=0;s--){const r=n[s],o=r.f.root;if(!r.alive){r.dying-=t,r.vel.y-=22*t,o.position.addScaledVector(r.vel,t),o.rotation.x+=r.spin*t,o.rotation.z+=r.spin*.6*t,r.dying<.4&&(r.f.mat.transparent=!0,r.f.mat.opacity=r.dying/.4),r.dying<=0&&(this.scene.remove(o),r.warn&&(this.scene.remove(r.warn),r.warn=null),n.splice(s,1),this.enemyPool[r.type].push(r));continue}if(r.burn>0&&(r.burn-=t,r.burnTick-=t,r.burnTick<=0&&(r.burnTick=.5,this.damageEnemy(r,r.burnDps*.5,"burn",!1),!r.alive)))continue;const a=r.stun>0;if(a&&(r.stun-=t),r.slow>0&&(r.slow-=t),r.bubble&&(r.bubble.mesh.position.copy(o.position).setY(o.position.y+1.1*r.def.scale+.4),r.bubble.mesh.rotation.y+=t*2,r.stun<=0&&(this.popBubble(r,!0),!r.alive)))continue;r.flash>0?(r.flash-=t,r.f.mat.emissive.set("#ffffff").multiplyScalar(Math.max(0,r.flash)*6)):a?r.f.mat.emissive.set(I_[r.stunKind]||"#444444"):r.burn>0?r.f.mat.emissive.setRGB(.5+Math.sin(this.time*20)*.2,.15,0):r.slow>0?r.f.mat.emissive.setRGB(.05,.25,.05):r.f.mat.emissive.setRGB(0,0,0),ce.subVectors(e,o.position).setY(0);const l=ce.length();ce.normalize();const c=.9+r.def.scale*.35;let h=0;const u=r.speed*(r.slow>0?.45:1);a||(r.def.ranged?(l>6.5?h=u:l<4.5&&(h=-u*.5),r.atkCd-=t,r.atkCd<=0&&l<8&&(r.atkCd=2.4,this.throwRock(r))):l>c?h=u:(r.atkCd-=t,r.atkCd<=0&&(r.atkCd=r.def.boss?1.3:1,r.swing=.25,this.hurtPlayer(r.dmg,r)))),r.def.boss&&!a&&this.bossSlam(r,t,l),o.position.addScaledVector(ce,h*t),o.position.addScaledVector(r.knock,t),r.knock.multiplyScalar(Math.max(0,1-t*6));for(let g=0;g<n.length;g++){const v=n[g];if(v===r||!v.alive)continue;const p=o.position.x-v.f.root.position.x,m=o.position.z-v.f.root.position.z,S=p*p+m*m,M=.55*(r.def.scale+v.def.scale);if(S<M*M&&S>1e-4){const x=Math.sqrt(S),L=(M-x)*.5;o.position.x+=p/x*L,o.position.z+=m/x*L}}const d=Math.max(Math.abs(o.position.x),Math.abs(o.position.z))<Pn+.3;o.position.y+=((d?0:-.6)-o.position.y)*Math.min(1,t*10),o.rotation.y=Math.atan2(ce.x,ce.z),r.walk+=t*r.speed*4;const f=h!==0?.7:.1;r.f.legs[0].rotation.x=Math.sin(r.walk)*f,r.f.legs[1].rotation.x=-Math.sin(r.walk)*f,r.f.arms[0].rotation.x=-.6-Math.sin(r.walk)*f*.6,r.f.arms[1].rotation.x=-.6+Math.sin(r.walk)*f*.6,r.swing>0&&(r.swing-=t,r.f.arms[0].rotation.x=-2.2,r.f.arms[1].rotation.x=-2.2),r.f.body.position.y=Math.abs(Math.sin(r.walk))*.06}}bossSlam(t,e,n){if(t.slamT-=e,t.slamT<=0&&!t.warn){const s=new q(new Mi(3.4,32),this.warnMat);s.rotation.x=-Math.PI/2,s.position.copy(t.f.root.position).setY(t.f.root.position.y+.05),this.scene.add(s),t.warn=s,t.warnT=1.1}t.warn&&(t.warnT-=e,t.warn.position.x=t.f.root.position.x,t.warn.position.z=t.f.root.position.z,t.warn.scale.setScalar(1-t.warnT/1.1*.6),t.f.body.position.y=.4*Math.sin((1-t.warnT/1.1)*Math.PI),t.warnT<=0&&(this.scene.remove(t.warn),t.warn=null,t.slamT=4.5,this.ringBlast(t.f.root.position,3.4,"#ff6a4a"),rt.play("slam"),this.shake=.5,t.f.root.position.distanceTo(this.player.root.position)<3.4&&this.hurtPlayer(t.dmg*2.5,t)))}throwRock(t){const e=new q(me.rock,this.rockMat),n=t.f.root.position.clone().setY(t.f.root.position.y+1.8),s=this.player.root.position.clone().setY(.8);e.position.copy(n),this.scene.add(e),this.projectiles.push({mesh:e,from:n,to:s,t:0,dur:.9,dmg:t.dmg,src:t,kind:"rock"}),rt.play("throw",.12),t.swing=.3}hurtPlayer(t,e){var s,r;const n=t*100/(100+this.stats.def);this.hp-=n,this.stats.traits.reflect&&e&&e.alive&&this.damageEnemy(e,n*.15,"hit",!1),this.hurtCd<=0&&(rt.play("hurt",.15),this.hurtCd=.25),this.hurtFlash=.09,this.hp<=0&&(this.hp=0,this.defeat()),(r=(s=this.hooks).onHud)==null||r.call(s)}heal(t,e=!0){var n,s;this.hp=Math.min(this.maxHp,this.hp+t),e&&this.floatText(ce.copy(this.player.root.position).setY(2.6),"+"+xe(t),"heal",!0),(s=(n=this.hooks).onHud)==null||s.call(n)}updateSlam(t){const e=this.sk("slam");if(!e||(this.slamT-=t,this.slamT>0))return;this.slamT=6-e*.7;const n=3+e*.5,s=this.player.root.position;this.ringBlast(s,n,"#ffd9a0"),rt.play("slam"),this.shake=Math.max(this.shake,.25);const r=this.stats.atk*(1+e*.6);for(const o of this.enemies){if(!o.alive)continue;o.f.root.position.distanceTo(s)<n&&(ce.subVectors(o.f.root.position,s).setY(0).normalize(),o.knock.addScaledVector(ce,o.def.boss?1:9),this.damageEnemy(o,r,"hit",!1))}}updatePets(t){const e=this.player.root.position,n=this.player.root.rotation.y;this.pets.forEach((s,r)=>{var f,g,v;const o=n+Math.PI+(r-1)*.9,a=e.x+Math.sin(o)*1.6,l=e.z+Math.cos(o)*1.6;s.root.position.x+=(a-s.root.position.x)*Math.min(1,t*4),s.root.position.z+=(l-s.root.position.z)*Math.min(1,t*4),s.bob+=t*7;const c=Math.sin(s.bob),h=s.root.userData.body;h.position.y=Math.max(0,c)*.45;const u=c<0?-c*.28:0;h.scale.set(1+u*.6,1-u+Math.max(0,c)*.08,1+u*.6),(g=(f=s.root.userData).tick)==null||g.call(f,this.time),(v=s.root.userData.cloth)==null||v.step(t),s.cd-=t;const d=this.nearest;if(d&&(s.root.rotation.y=Math.atan2(d.f.root.position.x-s.root.position.x,d.f.root.position.z-s.root.position.z)),this.updatePetSkill(s,t,d),s.cd<=0&&d&&d.alive&&d.f.root.position.distanceTo(s.root.position)<9){s.cd=1.4;const p=new q(me.eye,new Re({color:s.def.color}));p.scale.setScalar(2.6);const m=s.root.position.clone().setY(.9);p.position.copy(m),this.scene.add(p);const S=Rt.state.pets[s.def.id],M=this.stats.atk*(.3+.12*s.def.rarity)*(1+.1*(((S==null?void 0:S.lvl)||1)-1));this.projectiles.push({mesh:p,from:m,to:null,target:d,t:0,dur:.35,dmg:M,kind:"pet"}),rt.play("pew",.12)}})}updateProjectiles(t){for(let e=this.projectiles.length-1;e>=0;e--){const n=this.projectiles[e];n.t+=t;const s=Math.min(1,n.t/n.dur);if(n.onHit)n.target&&n.target.alive&&n.to.copy(n.target.f.root.position).setY(n.target.f.root.position.y+1),n.mesh.position.lerpVectors(n.from,n.to,s),n.mesh.position.y+=Math.sin(s*Math.PI)*(n.arc||0),n.mesh.rotation.x+=t*8,n.mesh.rotation.y+=t*6;else if(n.kind==="pet"){const r=n.target.f.root.position;n.mesh.position.lerpVectors(n.from,ce.copy(r).setY(r.y+1.2),s)}else n.mesh.position.lerpVectors(n.from,n.to,s),n.mesh.position.y+=Math.sin(s*Math.PI)*2,n.mesh.rotation.x+=t*10;s>=1&&(n.onHit?n.onHit(n.mesh.position.clone()):n.kind==="pet"?n.target.alive&&(this.damageEnemy(n.target,n.dmg,"pet",!1),this.spawnSparks(n.mesh.position,3,"#ffffff")):n.mesh.position.distanceTo(ce.copy(this.player.root.position).setY(.8))<1.3&&this.hurtPlayer(n.dmg,n.src),this.scene.remove(n.mesh),this.projectiles.splice(e,1))}}updatePetSkill(t,e,n){var l,c,h,u,d;const s=L_[t.def.element];if(!s)return;if(t.channel){t.channel.t+=e,(c=(l=t.channel).update)==null||c.call(l,e,t.channel.t),t.channel.t>=t.channel.dur&&((u=(h=t.channel).end)==null||u.call(h),t.channel=null);return}if(t.skillCd-=e,t.skillCd>0||!(s.selfCast||n&&n.alive&&n.f.root.position.distanceTo(t.root.position)<s.range))return;t.skillCd=s.cd;const o=((d=Rt.state.pets[t.def.id])==null?void 0:d.lvl)||1,a=s.cast(this,t,n,C_(this.stats.atk,t.def,o));a&&(t.channel={t:0,...a}),t.bob=Math.PI/2,this.floatText(ce.copy(t.root.position).setY(1.6),t.def.skill.name+"!","skill",!0)}enemiesNear(t,e){const n=e*e;return this.enemies.filter(s=>s.alive&&s.f.root.position.distanceToSquared(t)<n)}stunEnemy(t,e,n){const s=t.def.boss?e*.3:e;s>t.stun&&(t.stun=s,t.stunKind=n)}slowEnemy(t,e){t.slow=Math.max(t.slow,e)}addZone({pos:t,radius:e,life:n,interval:s,mesh:r,onTick:o,onFrame:a,onEnd:l}){r&&(r.position.copy(t),this.scene.add(r)),this.zones.push({pos:t.clone(),radius:e,life:n,max:n,interval:s,tickT:0,mesh:r,onTick:o,onFrame:a,onEnd:l})}updateZones(t){var e,n;for(let s=this.zones.length-1;s>=0;s--){const r=this.zones[s];if(r.life-=t,r.tickT-=t,(e=r.onFrame)==null||e.call(r,r,1-r.life/r.max,t),r.tickT<=0&&r.onTick){r.tickT=r.interval;for(const o of this.enemiesNear(r.pos,r.radius))r.onTick(o,r)}r.life<=0&&((n=r.onEnd)==null||n.call(r,r),r.mesh&&this.scene.remove(r.mesh),this.zones.splice(s,1))}}launch({mesh:t,from:e,to:n,target:s=null,dur:r,arc:o=0,onHit:a}){t.position.copy(e),this.scene.add(t),this.projectiles.push({mesh:t,from:e.clone(),to:n.clone(),target:s,t:0,dur:r,arc:o,onHit:a,kind:"skill"})}trapInBubble(t,e,n){if(!t.alive)return;t.bubble&&this.scene.remove(t.bubble.mesh);const s=new q(U_,this.bubbleMat);s.scale.setScalar(1.25*t.def.scale),this.scene.add(s),t.bubble={mesh:s,dmg:n},this.stunEnemy(t,e,"bubble"),t.knock.set(0,0,0)}popBubble(t,e){const n=t.bubble;if(t.bubble=null,this.scene.remove(n.mesh),this.spawnSparks(n.mesh.position,8,"#ffc6ee"),rt.play("pop",.05),e)for(const s of this.enemiesNear(t.f.root.position,1.8))this.damageEnemy(s,s===t?n.dmg:n.dmg*.4,"pet",s===t)}puff(t,e,n,s=.25,r=.5){const o=new q(D_,N_(n));o.position.copy(t),o.scale.setScalar(s),this.scene.add(o),this.effects.push({obj:o,life:r,max:r,vel:e,kind:"puff",size:s})}spawnDrop(t,e,n){let s=this.dropPool.pop();s||(s={mesh:new q(me.gem,this.gemMat)}),s.kind=t,s.mesh.geometry=t==="coin"?me.coin:me.gem,s.mesh.material=t==="coin"?this.coinMat:this.gemMat,s.mesh.rotation.set(t==="coin"?Math.PI/2:0,0,0),s.value=n,s.pos=s.mesh.position,s.pos.copy(e).setY(Math.max(0,e.y)+.5);const r=Math.random()*Math.PI*2;s.vel=new C(Math.cos(r)*2.5,5,Math.sin(r)*2.5),s.collecting=!1,s.life=0,this.scene.add(s.mesh),this.drops.push(s)}updateDrops(t){const e=this.player.root.position,n=this.magnetRange;for(let s=this.drops.length-1;s>=0;s--){const r=this.drops[s];if(r.life+=t,r.collecting){ce.copy(e).setY(1),Ms.subVectors(ce,r.pos);const o=Ms.length();r.pos.addScaledVector(Ms.normalize(),Math.min(o,t*(14+r.life*4))),o<.5&&(this.collect(r),this.scene.remove(r.mesh),this.drops.splice(s,1),this.dropPool.push(r))}else{r.vel.y-=18*t,r.pos.addScaledVector(r.vel,t);const o=Math.max(Math.abs(r.pos.x),Math.abs(r.pos.z))<Pn?.3:-.3;r.pos.y<o&&(r.pos.y=o,r.vel.set(0,0,0)),r.mesh.rotation.y+=t*3,r.life>.4&&r.pos.distanceTo(e)<n&&(r.collecting=!0),r.life>4&&(r.collecting=!0)}}}collect(t){var e,n;if(t.kind==="coin"){const s=Math.round(t.value*this.stats.goldMult);this.runCoins+=s,rt.play("coin",.05)}else for(rt.play("gem",.04),this.xp+=t.value*this.stats.xpMult;this.xp>=this.xpNext;)this.xp-=this.xpNext,this.level++,this.xpNext=this.xpFor(this.level),Rt.state.stats.levels++,this.queueLevelUp();(n=(e=this.hooks).onHud)==null||n.call(e)}queueLevelUp(){this.pendingLevels++,this.pendingLevels===1&&this.offerLevelUp()}offerLevelUp(){var s,r;const t=Kg.filter(o=>this.sk(o.id)<o.max),e=[],n=t.slice();for(;e.length<3&&n.length;){const o=Math.floor(Math.random()*n.length);e.push(n.splice(o,1)[0])}e.length||e.push({id:"heal",name:"Second Wind",desc:"Heal 50% HP",icon:"heart",color:"#4fd16b",max:99}),this.paused=!0,rt.play("level"),(r=(s=this.hooks).onLevelUp)==null||r.call(s,e.map(o=>({...o,cur:this.sk(o.id)})))}chooseSkill(t){var e,n;if(t==="heal")this.heal(this.maxHp*.5);else{if(this.skills[t]=this.sk(t)+1,t==="hp"){const s=this.maxHp;this.maxHp=Math.round(this.stats.hp*(1+.2*this.skills.hp)),this.hp+=this.maxHp-s,this.heal(this.maxHp*.3)}if(t==="arm"){const s=this.arms[this.armCount-1];s.state="idle",s.cd=.1,O_(this.player.body,s.pos,Ar[this.armCount-1])}}this.stats.traits.lvlHeal&&this.heal(this.maxHp*.03,!1),this.pendingLevels--,this.pendingLevels>0?this.offerLevelUp():this.paused=!1,(n=(e=this.hooks).onHud)==null||n.call(e)}victory(){this.over||(this.over=!0,rt.play("win"),setTimeout(()=>{var t,e;return(e=(t=this.hooks).onEnd)==null?void 0:e.call(t,!0)},1100))}defeat(){this.over||(this.over=!0,rt.play("lose"),this.player.body.rotation.x=-Math.PI/2.2,this.player.body.position.y=.3,setTimeout(()=>{var t,e;return(e=(t=this.hooks).onEnd)==null?void 0:e.call(t,!1)},900))}revive(){var e,n;this.over=!1,rt.play("heal"),this.hp=this.maxHp,this.player.body.rotation.x=0,this.player.body.position.y=0;const t=this.player.root.position;this.ringBlast(t,6,"#9ff");for(const s of this.enemies)s.alive&&(ce.subVectors(s.f.root.position,t).setY(0),ce.length()<6&&(ce.normalize(),s.knock.addScaledVector(ce,14),s.def.boss||this.damageEnemy(s,s.maxHp*.5,"hit",!1)));(n=(e=this.hooks).onHud)==null||n.call(e)}spawnSparks(t,e,n){for(let s=0;s<e;s++){const r=new q(me.spark,n==="#fff3b0"?this.sparkMat:new Re({color:n}));r.position.copy(t);const o=new C((Math.random()-.5)*8,Math.random()*6,(Math.random()-.5)*8);this.scene.add(r),this.effects.push({obj:r,life:.35,max:.35,vel:o,kind:"spark"})}}ringBlast(t,e,n){const s=new q(new oo(.85,1,40),this.ringFxMat.clone());s.material.color.set(n),s.rotation.x=-Math.PI/2,s.position.copy(t).setY(Math.max(.05,t.y+.05)),this.scene.add(s),this.effects.push({obj:s,life:.45,max:.45,kind:"ring",radius:e})}updateEffects(t){for(let e=this.effects.length-1;e>=0;e--){const n=this.effects[e];n.life-=t;const s=1-n.life/n.max;n.kind==="spark"?(n.vel.y-=20*t,n.obj.position.addScaledVector(n.vel,t),n.obj.scale.setScalar(Math.max(.01,1-s)),n.obj.rotation.x+=t*10):n.kind==="puff"?(n.obj.position.addScaledVector(n.vel,t),n.obj.scale.setScalar(n.size*(1+s*1.8)*(1-s*.6))):n.kind==="ring"&&(n.obj.scale.setScalar(.3+s*n.radius),n.obj.material.opacity=.9*(1-s)),n.life<=0&&(this.scene.remove(n.obj),n.kind==="bolt"&&n.obj.geometry.dispose(),n.kind==="ring"&&(n.obj.geometry.dispose(),n.obj.material.dispose()),this.effects.splice(e,1))}}floatText(t,e,n,s){const r=this.floaters[this.floatIdx];this.floatIdx=(this.floatIdx+1)%Gc,r.pos.copy(t),r.pos.x+=(Math.random()-.5)*.6,r.life=.8,r.el.textContent=e,r.el.className="floater "+n+(s?" big":""),r.el.style.display="block"}updateFloaters(t){const e=this.renderer.domElement.clientWidth,n=this.renderer.domElement.clientHeight;for(const s of this.floaters){if(s.life<=0)continue;if(s.life-=t,s.life<=0){s.el.style.display="none";continue}s.pos.y+=t*1.6,ni.copy(s.pos).project(this.camera);const r=(ni.x*.5+.5)*e,o=(-ni.y*.5+.5)*n,a=s.life>.65?1+(s.life-.65)*3:1;s.el.style.transform=`translate(${r}px,${o}px) translate(-50%,-50%) scale(${a})`,s.el.style.opacity=Math.min(1,s.life*3)}}updateCamera(t){const e=this.player.root.position;this.camTarget.x+=(e.x*.55-this.camTarget.x)*Math.min(1,t*3),this.camTarget.z+=(e.z*.55-this.camTarget.z)*Math.min(1,t*3);const n=Ss.degToRad(58),s=Math.PI/4,r=this.camDist||30;if(this.camera.position.set(this.camTarget.x+Math.sin(s)*Math.cos(n)*r,Math.sin(n)*r,this.camTarget.z+Math.cos(s)*Math.cos(n)*r),this.shake>0){this.shake-=t;const o=this.shake*.8;this.camera.position.x+=(Math.random()-.5)*o,this.camera.position.y+=(Math.random()-.5)*o}this.camera.lookAt(this.camTarget.x,0,this.camTarget.z)}setInput(t,e){const n=Math.SQRT1_2;this.input.x=(t-e)*n,this.input.z=(-t-e)*n}render(){this.renderer.render(this.scene,this.camera)}}function O_(i,t,e){t.set(e[0],e[1],e[2]),i.localToWorld(t)}const B_=new C(0,1,0),ta=new C,Rr=new C;class z_{constructor(t,e){this.renderer=t,this.hooks=e,this.scene=new Cs,this.scene.background=new Gt("#d9a27a"),this.scene.fog=new so("#d9a27a",18,60),this.camera=new ze(40,1,.3,200),this.scene.add(new Us("#ffe9d0","#8a5a3a",1.5));const n=new Ds("#fff",1.3);n.position.set(5,12,8),this.scene.add(n),this.scene.add(M_()),this.player=_l($r({color:"#2fb4ff",player:!0})),this.player.root.position.set(-4.2,0,0),this.player.root.rotation.y=Math.PI/2,this.scene.add(this.player.root),this.tube=new q(me.armTube,Ft("#2fb4ff")),this.glove=vl("#e23"),this.glove.scale.setScalar(1.6),this.scene.add(this.tube,this.glove),this.flying=[],this.sparks=[],this.floatEl=document.getElementById("eventDmg"),this.running=!1}resize(t,e){this.camera.aspect=t/e;const n=Ss.degToRad(this.camera.fov),s=7.5;this.camDist=Math.max(9/Math.tan(n/2)*.55,s/(Math.tan(n/2)*this.camera.aspect)),this.camera.updateProjectionMatrix()}start(t){var n,s;this.car&&this.scene.remove(this.car.root);for(const r of this.flying)this.scene.remove(r.mesh);this.flying=[],this.car=x_(),this.car.root.position.set(1.8,0,0),this.car.root.rotation.y=Math.PI/2*.15,this.scene.add(this.car.root),this.glove.userData.ball.material.color.set(t||"#e23");const e=Zi();this.atk=e.atk,this.goldMult=e.goldMult,this.time=20,this.total=0,this.combo=0,this.punchT=0,this.phase="rest",this.t=0,this.boost=0,this.nextBreak=0,this.running=!0,this.done=!1,(s=(n=this.hooks).onHud)==null||s.call(n,this)}tap(){!this.running||this.done||(this.boost=Math.min(1.5,this.boost+.25),this.phase==="rest"&&(this.punchT=0))}update(t){if(!this.running)return;t=Math.min(t,.05);const e=this.player;e.root.updateMatrixWorld(!0);const n=ta.set(.36,1.52,0);e.body.localToWorld(n);const s=new C(.3,1.45,.7);e.body.localToWorld(s);const r=new C(this.car.root.position.x-1.2+Math.sin(this.t*7)*.3,1.2+Math.cos(this.t*5)*.3,Math.sin(this.t*3)*.6);this.done||(this.time-=t,this.boost=Math.max(0,this.boost-t*.8),this.time<=0&&(this.time=0,this.done=!0,setTimeout(()=>{var u,d;return(d=(u=this.hooks).onEnd)==null?void 0:d.call(u,this.reward())},900))),this.t+=t;const o=.42/(1+this.boost*1.6);let a;if(this.phase==="rest")a=s,this.punchT-=t,this.punchT<=0&&!this.done&&(this.phase="out",this.pt=0,rt.play("punch",.04));else if(this.phase==="out"){this.pt+=t;const u=Math.min(1,this.pt/.08);a=s.clone().lerp(r,u*u),u>=1&&(this.hit(r),this.phase="back",this.pt=0)}else{this.pt+=t;const u=Math.min(1,this.pt/.1);a=r.clone().lerp(s,u),u>=1&&(this.phase="rest",this.punchT=o-.18)}this.glove.position.copy(a),Rr.subVectors(a,n);const l=Rr.length();this.tube.position.copy(n),this.tube.quaternion.setFromUnitVectors(B_,Rr.clone().normalize()),this.tube.scale.set(1,l,1),this.glove.lookAt(a.clone().add(Rr)),e.body.position.y=Math.sin(this.t*8)*.03;const c=this.car.root;c.rotation.z+=(0-c.rotation.z)*Math.min(1,t*8),c.position.x+=(1.8-c.position.x)*Math.min(1,t*6);for(let u=this.flying.length-1;u>=0;u--){const d=this.flying[u];d.vel.y-=20*t,d.mesh.position.addScaledVector(d.vel,t),d.mesh.rotation.x+=d.spin*t,d.mesh.rotation.z+=d.spin*t,d.mesh.position.y<.1&&(d.mesh.position.y=.1,d.vel.set(d.vel.x*.5,Math.abs(d.vel.y)*.3,d.vel.z*.5),d.spin*=.5),d.life-=t}for(let u=this.sparks.length-1;u>=0;u--){const d=this.sparks[u];d.life-=t,d.vel.y-=18*t,d.mesh.position.addScaledVector(d.vel,t),d.mesh.scale.setScalar(Math.max(.01,d.life*3)),d.life<=0&&(this.scene.remove(d.mesh),this.sparks.splice(u,1))}this.floatLife>0&&(this.floatLife-=t,this.floatEl.style.opacity=Math.min(1,this.floatLife*3));const h=this.camDist||12;this.camera.position.set(-.8,3.2,h),this.camera.lookAt(-.8,1.6,0)}hit(t){var h,u;const e=Math.random()<.15,n=this.atk*(.9+Math.random()*.3)*(e?2.5:1)*(1+this.boost*.3);this.total+=n,rt.play(e?"crit":"metal",.04);const s=this.car;s.root.rotation.z=-.06-(e?.06:0),s.root.position.x=2.1;const r=Math.min(1,this.total/(this.atk*120));s.body.scale.set(1-r*.25,1-r*.35,1),s.cabin.scale.set(1-r*.2,1-r*.55,1-r*.1),s.cabin.position.y=1.55-r*.35,s.paint.color.setRGB(.78-r*.4,.15-r*.05,.18-r*.08);const o=this.atk*6;for(;this.total>this.nextBreak+o&&s.parts.length;){this.nextBreak+=o;const d=Math.floor(Math.random()*s.parts.length),f=s.parts.splice(d,1)[0];rt.play("crash",.08),f.getWorldPosition(ta),f.removeFromParent(),f.position.copy(ta),this.scene.add(f),this.flying.push({mesh:f,vel:new C(3+Math.random()*6,5+Math.random()*5,(Math.random()-.5)*8),spin:(Math.random()-.5)*16,life:99})}for(let d=0;d<(e?8:4);d++){const f=new q(me.spark,new Re({color:e?"#ffe45c":"#fff"}));f.position.copy(t),this.scene.add(f),this.sparks.push({mesh:f,vel:new C(Math.random()*6,Math.random()*6,(Math.random()-.5)*6),life:.35})}const a=t.clone().project(this.camera),l=this.renderer.domElement.clientWidth,c=this.renderer.domElement.clientHeight;this.floatEl.textContent=xe(n),this.floatEl.className=e?"crit":"",this.floatEl.style.left=(a.x*.5+.5)*l+20+"px",this.floatEl.style.top=(-a.y*.5+.5)*c-60+"px",this.floatLife=.6,(u=(h=this.hooks).onHud)==null||u.call(h,this)}reward(){return Math.round(this.total*.35*this.goldMult)+50}render(){this.renderer.render(this.scene,this.camera)}}class H_{constructor(){this.canvas=document.createElement("canvas"),this.renderer=new Eh({canvas:this.canvas,antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),this.renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),this.renderer.outputColorSpace=tn,this.mode=null,this.petCache=new Map,this.t=0,this.heroScene=new Cs,this.heroScene.add(new Us("#dfe8ff","#403040",1.6));const t=new Ds("#fff",1.4);t.position.set(3,5,6),this.heroScene.add(t),this.hero=_l($r({color:"#2fb4ff",player:!0})),this.hero.shadow.visible=!0,this.heroScene.add(this.hero.root),this.heroGloves=[];const e=Ft("#2fb4ff");for(const r of[-1,1]){const o=vl("#e23");o.position.set(.45*r,1.35,.45),this.hero.body.add(o),this.heroGloves.push(o);const a=new q(me.armTube,e);a.position.set(.36*r,1.52,0),a.lookAt(a.position.clone().add(new C(.1*r,-.17,.45))),a.rotateX(Math.PI/2),a.scale.y=.5,this.hero.body.add(a)}this.heroCam=new ze(30,1,.1,50),this.heroCam.position.set(0,1.5,6.2),this.heroCam.lookAt(0,1.15,0),this.ringScene=new Cs,this.ringScene.add(new Us("#dfe8ff","#302030",1.5));const n=new Ds("#fff",1.2);n.position.set(-3,8,5),this.ringScene.add(n),this.ringGroup=new Se,this.ringScene.add(this.ringGroup),this.ringCam=new ze(35,1,.1,100),this.ringCam.position.set(7,7,7),this.ringCam.lookAt(0,0,0),this.petScene=new Cs,this.petScene.add(new Us("#ffffff","#606080",1.8));const s=new Ds("#fff",1.2);s.position.set(2,3,4),this.petScene.add(s),this.petCam=new ze(30,1,.1,20),this.petCam.position.set(.45,1,2.2),this.petCam.lookAt(0,.52,0)}buildRing(t){this.ringGroup.clear();const e=Xi[t%Xi.length],n=new q(new he(6,.5,6),Ft(e.color));n.position.y=-.25,this.ringGroup.add(n);const s=new q(new he(5.6,.05,5.6),Ft("#ffffff",{opacity:.12,transparent:!0}));s.position.y=.01,this.ringGroup.add(s);const r=Ft(e.rope),o=[[-3,-3],[3,-3],[3,3],[-3,3]];for(const[c,h]of o){const u=new q(new De(.12,.14,1.6,8),Ft("#ffcc33"));u.position.set(c,.8,h),this.ringGroup.add(u);const d=new q(new ge(.2,10,8),Ft("#ffcc33",{emissive:"#553300"}));d.position.set(c,1.7,h),this.ringGroup.add(d)}const a=new De(.04,.04,6,6).rotateZ(Math.PI/2);for(let c=0;c<4;c++)for(const h of[.5,.9,1.3]){const u=new q(a,r),d=o[c],f=o[(c+1)%4];u.position.set((d[0]+f[0])/2,h,(d[1]+f[1])/2),u.rotation.y=c%2?Math.PI/2:0,this.ringGroup.add(u)}const l=new q(new Mi(1.2,32),Ft(e.rope,{transparent:!0,opacity:.5}));l.rotation.x=-Math.PI/2,l.position.y=.03,this.ringGroup.add(l)}dressHero(){const t=Rt.state,e=this.hero.gear,n=a=>{const l=Mn(t.equipped[a]);return l?$e[l.rarity].color:null},s=(a,l)=>{const c=n(l);a.visible=!!c,c&&a.material.color.set(c)};s(e.helmet,"helmet"),s(e.belt,"belt"),s(e.armor,"armor"),e.shoes.forEach(a=>s(a,"shoes")),e.pants.forEach(a=>s(a,"pants")),e.band.visible=!e.helmet.visible;const r=Mn(t.equipped.gloves),o=!r||r.rarity===0?"#e23b3b":$e[r.rarity].color;this.heroGloves.forEach(a=>a.userData.ball.material.color.set(o))}mount(t,e){this.mode=e,t.appendChild(this.canvas),e==="hero"&&this.dressHero(),e==="ring"&&this.buildRing(Rt.state.ring.tier),this.resize()}unmount(){this.mode=null,this.canvas.remove()}resize(){var n;const t=(n=this.canvas.parentElement)==null?void 0:n.getBoundingClientRect();if(!t||!t.width)return;this.renderer.setSize(t.width,t.height,!1);const e=t.width/t.height;this.heroCam.aspect=e,this.heroCam.updateProjectionMatrix(),this.ringCam.aspect=e,this.ringCam.updateProjectionMatrix()}update(t){!this.mode||!this.canvas.isConnected||(this.t+=t,this.mode==="hero"?(this.hero.root.rotation.y=Math.sin(this.t*.6)*.5,this.hero.body.position.y=Math.sin(this.t*3)*.03,this.renderer.render(this.heroScene,this.heroCam)):this.mode==="ring"&&(this.ringGroup.rotation.y=this.t*.3,this.renderer.render(this.ringScene,this.ringCam)))}petImage(t){var a,l,c;if(this.petCache.has(t.id))return this.petCache.get(t.id);const e=this.mode,n=this.canvas.parentElement,s=new it;this.renderer.getSize(s);const r=kh(t.color,t.element,t.costume);(l=(a=r.userData).tick)==null||l.call(a,.6);for(let h=0;h<90;h++)(c=r.userData.cloth)==null||c.step(1/60);r.children[1].visible=!1,r.rotation.y=-.35,this.petScene.add(r),this.renderer.setSize(160,160,!1),this.petCam.aspect=1,this.petCam.updateProjectionMatrix(),this.renderer.render(this.petScene,this.petCam);const o=this.canvas.toDataURL("image/png");return this.petScene.remove(r),this.petCache.set(t.id,o),n&&e?this.resize():s.x&&this.renderer.setSize(s.x,s.y,!1),o}}const V_=""+new URL("ad-ChMxYw-G.webp",import.meta.url).href,G_=""+new URL("armor-CVZRZF7E.webp",import.meta.url).href,W_=""+new URL("bag-eB422l47.webp",import.meta.url).href,X_=""+new URL("bar_track-DjaRqiNJ.webp",import.meta.url).href,q_=""+new URL("battle-Ck0BH43L.webp",import.meta.url).href,$_=""+new URL("belt-CqD1UJsI.webp",import.meta.url).href,Y_=""+new URL("btn_blue-DuT9EBoK.webp",import.meta.url).href,Z_=""+new URL("btn_green-BIQctJCe.webp",import.meta.url).href,K_=""+new URL("btn_grey-BKjI_mhO.webp",import.meta.url).href,J_=""+new URL("btn_orange-Cly7woUn.webp",import.meta.url).href,j_=""+new URL("btn_purple-pancuhDE.webp",import.meta.url).href,Q_=""+new URL("btn_red-CbxnvRD_.webp",import.meta.url).href,tv=""+new URL("btn_square-BVKnn31T.webp",import.meta.url).href,ev=""+new URL("car-pnSEgDTj.webp",import.meta.url).href,nv=""+new URL("card-DpagU9j_.webp",import.meta.url).href,iv=""+new URL("check-CQRvqWJo.webp",import.meta.url).href,sv=""+new URL("chest-D1sIBiQ-.webp",import.meta.url).href,rv=""+new URL("close-6HacwjUk.webp",import.meta.url).href,ov=""+new URL("coin--6iTVXoa.webp",import.meta.url).href,av=""+new URL("dot-DLPjHsM_.webp",import.meta.url).href,lv=""+new URL("fist-DY8yeCgo.webp",import.meta.url).href,cv=""+new URL("gem-Cdg0kb-V.webp",import.meta.url).href,hv=""+new URL("gloves-Cs9Nwsli.webp",import.meta.url).href,uv=""+new URL("heart-rbq8gJgG.webp",import.meta.url).href,dv=""+new URL("helmet-CWI1JKz0.webp",import.meta.url).href,fv=""+new URL("hex-CDW_UNmx.webp",import.meta.url).href,pv=""+new URL("lock-Df87ulqx.webp",import.meta.url).href,mv=""+new URL("logo-BF4sQLyi.webp",import.meta.url).href,gv=""+new URL("mute-Is-VpoqS.webp",import.meta.url).href,_v=""+new URL("panel-DpTt_s6D.webp",import.meta.url).href,vv=""+new URL("pants-CUsCb33x.webp",import.meta.url).href,xv=""+new URL("paw-B38UH3jB.webp",import.meta.url).href,Mv=""+new URL("pill-CGEc07Cd.webp",import.meta.url).href,yv=""+new URL("power-d8N1wZUZ.webp",import.meta.url).href,Sv=""+new URL("ribbon-Dev5eDh1.webp",import.meta.url).href,bv=""+new URL("ring-SAk52o1q.webp",import.meta.url).href,wv=""+new URL("settings-7FUPexgH.webp",import.meta.url).href,Ev=""+new URL("shard-C6eOSYKY.webp",import.meta.url).href,Tv=""+new URL("shield-D2LT0ZlI.webp",import.meta.url).href,Av=""+new URL("shoes-Ctc5uZSy.webp",import.meta.url).href,Rv=""+new URL("skill_arm-Ce06deI2.webp",import.meta.url).href,Cv=""+new URL("skill_burn-MW8L1dyq.webp",import.meta.url).href,Pv=""+new URL("skill_chain-BW589VqB.webp",import.meta.url).href,Lv=""+new URL("skill_crit-BEIlnTOQ.webp",import.meta.url).href,Iv=""+new URL("skill_dmg-BB-iZ3Cy.webp",import.meta.url).href,Uv=""+new URL("skill_hp-CqOVR9Bg.webp",import.meta.url).href,Dv=""+new URL("skill_leech-B9M69Wm9.webp",import.meta.url).href,Nv=""+new URL("skill_magnet-BDdptWkt.webp",import.meta.url).href,Fv=""+new URL("skill_range-C6qQgxOC.webp",import.meta.url).href,kv=""+new URL("skill_rate-IRFvFFSC.webp",import.meta.url).href,Ov=""+new URL("skill_slam-Bhs78ttq.webp",import.meta.url).href,Bv=""+new URL("skill_splash-Dk7lrkm7.webp",import.meta.url).href,zv=""+new URL("skull-CCfX_lIy.webp",import.meta.url).href,Hv=""+new URL("slot_0-o1hcVpOu.webp",import.meta.url).href,Vv=""+new URL("slot_1-CWmxKXf1.webp",import.meta.url).href,Gv=""+new URL("slot_2-Rf_DK3Qx.webp",import.meta.url).href,Wv=""+new URL("slot_3-BjYwypkB.webp",import.meta.url).href,Xv=""+new URL("slot_4-BX2dtvuk.webp",import.meta.url).href,qv=""+new URL("slot_5-C0m1MTuW.webp",import.meta.url).href,$v=""+new URL("slot_empty-DbWZerVQ.webp",import.meta.url).href,Yv=""+new URL("sound-Cy_r3WF_.webp",import.meta.url).href,Zv=""+new URL("speed-Dn3RQzY2.webp",import.meta.url).href,Kv=""+new URL("star-Cu_IL5yX.webp",import.meta.url).href,Jv=""+new URL("tab_off-C2DrmGdw.webp",import.meta.url).href,jv=""+new URL("tab_on-DuZz2zSQ.webp",import.meta.url).href,Qv=""+new URL("tag-B2ubQCk2.webp",import.meta.url).href,tx=""+new URL("tree-CJg-xMbz.webp",import.meta.url).href,ex=""+new URL("up-DB9R-Y5d.webp",import.meta.url).href,nx=""+new URL("well-DM1aiX0B.webp",import.meta.url).href,$t=(i,t="0 0 24 24")=>`<svg viewBox="${t}" xmlns="http://www.w3.org/2000/svg">${i}</svg>`,ix={coin:$t('<circle cx="12" cy="12" r="10" fill="#ffc531" stroke="#a86b00" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#fff3b0" stroke-width="2"/>'),gem:$t('<path d="M12 2 21 9 12 22 3 9Z" fill="#c45cff" stroke="#5e1d99" stroke-width="1.6"/><path d="M3 9h18M12 2 8 9l4 13 4-13Z" fill="none" stroke="#f0d0ff" stroke-width="1"/>'),shard:$t('<path d="M12 2 20 8 17 21H7L4 8Z" fill="#3dff7a" stroke="#0f7a33" stroke-width="1.6"/><path d="M12 2 12 21M4 8l8 3 8-3" fill="none" stroke="#c7ffd9" stroke-width="1"/>'),star:$t('<path d="m12 2 3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8Z" fill="#ffd23f" stroke="#a86b00" stroke-width="1.5"/>'),heart:$t('<path d="M12 21S3 14.5 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 14.5 12 21 12 21Z" fill="#ff4d6a" stroke="#8a1025" stroke-width="1.6"/>'),fist:$t('<rect x="4" y="6" width="14" height="12" rx="5" fill="#ff4d4d" stroke="#8a1010" stroke-width="1.6"/><rect x="16" y="9" width="5" height="6" rx="1.5" fill="#fff" stroke="#8a1010" stroke-width="1.4"/><path d="M8 6v5M12 6v5" stroke="#8a1010" stroke-width="1.4"/>'),sword:$t('<path d="M4 20 16 8l2-4 2 2-4 2L4 20Z" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5"/><path d="M3 15l6 6M6 18l-2 2" stroke="#8a5a00" stroke-width="2"/><path d="M20 20 8 8 6 4 4 6l4 2 12 12Z" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5"/>'),shield:$t('<path d="M12 2 20 5v7c0 5-4 8.5-8 10-4-1.5-8-5-8-10V5Z" fill="#4fa3ff" stroke="#123f7a" stroke-width="1.6"/>'),bolt:$t('<path d="M13 2 4 14h7l-1 8 9-12h-7Z" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5"/>'),fire:$t('<path d="M12 22c-4 0-7-3-7-7 0-4 4-6 4-11 3 2 5 5 5 8 1-1 2-2 2-4 2 2 3 4 3 7 0 4-3 7-7 7Z" fill="#ff8a2a" stroke="#8a3000" stroke-width="1.5"/><path d="M12 22c-2 0-3-1.5-3-3.5S12 15 12 13c1.5 1.5 3 3 3 5.5S14 22 12 22Z" fill="#ffe066"/>'),range:$t('<circle cx="12" cy="12" r="9" fill="none" stroke="#4fd1ff" stroke-width="2" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="3" fill="#4fd1ff"/><path d="M12 12h9" stroke="#fff" stroke-width="2"/>'),arm:$t('<path d="M3 17c4-1 6-5 9-8" stroke="#2fb4ff" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="16" cy="7" r="5" fill="#ff4d4d" stroke="#8a1010" stroke-width="1.5"/><path d="M19 17h3M20.5 15.5v3" stroke="#fff" stroke-width="2"/>'),slam:$t('<ellipse cx="12" cy="18" rx="10" ry="3" fill="none" stroke="#f0a060" stroke-width="2"/><ellipse cx="12" cy="18" rx="5" ry="1.5" fill="none" stroke="#f0a060" stroke-width="2"/><path d="M12 2v10M8 8l4 4 4-4" stroke="#fff" stroke-width="2" fill="none"/>'),drop:$t('<path d="M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13Z" fill="#e0354b" stroke="#6b0f1c" stroke-width="1.5"/>'),magnet:$t('<path d="M5 3v9a7 7 0 0 0 14 0V3h-4v9a3 3 0 0 1-6 0V3Z" fill="#ff4d4d" stroke="#6b0f1c" stroke-width="1.4"/><path d="M5 3h4v3H5zM15 3h4v3h-4z" fill="#ddd"/>'),burst:$t('<path d="m12 1 2.5 6 6-2.5-2.5 6 6 2.5-6 2.5 2.5 6-6-2.5L12 25l-2.5-6-6 2.5 2.5-6-6-2.5 6-2.5L3.5 4.5l6 2.5Z" transform="scale(.92) translate(1 0)" fill="#ffae4f" stroke="#8a4a00" stroke-width="1.3"/>'),settings:$t('<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 5.5v-3l-2.4-.6a7 7 0 0 0-.8-1.9l1.3-2.1-2.1-2.1-2.1 1.3a7 7 0 0 0-1.9-.8L12.5 2h-3l-.6 2.4a7 7 0 0 0-1.9.8L4.9 3.9 2.8 6l1.3 2.1a7 7 0 0 0-.8 1.9L1 10.5v3l2.4.6c.2.7.4 1.3.8 1.9l-1.3 2.1L5 20.2l2.1-1.3c.6.4 1.2.6 1.9.8l.6 2.3h3l.6-2.4a7 7 0 0 0 1.9-.8l2.1 1.3 2.1-2.1-1.3-2.1c.4-.6.6-1.2.8-1.9Z" fill="#dfe6f5"/>'),skull:$t('<path d="M12 2C7 2 4 5.5 4 10c0 3 1.5 5 3 6v3h10v-3c1.5-1 3-3 3-6 0-4.5-3-8-8-8Z" fill="#ff3b4f" stroke="#6b0f1c" stroke-width="1.5"/><circle cx="9" cy="11" r="2" fill="#2a0a10"/><circle cx="15" cy="11" r="2" fill="#2a0a10"/><path d="M10 19v-2M14 19v-2M12 19v-2" stroke="#6b0f1c" stroke-width="1.3"/>'),lock:$t('<rect x="5" y="10" width="14" height="11" rx="2" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#c9d1e0" stroke-width="2.5"/>'),paw:$t('<ellipse cx="12" cy="16" rx="5" ry="4.5" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.5"/><circle cx="6" cy="10" r="2.3" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.3"/><circle cx="10" cy="6.5" r="2.3" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.3"/><circle cx="14" cy="6.5" r="2.3" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.3"/><circle cx="18" cy="10" r="2.3" fill="#ffb3d1" stroke="#7a1a4a" stroke-width="1.3"/>'),tree:$t('<path d="M12 21V11M12 11 6 6M12 11l6-5M6 6V3M18 6V3" stroke="#ffe066" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="12" cy="11" r="3" fill="#b25cff" stroke="#fff" stroke-width="1.3"/><circle cx="6" cy="4" r="2.2" fill="#ff8a2a"/><circle cx="18" cy="4" r="2.2" fill="#ff8a2a"/>'),battle:$t('<path d="M3 3 14 14M3 3h4M3 3v4" stroke="#dfe6f5" stroke-width="2.5" stroke-linecap="round"/><path d="M21 3 10 14M21 3h-4M21 3v4" stroke="#dfe6f5" stroke-width="2.5" stroke-linecap="round"/><path d="M6 16l2 2-3 3-2-2ZM18 16l-2 2 3 3 2-2Z" fill="#ffd23f"/>'),chest:$t('<rect x="3" y="9" width="18" height="12" rx="2" fill="#b0672f" stroke="#4a2408" stroke-width="1.5"/><path d="M3 12c0-6 18-6 18 0" fill="#d08a45" stroke="#4a2408" stroke-width="1.5"/><rect x="10" y="11" width="4" height="5" rx="1" fill="#ffd23f" stroke="#4a2408"/>'),ring:$t('<path d="M3 15 12 20l9-5-9-5Z" fill="#6b8cff" stroke="#1a2a6b" stroke-width="1.4"/><path d="M4 9v6M20 9v6M12 4v6M12 14v6" stroke="#ffd23f" stroke-width="2"/><path d="M4 11 12 6l8 5" stroke="#b25cff" stroke-width="1.5" fill="none"/>'),play:$t('<path d="M7 4v16l13-8Z" fill="#fff"/>'),ad:$t('<rect x="2" y="5" width="20" height="14" rx="3" fill="#fff"/><path d="M10 9v6l5-3Z" fill="#2a8a3a"/>'),car:$t('<path d="M3 15v-3l3-4h9l4 4h2v3Z" fill="#e8343f" stroke="#6b0f1c" stroke-width="1.4"/><circle cx="7" cy="16" r="2.3" fill="#222"/><circle cx="17" cy="16" r="2.3" fill="#222"/><path d="M7 11l2-2.5h5l2 2.5Z" fill="#9fd3ff"/>'),speed:$t('<path d="M4 5v14l8-7ZM12 5v14l8-7Z" fill="#fff"/>'),sound:$t('<path d="M3 9h4l5-4v14l-5-4H3Z" fill="#fff"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13" stroke="#fff" stroke-width="2" fill="none"/>'),mute:$t('<path d="M3 9h4l5-4v14l-5-4H3Z" fill="#fff"/><path d="m16 9 6 6M22 9l-6 6" stroke="#ff5a5a" stroke-width="2.4"/>'),close:$t('<path d="M5 5l14 14M19 5 5 19" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>'),up:$t('<path d="M12 3 21 13h-5v8H8v-8H3Z" fill="#3dff7a" stroke="#0f6b2a" stroke-width="1.4"/>'),info:$t('<circle cx="12" cy="12" r="10" fill="#fff"/><path d="M12 10v7M12 6.5v.5" stroke="#28314a" stroke-width="2.6" stroke-linecap="round"/>'),gloves:$t('<rect x="4" y="5" width="13" height="12" rx="5" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><rect x="6" y="16" width="9" height="5" rx="1.5" fill="#f4f4f4" stroke="#1a1a2a" stroke-width="1.3"/><rect x="15" y="8" width="5" height="5" rx="2" fill="currentColor" stroke="#1a1a2a" stroke-width="1.3"/>'),helmet:$t('<path d="M3 15a9 9 0 0 1 18 0v3H3Z" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><path d="M7 13h10v5H7Z" fill="#1d2230"/><path d="M12 6v5" stroke="#fff" stroke-width="1.5" opacity=".6"/>'),armor:$t('<path d="M7 3 4 6v7l3 1v7h10v-7l3-1V6l-3-3-2 2c-1 1-5 1-6 0Z" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><path d="M9 11h6M9 15h6" stroke="#fff" stroke-width="1.5" opacity=".6"/>'),belt:$t('<rect x="2" y="9" width="20" height="6" rx="2" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><rect x="9" y="7.5" width="6" height="9" rx="1.5" fill="#ffd23f" stroke="#1a1a2a" stroke-width="1.4"/>'),pants:$t('<path d="M5 3h14l1 18h-6l-2-11-2 11H4Z" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><path d="M5 6h14" stroke="#fff" stroke-width="1.4" opacity=".6"/>'),shoes:$t('<path d="M3 17V9h6l2 3c3 0 7 1 9 3v3H3Z" fill="currentColor" stroke="#1a1a2a" stroke-width="1.5"/><path d="M3 18h18" stroke="#f4f4f4" stroke-width="2.4"/><path d="M9 12l2 2M11 11l2 2" stroke="#fff" stroke-width="1.2"/>')},sx=Object.assign({"./assets/ui/ad.webp":V_,"./assets/ui/armor.webp":G_,"./assets/ui/bag.webp":W_,"./assets/ui/bar_track.webp":X_,"./assets/ui/battle.webp":q_,"./assets/ui/belt.webp":$_,"./assets/ui/btn_blue.webp":Y_,"./assets/ui/btn_green.webp":Z_,"./assets/ui/btn_grey.webp":K_,"./assets/ui/btn_orange.webp":J_,"./assets/ui/btn_purple.webp":j_,"./assets/ui/btn_red.webp":Q_,"./assets/ui/btn_square.webp":tv,"./assets/ui/car.webp":ev,"./assets/ui/card.webp":nv,"./assets/ui/check.webp":iv,"./assets/ui/chest.webp":sv,"./assets/ui/close.webp":rv,"./assets/ui/coin.webp":ov,"./assets/ui/dot.webp":av,"./assets/ui/fist.webp":lv,"./assets/ui/gem.webp":cv,"./assets/ui/gloves.webp":hv,"./assets/ui/heart.webp":uv,"./assets/ui/helmet.webp":dv,"./assets/ui/hex.webp":fv,"./assets/ui/lock.webp":pv,"./assets/ui/logo.webp":mv,"./assets/ui/mute.webp":gv,"./assets/ui/panel.webp":_v,"./assets/ui/pants.webp":vv,"./assets/ui/paw.webp":xv,"./assets/ui/pill.webp":Mv,"./assets/ui/power.webp":yv,"./assets/ui/ribbon.webp":Sv,"./assets/ui/ring.webp":bv,"./assets/ui/settings.webp":wv,"./assets/ui/shard.webp":Ev,"./assets/ui/shield.webp":Tv,"./assets/ui/shoes.webp":Av,"./assets/ui/skill_arm.webp":Rv,"./assets/ui/skill_burn.webp":Cv,"./assets/ui/skill_chain.webp":Pv,"./assets/ui/skill_crit.webp":Lv,"./assets/ui/skill_dmg.webp":Iv,"./assets/ui/skill_hp.webp":Uv,"./assets/ui/skill_leech.webp":Dv,"./assets/ui/skill_magnet.webp":Nv,"./assets/ui/skill_range.webp":Fv,"./assets/ui/skill_rate.webp":kv,"./assets/ui/skill_slam.webp":Ov,"./assets/ui/skill_splash.webp":Bv,"./assets/ui/skull.webp":zv,"./assets/ui/slot_0.webp":Hv,"./assets/ui/slot_1.webp":Vv,"./assets/ui/slot_2.webp":Gv,"./assets/ui/slot_3.webp":Wv,"./assets/ui/slot_4.webp":Xv,"./assets/ui/slot_5.webp":qv,"./assets/ui/slot_empty.webp":$v,"./assets/ui/sound.webp":Yv,"./assets/ui/speed.webp":Zv,"./assets/ui/star.webp":Kv,"./assets/ui/tab_off.webp":Jv,"./assets/ui/tab_on.webp":jv,"./assets/ui/tag.webp":Qv,"./assets/ui/tree.webp":tx,"./assets/ui/up.webp":ex,"./assets/ui/well.webp":nx}),Ka={};for(const[i,t]of Object.entries(sx))Ka[i.split("/").pop().replace(".webp","")]=t;const rx={sword:"power",play:"ad",bolt:"skill_rate",fire:"skill_burn",arm:"skill_arm",slam:"skill_slam",drop:"skill_leech",magnet:"skill_magnet",burst:"skill_splash"};function Hh(i){return Ka[i]||Ka[rx[i]]||null}function ci(i){const t=Hh(i);return t?`<img src="${t}" alt="" draggable="false">`:ix[i]||""}function Vt(i,t="ic"){return`<span class="${t}">${ci(i)}</span>`}const zt=(i,t=document)=>t.querySelector(i),Lt={preview:null,hooks:{},init(i,t){this.preview=i,this.hooks=t,zt("#btnSettings").innerHTML=ci("settings"),zt("#hpIcon").innerHTML=ci("heart"),zt("#stageBoss").innerHTML=ci("skull");const e={pet:["paw","PET"],talents:["tree","TALENTS"],battle:["battle","BATTLE"],inventory:["bag","INVENTORY"],ring:["ring","RING"]};for(const n of document.querySelectorAll("#nav button")){const[s,r]=e[n.dataset.tab];n.innerHTML=`${Vt(s)}<span class="stroke">${r}</span>`}zt("#btnSettings").onclick=()=>{rt.play("click"),this.settings()},setInterval(()=>this.updateAdTimers(),1e3),this.renderCurrencies()},renderCurrencies(i){const t=Rt.state,e=zt("#currencies");e.innerHTML=[["coin",t.coins],["gem",t.gems],["shard",t.shards],["star",t.bestStage]].map(([n,s])=>`<div class="cur stroke ${i===n?"bump":""}">${Vt(n)}<b>${xe(s)}</b></div>`).join(""),this.renderNavDots()},renderNavDots(){var e;const i=Rt.state,t={inventory:this.mergeGroups().length>0||vn.some(n=>!i.equipped[n.id]&&i.items.some(s=>s.slot===n.id)),pet:i.shards>=10||un.some(n=>i.pets[n.id]&&i.pets[n.id].cards>=ps(i.pets[n.id].lvl)),talents:this.cheapestTalent()!==null&&i.coins>=this.cheapestTalent(),ring:i.coins>=this.ringCost()};for(const n of document.querySelectorAll("#nav button"))(e=n.querySelector(".dot"))==null||e.remove(),t[n.dataset.tab]&&n.insertAdjacentHTML("beforeend",'<span class="dot"></span>')},toast(i){const t=zt("#toast");t.innerHTML=i,t.classList.add("show"),clearTimeout(this._toastT),this._toastT=setTimeout(()=>t.classList.remove("show"),1600)},modal(i,t,{closable:e=!0}={}){const n=zt("#modal"),s=zt("#modalCard");n.classList.contains("hidden")&&rt.play("open",.15),s.innerHTML=i,n.classList.remove("hidden"),n.onclick=e?r=>{r.target===n&&this.closeModal()}:null,t==null||t(s)},closeModal(){zt("#modal").classList.add("hidden"),zt("#modalCard").innerHTML=""},get modalOpen(){return!zt("#modal").classList.contains("hidden")},spend(i,t){const e=Rt.state;if(e[i]<t){const n={coins:"coins",gems:"gems",shards:"shards"};return this.toast(`Not enough ${n[i]}!`),rt.play("error",.2),!1}return e[i]-=t,this.renderCurrencies(),Ae(),!0},async rewardedAd(i="Reward received!"){var e,n,s,r;if(this.adblock)return this.toast("Ads are blocked, bonus offers are off"),!1;(n=(e=this.hooks).adStart)==null||n.call(e);const t=await en.rewarded({onError:o=>{(o==="adblock"||(o==null?void 0:o.code)==="adblock")&&this.setAdblock(!0)}});return(r=(s=this.hooks).adEnd)==null||r.call(s),t?this.rewardFx(i):this.toast("Ad not available right now"),t},adblock:!1,setAdblock(i){this.adblock=i,document.body.classList.toggle("adblock",i)},adBtn(i,t,e="green",n=null){const s=n?` data-adcd="${n}" data-label="${t}"`:"";return`<button class="btn ${e} ad" id="${i}"${s}>${Vt("ad")}<span class="lbl">${t}</span></button><span class="adblock-note">Ads blocked: bonus unavailable</span>`},rewardFx(i){const t=document.createElement("div");t.className="reward-fx",t.innerHTML=`${Vt("star")}<span class="stroke">${i}</span>`,document.getElementById("app").appendChild(t),rt.play("reward"),setTimeout(()=>t.remove(),1500)},AD_COOLDOWNS:{chest:4*6e4,summon:4*6e4,double:2*6e4},adLeft(i){var t;return Math.max(0,this.AD_COOLDOWNS[i]-(Date.now()-(((t=Rt.state.adCd)==null?void 0:t[i])||0)))},adReady(i){return this.adLeft(i)===0},markAd(i){var t;((t=Rt.state).adCd||(t.adCd={}))[i]=Date.now(),Ae()},updateAdTimers(){for(const i of document.querySelectorAll("[data-adcd]")){const t=Math.ceil(this.adLeft(i.dataset.adcd)/1e3);i.disabled=t>0,i.querySelector(".lbl").textContent=t>0?`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`:i.dataset.label}},settings(){const i=Rt.state;this.modal(`
      <h2 class="stroke">SETTINGS</h2>
      <div class="set-row"><span>Sound</span><button class="btn small ${i.muted?"red":"green"}" id="stSound">${Vt(i.muted?"mute":"sound")} ${i.muted?"OFF":"ON"}</button></div>
      <div class="set-row"><span>Music</span><button class="btn small ${i.musicMuted?"red":"green"}" id="stMusic">${Vt(i.musicMuted?"mute":"sound")} ${i.musicMuted?"OFF":"ON"}</button></div>
      <div class="set-row"><span>Global Power</span><b>${xe(Zi().power)}</b></div>
      <div class="set-row"><span>Best Stage</span><b>${i.bestStage}</b></div>
      <div class="set-row"><span>Enemies defeated</span><b>${xe(i.stats.kills)}</b></div>
      <button class="btn small red" id="stReset">Reset progress</button>
      <button class="btn green" id="stClose">CLOSE</button>
    `,t=>{zt("#stSound",t).onclick=()=>{i.muted=!i.muted,rt.setMuted(i.muted),Ae(),this.settings()},zt("#stMusic",t).onclick=()=>{i.musicMuted=!i.musicMuted,rt.setMusicMuted(i.musicMuted),rt.play("click"),Ae(),this.settings()},zt("#stClose",t).onclick=()=>this.closeModal(),zt("#stReset",t).onclick=()=>{this.modal('<h2>Reset?</h2><p class="muted">All progress will be lost.</p><div class="modal-btns"><button class="btn" id="rsNo">Cancel</button><button class="btn red" id="rsYes">Reset</button></div>',e=>{zt("#rsNo",e).onclick=()=>this.settings(),zt("#rsYes",e).onclick=()=>{Rt.reset(),location.reload()}})}})},mission(){const i=Rt.state,t=ws[i.mission.idx%ws.length],e=Math.round(t.base*(1+i.mission.round*.6)),n=Math.min(e,i.stats[t.stat]-i.mission.startVal);return{def:t,target:e,cur:n,reward:15+i.mission.round*5,done:n>=e}},renderMission(){const i=this.mission(),t=zt("#mission");t.className=i.done?"ready":"",t.innerHTML=`
      <div class="mbar"><div class="mfill" style="width:${i.cur/i.target*100}%"></div><span class="stroke">${i.cur}/${i.target}</span></div>
      <div class="mtext stroke">${i.done?"TAP TO CLAIM!":i.def.text.replace("{n}",i.target)}</div>
      <div class="mreward stroke">${Vt("gem")}${i.reward}</div>`,t.onclick=()=>{if(!i.done){this.toast(i.def.text.replace("{n}",i.target));return}const e=Rt.state;e.gems+=i.reward,e.mission.idx=(e.mission.idx+1)%ws.length,e.mission.idx===0&&e.mission.round++;const n=ws[e.mission.idx];e.mission.startVal=e.stats[n.stat],rt.play("buy"),this.renderCurrencies("gem"),this.renderMission(),Ae()}},mergeGroups(){const i={};for(const t of Rt.state.items){if(t.rarity>=$e.length-1)continue;const e=t.slot+":"+t.rarity;(i[e]||(i[e]=[])).push(t)}return Object.values(i).filter(t=>t.length>=3)},itemSlotHtml(i,t=""){return i?($e[i.rarity],`<div class="gslot r${i.rarity} ${t}" data-uid="${i.uid}">
      ${Vt(i.slot)}<span class="lv stroke">Lv.${i.lvl}</span></div>`):""},renderInventory(){const i=Rt.state,t=Zi(),e=zt("#scr-inventory"),n=a=>{const l=Mn(i.equipped[a]);if(!l){const u=i.items.some(d=>d.slot===a);return`<div class="gslot empty" data-slot="${a}">${Vt(a)}${u?`<span class="up">${ci("up")}</span>`:""}</div>`}$e[l.rarity];const c=l.lvl<Dc[l.rarity]&&i.coins>=Nc(l),h=i.items.some(u=>u.slot===a&&u.uid!==l.uid&&(u.rarity>l.rarity||u.rarity===l.rarity&&u.lvl>l.lvl));return`<div class="gslot r${l.rarity}" data-uid="${l.uid}">
        ${Vt(a)}<span class="lv stroke">Lv.${l.lvl}</span>${c||h?`<span class="up">${ci("up")}</span>`:""}</div>`},s=i.items.filter(a=>!Object.values(i.equipped).includes(a.uid)).sort((a,l)=>l.rarity-a.rarity||vn.findIndex(c=>c.id===a.slot)-vn.findIndex(c=>c.id===l.slot)||l.lvl-a.lvl),r=this.mergeGroups(),o=new Set(r.flat().map(a=>a.uid));e.innerHTML=`<div class="screen-inner split">
      <div class="panel">
        <div class="hero-box">
          <div class="slot-col">${["gloves","helmet","armor"].map(n).join("")}</div>
          <div class="hero-view" id="heroView"></div>
          <div class="slot-col">${["belt","pants","shoes"].map(n).join("")}</div>
        </div>
        <div class="stat-strip stroke" style="margin-top:10px">
          <div>${Vt("sword")}${xe(t.power)}</div>
          <div>${Vt("fist")}${xe(t.atk)}</div>
          <div>${Vt("heart")}${xe(t.hp)}</div>
        </div>
        <div class="row" style="margin-top:10px;justify-content:center;gap:8px;flex-wrap:wrap">
          <button class="btn orange small" id="invMerge" ${r.length?"":"disabled"}>MERGE ${r.length?`(${r.length})`:""}</button>
          <button class="btn purple small" id="invChest">${Vt("chest")} CHEST ${Vt("gem")}30</button>
          ${this.adBtn("invAdChest","FREE CHEST","green small","chest")}
        </div>
      </div>
      <div class="panel">
        <h3 class="stroke">INVENTORY</h3>
        ${s.length?`<div class="inv-grid">${s.map(a=>this.itemSlotHtml(a).replace('class="gslot',`class="gslot${o.has(a.uid)?" mg":""}`).replace("</div>",o.has(a.uid)?'<span class="merge">3x</span></div>':"</div>")).join("")}</div>`:'<p class="muted" style="text-align:center">No spare gear. Clear stages or open chests!</p>'}
      </div>
    </div>`,this.preview.mount(zt("#heroView",e),"hero"),e.querySelectorAll(".gslot[data-uid]").forEach(a=>a.onclick=()=>{rt.play("click"),this.itemModal(+a.dataset.uid)}),e.querySelectorAll(".gslot[data-slot]").forEach(a=>a.onclick=()=>{var c,h;const l=i.items.filter(u=>u.slot===a.dataset.slot).sort((u,d)=>d.rarity-u.rarity||d.lvl-u.lvl)[0];l?(i.equipped[a.dataset.slot]=l.uid,rt.play("buy"),Ae(),this.renderInventory(),(h=(c=this.hooks).gearChanged)==null||h.call(c)):this.toast("No item for this slot yet")}),zt("#invMerge",e).onclick=()=>this.mergeAll(),zt("#invChest",e).onclick=()=>{this.spend("gems",30)&&this.openChest()},zt("#invAdChest",e).onclick=async()=>{this.adReady("chest")&&await this.rewardedAd("Free chest!")&&(this.markAd("chest"),this.openChest())},this.updateAdTimers()},rollItem(i=0){const t=Rt.state,e=Math.random()*100,n=Math.min(20,i);let s=0;e<1+n*.2?s=3:e<8+n*.8?s=2:e<35+n&&(s=1);const r=vn[Math.floor(Math.random()*vn.length)].id,o={uid:t.uid++,slot:r,rarity:s,lvl:1};return t.items.push(o),t.equipped[r]||(t.equipped[r]=o.uid),o},openChest(){const i=this.rollItem(Rt.state.bestStage);rt.play("level");const t=$e[i.rarity],e=vn.find(n=>n.id===i.slot);this.modal(`<h2 class="stroke" style="color:${t.color}">${t.name.toUpperCase()}!</h2>
      <div style="width:110px">${this.itemSlotHtml(i)}</div>
      <p class="stroke">${e.name} · ${e.stat==="atk"?"Attack":"HP"} +${Ns(i)}</p>
      <button class="btn green" id="okC">NICE!</button>`,n=>{zt("#okC",n).onclick=()=>{var s,r;this.closeModal(),this.renderInventory(),(r=(s=this.hooks).gearChanged)==null||r.call(s)}}),Ae(),this.renderNavDots()},mergeAll(){var n,s;const i=Rt.state;let t=0,e;for(;(e=this.mergeGroups()).length;)for(const r of e){r.sort((c,h)=>h.lvl-c.lvl);const o=r.slice(0,3),a=o.some(c=>i.equipped[c.slot]===c.uid);i.items=i.items.filter(c=>!o.includes(c));const l={uid:i.uid++,slot:o[0].slot,rarity:o[0].rarity+1,lvl:o[0].lvl};i.items.push(l),(a||!Mn(i.equipped[l.slot])||Mn(i.equipped[l.slot]).rarity<l.rarity)&&(i.equipped[l.slot]=l.uid),t++}rt.play("level"),this.toast(`Merged ${t} item${t>1?"s":""}!`),Ae(),this.renderInventory(),(s=(n=this.hooks).gearChanged)==null||s.call(n)},itemModal(i){const t=Rt.state,e=Mn(i);if(!e)return;const n=$e[e.rarity],s=vn.find(h=>h.id===e.slot),r=t.equipped[e.slot]===i,o=Dc[e.rarity],a=Nc(e),l={...e,lvl:e.lvl+1},c=Math.round(20*(1+e.rarity*2)*e.lvl);this.modal(`
      <h2 class="stroke" style="color:${n.color}">${n.name} ${s.name}</h2>
      <div class="item-detail">
        ${this.itemSlotHtml(e)}
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div class="set-row"><span>${s.stat==="atk"?Vt("fist")+" Attack":Vt("heart")+" HP"}</span><b>${Ns(e)}${e.lvl<o?` <span style="color:var(--green)">→ ${Ns(l)}</span>`:""}</b></div>
          <div class="set-row"><span>Level</span><b>${e.lvl} / ${o}</b></div>
        </div>
      </div>
      <div class="modal-btns">
        ${r?"":'<button class="btn teal" id="imEquip">EQUIP</button>'}
        ${e.lvl<o?`<button class="btn green" id="imUp">${Vt("up")} UPGRADE ${Vt("coin")}${xe(a)}</button>`:'<button class="btn" disabled>MAX LEVEL</button>'}
        ${r?"":`<button class="btn red small" id="imSell">SELL ${Vt("coin")}${xe(c)}</button>`}
      </div>
      <button class="btn small" id="imClose">CLOSE</button>`,h=>{zt("#imClose",h).onclick=()=>this.closeModal();const u=zt("#imEquip",h);u&&(u.onclick=()=>{var g,v;t.equipped[e.slot]=i,rt.play("buy"),Ae(),this.closeModal(),this.renderInventory(),(v=(g=this.hooks).gearChanged)==null||v.call(g)});const d=zt("#imUp",h);d&&(d.onclick=()=>{var g,v;this.spend("coins",a)&&(e.lvl++,t.stats.gearUps++,rt.play("buy"),Ae(),this.itemModal(i),this.renderInventory(),(v=(g=this.hooks).gearChanged)==null||v.call(g))});const f=zt("#imSell",h);f&&(f.onclick=()=>{t.items=t.items.filter(g=>g.uid!==i),t.coins+=c,rt.play("coin"),this.renderCurrencies("coin"),Ae(),this.closeModal(),this.renderInventory()})})},renderPets(){const i=Rt.state,t=zt("#scr-pet"),e=(r,o={})=>{const a=i.pets[r.id];$e[r.rarity];const l=(a==null?void 0:a.lvl)||1,c=ps(l),h=(a==null?void 0:a.cards)||0,u=i.petSlots.includes(r.id);return`<div class="pet-card r${r.rarity} ${a?"":"locked"} ${u&&!o.slot?"equipped":""}" data-pet="${r.id}">
        <span class="lvtag stroke">${a?l:"?"}</span>
        <img class="pet-img" src="${this.preview.petImage(r)}" alt="">
        <b class="stroke">${r.name}</b>
        <span class="pet-skill">${r.skill.name}</span>
        ${a?`<div class="cards"><i style="width:${Math.min(100,h/c*100)}%"></i><span class="stroke">${h}/${c}</span></div>`:""}
      </div>`},n=i.petSlots.map((r,o)=>{const a=un.find(l=>l.id===r);return a?e(a,{slot:!0}).replace("data-pet",`data-slot="${o}" data-pet`):`<div class="pet-card empty" data-slot="${o}"><span class="muted">EMPTY</span></div>`}).join(""),s={atk:0,hp:0,xp:0,gold:0};for(const r of i.petSlots){const o=un.find(a=>a.id===r);o&&i.pets[r]&&(s[o.stat]+=Oi(o,i.pets[r].lvl))}t.innerHTML=`<div class="screen-inner split">
      <div class="panel">
        <div class="pet-slots">${n}</div>
        <p class="muted" style="text-align:center;margin:8px 0">Pets: +${s.atk.toFixed(0)}% ATK · +${s.hp.toFixed(0)}% HP · +${s.xp.toFixed(0)}% EXP · +${s.gold.toFixed(0)}% Gold</p>
        <div class="row" style="justify-content:center;gap:10px">
          <button class="btn teal small" id="petBest">EQUIP BEST</button>
          <button class="btn green small" id="petUpAll">UPGRADE ALL</button>
        </div>
        <div class="row" style="justify-content:center;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn purple" id="petBuy1">SUMMON 1x ${Vt("shard")}10</button>
          <button class="btn purple" id="petBuy10">SUMMON 10x ${Vt("shard")}90</button>
          ${this.adBtn("petAd","FREE SUMMON","orange small","summon")}
        </div>
      </div>
      <div class="panel"><div class="pet-grid">${un.slice().sort((r,o)=>!!i.pets[o.id]-!!i.pets[r.id]||o.rarity-r.rarity).map(r=>e(r)).join("")}</div></div>
    </div>`,t.querySelectorAll(".pet-card[data-pet]").forEach(r=>r.onclick=()=>{rt.play("click"),this.petModal(r.dataset.pet)}),zt("#petBuy1",t).onclick=()=>{this.spend("shards",10)&&this.summon(1)},zt("#petBuy10",t).onclick=()=>{this.spend("shards",90)&&this.summon(10)},zt("#petAd",t).onclick=async()=>{this.adReady("summon")&&await this.rewardedAd("Free summon!")&&(this.markAd("summon"),this.summon(1))},this.updateAdTimers(),zt("#petBest",t).onclick=()=>{var o,a;const r=un.filter(l=>i.pets[l.id]).sort((l,c)=>Oi(c,i.pets[c.id].lvl)*(c.stat==="atk"?1.3:1)-Oi(l,i.pets[l.id].lvl)*(l.stat==="atk"?1.3:1));i.petSlots=[0,1,2].map(l=>{var c;return((c=r[l])==null?void 0:c.id)||null}),rt.play("buy"),Ae(),this.renderPets(),(a=(o=this.hooks).gearChanged)==null||a.call(o)},zt("#petUpAll",t).onclick=()=>{var o,a;let r=0;for(const l of un){const c=i.pets[l.id];for(;c&&c.cards>=ps(c.lvl);)c.cards-=ps(c.lvl),c.lvl++,r++}r?(rt.play("level"),this.toast(`${r} pet level${r>1?"s":""} gained!`),Ae(),this.renderPets(),(a=(o=this.hooks).gearChanged)==null||a.call(o)):this.toast("Collect more duplicate cards")}},skillBox(i){return`<div class="skill-box">${Vt("star")}<div><b class="stroke">${i.skill.name}</b><span>${i.skill.desc}</span></div></div>`},summon(i){var s,r;const t=Rt.state,e=[],n=qo.reduce((o,a)=>o+a,0);for(let o=0;o<i;o++){let a=Math.random()*n,l=0;for(let u=0;u<qo.length;u++)if(a-=qo[u],a<=0){l=u;break}let c=un.filter(u=>u.rarity===l);c.length||(c=un.filter(u=>u.rarity===0));const h=c[Math.floor(Math.random()*c.length)];if(t.pets[h.id])t.pets[h.id].cards++;else{t.pets[h.id]={lvl:1,cards:0};const u=t.petSlots.indexOf(null);u>=0&&(t.petSlots[u]=h.id)}e.push(h)}t.stats.summons+=i,rt.play("level"),this.modal(`<h2 class="stroke">SUMMONED!</h2>
      <div class="pet-grid" style="width:${i===1?"150px":"100%"};grid-template-columns:repeat(${Math.min(5,i)},1fr)">
        ${e.map(o=>`<div class="pet-card r${o.rarity}"><img class="pet-img" src="${this.preview.petImage(o)}"><b class="stroke">${o.name}</b><span class="pet-skill">${o.skill.name}</span></div>`).join("")}
      </div><button class="btn green" id="okS">OK</button>`,o=>{zt("#okS",o).onclick=()=>{this.closeModal(),this.renderPets()}}),Ae(),this.renderPets(),(r=(s=this.hooks).gearChanged)==null||r.call(s)},petModal(i){const t=Rt.state,e=un.find(l=>l.id===i),n=t.pets[i],s=$e[e.rarity],r={atk:"Attack",hp:"Max HP",xp:"Fight EXP",gold:"Gold"}[e.stat];if(!n){this.modal(`<h2 class="stroke" style="color:${s.color}">${e.name}</h2><img src="${this.preview.petImage(e)}" width="120" style="filter:brightness(.3)">${this.skillBox(e)}<p class="muted">${s.name} pet · +${r}. Summon to unlock!</p><button class="btn" id="pmC">CLOSE</button>`,l=>{zt("#pmC",l).onclick=()=>this.closeModal()});return}const o=ps(n.lvl),a=t.petSlots.indexOf(i);this.modal(`<h2 class="stroke" style="color:${s.color}">${e.name} · Lv.${n.lvl}</h2>
      <img src="${this.preview.petImage(e)}" width="130">
      <div class="set-row"><span>${r}</span><b>+${Oi(e,n.lvl).toFixed(1)}% <span style="color:var(--green)">→ +${Oi(e,n.lvl+1).toFixed(1)}%</span></b></div>
      <div class="set-row"><span>Cards</span><b>${n.cards} / ${o}</b></div>
      ${this.skillBox(e)}
      <p class="muted">Equipped pets fight beside you. Skills get stronger with every level.</p>
      <div class="modal-btns">
        <button class="btn green" id="pmUp" ${n.cards>=o?"":"disabled"}>LEVEL UP</button>
        <button class="btn teal" id="pmEq">${a>=0?"UNEQUIP":"EQUIP"}</button>
      </div><button class="btn small" id="pmC">CLOSE</button>`,l=>{zt("#pmC",l).onclick=()=>this.closeModal(),zt("#pmUp",l).onclick=()=>{var c,h;n.cards-=o,n.lvl++,rt.play("level"),Ae(),this.petModal(i),this.renderPets(),(h=(c=this.hooks).gearChanged)==null||h.call(c)},zt("#pmEq",l).onclick=()=>{var c,h;if(a>=0)t.petSlots[a]=null;else{let u=t.petSlots.indexOf(null);u<0&&(u=0),t.petSlots[u]=i}rt.play("buy"),Ae(),this.closeModal(),this.renderPets(),(h=(c=this.hooks).gearChanged)==null||h.call(c)}})},cheapestTalent(){const i=Rt.state,t=i.talentTier;if(t>=ms.length)return null;let e=null;for(const n of Wi){const s=i.talents[`${t}:${n.id}`]||0;if(s<Fi){const r=$o(t,s);(e===null||r<e)&&(e=r)}}return e},renderTalents(){const i=Rt.state,t=zt("#scr-talents"),e=Math.min(ms.length-1,i.talentTier+1);let n="";for(let o=e;o>=0;o--){const a=o>i.talentTier;n+=`<div class="talent-tier" data-tier="${o}">
        <div class="talent-hex">${Vt(a?"lock":"star")}</div>
        <div class="tier-name stroke">${ms[o]}</div>
        <div class="talent-row">${Wi.map(l=>{const c=i.talents[`${o}:${l.id}`]||0,h={atk:"fist",hp:"heart",xp:"star",gold:"coin"}[l.id];return`<button class="talent-node ${a?"locked":c>=Fi?"max":""}" data-t="${o}" data-n="${l.id}">
            ${Vt(h)}<span class="stroke">${l.desc.replace("{v}",l.per)}</span>
            <span class="tl stroke">${c>=Fi?"MAX":a?`0/${Fi}`:`${Vt("coin")} ${xe($o(o,c))}`}</span>
          </button>`}).join("")}</div>
        <div class="muted">${a?"Max all talents below to unlock":`${Wi.reduce((l,c)=>l+(i.talents[`${o}:${c.id}`]||0),0)}/${Wi.length*Fi} learned`}</div>
      </div>${o>0?`<div class="talent-path ${o>i.talentTier?"dim":""}" style="margin:0 auto"></div>`:""}`}const s=Zi();t.innerHTML=`<div class="screen-inner">
      <div class="panel stat-strip stroke"><div>${Vt("sword")} Global Power ${xe(s.power)}</div></div>
      <div class="panel">${n}</div></div>`,t.querySelectorAll(".talent-node").forEach(o=>o.onclick=()=>{var u,d;const a=+o.dataset.t,l=o.dataset.n;if(a>i.talentTier){this.toast("Locked"),rt.play("error",.2);return}const c=`${a}:${l}`,h=i.talents[c]||0;h>=Fi||this.spend("coins",$o(a,h))&&(i.talents[c]=h+1,rt.play("buy"),y_(a)&&i.talentTier===a&&a<ms.length-1&&(i.talentTier++,rt.play("level"),this.toast(`${ms[i.talentTier]} unlocked!`)),Ae(),this.renderTalents(),(d=(u=this.hooks).gearChanged)==null||d.call(u))});const r=t.querySelector(`[data-tier="${i.talentTier}"]`);r==null||r.scrollIntoView({block:"center"})},ringCost(){const i=Rt.state.ring;return i.tier>=Xi.length-1&&i.star>=10?1/0:i.star>=10?Fc(i.tier+1,0)*3:Fc(i.tier,i.star)},renderRing(){const i=Rt.state,t=zt("#scr-ring"),e=i.ring,n=Xi[e.tier],s=e.tier>=Xi.length-1&&e.star>=10,r=e.star>=10&&!s,o=Fr(e.tier,e.star),a=r?Fr(e.tier+1,0):Fr(e.tier,Math.min(10,e.star+1)),l=this.ringCost(),c=(h,u,d,f)=>`${Vt(h)}<span>${u}</span><b>+${d}</b><span class="arrow">➜</span><b style="color:var(--green)">+${f}</b>`;t.innerHTML=`<div class="screen-inner split">
      <div class="panel">
        <div class="ring-view" id="ringView"></div>
        <div class="ring-title stroke" style="margin-top:8px">${n.name}</div>
        <div class="ring-sub stroke">Tier-${e.tier+1}</div>
      </div>
      <div class="panel" style="display:flex;flex-direction:column;gap:10px">
        <h3 class="stroke" style="margin:0 auto">Basic Stats</h3>
        <div class="stat-table stroke">
          ${c("heart","Max HP",o.hp,a.hp)}
          ${c("fist","Damage",Math.round(o.atk*.2),Math.round(a.atk*.2))}
          ${c("shield","Defence",o.def,a.def)}
        </div>
        <h3 class="stroke" style="margin:0 auto">Ring Traits</h3>
        ${Fh.map(h=>{const u=e.tier>h.tier||e.tier===h.tier&&e.star>=5;return`<div class="trait ${u?"":"locked"}"><span class="b"></span>${u?"":`T${h.tier+1}★5 `}${h.desc}</div>`}).join("")}
        <div class="stars">${Array.from({length:10},(h,u)=>`<span class="${u<e.star?"":"off"}">${Vt("star")}</span>`).join("")}</div>
        <button class="btn green" id="ringUp" ${s?"disabled":""}>${s?"MAXED":r?"TIER UP":"LEVEL UP"} ${s?"":`${Vt("coin")} ${xe(l)}`}</button>
      </div></div>`,this.preview.mount(zt("#ringView",t),"ring"),zt("#ringUp",t).onclick=()=>{var h,u;this.spend("coins",l)&&(r?(e.tier++,e.star=0,this.toast(`${Xi[e.tier].name} unlocked!`),rt.play("win")):(e.star++,rt.play("buy")),Ae(),this.renderRing(),(u=(h=this.hooks).gearChanged)==null||u.call(h))}}},jt=i=>document.querySelector(i),Vh=5*60*1e3;let Bi,ne,nn,Gs,Ws="battle",yn="battle",Ml=!1,Or=!1,Ja=!1,ea=0,Xc=performance.now();function ys(i){jt("#loadFill").style.transform=`scaleX(${i})`}async function ox(){ys(.1),await en.init(),en.loadingStart(),ys(.3),Rt.load(),rt.setMuted(Rt.state.muted),rt.setMusicMuted(!!Rt.state.musicMuted),rt.setSdkMuted(en.muteAudio),en.onSettings(i=>{"muteAudio"in i&&rt.setSdkMuted(i.muteAudio)}),Bi=new Eh({canvas:jt("#view"),antialias:!0,powerPreference:"high-performance"}),Bi.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),Bi.outputColorSpace=tn,ys(.5),ne=new k_(Bi,{onHud:()=>qh(),onLevelUp:i=>hx(i),onEnd:i=>dx(i),onBoss:i=>jt("#bossBar").classList.toggle("hidden",!i)}),nn=new z_(Bi,{onHud:i=>{jt("#evTotal").textContent=xe(i.total)},onEnd:i=>px(i)}),Gs=new H_,ys(.75),Lt.init(Gs,{adStart:()=>ks(!0),adEnd:()=>ks(!1),gearChanged:()=>{ne.applyLooks(),Lt.renderCurrencies()}}),en.hasAdblock().then(i=>Lt.setAdblock(i)),lx(),gx(),mx(),na(),window.addEventListener("resize",na),window.addEventListener("orientationchange",()=>setTimeout(na,200)),document.addEventListener("visibilitychange",()=>{Or=document.hidden,rt.setPaused(Or),Or&&Rt.save()}),window.addEventListener("pagehide",()=>Rt.save()),window.addEventListener("keydown",i=>{["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(i.key)&&i.preventDefault()},{passive:!1}),document.addEventListener("contextmenu",i=>i.preventDefault()),window.addEventListener("wheel",i=>{i.target.closest(".screen, #modalCard")||i.preventDefault()},{passive:!1}),Wh(),ys(1),en.loadingStop(),setTimeout(()=>{jt("#loading").style.opacity=0,setTimeout(()=>jt("#loading").remove(),400),_x()},250),requestAnimationFrame(Gh)}function Gh(i){requestAnimationFrame(Gh);const t=Math.min(.1,(i-Xc)/1e3);if(Xc=i,Or)return;ax();const e=Ml;yn==="event"?(e||nn.update(t),nn.render()):(ne.paused=e||Ws!=="battle"||ne.pendingLevels>0||Lt.modalOpen&&!Jr,ne.pendingLevels>0&&(ne.paused=!0),ne.update(t),Ws==="battle"&&ne.render()),Gs.update(t),fx()}function ks(i){Ml=i,rt.setPaused(i),jt("#adShield").classList.toggle("hidden",!i)}function ax(){!Ml&&(yn==="event"?nn.running&&!nn.done:Ws==="battle"&&ne.running&&!ne.over&&(!Lt.modalOpen||Jr))?en.gameplayStart():en.gameplayStop()}function na(){const i=window.innerWidth,t=window.innerHeight;Bi.setSize(i,t,!1),ne.resize(i,t),nn.resize(i,t),Gs.resize()}function lx(){for(const i of document.querySelectorAll("#nav button"))i.onclick=()=>{rt.unlock(),rt.play("click"),cx(i.dataset.tab)}}function cx(i){if(yn==="event"&&i!=="battle")return Lt.toast("Finish the event first!");Ws=i,document.querySelectorAll("#nav button").forEach(e=>e.classList.toggle("active",e.dataset.tab===i)),document.querySelectorAll(".screen").forEach(e=>e.classList.remove("active")),Gs.unmount();const t=i==="battle";document.body.classList.toggle("menu",!t),rt.setMusicMode(t?"battle":"menu"),jt("#hud").classList.toggle("hidden",!t||yn==="event"),jt("#floaters").classList.toggle("hidden",!t),t?ne.applyLooks():(jt(`#scr-${i}`).classList.add("active"),{pet:()=>Lt.renderPets(),talents:()=>Lt.renderTalents(),inventory:()=>Lt.renderInventory(),ring:()=>Lt.renderRing()}[i]()),Lt.renderCurrencies()}function Wh(){Ja=!1,ne.start(Rt.state.stage),jt("#bossBar").classList.add("hidden"),qh()}let Jr=!1;function hx(i){Jr=!0,Lt.modal(`<h2 class="stroke">LEVEL UP!</h2><p class="muted">Choose a skill</p>
    <div class="skill-list">${i.map(t=>`
      <button class="skill-card" data-id="${t.id}">
        ${Hh("skill_"+t.id)?`<span class="sic art">${ci("skill_"+t.id)}</span>`:`<span class="sic" style="background:${t.color}">${Vt(t.icon)}</span>`}
        <b class="stroke">${t.name}</b>
        <span class="d">${t.desc}</span>
        ${t.max<99?`<span class="pips">${Array.from({length:t.max},(e,n)=>`<i class="${n<t.cur+1?"on":""}"></i>`).join("")}</span>`:""}
      </button>`).join("")}</div>`,t=>{t.querySelectorAll(".skill-card").forEach(e=>e.onclick=()=>{rt.play("buy"),Jr=!1,Lt.closeModal(),ne.chooseSkill(e.dataset.id)})},{closable:!1})}function ux(i){Rt.state;const t=ne.stats,e=ne.stage,n=Math.round(40*Math.pow(1.22,e-1)*t.goldMult);return{coins:(i?n:Math.round(n*.25))+ne.runCoins,gems:i?4+Math.floor(e/2):0,shards:i?3+Math.floor(e/3):1,item:i&&(Math.random()<.75||e<=3)}}function dx(i){const t=ux(i),e=Rt.state;if(i){en.happytime(),e.stats.stages++;const n=t.item?Lt.rollItem(ne.stage):null,s=n?`<div class="reward r${n.rarity}">${Vt(n.slot)}<span class="stroke">${$e[n.rarity].name}</span></div>`:"",r=o=>{e.coins+=t.coins*o,e.gems+=t.gems*o,e.shards+=t.shards*o,e.stage++,e.bestStage=Math.max(e.bestStage,e.stage),e.stage>=4&&(e.speedUnlocked=!0),Rt.save(),Lt.renderCurrencies("coin"),Lt.closeModal(),qc()};Lt.modal(`<h2 class="stroke" style="color:#ffe066">STAGE ${ne.stage} CLEARED!</h2>
      <div class="reward-row">
        <div class="reward">${Vt("coin")}<span class="stroke">${xe(t.coins)}</span></div>
        <div class="reward">${Vt("gem")}<span class="stroke">${t.gems}</span></div>
        <div class="reward">${Vt("shard")}<span class="stroke">${t.shards}</span></div>
        ${s}
      </div>
      <div class="modal-btns">
        ${Lt.adReady("double")?Lt.adBtn("rwAd","CLAIM x2"):""}
        <button class="btn green" id="rwOk">CLAIM</button>
      </div>`,o=>{o.querySelector("#rwOk").onclick=()=>r(1);const a=o.querySelector("#rwAd");a&&(a.onclick=async()=>{const l=await Lt.rewardedAd("Rewards doubled!");l&&Lt.markAd("double"),r(l?2:1)})},{closable:!1})}else Lt.modal(`<h2 class="stroke" style="color:#ff6a6a">DEFEATED</h2>
      <p class="muted">Upgrade gear, talents, pets and the ring to get stronger!</p>
      <div class="reward-row">
        <div class="reward">${Vt("coin")}<span class="stroke">${xe(t.coins)}</span></div>
        <div class="reward">${Vt("shard")}<span class="stroke">${t.shards}</span></div>
      </div>
      <div class="modal-btns">
        ${Ja?"":Lt.adBtn("dfRevive","REVIVE")}
        <button class="btn green" id="dfRetry">RETRY</button>
      </div>`,n=>{n.querySelector("#dfRetry").onclick=()=>{e.coins+=t.coins,e.shards+=t.shards,Rt.save(),Lt.renderCurrencies("coin"),Lt.closeModal(),qc()};const s=n.querySelector("#dfRevive");s&&(s.onclick=async()=>{await Lt.rewardedAd("Revived!")&&(Ja=!0,Lt.closeModal(),ne.revive())})},{closable:!1})}async function qc(){ea++,ea>=2&&(ea=0,await en.midgame({onStart:()=>ks(!0),onEnd:()=>ks(!1)}),ks(!1)),Lt.renderMission(),Wh()}function Xh(){return Date.now()-Rt.state.lastEvent>=Vh}let jr="";function fx(){const i=jt("#btnEvent"),t=Xh();let e;if(t)e="EVENT!";else{const n=Math.ceil((Vh-(Date.now()-Rt.state.lastEvent))/1e3);e=`${Math.floor(n/60)}:${String(n%60).padStart(2,"0")}`}e!==jr&&(jr=e,i.classList.toggle("cooldown",!t),i.innerHTML=`${Vt("car")}<small class="stroke">${e}</small>`)}function $c(){yn="event",rt.play("whoosh"),jt("#hud").classList.add("hidden"),jt("#floaters").classList.add("hidden"),jt("#eventHud").classList.remove("hidden");const i=Mn(Rt.state.equipped.gloves),t=ne.player.gear,e=nn.player.gear;for(const s of["helmet","belt","armor","band"])e[s].visible=t[s].visible,e[s].material.color.copy(t[s].material.color);for(const s of["shoes","pants"])t[s].forEach((r,o)=>{e[s][o].visible=r.visible,e[s][o].material.color.copy(r.material.color)});nn.start(i&&i.rarity>0?$e[i.rarity].color:"#e23b3b"),jt("#evTotal").textContent="0";const n=setInterval(()=>{if(yn!=="event"){clearInterval(n);return}jt("#evTimer").textContent=Math.ceil(nn.time)},100)}function px(i){Rt.state.lastEvent=Date.now(),rt.play("win"),Lt.modal(`<h2 class="stroke" style="color:#ffe066">CAR SMASHED!</h2>
    <p class="stroke">Total damage: ${xe(nn.total)}</p>
    <div class="reward-row"><div class="reward">${Vt("coin")}<span class="stroke">${xe(i)}</span></div></div>
    <div class="modal-btns">${Lt.adBtn("evAd","CLAIM x3")}<button class="btn green" id="evOk">CLAIM</button></div>`,t=>{const e=n=>{Rt.state.coins+=i*n,Rt.save(),Lt.closeModal(),Lt.renderCurrencies("coin"),yn="battle",nn.running=!1,jt("#eventHud").classList.add("hidden"),jt("#eventDmg").style.opacity=0,jt("#hud").classList.remove("hidden"),jt("#floaters").classList.remove("hidden")};t.querySelector("#evOk").onclick=()=>e(1),t.querySelector("#evAd").onclick=async()=>e(await Lt.rewardedAd("Coins tripled!")?3:1)},{closable:!1})}function qh(){if(!ne.stats)return;const i=ne;jt("#stageFill").style.transform=`scaleX(${Math.min(1,i.kills/i.killsNeeded)})`,jt("#stageLabel").innerHTML=`<span class="stroke">Stage-${i.stage}</span>`,jt("#hpFill").style.transform=`scaleX(${i.hp/i.maxHp})`,jt("#hpText").innerHTML=`<span class="stroke">${xe(i.hp)} / ${xe(i.maxHp)}</span>`,jt("#lvlBadge").innerHTML=`<span class="stroke">${i.level}</span>`,jt("#xpFill").style.transform=`scaleX(${Math.min(1,i.xp/i.xpNext)})`,i.boss&&(jt("#bossFill").style.transform=`scaleX(${Math.max(0,i.boss.hp/i.boss.maxHp)})`),Lt.renderMission()}function ia(){const i=Rt.state,t=jt("#btnSpeed"),e=ne.timeScale>1;t.classList.toggle("on",e),t.innerHTML=i.speedUnlocked?`${Vt("speed")}<span class="stroke">SPEED x${e?2:1}</span>`:`${Vt("lock")}<span class="stroke">UNLOCK<br>SPEED UP</span>`}function mx(){ia(),jt("#btnSpeed").onclick=async()=>{rt.unlock();const i=Rt.state;if(i.speedUnlocked){ne.timeScale=ne.timeScale>1?1:2,ia();return}ne.over||Lt.modal(`<h2 class="stroke">SPEED UP</h2>
      <p class="muted">Fight at 2x speed. Unlocks for free when you reach Stage 4, or watch a video to unlock it now.</p>
      <div class="modal-btns">${Lt.adBtn("spAd","UNLOCK NOW")}<button class="btn green" id="spNo">LATER</button></div>`,t=>{t.querySelector("#spNo").onclick=()=>Lt.closeModal(),t.querySelector("#spAd").onclick=async()=>{await Lt.rewardedAd("2x speed unlocked!")&&(i.speedUnlocked=!0,ne.timeScale=2,Ae()),Lt.closeModal(),ia()}})},jt("#btnEvent").onclick=async()=>{if(rt.unlock(),!(yn==="event"||ne.over)){if(Xh())return $c();Lt.modal(`<h2 class="stroke">CAR SMASH</h2><p class="muted">Punch a car for 20 seconds and earn coins for every hit!</p>
      <p class="stroke">Next free event in <span id="evLeft">${jr}</span></p>
      <div class="modal-btns">${Lt.adBtn("evNow","PLAY NOW")}<button class="btn green" id="evNo">LATER</button></div>`,i=>{const t=setInterval(()=>{const e=i.querySelector("#evLeft");if(!e||!Lt.modalOpen)return clearInterval(t);e.textContent=jr},500);i.querySelector("#evNo").onclick=()=>Lt.closeModal(),i.querySelector("#evNow").onclick=async()=>{const e=await Lt.rewardedAd("Event unlocked!");Lt.closeModal(),e&&$c()}})}}}function gx(){const i=jt("#view"),t=jt("#joyBase"),e=jt("#joyKnob");let n=null,s={x:0,y:0};const r=new Set,o=50,a=()=>{jt("#hint").style.opacity=0};i.addEventListener("pointerdown",h=>{if(rt.unlock(),yn==="event"){nn.tap();return}if(Ws!=="battle"||n!==null)return;n=h.pointerId,s={x:h.clientX,y:h.clientY};const u=jt("#hud").getBoundingClientRect();t.style.left=`${h.clientX-u.left}px`,t.style.top=`${h.clientY-u.top}px`,e.style.transform="translate(-50%,-50%)",t.classList.remove("hidden"),i.setPointerCapture(h.pointerId),a()}),i.addEventListener("pointermove",h=>{if(h.pointerId!==n)return;let u=h.clientX-s.x,d=h.clientY-s.y;const f=Math.hypot(u,d);f>o&&(u=u/f*o,d=d/f*o),e.style.transform=`translate(calc(-50% + ${u}px), calc(-50% + ${d}px))`;const g=f<8?0:1;ne.setInput(u/o*g,-d/o*g)});const l=h=>{h.pointerId===n&&(n=null,t.classList.add("hidden"),ne.setInput(0,0))};i.addEventListener("pointerup",l),i.addEventListener("pointercancel",l);const c=()=>{let h=0,u=0;(r.has("a")||r.has("arrowleft"))&&(h-=1),(r.has("d")||r.has("arrowright"))&&(h+=1),(r.has("w")||r.has("arrowup"))&&(u+=1),(r.has("s")||r.has("arrowdown"))&&(u-=1);const d=Math.hypot(h,u)||1;ne.setInput(h/d,u/d)};window.addEventListener("keydown",h=>{if(rt.unlock(),yn==="event"&&(h.key===" "||h.key==="Enter")){nn.tap();return}const u=h.key.toLowerCase();["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(u)&&(r.add(u),c(),a())}),window.addEventListener("keyup",h=>{r.delete(h.key.toLowerCase()),c()}),window.addEventListener("blur",()=>{r.clear(),c()})}function _x(){const i=Rt.state,t=(Date.now()-(i.lastSeen||Date.now()))/1e3;if(t<120||!i.tutorialDone){i.tutorialDone=!0,Rt.save();return}const e=Math.min(8,t/3600),n=Math.round(e*120*Math.pow(1.2,i.bestStage-1)*Zi().goldMult)+10;Lt.modal(`<h2 class="stroke">WELCOME BACK!</h2><p class="muted">Your brawler trained while you were away.</p>
    <div class="reward-row"><div class="reward">${Vt("coin")}<span class="stroke">${xe(n)}</span></div></div>
    <div class="modal-btns">${Lt.adBtn("ofAd","CLAIM x2")}<button class="btn green" id="ofOk">CLAIM</button></div>`,s=>{const r=o=>{i.coins+=n*o,Rt.save(),Lt.renderCurrencies("coin"),Lt.closeModal()};s.querySelector("#ofOk").onclick=()=>r(1),s.querySelector("#ofAd").onclick=async()=>r(await Lt.rewardedAd("Coins doubled!")?2:1)},{closable:!1})}ox();
