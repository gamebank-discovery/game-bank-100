
'use strict';
const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl',{antialias:true,alpha:false});
if(!gl){document.querySelector('#error').style.display='block';document.querySelector('#error').textContent='3D表示を利用できません。SafariまたはChromeで開いてください。';throw Error('WebGL unavailable')}
const vs=`attribute vec3 aPosition;attribute vec3 aColor;attribute vec3 aNormal;uniform mat4 uVP;varying vec3 vColor;varying vec3 vNormal;varying vec3 vWorld;void main(){gl_Position=uVP*vec4(aPosition,1.);vColor=aColor;vNormal=aNormal;vWorld=aPosition;}`;
const fs=`precision mediump float;uniform float uAlpha;uniform float uTime;uniform float uStudio;uniform float uTheme;uniform vec3 uCamera;varying vec3 vColor;varying vec3 vNormal;varying vec3 vWorld;void main(){vec3 n=normalize(vNormal);vec3 v=normalize(uCamera-vWorld);if(dot(n,v)<0.)n=-n;vec3 l=normalize(vec3(-.55,.95,-.35));float ndl=max(0.,dot(n,l));float hemi=.5+.5*n.y;vec3 light=vec3(.40,.48,.55)+vec3(.70,.63,.47)*ndl+vec3(.13,.17,.20)*hemi;float brightness=max(vColor.r,max(vColor.g,vColor.b));float chroma=brightness-min(vColor.r,min(vColor.g,vColor.b));float coat=smoothstep(.17,.45,chroma);float glass=1.-smoothstep(.17,.30,brightness);float metal=(1.-smoothstep(.05,.22,chroma))*smoothstep(.4,.8,brightness);vec3 h=normalize(l+v);float spec=pow(max(0.,dot(n,h)),mix(14.,100.,glass))*(.06+coat*.4+glass*.65+metal*.5);float fresnel=pow(1.-max(0.,dot(n,v)),3.);vec3 sky=mix(vec3(.70,.83,.86),vec3(.18,.45,.69),clamp(reflect(-v,n).y*.5+.5,0.,1.));vec3 base=vColor;if(abs(vWorld.x)>4.3&&vColor.g>vColor.r*1.12&&vColor.g>vColor.b*1.1){if(uTheme>.5&&uTheme<1.5)base=mix(vColor,vec3(.60,.32,.18),.66);if(uTheme>1.5)base=mix(vColor,vec3(.80,.88,.90),.75);}vec3 c=base*light+vec3(1.,.91,.72)*spec+sky*fresnel*(coat*.18+glass*.45+metal*.18);if(uStudio>.5){c=vColor*(.64+ndl*.65)+vec3(.74,.89,1.)*spec+vec3(.20,.44,.59)*fresnel*(.12+coat*.3);}if(vColor.b>.64&&vColor.g>.59&&vColor.r<.37&&vWorld.y<.2){float wave=sin(vWorld.x*1.4+uTime*1.1)+sin(vWorld.z*2.1-uTime*.8);c=mix(vec3(.11,.48,.56),vec3(.48,.81,.81),.5+wave*.13)+vec3(.32,.36,.29)*pow(max(0.,wave*.5),10.);}float fog=1.-exp(-max(0.,distance(vWorld,uCamera)-53.)*.0064);if(uStudio>.5)fog=0.;vec3 fogColor=uTheme>1.5?vec3(.75,.85,.91):uTheme>.5?vec3(.87,.72,.64):vec3(.79,.84,.82);c=mix(c,fogColor,min(fog,.95));c=c/(c+vec3(.20))*.99;gl_FragColor=vec4(c,uAlpha);}`;
function shader(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh}
const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error('Shader link failed');gl.useProgram(prog);const uAlpha=gl.getUniformLocation(prog,'uAlpha');gl.uniform1f(uAlpha,1);const uTime=gl.getUniformLocation(prog,'uTime'),uStudio=gl.getUniformLocation(prog,'uStudio'),uTheme=gl.getUniformLocation(prog,'uTheme');
let verts=[],wheelTurn=0;function tri(a,b,c,col,k=1){const ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]);let n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],len=Math.hypot(...n)||1;n=n.map(v=>v/len);const tint=.86+.14*k;for(const p of[a,b,c])verts.push(...p,col[0]*tint,col[1]*tint,col[2]*tint,...n)}
function quad(a,b,c,d,col,k=1){tri(a,b,c,col,k);tri(a,c,d,col,k)}
function box(x,y,z,w,h,d,col,pitch=0){const co=Math.cos(pitch),si=Math.sin(pitch);const p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([a,b,c])=>[x+a*w/2,y+b*h/2*co-c*d/2*si,z+b*h/2*si+c*d/2*co]);[[0,1,2,3,.68],[4,7,6,5,.85],[0,4,5,1,.5],[3,2,6,7,1.12],[1,5,6,2,.9],[0,3,7,4,.74]].forEach(([a,b,c,d,k])=>quad(p[a],p[b],p[c],p[d],col,k))}
function cone(x,y,z,r,h,col,n=7){for(let i=0;i<n;i++){let a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;tri([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x,y+h,z],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],col,.76+.24*Math.cos(a-1))}}
function wheel(x,y,z){const n=24,r=.41;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;quad([x-.17,y+Math.cos(a)*r,z+Math.sin(a)*r],[x+.17,y+Math.cos(a)*r,z+Math.sin(a)*r],[x+.17,y+Math.cos(b)*r,z+Math.sin(b)*r],[x-.17,y+Math.cos(b)*r,z+Math.sin(b)*r],[.045,.057,.065]);for(const side of[-1,1]){const face=x+side*.176;tri([face,y,z],[face,y+Math.cos(a)*r,z+Math.sin(a)*r],[face,y+Math.cos(b)*r,z+Math.sin(b)*r],[.075,.09,.10]);tri([face+side*.002,y,z],[face+side*.002,y+Math.cos(a)*r*.74,z+Math.sin(a)*r*.74],[face+side*.002,y+Math.cos(b)*r*.74,z+Math.sin(b)*r*.74],[.16,.20,.22]);}if(i%4===0){for(const side of[-1,1]){const f=x+side*.182,aa=a+wheelTurn,bb=aa+.13;quad([f,y+Math.cos(aa)*.07,z+Math.sin(aa)*.07],[f,y+Math.cos(aa)*.29,z+Math.sin(aa)*.29],[f,y+Math.cos(bb)*.29,z+Math.sin(bb)*.29],[f,y+Math.cos(bb)*.07,z+Math.sin(bb)*.07],[.74,.80,.84])}}}for(const side of[-1,1])box(x+side*.19,y,z,.015,.10,.10,[.79,.57,.23])}

