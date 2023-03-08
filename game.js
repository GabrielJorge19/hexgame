import * as THREE from 'three';
import { Mapa } from './mapa.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';


//Para obter um quaternion que faz seu corpo ficar voltado para uma determinada direção, você pode usar Quaternion.setFromVectors(u,v)



class Game{
	constructor(){
		this.frame = 0;
		this.size = 100;
		this.groundSize = {x: 100, y: .5, z: 100}
		this.wallSize = {width: 4, height: 50}
		this.objects = [];
		
		this.world = new CANNON.World();
		this.object3D = new THREE.Object3D();

		//this.init();


		this.mapa = new Mapa(this);
		this.player = new Player(this);
		this.add(this.player);

		this.enemys = [];

		this.createEnemy({x: 10, y:1, z: 0});
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
	createEnemy(position){
		if(!position){
			position = {
				x: Math.random() * this.mapa.groundSize.x - this.mapa.groundSize.x/2,
				y: 1,
				z: Math.random() * this.mapa.groundSize.x - this.mapa.groundSize.x/2
			}
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

		//if(this.frame % 100 == 0){this.createEnemy()}
		if(this.frame == 300){new MovementAnimation()}
	}
}


class ForceAnimation{
	constructor(data){
		this.position = {x:0, y:1, z:0}
		this.force = 1;
		this.duration = 5;
		this.range = 10;
	}
}


export { Game };