import * as THREE from 'three';

class Weapon{
	constructor(arsenal){
		this.bullets = [];
		this.arsenal = arsenal;
		this.player = arsenal.player;
		this.bulletSpeed = .7;
		this.timeLastShot = new Date().getTime();

	}
	shoot(){
		let dateNow = new Date().getTime();

		if(dateNow - this.timeLastShot > 70){
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

			let bullet = new Bullet(bulletPosition, bulletVelocity, (bullet) => {this.removeBullet(this, bullet)});
			this.bullets.push(bullet);
			this.player.game.add(bullet);	
		}
	}
	newFrame(){this.bullets.map((bullet) => {bullet.newFrame();})}

	removeBullet(weapon, bullet){
		weapon.player.game.remove(bullet);
		this.bullets.splice(this.bullets.indexOf(bullet), 1);
	}
}

class Bullet{
	constructor(position, direction, remove){
		this.frameCount = 0;
		this.direction = direction;
		this.speed = 100;
		//target
		this.init(position);
		this.directed = false;
		this.remove = remove;
		this.attackPower = 40;
		this.usage = false;
	}
	init(position){
        // Init physical object3D with cannon
		let shape = new CANNON.Box(new CANNON.Vec3(.5, .5, .5));
	    //let body = new CANNON.Body({mass: 1, shape, material: materials.bullet, position});
	    let body = new CANNON.Body({mass: 1, shape, position});
        

        //body.position.set(position.x, position.y + .1, position.z );
        //body.position.set(position.x, 7, position.z);

        // Init object3D with three
		const lineGeometry = new THREE.BoxGeometry(1, 1, 1);
		const lineMaterial = new THREE.MeshPhongMaterial({color: 0x156200});
		const mesh = new THREE.Mesh( lineGeometry, lineMaterial);
		mesh.position.copy(position);

		// Set velocity
		body.velocity.set(this.direction.x * this.speed, this.direction.y * this.speed,this.direction.z * this.speed);

		// Add colision event
		body.addEventListener('collide', (e) => {
			if((!this.usage) && (e.body.obj != undefined)){
				if(e.body.obj.type == "enemy"){
					this.frameCount = 50;
					e.body.obj.damage(this.attackPower);
					this.usage = true;
				}
			}
		});

	    this.body = body;
		this.object3D = mesh;
	}
	newFrame(){
		//console.log('still alive');
		this.frameCount++;
		this.object3D.position.copy(this.body.position);

		if(this.frameCount >= 50){this.remove(this)}
	}
}

export { Weapon };
