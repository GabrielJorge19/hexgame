import * as THREE from 'three';

class GravitationalWeapon{
	constructor(arsenal){
		this.bullets = [];
		this.arsenal = arsenal;
		this.player = arsenal.player;
		this.bulletSpeed = .7;
		this.timeLastShot = new Date().getTime();
		this.cadencia = 100;
		this.gravity = true;
		this.duration = 5;
		this.range = 20;
		this.force = 1000;
		this.timeToExplode = 1;
	}
	newFrame(){this.bullets.map((bullet) => {bullet.newFrame();})}
	shoot(){
		let dateNow = new Date().getTime();

		if(dateNow - this.timeLastShot > 60000/this.cadencia){
			this.timeLastShot = dateNow;		
		
			let vx = Math.cos(this.player.angle * Math.PI/180);
			let vz = -Math.sin(this.player.angle * Math.PI/180);
			
			let bulletVelocity = {
				x: vx * this.bulletSpeed,
				y: 0,
				z: vz * this.bulletSpeed
			}
			let bulletPosition = {
				x: this.player.body.position.x + this.player.size * vx,
				y: this.player.body.position.y,
				z: this.player.body.position.z + this.player.size * vz
			}

			let options = {
				weapon: this,
				position: bulletPosition,
				direction: bulletVelocity,
				remove: (bullet) => {this.removeBullet(this, bullet)},
				gravity: true
			}

			let bullet = new GravitationalBullet(options);
			this.bullets.push(bullet);
			this.player.game.add(bullet);	
		}
	}
	removeBullet(weapon, bullet){
		weapon.player.game.remove(bullet);
		this.bullets.splice(this.bullets.indexOf(bullet), 1);
	}
}

class AntiGravitationalWeapon{
	constructor(arsenal){
		this.bullets = [];
		this.arsenal = arsenal;
		this.player = arsenal.player;
		this.bulletSpeed = 2;
		this.timeLastShot = new Date().getTime();
		this.cadencia = 300;
		this.gravity = false;
		this.duration = .3;
		this.range = 20;
		this.force = 3000;
		this.timeToExplode = .5;
	}
	newFrame(){this.bullets.map((bullet) => {bullet.newFrame();})}
	shoot(){
		let dateNow = new Date().getTime();

		if(dateNow - this.timeLastShot > 60000/this.cadencia){
			this.timeLastShot = dateNow;		
		
			let vx = Math.cos(this.player.angle * Math.PI/180);
			let vz = -Math.sin(this.player.angle * Math.PI/180);
			
			let bulletVelocity = {
				x: vx * this.bulletSpeed,
				y: 0,
				z: vz * this.bulletSpeed
			}
			let bulletPosition = {
				x: this.player.body.position.x + this.player.size * vx,
				y: this.player.body.position.y,
				z: this.player.body.position.z + this.player.size * vz
			}

			let options = {
				weapon: this,
				position: bulletPosition,
				direction: bulletVelocity,
				remove: (bullet) => {this.removeBullet(this, bullet)},
				gravity: false
			}

			let bullet = new GravitationalBullet(options);
			this.bullets.push(bullet);
			this.player.game.add(bullet);	
		}
	}

	removeBullet(weapon, bullet){
		weapon.player.game.remove(bullet);
		this.bullets.splice(this.bullets.indexOf(bullet), 1);
	}
}

class GravitationalBullet{
	constructor(options){
		this.weapon = options.weapon;
		this.used = false;
		this.direction = options.direction || {x:1, y:0, z:0};
		this.speed = .5;
		this.init(options.position || {x:0, y:0, z:0});
		this.directed = false;
		this.remove = options.remove;
		this.attackPower = 140;
		this.usage = false;
		this.timeBorn = new Date().getTime();
		this.time = () => {return new Date().getTime() - this.timeBorn;}
	}
	init(position){
        // Init object3D with three
		const lineGeometry = new THREE.BoxGeometry(1, 1, 1);
		const lineMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
		const mesh = new THREE.Mesh( lineGeometry, lineMaterial);
		mesh.position.copy(position);

		this.object3D = mesh;
	}
	move(){
		if(this.time() < this.weapon.timeToExplode * 1000){
			let p = this.object3D.position;
			this.object3D.position.set(p.x + this.direction.x * this.speed, p.y + this.direction.y * this.speed, p.z + this.direction.z * this.speed);
		}
	}
	newFrame(){
		//console.log();
		this.move();
		if(this.time() > this.weapon.timeToExplode * 1000)	this.explode(this);
		if(this.time() > (this.weapon.timeToExplode + this.weapon.duration) * 1000) this.remove(this);
	}
	explode(){
		if(!this.used){
			let options = {
				position: this.object3D.position,
				direction: (this.weapon.gravity)?1:-1,
				duration: this.weapon.duration,
				range: this.weapon.range,
				force: this.weapon.force,
			}
			this.weapon.arsenal.animations.new("gravity", options);
			this.used = true;
		}
	}
}

export { GravitationalWeapon, AntiGravitationalWeapon };
