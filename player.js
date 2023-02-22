import * as THREE from 'three';

let wireFrameMaterial = new THREE.MeshBasicMaterial({color: 0xff0000,wireframe: true});
const materials = {
	ground: new CANNON.Material(),
	enemy: new CANNON.Material(),
	player: new CANNON.Material(),
	bullet: new CANNON.Material()
}

//Para obter um quaternion que faz seu corpo ficar voltado para uma determinada direção, você pode usar Quaternion.setFromVectors(u,v)

class Mapa{
	constructor(){
		this.frame = 0;
		this.size = 150;
		this.groundSize = {x: 300, y: 2, z: 300}
		this.wallSize = {width: 4, height: 50}
		this.objects = [];
		
		this.world;
		this.object3D;

		this.init();

		this.player = new Player(this);
		this.add(this.player);

		this.enemys = [];

		this.createEnemy();		
	}
	init(){
		let walls = [];
		const world = new CANNON.World();
		world.gravity.set(0,-100,0);

        let bulletContactWithGround = new CANNON.ContactMaterial(
        	materials.ground,
        	materials.bullet,
        	{friction: 0}
        )

        world.addContactMaterial(bulletContactWithGround);

		// Phisic ground
		let groundShape = new CANNON.Box(new CANNON.Vec3(this.groundSize.x/2, this.groundSize.y/2, this.groundSize.z/2));
        let ground = new CANNON.Body({type: CANNON.Body.STATIC, shape: groundShape, material: materials.ground});
        world.addBody(ground);

        // 3D ground
		const boxGeometry = new THREE.BoxGeometry(this.groundSize.x, this.groundSize.y, this.groundSize.z);
		const material = new THREE.MeshPhongMaterial({color: 0xffffff});
		const ground3D = new THREE.Mesh( boxGeometry, material );

		// 3D ground copy phisical ground position
		ground3D.position.copy(ground.position);
		ground3D.quaternion.copy(ground.quaternion);
	        
        //Shapes
        let WallX = new CANNON.Box(new CANNON.Vec3(this.groundSize.z/2, this.wallSize.height/2, this.wallSize.width));
        let WallZ = new CANNON.Box(new CANNON.Vec3(this.wallSize.width, this.wallSize.height/2, this.groundSize.z/2));
   		let wallGeometryX = new THREE.BoxGeometry(this.groundSize.x, this.wallSize.height, this.wallSize.width);
   		let wallGeometryZ = new THREE.BoxGeometry(this.wallSize.width, this.wallSize.height, this.groundSize.z);
	        
   		// Phisical walls
        let wallTop = new CANNON.Body({type: CANNON.Body.STATIC, shape: WallX, material: materials.ground});
        let wallBotton = new CANNON.Body({type: CANNON.Body.STATIC, shape: WallX, material: materials.ground});
        let wallLeft = new CANNON.Body({type: CANNON.Body.STATIC, shape: WallZ, material: materials.ground});
        let wallRight = new CANNON.Body({type: CANNON.Body.STATIC, shape: WallZ, material: materials.ground});
	        
        // Setting phisical position
        wallTop.position.set(0, this.wallSize.height/2 - this.groundSize.y/2, -this.groundSize.z/2 - this.groundSize.y);
        wallBotton.position.set(0, this.wallSize.height/2 - this.groundSize.y/2, this.groundSize.z/2 + this.groundSize.y);
        wallLeft.position.set(-this.groundSize.x/2 - this.groundSize.y, this.wallSize.height/2 - this.groundSize.y/2, 0);
        wallRight.position.set(this.groundSize.x/2 + this.groundSize.y, this.wallSize.height/2 - this.groundSize.y/2, 0);

        // Creating 3D wall 
		const wall3DBotton = new THREE.Mesh( wallGeometryX, wireFrameMaterial );
		const wall3DTop = new THREE.Mesh( wallGeometryX, wireFrameMaterial );
		const wall3DLeft = new THREE.Mesh( wallGeometryZ, wireFrameMaterial );
		const wall3DRight = new THREE.Mesh( wallGeometryZ, wireFrameMaterial );

		// 3D walls copying phisical wall position
		wall3DBotton.position.copy(wallBotton.position);
		wall3DTop.position.copy(wallTop.position);
		wall3DLeft.position.copy(wallLeft.position);
		wall3DRight.position.copy(wallRight.position);

		// Adding phisical bodys
        world.addBody(wallBotton);
        world.addBody(wallTop);
        world.addBody(wallLeft);
        world.addBody(wallRight);

        // Adding 3D bodys
		//ground3D.add(wall3DBotton);
		ground3D.add(wall3DTop);
		ground3D.add(wall3DLeft);
		ground3D.add(wall3DRight);

		// return
        this.world = world;
		this.object3D = ground3D;
	}
	add(object){
		this.object3D.add(object.object3D);
		this.objects.push(object);
		this.world.addBody(object.body);
	}
	remove(object){
		//console.log(object);
		this.world.remove(object.body);
		object.object3D.parent.remove(object.object3D);
		this.objects.splice(this.objects.indexOf(object), 1);
	}
	createEnemy(){
		let position = {
			x: Math.random() * this.size - this.size/2,
			y: 1,
			z: Math.random() * this.size - this.size/2
		}

		this.enemys.push(new Enemy(this, this.player, position));
	}
	removeEnemy(enemy){
		this.remove(enemy);
		this.enemys.splice(this.enemys.indexOf(enemy), 1);
		this.player.score += 1;
	}
	newFrame(){
		this.frame++;
		this.world.step(1/60);
		this.objects.map((obj) => {obj.newFrame();})

		if(this.frame % 100 == 0){this.createEnemy()}


		//this.playerDirection.position.set(...this.player.object3D.position);
	}
}

