//three.js 設定
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({
    antialias: true,   //アンチエイリアス
    alpha: true,       //透明度
});

//レンダラー設定
renderer.setClearColor(new THREE.Color("black"), 0);        //背景色
renderer.setPixelRatio(window.devicePixelRatio);            //ピクセル比
renderer.setSize(window.innerWidth, window.innerHeight);    //サイズ
renderer.domElement.style.position = "absolute";            //位置は絶対座標
renderer.domElement.style.top = "0px";                      //上端
renderer.domElement.style.left = "0px";                     //左端
document.body.appendChild(renderer.domElement);             //bodyに追加

//カメラ設定
//アスペクト比を対応させる必要があるかも
//  （CHECK）カメラのアスペクト比を正す
//  camera.aspect = width / height;
//  camera.updateProjectionMatrix();
var camera = new THREE.Camera();
scene.add(camera);

//光源設定
var light = new THREE.DirectionalLight(0xffffff);     // 平行光源（白）

light.position.set(0, 0, 2);// カメラ方向に配置 (CHECK)
scene.add(light);

//AR設定
//マーカ用のメディアソース設定
var source = new THREEx.ArToolkitSource({
    sourceType: "webcam",
});

source.init(function onReady() {
    // リサイズ処理
    onResize();
});

// ウィンドウサイズが変更された場合も
window.addEventListener("resize", function () {
    // リサイズ処理
    onResize();
});

// リサイズ関数
function onResize() {
    //トラッキングソースとレンダラをリサイズ
    //arControllerもリサイズする
    source.onResizeElement();
    source.copyElementSizeTo(renderer.domElement);
    if (context.arController !== null) {
        source.copyElementSizeTo(context.arController.canvas);
    }
}

//カメラパラメータ、マーカ検出設定
var context = new THREEx.ArToolkitContext({
    debug: false,                                       // デバッグ用キャンバス表示（デフォルトfalse）
    cameraParametersUrl: "assets/markers/camera_para.dat",             // カメラパラメータファイル
    detectionMode: "mono",                              // 検出モード（color/color_and_matrix/mono/mono_and_matrix）
    imageSmoothingEnabled: true,                        // 画像をスムージングするか（デフォルトfalse）
    maxDetectionRate: 60,                               // マーカの検出レート（デフォルト60）
    canvasWidth: source.parameters.sourceWidth,         // マーカ検出用画像の幅（デフォルト640）
    canvasHeight: source.parameters.sourceHeight,       // マーカ検出用画像の高さ（デフォルト480）
});
context.init(function onCompleted() {                  // コンテクスト初期化が完了したら
    camera.projectionMatrix.copy(context.getProjectionMatrix());   // 射影行列をコピー
});


//---------------------------------------------------------------------
//シーン構成
//---------------------------------------------------------------------

//マーカーを登録
var marker1 = new THREE.Group();
var controls = new THREEx.ArMarkerControls(context, marker1, {
    type: "pattern",
    patternUrl: "assets/markers/hiro.patt",
});

//シーンにマーカーを追加
scene.add(marker1);
//このmarker1にモデルを追加していく

// モデル1（富士山）
// THREE.CylinderGeometry(topRadius, buttomRadius, height, segmentsRadius, segmentsHeight, openEnded)
//　大きさに注意,高さ10だと大きすぎる
var geometry = new THREE.CylinderGeometry(0.1, 0.5, 1, 16, 16, true);

const textureLoader = new THREE.TextureLoader();
const textureFuji = textureLoader.load("assets/textures/fuji.jpg");

var materia1 = new THREE.MeshBasicMaterial({
    map: textureFuji
});

//メッシュの生成
var meshFuji = new THREE.Mesh(geometry, materia1);
//meshFuji.overdraw = true; //CHECK
meshFuji.name = "fuji";
meshFuji.position.set(0, 0.5, 0);
marker1.add(meshFuji);

geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16, 16, false);
materia1 = new THREE.MeshBasicMaterial(
    { color: 0xFFFFFF }
);
var meshFujiTop = new THREE.Mesh(geometry, materia1);
meshFujiTop.position.set(0, 0.5, 0);
marker1.add(meshFujiTop);


//---------------------------------------------------------------------
//　描画
//---------------------------------------------------------------------

//描画関数
function renderScene() {
    //ブラウザの描画更新ごとに呼び出される
    requestAnimationFrame(renderScene);
    if (source.ready === false) { return; }             // メディアソースの準備ができていなければ抜ける
    context.update(source.domElement);                  // ARToolkitのコンテキストを更新
    TWEEN.update();                                     // Tweenアニメーションを更新
    renderer.render(scene, camera);                     // レンダリング実施
}
renderScene();    