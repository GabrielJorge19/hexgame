import * as THREE from 'three';


let wireFrameMaterial = new THREE.MeshBasicMaterial({color: 0xff0000,wireframe: true});


class Mapa{
	constructor(game){
		this.game = game;
		this.groundSize = {x: 100, y: .5, z: 100}
		this.wallSize = {width: 4, height: 4}		
		this.body = {};
		this.object3D;

		this.init();
	}
	init(){
		// Phisic ground
		let groundShape = new CANNON.Box(new CANNON.Vec3(this.groundSize.x/2, this.groundSize.y/2, this.groundSize.z/2));
        let ground = new CANNON.Body({type: CANNON.Body.STATIC, shape: groundShape});
    	this.body.ground = ground;
    	this.game.world.addBody(ground);

		// Phisic roof
        let roof = new CANNON.Body({type: CANNON.Body.STATIC, shape: groundShape, position: {x:0, y:2, z:0}});
    	this.body.roof = roof;
    	this.game.world.addBody(roof);

        // 3D ground
		const boxGeometry = new THREE.BoxGeometry(this.groundSize.x, this.groundSize.y, this.groundSize.z);
		const material = new THREE.MeshPhongMaterial({color: 0xffffff});
		const ground3D = new THREE.Mesh( boxGeometry, material );
		ground3D.position.copy({x: 0, y: -1, z: 0});
	        
        //Shapes of walls
        let WallX = new CANNON.Box(new CANNON.Vec3(this.groundSize.z/2, this.wallSize.height, this.wallSize.width/2));
        let WallZ = new CANNON.Box(new CANNON.Vec3(this.wallSize.width/2, this.wallSize.height, this.groundSize.z/2));
   		let wallGeometryX = new THREE.BoxGeometry(this.groundSize.x, this.wallSize.height, this.wallSize.width/2);
   		let wallGeometryZ = new THREE.BoxGeometry(this.wallSize.width/2, this.wallSize.height, this.groundSize.z);
	        
   		// Phisical walls
        let wallTop = new CANNON.Body({type: CANNON.Body.STATIC, shape: WallX});
        let wallBotton = new CANNON.Body({type: CANNON.Body.STATIC, shape: WallX});
        let wallLeft = new CANNON.Body({type: CANNON.Body.STATIC, shape: WallZ});
        let wallRight = new CANNON.Body({type: CANNON.Body.STATIC, shape: WallZ});
	        
        // Setting wall positions
        wallTop.position.set(0, this.wallSize.height/2 - this.groundSize.y/2, -this.groundSize.z/2 - this.groundSize.y);
        wallBotton.position.set(0, this.wallSize.height/2 - this.groundSize.y/2, this.groundSize.z/2 + this.groundSize.y);
        wallLeft.position.set(-this.groundSize.x/2 - this.groundSize.y, this.wallSize.height/2 - this.groundSize.y/2, 0);
        wallRight.position.set(this.groundSize.x/2 + this.groundSize.y, this.wallSize.height/2 - this.groundSize.y/2, 0);

        // Creating 3D wall 
		const wall3DTop = new THREE.Mesh( wallGeometryX, wireFrameMaterial );
		const wall3DLeft = new THREE.Mesh( wallGeometryZ, wireFrameMaterial );
		const wall3DRight = new THREE.Mesh( wallGeometryZ, wireFrameMaterial );

		// 3D walls copying phisical wall position
		wall3DTop.position.copy(wallTop.position);
		wall3DLeft.position.copy(wallLeft.position);
		wall3DRight.position.copy(wallRight.position);

		// Adding phisical bodys
    	this.body.walls = {
    		right: wallRight,
    		left: wallLeft,
    		top: wallTop,
    		bottom: wallBotton
    	};
	    
	    this.game.world.addBody(wallBotton);
	    this.game.world.addBody(wallTop);
	    this.game.world.addBody(wallLeft);
	    this.game.world.addBody(wallRight);

        // Adding 3D bodys
		ground3D.add(wall3DTop);
		ground3D.add(wall3DLeft);
		ground3D.add(wall3DRight);

		// return
		this.object3D = ground3D;

		this.game.object3D.add(ground3D);
	}
	newFrame(){}
}


export { Mapa };