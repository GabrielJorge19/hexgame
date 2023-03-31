import { Weapon } from './weapons/weapon.js';
import { GravitationalWeapon, AntiGravitationalWeapon } from './weapons/weapon2.js';


class Arsenal{
	constructor(player){
		this.player = player;
		this.selectedWeapon = 0;
		this.animations = player.game.animations;
		this.weapons = [
			new Weapon(this),
			new GravitationalWeapon(this),
			new AntiGravitationalWeapon(this)
		]
	}
	newFrame(){this.weapons.map((weapon) => {weapon.newFrame();})}
	shoot(){this.weapons[this.selectedWeapon].shoot()}
	next(){this.selectedWeapon = (this.selectedWeapon == this.weapons.length-1)?0:this.selectedWeapon + 1}
	previous(){this.selectedWeapon = (this.selectedWeapon == 0)?this.weapons.length-1:this.selectedWeapon - 1}
}

export { Arsenal };