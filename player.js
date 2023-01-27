import * as THREE from 'three';

class Mapa{
	constructor(){
		const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;

    return mesh;
	}

}

class Player{
	constructor(){
		return this.creatBodyPlayer();
	}

	creatBodyPlayer(){
		const player = new THREE.Object3D();
		player.position.z = 5;
		const boxGeometry = new THREE.BoxGeometry( 5, 1, 5 );
		const material = new THREE.MeshPhongMaterial({color: 0x156289});
		const playerBody = new THREE.Mesh( boxGeometry, material );
		player.add(playerBody);
		return player;
	}
}

class Enemy{
	constructor(){
		const cubeSize = 3;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, 1, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({color: '#6e0000'});
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(0, 5, 8);

    return mesh;
	}
}


class Ctrl{
	constructor(){
		console.log('here');
		const canvas = document.querySelector('#c');
		canvas.addEventListener('keydown', (e) => {
			console.log('teclado');
		})
	}
}

export { Player, Ctrl, Mapa, Enemy};