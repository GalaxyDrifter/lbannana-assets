"use strict";class SpineBatch{constructor(){this._initialized=false
this._skeletonInstances={}
this._rendered=false
this._tickCount=-1
this._renderRate=1;this._spineGLCache=null;this._spineGLCacheStored=false;this._debugVariables={animationReduce:"disable",spineGLCache:"disable"};}
get rendered(){return this._rendered;}
get initialized(){return this._initialized;}
get tickCount(){return this._tickCount;}
set tickCount(tick){this._tickCount=tick;}
get renderRate(){return this._renderRate;}
set renderRate(renderRate){this._renderRate=renderRate;}
get debugVariables(){return this._debugVariables;}
init(canvas,runtime)
{const spine=globalThis.spine;if(this._initialized)return
this.runtime=runtime;this.canvas=canvas;this.gl=this.runtime.GetWebGLRenderer()._gl;const gl=this.gl;let version=0;this.isWebGL2=false;let glVersion=gl.getParameter(gl.VERSION);if(glVersion.indexOf('WebGL')!==-1)
{version=parseFloat(/^WebGL\ ([0-9])/.exec(glVersion)[1]);this.isWebGL2=(version>=2.0);}else if(glVersion.indexOf('OpenGL ES')!==-1)
{version=parseFloat(/^OpenGL\ ES\ ([0-9])/.exec(glVersion)[1]);this.isWebGL2=(version>=3.0);}
if(this.isWebGL2)
{this.myVAO=gl.createVertexArray();}else
{let extOESVAO=gl.getExtension("OES_vertex_array_object");if(!extOESVAO)
{console.error("Spine plugin error: webGL1 with no OES_vertex_array_object support");return;}
this.myVAO=extOESVAO.createVertexArrayOES();}
this.mvp=new spine.webgl.Matrix4();this.shader=spine.webgl.Shader.newTwoColoredTextured(gl);this.batcher=new spine.webgl.PolygonBatcher(gl);this.renderer=new spine.webgl.SkeletonRenderer(gl);this.shapes=new spine.webgl.ShapeRenderer(gl);this._initialized=true;this._spineGLCache=new globalThis.SpineGLCache(this.isWebGL2,gl);}
addInstance(instance,skeletonScale,uid)
{this._skeletonInstances[uid]={}
this._skeletonInstances[uid].skeletonInfo=instance
this._skeletonInstances[uid].initialized=false
this._skeletonInstances[uid].skeletonScale=skeletonScale
this._skeletonInstances[uid].onScreen=true
this._skeletonInstances[uid].tracksComplete=false
this._skeletonInstances[uid].renderOnce=true}
removeInstance(uid)
{if(!this._skeletonInstances[uid])return
delete this._skeletonInstances[uid]}
setInstanceInitialized(uid)
{if(!this._skeletonInstances[uid])return
this._skeletonInstances[uid].initialized=true}
setInstanceFB(spineFB,uid)
{if(!this._skeletonInstances[uid])return
this._skeletonInstances[uid].spineFB=spineFB}
setInstanceOnScreen(onScreen,uid)
{if(!this._skeletonInstances[uid])return
this._skeletonInstances[uid].onScreen=onScreen;}
setInstanceTracksComplete(tracksComplete,uid)
{if(!this._skeletonInstances[uid])return
if(!this._skeletonInstances[uid].tracksComplete&&tracksComplete)
{this._skeletonInstances[uid].renderOnce=true}
this._skeletonInstances[uid].tracksComplete=tracksComplete;}
setInstanceRenderOnce(renderOnce,uid)
{if(!this._skeletonInstances[uid])return
this._skeletonInstances[uid].renderOnce=renderOnce;}
resize(bounds,skeletonScale){var centerX=bounds.offset.x+(bounds.size.x)/2;var centerY=bounds.offset.y+(bounds.size.y)/2;var scaleX=bounds.size.x/(bounds.size.x);var scaleY=bounds.size.y/(bounds.size.y);var scale=Math.max(scaleX,scaleY)*(1/skeletonScale);if(scale<1)scale=1;var width=(bounds.size.x)*scale;var height=(bounds.size.y)*scale;this.mvp.ortho2d(centerX-width/2,centerY-height/2,width,height);}
drawBatch(){const spine=globalThis.spine;const gl=this.gl;const skeletonInstances=this._skeletonInstances;if(!this._spineGLCacheStored||!(this._debugVariables.spineGLCache==="enable"))
{this._spineGLCache.store();this._spineGLCacheStored=true;}
if(this.isWebGL2)
{gl.bindVertexArray(this.myVAO);}else
{let extOESVAO=gl.getExtension("OES_vertex_array_object");extOESVAO.bindVertexArrayOES(this.myVAO);}
let tickCount=this.runtime.GetTickCount();let index=0;let count=0;for(const uid in skeletonInstances)
{const skeletonInstance=skeletonInstances[uid];if(skeletonInstance.initialized&&(tickCount%this._renderRate==index%this._renderRate)&&(skeletonInstance.renderOnce||(!skeletonInstance.tracksComplete&&skeletonInstance.onScreen))){count++;const bounds=skeletonInstance.skeletonInfo.bounds;const premultipliedAlpha=skeletonInstance.skeletonInfo.premultipliedAlpha;gl.bindFramebuffer(gl.FRAMEBUFFER,skeletonInstance.spineFB);gl.viewport(0,0,bounds.size.x,bounds.size.y);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindTexture(gl.TEXTURE_2D,null);gl.bindBuffer(gl.ARRAY_BUFFER,null);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);this.shader.bind();this.shader.setUniformi(spine.webgl.Shader.SAMPLER,0);this.resize(bounds,skeletonInstance.skeletonScale);this.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX,this.mvp.values);this.batcher.begin(this.shader);this.renderer.vertexEffect=null;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);this.renderer.premultipliedAlpha=premultipliedAlpha;this.renderer.draw(this.batcher,skeletonInstance.skeletonInfo.skeleton);this.batcher.end();this.shader.unbind();}
index++;}
this._rendered=true;this._spineGLCache.restore();}
getRValue(rgb)
{const ALPHAEX_SHIFT=1024;const ALPHAEX_MAX=1023;const RGBEX_SHIFT=16384;const RGBEX_MAX=8191;const RGBEX_MIN=-8192;if(rgb>=0)return(rgb&255)/255;else{let v=Math.floor(-rgb/(RGBEX_SHIFT*RGBEX_SHIFT*ALPHAEX_SHIFT));if(v>RGBEX_MAX)v-=RGBEX_SHIFT;return v/1024;}};getGValue(rgb)
{const ALPHAEX_SHIFT=1024;const ALPHAEX_MAX=1023;const RGBEX_SHIFT=16384;const RGBEX_MAX=8191;const RGBEX_MIN=-8192;if(rgb>=0)return((rgb&65280)>>8)/255;else{let v=Math.floor((-rgb%(RGBEX_SHIFT*RGBEX_SHIFT*ALPHAEX_SHIFT))/(RGBEX_SHIFT*ALPHAEX_SHIFT));if(v>RGBEX_MAX)v-=RGBEX_SHIFT;return v/1024;}};getBValue(rgb)
{const ALPHAEX_SHIFT=1024;const ALPHAEX_MAX=1023;const RGBEX_SHIFT=16384;const RGBEX_MAX=8191;const RGBEX_MIN=-8192;if(rgb>=0)return((rgb&16711680)>>16)/255;else{let v=Math.floor((-rgb%(RGBEX_SHIFT*ALPHAEX_SHIFT))/ALPHAEX_SHIFT);if(v>RGBEX_MAX)v-=RGBEX_SHIFT;return v/1024;}};getAValue(rgb)
{const ALPHAEX_SHIFT=1024;const ALPHAEX_MAX=1023;const RGBEX_SHIFT=16384;const RGBEX_MAX=8191;const RGBEX_MIN=-8192;if(rgb===0&&1/rgb<0)return 0;else if(rgb>=0)return 1;else{const v=Math.floor(-rgb%ALPHAEX_SHIFT);return v/ALPHAEX_MAX;}};}
if(!globalThis.spineBatcher)
{console.log('[Spine] SpineBatcher init, 1.36.5');globalThis.spineBatcher=new SpineBatch();}