function mul(a,b){let o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o}
function norm(a){let l=Math.hypot(...a);return a.map(v=>v/l)}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function dot(a,b){return a.reduce((s,v,i)=>s+v*b[i],0)}
function camera(eye,target,aspect){let z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);let v=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1],f=1/Math.tan(.85/2),near=.2,far=700;return mul([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],v)}
const green=[.45,.69,.29],road=[.28,.32,.33],white=[.90,.89,.76];
function roadY(z){return z<80?0:(z<=110?(z-80)*.35:0)}
let seed=192;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function terrainH(x,z){
  const ax=Math.abs(x),edge=Math.max(0,ax-10);
  const q=Math.min(1,edge/30),fade=q*q*(3-2*q);
  const sweep=8.5+2.2*Math.sin(z*.0058+ax*.009)+1.7*Math.sin(z*.014-ax*.008);
  const base=Math.pow(edge/110,1.22)*sweep;
  const valley=10.5*Math.exp(-Math.pow((ax-79)/38,2))*(.81+.19*Math.sin(z*.009+ax*.012));
  const high=18.5*Math.exp(-Math.pow((ax-156)/56,2))*(.80+.20*Math.sin(z*.0075-ax*.011));
  const horizon=10.7*Math.exp(-Math.pow((ax-239)/52,2))*(.80+.20*Math.sin(z*.006+ax*.008));
  return -.16+fade*(base+valley+high+horizon);
}
function terrainSample(x,z){
  const y=terrainH(x,z),ex=2.6,ez=3.2;
  const gx=(terrainH(x+ex,z)-terrainH(x-ex,z))/(2*ex);
  const gz=(terrainH(x,z+ez)-terrainH(x,z-ez))/(2*ez);
  const inv=1/Math.hypot(gx,1,gz);
  const ax=Math.abs(x),t=Math.min(1,Math.max(0,(ax-33)/195)),u=t*t*(3-2*t);
  const vibrance=.992+.008*Math.sin(z*.014+x*.027);
  const zone=Math.min(4,Math.max(0,Math.floor((z-110)/200)));const palette=[[[.43,.67,.46],[.53,.61,.65]],[[.91,.59,.74],[.74,.59,.82]],[[.38,.78,.82],[.46,.70,.91]],[[.59,.30,.26],[.72,.44,.23]],[[.35,.39,.72],[.29,.25,.52]]][zone];const c0=palette[0],c1=palette[1];
  const rocky=Math.min(1,Math.max(0,(y-26)/26));
  const col=c0.map((v,i)=>(v*(1-u)+c1[i]*u)*(1-rocky*.10)*vibrance);
  return {x,y,z,c:col,n:[-gx*inv,inv,-gz*inv]};
}
function emitTerrain(p){verts.push(p.x,p.y,p.z,p.c[0],p.c[1],p.c[2],p.n[0],p.n[1],p.n[2]);}
const xs=[-270,-238,-210,-185,-160,-140,-122,-106,-92,-80,-69,-59,-50,-42,-35,-29,-24,-19,-14,-10,-8,8,10,14,19,24,29,35,42,50,59,69,80,92,106,122,140,160,185,210,238,270];
const terrainRows=[];
for(let zz=-120;zz<=4914;zz+=18){
  const row=[];for(const x of xs)row.push(terrainSample(x,zz));terrainRows.push(row);
}
for(let j=0;j<terrainRows.length-1;j++)for(let i=0;i<xs.length-1;i++){
  const a=terrainRows[j][i],b=terrainRows[j][i+1],c=terrainRows[j+1][i+1],d=terrainRows[j+1][i];
  emitTerrain(a);emitTerrain(b);emitTerrain(c);
  emitTerrain(a);emitTerrain(c);emitTerrain(d);
}
// River beneath the launch gap.
quad([-180,.01,114],[180,.01,114],[180,.01,155],[-180,.01,155],[.25,.72,.77]);
for(let z=-20;z<4600;z+=5){if(z>=110&&z<155)continue;let y1=roadY(z)+.05,y2=roadY(z+5)+.05;quad([-4,y1,z],[4,y1,z],[4,y2,z+5],[-4,y2,z+5],road);for(const x of[-4.15,4.15])quad([x-.14,y1+.01,z],[x+.14,y1+.01,z],[x+.14,y2+.01,z+5],[x-.14,y2+.01,z+5],white);if(z%10===0)quad([-.07,y1+.02,z],[.07,y1+.02,z],[.07,y1+(y2-y1)*.5+.02,z+2.5],[-.07,y1+(y2-y1)*.5+.02,z+2.5],white)}
// Soft rolling hills and a carefully spaced landscape: no spiky cone mountains.
quad([-4,0,80],[-4,0,110],[-4,10.5,110],[-4,0,80],[.44,.59,.43]);
quad([4,0,80],[4,10.5,110],[4,0,110],[4,0,80],[.42,.57,.42]);
for(let i=0;i<460;i++){
  const z=rnd()*4500-25;if(z>109&&z<170)continue;
  const x=(rnd()<.5?-1:1)*(18+rnd()*76);
  const h=3.2+rnd()*4.8, yy=terrainH(x,z);
  box(x,yy+h*.37,z,.17,h*.74,.17,[.35,.30,.23]);
  if(i%13===0){
    cone(x,yy+h*.54,z,2.0,h*.39,[.88,.60,.69],10);
    cone(x+.35,yy+h*.72,z+.24,1.52,h*.29,[.97,.73,.77],10);
  }else if(i%4===0){
    cone(x,yy+h*.56,z,2.15,h*.37,[.39,.59,.39],10);
    cone(x-.25,yy+h*.70,z,1.40,h*.29,[.49,.66,.44],10);
  }else{
    cone(x,yy+h*.35,z,1.80,h*.61,[.22,.43,.32],11);
    cone(x,yy+h*.57,z,1.41,h*.54,[.32,.54,.38],11);
  }
}
// Near-road grass, rocks, safety barriers and a departure platform.
for(let i=0;i<340;i++){
  const zz=rnd()*720-40;if(zz>109&&zz<166)continue;
  const x=(rnd()<.5?-1:1)*(5.8+rnd()*13),yy=terrainH(x,zz);
  const blade=.23+rnd()*.38;
  tri([x-.10,yy,zz],[x+.11,yy,zz],[x+.025,yy+blade,zz],[.39,.62,.37]);
  if(i%16===0)cone(x,yy+.11,zz,.15,.22,[.95,.74,.78],7);
}
for(let zz=0;zz<108;zz+=6)for(const side of[-1,1]){const yy=roadY(zz);box(side*4.6,yy+.4,zz,.08,.8,.08,[.43,.49,.48]);box(side*4.6,yy+.78,zz,.12,.14,5.4,[.66,.71,.69]);}
for(let z=165;z<4500;z+=25){box(6,.7,z,.12,1.4,.12,[.78,.8,.65]);box(6,1.5,z,1.1,.7,.10,[.16,.38,.31]);}

