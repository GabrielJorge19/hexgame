import * as THREE from 'three';
import { Weapon } from './Weapon.js';

class Player{
	constructor(map){
		this.type = "player";
		this.health = 100;
		this.map = map;
		this.size = 2;
		this.target = {x:0,y:5,z:0}
		this.object3D =	this.setObject3D();
		this.setControls();
		this.movements = {
			forward: false,
			left: false,
			right: false,
			back: false
		};
		this.angle = 90;
		this.angleSpeed = 5;
		this.buttonsActions = {
			a: false,
			b: false,
			c: false,
			d: false,
			e: false,
			f: false
		}
		this.speed = 2000;
		this.force = 3000;
		this.body = this.initPhysicalBody();
		this.weapon = new Weapon(this);
		this.score = 0;
		this.forceX = 0;
		this.keyConfigs = {
			j: false,
			k: false,
			l: false,
			u: false,
			i: false,
			o: false,
		}
	}
	initPhysicalBody(){
		let shape = new CANNON.Box(new CANNON.Vec3(this.size/2, .5 ,this.size/2));
        let body = new CANNON.Body({mass: 10, shape, position: {x:-10, y:.75, z:0}});
		body.linearDamping = .99;
		body.angularDamping = .9;
		body.obj = this;
		return body;
	}
	setControls(){
		document.addEventListener('keydown', (e) => {setKeysPressed(e.key, true, this)})
		document.addEventListener('keyup', (e) => {setKeysPressed(e.key, false, this)})

		function setKeysPressed(key, value, player){
			if((key == "s") || (key == "ArrowDown")) player.movements.forward = value;
			if((key == "w") || (key == "ArrowUp")) player.movements.back = value;
			if((key == "d") || (key == "ArrowRight")) player.movements.left = value;
			if((key == "a") || (key == "ArrowLeft")) player.movements.right = value;
			
			if(key == "q" && value) player.map.invertPaused();
			if(key == "e")player.buttonsActions.a = value;


			if(player.keyConfigs[key] != undefined) player.keyConfigs[key] = value;
		}
	}
	onKeyConfigs(){
		if(this.keyConfigs.u) this.forceX -= 0.01;
		if(this.keyConfigs.i) console.log("Force: " + this.forceX)
		if(this.keyConfigs.o) this.forceX += 0.01;
		
		if(this.keyConfigs.k) console.log("velocity: " + this.body.velocity.x);
		

		if(this.keyConfigs.j) this.angle = 90;
		if(this.keyConfigs.l) this.angle = 180;
	}
	spinTo(angle){
		this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), angle);
		this.object3D.quaternion.copy(this.body.quaternion);
	}
	damage(value){
		this.health -= value;
		//if(this.health <= 0) console.log(this.health, value);
		
		document.getElementById('health').innerHTML = this.health;
	}
	move(){
		let fx = this.movements.left * 1 + this.movements.right * -1;
		let fz = this.movements.forward * 1 + this.movements.back * -1;
		let m = Math.abs(fx) + Math.abs(fz);

		let fxAngle = 90 - fx * 90;
		let fzAngle = 180 + fz * 90;
		

		this.angle = (fx != 0)?fxAngle:this.angle;
		this.angle = (fz != 0)?fzAngle:this.angle;
		this.angle = ((fx != 0) && (fz != 0))?(fxAngle + fzAngle)/2:this.angle;
		this.angle = ((fx == 1) && (fz == 1))?315:this.angle;
	

		fx = (fx != 0)? this.force * fx/m:0;
		fz = (fz != 0)? this.force * fz/m:0;

		this.body.force.vadd({x: fx, y: 0, z: fz}, this.body.force);

	}
	newFrame(){
		// Move
		this.move();

		// Rotate
		this.spinTo((this.angle + 90) * 0.0174533);

		//3D object copy the body object
		this.object3D.position.copy(this.body.position);


		this.onKeyConfigs();
		if(this.buttonsActions.a) this.shoot()
	}
	setObject3D(){
		const player = new THREE.Object3D();
		player.position.z = 5;
		const boxGeometry = new THREE.BoxGeometry(this.size, 1 ,this.size);
		const material = new THREE.MeshPhongMaterial({color: 0x156289});
		const playerobject3D = new THREE.Mesh( boxGeometry, material );


		const lineGeometry = new THREE.BoxGeometry( .5, .5, 2);
		const lineMaterial = new THREE.MeshPhongMaterial({color: 0x15cccc});
		const lineMesh = new THREE.Mesh( lineGeometry, lineMaterial );
		lineMesh.position.z = 1;


		player.add(lineMesh);
		player.add(playerobject3D);
		player.position.set(0,5,-10);

		return player;
	}
	shoot(){this.weapon.shoot(this.body, this.target, this);}
}

export { Player };