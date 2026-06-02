import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export class SquadAgent {
  constructor(scene, position=[0,0,0]){
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6,1.6,0.4),
      new THREE.MeshStandardMaterial({color:0x2233ff})
    );
    this.mesh.position.set(...position);
    scene.add(this.mesh);
    this.health = 100;
    this.shootCooldown = 0;
  }

  update(dt, playerPos, enemies, scene){
    // simple follow player
    const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if(dist>2){ dir.normalize(); this.mesh.position.addScaledVector(dir, dt*2.5); }

    // look toward movement
    if(dir.lengthSq()>0.0001){ this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z); }

    // shoot nearest enemy
    this.shootCooldown -= dt;
    if(this.shootCooldown<=0 && enemies.length){
      let nearest = null; let best = Infinity;
      for(const e of enemies){
        const d = e.mesh.position.distanceTo(this.mesh.position);
        if(d<best){ best=d; nearest=e; }
      }
      if(nearest && best<20){
        // instant hit for prototype
        nearest.health -= 25;
        this.shootCooldown = 0.7;
      }
    }
  }
}

export class Squad {
  constructor(scene, count=2, spawnPos=[0,0,0]){
    this.agents = [];
    for(let i=0;i<count;i++){
      const x = spawnPos[0] + (i-0.5)*1.2;
      const z = spawnPos[2] - 1 - i*0.5;
      this.agents.push(new SquadAgent(scene,[x,0.8,z]));
    }
  }

  update(dt, playerPos, enemies, scene){
    for(const a of this.agents) a.update(dt, playerPos, enemies, scene);
    this.agents = this.agents.filter(a=>a.health>0);
  }
}
