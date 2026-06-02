import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/PointerLockControls.js';
import { Squad } from './ai.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88aaff);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0,1.6,5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
});

const light = new THREE.HemisphereLight(0xffffff, 0x444466, 1.2);
scene.add(light);

const dir = new THREE.DirectionalLight(0xffffff,0.6); dir.position.set(5,10,2); scene.add(dir);

// ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200), new THREE.MeshStandardMaterial({color:0x556655}));
ground.rotation.x = -Math.PI/2; scene.add(ground);

// controls
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', ()=>{ controls.lock(); document.getElementById('overlay').style.display='none'; });

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = {};
addEventListener('keydown', e=>keys[e.code]=true);
addEventListener('keyup', e=>keys[e.code]=false);

// enemies
class Enemy {
  constructor(scene,pos){
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5,8,8), new THREE.MeshStandardMaterial({color:0xaa2222}));
    this.mesh.position.set(...pos); scene.add(this.mesh);
    this.health = 100;
  }
  update(dt, playerPos){
    const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position); dir.y=0; if(dir.length()>0.1) dir.normalize().multiplyScalar(dt*1.2), this.mesh.position.add(dir);
  }
}

const enemies = [];
function spawnEnemy(){
  const x = (Math.random()-0.5)*30; const z = (Math.random()-0.5)*30; const e = new Enemy(scene,[x,0.5,z]); enemies.push(e);
}

// squad
const squad = new Squad(scene, 2, [ -1,0,3 ]);

// simple HUD
const hud = document.createElement('div'); hud.id='hud'; hud.innerText='Enemies: 0'; document.body.appendChild(hud);

// shooting
const raycaster = new THREE.Raycaster();
window.addEventListener('mousedown', (e)=>{
  if(e.button!==0) return;
  const origin = camera.position.clone();
  raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
  const hits = raycaster.intersectObjects(enemies.map(en=>en.mesh));
  if(hits.length){
    const m = hits[0].object; const en = enemies.find(x=>x.mesh===m);
    if(en){ en.health -= 50; }
  }
});

let last = performance.now();
let spawnTimer = 0;
function animate(){
  const now = performance.now(); const dt = (now-last)/1000; last = now;

  // movement
  if(controls.isLocked){
    direction.set(0,0,0);
    if(keys['KeyW']) direction.z -= 1;
    if(keys['KeyS']) direction.z += 1;
    if(keys['KeyA']) direction.x -= 1;
    if(keys['KeyD']) direction.x += 1;
    direction.normalize();
    const forward = new THREE.Vector3(); camera.getWorldDirection(forward); forward.y=0; forward.normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), forward).normalize();
    camera.position.addScaledVector(forward, direction.z * dt * 5);
    camera.position.addScaledVector(right, direction.x * dt * 5);
  }

  // update enemies
  for(const e of enemies) e.update(dt, camera.position);
  // remove dead
  for(let i=enemies.length-1;i>=0;i--){ if(enemies[i].health<=0){ scene.remove(enemies[i].mesh); enemies.splice(i,1); }}

  // squad update
  squad.update(dt, camera.position, enemies, scene);

  // spawn logic
  spawnTimer -= dt; if(spawnTimer<=0){ spawnEnemy(); spawnTimer = 2 + Math.random()*3; }

  hud.innerText = `Enemies: ${enemies.length}`;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
