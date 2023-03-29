import * as THREE from 'three';

class Enemy{
	constructor(game, player, position){
		this.type = 'enemy';
		this.size = 3;
		this.attackPower = 10;
		this.game = game;
		this.player = player;
		this.object3D = this.setObject3D(position);
		this.speed = 10;
		this.body = this.initBody(position);
		this.body.obj = this;
		this.life = 100;
		this.collided = false;

		this.game.add(this);
	}
	initBody(position){
		let shape = new CANNON.Box(new CANNON.Vec3(this.size/2, .5,this.size/2));
        //let body = new CANNON.Body({mass: 1, shape, position, material: materials.bullet});
        let body = new CANNON.Body({mass: 1, shape, position});
        body.linearDamping = .99;

        // collide with player
        body.addEventListener('collide', (e) => {
        	let obj = e.body.obj;
        	if(obj){
        		if((obj.type == "player") && (!this.collided)){
        			this.collided = true;
        			obj.damage(this.attackPower);

        			let p = e.body.obj.body.position.vadd(e.target.obj.body.position);
        			p = p.scale(.5, p);

        			let options = {
        				position: p,
        			}
        			this.game.animations.new("gravity", options);
        		}
        	}
		});
        return body;
	}
	newFrame(){
		this.collided = false;
		this.move();

		if(this.life <= 0)this.game.removeEnemy(this);
	}
	damage(value){
		this.life -= value;
	}
	move(){
		let distanceX = this.player.body.position.x - this.body.position.x;
		let distanceZ = this.player.body.position.z - this.body.position.z;
		let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceZ, 2))

		let vx = this.speed * (distanceX/distance);
		let vz = this.speed * (distanceZ/distance);

		this.body.velocity.set(vx, 0, vz) ;

		//this.object3D.lookAt(this.player.object3D.position);

		this.object3D.position.copy(this.body.position);
	}
	setObject3D(position){
	    const cubeGeo = new THREE.BoxGeometry(this.size, 1 ,this.size);
	    const cubeMat = new THREE.MeshPhongMaterial({color: '#6e0000'});
	    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
	    mesh.position.copy(position);
	    return mesh;
	}
}

export { Enemy };