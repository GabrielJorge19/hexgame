import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Mapa } from './mapa.js';
import { Player } from './player.js';
//import { Enemy, Enemy2 } from './enemy.js';
import { Army } from './army.js';
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

		this.size = 100;
		this.groundSize = {x: 100, y: .5, z: 100}
		this.wallSize = {width: 4, height: 50}
		
		this.menu = new Menu(this);
		this.world = new CANNON.World();
		this.object3D = new THREE.Object3D();
		this.animations = new Animations(this);

		this.currentRound = 0;

		this.army = new Army(this)

		this.mapa = new Mapa(this);
		this.player = new Player(this);

		this.objects = [this.mapa, this.player, this.animations, this.army, this.menu];
		this.add(this.player);


		//this.enemys = this.army.alives;
		this.newFrameFunc = () => {if(!this.paused) this.render(this)}
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
		this.army.alives.map((enemy) => {this.remove(enemy);});
		this.army.alives = [];
		//this.nextRound();
		this.menu.start();
		if(this.paused) this.start();
		this.player.body.position.set(-10, .75, 0);
		this.player.angle = 90;

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
		if(object.body) this.world.addBody(object.body);
		if(object.object3D) this.object3D.add(object.object3D);
	}
	remove(object){
		if(object.body) this.world.remove(object.body);
		if(object.object3D) object.object3D.parent.remove(object.object3D);
	}
	newFrame(){
		this.world.step(1/60);
		this.objects.map((obj) => {obj.newFrame();})
	}
	nextRound(){
		this.currentRound++;
		let enemy = 1 + this.currentRound * 6;
		let enemy2 = 3 + this.currentRound;

		for(let i = 0;i < enemy; i++){this.army.createEnemy("Enemy");}
		for(let i = 0;i < enemy2; i++){this.army.createEnemy("Enemy2");}

		document.getElementById('round').innerHTML = this.currentRound;
		document.getElementById('health').innerHTML = 100;
		this.player.health = 100;
	}
}

let game = new Game();