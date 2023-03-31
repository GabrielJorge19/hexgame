class Animations{
	constructor(game){
		this.game = game;
		this.animationsAlive = []
		this.animations = {
			gravity: Gravity,
		};

	}
	newFrame(){
		this.animationsAlive.map((animation) => {animation.newFrame()});
		//if(this.animationsAlive.length > 0)console.log(this.animationsAlive.length);
	}
	new(name, options){
		//console.log(name, options);
		this.animationsAlive.push(new this.animations[name](this, options));
	}
	remove(animation){
		this.animationsAlive.splice(this.animationsAlive.indexOf(animation), 1);

	}
}


class Gravity{
	constructor(animator, options){
		this.animator = animator;
		this.game = animator.game;
		this.time = new Date().getTime();
		this.position = options.position || {x:0, y:0, z:0};
		this.force = options.force || 3000;
		this.direction = options.direction || -1;
		this.duration = options.duration || .5;
		this.range = options.range || 3;
	}

	newFrame(){
		if(!this.remove()){
			this.applyLocalForce();
		}	
	}

	remove(){
		if(new Date().getTime() - this.time > this.duration * 1000){
			this.animator.remove(this);
			return true;
		}
	}

	applyLocalForce(){
		this.game.army.alives.map((enemy) => {move(enemy, this)})
		move(this.game.player, this);

		function move(object, game){
			let distance = object.body.position.distanceTo(game.position);
			if(distance > game.range){
				return;
			} else if(distance > 0.1){
				let intensity = (game.range - distance)/game.range *game.force * game.direction;
				let x = intensity * (game.position.x - object.body.position.x) / distance;
				let z = intensity * (game.position.z - object.body.position.z) / distance;
				object.body.force.vadd({x, y: 0, z}, object.body.force);
			}
		}
	}
}

export { Animations };