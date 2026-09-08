'use client';
import {useEffect,useRef,useState} from 'react';
import glyphs from './glyphs.json';
export default function Lamp3D({motion,replay,onReplay}:{motion:boolean;replay:number;onReplay:()=>void}){
 const host=useRef<HTMLDivElement>(null),controls=useRef({motion,replay,onReplay});controls.current={motion,replay,onReplay};const[ready,setReady]=useState(false);
 useEffect(()=>{let disposed=false,raf=0,cleanup=()=>{};
 async function start(){
 const [T,{SVGLoader},{RoomEnvironment}]=await Promise.all([import('three'),import('three/addons/loaders/SVGLoader.js'),import('three/addons/environments/RoomEnvironment.js')]);
 if(disposed||!host.current)return;const el=host.current;
 let renderer:import('three').WebGLRenderer;try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<640?1.35:1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;el.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-7,7,4.2,-4.2,.1,80);camera.position.set(0,3.55,25);camera.lookAt(0,3.55,0);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.05);scene.environment=env.texture;room.dispose();pmrem.dispose();scene.environmentIntensity=.8;
 scene.add(new T.HemisphereLight(0xdce6ff,0x202619,2));
 const key=new T.DirectionalLight(0xfff4dc,4);key.position.set(-4,10,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-5,near:.1,far:35});key.shadow.bias=-.0006;key.shadow.normalBias=.025;scene.add(key);
 const rim=new T.DirectionalLight(0xc3dfed,3);rim.position.set(5,7,-5);scene.add(rim);
 const ivory=new T.MeshPhysicalMaterial({side:T.DoubleSide,color:0xe9eadf,roughness:.28,metalness:.12,clearcoat:.35}),lime=new T.MeshPhysicalMaterial({side:T.DoubleSide,color:0xc9f13d,roughness:.25,metalness:.18,clearcoat:.4}),metal=new T.MeshStandardMaterial({color:0xb6c2c3,metalness:.87,roughness:.25}),dark=new T.MeshStandardMaterial({color:0x303a3c,metalness:.75,roughness:.3});
 function letter(char:'M'|'&',height:number,x:number,mat:typeof ivory){const data=new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${glyphs[char]}" fill="#fff" fill-rule="nonzero"/></svg>`);const shapes=data.paths.flatMap(p=>SVGLoader.createShapes(p));const g=new T.ExtrudeGeometry(shapes,{depth:65,bevelEnabled:true,bevelThickness:7,bevelSize:7,bevelSegments:3,steps:1,curveSegments:12});g.scale(1,-1,1);g.computeBoundingBox();const box=g.boundingBox!,scale=height/(box.max.y-box.min.y);g.translate(-(box.min.x+box.max.x)/2,-box.min.y,-32);g.scale(scale,scale,scale);g.computeVertexNormals();const mesh=new T.Mesh(g,mat);mesh.position.set(x,0,0);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
 const letters=[letter('M',3.5,-3.55,ivory),letter('&',2.7,0,lime),letter('M',3.5,3.55,ivory)];letters.forEach(l=>{l.visible=false;});const flatLetters=Array.from(el.querySelectorAll<SVGElement>('.restored-letter'));
 const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.27}));floor.rotation.x=-Math.PI/2;floor.position.y=-.07;floor.receiveShadow=true;scene.add(floor);
 const lamp=new T.Group(),flip=new T.Group(),body=new T.Group();scene.add(lamp);lamp.add(flip);flip.position.y=1;flip.add(body);body.position.y=-1;
 function mesh(g:import('three').BufferGeometry,mat:InstanceType<typeof T.Material>,parent=body){const m=new T.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const base=mesh(new T.CylinderGeometry(.49,.55,.12,48),metal);base.position.y=.09;
 const baseTop=mesh(new T.SphereGeometry(.42,32,12),metal);baseTop.scale.set(1,.18,1);baseTop.position.y=.15;
 const neck=mesh(new T.CylinderGeometry(.075,.1,.22,16),dark);neck.position.y=.26;
 const bars=Array.from({length:4},()=>mesh(new T.CylinderGeometry(.035,.035,1,12),metal));
 const joints=Array.from({length:3},()=>mesh(new T.CylinderGeometry(.085,.085,.2,20),dark));joints.forEach(j=>j.rotation.x=Math.PI/2);
 const spring=mesh(new T.CylinderGeometry(.035,.035,.48,12),dark);
 const head=new T.Group();body.add(head);
 const shade=mesh(new T.CylinderGeometry(.19,.43,.48,40,1,true),new T.MeshStandardMaterial({color:0xc9d0c8,metalness:.65,roughness:.25,side:T.DoubleSide}),head);
 const lip=mesh(new T.TorusGeometry(.43,.027,10,48),metal,head);lip.rotation.x=Math.PI/2;lip.position.y=-.24;
 const inner=mesh(new T.CircleGeometry(.40,40),new T.MeshStandardMaterial({color:0xfff1b6,emissive:0xffdd80,emissiveIntensity:1.6,side:T.DoubleSide}),head);inner.rotation.x=Math.PI/2;inner.position.y=-.215;
 const bulb=mesh(new T.SphereGeometry(.13,20,16),new T.MeshBasicMaterial({color:0xfffce4}),head);bulb.position.y=-.25;
 const spot=new T.SpotLight(0xffedb0,12,12,.65,.7,1.5);spot.position.set(0,-.29,0);head.add(spot);const target=new T.Object3D();target.position.set(0,-4,0);head.add(target);spot.target=target;
 const A=new T.Vector3(),B=new T.Vector3(),up=new T.Vector3(0,1,0);
 function rod(m:typeof bars[number],a:InstanceType<typeof T.Vector3>,b:InstanceType<typeof T.Vector3>){m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=a.distanceTo(b);m.quaternion.setFromUnitVectors(up,B.copy(b).sub(a).normalize());}
 const points=[[-3.25,2.8],[-1.35,2.8],[.2,2.18],[2.15,2.8],[4.1,2.8]],flights=[[.7,1.7],[2.15,3.3],[3.75,4.85],[5.35,6.85]];let renderedTime=-1,t=0,last=performance.now(),seen=controls.current.replay,visible=true;
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});observer.observe(el);
 let dirty=true;function resize(){dirty=true;const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);const ratio=w/h,halfW=Math.max(5,3.55*ratio);camera.left=-halfW;camera.right=halfW;camera.top=halfW/ratio;camera.bottom=-halfW/ratio;camera.updateProjectionMatrix();}const ro=new ResizeObserver(resize);ro.observe(el);resize();
 const ray=new T.Raycaster(),pointer=new T.Vector2();function click(e:PointerEvent){const r=el.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);if(ray.intersectObject(lamp,true).length)controls.current.onReplay();}renderer.domElement.addEventListener('pointerup',click);
 function draw(now:number){if(disposed)return;const dt=Math.min((now-last)/1000,.045);last=now;if(seen!==controls.current.replay){seen=controls.current.replay;t=0;}if(visible&&!document.hidden&&controls.current.motion)t=Math.min(t+dt,7.8);
 let x=points[0][0],y=points[0][1],squash=0,tilt=0,spin=0;letters.forEach(l=>{l.scale.set(1,1,1);l.rotation.z=0;});
 for(let i=0;i<4;i++){const[a,b]=flights[i],p=points[i],q=points[i+1];if(t>=b){x=q[0];y=q[1];const age=t-b;const compression=age<.55?Math.sin(Math.min(age/.12,1)*Math.PI/2)*Math.exp(-age*6)*(.19)*(age<.2?1:Math.cos((age-.2)*18)):0;const letterIndex=i===0?0:i===1?1:2;letters[letterIndex].scale.y=1-compression;letters[letterIndex].scale.x=1+compression*.14;y-=(i===1?1.9:2.52)*compression;squash=compression*1.4;}
 if(t>=a&&t<b){const u=(t-a)/(b-a);x=p[0]+(q[0]-p[0])*u;y=p[1]+(q[1]-p[1])*u+4*(i===3?1.9:1.2)*u*(1-u);tilt=Math.sin(u*Math.PI)*-.14;if(i===3)spin=-Math.PI*2*(u*u*(3-2*u));break;}
 if(t>=a-.2&&t<a){squash=Math.sin((t-a+.2)/.2*Math.PI/2)*.15;}}
 flatLetters.forEach((l,i)=>{l.style.transform=`scale(${letters[i].scale.x},${letters[i].scale.y})`;});lamp.position.set(x,y+.02,0);flip.rotation.z=spin;body.scale.y=1-squash;body.rotation.z=tilt;
 const elbow=new T.Vector3(-.35-squash*.4,.9-squash*.15,0),top=new T.Vector3(.05,1.67,0);A.set(0,.3,0);for(let j=0;j<2;j++){const z=j===0?-.09:.09;rod(bars[j],A.clone().setZ(z),elbow.clone().setZ(z));rod(bars[j+2],elbow.clone().setZ(z),top.clone().setZ(z));}joints[0].position.copy(A);joints[1].position.copy(elbow);joints[2].position.copy(top);spring.position.set(-.22,.63,0);spring.rotation.z=-.45;head.position.copy(top);head.rotation.set(0,0,.6+Math.sin(t*3)*.04);head.rotation.x=.35;
 if(visible&&!document.hidden&&(dirty||renderedTime!==t)){renderer.render(scene,camera);renderedTime=t;dirty=false;}raf=requestAnimationFrame(draw);}
 raf=requestAnimationFrame(draw);setReady(true);
 cleanup=()=>{cancelAnimationFrame(raf);observer.disconnect();ro.disconnect();renderer.domElement.removeEventListener('pointerup',click);scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});env.dispose();renderer.dispose();renderer.domElement.remove();};
 }
 start().catch(()=>{});return()=>{disposed=true;cleanup();};},[]);
 return <div className="three-stage restored-stage" ref={host} role="group" aria-label="Буквы M&M и металлическая прыгающая лампа"><svg className="restored-word" viewBox="0 -220 1000 710" aria-hidden="true"><g className="lamp-letters"><text className="restored-letter" style={{transformOrigin:'270px 462px'}} x="125" y="462">M</text><g className="restored-letter" style={{transformOrigin:'520px 462px'}}><text className="lamp-amp" x="465" y="462">&amp;</text></g><text className="restored-letter" style={{transformOrigin:'800px 462px'}} x="665" y="462">M</text></g></svg><button className="three-replay" onClick={onReplay}>{ready?'Нажмите на лампу ↻':'M&M / ВООБРАЖЕНИЕ В ДВИЖЕНИИ'}</button></div>;
}
