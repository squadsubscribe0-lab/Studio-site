import{$ as e,A as t,B as n,C as r,Ct as i,D as a,E as o,F as s,G as c,H as l,I as u,K as d,L as f,M as p,N as m,O as h,P as g,R as _,St as v,T as y,U as ee,V as b,W as x,Z as S,_ as te,_t as C,at as w,b as ne,bt as T,c as re,d as ie,dt as ae,ft as E,g as oe,gt as se,ht as ce,i as le,j as ue,k as D,m as de,mt as O,ot as k,p as fe,pt as A,r as pe,s as me,st as j,t as he,tt as M,u as ge,v as _e,w as ve,x as ye,xt as N,y as P,z as be}from"./glyphs-OWvr9Yii.js";var F={type:`change`},I={type:`start`},L={type:`end`},R=new ce,z=new E,xe=Math.cos(70*k.DEG2RAD),B=new i,V=2*Math.PI,H={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},U=1e-6,Se=class extends e{constructor(e,t=null){super(e,t),this.state=H.NONE,this.target=new i,this.cursor=new i,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`},this.mouseButtons={LEFT:w.ROTATE,MIDDLE:w.DOLLY,RIGHT:w.PAN},this.touches={ONE:N.ROTATE,TWO:N.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle=`auto`,this._domElementKeyEvents=null,this._lastPosition=new i,this._lastQuaternion=new O,this._lastTargetPosition=new i,this._quat=new O().setFromUnitVectors(e.up,new i(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new T,this._sphericalDelta=new T,this._scale=1,this._panOffset=new i,this._rotateStart=new v,this._rotateEnd=new v,this._rotateDelta=new v,this._panStart=new v,this._panEnd=new v,this._panDelta=new v,this._dollyStart=new v,this._dollyEnd=new v,this._dollyDelta=new v,this._dollyDirection=new i,this._mouse=new v,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=we.bind(this),this._onPointerDown=Ce.bind(this),this._onPointerUp=Te.bind(this),this._onContextMenu=Me.bind(this),this._onMouseWheel=Oe.bind(this),this._onKeyDown=ke.bind(this),this._onTouchStart=Ae.bind(this),this._onTouchMove=je.bind(this),this._onMouseDown=Ee.bind(this),this._onMouseMove=De.bind(this),this._interceptControlDown=Ne.bind(this),this._interceptControlUp=Pe.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e===`grab`?this.domElement.style.cursor=`grab`:this.domElement.style.cursor=`auto`}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener(`pointerdown`,this._onPointerDown),this.domElement.addEventListener(`pointercancel`,this._onPointerUp),this.domElement.addEventListener(`contextmenu`,this._onContextMenu),this.domElement.addEventListener(`wheel`,this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener(`keydown`,this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction=`none`}disconnect(){this.domElement.removeEventListener(`pointerdown`,this._onPointerDown),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.domElement.removeEventListener(`pointercancel`,this._onPointerUp),this.domElement.removeEventListener(`wheel`,this._onMouseWheel),this.domElement.removeEventListener(`contextmenu`,this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener(`keydown`,this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=``}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(F),this.update(),this.state=H.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;B.copy(t).sub(this.target),B.applyQuaternion(this._quat),this._spherical.setFromVector3(B),this.autoRotate&&this.state===H.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=V:n>Math.PI&&(n-=V),r<-Math.PI?r+=V:r>Math.PI&&(r-=V),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let a=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let e=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),a=e!=this._spherical.radius}if(B.setFromSpherical(this._spherical),B.applyQuaternion(this._quatInverse),t.copy(this.target).add(B),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let e=null;if(this.object.isPerspectiveCamera){let t=B.length();e=this._clampDistance(t*this._scale);let n=t-e;this.object.position.addScaledVector(this._dollyDirection,n),this.object.updateMatrixWorld(),a=!!n}else if(this.object.isOrthographicCamera){let t=new i(this._mouse.x,this._mouse.y,0);t.unproject(this.object);let n=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),a=n!==this.object.zoom;let r=new i(this._mouse.x,this._mouse.y,0);r.unproject(this.object),this.object.position.sub(r).add(t),this.object.updateMatrixWorld(),e=B.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),this.zoomToCursor=!1;e!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position):(R.origin.copy(this.object.position),R.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(R.direction))<xe?this.object.lookAt(this.target):(z.setFromNormalAndCoplanarPoint(this.object.up,this.target),R.intersectPlane(z,this.target))))}else if(this.object.isOrthographicCamera){let e=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),e!==this.object.zoom&&(this.object.updateProjectionMatrix(),a=!0)}return this._scale=1,this._performCursorZoom=!1,a||this._lastPosition.distanceToSquared(this.object.position)>U||8*(1-this._lastQuaternion.dot(this.object.quaternion))>U||this._lastTargetPosition.distanceToSquared(this.target)>U?(this.dispatchEvent(F),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e===null?V/60/60*this.autoRotateSpeed:V/60*this.autoRotateSpeed*e}_getZoomScale(e){let t=Math.abs(e*.01);return .95**(this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){B.setFromMatrixColumn(t,0),B.multiplyScalar(-e),this._panOffset.add(B)}_panUp(e,t){this.screenSpacePanning===!0?B.setFromMatrixColumn(t,1):(B.setFromMatrixColumn(t,0),B.crossVectors(this.object.up,B)),B.multiplyScalar(e),this._panOffset.add(B)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;B.copy(r).sub(this.target);let i=B.length();i*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*i/n.clientHeight,this.object.matrix),this._panUp(2*t*i/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,i=t-n.top,a=n.width,o=n.height;this._mouse.x=r/a*2-1,this._mouse.y=-(i/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(V*this._rotateDelta.x/t.clientHeight),this._rotateUp(V*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(V*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-V*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(V*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-V*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyStart.set(0,i)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(V*this._rotateDelta.x/t.clientHeight),this._rotateUp(V*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,i),this._dollyDelta.set(0,(this._dollyEnd.y/this._dollyStart.y)**+this.zoomSpeed),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new v,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Ce(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.ownerDocument.addEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.addEventListener(`pointerup`,this._onPointerUp)),!this._isTrackingPointer(e)&&(this._addPointer(e),e.pointerType===`touch`?this._onTouchStart(e):this._onMouseDown(e),this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grabbing`)))}function we(e){this.enabled!==!1&&(e.pointerType===`touch`?this._onTouchMove(e):this._onMouseMove(e))}function Te(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.dispatchEvent(L),this.state=H.NONE,this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grab`);break;case 1:let t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y});break}}function Ee(e){let t;switch(e.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case w.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(e),this.state=H.DOLLY;break;case w.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=H.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=H.ROTATE}break;case w.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=H.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=H.PAN}break;default:this.state=H.NONE}this.state!==H.NONE&&this.dispatchEvent(I)}function De(e){switch(this.state){case H.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case H.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case H.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e);break}}function Oe(e){this.enabled===!1||this.enableZoom===!1||this.state!==H.NONE||(e.preventDefault(),this.dispatchEvent(I),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent(L))}function ke(e){this.enabled!==!1&&this._handleKeyDown(e)}function Ae(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case N.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(e),this.state=H.TOUCH_ROTATE;break;case N.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(e),this.state=H.TOUCH_PAN;break;default:this.state=H.NONE}break;case 2:switch(this.touches.TWO){case N.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=H.TOUCH_DOLLY_PAN;break;case N.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=H.TOUCH_DOLLY_ROTATE;break;default:this.state=H.NONE}break;default:this.state=H.NONE}this.state!==H.NONE&&this.dispatchEvent(I)}function je(e){switch(this._trackPointer(e),this.state){case H.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case H.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case H.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case H.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=H.NONE}}function Me(e){this.enabled!==!1&&e.preventDefault()}function Ne(e){e.key===`Control`&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function Pe(e){e.key===`Control`&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}var W=new i,G=new i,Fe=class{constructor(e){this.camera=new ae(x.camera.fov,window.innerWidth/window.innerHeight,.1,400),this.camera.position.set(-6.5,6,9.5),this.camera.layers.enable(D.VFX),this.controls=new Se(this.camera,e),this.controls.enableDamping=!0,this.controls.dampingFactor=.075,this.controls.enablePan=!1,this.controls.enableZoom=!1,this.controls.minPolarAngle=x.camera.minPolar,this.controls.maxPolarAngle=x.camera.maxPolar,this.controls.rotateSpeed=.65,this.controls.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:w.ROTATE},this.controls.touches={ONE:null,TWO:N.DOLLY_ROTATE},this.anchor=new i(0,0,0),this.focus=new i(0,0,0),this.focusWeight=0,this.shakeOffset=new i,this.shakeRoll=0,this.controls.target.set(0,x.camera.targetHeight,0),this.controls.update(),this.distance=x.camera.distance,this.domElement=e,this._onWheel=this._onWheel.bind(this),e.addEventListener(`wheel`,this._onWheel,{passive:!1})}_onWheel(e){e.preventDefault();let t=x.camera,n=e.deltaMode===1?16:e.deltaMode===2?100:1,r=e.deltaY*n/100;t.distance=_e(t.distance*Math.exp(r*.12*t.zoomSpeed),t.minDistance,t.maxDistance)}setAnchor(e,t,n){this.anchor.set(e,t,n)}lookAt(e,t=1){this.focus.copy(e),this.focusWeight=Math.max(this.focusWeight,t)}update(e){let t=x.camera;this.camera.fov!==t.fov&&(this.camera.fov=t.fov,this.camera.updateProjectionMatrix()),this.controls.minPolarAngle=t.minPolar,this.controls.maxPolarAngle=t.maxPolar;let n=k.clamp(this.focusWeight*t.autoFrame,0,.85);G.copy(this.anchor),G.y+=t.targetHeight,G.lerp(this.focus,n),this.controls.target.set(P(this.controls.target.x,G.x,t.damping,e),P(this.controls.target.y,G.y,t.damping,e),P(this.controls.target.z,G.z,t.damping,e)),this.focusWeight=P(this.focusWeight,0,.08,e),this.controls.update(),this.distance=P(this.distance,t.distance,t.zoomDamping,e),W.copy(this.camera.position).sub(this.controls.target);let r=W.length()||1;W.multiplyScalar(1/r),this.camera.position.copy(this.controls.target).addScaledVector(W,this.distance),this.shakeOffset.lengthSq()>0&&(this.camera.position.add(this.shakeOffset),this.camera.rotateZ(this.shakeRoll))}resize(e,t){this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}dispose(){this.domElement.removeEventListener(`wheel`,this._onWheel),this.controls.dispose()}},K=class{constructor(){this._listeners=new Map}on(e,t){return this._listeners.has(e)||this._listeners.set(e,new Set),this._listeners.get(e).add(t),()=>this.off(e,t)}off(e,t){this._listeners.get(e)?.delete(t)}emit(e,...t){let n=this._listeners.get(e);if(n)for(let e of n)e(...t)}clear(){this._listeners.clear()}},Ie=class extends K{constructor(e){super(),this.dom=e,this.pointer=new v,this.keys=new Set,this.enabled=!0,this.slotCodes=new Map,n.forEach((e,t)=>{let n=b[e]?.code;n&&this.slotCodes.set(n,t),t<9&&this.slotCodes.set(`Digit${t+1}`,t)}),this._bind()}_bind(){this.dom.addEventListener(`pointerdown`,this._onPointerDown),window.addEventListener(`pointermove`,this._onPointerMove),window.addEventListener(`keydown`,this._onKeyDown),window.addEventListener(`keyup`,this._onKeyUp),this.dom.addEventListener(`contextmenu`,this._onContextMenu)}_onContextMenu=e=>e.preventDefault();_updatePointer(e){this.pointer.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight)*2+1)}_onPointerDown=e=>{this.enabled&&e.target===this.dom&&(this._updatePointer(e),e.button===0?this.emit(`pointer:confirm`,this.pointer):e.button===2&&this.emit(`action`,`cancel`))};_onPointerMove=e=>{this._updatePointer(e),this.emit(`pointer:move`,this.pointer)};_onKeyDown=e=>{if(e.repeat)return;let t=e.target;if(t&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`||t.isContentEditable))return;this.keys.add(e.code);let n=this.slotCodes.get(e.code);if(n!==void 0){this.emit(`action`,`ability`,n);return}switch(e.code){case`Escape`:this.emit(`action`,`cancel`);break;case`KeyH`:this.emit(`action`,`toggleHelp`);break;case`KeyG`:this.emit(`action`,`toggleEditor`);break;case`KeyC`:this.emit(`action`,`clear`);break;case`KeyP`:this.emit(`action`,`togglePause`);break;default:break}};_onKeyUp=e=>{this.keys.delete(e.code)};dispose(){this.dom.removeEventListener(`pointerdown`,this._onPointerDown),window.removeEventListener(`pointermove`,this._onPointerMove),window.removeEventListener(`keydown`,this._onKeyDown),window.removeEventListener(`keyup`,this._onKeyUp),this.dom.removeEventListener(`contextmenu`,this._onContextMenu),this.clear()}},Le=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Re=`
  uniform float uTime;
  uniform float uQuadLength;   // length the quad covers, metres
  uniform float uQuadWidth;    // width the quad covers, metres
  uniform float uQuadBack;     // how far behind the caster the quad starts
  uniform float uLength;       // the cast distance itself, metres
  uniform float uStart;        // gap between the caster and the tail
  uniform float uShaftWidth;
  uniform float uHeadLength;
  uniform float uHeadWidth;
  uniform float uRound;
  uniform float uEdge;
  uniform float uEdgeGlow;
  uniform float uSoftness;
  uniform float uFill;
  uniform float uFillFalloff;
  uniform float uStripes;
  uniform float uStripeSharp;
  uniform float uStripeDepth;
  uniform float uScrollSpeed;
  uniform float uPulse;
  uniform float uPulseSpeed;
  uniform float uNoise;
  uniform float uNoiseScale;
  uniform float uNoiseSpeed;
  uniform float uCrystals;
  uniform float uCrystalScale;
  uniform float uBaseRing;
  uniform float uBaseRingWidth;
  uniform float uTipGlyph;
  uniform float uTipGlyphSize;
  uniform float uTipSpin;
  uniform float uRangeArc;
  uniform float uReveal;       // 0..1 sweep-out when the cast is armed
  uniform float uInvalid;      // 1 when the target is inside the minimum range
  uniform float uOpacity;
  uniform vec3  uColorCore;
  uniform vec3  uColorEdge;
  uniform vec3  uColorInvalid;
  uniform float uGlobalGlow;

  varying vec2 vUv;

  ${t}
  ${r}

  #define TAU 6.28318530718

  float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  /* iq's exact triangle SDF — needed because the head is a wide, shallow wedge
     where a cheap half-plane intersection leaves visible corner artefacts. */
  float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
    vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
    vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;

    vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
    vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
    vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);

    float s = sign(e0.x * e2.y - e0.y * e2.x);
    vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                     vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                     vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
    return -sqrt(d.x) * sign(d.y);
  }

  void main() {
    /* ---- uv → metres, measured from the caster ---- */
    vec2 p = vec2((vUv.x - 0.5) * uQuadWidth,
                  (1.0 - vUv.y) * uQuadLength - uQuadBack);

    float length_ = max(uLength, uStart + 0.05);
    float headLen = min(uHeadLength, length_ - uStart);
    float headBase = length_ - headLen;

    /* ---- silhouette ---- */
    float shaft = sdBox(p - vec2(0.0, (uStart + headBase) * 0.5),
                        vec2(uShaftWidth, max(0.001, (headBase - uStart) * 0.5)));
    float head = sdTriangle(p,
                            vec2(-uHeadWidth, headBase),
                            vec2( uHeadWidth, headBase),
                            vec2( 0.0,        length_));
    float d = min(shaft, head) - uRound;

    float aa = fwidth(d) + uSoftness;
    float body = 1.0 - smoothstep(-aa, aa, d);
    float outline = 1.0 - smoothstep(uEdge, uEdge + aa, abs(d));

    /* ---- interior wash ---- */
    // Brighter toward the rim: a flat fill reads as a decal, a rim-weighted one
    // reads as a volume of light lying on the floor.
    float depth = clamp(-d / max(uShaftWidth, 0.05), 0.0, 1.0);
    float interior = pow(1.0 - depth, uFillFalloff);

    // Chevrons running toward the tip. Skewing the phase by |x| turns the flat
    // bands into arrowheads that all point the same way the cast does.
    float phase = (p.y - abs(p.x) * 0.55 - uTime * uScrollSpeed) * uStripes;
    float band = 0.5 + 0.5 * cos(phase * TAU);
    band = pow(band, mix(1.0, 9.0, uStripeSharp));

    float frost = fbm3(vec3(p * uNoiseScale, uTime * uNoiseSpeed)) * 0.5 + 0.5;
    vec2 cell = voronoi2(p * uCrystalScale + 13.7);
    float plates = smoothstep(0.32, 0.0, cell.x);

    float wash = interior;
    wash *= mix(1.0, band, uStripeDepth);
    wash *= mix(1.0, frost, uNoise);
    wash += plates * uCrystals * 0.35 * interior;
    wash *= 1.0 + uPulse * sin(uTime * uPulseSpeed * TAU);

    /* ---- furniture ---- */
    float radius = length(p);
    float ring = smoothstep(uBaseRingWidth, 0.0, abs(radius - uBaseRing));

    // A cap arc at maximum reach, clipped to the width of the head so it reads
    // as a range marker instead of a full circle.
    float arc = smoothstep(0.05, 0.0, abs(radius - length_)) *
                smoothstep(uHeadWidth * 2.2, uHeadWidth * 1.1, abs(p.x)) * uRangeArc;

    // A six-fold frost rosette pinned to the impact point.
    vec2 q = p - vec2(0.0, length_);
    float qr = length(q);
    float qa = atan(q.y, q.x) + uTime * uTipSpin * TAU;
    float spokes = smoothstep(0.86, 1.0, abs(cos(qa * 3.0))) *
                   smoothstep(uTipGlyphSize, 0.0, qr);
    float glyphRing = smoothstep(0.045, 0.0, abs(qr - uTipGlyphSize * 0.5));
    float glyph = max(spokes, glyphRing) * uTipGlyph;

    /* ---- the sweep-out when the cast is armed ---- */
    float front = uReveal * (length_ + uTipGlyphSize);
    float sweep = smoothstep(front + 0.25, front - 0.15, p.y);
    float sweepEdge = smoothstep(0.35, 0.0, abs(p.y - front)) * step(uReveal, 0.999);

    /* ---- assemble ---- */
    float fill = body * wash * uFill;
    float lines = outline * uEdgeGlow + ring + arc + glyph;

    float alpha = clamp(fill + lines + sweepEdge * 0.6, 0.0, 1.0) * sweep * uOpacity;
    if (alpha < 0.004) discard;

    vec3 color = uColorEdge * fill + uColorCore * (lines + sweepEdge);
    color = mix(color, uColorInvalid * (fill + lines + sweepEdge), uInvalid);

    gl_FragColor = vec4(color * uGlobalGlow, alpha);
  }
`,ze=class{constructor(){this.geometry=new A(1,1,1,1).rotateX(-Math.PI/2).translate(0,0,.5),this.material=new C({transparent:!0,depthWrite:!1,depthTest:!0,blending:2,side:2,toneMapped:!1,uniforms:g({uQuadLength:{value:10},uQuadWidth:{value:6},uQuadBack:{value:1},uLength:{value:8},uStart:{value:.9},uShaftWidth:{value:.42},uHeadLength:{value:2.6},uHeadWidth:{value:1.35},uRound:{value:.12},uEdge:{value:.09},uEdgeGlow:{value:2.6},uSoftness:{value:.06},uFill:{value:.3},uFillFalloff:{value:1.1},uStripes:{value:.55},uStripeSharp:{value:.62},uStripeDepth:{value:.55},uScrollSpeed:{value:2.4},uPulse:{value:.28},uPulseSpeed:{value:2.2},uNoise:{value:.45},uNoiseScale:{value:1.6},uNoiseSpeed:{value:.35},uCrystals:{value:.55},uCrystalScale:{value:2.4},uBaseRing:{value:.62},uBaseRingWidth:{value:.06},uTipGlyph:{value:.9},uTipGlyphSize:{value:1.15},uTipSpin:{value:.45},uRangeArc:{value:.55},uReveal:{value:0},uInvalid:{value:0},uOpacity:{value:1},uColorCore:{value:new S(.92,.98,1)},uColorEdge:{value:new S(.24,.7,1)},uColorInvalid:{value:new S(1,.41,.36)}}),vertexShader:Le,fragmentShader:Re}),this.mesh=new j(this.geometry,this.material),this.mesh.name=`AimIndicator`,this.mesh.layers.set(D.VFX),this.mesh.renderOrder=5,this.mesh.frustumCulled=!1,this.mesh.visible=!1}get object3D(){return this.mesh}update(e,t,n,r,i){let a=x.aim,o=this.material.uniforms,s=Math.max(a.baseRing,.2)+.4,c=n+Math.max(a.tipGlyphSize,.3)+.5,l=Math.max(a.headWidth,a.shaftWidth,a.baseRing,a.tipGlyphSize)+a.edge+a.round+.5,u=s+c,d=l*2;o.uQuadLength.value=u,o.uQuadWidth.value=d,o.uQuadBack.value=s,o.uLength.value=n,o.uStart.value=a.startOffset,o.uShaftWidth.value=a.shaftWidth,o.uHeadLength.value=a.headLength,o.uHeadWidth.value=a.headWidth,o.uRound.value=a.round,o.uEdge.value=a.edge,o.uEdgeGlow.value=a.edgeGlow,o.uSoftness.value=a.softness,o.uFill.value=a.fill,o.uFillFalloff.value=a.fillFalloff,o.uStripes.value=a.stripes,o.uStripeSharp.value=a.stripeSharp,o.uStripeDepth.value=a.stripeDepth,o.uScrollSpeed.value=a.scrollSpeed,o.uPulse.value=a.pulse,o.uPulseSpeed.value=a.pulseSpeed,o.uNoise.value=a.noise,o.uNoiseScale.value=a.noiseScale,o.uNoiseSpeed.value=a.noiseSpeed,o.uCrystals.value=a.crystals,o.uCrystalScale.value=a.crystalScale,o.uBaseRing.value=a.baseRing,o.uBaseRingWidth.value=a.baseRingWidth,o.uTipGlyph.value=a.tipGlyph,o.uTipGlyphSize.value=a.tipGlyphSize,o.uTipSpin.value=a.tipSpin,o.uRangeArc.value=a.rangeArc,o.uReveal.value=r,o.uInvalid.value=+!i,o.uOpacity.value=a.opacity*x.global.opacity,o.uColorCore.value.copy(p(a.colorCore)),o.uColorEdge.value.copy(p(a.colorEdge)),o.uColorInvalid.value.copy(p(a.colorInvalid)),this.mesh.position.set(e.x-Math.sin(t)*s,a.height,e.z-Math.cos(t)*s),this.mesh.rotation.set(0,t,0),this.mesh.scale.set(d,1,u)}setVisible(e){this.mesh.visible=e}dispose(){this.geometry.dispose(),this.material.dispose()}},Be=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Ve=`
  uniform float uTime;
  uniform float uQuadSize;     // metres the quad covers, edge to edge
  uniform float uRadius;       // footprint radius, metres (already snapped)
  uniform float uBoundary;     // thickness of the band
  uniform float uBias;         // how much of that thickness sits outside uRadius
  uniform float uBoundaryGlow;
  uniform float uLiner;
  uniform float uSoftness;
  uniform float uFill;
  uniform float uFillFalloff;
  uniform float uRings;
  uniform float uRingWidth;
  uniform float uRingSpeed;
  uniform float uCrawl;
  uniform float uCrawlScale;
  uniform float uCrawlSpeed;
  uniform float uNoise;
  uniform float uNoiseScale;
  uniform float uTicks;
  uniform float uTickLength;
  uniform float uTickWidth;
  uniform float uTickSpin;
  uniform float uSweep;
  uniform float uSweepSpeed;
  uniform float uCore;
  uniform float uCoreSize;
  uniform float uCrosshair;
  uniform float uCrosshairLength;
  uniform float uPulse;
  uniform float uPulseSpeed;
  uniform float uReveal;       // 0..1 snap-out
  uniform float uInvalid;      // 1 when the target is inside the minimum range
  uniform float uOpacity;
  uniform vec3  uColorCore;
  uniform vec3  uColorEdge;
  uniform vec3  uColorInvalid;
  uniform float uGlobalGlow;

  varying vec2 vUv;

  ${t}
  ${r}

  #define TAU 6.28318530718

  void main() {
    /* ---- uv → metres, measured from the target; +y is downrange ---- */
    vec2 p = vec2(vUv.x - 0.5, 0.5 - vUv.y) * uQuadSize;
    float d = length(p);

    float outer = uRadius + uBoundary * uBias;
    float inner = max(0.01, uRadius - uBoundary * (1.0 - uBias));

    float aa = fwidth(d) + uSoftness;
    if (d > outer + aa * 3.0) discard;

    /* ---- the band that *is* the footprint ---- */
    float band = smoothstep(outer + aa, outer - aa, d) * smoothstep(inner - aa, inner + aa, d);
    // A hard liner on the inside lip: the band alone reads soft at a distance,
    // and the inside lip is the line the player is actually measuring against.
    float liner = 1.0 - smoothstep(uLiner, uLiner + aa, abs(d - inner));

    float interior = smoothstep(inner + aa, inner - aa, d);
    float radial = clamp(d / inner, 0.0, 1.0);

    /* ---- the wash inside it ---- */
    // Weighted to the rim: a flat disc reads as a decal lying on the floor, a
    // rim-weighted one reads as a volume standing inside the boundary.
    float wash = pow(radial, uFillFalloff);
    float n = fbm3(vec3(p * uNoiseScale, uTime * 0.2)) * 0.5 + 0.5;
    wash *= mix(1.0, n, uNoise);

    // Contour rings travelling outward — the read that says "this is a field
    // with a size", not a puddle.
    float ringPhase = radial * uRings - uTime * uRingSpeed;
    float ring = smoothstep(1.0 - uRingWidth, 1.0, 0.5 + 0.5 * cos(ringPhase * TAU));

    // Filaments crawling over the interior, sampled in the *plane* and domain
    // warped. Sampling on atan() would hand every radius along a bearing the
    // same value and draw dead-straight spokes — a firework, not a field.
    float warp = fbm3(vec3(p * 0.4, uTime * 0.15 + 3.1)) * 0.6;
    float fil = ridged(vec3(p * uCrawlScale + warp, uTime * uCrawlSpeed), 4);
    float veins = smoothstep(0.68, 0.95, fil);

    wash += ring * 0.4;
    wash += veins * uCrawl * (0.3 + 0.7 * radial);

    /* ---- furniture ---- */
    float ang = atan(p.y, p.x) / TAU + 0.5;

    // Ticks stepping around the boundary. Deliberate radial marks, so this is
    // the one place an angular function is the right tool.
    float tickPhase = fract(ang * uTicks + uTime * uTickSpin * uTicks);
    float tick = 1.0 - smoothstep(uTickWidth, uTickWidth + 0.06, tickPhase);
    tick *= smoothstep(inner - uTickLength, inner, d) * smoothstep(outer, inner, d);

    // A slow sweep, trailing rather than symmetric, so it reads as rotating.
    // The second term feathers the wrap point: without it the tail meets the
    // head at full brightness and the sweep reads as a hard wedge.
    float sweepPhase = fract(ang - uTime * uSweepSpeed);
    float sweep = pow(1.0 - sweepPhase, 6.0) * smoothstep(0.0, 0.05, sweepPhase) * uSweep * interior;

    float core = smoothstep(uCoreSize, 0.0, d) * uCore;
    float coreRing = (1.0 - smoothstep(0.02, 0.045, abs(d - uCoreSize * 0.8))) * uCore * 0.8;

    // Four arms out of the core, the downrange one longer: with the quad yawed
    // onto the aim, that arm is the heading.
    float armLength = uCrosshairLength * mix(1.0, 1.8, step(0.0, p.y) * step(abs(p.x), abs(p.y)));
    float arms = max(1.0 - smoothstep(0.02, 0.05, abs(p.x)), 1.0 - smoothstep(0.02, 0.05, abs(p.y)));
    arms *= smoothstep(armLength, armLength * 0.25, d) * smoothstep(uCoreSize * 0.5, uCoreSize, d);
    arms *= uCrosshair;

    /* ---- assemble ---- */
    float breathe = 1.0 + uPulse * sin(uTime * uPulseSpeed * TAU);
    float fill = interior * wash * uFill * breathe;
    float lines = (liner * 1.3 + tick + core + coreRing + arms + sweep) * breathe;
    float edge = band * uBoundaryGlow * breathe;

    float alpha = clamp(fill + lines + edge, 0.0, 1.0) * uOpacity * uReveal;
    if (alpha < 0.004) discard;

    // The band is drawn halfway between the two colours rather than in the core
    // white the rest of the furniture uses. At the glow it needs to read as the
    // thickest thing on screen it would otherwise clip flat, and the ability
    // loses the one cue that says which cast this circle belongs to.
    vec3 color = uColorEdge * fill + uColorCore * lines + mix(uColorEdge, uColorCore, 0.5) * edge;
    color = mix(color, uColorInvalid * (fill + lines + edge), uInvalid);

    gl_FragColor = vec4(color * uGlobalGlow, alpha);
  }
`,He=`
  #define TAU 6.283185307179586

  uniform float uTime;
  uniform vec3  uCentre;
  uniform float uRadius;
  uniform float uWidth;
  uniform float uSpin;

  varying float vAngle;
  varying float vSide;

  void main() {
    float t = position.x;
    float side = position.y;
    vAngle = t;
    vSide = side;

    float a = (t + uTime * uSpin) * TAU;
    vec3 dir = vec3(sin(a), 0.0, cos(a));
    vec3 world = uCentre + dir * (uRadius + side * uWidth);

    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`,Ue=`
  uniform float uTime;
  uniform float uDashes;
  uniform float uDashGap;
  uniform float uSpin;
  uniform float uLead;        // bearing of the cursor, as a 0..1 fraction
  uniform float uLeadStrength;
  uniform float uIntensity;
  uniform float uReveal;
  uniform float uInvalid;
  uniform float uOpacity;
  uniform vec3  uColorCore;
  uniform vec3  uColorEdge;
  uniform vec3  uColorInvalid;
  uniform float uGlobalGlow;

  varying float vAngle;
  varying float vSide;

  void main() {
    float profile = 1.0 - clamp(abs(vSide), 0.0, 1.0);
    profile = pow(profile, 1.6);

    // The dash pattern is welded to the strip's own parameter, and the vertex
    // shader is what rotates the strip — so the dashes creep with the ring
    // rather than sitting still in the world while it turns under them.
    float dash = 1.0;
    if (uDashes > 0.5) {
      float phase = fract(vAngle * uDashes);
      dash = 1.0 - smoothstep(1.0 - uDashGap, 1.0 - uDashGap + 0.12, phase);
    }

    // The lead marker is pinned to a *world* bearing, so it has to undo the
    // spin the vertex shader applied. Shortest way round, 0..0.5.
    float world = fract(vAngle + uTime * uSpin);
    float delta = abs(fract(world - uLead + 0.5) - 0.5);
    float lead = smoothstep(0.12, 0.0, delta) * uLeadStrength;

    float alpha = profile * (dash * uIntensity + lead) * uReveal * uOpacity;
    if (alpha < 0.004) discard;

    vec3 color = mix(uColorEdge, uColorCore, clamp(lead + profile * 0.4, 0.0, 1.0));
    color = mix(color, uColorInvalid, uInvalid);

    gl_FragColor = vec4(color * uGlobalGlow, clamp(alpha, 0.0, 1.0));
  }
`,We=class{constructor(){this.group=new M,this.group.name=`ZoneIndicator`,this.group.matrixAutoUpdate=!1,this.discGeometry=new A(1,1,1,1).rotateX(-Math.PI/2),this.discMaterial=new C({transparent:!0,depthWrite:!1,depthTest:!0,blending:2,side:2,toneMapped:!1,uniforms:g({uQuadSize:{value:12},uRadius:{value:4.4},uBoundary:{value:.34},uBias:{value:.35},uBoundaryGlow:{value:2.4},uLiner:{value:.05},uSoftness:{value:.05},uFill:{value:.18},uFillFalloff:{value:1.5},uRings:{value:2},uRingWidth:{value:.05},uRingSpeed:{value:.35},uCrawl:{value:.6},uCrawlScale:{value:1.3},uCrawlSpeed:{value:.45},uNoise:{value:.4},uNoiseScale:{value:1.2},uTicks:{value:24},uTickLength:{value:.42},uTickWidth:{value:.2},uTickSpin:{value:.06},uSweep:{value:.55},uSweepSpeed:{value:.4},uCore:{value:.85},uCoreSize:{value:.4},uCrosshair:{value:.5},uCrosshairLength:{value:1.1},uPulse:{value:.22},uPulseSpeed:{value:2},uReveal:{value:0},uInvalid:{value:0},uOpacity:{value:1},uColorCore:{value:new S(.92,.97,1)},uColorEdge:{value:new S(.49,.42,1)},uColorInvalid:{value:new S(1,.41,.36)}}),vertexShader:Be,fragmentShader:Ve}),this.disc=new j(this.discGeometry,this.discMaterial),this.disc.name=`ZoneFootprint`,this.disc.layers.set(D.VFX),this.disc.renderOrder=5,this.disc.frustumCulled=!1,this.reachGeometry=fe(x.zone.reachSegments+1,1),this.reachMaterial=new C({transparent:!0,depthWrite:!1,depthTest:!0,blending:2,side:2,toneMapped:!1,uniforms:g({uCentre:{value:new i},uRadius:{value:20},uWidth:{value:.05},uSpin:{value:.03},uDashes:{value:64},uDashGap:{value:.42},uLead:{value:0},uLeadStrength:{value:.9},uIntensity:{value:.7},uReveal:{value:0},uInvalid:{value:0},uOpacity:{value:1},uColorCore:{value:new S(.92,.97,1)},uColorEdge:{value:new S(.49,.42,1)},uColorInvalid:{value:new S(1,.41,.36)}}),vertexShader:He,fragmentShader:Ue}),this.reach=new j(this.reachGeometry,this.reachMaterial),this.reach.name=`ZoneReachRing`,this.reach.layers.set(D.VFX),this.reach.renderOrder=5,this.reach.frustumCulled=!1,this.group.add(this.disc,this.reach),this.group.visible=!1}get object3D(){return this.group}update(e,t,n,r,i,a,o){let s=x.zone,c=s.opacity*x.global.opacity,l=+!o,u=ne(a),d=Math.sin(Math.PI*u**1.7),f=r*te.outCubic(u)*(1+(s.snap-1)*d),m=(r*Math.max(1,s.snap)+s.boundary+.6)*2,h=this.discMaterial.uniforms;h.uQuadSize.value=m,h.uRadius.value=Math.max(.05,f),h.uBoundary.value=s.boundary,h.uBias.value=s.boundaryBias,h.uBoundaryGlow.value=s.boundaryGlow,h.uLiner.value=s.liner,h.uSoftness.value=s.softness,h.uFill.value=s.fill,h.uFillFalloff.value=s.fillFalloff,h.uRings.value=s.rings,h.uRingWidth.value=s.ringWidth,h.uRingSpeed.value=s.ringSpeed,h.uCrawl.value=s.crawl,h.uCrawlScale.value=s.crawlScale,h.uCrawlSpeed.value=s.crawlSpeed,h.uNoise.value=s.noise,h.uNoiseScale.value=s.noiseScale,h.uTicks.value=Math.max(0,Math.round(s.ticks)),h.uTickLength.value=s.tickLength,h.uTickWidth.value=s.tickWidth,h.uTickSpin.value=s.tickSpin,h.uSweep.value=s.sweep,h.uSweepSpeed.value=s.sweepSpeed,h.uCore.value=s.core,h.uCoreSize.value=s.coreSize,h.uCrosshair.value=s.crosshair,h.uCrosshairLength.value=s.crosshairLength,h.uPulse.value=s.pulse,h.uPulseSpeed.value=s.pulseSpeed,h.uReveal.value=u,h.uInvalid.value=l,h.uOpacity.value=c,h.uColorCore.value.copy(p(s.colorCore)),h.uColorEdge.value.copy(p(s.colorEdge)),h.uColorInvalid.value.copy(p(s.colorInvalid)),this.disc.position.set(e.x+Math.sin(t)*n,s.height,e.z+Math.cos(t)*n),this.disc.rotation.set(0,t,0),this.disc.scale.set(m,1,m);let g=this.reachMaterial.uniforms;g.uCentre.value.set(e.x,s.height,e.z),g.uRadius.value=Math.max(.2,i),g.uWidth.value=s.reachWidth,g.uSpin.value=s.reachSpin,g.uDashes.value=Math.max(0,Math.round(s.reachDashes)),g.uDashGap.value=s.reachDashGap,g.uLead.value=(t/(Math.PI*2)%1+1)%1,g.uLeadStrength.value=s.reachLead,g.uIntensity.value=s.reach,g.uReveal.value=u,g.uInvalid.value=l,g.uOpacity.value=c,g.uColorCore.value.copy(p(s.colorCore)),g.uColorEdge.value.copy(p(s.colorEdge)),g.uColorInvalid.value.copy(p(s.colorInvalid)),this.reach.visible=s.reach>.001}setVisible(e){this.group.visible=e}dispose(){this.discGeometry.dispose(),this.discMaterial.dispose(),this.reachGeometry.dispose(),this.reachMaterial.dispose()}},Ge=new E(new i(0,1,0),0),Ke=class extends K{constructor(e){super(),this.camera=e,this.raycaster=new se,this.raycaster.far=500,this.indicator=new ze,this.zone=new We,this.group=new M,this.group.name=`AimIndicators`,this.group.add(this.indicator.object3D,this.zone.object3D),this.element=n[0],this.armed=!1,this.reveal=0,this.origin=new i,this.direction=new i(0,0,1),this.distance=0,this.yaw=0,this.valid=!0,this._pointer=new v,this._hasPointer=!1,this._hit=new i,this._flat=new i}get object3D(){return this.group}get config(){return x[this.element]??x[n[0]]}get shape(){return ee(this.element)}get zoneRadius(){return Math.max(.05,this.config.zoneRadius??1)}setElement(e){x[e]&&(this.element=e)}get isArmed(){return this.armed}get facing(){return this.yaw}setOrigin(e){this.origin.set(e.x,0,e.z)}arm(){this.armed||(this.armed=!0,this.emit(`arm`))}cancel(){this.armed&&(this.armed=!1,this.emit(`cancel`))}toggle(){this.armed?this.cancel():this.arm()}point(e){this._pointer.copy(e),this._hasPointer=!0}confirm(){return this.armed?this.valid?(this.armed=!1,this.emit(`cast`,this.origin,this.direction,this.distance),!0):(this.emit(`reject`),!1):!1}_resolve(){let e=this.config;if(this._hasPointer&&(this.raycaster.setFromCamera(this._pointer,this.camera),this.raycaster.ray.intersectPlane(Ge,this._hit)&&(this._flat.copy(this._hit).sub(this.origin),this._flat.y=0,this._flat.lengthSq()>1e-6))){let t=this._flat.length();this.direction.copy(this._flat).multiplyScalar(1/t),this.yaw=Math.atan2(this.direction.x,this.direction.z),this.valid=t>=e.minRange,this.distance=k.clamp(t,Math.max(.2,e.minRange),Math.max(.4,e.range));return}this.valid=!1,this.distance=k.clamp(this.distance,Math.max(.2,e.minRange),Math.max(.4,e.range))}update(e){this._resolve();let t=this.shape===_.ZONE,n=Math.max(.01,t?x.zone.reveal:x.aim.reveal),r=+!!this.armed,i=e/n;this.reveal=k.clamp(this.reveal+k.clamp(r-this.reveal,-i,i),0,1);let a=this.reveal>.001;this.indicator.setVisible(a&&!t),this.zone.setVisible(a&&t),a&&(t?this.zone.update(this.origin,this.yaw,this.distance,this.zoneRadius,this.config.range,this.reveal,this.valid):this.indicator.update(this.origin,this.yaw,this.distance,this.reveal,this.valid))}dispose(){this.indicator.dispose(),this.zone.dispose(),this.clear()}},qe=class{constructor(e){this.root=e,this.onAbility=null,this._toastTimer=0,this._statsAccumulator=0,this._frames=0,this._fps=0,this._cooldownShown=new Map,this._armedShown=null,e.innerHTML=`
      <div class="hud__panel hud__title">
        Elemental Sandbox
        <span data-blurb>Press a slot key, aim, click to cast.</span>
      </div>

      <div class="hud__panel hud__stats">
        <div>FPS <b data-stat="fps">—</b></div>
        <div>Particles <b data-stat="particles">0</b></div>
        <div>Instances <b data-stat="spikes">0</b></div>
        <div>Draw calls <b data-stat="calls">0</b></div>
      </div>

      <div class="hud__panel hud__help">
        <div class="hud__keys">
          ${n.map(e=>{let t=b[e],n=t.cast===`zone`?`<i>◎</i>`:``;return`<div><strong>${t.key}</strong> ${t.label}${n}</div>`}).join(``)}
        </div>
        <div class="hud__help-note">◎ far cast — aimed with a circle, not an arrow.</div>
        <div><strong>Move</strong> — aim &nbsp; <strong>Left click</strong> — cast</div>
        <div><strong>Esc / right click</strong> — cancel the cast</div>
        <div><strong>Right drag</strong> — orbit &nbsp; <strong>Scroll</strong> — zoom</div>
        <div style="margin-top:6px">
          <kbd>G</kbd> editor &nbsp; <kbd>P</kbd> pause &nbsp; <kbd>C</kbd> clear &nbsp; <kbd>H</kbd> hide this
        </div>
        <div class="hud__help-note">Paused still applies every editor change.</div>
      </div>

      <div class="hud__abilities">
        ${n.map(e=>{let t=b[e];return`
            <div class="ability-card" data-element="${e}" style="--accent:${t.accent}">
              <div class="ability-card__sweep" data-sweep></div>
              <div class="ability-card__key">${t.key}</div>
              <div class="ability-card__glyph">${he[e]??``}</div>
              <div class="ability-card__label">${t.label}</div>
            </div>`}).join(``)}
      </div>

      <div class="hud__toast" data-toast></div>
      <div class="hud__paused" data-paused>Paused</div>
    `,this.cards=new Map;for(let t of e.querySelectorAll(`.ability-card`))this.cards.set(t.dataset.element,t),t.addEventListener(`pointerdown`,e=>{e.stopPropagation(),this.onAbility?.(t.dataset.element)});this.stats={fps:e.querySelector(`[data-stat="fps"]`),particles:e.querySelector(`[data-stat="particles"]`),spikes:e.querySelector(`[data-stat="spikes"]`),calls:e.querySelector(`[data-stat="calls"]`)},this.help=e.querySelector(`.hud__help`),this.toast=e.querySelector(`[data-toast]`),this.pausedBadge=e.querySelector(`[data-paused]`),this.abilityBar=e.querySelector(`.hud__abilities`)}setElement(e,t={}){for(let[t,n]of this.cards)n.classList.toggle(`is-active`,t===e);let n=b[e];n&&!t.silent&&this.showToast(`${n.hint} selected`)}setArmed(e){e!==this._armedShown&&(this._armedShown=e,this.abilityBar.classList.toggle(`is-armed`,e))}setCooldown(e,t,n){let r=this.cards.get(e);if(!r)return;let i=Math.max(0,Math.min(1,t/Math.max(n,.001)));Math.abs(i-(this._cooldownShown.get(e)??-1))<.01||(this._cooldownShown.set(e,i),r.style.setProperty(`--cooldown`,i),r.classList.toggle(`is-cooling`,i>.001))}setPaused(e){this.pausedBadge.classList.toggle(`is-visible`,e)}toggleHelp(){this.help.classList.toggle(`is-hidden`)}showToast(e,t=1600){this.toast.textContent=e,this.toast.classList.add(`is-visible`),clearTimeout(this._toastTimer),this._toastTimer=setTimeout(()=>this.toast.classList.remove(`is-visible`),t)}update(e,t){if(this._frames++,this._statsAccumulator+=e,this._statsAccumulator<.4)return;this._fps=Math.round(this._frames/this._statsAccumulator),this._frames=0,this._statsAccumulator=0;let n=t();this.stats.fps.textContent=this._fps,this.stats.particles.textContent=n.particles,this.stats.spikes.textContent=n.spikes,this.stats.calls.textContent=n.calls}},q=class{constructor(){this.element=document.getElementById(`loader`),this.fill=document.getElementById(`loader-fill`),this.status=document.getElementById(`loader-status`)}setProgress(e,t){this.fill.style.width=`${Math.round(Math.min(1,Math.max(0,e))*100)}%`,t&&(this.status.textContent=t)}hide(){this.setProgress(1),setTimeout(()=>this.element.classList.add(`is-hidden`),220)}fail(e){this.status.textContent=e,this.status.style.color=`#ff7a6a`}},J=class e{constructor(t,n,r,i,a=`div`){this.parent=t,this.object=n,this.property=r,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(a),this.domElement.classList.add(`lil-controller`),this.domElement.classList.add(i),this.$name=document.createElement(`div`),this.$name.classList.add(`lil-name`),e.nextNameID=e.nextNameID||0,this.$name.id=`lil-gui-name-${++e.nextNameID}`,this.$widget=document.createElement(`div`),this.$widget.classList.add(`lil-widget`),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener(`keydown`,e=>e.stopPropagation()),this.domElement.addEventListener(`keyup`,e=>e.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(r)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled?this:(this._disabled=e,this.domElement.classList.toggle(`lil-disabled`,e),this.$disable.toggleAttribute(`disabled`,e),this)}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}options(e){let t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);let e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}},Je=class extends J{constructor(e,t,n){super(e,t,n,`lil-boolean`,`label`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`checkbox`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener(`change`,()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}};function Y(e){let t,n;return(t=e.match(/(#|0x)?([a-f0-9]{6})/i))?n=t[2]:(t=e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?n=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(n=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),n?`#`+n:!1}var Ye={isPrimitive:!0,match:e=>typeof e==`string`,fromHexString:Y,toHexString:Y},X={isPrimitive:!0,match:e=>typeof e==`number`,fromHexString:e=>parseInt(e.substring(1),16),toHexString:e=>`#`+e.toString(16).padStart(6,0)},Xe=[Ye,X,{isPrimitive:!1,match:e=>Array.isArray(e)||ArrayBuffer.isView(e),fromHexString(e,t,n=1){let r=X.fromHexString(e);t[0]=(r>>16&255)/255*n,t[1]=(r>>8&255)/255*n,t[2]=(r&255)/255*n},toHexString([e,t,n],r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return X.toHexString(i)}},{isPrimitive:!1,match:e=>Object(e)===e,fromHexString(e,t,n=1){let r=X.fromHexString(e);t.r=(r>>16&255)/255*n,t.g=(r>>8&255)/255*n,t.b=(r&255)/255*n},toHexString({r:e,g:t,b:n},r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return X.toHexString(i)}}];function Ze(e){return Xe.find(t=>t.match(e))}var Qe=class extends J{constructor(e,t,n,r){super(e,t,n,`lil-color`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`color`),this.$input.setAttribute(`tabindex`,-1),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$text=document.createElement(`input`),this.$text.setAttribute(`type`,`text`),this.$text.setAttribute(`spellcheck`,`false`),this.$text.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`lil-display`),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=Ze(this.initialValue),this._rgbScale=r,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener(`input`,()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$text.addEventListener(`input`,()=>{let e=Y(this.$text.value);e&&this._setValueFromHexString(e)}),this.$text.addEventListener(`focus`,()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener(`blur`,()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){let t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}},Z=class extends J{constructor(e,t,n){super(e,t,n,`lil-function`),this.$button=document.createElement(`button`),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener(`click`,e=>{e.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$disable=this.$button}},$e=class extends J{constructor(e,t,n,r,i,a){super(e,t,n,`lil-number`),this._initInput(),this.min(r),this.max(i);let o=a!==void 0;this.step(o?a:this._getImplicitStep(),o),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){let e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+`%`}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),window.matchMedia(`(pointer: coarse)`).matches&&(this.$input.setAttribute(`type`,`number`),this.$input.setAttribute(`step`,`any`)),this.$widget.appendChild(this.$input),this.$disable=this.$input;let e=()=>{let e=parseFloat(this.$input.value);isNaN(e)||(this._stepExplicit&&(e=this._snap(e)),this.setValue(this._clamp(e)))},t=e=>{let t=parseFloat(this.$input.value);isNaN(t)||(this._snapClampSetValue(t+e),this.$input.value=this.getValue())},n=e=>{e.key===`Enter`&&this.$input.blur(),e.code===`ArrowUp`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e))),e.code===`ArrowDown`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e)*-1))},r=e=>{this._inputFocused&&(e.preventDefault(),t(this._step*this._normalizeMouseWheel(e)))},i=!1,a,o,s,c,l,u=e=>{a=e.clientX,o=s=e.clientY,i=!0,c=this.getValue(),l=0,window.addEventListener(`mousemove`,d),window.addEventListener(`mouseup`,f)},d=e=>{if(i){let t=e.clientX-a,n=e.clientY-o;Math.abs(n)>5?(e.preventDefault(),this.$input.blur(),i=!1,this._setDraggingStyle(!0,`vertical`)):Math.abs(t)>5&&f()}if(!i){let t=e.clientY-s;l-=t*this._step*this._arrowKeyMultiplier(e),c+l>this._max?l=this._max-c:c+l<this._min&&(l=this._min-c),this._snapClampSetValue(c+l)}s=e.clientY},f=()=>{this._setDraggingStyle(!1,`vertical`),this._callOnFinishChange(),window.removeEventListener(`mousemove`,d),window.removeEventListener(`mouseup`,f)};this.$input.addEventListener(`input`,e),this.$input.addEventListener(`keydown`,n),this.$input.addEventListener(`wheel`,r,{passive:!1}),this.$input.addEventListener(`mousedown`,u),this.$input.addEventListener(`focus`,()=>{this._inputFocused=!0}),this.$input.addEventListener(`blur`,()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()})}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement(`div`),this.$slider.classList.add(`lil-slider`),this.$fill=document.createElement(`div`),this.$fill.classList.add(`lil-fill`),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add(`lil-has-slider`);let e=(e,t,n,r,i)=>(e-t)/(n-t)*(i-r)+r,t=t=>{let n=this.$slider.getBoundingClientRect(),r=e(t,n.left,n.right,this._min,this._max);this._snapClampSetValue(r)},n=e=>{this._setDraggingStyle(!0),t(e.clientX),window.addEventListener(`mousemove`,r),window.addEventListener(`mouseup`,i)},r=e=>{t(e.clientX)},i=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`mousemove`,r),window.removeEventListener(`mouseup`,i)},a=!1,o,s,c=e=>{e.preventDefault(),this._setDraggingStyle(!0),t(e.touches[0].clientX),a=!1},l=e=>{e.touches.length>1||(this._hasScrollBar?(o=e.touches[0].clientX,s=e.touches[0].clientY,a=!0):c(e),window.addEventListener(`touchmove`,u,{passive:!1}),window.addEventListener(`touchend`,d))},u=e=>{if(a){let t=e.touches[0].clientX-o,n=e.touches[0].clientY-s;Math.abs(t)>Math.abs(n)?c(e):(window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d))}else e.preventDefault(),t(e.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d)},f=this._callOnFinishChange.bind(this),p;this.$slider.addEventListener(`mousedown`,n),this.$slider.addEventListener(`touchstart`,l,{passive:!1}),this.$slider.addEventListener(`wheel`,e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)&&this._hasScrollBar)return;e.preventDefault();let t=this._normalizeMouseWheel(e)*this._step;this._snapClampSetValue(this.getValue()+t),this.$input.value=this.getValue(),clearTimeout(p),p=setTimeout(f,400)},{passive:!1})}_setDraggingStyle(e,t=`horizontal`){this.$slider&&this.$slider.classList.toggle(`lil-active`,e),document.body.classList.toggle(`lil-dragging`,e),document.body.classList.toggle(`lil-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:n}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,n=-e.wheelDelta/120,n*=this._stepExplicit?1:10),t+-n}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=0;return this._hasMin?t=this._min:this._hasMax&&(t=this._max),e-=t,e=Math.round(e/this._step)*this._step,e+=t,e=parseFloat(e.toPrecision(15)),e}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){let e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}},et=class extends J{constructor(e,t,n,r){super(e,t,n,`lil-option`),this.$select=document.createElement(`select`),this.$select.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`lil-display`),this.$select.addEventListener(`change`,()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener(`focus`,()=>{this.$display.classList.add(`lil-focus`)}),this.$select.addEventListener(`blur`,()=>{this.$display.classList.remove(`lil-focus`)}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(e=>{let t=document.createElement(`option`);t.textContent=e,this.$select.appendChild(t)}),this.updateDisplay(),this}updateDisplay(){let e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}},tt=class extends J{constructor(e,t,n){super(e,t,n,`lil-string`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`spellcheck`,`false`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$input.addEventListener(`input`,()=>{this.setValue(this.$input.value)}),this.$input.addEventListener(`keydown`,e=>{e.code===`Enter`&&this.$input.blur()}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}},nt=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;function rt(e){let t=document.createElement(`style`);t.innerHTML=e;let n=document.querySelector(`head link[rel=stylesheet], head style`);n?document.head.insertBefore(t,n):document.head.appendChild(t)}var Q=!1,it=class e{constructor({parent:e,autoPlace:t=e===void 0,container:n,width:r,title:i=`Controls`,closeFolders:a=!1,injectStyles:o=!0,touchStyles:s=!0}={}){if(this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement(`div`),this.domElement.classList.add(`lil-gui`),this.$title=document.createElement(`button`),this.$title.classList.add(`lil-title`),this.$title.setAttribute(`aria-expanded`,!0),this.$title.addEventListener(`click`,()=>this.openAnimated(this._closed)),this.$title.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$children=document.createElement(`div`),this.$children.classList.add(`lil-children`),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(i),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add(`lil-root`),s&&this.domElement.classList.add(`lil-allow-touch-styles`),!Q&&o&&(rt(nt),Q=!0),n?n.appendChild(this.domElement):t&&(this.domElement.classList.add(`lil-auto-place`,`autoPlace`),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty(`--width`,r+`px`),this._closeFolders=a}add(e,t,n,r,i){if(Object(n)===n)return new et(this,e,t,n);let a=e[t];switch(typeof a){case`number`:return new $e(this,e,t,n,r,i);case`boolean`:return new Je(this,e,t);case`string`:return new tt(this,e,t);case`function`:return new Z(this,e,t)}console.error(`gui.add failed
	property:`,t,`
	object:`,e,`
	value:`,a)}addColor(e,t,n=1){return new Qe(this,e,t,n)}addFolder(t){let n=new e({parent:this,title:t});return this.root._closeFolders&&n.close(),n}load(e,t=!0){return e.controllers&&this.controllers.forEach(t=>{t instanceof Z||t._name in e.controllers&&t.load(e.controllers[t._name])}),t&&e.folders&&this.folders.forEach(t=>{t._title in e.folders&&t.load(e.folders[t._title])}),this}save(e=!0){let t={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof Z)){if(e._name in t.controllers)throw Error(`Cannot save GUI with duplicate property "${e._name}"`);t.controllers[e._name]=e.save()}}),e&&this.folders.forEach(e=>{if(e._title in t.folders)throw Error(`Cannot save GUI with duplicate folder "${e._title}"`);t.folders[e._title]=e.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),this.domElement.classList.toggle(`lil-closed`,this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),requestAnimationFrame(()=>{let t=this.$children.clientHeight;this.$children.style.height=t+`px`,this.domElement.classList.add(`lil-transition`);let n=e=>{e.target===this.$children&&(this.$children.style.height=``,this.domElement.classList.remove(`lil-transition`),this.$children.removeEventListener(`transitionend`,n))};this.$children.addEventListener(`transitionend`,n);let r=e?this.$children.scrollHeight:0;this.domElement.classList.toggle(`lil-closed`,!e),requestAnimationFrame(()=>{this.$children.style.height=r+`px`})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}},at=`frost-sandbox.presets.v1`,$=`frost-sandbox.lastPreset`,ot=class{constructor(){this.presets=this._read()}_read(){try{let e=localStorage.getItem(at);return e?JSON.parse(e):{}}catch(e){return console.warn(`[PresetManager] could not read presets`,e),{}}}_write(){try{localStorage.setItem(at,JSON.stringify(this.presets))}catch(e){console.warn(`[PresetManager] could not persist presets`,e)}}get names(){return Object.keys(this.presets).sort()}has(e){return Object.prototype.hasOwnProperty.call(this.presets,e)}save(e){return e?(this.presets[e]=c(),this._write(),localStorage.setItem($,e),!0):!1}load(e){let t=this.presets[e];return t?(l(t),localStorage.setItem($,e),!0):!1}duplicate(e){if(!this.has(e))return null;let t=`${e} copy`,n=2;for(;this.has(t);)t=`${e} copy ${n++}`;return this.presets[t]=structuredClone(this.presets[e]),this._write(),t}remove(e){return this.has(e)?(delete this.presets[e],this._write(),!0):!1}reset(){l(structuredClone(be))}exportJSON(e=null){let t=e&&this.has(e)?this.presets[e]:c(),n=new Blob([JSON.stringify(t,null,2)],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${(e??`frost-settings`).replace(/\s+/g,`-`).toLowerCase()}.json`,i.click(),URL.revokeObjectURL(r)}exportAll(){let e=new Blob([JSON.stringify(this.presets,null,2)],{type:`application/json`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`frost-presets.json`,n.click(),URL.revokeObjectURL(t)}importFromFile(){return new Promise(e=>{let t=document.createElement(`input`);t.type=`file`,t.accept=`application/json,.json`,t.onchange=async()=>{let n=t.files?.[0];if(!n)return e({imported:[],applied:!1});try{let t=JSON.parse(await n.text());if(t&&t.global&&t.ice)l(t),e({imported:[],applied:!0});else{let n=[];for(let[e,r]of Object.entries(t))r&&typeof r==`object`&&(this.presets[e]=r,n.push(e));this._write(),e({imported:n,applied:!1})}}catch(t){console.error(`[PresetManager] import failed`,t),e({imported:[],applied:!1})}},t.click()})}get current(){return x}},st=class e{constructor(e={}){this.hooks=e,this.presets=new ot,this.gui=new it({title:`VFX Editor`,width:330}),this.gui.domElement.style.setProperty(`--title-height`,`30px`),this._presetState={name:`My preset`,selected:this.presets.names[0]??``},this._buildPresets(),this._buildGlobal(),this._buildAim(),this._buildZone(),this._buildIce(),this._buildThunder(),this._buildMeteor(),this._buildBeam(),this._buildSnare(),this._buildGlacier(),this._buildKit(),this._buildEnvironment(),this._buildPost(),this._buildCamera(),this._buildCharacter(),this.gui.foldersRecursive().forEach(e=>e.close())}static range(e,t,n,r,i,a,o){return e.add(t,n,r,i,a).name(o??n)}static castAnimation(e,t){return e.add(t,`castAnim`,f).name(`cast animation`)}static gradient(e,t,n,r){let i=e.addFolder(r);return i.addColor(t,`${n}A`).name(`birth`),i.addColor(t,`${n}B`).name(`early`),i.addColor(t,`${n}C`).name(`late`),i.addColor(t,`${n}D`).name(`death`),i}refresh(){this.gui.controllersRecursive().forEach(e=>e.updateDisplay())}toggle(){this._hidden=!this._hidden,this.gui.show(!this._hidden)}_buildPresets(){let e=this.gui.addFolder(`Presets`),t=this._presetState,n=e.add(t,`selected`,this.presets.names.length?this.presets.names:[``]).name(`preset`),r=()=>{let e=this.presets.names;n=n.options(e.length?e:[``]).name(`preset`),n.setValue(e.includes(t.selected)?t.selected:e[0]??``)};e.add(t,`name`).name(`name`),e.add({save:()=>{this.presets.save(t.name),t.selected=t.name,r(),this.hooks.onToast?.(`Saved preset "${t.name}"`)}},`save`).name(`Save preset`),e.add({load:()=>{this.presets.load(t.selected)&&(this.refresh(),this.hooks.onToast?.(`Loaded "${t.selected}"`))}},`load`).name(`Load preset`),e.add({duplicate:()=>{let e=this.presets.duplicate(t.selected);e&&(t.selected=e,r(),this.hooks.onToast?.(`Duplicated to "${e}"`))}},`duplicate`).name(`Duplicate`),e.add({remove:()=>{this.presets.remove(t.selected)&&(r(),this.hooks.onToast?.(`Preset deleted`))}},`remove`).name(`Delete`),e.add({exportOne:()=>this.presets.exportJSON()},`exportOne`).name(`Export current (JSON)`),e.add({exportAll:()=>this.presets.exportAll()},`exportAll`).name(`Export all presets`),e.add({import:async()=>{let e=await this.presets.importFromFile();r(),this.refresh(),this.hooks.onToast?.(e.applied?`Settings imported`:e.imported.length?`Imported ${e.imported.length} preset(s)`:`Nothing imported`)}},`import`).name(`Import JSON…`),e.add({reset:()=>{this.presets.reset(),this.refresh(),this.hooks.onToast?.(`Reset to defaults`)}},`reset`).name(`Reset to defaults`),this.presetFolder=e}_buildGlobal(){let t=this.gui.addFolder(`Global`),n=x.global,r=e.range;r(t,n,`timeScale`,.02,2,.01,`time scale`),r(t,n,`speed`,.1,4,.01,`cast speed`),r(t,n,`lifetime`,.1,4,.01,`lifetime`),r(t,n,`glow`,0,5,.01,`glow intensity`),r(t,n,`shaderIntensity`,0,2,.01,`shader intensity`),r(t,n,`opacity`,0,2,.01,`opacity`),r(t,n,`noiseFrequency`,.1,4,.01,`noise frequency`),r(t,n,`noiseSpeed`,0,4,.01,`noise speed`),r(t,n,`turbulence`,0,4,.01,`turbulence`),r(t,n,`randomness`,0,2,.01,`randomness`),r(t,n,`fresnel`,0,3,.01,`fresnel strength`),r(t,n,`distortion`,0,3,.01,`heat distortion`);let i=t.addFolder(`Particles`);r(i,n,`particleCount`,0,3,.01,`count`),r(i,n,`particleLifetime`,.1,3,.01,`lifetime`),r(i,n,`particleSpeed`,.1,3,.01,`speed`),r(i,n,`particleSize`,.1,3,.01,`size`),r(i,n,`emissionRate`,0,3,.01,`emission rate`);let a=t.addFolder(`Lighting & impact`);r(a,n,`lightIntensity`,0,4,.01,`light intensity`),r(a,n,`lightRadius`,.1,4,.01,`light radius`),r(a,n,`explosionIntensity`,0,3,.01,`impact intensity`),r(a,n,`cameraShake`,0,3,.01,`camera shake`),r(a,n,`animationSpeed`,0,3,.01,`animation speed`),this.globalFolder=t}_buildAim(){let t=this.gui.addFolder(`➤  Aim indicator`),n=x.aim,r=e.range,i=t.addFolder(`Silhouette (metres)`);r(i,n,`shaftWidth`,.05,2,.01,`shaft half-width`),r(i,n,`headLength`,.2,8,.05,`head length`),r(i,n,`headWidth`,.1,5,.01,`head half-width`),r(i,n,`round`,0,.6,.01,`corner rounding`),r(i,n,`startOffset`,0,5,.05,`gap at the caster`),r(i,n,`height`,.005,.4,.005,`hover height`);let a=t.addFolder(`Rendering`);r(a,n,`edge`,.01,.5,.005,`outline thickness`),r(a,n,`edgeGlow`,0,8,.05,`outline glow`),r(a,n,`softness`,.005,.5,.005,`edge softness`),r(a,n,`fill`,0,1.5,.01,`interior fill`),r(a,n,`fillFalloff`,.1,4,.05,`fill falloff`),r(a,n,`opacity`,0,2,.01,`opacity`),a.addColor(n,`colorCore`).name(`core colour`),a.addColor(n,`colorEdge`).name(`edge colour`),a.addColor(n,`colorInvalid`).name(`too-close colour`);let o=t.addFolder(`Energy & frost`);r(o,n,`stripes`,0,4,.01,`chevrons / metre`),r(o,n,`stripeSharp`,0,1,.01,`chevron sharpness`),r(o,n,`stripeDepth`,0,1,.01,`chevron depth`),r(o,n,`scrollSpeed`,-10,10,.05,`scroll speed`),r(o,n,`pulse`,0,1,.01,`pulse`),r(o,n,`pulseSpeed`,0,8,.05,`pulse speed`),r(o,n,`noise`,0,1.5,.01,`frost noise`),r(o,n,`noiseScale`,.1,8,.05,`noise scale`),r(o,n,`noiseSpeed`,0,3,.01,`noise speed`),r(o,n,`crystals`,0,2,.01,`frost plates`),r(o,n,`crystalScale`,.2,10,.05,`plate scale`);let s=t.addFolder(`Rings & rosette`);r(s,n,`baseRing`,0,3,.01,`base ring radius`),r(s,n,`baseRingWidth`,.005,.4,.005,`base ring width`),r(s,n,`tipGlyph`,0,2,.01,`tip rosette`),r(s,n,`tipGlyphSize`,.1,4,.05,`rosette radius`),r(s,n,`tipSpin`,-3,3,.01,`rosette spin`),r(s,n,`rangeArc`,0,2,.01,`range arc`),r(s,n,`reveal`,.01,1,.005,`sweep-out time`)}_buildZone(){let t=this.gui.addFolder(`◎  Far-cast circle`),n=x.zone,r=e.range,i=t.addFolder(`The boundary (metres)`);r(i,n,`boundary`,.02,2,.01,`band thickness`),r(i,n,`boundaryBias`,0,1,.01,`band bias out/in`),r(i,n,`boundaryGlow`,0,8,.05,`band glow`),r(i,n,`liner`,.005,.4,.005,`inner liner`),r(i,n,`softness`,.005,.4,.005,`edge softness`),r(i,n,`height`,.005,.4,.005,`hover height`);let a=t.addFolder(`The interior`);r(a,n,`fill`,0,1.5,.01,`interior fill`),r(a,n,`fillFalloff`,.1,5,.05,`fill falloff`),r(a,n,`rings`,0,12,.1,`contour rings`),r(a,n,`ringWidth`,.005,.5,.005,`ring width`),r(a,n,`ringSpeed`,-4,4,.01,`ring speed`),r(a,n,`crawl`,0,3,.01,`filaments`),r(a,n,`crawlScale`,.1,8,.05,`filaments / metre`),r(a,n,`crawlSpeed`,-4,4,.01,`filament crawl`),r(a,n,`noise`,0,1.5,.01,`break-up`),r(a,n,`noiseScale`,.1,8,.05,`break-up scale`);let o=t.addFolder(`Ticks, sweep & reticle`);r(o,n,`ticks`,0,96,1,`boundary ticks`),r(o,n,`tickLength`,.05,3,.01,`tick length`),r(o,n,`tickWidth`,.02,.9,.01,`tick duty`),r(o,n,`tickSpin`,-2,2,.005,`tick spin`),r(o,n,`sweep`,0,3,.01,`radar sweep`),r(o,n,`sweepSpeed`,-3,3,.01,`sweep speed`),r(o,n,`core`,0,3,.01,`centre mark`),r(o,n,`coreSize`,.05,3,.01,`centre size`),r(o,n,`crosshair`,0,3,.01,`reticle arms`),r(o,n,`crosshairLength`,.1,6,.05,`arm length`),r(o,n,`pulse`,0,1,.01,`pulse`),r(o,n,`pulseSpeed`,0,8,.05,`pulse speed`);let s=t.addFolder(`The reach ring`);r(s,n,`reach`,0,3,.01,`reach brightness`),r(s,n,`reachWidth`,.005,.5,.005,`reach width`),r(s,n,`reachDashes`,0,200,1,`dashes`),r(s,n,`reachDashGap`,0,.95,.01,`dash gap`),r(s,n,`reachSpin`,-1,1,.005,`dash creep`),r(s,n,`reachLead`,0,3,.01,`lead marker`);let c=t.addFolder(`Rendering`);r(c,n,`opacity`,0,2,.01,`opacity`),r(c,n,`reveal`,.01,1,.005,`snap-out time`),r(c,n,`snap`,1,2,.01,`snap overshoot`),c.addColor(n,`colorCore`).name(`core colour`),c.addColor(n,`colorEdge`).name(`fill colour`),c.addColor(n,`colorInvalid`).name(`too-close colour`)}_buildIce(){let t=this.gui.addFolder(`❄  Frost Lance`),n=x.ice,r=e.range,i=t.addFolder(`The cast`);r(i,n,`range`,2,40,.1,`max range`),r(i,n,`minRange`,0,10,.1,`min range`),r(i,n,`speed`,2,80,.5,`front speed`),r(i,n,`lifetime`,.2,12,.1,`field lifetime`),r(i,n,`cooldown`,0,6,.05,`cooldown`),e.castAnimation(i,n);let a=t.addFolder(`Footprint`);r(a,n,`widthNear`,.05,6,.01,`width at caster`),r(a,n,`width`,.1,10,.05,`width at target`),r(a,n,`widthCurve`,.2,4,.01,`width curve`),r(a,n,`spikeCount`,4,288,1,`crystal count`),r(a,n,`density`,.05,1,.01,`density`),r(a,n,`clumping`,.3,4,.01,`pull to centre`),r(a,n,`scatter`,0,2,.01,`lateral scatter`),r(a,n,`frontBias`,.3,3,.01,`crowd toward target`);let o=t.addFolder(`Silhouette`);r(o,n,`heightNear`,.05,6,.01,`height at caster`),r(o,n,`height`,.1,12,.05,`height at target`),r(o,n,`heightCurve`,.2,5,.01,`height curve`),r(o,n,`heightJitter`,0,1.5,.01,`height jitter`),r(o,n,`crown`,0,.95,.01,`flank falloff`),r(o,n,`peak`,1,4,.01,`swell at target`),r(o,n,`peakWidth`,.02,1,.01,`swell width`),r(o,n,`rubble`,0,1,.01,`rubble fraction`),r(o,n,`rubbleScale`,.05,1,.01,`rubble height`);let s=t.addFolder(`The crystal`);r(s,n,`radius`,.02,1.5,.01,`base radius`),r(s,n,`radiusJitter`,0,1.5,.01,`radius jitter`),r(s,n,`taper`,.01,.8,.01,`tip taper`),r(s,n,`facets`,3,10,1,`facets`),r(s,n,`roughness`,0,1,.01,`surface roughness`),r(s,n,`bend`,0,1.5,.01,`bend`),r(s,n,`lean`,0,1.4,.01,`lean from caster`),r(s,n,`leanJitter`,0,1.5,.01,`lean jitter`),r(s,n,`twist`,0,1,.01,`random yaw`);let c=t.addFolder(`The eruption`);r(c,n,`riseTime`,.02,1.5,.01,`rise time`),r(c,n,`riseOvershoot`,0,1,.01,`punch overshoot`),r(c,n,`riseStagger`,0,1,.005,`stagger`),r(c,n,`settle`,.05,2,.01,`settle time`),r(c,n,`shatterDelay`,0,4,.05,`hold before sinking`),r(c,n,`sinkTime`,.1,4,.05,`sink time`);let l=t.addFolder(`Ice material`);l.addColor(n,`colorDeep`).name(`deep`),l.addColor(n,`colorIce`).name(`body`),l.addColor(n,`colorRim`).name(`rim`),l.addColor(n,`colorCore`).name(`inner light`),r(l,n,`opacity`,0,1,.01,`opacity`),r(l,n,`depthTint`,0,3,.01,`thickness tint`),r(l,n,`fresnel`,0,6,.01,`fresnel`),r(l,n,`fresnelPower`,.5,6,.05,`fresnel power`),r(l,n,`translucency`,0,4,.01,`translucency`),r(l,n,`envIntensity`,0,3,.01,`reflection`),r(l,n,`facetSharp`,0,1.5,.01,`facet contrast`),r(l,n,`fracture`,0,2,.01,`internal cracks`),r(l,n,`fractureScale`,.5,20,.1,`crack scale`),r(l,n,`veins`,0,2,.01,`feather frost`),r(l,n,`veinScale`,.2,10,.05,`frost scale`),r(l,n,`glint`,0,5,.01,`surface glint`),r(l,n,`glintScale`,4,90,.5,`glint scale`),r(l,n,`glintSpeed`,0,4,.01,`glint speed`),r(l,n,`frostLine`,0,1.5,.01,`rime at the base`),r(l,n,`glow`,0,5,.01,`glow`),r(l,n,`edgeGlow`,0,6,.01,`edge glow`),r(l,n,`birthGlow`,0,10,.05,`birth flash`),r(l,n,`birthFade`,.02,2,.01,`birth flash time`);let u=t.addFolder(`Frost on the ground`);r(u,n,`frostSpread`,.1,5,.01,`patch radius`),r(u,n,`frostRate`,.2,12,.1,`patches / metre`),r(u,n,`frostLife`,.5,20,.1,`patch lifetime`),r(u,n,`frostIntensity`,0,2,.01,`intensity`),r(u,n,`frostCrystals`,0,4,.01,`snow grain`),r(u,n,`shockRadius`,.5,20,.1,`shockwave radius`),u.addColor(n,`colorFrost`).name(`snow`),u.addColor(n,`colorFrostEdge`).name(`snow shadow`),u.addColor(n,`colorShockA`).name(`shockwave ring`),u.addColor(n,`colorShockB`).name(`shockwave crest`);let d=t.addFolder(`Mist, chips & glitter`);r(d,n,`mistRate`,0,900,1,`mist rate`),r(d,n,`mistSize`,.05,4,.01,`mist size`),r(d,n,`mistSpeed`,0,8,.05,`mist speed`),r(d,n,`mistLifetime`,.2,8,.05,`mist lifetime`),r(d,n,`mistOpacity`,0,2,.01,`mist opacity`),r(d,n,`mistRise`,-2,4,.01,`mist rise`),r(d,n,`shardRate`,0,500,1,`chip rate`),r(d,n,`shardSize`,.005,.5,.005,`chip size`),r(d,n,`shardSpeed`,0,25,.1,`chip speed`),r(d,n,`shardLifetime`,.1,5,.05,`chip lifetime`),r(d,n,`shardGravity`,-40,0,.1,`chip gravity`),r(d,n,`sparkleRate`,0,600,1,`glitter rate`),r(d,n,`sparkleSize`,.005,.4,.005,`glitter size`),r(d,n,`sparkleSpeed`,0,12,.05,`glitter speed`),r(d,n,`sparkleLifetime`,.2,8,.05,`glitter lifetime`),r(d,n,`sparkleRise`,-2,8,.05,`glitter rise`),r(d,n,`sparkleTurbulence`,0,3,.01,`glitter turbulence`),e.gradient(d,n,`colorMist`,`Mist colour`),e.gradient(d,n,`colorShard`,`Chip colour`),e.gradient(d,n,`colorSparkle`,`Glitter colour`);let f=t.addFolder(`Impact`);r(f,n,`burstSize`,.2,14,.05,`burst size`),r(f,n,`burstIntensity`,0,4,.01,`burst intensity`),r(f,n,`burstShards`,0,400,1,`burst chips`),r(f,n,`impactShake`,0,3,.01,`shake`),r(f,n,`shakeDuration`,.1,4,.01,`shake duration`),r(f,n,`impactFlash`,0,2,.01,`screen flash`),r(f,n,`rumble`,0,.5,.005,`travel rumble`),f.addColor(n,`colorBurstA`).name(`vapour shell`),f.addColor(n,`colorBurstB`).name(`shell body`),f.addColor(n,`colorBurstC`).name(`plates & rim`),f.addColor(n,`colorFlash`).name(`screen flash colour`);let p=t.addFolder(`Dynamic light`);r(p,n,`lightIntensity`,0,80,.1,`light intensity`),r(p,n,`lightRadius`,.5,40,.1,`light radius`),p.addColor(n,`lightColor`).name(`light colour`),this.iceFolder=t}_buildThunder(){let t=this.gui.addFolder(`⚡  Storm Lance`),n=x.thunder,r=e.range,i=t.addFolder(`The cast`);r(i,n,`range`,2,60,.1,`max range`),r(i,n,`minRange`,0,10,.1,`min range`),r(i,n,`speed`,5,400,1,`strike speed`),r(i,n,`lifetime`,.05,6,.01,`bolt lifetime`),r(i,n,`fadeTime`,.05,4,.01,`blow-out time`),r(i,n,`cooldown`,0,6,.05,`cooldown`),e.castAnimation(i,n);let a=t.addFolder(`Where it leaves the hand`);r(a,n,`handHeight`,0,3,.01,`hand height`),r(a,n,`handForward`,-1,3,.01,`hand forward`),r(a,n,`handSide`,-1.5,1.5,.01,`hand lateral`),r(a,n,`endHeight`,0,4,.01,`height at target`),r(a,n,`sag`,-3,3,.01,`mid-span bow`);let o=t.addFolder(`The bundle`);r(o,n,`strands`,1,24,1,`filaments`),r(o,n,`spread`,0,5,.01,`fan at target`),r(o,n,`spreadNear`,0,2,.01,`fan at hand`),r(o,n,`spreadCurve`,.2,5,.01,`fan curve`),r(o,n,`twist`,-4,4,.01,`twist over length`),r(o,n,`twistSpeed`,-6,6,.01,`twist speed`),r(o,n,`branchDim`,0,1,.01,`outer filament dim`);let s=t.addFolder(`The filament`);r(s,n,`jitter`,0,3,.01,`kink amplitude`),r(s,n,`jitterScale`,.05,6,.01,`kinks / metre`),r(s,n,`octaves`,1,5,1,`octaves`),r(s,n,`jitterFalloff`,.1,.95,.01,`octave falloff`),r(s,n,`crawl`,-20,20,.1,`kink crawl`),r(s,n,`pinch`,.01,.5,.005,`end pinch`),r(s,n,`converge`,0,1,.01,`lock onto target`);let c=t.addFolder(`The ribbon`);r(c,n,`width`,.005,.6,.005,`width at hand`),r(c,n,`widthTip`,.02,3,.01,`width at target`),r(c,n,`widthCurve`,.1,4,.01,`taper curve`),r(c,n,`coreWidth`,1,6,.01,`spine thickness`),r(c,n,`coreSharp`,.5,12,.05,`core sharpness`),r(c,n,`glowWidth`,1,30,.1,`halo width`),r(c,n,`glowFalloff`,.2,8,.05,`halo falloff`),r(c,n,`glowOpacity`,0,2,.01,`halo opacity`),r(c,n,`softFade`,.02,3,.01,`soft intersection`);let l=t.addFolder(`Flicker & restrike`);r(l,n,`restrike`,.5,90,.5,`restrikes / sec`),r(l,n,`flicker`,0,1,.01,`brightness stutter`),r(l,n,`flickerSpeed`,1,120,1,`stutter rate`),r(l,n,`strandFlash`,0,1,.01,`filament blink`),r(l,n,`tipGlow`,0,8,.05,`leading-edge glow`),r(l,n,`tipLength`,.005,.5,.005,`leading-edge length`);let u=t.addFolder(`Bolt colour`);u.addColor(n,`colorCore`).name(`core`),u.addColor(n,`colorInner`).name(`inner`),u.addColor(n,`colorOuter`).name(`outer`),u.addColor(n,`colorHalo`).name(`halo`),r(u,n,`glow`,0,8,.01,`glow`),r(u,n,`opacity`,0,2,.01,`opacity`);let d=t.addFolder(`Burns on the ground`);r(d,n,`arcRate`,.05,8,.05,`burns / metre`),r(d,n,`arcRadius`,.1,8,.05,`burn radius`),r(d,n,`arcLife`,.05,5,.05,`burn lifetime`),r(d,n,`arcIntensity`,0,3,.01,`burn intensity`),r(d,n,`arcBranches`,0,3,.01,`branch detail`),r(d,n,`scorchRadius`,.05,4,.05,`scorch radius`),r(d,n,`scorchLife`,.5,20,.1,`scorch lifetime`),r(d,n,`scorchIntensity`,0,2,.01,`scorch intensity`),r(d,n,`shockRadius`,.5,25,.1,`shockwave radius`),d.addColor(n,`colorArc`).name(`burn`),d.addColor(n,`colorEmber`).name(`ember`),d.addColor(n,`colorScorch`).name(`scorch`),d.addColor(n,`colorShockA`).name(`shockwave ring`),d.addColor(n,`colorShockB`).name(`shockwave crest`);let f=t.addFolder(`Sparks & motes`);r(f,n,`sparkRate`,0,1200,1,`spark rate`),r(f,n,`sparkSize`,.005,.8,.005,`spark size`),r(f,n,`sparkSpeed`,0,40,.1,`spark speed`),r(f,n,`sparkLifetime`,.05,4,.01,`spark lifetime`),r(f,n,`sparkGravity`,-50,5,.1,`spark gravity`),r(f,n,`sparkStretch`,0,3,.01,`spark stretch`),r(f,n,`moteRate`,0,600,1,`mote rate`),r(f,n,`moteSize`,.005,.4,.005,`mote size`),r(f,n,`moteSpeed`,0,12,.05,`mote speed`),r(f,n,`moteLifetime`,.1,8,.05,`mote lifetime`),r(f,n,`moteRise`,-3,8,.05,`mote rise`),r(f,n,`moteTurbulence`,0,3,.01,`mote turbulence`),e.gradient(f,n,`colorSpark`,`Spark colour`),e.gradient(f,n,`colorMote`,`Mote colour`);let p=t.addFolder(`Smoke & debris`);r(p,n,`smokeRate`,0,500,1,`smoke rate`),r(p,n,`smokeSize`,.05,4,.01,`smoke size`),r(p,n,`smokeSpeed`,0,8,.05,`smoke speed`),r(p,n,`smokeLifetime`,.2,8,.05,`smoke lifetime`),r(p,n,`smokeOpacity`,0,1,.005,`smoke opacity`),r(p,n,`smokeRise`,-2,4,.01,`smoke rise`),r(p,n,`debrisRate`,0,300,1,`debris rate`),r(p,n,`debrisSize`,.005,.4,.005,`debris size`),r(p,n,`debrisSpeed`,0,25,.1,`debris speed`),r(p,n,`debrisLifetime`,.1,5,.05,`debris lifetime`),r(p,n,`debrisGravity`,-50,0,.1,`debris gravity`),e.gradient(p,n,`colorSmoke`,`Smoke colour`),e.gradient(p,n,`colorDebris`,`Debris colour`);let m=t.addFolder(`Muzzle & impact`);r(m,n,`muzzleSize`,.05,6,.05,`muzzle size`),r(m,n,`muzzleIntensity`,0,5,.01,`muzzle intensity`),r(m,n,`castFlash`,0,2,.01,`flash on release`),m.addColor(n,`colorMuzzleA`).name(`muzzle shell`),m.addColor(n,`colorMuzzleB`).name(`muzzle body`),m.addColor(n,`colorMuzzleC`).name(`muzzle arcs`),m.addColor(n,`colorCastFlash`).name(`release flash colour`),r(m,n,`burstSize`,.2,14,.05,`burst size`),r(m,n,`burstIntensity`,0,5,.01,`burst intensity`),r(m,n,`burstSparks`,0,600,1,`burst sparks`),r(m,n,`burstDebris`,0,300,1,`burst debris`),r(m,n,`impactShake`,0,3,.01,`shake`),r(m,n,`shakeDuration`,.1,4,.01,`shake duration`),r(m,n,`impactFlash`,0,2,.01,`screen flash`),r(m,n,`rumble`,0,.5,.005,`travel rumble`),m.addColor(n,`colorBurstA`).name(`burst shell`),m.addColor(n,`colorBurstB`).name(`burst body`),m.addColor(n,`colorBurstC`).name(`burst arcs`),m.addColor(n,`colorFlash`).name(`impact flash colour`);let h=t.addFolder(`Dynamic light`);r(h,n,`lightIntensity`,0,120,.5,`light intensity`),r(h,n,`lightRadius`,.5,50,.1,`light radius`),r(h,n,`lightFlicker`,0,1,.01,`light gutter`),r(h,n,`lightFlickerSpeed`,1,90,1,`gutter rate`),h.addColor(n,`lightColor`).name(`light colour`),this.thunderFolder=t}_buildMeteor(){let t=this.gui.addFolder(`☄  Cinder Fall`),n=x.meteor,r=e.range,i=t.addFolder(`The cast`);r(i,n,`range`,2,60,.1,`max range`),r(i,n,`minRange`,0,10,.1,`min range`),r(i,n,`speed`,3,90,.5,`travel speed`),r(i,n,`lifetime`,.2,10,.1,`crater lifetime`),r(i,n,`fadeTime`,.1,6,.05,`clear-out time`),r(i,n,`cooldown`,0,6,.05,`cooldown`),e.castAnimation(i,n);let a=t.addFolder(`The flight path`);r(a,n,`handHeight`,0,3,.01,`hand height`),r(a,n,`handForward`,-1,3,.01,`hand forward`),r(a,n,`handSide`,-1.5,1.5,.01,`hand lateral`),r(a,n,`endHeight`,0,4,.01,`height at target`),r(a,n,`arc`,-4,12,.05,`lob height`),r(a,n,`arcCurve`,.1,4,.01,`lob curve`);let o=t.addFolder(`The rock`);r(o,n,`radius`,.05,3,.01,`radius`),r(o,n,`facets`,0,3,1,`subdivisions`),r(o,n,`lumpiness`,0,.8,.01,`lumpiness`),r(o,n,`lumpScale`,.2,6,.05,`lumps / radius`),r(o,n,`surfaceRoughness`,0,1,.01,`surface roughness`),r(o,n,`cuts`,0,16,1,`fracture faces`),r(o,n,`cutDepth`,0,.5,.01,`fracture depth`),r(o,n,`craters`,0,14,1,`craters`),r(o,n,`craterDepth`,0,.6,.01,`crater depth`),r(o,n,`craterSize`,.05,1.4,.01,`crater size`),r(o,n,`spin`,-20,20,.1,`tumble rate`);let s=t.addFolder(`Lava seams`);r(s,n,`chargeCurve`,.1,5,.01,`heat-up curve`),r(s,n,`crackScale`,.3,10,.05,`seams / radius`),r(s,n,`crackWidth`,.005,.5,.005,`seam width`),r(s,n,`crackBranches`,0,1.5,.01,`branch seams`),r(s,n,`crackGlow`,0,10,.05,`seam glow`),r(s,n,`crackFlow`,0,1,.01,`magma crawl`),r(s,n,`crackFlowSpeed`,0,5,.01,`crawl speed`),r(s,n,`rockScale`,.2,10,.05,`rock mottling`),r(s,n,`facetTint`,0,1.2,.01,`per-facet tint`),r(s,n,`cavity`,0,1,.01,`cavity shading`),r(s,n,`soot`,0,1.5,.01,`soot around seams`),r(s,n,`rimHeat`,0,4,.01,`heat sheath`),r(s,n,`leadGlow`,0,6,.01,`leading-face heat`),r(s,n,`leadSharp`,.5,8,.05,`leading-face falloff`),r(s,n,`glow`,0,4,.01,`glow`),r(s,n,`envIntensity`,0,3,.01,`reflection`),s.addColor(n,`colorRock`).name(`rock`),s.addColor(n,`colorChar`).name(`char`),s.addColor(n,`colorCrack`).name(`seam`),s.addColor(n,`colorHot`).name(`white hot`);let c=t.addFolder(`The fire trail`);r(c,n,`trailSpan`,.5,30,.1,`trail length`),r(c,n,`trailWidth`,.02,2,.01,`tube radius`),r(c,n,`trailHeadSize`,.5,5,.01,`head size`),r(c,n,`trailPlume`,.3,4,.01,`upward stretch`),r(c,n,`trailWakeSpread`,0,3,.01,`wake spread`),r(c,n,`trailRise`,0,3,.01,`wake rise`),r(c,n,`trailDetachment`,0,1.5,.01,`tail break-up`),r(c,n,`trailSoftness`,.05,1,.01,`surface softness`),r(c,n,`trailBurnout`,.05,4,.05,`burn-out time`),r(c,n,`trailTailFade`,.01,.8,.01,`tail burn-out`);let l=c.addFolder(`Silhouette`);r(l,n,`trailBulge`,0,1,.01,`lobe depth`),r(l,n,`trailBulgeScale`,.05,2,.01,`lobes / metre`),r(l,n,`trailShred`,0,4,.01,`fringe shred`),r(l,n,`trailWisps`,0,2,.01,`wisps`),r(l,n,`trailLick`,0,8,.05,`radial shear`);let u=c.addFolder(`Motion & turbulence`);r(u,n,`trailSpeed`,0,12,.01,`flow speed`),r(u,n,`trailBuoyancy`,0,10,.01,`buoyancy`),r(u,n,`trailTurbulence`,0,8,.01,`turbulence`),r(u,n,`trailNoiseStrength`,0,4,.01,`noise strength`),r(u,n,`trailNoiseFrequency`,.1,10,.01,`noise frequency`),r(u,n,`trailWarp`,0,1.5,.01,`domain warp`),r(u,n,`trailCurl`,0,3,.01,`axial swirl`),r(u,n,`trailVortex`,0,2,.01,`vortex roll-up`),r(u,n,`trailRingFrequency`,0,3,.01,`rings / metre`),r(u,n,`trailRingSpeed`,0,10,.05,`ring speed`),r(u,n,`trailTongue`,.2,3,.01,`tongue stretch`),r(u,n,`trailStreamStretch`,.2,3,.01,`streamwise stretch`),r(u,n,`trailFlicker`,0,2,.01,`flicker`),r(u,n,`trailOctaves`,1,5,1,`detail octaves`);let d=c.addFolder(`Temperature & radiance`);r(d,n,`trailTempCore`,1e3,5e3,10,`core temperature (K)`),r(d,n,`trailTempEdge`,1e3,4e3,10,`edge temperature (K)`),r(d,n,`trailEmissionCurve`,1,6,.01,`radiance exponent`),r(d,n,`trailHeatFocus`,.05,3,.01,`heat focus`),r(d,n,`trailHeatFalloff`,.05,4,.01,`heat falloff`),r(d,n,`trailHeatFollow`,0,1,.01,`heat follows noise`),r(d,n,`trailTailHeat`,0,1,.01,`spent-gas heat`),r(d,n,`trailScatter`,0,4,.01,`scatter`),r(d,n,`trailScatterFalloff`,.2,8,.05,`scatter falloff`),r(d,n,`trailPalette`,0,1,.01,`palette vs physics`),d.addColor(n,`colorFlameMid`).name(`flame mid`),d.addColor(n,`colorFlameEdge`).name(`flame edge`),d.addColor(n,`colorFlameSmoke`).name(`flame smoke`);let f=c.addFolder(`Volume rendering`);r(f,n,`trailDensity`,0,6,.01,`density`),r(f,n,`trailSoot`,0,5,.01,`soot absorption`),r(f,n,`trailCoreClarity`,0,1,.01,`core clarity`),r(f,n,`trailGlow`,0,8,.01,`glow`),r(f,n,`trailOpacity`,0,2,.01,`opacity`),r(f,n,`trailSteps`,6,72,1,`raymarch steps`);let p=t.addFolder(`The wreckage`);r(p,n,`chunkCount`,0,28,1,`chunks`),r(p,n,`chunkScale`,.05,.8,.01,`chunk size`),r(p,n,`chunkSpeed`,0,30,.1,`throw speed`),r(p,n,`chunkForward`,0,2,.01,`downrange bias`),r(p,n,`chunkLoft`,0,1.5,.01,`loft`),r(p,n,`chunkGravity`,-50,-1,.1,`gravity`),r(p,n,`chunkSpin`,0,20,.1,`tumble rate`),r(p,n,`chunkCool`,.1,8,.05,`cool-down time`),r(p,n,`chunkLinger`,0,4,.05,`hold before sinking`),r(p,n,`chunkSink`,.1,4,.05,`sink time`);let m=t.addFolder(`Embers & sparks`);r(m,n,`emberRate`,0,900,1,`ember rate`),r(m,n,`emberSize`,.005,.5,.005,`ember size`),r(m,n,`emberSpeed`,0,15,.05,`ember speed`),r(m,n,`emberLifetime`,.1,8,.05,`ember lifetime`),r(m,n,`emberRise`,-3,8,.05,`ember rise`),r(m,n,`emberGlow`,0,4,.01,`ember glow`),r(m,n,`emberTurbulence`,0,3,.01,`ember turbulence`),r(m,n,`sparkRate`,0,900,1,`spark rate`),r(m,n,`sparkSize`,.005,.8,.005,`spark size`),r(m,n,`sparkSpeed`,0,40,.1,`spark speed`),r(m,n,`sparkLifetime`,.05,4,.01,`spark lifetime`),r(m,n,`sparkGravity`,-50,5,.1,`spark gravity`),r(m,n,`sparkStretch`,0,3,.01,`spark stretch`),e.gradient(m,n,`colorEmber`,`Ember colour`),e.gradient(m,n,`colorSpark`,`Spark colour`);let h=t.addFolder(`Smoke & grit`);r(h,n,`smokeRate`,0,500,1,`smoke rate`),r(h,n,`smokeSize`,.05,4,.01,`smoke size`),r(h,n,`smokeSpeed`,0,8,.05,`smoke speed`),r(h,n,`smokeLifetime`,.2,10,.05,`smoke lifetime`),r(h,n,`smokeOpacity`,0,1,.005,`smoke opacity`),r(h,n,`smokeRise`,-2,5,.01,`smoke rise`),r(h,n,`debrisSize`,.005,.4,.005,`grit size`),r(h,n,`debrisSpeed`,0,25,.1,`grit speed`),r(h,n,`debrisLifetime`,.1,5,.05,`grit lifetime`),r(h,n,`debrisGravity`,-50,0,.1,`grit gravity`),e.gradient(h,n,`colorSmoke`,`Smoke colour`),e.gradient(h,n,`colorDebris`,`Grit colour`);let g=t.addFolder(`Molten cracks`);r(g,n,`fissureRadius`,.5,16,.05,`reach`),r(g,n,`fissureLife`,.5,25,.1,`lifetime`),r(g,n,`fissureArms`,2,12,1,`main cracks`),r(g,n,`fissureWander`,0,6,.05,`meander`),r(g,n,`fissureBranches`,0,1,.01,`branch density`),r(g,n,`fissureBranchLength`,0,1,.01,`branch length`),r(g,n,`fissureWidth`,.01,1,.005,`seam width`),r(g,n,`fissureHeat`,0,4,.01,`core heat`),r(g,n,`fissurePulse`,0,5,.01,`heat-wave speed`),r(g,n,`fissureGrowth`,.5,40,.1,`spread speed`),r(g,n,`fissureRockSize`,0,1.2,.01,`lip rubble size`);let _=t.addFolder(`The crater`);r(_,n,`scorchRadius`,.2,12,.05,`scorch radius`),r(_,n,`scorchLife`,.5,20,.1,`scorch lifetime`),r(_,n,`scorchIntensity`,0,2,.01,`scorch intensity`),r(_,n,`shockRadius`,.5,25,.1,`shockwave radius`),_.addColor(n,`colorScorch`).name(`scorch`),_.addColor(n,`colorShockA`).name(`shockwave ring`),_.addColor(n,`colorShockB`).name(`shockwave crest`);let v=t.addFolder(`Launch & detonation`);r(v,n,`muzzleSize`,0,6,.05,`launch flare`),r(v,n,`muzzleIntensity`,0,5,.01,`launch intensity`),r(v,n,`castFlash`,0,2,.01,`flash on release`),v.addColor(n,`colorCastFlash`).name(`release flash colour`),r(v,n,`burstSize`,.2,18,.05,`fireball size`),r(v,n,`burstIntensity`,0,5,.01,`fireball intensity`),r(v,n,`burstTurbulence`,0,4,.01,`fireball turbulence`),r(v,n,`burstEmbers`,0,800,1,`burst embers`),r(v,n,`burstSparks`,0,600,1,`burst sparks`),r(v,n,`burstDebris`,0,400,1,`burst grit`),r(v,n,`burstSmoke`,0,300,1,`burst smoke`),r(v,n,`impactShake`,0,3,.01,`shake`),r(v,n,`shakeDuration`,.1,4,.01,`shake duration`),r(v,n,`impactFlash`,0,2,.01,`screen flash`),r(v,n,`rumble`,0,.5,.005,`travel rumble`),v.addColor(n,`colorFlash`).name(`impact flash colour`);let y=t.addFolder(`Dynamic light`);r(y,n,`lightIntensity`,0,120,.5,`light intensity`),r(y,n,`lightRadius`,.5,50,.1,`light radius`),r(y,n,`lightFlicker`,0,1,.01,`light gutter`),r(y,n,`lightFlickerSpeed`,1,60,.5,`gutter rate`),y.addColor(n,`lightColor`).name(`light colour`),this.meteorFolder=t}_buildBeam(){let t=this.gui.addFolder(`✦  Nova Beam`),n=x.beam,r=e.range,i=t.addFolder(`The cast`);r(i,n,`range`,2,60,.1,`max range`),r(i,n,`minRange`,0,10,.1,`min range`),r(i,n,`charge`,0,3,.01,`wind-up time`),r(i,n,`speed`,5,400,1,`travel speed`),r(i,n,`lifetime`,.05,8,.01,`burn time`),r(i,n,`fadeTime`,.05,4,.01,`collapse time`),r(i,n,`cooldown`,0,6,.05,`cooldown`),e.castAnimation(i,n);let a=t.addFolder(`Where it leaves the hands`);r(a,n,`handHeight`,0,3,.01,`hand height`),r(a,n,`handForward`,-1,3,.01,`hand forward`),r(a,n,`handSide`,-1.5,1.5,.01,`hand lateral`),r(a,n,`endHeight`,0,4,.01,`height at target`);let o=t.addFolder(`The column`);r(o,n,`radiusNear`,.01,3,.01,`radius at hands`),r(o,n,`radius`,.02,5,.01,`radius at target`),r(o,n,`radiusCurve`,.1,4,.01,`radius curve`),r(o,n,`flare`,0,4,.01,`flare at target`),r(o,n,`flareWidth`,.02,1,.01,`flare width`),r(o,n,`throb`,0,.6,.005,`pressure waves`),r(o,n,`throbScale`,0,12,.1,`waves / length`),r(o,n,`throbSpeed`,0,10,.05,`wave speed`),r(o,n,`wander`,0,1,.005,`axis drift`),r(o,n,`wanderScale`,.1,6,.05,`drift scale`),r(o,n,`wanderSpeed`,0,5,.01,`drift speed`);let s=t.addFolder(`Core, sheath & halo`);r(s,n,`coreWidth`,.05,1.5,.01,`core width`),r(s,n,`coreSharp`,.1,8,.05,`core focus`),r(s,n,`coreFill`,0,3,.01,`core fill`),r(s,n,`shellWidth`,.2,3,.01,`sheath width`),r(s,n,`shellRim`,0,3,.01,`sheath rim`),r(s,n,`shellFill`,0,1.5,.01,`sheath fill`),r(s,n,`shellOpacity`,0,2,.01,`sheath opacity`),r(s,n,`edgePower`,.2,8,.05,`rim falloff`),r(s,n,`haloWidth`,.5,8,.05,`halo width`),r(s,n,`haloRim`,.5,10,.05,`halo falloff`),r(s,n,`haloOpacity`,0,2,.01,`halo opacity`);let c=t.addFolder(`Surface & flow`);r(c,n,`ripple`,0,1,.005,`surface ripple`),r(c,n,`rippleBands`,.1,8,.05,`ripples around`),r(c,n,`rippleScale`,.1,12,.05,`ripples along`),r(c,n,`rippleSpeed`,0,12,.05,`ripple crawl`),r(c,n,`streak`,0,3,.01,`filaments`),r(c,n,`streakSharp`,0,1,.01,`filament sharpness`),r(c,n,`streakScale`,.2,20,.1,`filaments / length`),r(c,n,`streakBands`,.2,10,.05,`filaments around`),r(c,n,`streakGlow`,0,4,.01,`filament heat`),r(c,n,`flowSpeed`,0,30,.1,`flow speed`),r(c,n,`mouthGlow`,0,6,.05,`muzzle heat`),r(c,n,`mouthLength`,.005,.5,.005,`muzzle length`),r(c,n,`tipGlow`,0,6,.05,`burning-end heat`),r(c,n,`tipLength`,.005,.5,.005,`burning-end length`),r(c,n,`softFade`,.02,3,.01,`soft intersection`);let l=t.addFolder(`Beam colour`);l.addColor(n,`colorCore`).name(`axis`),l.addColor(n,`colorInner`).name(`inner`),l.addColor(n,`colorOuter`).name(`sheath`),l.addColor(n,`colorHalo`).name(`halo`),r(l,n,`glow`,0,8,.01,`glow`),r(l,n,`opacity`,0,2,.01,`opacity`);let u=t.addFolder(`The coils`);r(u,n,`coils`,0,8,1,`ribbons`),r(u,n,`coilTurns`,-8,8,.05,`turns over length`),r(u,n,`coilSpeed`,-6,6,.01,`roll speed`),r(u,n,`coilRadius`,.2,4,.01,`ride radius`),r(u,n,`coilFlare`,0,4,.01,`flare at target`),r(u,n,`coilWidth`,.005,.6,.005,`width at hands`),r(u,n,`coilWidthTip`,.05,6,.01,`width at target`),r(u,n,`coilSharp`,.2,8,.05,`edge falloff`),r(u,n,`coilPulse`,0,1,.01,`charge pulse`),r(u,n,`coilPulseFreq`,0,12,.05,`pulses / length`),r(u,n,`coilPulseSpeed`,-8,8,.05,`pulse speed`),r(u,n,`coilGlow`,0,14,.01,`glow`),r(u,n,`coilOpacity`,0,3,.01,`opacity`),u.addColor(n,`colorCoil`).name(`ribbon core`),u.addColor(n,`colorCoilEdge`).name(`ribbon edge`);let d=t.addFolder(`Shock discs`);r(d,n,`rings`,0,12,1,`discs`),r(d,n,`ringSpeed`,0,6,.01,`trips / second`),r(d,n,`ringInner`,.2,4,.01,`inner lip`),r(d,n,`ringOuter`,.3,6,.01,`outer lip`),r(d,n,`ringSwell`,0,3,.01,`swell downrange`),r(d,n,`ringFade`,0,1,.01,`fade downrange`),r(d,n,`ringSharp`,.2,8,.05,`band sharpness`),r(d,n,`ringGlow`,0,8,.01,`glow`),r(d,n,`ringOpacity`,0,2,.01,`opacity`),d.addColor(n,`colorRing`).name(`disc colour`);let f=t.addFolder(`The charge`);r(f,n,`orbSize`,.02,2,.01,`orb radius`),r(f,n,`orbThrob`,0,.6,.005,`orb pulse`),r(f,n,`orbThrobSpeed`,0,20,.1,`pulse rate`),r(f,n,`orbTurbulence`,0,1,.01,`surface turbulence`),r(f,n,`orbScale`,.2,8,.05,`surface scale`),r(f,n,`orbFlow`,0,5,.01,`surface crawl`),r(f,n,`orbBands`,.5,15,.1,`filament scale`),r(f,n,`orbRim`,.2,6,.05,`rim falloff`),r(f,n,`orbGlow`,0,8,.01,`glow`),r(f,n,`orbOpacity`,0,2,.01,`opacity`),r(f,n,`intakeRate`,0,900,1,`intake rate`),r(f,n,`intakeRadius`,.2,8,.05,`intake radius`),r(f,n,`intakeSpeed`,.5,25,.1,`intake speed`),r(f,n,`chargeShake`,0,.5,.005,`wind-up rumble`);let p=t.addFolder(`What the floor does`);r(p,n,`scorchRate`,.05,8,.05,`burns / metre`),r(p,n,`scorchRadius`,.05,4,.05,`burn radius`),r(p,n,`scorchLife`,.5,20,.1,`burn lifetime`),r(p,n,`scorchIntensity`,0,2,.01,`burn intensity`),r(p,n,`dustRate`,0,20,.1,`dust rings / sec`),r(p,n,`dustRadius`,.2,10,.05,`dust ring radius`),r(p,n,`dustLife`,.1,5,.05,`dust ring lifetime`),r(p,n,`shockRate`,0,20,.1,`shock rings / sec`),r(p,n,`shockRadius`,.5,25,.1,`shockwave radius`),p.addColor(n,`colorScorch`).name(`scorch`),p.addColor(n,`colorEmber`).name(`ember`),p.addColor(n,`colorDustA`).name(`dust`),p.addColor(n,`colorDustB`).name(`dust crest`),p.addColor(n,`colorShockA`).name(`shockwave ring`),p.addColor(n,`colorShockB`).name(`shockwave crest`);let m=t.addFolder(`Sparks & motes`);r(m,n,`sparkRate`,0,1200,1,`spark rate`),r(m,n,`sparkSize`,.005,.8,.005,`spark size`),r(m,n,`sparkSpeed`,0,40,.1,`spark speed`),r(m,n,`sparkLifetime`,.05,4,.01,`spark lifetime`),r(m,n,`sparkGravity`,-50,5,.1,`spark gravity`),r(m,n,`sparkStretch`,0,3,.01,`spark stretch`),r(m,n,`sparkForward`,0,4,.01,`downrange drag`),r(m,n,`moteRate`,0,600,1,`mote rate`),r(m,n,`moteSize`,.005,.4,.005,`mote size`),r(m,n,`moteSpeed`,0,12,.05,`mote speed`),r(m,n,`moteLifetime`,.1,8,.05,`mote lifetime`),r(m,n,`moteRise`,-3,8,.05,`mote rise`),r(m,n,`moteTurbulence`,0,3,.01,`mote turbulence`),e.gradient(m,n,`colorSpark`,`Spark colour`),e.gradient(m,n,`colorMote`,`Mote colour`);let h=t.addFolder(`Steam & debris`);r(h,n,`smokeRate`,0,500,1,`steam rate`),r(h,n,`smokeSize`,.05,4,.01,`steam size`),r(h,n,`smokeSpeed`,0,8,.05,`steam speed`),r(h,n,`smokeLifetime`,.2,8,.05,`steam lifetime`),r(h,n,`smokeOpacity`,0,1,.005,`steam opacity`),r(h,n,`smokeRise`,-2,4,.01,`steam rise`),r(h,n,`debrisRate`,0,300,1,`debris rate`),r(h,n,`debrisSize`,.005,.4,.005,`debris size`),r(h,n,`debrisSpeed`,0,25,.1,`debris speed`),r(h,n,`debrisLifetime`,.1,5,.05,`debris lifetime`),r(h,n,`debrisGravity`,-50,0,.1,`debris gravity`),e.gradient(h,n,`colorSmoke`,`Steam colour`),e.gradient(h,n,`colorDebris`,`Debris colour`);let g=t.addFolder(`Release, impact & burn`);r(g,n,`muzzleSize`,.05,8,.05,`release shell`),r(g,n,`muzzleIntensity`,0,5,.01,`release intensity`),r(g,n,`castFlash`,0,2,.01,`flash on release`),g.addColor(n,`colorCastFlash`).name(`release flash colour`),r(g,n,`burstSize`,.2,18,.05,`impact shell`),r(g,n,`burstIntensity`,0,5,.01,`impact intensity`),r(g,n,`burstSparks`,0,800,1,`impact sparks`),r(g,n,`burstDebris`,0,400,1,`impact debris`),r(g,n,`pulseRate`,0,12,.1,`burn shells / sec`),r(g,n,`pulseSize`,.1,10,.05,`burn shell size`),r(g,n,`pulseIntensity`,0,5,.01,`burn shell intensity`),r(g,n,`splashRate`,0,900,1,`back-splash rate`),r(g,n,`impactShake`,0,3,.01,`shake`),r(g,n,`shakeDuration`,.1,4,.01,`shake duration`),r(g,n,`impactFlash`,0,2,.01,`screen flash`),r(g,n,`rumble`,0,.5,.005,`travel rumble`),r(g,n,`burnShake`,0,.5,.005,`burn rumble`),g.addColor(n,`colorBurstA`).name(`impact shell`),g.addColor(n,`colorBurstB`).name(`impact body`),g.addColor(n,`colorBurstC`).name(`impact arcs`),g.addColor(n,`colorFlash`).name(`impact flash colour`);let _=t.addFolder(`Dynamic light`);r(_,n,`lightIntensity`,0,120,.5,`beam intensity`),r(_,n,`lightRadius`,.5,60,.1,`beam radius`),r(_,n,`lightPulse`,0,1,.01,`hum depth`),r(_,n,`lightPulseSpeed`,0,30,.1,`hum rate`),r(_,n,`muzzleLightIntensity`,0,120,.5,`hand intensity`),r(_,n,`muzzleLightRadius`,.5,40,.1,`hand radius`),_.addColor(n,`lightColor`).name(`light colour`),this.beamFolder=t}_buildSnare(){let t=this.gui.addFolder(`◈  Voltaic Snare`),n=x.snare,r=e.range,i=t.addFolder(`The cast`);r(i,n,`zoneRadius`,.5,14,.05,`footprint radius`),r(i,n,`range`,2,50,.1,`max range`),r(i,n,`minRange`,0,10,.1,`min range`),r(i,n,`speed`,5,300,1,`leash speed`),r(i,n,`snapTime`,.02,1.5,.01,`snap-open time`),r(i,n,`lifetime`,.1,12,.05,`hold time`),r(i,n,`fadeTime`,.05,4,.01,`collapse time`),r(i,n,`cooldown`,0,8,.05,`cooldown`),e.castAnimation(i,n);let a=t.addFolder(`The leash`);r(a,n,`handHeight`,0,3,.01,`hand height`),r(a,n,`handForward`,-1,3,.01,`hand forward`),r(a,n,`handSide`,-1.5,1.5,.01,`hand lateral`),r(a,n,`leashStrands`,0,6,1,`filaments`),r(a,n,`leashSag`,-3,3,.01,`mid-span bow`),r(a,n,`leashSpread`,0,2,.01,`fan`),r(a,n,`leashCling`,0,1.5,.01,`height at the tip`),r(a,n,`leashKink`,0,2,.01,`kink amplitude`),r(a,n,`leashWidth`,.1,4,.01,`ribbon width`);let o=t.addFolder(`The column`);r(o,n,`strands`,0,16,1,`filaments`),r(o,n,`height`,.5,24,.1,`height`),r(o,n,`heightCurve`,.1,4,.01,`climb curve`),r(o,n,`throat`,.005,1,.005,`throat, × footprint`),r(o,n,`columnSpread`,.01,1,.005,`top, × footprint`),r(o,n,`columnCurve`,.1,5,.01,`opening curve`),r(o,n,`columnFlare`,0,1,.005,`top flare`),r(o,n,`columnTwist`,-4,4,.01,`twist over height`),r(o,n,`columnSpin`,-4,4,.01,`spin`),r(o,n,`columnKink`,0,2,.01,`kink amplitude`),r(o,n,`columnWidth`,.1,6,.01,`ribbon width`),r(o,n,`columnTaper`,.05,2,.01,`taper to the top`);let s=t.addFolder(`The tendrils`);r(s,n,`tendrils`,0,20,1,`tendrils`),r(s,n,`tendrilInner`,0,1,.005,`start, × footprint`),r(s,n,`tendrilReach`,.05,1.6,.01,`end, × footprint`),r(s,n,`tendrilCurve`,.1,4,.01,`reach curve`),r(s,n,`tendrilWander`,0,4,.01,`veer`),r(s,n,`tendrilArch`,0,3,.01,`hop off the floor`),r(s,n,`tendrilHug`,.005,1,.005,`floor clearance`),r(s,n,`tendrilSpin`,-2,2,.005,`fan rotation`),r(s,n,`tendrilKink`,0,2,.01,`kink amplitude`),r(s,n,`tendrilWidth`,.05,4,.01,`ribbon width`),r(s,n,`tendrilDim`,0,1,.01,`dim vs the column`);let c=t.addFolder(`The rim arcs`);r(c,n,`rimArcs`,0,14,1,`arcs`),r(c,n,`rimSpan`,.01,1,.005,`arc span, × the circle`),r(c,n,`rimSpeed`,-3,3,.01,`travel speed`),r(c,n,`rimHeight`,0,3,.01,`hop height`),r(c,n,`rimJitter`,0,1,.01,`radial wobble`),r(c,n,`rimKink`,0,2,.01,`kink amplitude`),r(c,n,`rimWidth`,.05,4,.01,`ribbon width`),r(c,n,`rimDim`,0,1,.01,`dim vs the column`);let l=t.addFolder(`Filaments & flicker`);r(l,n,`jitter`,0,4,.01,`kink master`),r(l,n,`jitterScale`,.05,8,.01,`kinks / metre`),r(l,n,`octaves`,1,5,1,`octaves`),r(l,n,`jitterFalloff`,.1,.95,.01,`octave falloff`),r(l,n,`crawl`,-20,20,.1,`kink crawl`),r(l,n,`pinch`,.01,.5,.005,`end pinch`),r(l,n,`restrike`,.5,90,.5,`restrikes / sec`),r(l,n,`flicker`,0,1,.01,`brightness stutter`),r(l,n,`flickerSpeed`,1,120,1,`stutter rate`),r(l,n,`strandFlash`,0,1,.01,`filament blink`);let u=t.addFolder(`The ribbon & colour`);r(u,n,`width`,.005,.4,.001,`filament width`),r(u,n,`coreSharp`,.5,12,.05,`core sharpness`),r(u,n,`glowWidth`,1,30,.1,`halo width`),r(u,n,`glowFalloff`,.2,8,.05,`halo falloff`),r(u,n,`glowOpacity`,0,2,.01,`halo opacity`),r(u,n,`softFade`,.02,3,.01,`soft intersection`),r(u,n,`glow`,0,8,.01,`glow`),r(u,n,`opacity`,0,2,.01,`opacity`),u.addColor(n,`colorCore`).name(`core`),u.addColor(n,`colorInner`).name(`inner`),u.addColor(n,`colorOuter`).name(`outer`),u.addColor(n,`colorHalo`).name(`halo`);let d=t.addFolder(`The field on the floor`);r(d,n,`fieldBoundary`,.02,2,.01,`band thickness`),r(d,n,`fieldBoundaryGlow`,0,8,.05,`band glow`),r(d,n,`fieldFill`,0,2,.01,`interior fill`),r(d,n,`fieldFalloff`,.1,5,.05,`fill falloff`),r(d,n,`fieldVeins`,0,3,.01,`burnt veins`),r(d,n,`fieldVeinScale`,.1,8,.05,`veins / metre`),r(d,n,`fieldVeinSharp`,0,1,.01,`vein sharpness`),r(d,n,`fieldWarp`,0,2,.01,`domain warp`),r(d,n,`fieldCrawl`,-4,4,.01,`vein crawl`),r(d,n,`fieldRings`,0,12,.1,`pressure rings`),r(d,n,`fieldRingSpeed`,-6,6,.01,`ring speed`),r(d,n,`fieldSpokes`,0,96,1,`boundary ticks`),r(d,n,`fieldSpokeLength`,.05,3,.01,`tick length`),r(d,n,`fieldSpin`,-2,2,.005,`tick spin`),r(d,n,`fieldCore`,0,4,.01,`centre pool`),r(d,n,`fieldCoreSize`,.02,1,.005,`pool size, × footprint`),r(d,n,`fieldPulse`,0,1,.01,`pulse`),r(d,n,`fieldPulseSpeed`,0,10,.05,`pulse speed`),r(d,n,`fieldOpacity`,0,2,.01,`opacity`),r(d,n,`fieldHeight`,.005,.4,.005,`hover height`),d.addColor(n,`colorField`).name(`field`),d.addColor(n,`colorFieldEdge`).name(`band & pool`);let f=t.addFolder(`Burns on the ground`);r(f,n,`arcRate`,0,30,.1,`rim burns / sec`),r(f,n,`arcRadius`,.1,8,.05,`burn radius`),r(f,n,`arcLife`,.05,5,.05,`burn lifetime`),r(f,n,`arcIntensity`,0,3,.01,`burn intensity`),r(f,n,`arcBranches`,0,3,.01,`branch detail`),r(f,n,`trailRate`,.05,8,.05,`leash burns / metre`),r(f,n,`scorchRadius`,.05,8,.05,`scorch radius`),r(f,n,`scorchLife`,.5,20,.1,`scorch lifetime`),r(f,n,`scorchIntensity`,0,2,.01,`scorch intensity`),r(f,n,`shockRadius`,.5,25,.1,`shockwave radius`),r(f,n,`ringRate`,0,12,.1,`dust rings / sec`),f.addColor(n,`colorArc`).name(`burn`),f.addColor(n,`colorEmber`).name(`ember`),f.addColor(n,`colorScorch`).name(`scorch`),f.addColor(n,`colorShockA`).name(`shockwave ring`),f.addColor(n,`colorShockB`).name(`shockwave crest`);let p=t.addFolder(`Sparks & updraft`);r(p,n,`sparkRate`,0,1200,1,`spark rate`),r(p,n,`sparkSize`,.005,.8,.005,`spark size`),r(p,n,`sparkSpeed`,0,40,.1,`spark speed`),r(p,n,`sparkLifetime`,.05,4,.01,`spark lifetime`),r(p,n,`sparkGravity`,-50,5,.1,`spark gravity`),r(p,n,`sparkStretch`,0,3,.01,`spark stretch`),r(p,n,`updraftRate`,0,900,1,`updraft rate`),r(p,n,`updraftSize`,.005,.4,.005,`updraft size`),r(p,n,`updraftSpeed`,0,25,.1,`pull-in speed`),r(p,n,`updraftLifetime`,.1,8,.05,`updraft lifetime`),r(p,n,`updraftRise`,-5,25,.1,`lift`),r(p,n,`updraftInset`,0,.95,.01,`pick-up inset`),r(p,n,`updraftTurbulence`,0,3,.01,`updraft swirl`),e.gradient(p,n,`colorSpark`,`Spark colour`),e.gradient(p,n,`colorUpdraft`,`Updraft colour`);let m=t.addFolder(`Smoke & debris`);r(m,n,`smokeRate`,0,500,1,`smoke rate`),r(m,n,`smokeSize`,.05,4,.01,`smoke size`),r(m,n,`smokeSpeed`,0,8,.05,`smoke speed`),r(m,n,`smokeLifetime`,.2,8,.05,`smoke lifetime`),r(m,n,`smokeOpacity`,0,1,.005,`smoke opacity`),r(m,n,`smokeRise`,-2,4,.01,`smoke rise`),r(m,n,`debrisRate`,0,300,1,`debris rate`),r(m,n,`debrisSize`,.005,.4,.005,`debris size`),r(m,n,`debrisSpeed`,0,25,.1,`debris speed`),r(m,n,`debrisLifetime`,.1,5,.05,`debris lifetime`),r(m,n,`debrisGravity`,-50,0,.1,`debris gravity`),e.gradient(m,n,`colorSmoke`,`Smoke colour`),e.gradient(m,n,`colorDebris`,`Debris colour`);let h=t.addFolder(`Throw, snap & hold`);r(h,n,`muzzleSize`,.05,6,.05,`muzzle size`),r(h,n,`muzzleIntensity`,0,5,.01,`muzzle intensity`),r(h,n,`castFlash`,0,2,.01,`flash on release`),r(h,n,`burstSize`,.2,14,.05,`snap shell size`),r(h,n,`burstIntensity`,0,5,.01,`snap shell intensity`),r(h,n,`burstSparks`,0,600,1,`snap sparks`),r(h,n,`burstDebris`,0,300,1,`snap debris`),r(h,n,`pulseRate`,0,12,.1,`hold shells / sec`),r(h,n,`pulseSize`,.1,10,.05,`hold shell size`),r(h,n,`pulseIntensity`,0,5,.01,`hold shell intensity`),r(h,n,`impactShake`,0,3,.01,`shake`),r(h,n,`shakeDuration`,.1,4,.01,`shake duration`),r(h,n,`holdShake`,0,.5,.005,`hold rumble`),r(h,n,`impactFlash`,0,2,.01,`screen flash`),r(h,n,`rumble`,0,.5,.005,`travel rumble`),h.addColor(n,`colorCastFlash`).name(`release flash colour`),h.addColor(n,`colorBurstA`).name(`shell`),h.addColor(n,`colorBurstB`).name(`shell body`),h.addColor(n,`colorBurstC`).name(`shell arcs`),h.addColor(n,`colorFlash`).name(`snap flash colour`);let g=t.addFolder(`Dynamic light`);r(g,n,`lightIntensity`,0,120,.5,`light intensity`),r(g,n,`lightRadius`,.5,50,.1,`light radius`),r(g,n,`lightHeight`,0,1,.01,`height up the column`),r(g,n,`lightFlicker`,0,1,.01,`light gutter`),r(g,n,`lightFlickerSpeed`,1,90,1,`gutter rate`),g.addColor(n,`lightColor`).name(`light colour`),this.snareFolder=t}_buildGlacier(){let t=this.gui.addFolder(`❆  Glacial Crown`),n=x.glacier,r=e.range,i=t.addFolder(`The cast`);r(i,n,`zoneRadius`,.5,14,.05,`footprint radius`),r(i,n,`range`,2,50,.1,`max range`),r(i,n,`minRange`,0,10,.1,`min range`),r(i,n,`speed`,5,200,1,`front speed`),r(i,n,`snapTime`,.02,1.5,.01,`freeze-out time`),r(i,n,`lifetime`,.2,14,.05,`hold time`),r(i,n,`shatterDelay`,0,4,.01,`delay before it breaks`),r(i,n,`shatterStagger`,0,3,.01,`break stagger`),r(i,n,`sinkTime`,.05,5,.01,`crumble time`),r(i,n,`cooldown`,0,8,.05,`cooldown`),e.castAnimation(i,n);let a=t.addFolder(`Where the front leaves the hand`);r(a,n,`handHeight`,0,3,.01,`hand height`),r(a,n,`handForward`,-1,3,.01,`hand forward`),r(a,n,`handSide`,-1.5,1.5,.01,`hand lateral`),r(a,n,`muzzleSize`,.05,6,.05,`muzzle size`),r(a,n,`muzzleIntensity`,0,5,.01,`muzzle intensity`),r(a,n,`castFlash`,0,2,.01,`flash on release`),a.addColor(n,`colorCastFlash`).name(`release flash colour`);let o=t.addFolder(`Filling the footprint`);r(o,n,`spikeCount`,1,320,1,`shards`),r(o,n,`density`,.1,2,.01,`density`),r(o,n,`ringShare`,0,1,.01,`share on the wall`),r(o,n,`coreShare`,0,.5,.01,`share on the spire`),r(o,n,`lateShare`,0,.5,.01,`share held back`),r(o,n,`ringSeat`,.2,1.4,.01,`wall seat, × footprint`),r(o,n,`ringScatter`,0,.6,.005,`wall jitter, × footprint`),r(o,n,`skirtSeat`,0,1.4,.01,`skirt inner lip, × footprint`),r(o,n,`skirtBand`,.02,1.4,.01,`skirt width, × footprint`),r(o,n,`skirtBias`,.2,3,.01,`skirt crowding`),r(o,n,`coreSpread`,.01,.6,.005,`spire cluster, × footprint`);let s=t.addFolder(`Silhouette`);r(s,n,`ringHeight`,.2,12,.05,`wall height`),r(s,n,`ringWave`,0,1,.01,`crest unevenness`),r(s,n,`skirtHeight`,.05,6,.05,`skirt height`),r(s,n,`coreHeight`,.2,12,.05,`spire height`),r(s,n,`heightJitter`,0,1.5,.01,`height jitter`),r(s,n,`ringLean`,-1.5,1.5,.01,`wall lean (0 = a fence)`),r(s,n,`skirtLean`,-1.5,1.5,.01,`skirt lean`),r(s,n,`coreLean`,-1.5,1.5,.01,`spire lean`),r(s,n,`leanJitter`,0,3,.01,`lean jitter`),r(s,n,`fan`,0,1.6,.01,`splay off the radius`),r(s,n,`twist`,0,1,.01,`random yaw`),r(s,n,`rubble`,0,1,.01,`rubble fraction`),r(s,n,`rubbleScale`,.05,1,.01,`rubble height`);let c=t.addFolder(`The crystal`);r(c,n,`radius`,.05,1.2,.005,`base radius`),r(c,n,`radiusJitter`,0,1.5,.01,`radius jitter`),r(c,n,`taper`,.01,.9,.01,`tip taper`),r(c,n,`facets`,3,12,1,`facets`),r(c,n,`roughness`,0,1,.01,`facet roughness`),r(c,n,`bend`,0,1.5,.01,`bend`);let l=t.addFolder(`The bloom`);r(l,n,`sweepTime`,0,3,.01,`sweep around the ring`),r(l,n,`skirtDelay`,0,2,.01,`skirt delay`),r(l,n,`skirtWave`,0,2,.01,`skirt wave`),r(l,n,`coreDelay`,0,2,.01,`spire delay`),r(l,n,`stagger`,0,1,.005,`random stagger`),r(l,n,`bloomSpread`,0,1,.01,`late shards spread`),r(l,n,`riseTime`,.02,1.5,.01,`rise time`),r(l,n,`riseOvershoot`,0,1.5,.01,`punch overshoot`),r(l,n,`settle`,.05,2,.01,`settle`);let u=t.addFolder(`Prismatic glass`);r(u,n,`opacity`,0,1,.01,`opacity`),r(u,n,`body`,0,2,.01,`body (0 = pure edges)`),r(u,n,`edgePower`,.5,8,.01,`edge tightness`),r(u,n,`edgeGain`,0,6,.01,`edge gain`),r(u,n,`dispersion`,0,1,.01,`chromatic split`),r(u,n,`pipe`,0,5,.01,`piped light`),r(u,n,`tipBias`,.2,6,.01,`crowding to the point`),r(u,n,`bands`,0,8,.05,`travelling bands`),r(u,n,`pulseSpeed`,-4,4,.01,`band speed`),r(u,n,`tipStart`,0,1,.01,`tip start`),r(u,n,`tipGlow`,0,6,.01,`tip glow`),r(u,n,`stria`,0,3,.01,`flow lines`),r(u,n,`striaScale`,.5,24,.1,`flow line scale`),r(u,n,`envIntensity`,0,3,.01,`env reflection`),r(u,n,`specular`,0,8,.05,`sun glint`),r(u,n,`glow`,0,4,.01,`glow`),r(u,n,`birthGlow`,0,6,.01,`birth flash`),r(u,n,`birthFade`,.02,3,.01,`birth fade`),u.addColor(n,`colorGlass`).name(`body`),u.addColor(n,`colorEdge`).name(`edge & glint`),u.addColor(n,`colorPrismA`).name(`dispersion A`),u.addColor(n,`colorPrismB`).name(`dispersion B`),u.addColor(n,`colorCore`).name(`piped light`),u.addColor(n,`colorTip`).name(`tip`);let d=t.addFolder(`Freeze front & shatter`);r(d,n,`frontRough`,0,1.5,.01,`front raggedness`),r(d,n,`frontWidth`,.01,.8,.01,`front width`),r(d,n,`frontGlow`,0,8,.05,`front glow`),r(d,n,`shatterScale`,1,24,.1,`break-up cells`),r(d,n,`shatterEdge`,.005,.4,.005,`break edge width`),r(d,n,`shatterGlow`,0,8,.05,`break glow`);let f=t.addFolder(`The sheet on the floor`);r(f,n,`fieldBoundary`,.02,2,.01,`band thickness`),r(f,n,`fieldBoundaryGlow`,0,8,.05,`band glow`),r(f,n,`fieldFill`,0,2,.01,`interior fill`),r(f,n,`fieldFalloff`,.1,5,.05,`fill falloff`),r(f,n,`fieldPlates`,0,3,.01,`plate break-up`),r(f,n,`fieldPlateScale`,.2,10,.05,`plates / metre`),r(f,n,`fieldSeam`,0,3,.01,`seam rime`),r(f,n,`fieldFingers`,0,3,.01,`frost fingers`),r(f,n,`fieldFingerScale`,.1,8,.05,`fingers / metre`),r(f,n,`fieldWarp`,0,2,.01,`domain warp`),r(f,n,`fieldCrawl`,-4,4,.01,`finger crawl`),r(f,n,`fieldRings`,0,12,.1,`pressure rings`),r(f,n,`fieldRingSpeed`,-6,6,.01,`ring speed`),r(f,n,`fieldSweep`,0,3,.01,`cold sweep`),r(f,n,`fieldSweepSpeed`,-2,2,.01,`sweep speed`),r(f,n,`fieldCore`,0,4,.01,`centre pool`),r(f,n,`fieldCoreSize`,.02,1,.005,`pool size, × footprint`),r(f,n,`fieldPulse`,0,1,.01,`pulse`),r(f,n,`fieldPulseSpeed`,0,10,.05,`pulse speed`),r(f,n,`fieldOpacity`,0,2,.01,`opacity`),r(f,n,`fieldHeight`,.005,.4,.005,`hover height`),f.addColor(n,`colorField`).name(`sheet`),f.addColor(n,`colorFieldEdge`).name(`band & seams`);let p=t.addFolder(`The curtain of cold`);r(p,n,`veil`,0,2,.01,`opacity (0 hides it)`),r(p,n,`veilHeight`,.1,8,.05,`height`),r(p,n,`veilRadius`,.5,1.6,.005,`seat, × footprint`),r(p,n,`veilFlare`,-.5,1.5,.01,`outward lean`),r(p,n,`veilBillow`,0,1.5,.01,`silhouette lobes`),r(p,n,`veilScale`,.1,6,.05,`noise / metre`),r(p,n,`veilStretch`,.05,3,.01,`vertical stretch`),r(p,n,`veilFlow`,-4,4,.01,`fall speed`),r(p,n,`veilErode`,0,1,.01,`erosion with height`),r(p,n,`veilFalloff`,.2,6,.05,`thinning with height`),r(p,n,`veilSpin`,-1,1,.005,`rotation`),r(p,n,`veilSoftFade`,.02,3,.01,`soft intersection`),p.addColor(n,`colorVeil`).name(`curtain`),p.addColor(n,`colorVeilCrest`).name(`crest`);let m=t.addFolder(`Rime`);r(m,n,`trailFrostRate`,.05,10,.05,`trail rime / metre`),r(m,n,`trailFrostRadius`,.05,6,.05,`trail rime radius`),r(m,n,`frostSpread`,.2,4,.05,`impact rime, × footprint`),r(m,n,`frostLife`,.5,20,.1,`rime lifetime`),r(m,n,`frostIntensity`,0,2,.01,`rime intensity`),r(m,n,`frostCrystals`,0,4,.01,`snow grain`),r(m,n,`frostCollar`,0,8,.05,`collar, × shard radius`),r(m,n,`rimeRate`,0,20,.1,`rim rime / sec`),r(m,n,`rimeRadius`,.05,6,.05,`rim rime radius`),r(m,n,`shockRadius`,.5,25,.1,`shockwave radius`),r(m,n,`ringRate`,0,12,.1,`pressure rings / sec`),m.addColor(n,`colorFrost`).name(`snow`),m.addColor(n,`colorFrostEdge`).name(`snow shadow`),m.addColor(n,`colorShockA`).name(`shockwave ring`),m.addColor(n,`colorShockB`).name(`shockwave crest`);let h=t.addFolder(`Mist, glitter & snow`);r(h,n,`mistRate`,0,900,1,`mist rate`),r(h,n,`mistSize`,.05,4,.01,`mist size`),r(h,n,`mistSpeed`,0,8,.05,`mist speed`),r(h,n,`mistLifetime`,.2,8,.05,`mist lifetime`),r(h,n,`mistOpacity`,0,1,.005,`mist opacity`),r(h,n,`mistRise`,-3,3,.01,`mist rise (− falls)`),r(h,n,`mistTurbulence`,0,3,.01,`mist swirl`),r(h,n,`glitterRate`,0,900,1,`glitter rate`),r(h,n,`glitterSize`,.005,.4,.005,`glitter size`),r(h,n,`glitterSpeed`,0,20,.1,`glitter speed`),r(h,n,`glitterLifetime`,.1,8,.05,`glitter lifetime`),r(h,n,`glitterRise`,-3,8,.01,`glitter lift`),r(h,n,`glitterTurbulence`,0,3,.01,`glitter swirl`),r(h,n,`glitterGlow`,0,4,.01,`glitter glow`),r(h,n,`snowRate`,0,600,1,`snow rate`),r(h,n,`snowSize`,.005,.4,.005,`snow size`),r(h,n,`snowSpeed`,0,10,.05,`initial push`),r(h,n,`snowLifetime`,.2,10,.05,`snow lifetime`),r(h,n,`snowFall`,-12,2,.05,`snow gravity`),r(h,n,`snowTurbulence`,0,3,.01,`snow drift`),r(h,n,`snowGlow`,0,4,.01,`snow glow`),r(h,n,`snowInset`,.05,1.4,.01,`fall inset, × footprint`),r(h,n,`snowHeight`,.2,4,.05,`fall height, × wall`),e.gradient(h,n,`colorMist`,`Mist colour`),e.gradient(h,n,`colorGlitter`,`Glitter colour`),e.gradient(h,n,`colorSnow`,`Snow colour`);let g=t.addFolder(`Ice chips`);r(g,n,`shardSize`,.005,.5,.005,`chip size`),r(g,n,`shardSpeed`,0,30,.1,`chip speed`),r(g,n,`shardLifetime`,.1,6,.05,`chip lifetime`),r(g,n,`shardGravity`,-50,0,.1,`chip gravity`),r(g,n,`breachShards`,0,30,1,`chips on breach`),r(g,n,`shatterShards`,0,30,1,`chips on break-up`),e.gradient(g,n,`colorShard`,`Chip colour`);let _=t.addFolder(`Bloom & hold`);r(_,n,`burstSize`,.2,14,.05,`vapour shell size`),r(_,n,`burstIntensity`,0,5,.01,`vapour shell intensity`),r(_,n,`burstShards`,0,600,1,`bloom chips`),r(_,n,`burstMist`,0,400,1,`bloom mist`),r(_,n,`burstGlitter`,0,600,1,`bloom glitter`),r(_,n,`vapourRate`,0,12,.05,`hold shells / sec`),r(_,n,`vapourSize`,.1,10,.05,`hold shell size`),r(_,n,`vapourIntensity`,0,5,.01,`hold shell intensity`),r(_,n,`impactShake`,0,3,.01,`shake`),r(_,n,`shakeDuration`,.1,4,.01,`shake duration`),r(_,n,`holdShake`,0,.5,.005,`hold rumble`),r(_,n,`impactFlash`,0,2,.01,`screen flash`),r(_,n,`rumble`,0,.5,.005,`travel rumble`),_.addColor(n,`colorBurstA`).name(`shell`),_.addColor(n,`colorBurstB`).name(`shell body`),_.addColor(n,`colorBurstC`).name(`shell plates`),_.addColor(n,`colorFlash`).name(`bloom flash colour`);let v=t.addFolder(`Dynamic light`);r(v,n,`lightIntensity`,0,120,.5,`light intensity`),r(v,n,`lightRadius`,.5,50,.1,`light radius`),r(v,n,`lightHeight`,0,1,.01,`height up the crown`),v.addColor(n,`lightColor`).name(`light colour`),this.glacierFolder=t}_buildKit(){let t=this.gui.addFolder(`Kit abilities`);for(let n of d){let r=b[n],i=t.addFolder(`${r.label} (${r.key})`);e.kitFolder(i,x[n])}}static kitFolder(t,n){let r=[`range`,`minRange`,`zoneRadius`,`speed`,`lifetime`,`fadeTime`,`cooldown`],i=[`colorA`,`colorB`,`colorC`,`glow`,`opacity`,`intensity`],a=/^(burst|shock|impact|shakeDuration|rumble|colorBurst|colorShock|colorFlash)/,o={fire:0,water:1,air:2,earth:3,frost:4,storm:5},s=e=>e[0].toUpperCase()+e.slice(1),c=Object.keys(n).filter(e=>e.endsWith(`Rate`)&&`${e.slice(0,-4)}Size`in n).map(e=>e.slice(0,-4)),l=new Set,u=(e,t)=>{let r=n[t],i=0,a=r===0?1:Math.abs(r)*3;(/Gravity$/.test(t)||r<0)&&(a=Math.max(20,Math.abs(r)*2),i=-a),t===`range`&&([i,a]=[2,40]),t===`minRange`&&([i,a]=[0,10]),t===`zoneRadius`&&([i,a]=[.5,12]),/Opacity$|^opacity$/.test(t)&&(a=Math.max(1,a));let o=Number.isInteger(r)&&r>=3&&!/(Rate|Size|Speed|Lifetime|Radius|Intensity|range)$/i.test(t);e.add(n,t,i,a,o?1:.01).name(t),l.add(t)},d=(e,t)=>{if(!(t in n)||l.has(t))return;let r=n[t];typeof r==`string`&&r.startsWith(`#`)?(e.addColor(n,t).name(t),l.add(t)):typeof r==`number`&&u(e,t)},f=t.addFolder(`The cast`);r.forEach(e=>d(f,e)),`castAnim`in n&&(e.castAnimation(f,n),l.add(`castAnim`));let p=t.addFolder(`Look`);i.forEach(e=>d(p,e));let m=t.addFolder(`Shape & motion`);for(let r of c){let i=t.addFolder(`Particles: ${r}`);[`Rate`,`Size`,`Speed`,`Lifetime`,`Gravity`,`Turbulence`,`Opacity`,`Swirl`].forEach(e=>d(i,`${r}${e}`));let a=s(r);`color${a}A`in n&&(e.gradient(i,n,`color${a}`,`colour over life`),[`A`,`B`,`C`,`D`].forEach(e=>l.add(`color${a}${e}`)))}let h=t.addFolder(`Light`);Object.keys(n).filter(e=>e.startsWith(`light`)).forEach(e=>d(h,e));let g=t.addFolder(`Impact`);`burstMode`in n&&(g.add(n,`burstMode`,o).name(`burst shell`),l.add(`burstMode`)),Object.keys(n).filter(e=>a.test(e)).forEach(e=>d(g,e)),Object.keys(n).forEach(e=>d(m,e))}_buildEnvironment(){let t=this.gui.addFolder(`Environment`),n=x.environment,r=e.range;r(t,n,`sunIntensity`,0,8,.01,`key intensity`),t.addColor(n,`sunColor`).name(`key colour`),r(t,n,`sunAzimuth`,0,Math.PI*2,.01,`key azimuth`),r(t,n,`sunElevation`,.05,1.5,.01,`key elevation`),r(t,n,`ambientIntensity`,0,3,.01,`ambient`),t.addColor(n,`ambientColor`).name(`ambient colour`),r(t,n,`hemiIntensity`,0,3,.01,`hemisphere`),r(t,n,`envIntensity`,0,3,.01,`env (IBL)`),r(t,n,`shadowRadius`,0,8,.05,`shadow softness`),r(t,n,`shadowBias`,-.01,.001,1e-4,`shadow bias`),r(t,n,`contactShadow`,0,1.5,.01,`contact shadow`);let i=t.addFolder(`Rim light`);r(i,n,`rimIntensity`,0,4,.01,`rim intensity`),i.addColor(n,`rimColor`).name(`rim colour`),r(i,n,`rimAzimuth`,0,Math.PI*2,.01,`rim azimuth`),r(i,n,`rimElevation`,.05,1.5,.01,`rim elevation`),i.addColor(n,`hemiSkyColor`).name(`hemi sky`),i.addColor(n,`hemiGroundColor`).name(`hemi bounce`);let a=t.addFolder(`Backdrop, fog & dust`);a.addColor(n,`backgroundColor`).name(`backdrop`),a.add(n,`fogEnabled`).name(`fog enabled`),a.addColor(n,`fogColor`).name(`fog colour`),r(a,n,`fogNear`,1,200,1,`fog near`),r(a,n,`fogFar`,10,400,1,`fog far`),r(a,n,`dustAmount`,0,3,.01,`floating dust`);let o=t.addFolder(`Stage floor`);o.add(n,`floorTexture`).name(`stone tile`),r(o,n,`floorTextureScale`,.5,24,.1,`tile size (m)`),r(o,n,`floorNormalScale`,0,3,.01,`relief strength`),r(o,n,`floorTexTint`,0,1,.01,`tint toward floor`),o.addColor(n,`floorColor`).name(`floor colour`),o.addColor(n,`floorTint`).name(`floor tint`),r(o,n,`floorRoughness`,.05,1,.01,`roughness`),r(o,n,`floorSheen`,0,1,.01,`sheen`),r(o,n,`floorPool`,0,1,.01,`light pool`)}_buildPost(){let t=this.gui.addFolder(`Post processing`),n=x.post,r=e.range;t.add(n,`enabled`).name(`enabled`),r(t,n,`exposure`,.1,3,.01,`exposure`),r(t,n,`bloomStrength`,0,3,.01,`bloom intensity`),r(t,n,`bloomRadius`,0,1.5,.01,`bloom radius`),r(t,n,`bloomThreshold`,0,2,.01,`bloom threshold`),r(t,n,`contrast`,.5,2,.01,`contrast`),r(t,n,`saturation`,0,2.5,.01,`saturation`),r(t,n,`temperature`,-.5,.5,.01,`temperature`),r(t,n,`lift`,-.2,.2,.005,`lift`),r(t,n,`gain`,.5,2,.01,`gain`),r(t,n,`vignette`,0,1.5,.01,`vignette`),r(t,n,`chromaticAberration`,0,3,.01,`chromatic aberration`),r(t,n,`grain`,0,.2,.001,`film grain`),r(t,n,`distortion`,0,.2,.001,`screen warp`),r(t,n,`flashStrength`,0,2,.01,`impact flash`)}_buildCamera(){let t=this.gui.addFolder(`Camera`),n=x.camera,r=e.range;r(t,n,`distance`,1,40,.1,`distance`).listen(),r(t,n,`minDistance`,1,20,.1,`min distance`),r(t,n,`maxDistance`,4,40,.1,`max distance`),r(t,n,`zoomSpeed`,.1,3,.01,`zoom speed`),r(t,n,`fov`,20,90,.5,`field of view`),r(t,n,`targetHeight`,0,4,.01,`target height`),r(t,n,`minPolar`,.05,1.5,.01,`min pitch`),r(t,n,`maxPolar`,.2,1.55,.01,`max pitch`),r(t,n,`damping`,.001,.5,.001,`follow damping`),r(t,n,`autoFrame`,0,1,.01,`auto framing`),t.add({clear:()=>this.hooks.onClear?.()},`clear`).name(`Clear effects (C)`)}_buildCharacter(){let t=this.gui.addFolder(`Character`),n=x.character,r=e.range;r(t,x.global,`animationSpeed`,.1,3,.01,`playback rate`).listen();let i=t.addFolder(`Casting`);r(i,n,`castBlendIn`,.01,1,.01,`blend into cast`),r(i,n,`castBlendOut`,.01,1.5,.01,`blend back to idle`),i.add(n,`turnToAim`).name(`turn to aim`),r(i,n,`turnRate`,1e-6,.02,1e-6,`turn follow`);let a=t.addFolder(`Lunge`);r(a,n,`castLean`,0,1.2,.01,`lunge lean`),r(a,n,`castRecoil`,0,.8,.005,`lunge recoil`),r(a,n,`castSettle`,.2,8,.05,`lunge settle`)}dispose(){this.gui.destroy()}},ct=`./hdri/spruit_sunrise.hdr`,lt=class{constructor(e){this.canvas=e,this.time=new s,this.elapsed=0,this.paused=!1,this._raf=0,this.cooldowns=new Map(n.map(e=>[e,0])),this.renderer=new u(e),this.rig=new Fe(e),this.camera=this.rig.camera,this.environment=new ue(this.renderer,this.camera),this.scene=this.environment.scene,this.ground=new h(this.environment),this.dust=new a,this.contactShadows=new o(this.renderer,{size:2.6,height:2.4,blur:2}),this.scene.add(this.ground.mesh,this.dust.points,this.contactShadows.group),this.dust.setPixelRatio(this.renderer.gl.getPixelRatio()),this.particles=new ye(this.scene),this.lights=new oe(this.scene),this.decals=new de(this.scene),this.fissures=new ie(this.scene),this.bursts=new ge(this.scene),this.shake=new re(this.rig),this.flash=new me,this.abilities=new le({scene:this.scene,camera:this.camera,environment:this.environment,particles:this.particles,lights:this.lights,decals:this.decals,fissures:this.fissures,bursts:this.bursts,shake:this.shake,flash:this.flash}),this.character=new ve(this.environment),this.scene.add(this.character.root),this.input=new Ie(e),this.aim=new Ke(this.camera),this.scene.add(this.aim.object3D),this.post=new pe(this.renderer,this.scene,this.camera),this.loading=new q,this.hud=new qe(document.getElementById(`hud`)),this.editor=new st({onClear:()=>this.clearEffects(),onToast:e=>this.hud.showToast(e)}),this._bindEvents(),this.selectAbility(n[0],{silent:!0}),this._focusPoint=new i}get element(){return this.abilities.selected}_bindEvents(){this.renderer.onResize((e,t,n)=>{this.rig.resize(e,t),this.post.setSize(e,t,n),this.dust.setPixelRatio(n)}),this.input.on(`pointer:move`,e=>this.aim.point(e)),this.input.on(`pointer:confirm`,e=>{this.aim.point(e),this.aim.confirm()}),this.input.on(`action`,(e,t)=>this._handleAction(e,t)),this.aim.on(`cast`,(e,t,n)=>this._cast(e,t,n)),this.aim.on(`reject`,()=>this.hud.showToast(`Too close — aim further out`)),this.hud.onAbility=e=>this.armAbility(e)}_handleAction(e,t){switch(e){case`ability`:{let e=n[t]??this.element;this.aim.isArmed&&e===this.element?this.aim.cancel():this.armAbility(e);break}case`cancel`:this.aim.cancel();break;case`toggleHelp`:this.hud.toggleHelp();break;case`toggleEditor`:this.editor.toggle();break;case`clear`:this.clearEffects(),this.hud.showToast(`Effects cleared`);break;case`togglePause`:this.paused=!this.paused,this.hud.setPaused(this.paused),this.hud.showToast(this.paused?`Paused — the editor still applies`:`Resumed`);break;default:break}}selectAbility(e,t={}){n.includes(e)&&(this.abilities.select(e),this.aim.setElement(e),this.hud.setElement(e,t))}armAbility(e=this.element){if((this.cooldowns.get(e)??0)>0){this.hud.showToast(`Not ready`);return}e!==this.element&&this.selectAbility(e),this.aim.arm()}_cast(e,t,n){let r=this.element;this.abilities.cast(e,t,n,r),this.cooldowns.set(r,Math.max(0,x[r].cooldown)),this.character.setFacing(this.aim.facing),this.character.playCast(x[r].castAnim),this.character.castLunge()}clearEffects(){this.aim.cancel(),this.abilities.clear(),this.particles.reset(),this.decals.clear(),this.fissures.clear(),this.bursts.clear(),this.lights.reset(),this.shake.reset(),this.flash.reset()}async load(){let e=new y;this.loading.setProgress(.05,`Loading environment…`);let t=await e.loadHDR(ct);await this.environment.loadEnvironment(t),m.uEnvMap.value=this.environment.equirect,this.loading.setProgress(.35,`Loading floor…`),await this.ground.loadTextures(e),this.loading.setProgress(.5,`Loading character…`),await this.character.load(e),this.loading.setProgress(.85,`Compiling shaders…`),await this.renderer.gl.compileAsync(this.scene,this.camera),this.loading.setProgress(1,`Ready`),this.loading.hide(),this.start()}start(){this.time.reset();let e=()=>{this._raf=requestAnimationFrame(e),this.frame()};this._raf=requestAnimationFrame(e)}stop(){cancelAnimationFrame(this._raf)}frame(){let e=this.renderer.gl;e.info.reset();let t=this.time.tick(),r=this.paused?0:t*x.global.timeScale;this.elapsed+=r,m.uTime.value=this.elapsed,m.uDelta.value=r,m.uShaderIntensity.value=x.global.shaderIntensity,m.uGlobalGlow.value=x.global.glow,m.uCameraNear.value=this.camera.near,m.uCameraFar.value=this.camera.far,this.renderer.syncSettings(),this.environment.setFocus(this.character.position.x,this.character.position.z),this.environment.update(),this.aim.setOrigin(this.character.position),this.aim.update(t),x.character.turnToAim&&this.aim.isArmed&&this.character.turnToward(this.aim.facing,x.character.turnRate,t),this.character.update(r);for(let[e,n]of this.cooldowns)n>0&&this.cooldowns.set(e,Math.max(0,n-t));this.ground.update(this.elapsed),this.dust.update(this.elapsed,this.character.position),this.abilities.update(r),this.particles.flush(),this.decals.update(r),this.fissures.update(r),this.bursts.update(r),this.lights.update(r);let i=this.abilities.focus;i&&this.rig.lookAt(i.position,k.clamp(1-i.u*.4,0,1)),this.rig.setAnchor(this.character.position.x,0,this.character.position.z),this.shake.update(t),this.flash.update(t),this.rig.update(t),this.contactShadows.setPosition(this.character.position.x,this.character.position.z),this.contactShadows.render(this.scene),e.shadowMap.needsUpdate=!0,this.post.sync(this.elapsed,this.flash),this.post.render();for(let e of n)this.hud.setCooldown(e,this.cooldowns.get(e)??0,x[e].cooldown);this.hud.setArmed(this.aim.isArmed),this.hud.update(t,()=>({particles:this.particles.countLive(this.elapsed),calls:e.info.render.calls,spikes:this.abilities.active.reduce((e,t)=>e+t.instanceCount,0),abilities:this.abilities.active.length}))}dispose(){this.stop(),this.input.dispose(),this.aim.dispose(),this.abilities.dispose(),this.particles.dispose(),this.decals.dispose(),this.fissures.dispose(),this.bursts.dispose(),this.lights.dispose(),this.character.dispose(),this.ground.dispose(),this.dust.dispose(),this.contactShadows.dispose(),this.post.dispose(),this.environment.dispose(),this.editor.dispose(),this.rig.dispose(),this.renderer.dispose()}},ut=document.getElementById(`viewport`);async function dt(){try{let e=new lt(ut);await e.load(),window.app=e}catch(e){console.error(`[boot] failed to start`,e),new q().fail(e?.message?`Failed to start: ${e.message}`:`Failed to start — see the console.`)}}dt();