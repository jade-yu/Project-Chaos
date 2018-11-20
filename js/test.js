function init() {
    scene = new THREE.Scene();

    initializeCelestialBodies();
    initCamera();
    initLights();
    initRenderer();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    document.body.appendChild(renderer.domElement);
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

function initLights() {
    var light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 1, 5000);
    camera.position.set(0, 30, 30);
    camera.lookAt(scene.position);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
}

function initializeCelestialBodies() {
    loader = new THREE.JSONLoader();

    celestialBodies.push(new Object());
    var obj = celestialBodies[0];

    obj.name = names[6];
    obj.texture = new THREE.TextureLoader().load('./textures/' + obj.name + 'Texture.jpg');
    obj.material = new THREE.MeshBasicMaterial({
        map: obj.texture
    });
    obj.base = new THREE.Object3D();
        
    loader.load('./json/' + obj.name + '.json', initializeObject());
}

function initializeObject() {
    var obj = celestialBodies[0];
    
    return function(geometry, materials) {
        obj.mesh = new THREE.Mesh(geometry, obj.material);
        obj.mesh.scale.x = obj.mesh.scale.y = obj.mesh.scale.z = 10;
        obj.mesh.translation = geometry.center();
        obj.mesh.position.x = 0;
        // obj.mesh.geometry.rotateX(Math.PI / 180 * 27);
        obj.mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 180 * 27));

        scene.add(obj.base);

        if(obj.name == "saturn") {
            var rings = new Object();
            obj.rings = rings;
        
            rings.name = "saturnRings";
            rings.texture = new THREE.TextureLoader().load('./textures/' + rings.name + 'Texture.jpg');
            rings.material = new THREE.MeshBasicMaterial({
                map: rings.texture
            });
            rings.base = new THREE.Object3D();
            
            loader.load('./json/' + rings.name + '.json', initializeRings());
        }
    };
}

function initializeRings() {
    var obj = celestialBodies[0];
    var rings = obj.rings;
    
    return function(geometry, materials) {
        rings.mesh = new THREE.Mesh(geometry, rings.material);
        rings.mesh.scale.x = rings.mesh.scale.y = rings.mesh.scale.z = 1.1;
        rings.mesh.translation = geometry.center();
        rings.mesh.position.x = 0;
        // rings.mesh.geometry.rotateX(Math.PI / 180 * 27);
        rings.mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 180 * 27));

        obj.mesh.add(rings.mesh);
    };
}

function rotatePlanets() {
    for(var i = 0 ; i < celestialBodies.length ; i++) {
        if (!celestialBodies[i].mesh) {
            return;
        }

        var obj = celestialBodies[i];

        // obj.eulerOrder = 'YXZ';
        if(i == 2) {
            obj.mesh.rotation.y -= rotations[i];
        } else {
            obj.mesh.rotation.y += 0.01;
            // obj.mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 180));
            // obj.mesh.rotation.x += rotations[i];
        }

        // obj.base.rotation.y += revolutions[i];
    }
}

function render() {
    requestAnimationFrame(render);
    rotatePlanets();

    if(!zoomedIn) {
        for(var i = 0 ; i < celestialBodies.length ; i++) {
            if (!celestialBodies[i].mesh) {
                return;
            }

            var object = celestialBodies[i].mesh;
            var vector = new THREE.Vector3();
            vector.setFromMatrixPosition( object.matrixWorld );
            vector.project(camera);
    
            vector.x = ( vector.x * WIDTH/2 ) + WIDTH/2;
            vector.y = - ( vector.y * HEIGHT/2 ) + HEIGHT/2;

            $('#' + names[i]).css({
                'left': vector.x,
                'top': vector.y - 5,
            });
        }
    }

    renderer.render(scene, camera);
}

init();

$(window).on('load', function () {
    scene.add(celestialBodies[0].mesh);
    render();
});

function onDocumentMouseDown( event ) {
    event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( [celestialBodies[0].mesh] );

    if ( intersects.length > 0 ) {
        intersects[0].object.position.x += 10;
        camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 1, 5000);
        camera.position.z = 5;
        intersects[0].object.add(camera);
    }
}