// Launch gantry, runway chevrons and layered shoreline rocks.
for(const x of[-4.8,4.8]){box(x,13,108,.2,5,.2,[.19,.29,.27]);box(x,15.4,108,.35,.35,.35,[.76,1,.35]);}
box(0,15.3,108,9.8,.2,.2,[.19,.29,.27]);
for(let zz=86;zz<109;zz+=5){let yy=roadY(zz)+.09;quad([-1,yy,zz],[0,yy+.35,zz+1],[0,yy+.525,zz+1.5],[-1,yy+.175,zz+.5],[.76,.95,.46]);quad([0,yy+.35,zz+1],[1,yy,zz],[1,yy+.175,zz+.5],[0,yy+.525,zz+1.5],[.76,.95,.46]);}
for(let i=0;i<30;i++){
  const xx=(rnd()<.5?-1:1)*(8+rnd()*90),zz=116+rnd()*36;
  cone(xx,-.10,zz,.6+rnd()*1.05,.45+rnd()*.9,[.64,.72,.70],8);
}

/* __PIG_COURSE_SCENE_V3__ */
for(let k=1;k<=5;k++){
 const z=110+k*200,colors=[[.97,.72,.81],[.96,.63,.86],[.36,.87,1.],[1.,.44,.24],[1.,.83,.33]],c=colors[k-1];
 for(const side of [-1,1])box(side*7.6,22,z,.5,44,.65,c);
 box(0,44,z,8,.75,.65,c);
 if(k===5){box(0,48,z,9,1,.7,[1.,.79,.2]);for(let j=0;j<7;j++)cone((j-3)*1.4,49,z,.5,1.6,[1.,.95,.52],6);}
}
for(let k=0;k<5;k++)for(let j=0;j<12;j++){
 const z=156+k*200+j*15,x=(j%2?1:-1)*(19+(j%3)*4),y=terrainH(x,z);
 if(k===0)cone(x,y,z,2.6,5,[1.,.63,.78],9);
 if(k===1){box(x,y+2,z,.65,4,.65,[1.,.85,.97]);cone(x,y+4,z,2.1,2.5,[1.,.58,.89],9);}
 if(k===2){cone(x,y,z,3,4,[.25,.80,.70],9);box(x,y+.8,z,.25,1.6,.25,[.64,.44,.26]);}
 if(k===3){cone(x,y,z,3.2,6,[.43,.24,.30],9);cone(x,y+5,z,1.4,2,[1.,.45,.17],8);}
 if(k===4)cone(x,y,z,2.2,5,[.62,.64,1.],7);
}

