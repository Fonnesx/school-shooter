import * as THREE from 'three';

export class Weapon {
  constructor(camera){
    this.camera = camera;
    this.maxAmmo = 30;
    this.ammo = this.maxAmmo;
    this.reserve = 90;
    this.fireRate = 0.12; // seconds between shots
    this.lastShot = -999;
    this.reloading = false;
    this.reloadTime = 1.8;
    this.reloadTimer = 0;
    this.recoil = 0;
  }

  tryFire(now, raycaster, enemies){
    if(this.reloading) return false;
    if(this.ammo<=0){ this.startReload(); return false; }
    if(now - this.lastShot < this.fireRate) return false;
    this.lastShot = now;
    this.ammo -= 1;
    this.recoil += 0.06; // immediate camera kick

    // hit detection
    raycaster.setFromCamera(new THREE.Vector2(0,0), this.camera);
    const hits = raycaster.intersectObjects(enemies.map(en=>en.mesh));
    if(hits.length){
      const m = hits[0].object; const en = enemies.find(x=>x.mesh===m);
      if(en) { en.health -= 40; return true; }
    }
    return false;
  }

  startReload(){
    if(this.reloading) return;
    if(this.ammo===this.maxAmmo) return;
    if(this.reserve<=0) return;
    this.reloading = true; this.reloadTimer = this.reloadTime;
  }

  update(dt){
    if(this.reloading){
      this.reloadTimer -= dt;
      if(this.reloadTimer<=0){
        const need = this.maxAmmo - this.ammo;
        const take = Math.min(need, this.reserve);
        this.reserve -= take; this.ammo += take; this.reloading = false;
      }
    }

    // recoil decay
    if(this.recoil>0){ this.recoil = Math.max(0, this.recoil - dt*2.5); }
  }
}
