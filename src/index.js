import * as THREE from "three";
import { Earth } from "./objects/earth";
import { Moon } from "./objects/moon";
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

addEventListener("DOMContentLoaded", () => {
  new ChasingTheMoon();
});

export default class ChasingTheMoon {

  constructor() {
    
    // シーン作成
    this.scene = new THREE.Scene();

    // カメラ作成
    this.camera = new THREE.PerspectiveCamera(
      60,
      innerWidth / innerHeight,
      1, 2000
    );
    this.camera.position.set(300, 35, 100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // レンダラー作成
    this.renderer = new WebGLRenderer({
      antialias: devicePixelRatio === 1,
    });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.shadowMap.enabled = true;

    const container = document.getElementById("canvas-container");
    container.appendChild(this.renderer.domElement);

    // 環境光作成
    const ambientLight = new THREE.AmbientLight(0x111111);
    this.scene.add(ambientLight);

    // スポットライト作成
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(1000, 0, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    // 地球読み込み
    this.earth = new Earth();
    this.scene.add(this.earth);

    // 月読み込み
    this.moon = new Moon();
    this.scene.add(this.moon);

    // 背景作成
    const geo_star  = new THREE.SphereGeometry(500, 60, 40);
    geo_star.scale(-1, 1,1);
    const mat_star  = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("images/galaxy_starfield.jpg"),
    })
    this.mesh_star  = new THREE.Mesh(geo_star, mat_star);
    this.scene.add(this.mesh_star);

    this.radius = 200;
    this.frontVector = new THREE.Vector3(0, -1, 0);
    this.theta = 0;
    this.dTheta = 2 * Math.PI / 1000;

    // ループ関数コール
    this.render();

    // 画面リサイズ関数コール
    window.addEventListener("resize", () => {
      this.onResize();
    });

  }

  render() {

    // 背景を右に回転
    this.mesh_star.rotation.y += 0.0006;

    // 地球回転関数コール
    this.earth.update();

    // 月の現在の位置を保持
    const oldPosition = this.moon.position.clone();
    
    // 月の新しい位置を取得
    const newPosition = this.getCircularMotionPosition();

    // 進んでいる方向のベクトルを算出
    this.frontVector = newPosition.clone().sub(oldPosition);

    // 単位ベクトルに変換
    this.frontVector = this.frontVector.normalize();

    // 背面ベクトル
    const backVector = this.frontVector.clone().negate();

    // 月とカメラの距離
    const distance = 100;

    // 背面ベクトルを距離分伸ばす
    backVector.multiplyScalar(distance);

    // カメラ位置を算出
    const cameraPosition = backVector.add(this.moon.position);
    this.camera.position.copy(cameraPosition);

    // カメラを月に向かせる
    this.camera.lookAt(this.moon.position);

    // 月の位置を更新
    this.moon.position.copy(newPosition);

    // 画面に表示
    this.renderer.render(this.scene, this.camera);

    // 次のフレームコール
    requestAnimationFrame(() => { this.render(); });

  }

  getCircularMotionPosition() {

    this.theta += this.dTheta;
    
    const x = this.radius * Math.cos(this.theta);
    const y = this.radius * Math.sin(this.theta * 1.5) / 7;
    const z = this.radius * Math.sin(this.theta);
  
    return new THREE.Vector3(x, y, z);
  }

  onResize() {
    // サイズを取得
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーのサイズを調整する
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    // カメラのアスペクト比を正す
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

}

