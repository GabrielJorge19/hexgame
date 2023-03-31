import { Enemy, Enemy2 } from './enemys/enemy.js';

class Army{
	constructor(game){
		this.game = game;
		this.enemys = [
		{
			name: "Enemy",
			class: Enemy
		}, {
			name: "Enemy2",
			class: Enemy2
		}];

		this.alives = []

	}
	newFrame(){this.alives.map((enemy) => {enemy.newFrame();})}
	createEnemy(name, position){
		let enemyClass = this.enemys.filter((enemy) => {return name == enemy.name})[0].class;

		let enemySize = 3;
		let distanceToPlayer = 0;

		if(!position){
			do {
				position = {
					x: Math.random() * (this.game.mapa.groundSize.x - enemySize) - this.game.mapa.groundSize.x/2,
					y: 1,
					z: Math.random() * this.game.mapa.groundSize.x - this.game.mapa.groundSize.x/2
				}

				distanceToPlayer = this.game.player.body.position.distanceTo(position);
				// Esse trecho vai calcula uma nova posição enquanto a distancia for menor do que o valor especificado
			} while (distanceToPlayer < 15);
		}

		let enemy = new enemyClass(this.game, this.game.player, position);
		this.game.add(enemy);
		this.alives.push(enemy);
	}
	removeEnemy(enemy){
		this.game.remove(enemy);
		this.alives.splice(this.alives.indexOf(enemy), 1);
		this.game.player.score += 1;
		if(this.alives.length == 0) this.game.nextRound();
	}
}

export { Army };
