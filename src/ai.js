import * as THREE from 'three';

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

  update(dt, playerPos, enemies, scene, command='follow', index=0){
    // determine target position based on command
    const target = new THREE.Vector3();
    const forward = new THREE.Vector3().subVectors(playerPos, this.mesh.position); forward.y = 0; forward.normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), forward).normalize();

    if(command==='hold'){
      // stay roughly in place
      target.copy(this.mesh.position);
      this.mesh.material.color.setHex(0x888888);
    } else if(command==='flank'){
      // spread to sides and slightly ahead
      const side = (index%2===0)? -1: 1;
      target.copy(playerPos).addScaledVector(right, side * (1.5 + index*0.2)).addScaledVector(forward, -1.0);
      this.mesh.material.color.setHex(0xffcc33);
    } else if(command==='takecover'){
      // move away from nearest enemy to seek 'cover'
      if(enemies.length){
        let nearest=null; let best=Infinity;
        for(const e of enemies){ const d = e.mesh.position.distanceTo(this.mesh.position); if(d<best){best=d;nearest=e;} }
        if(nearest){
          const away = new THREE.Vector3().subVectors(this.mesh.position, nearest.mesh.position); away.y=0; away.normalize();
          target.copy(this.mesh.position).addScaledVector(away, 5.0);
        } else { target.copy(playerPos); }
      } else { target.copy(playerPos); }
      this.mesh.material.color.setHex(0xff5522);
    } else {
      // follow - formation offset based on index
      const col = Math.floor(index/2);
      const side = (index%2===0)? -1: 1;
      target.copy(playerPos).addScaledVector(right, side * (1.0 + col*0.6)).add(new THREE.Vector3(0,0, -1 - col*0.4));
      this.mesh.material.color.setHex(0x2233ff);
    }

    // move toward target
    const dir = new THREE.Vector3().subVectors(target, this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if(dist>0.4){ dir.normalize(); this.mesh.position.addScaledVector(dir, dt*2.8); }
    if(dir.lengthSq()>0.0001){ this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z); }

    // shoot nearest enemy when appropriate
    this.shootCooldown -= dt;
    if(this.shootCooldown<=0 && enemies.length){
      let nearest = null; let best = Infinity;
      for(const e of enemies){
        const d = e.mesh.position.distanceTo(this.mesh.position);
        if(d<best){ best=d; nearest=e; }
      }
      if(nearest && best<18){
        nearest.health -= 20;
        this.shootCooldown = 0.9 + Math.random()*0.4;
      }
    }
  }
}

export class Squad {
  constructor(scene, count=2, spawnPos=[0,0,0]){
    this.agents = [];
    this.command = 'follow';
    for(let i=0;i<count;i++){
      const x = spawnPos[0] + (i-0.5)*1.2;
      const z = spawnPos[2] - 1 - i*0.5;
      this.agents.push(new SquadAgent(scene,[x,0.8,z]));
    }
  }

  setCommand(cmd){ this.command = cmd; }

  update(dt, playerPos, enemies, scene){
    for(let i=0;i<this.agents.length;i++){
      const a = this.agents[i];
      a.update(dt, playerPos, enemies, scene, this.command, i);
    }
    this.agents = this.agents.filter(a=>a.health>0);
  }
}