class Player{
	constructor(map){
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
		this.angle = 0;
		this.angleSpeed = 5;
		this.buttonsActions = {
			a: false,
			b: false,
			c: false,
			d: false,
			e: false,
			f: false
		}
		this.speed = 40;
		this.body = this.initPhysicalBody();
		this.timeLastShot = 0;
		this.weapon = new Weapon(this);
		this.score = 0;
	}
	initPhysicalBody(){
		let shape = new CANNON.Box(new CANNON.Vec3(this.size/2, .5 ,this.size/2));
        let body = new CANNON.Body({mass: 10, shape, position: {x:10, y:1, z:2}});
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
			

			if(key == "q"){console.log(player.score);}
			if(key == "e"){player.buttonsActions.a = value;}
		}
	}
	newFrame(){
		if((this.buttonsActions.a) && (this.timeLastShot > 3)){this.shoot();this.timeLastShot = 0}
		let vz = this.movements.forward * 1 + this.movements.back * -1;
		let vx = this.movements.left * 1 + this.movements.right * -1;

		if((vx != 0) || (vz != 0)){
			this.target = {
				x: this.object3D.position.x += 10 * vx,
				y: this.object3D.position.y,
				z: this.object3D.position.z += 10 * vz
			}
		}

		this.body.velocity.set(this.speed * vx, 0, this.speed * vz);
		this.object3D.position.copy(this.body.position);
		this.object3D.lookAt(this.target.x, this.body.position.y, this.target.z);

		this.timeLastShot++;

		// body copy the object3D direction
		this.body.quaternion.set(this.object3D.quaternion.x,this.object3D.quaternion.y,this.object3D.quaternion.z,this.object3D.quaternion.w,);
	}
	setObject3D(){
		const player = new THREE.Object3D();
		player.position.z = 5;
		const boxGeometry = new THREE.BoxGeometry(this.size, 1 ,this.size);
		const material = new THREE.MeshPhongMaterial({color: 0x156289});
		const playerobject3D = new THREE.Mesh( boxGeometry, material );


		const lineGeometry = new THREE.BoxGeometry( .5, 1, 2);
		const lineMaterial = new THREE.MeshPhongMaterial({color: 0x15cccc});
		const lineMesh = new THREE.Mesh( lineGeometry, lineMaterial );
		lineMesh.position.z = 1;


		player.add(lineMesh);
		player.add(playerobject3D);
		player.position.set(0,5,-10);

		//console.log(player);
		return player;
	}
	shoot(){this.weapon.shoot(this.body, this.target);}
}

class Enemy{
	constructor(map, player, position){
		this.size = 5;
		this.map = map;
		this.player = player;
		this.object3D = this.setObject3D();
		this.speed = 20;
		this.body = this.initBody(position);
		this.body.obj = this;
		this.life = 100;

		this.map.add(this);
	}
	initBody(position){
		let shape = new CANNON.Box(new CANNON.Vec3(this.size/2, .5,this.size/2));
        let body = new CANNON.Body({mass: 1, shape, position, material: materials.bullet});

        return body;
	}
	newFrame(){
		this.move();

		if(this.life <= 0)this.map.removeEnemy(this);
	}
	hit(value){
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
	setObject3D(){
	    const cubeGeo = new THREE.BoxGeometry(this.size, 1 ,this.size);
	    const cubeMat = new THREE.MeshPhongMaterial({color: '#6e0000'});
	    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
	    return mesh;
	}
}

class Weapon{
	constructor(player){
		this.bullets = [];
		this.player = player;
	}

	shoot(body, target){
		let distanceX = target.x - body.position.x;
		let distanceZ = target.z - body.position.z;
		let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceZ, 2))

		let bulletVelocity = {x: distanceX/distance,y: 0,z: distanceZ/distance}

		let bulletPosition = {
			x: body.position.x + this.player.size/1.5 * bulletVelocity.x,
			y: body.position.y,
			z: body.position.z + this.player.size/1.5 * bulletVelocity.z
		}

		let bullet = new Bullet(bulletPosition, bulletVelocity, (bullet) => {this.removeBullet(this, bullet)});
		this.bullets.push(bullet);
		this.player.map.add(bullet);
	}

	removeBullet(weapon, bullet){
		weapon.player.map.remove(bullet);
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
	    let body = new CANNON.Body({mass: 1, shape, material: materials.bullet});
        body.position.set(position.x, position.y + .1, position.z );
        //body.position.set(position.x, 7, position.z);

        // Init object3D with three
		const lineGeometry = new THREE.BoxGeometry(1, 1, 1);
		const lineMaterial = new THREE.MeshPhongMaterial({color: 0x156200});
		const mesh = new THREE.Mesh( lineGeometry, lineMaterial );

		// Set velocity
		body.velocity.set(this.direction.x * this.speed, this.direction.y * this.speed,this.direction.z * this.speed);

		// Add colision event
		body.addEventListener('collide', (e) => {
			if((!this.usage) && (e.body.obj != undefined)){
				this.frameCount = 50;
				e.body.obj.hit(this.attackPower);
				this.usage = true;
			}
		});

	    this.body = body;
		this.object3D = mesh;
	}
	newFrame(){
		//console.log('still alive');
		this.frameCount++;
		this.object3D.position.copy(this.body.position);

		if(!this.directed){
			//this.object3D.lookAt(this.target.x, this.target.y , this.target.z);
			this.directed = true;
		}

		if(this.frameCount >= 50){this.remove(this)}
	}
}

export { Mapa };