const staticData=new Float32Array(verts),staticBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,staticData,gl.STATIC_DRAW);const dynamicBuffer=gl.createBuffer(),aPos=gl.getAttribLocation(prog,'aPosition'),aCol=gl.getAttribLocation(prog,'aColor'),aNormal=gl.getAttribLocation(prog,'aNormal'),uVP=gl.getUniformLocation(prog,'uVP'),uCamera=gl.getUniformLocation(prog,'uCamera');gl.enableVertexAttribArray(aPos);gl.enableVertexAttribArray(aCol);gl.enableVertexAttribArray(aNormal);gl.enable(gl.DEPTH_TEST);gl.clearColor(.80,.91,.93,1);
function draw(buffer,data,count){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);if(data)gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,36,0);gl.vertexAttribPointer(aCol,3,gl.FLOAT,false,36,12);gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,36,24);gl.drawArrays(gl.TRIANGLES,0,count)}

const skyProgram=gl.createProgram();gl.attachShader(skyProgram,shader(gl.VERTEX_SHADER,`attribute vec2 aSky;varying vec2 uv;void main(){uv=aSky*.5+.5;gl_Position=vec4(aSky,.999,1.);}`));gl.attachShader(skyProgram,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 uv;uniform float skyTime;uniform float skyTheme;void main(){vec3 c=mix(vec3(.96,.82,.74),vec3(.37,.59,.79),smoothstep(.03,1.,uv.y));if(skyTheme>.5&&skyTheme<1.5)c=mix(vec3(.95,.72,.45),vec3(.45,.37,.58),uv.y);if(skyTheme>1.5&&skyTheme<2.5)c=mix(vec3(.84,.91,.95),vec3(.36,.57,.76),uv.y);if(skyTheme>2.5&&skyTheme<3.5)c=mix(vec3(1.,.82,.91),vec3(.68,.48,.87),uv.y);if(skyTheme>3.5&&skyTheme<4.5)c=mix(vec3(.66,1.,.96),vec3(.20,.47,.83),uv.y);if(skyTheme>4.5)c=mix(vec3(.25,.18,.48),vec3(.04,.06,.23),uv.y);vec2 p=(uv-vec2(.79,.76))*vec2(1.38,1.);float sun=exp(-length(p)*23.);c+=vec3(1.,.82,.56)*sun*.36;float wisps=sin(uv.x*13.+sin(uv.y*14.)+skyTime*.006)*sin(uv.x*7.-uv.y*18.);float cloud=smoothstep(.54,.85,wisps)*smoothstep(.55,.68,uv.y)*(1.-smoothstep(.82,.98,uv.y));c=mix(c,vec3(.92,.94,.91),cloud*.4);gl_FragColor=vec4(c,1.);}`));gl.linkProgram(skyProgram);if(!gl.getProgramParameter(skyProgram,gl.LINK_STATUS))throw Error('Sky shader link failed');const skyBuffer=gl.createBuffer(),skyAttr=gl.getAttribLocation(skyProgram,'aSky'),skyTime=gl.getUniformLocation(skyProgram,'skyTime'),skyTheme=gl.getUniformLocation(skyProgram,'skyTheme');gl.bindBuffer(gl.ARRAY_BUFFER,skyBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
function drawSky(t,theme=0){gl.disable(gl.DEPTH_TEST);gl.useProgram(skyProgram);gl.bindBuffer(gl.ARRAY_BUFFER,skyBuffer);gl.enableVertexAttribArray(skyAttr);gl.vertexAttribPointer(skyAttr,2,gl.FLOAT,false,8,0);gl.uniform1f(skyTime,t*.001);gl.uniform1f(skyTheme,theme);gl.drawArrays(gl.TRIANGLES,0,3);gl.useProgram(prog);gl.enable(gl.DEPTH_TEST);}
