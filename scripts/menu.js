import * as THREE from 'three';

class Menu{
	constructor(game){
		this.game = game;
		this.startButton = new StartButton(this);
		setTimeout(() => {this.addButton(this.startButton)}, 1000);
	}
	newFrame(){}
	addButton(button){
	    this.game.object3D.add(button.object3D);
	    this.game.world.addBody(button.body);
	}
	removeButton(button){
		button.object3D.parent.remove(button.object3D);
		button.body.world.remove(button.body);
	}
	start(){
		this.startButton.alive = true;
		this.addButton(this.startButton);
	}
	
}

class StartButton{
	constructor(menu){
		this.menu = menu;
		this.body;
		this.object3D;
		this.type = 'enemy';
		this.alive = true;
		this.create();
	}
	
	create(){
		let size = 5;
		let position = {x: 10, y:.75, z: 0};

		let shape = new CANNON.Box(new CANNON.Vec3(size/2, .5, size/2));
        let body = new CANNON.Body({mass: 1, shape, position});
        body.obj = this;

        this.body = body;

        const cubeGeo = new THREE.BoxGeometry(size, 1 ,size);
	    const cubeMat = new THREE.MeshPhongMaterial({color: '#6e0000'});
	    this.object3D = new THREE.Mesh(cubeGeo, cubeMat);
	    this.object3D.position.copy(position);
	}

	add(){
	    this.menu.addButton(this);
	}

	damage(){
		if(this.alive){
		    this.menu.removeButton(this);
		    this.menu.game.nextRound();
		    this.alive = false;
		}
	}
}


export { Menu };
