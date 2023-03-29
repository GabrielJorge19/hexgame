import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Mapa } from './mapa.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Animations } from './animations.js';
import { Menu } from './menu.js';


//Para obter um quaternion que faz seu corpo ficar voltado para uma determinada direção, você pode usar Quaternion.setFromVectors(u,v)



class Game{
	constructor(){
		this.canvas = document.querySelector('#c');
		this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
		this.camera = new THREE.PerspectiveCamera(45, 2, 0.1, 1000);
		this.camera.position.set(0,131,150);
  		this.scene = new THREE.Scene();
  		this.scene.background = new THREE.Color('gray');

		this.light = new THREE.DirectionalLight(0xFFFFFF, 1);
		this.light.position.set(0, 10, 0);
		this.light.target.position.set(0, 0, 0);

  		this.scene.add(this.light);
  		this.scene.add(this.light.target);

  		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.target.set(0, 5, 0);
		this.controls.update();

		console.clear();

		document.getElementById('restart').addEventListener('click', () => {this.restart()});
		window.addEventListener('resize', () => {this.resizeRendererToDisplaySize(this);});


		this.paused = false;

		this.frame = 0;
		this.size = 100;
		this.groundSize = {x: 100, y: .5, z: 100}
		this.wallSize = {width: 4, height: 50}
		
		this.menu = new Menu(this);
		this.world = new CANNON.World();
		this.object3D = new THREE.Object3D();
		this.animations = new Animations(this);
		this.objects = [this.animations];

		//this.init();
		this.currentRound = 0;


		this.mapa = new Mapa(this);
		this.player = new Player(this);
		this.add(this.player);

		this.enemys = [];
		this.newFrameFunc = () => {if(!this.paused) this.render(this)}
		//this.nextRound();

		this.scene.add(this.object3D);
		
		this.resizeRendererToDisplaySize(this);
	}
	resizeRendererToDisplaySize(game){
	    let canvas = game.renderer.domElement;
	    let width = canvas.clientWidth;
	    let height = canvas.clientHeight;
	    if (canvas.width !== width || canvas.height !== height){
	    	game.renderer.setSize(width, height, false);
	      	game.camera.aspect = canvas.clientWidth / canvas.clientHeight;
	      	game.camera.updateProjectionMatrix();
	    }
	    requestAnimationFrame(this.newFrameFunc);
  	}
  	render(game){
	    game.newFrame()
	    game.renderer.render(game.scene, game.camera);
	    requestAnimationFrame(game.newFrameFunc);
	}
	start(){
		this.paused = false;
		requestAnimationFrame(this.newFrameFunc);
	}
	stop(){
		this.paused = true;
	}
	restart(){
		this.currentRound = 0;
		this.enemys.map((enemy) => {this.remove(enemy);});
		this.enemys = [];
		this.nextRound();
		if(this.paused) this.start();

		document.getElementById('enemys').innerHTML = 0;
		document.getElementById('end').style.display = "none";
	}
	invertPaused(){
		if(this.paused){
			this.start();
		} else {
			this.stop();
		}
	}
	lost(){
		document.getElementById('end').style.display = "block";
		document.getElementById('abates').innerHTML = this.player.score;
		this.player.score = 0;

		this.stop();
	}
	add(object){
		this.object3D.add(object.object3D);
		this.objects.push(object);
		this.world.addBody(object.body);
	}
	remove(object){
		this.world.remove(object.body);
		object.object3D.parent.remove(object.object3D);
		this.objects.splice(this.objects.indexOf(object), 1);
	}
	createEnemy(position){
		let enemySize = 3;
		let distanceToPlayer = 0;

		if(!position){
			do {
				position = {
					x: Math.random() * (this.mapa.groundSize.x - enemySize) - this.mapa.groundSize.x/2,
					y: 1,
					z: Math.random() * this.mapa.groundSize.x - this.mapa.groundSize.x/2
				}

				distanceToPlayer = this.player.body.position.distanceTo(position);
				// Esse trecho vai calcula uma nova posição enquanto a distancia for menor do que o valor especificado
			} while (distanceToPlayer < 15);
		}

		this.enemys.push(new Enemy(this, this.player, position));
	}
	removeEnemy(enemy){
		this.remove(enemy);
		this.enemys.splice(this.enemys.indexOf(enemy), 1);
		this.player.score += 1;
		document.getElementById('enemys').innerHTML = this.enemys.length;
		if(this.enemys.length == 0)	this.nextRound();
	}
	newFrame(){
		this.frame++;
		this.world.step(1/60);
		this.objects.map((obj) => {obj.newFrame();})
	}
	nextRound(){
		this.currentRound++;
		let enemyCount = 2 + this.currentRound * 3;

		for(let i = 0;i < enemyCount; i++){
			this.createEnemy();
		}

		document.getElementById('round').innerHTML = this.currentRound;
		document.getElementById('enemys').innerHTML = enemyCount;
		document.getElementById('health').innerHTML = 100;
		this.player.health = 100;
	}
}

let game = new Game();