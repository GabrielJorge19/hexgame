import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { Mapa } from './player.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 1000);
  camera.position.set(0,200,200);

  
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();
  

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('gray');

  const mapa = new Mapa();
  scene.add(mapa.object3D);

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);


  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    mapa.newFrame()
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
console.clear();
//console.log("Fazer a indentificação do mouse no plano, baixei alguns exemplos está na pasta cannon-es")