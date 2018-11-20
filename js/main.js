init();

$(window).on('load', function () {
    // celestialBodies[0].base.position.z = -10;
    scene.add(celestialBodies[0].base);
    initializeRings();
    initOrbit();
    randomizePlanets();
    render();
});

function render() {
    requestAnimationFrame(render);

    if(zoomedIn) {
        rotatePlanetZoomed();
    } else {
        rotatePlanets();
        updateInfoBox();
    }

    renderer.render(currScene, currCam);
}

function init() {
    scene = new THREE.Scene();
    currScene = scene;

    initValues(1);
    initializeCelestialBodies();
    initCamera();
    initLights();
    initRenderer();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    document.body.appendChild(renderer.domElement);
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );

    window.addEventListener('resize', function() {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });
}

function initValues(speed) {
    rotationSpeed = Math.PI / 180 * speed;
    revolutionSpeed = rotationSpeed/365.2;
    rotations = [
        rotationSpeed/25,
        rotationSpeed/58.625,
        rotationSpeed/243,
        rotationSpeed/1,
        rotationSpeed/1.0275,
        rotationSpeed/0.4125,
        rotationSpeed/0.45,
        rotationSpeed/0.718,
        rotationSpeed/0.67125,
        rotationSpeed/6.4,
    ];
    revolutions = [
        0,
        revolutionSpeed/0.241,
        revolutionSpeed/0.615,
        revolutionSpeed/1,
        revolutionSpeed/1.88,
        revolutionSpeed/11.86,
        revolutionSpeed/29.46,
        revolutionSpeed/84,
        revolutionSpeed/165,
        revolutionSpeed/248,
    ];
}

function changeScale(input) {
    globalScale = input;

    if(realScale) {
        for(var id = 0 ; id < names.length ; id++) {
            var obj = celestialBodies[id];
        
            if(obj.name == "sun") {
                obj.mesh.scale.x = obj.mesh.scale.y = obj.mesh.scale.z = globalScale;
            } else {
                obj.mesh.scale.x = obj.mesh.scale.y = obj.mesh.scale.z = globalScale;
                obj.mesh.position.x = (-baseDistance - distances[id]) * globalScale;
            }
        }
    } else {
        for(var id = 0 ; id < names.length ; id++) {
            var obj = celestialBodies[id];
        
            if(obj.name == "sun") {
                obj.mesh.scale.x = obj.mesh.scale.y = obj.mesh.scale.z = globalScale * 2;
            } else {
                obj.mesh.scale.x = obj.mesh.scale.y = obj.mesh.scale.z = globalScale * 3;
                obj.mesh.position.x = (-baseDistance - distancesScaled[id]) * globalScale;
            }
        }
    }

    if(showOrbit) {
        removeOrbit();
        initOrbit();
    }
}

function initLights() {
    var light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 1, 5000);
    camera.position.set(0, 20, 30);
    camera.lookAt(scene.position);
    controls = new THREE.OrbitControls(camera);
    currCam = camera;
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
}

function initializeCelestialBodies() {
    loader = new THREE.JSONLoader();
    for(var id = 0 ; id < names.length ; id++) {
        celestialBodies.push(new Object());

        var obj = celestialBodies[id];

        obj.name = names[id];
        obj.texture = new THREE.TextureLoader().load('./textures/' + obj.name + 'Texture.jpg');
        obj.material = new THREE.MeshBasicMaterial({
            map: obj.texture
        });
        obj.base = new THREE.Object3D();
        
        loader.load('./json/' + obj.name + '.json', initializeObject(id));
    }
}

function initializeObject(id) {
    var obj = celestialBodies[id];
    var scale, position;
    
    if(obj.name == "sun") {
        scale = globalScale * 2;
        position = 0;
    } else {
        scale = globalScale * 3;
        // position = - id * 10 - 10;
        position = -baseDistance - distancesScaled[id];
        celestialBodies[0].base.add(obj.base);
    }

    return function (geometry, materials) {
        obj.mesh = new THREE.Mesh(geometry, obj.material);
        obj.mesh.scale.x = obj.mesh.scale.y = obj.mesh.scale.z = scale;
        obj.mesh.translation = geometry.center();
        obj.mesh.position.x = position;
        if(obj.name == "uranus") {
            obj.mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 180 * -98));
        } else if(obj.name == "saturn") {
            obj.mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 180 * 27));
        }

        obj.mesh.objId = id;
        obj.base.add(obj.mesh);
        objects.push(obj.mesh);
    };
}

function initializeRings() {
    var obj = celestialBodies[6];
    var rings = new Object();
    obj.rings = rings;

    rings.name = "saturnRings";
    rings.texture = new THREE.TextureLoader().load('./textures/' + rings.name + 'Texture.jpg');
    rings.material = new THREE.MeshBasicMaterial({
        map: rings.texture
    });
    rings.base = new THREE.Object3D();
    
    loader.load('./json/' + rings.name + '.json', initRings());
}

function initRings() {
    var obj = celestialBodies[6];
    var rings = obj.rings;
    
    return function(geometry, materials) {
        rings.mesh = new THREE.Mesh(geometry, rings.material);
        rings.mesh.scale.x = rings.mesh.scale.y = rings.mesh.scale.z = 1;
        rings.mesh.translation = geometry.center();
        rings.mesh.position.x = 0;
        rings.mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 180 * 27));

        obj.mesh.add(rings.mesh);
    };
}

function initOrbit() {
    for(var id = 1 ; id < celestialBodies.length ; id++) {
        var planet = celestialBodies[id];
        var geometry = new THREE.CircleGeometry(celestialBodies[0].mesh.position.distanceTo(planet.mesh.position), 3000);
        geometry.vertices.shift();
        geometry.rotateX(-Math.PI / 2);
        var material = new THREE.LineBasicMaterial( { color: 0x777777 } );
        var orbit = new THREE.Line( geometry, material );
        orbit.position.z = celestialBodies[0].base.position.z;
        orbit.name = celestialBodies[id].name + "Orbit";

        celestialBodies[id].orbit = orbit;
        scene.add(orbit);
    }
}

function removeOrbit() {
    for(var id = 0 ; id < celestialBodies.length ; id++) {
        var obj = currScene.getObjectByName(celestialBodies[id].name + "Orbit");
        currScene.remove(obj);
    }
}

function alignPlanets() {
    for(var id = 0 ; id < names.length ; id++) {
        if (!celestialBodies[id].mesh) {
            return;
        }
        celestialBodies[id].base.rotation.y = 0;
    }
}

function randomizePlanets() {
    for(var id = 0 ; id < names.length ; id++) {
        if (!celestialBodies[id].mesh) {
            return;
        }
        celestialBodies[id].base.rotation.y += Math.floor((Math.random() * 100) + 1);
    }
}

function rotatePlanets() {
    for(var id = 0 ; id < names.length ; id++) {
        if (!celestialBodies[id].mesh) {
            return;
        }

        var obj = celestialBodies[id];

        if(obj.name == "venus") {
            obj.mesh.rotation.y -= rotations[id];
        } else {
            obj.mesh.rotation.y += rotations[id];
        }

        obj.base.rotation.y += revolutions[id];
    }
}

function rotatePlanetZoomed() {
    if(currObj.objId == 2) {
        currObj.rotation.y -= rotations[currObj.objId];
    } else {
        currObj.rotation.y += rotations[currObj.objId];
    }
}

function onDocumentMouseDown( event ) {
    if(zoomedIn)
        return;

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, currCam );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 && !zoomedIn ) {
        showInfo(intersects[0].object.objId);
    }
}

function showInfo(id) {
    zoomedIn = true;
    showBackButton();
    toggleInfoBox();
    toggleControls();
    currScene = new THREE.Scene();
    
    currObj = celestialBodies[id].mesh.clone();
    currObj.objId = id;
    currObj.position.x = currObj.position.y = currObj.position.z = 0;
    currObj.scale.x = currObj.scale.y = currObj.scale.z = scaleToSize[id];

    $('#name').text(names[id].charAt(0).toUpperCase() + names[id].substr(1).toLowerCase());
    $('#name').removeClass('hide');

    currCam = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 1, 5000);
    currCam.position.set(0, 0, 10);
    currCam.lookAt(scene.position);
    
    currScene.add(currObj);
    
    renderer.render(currScene, currCam);
}

function showBackButton() {
    $('#backButton').removeClass('hide');

    $('#backButton').click(function () {
        $(this).addClass('hide');
        $('#name').addClass('hide');
        zoomedIn = false;

        toggleControls();
        toggleInfoBox();

        currScene = scene;
        currCam = camera;
        renderer.render(currScene, camera);
    });
}

function updateInfoBox() {
    var frustum = new THREE.Frustum();
    var cameraViewProjectionMatrix = new THREE.Matrix4();
    camera.matrixWorldInverse.getInverse( currCam.matrixWorld );cameraViewProjectionMatrix.multiplyMatrices(currCam.projectionMatrix, currCam.matrixWorldInverse);
    frustum.setFromMatrix( cameraViewProjectionMatrix );

    for(var i = 0 ; i < celestialBodies.length ; i++) {
        if (!celestialBodies[i].mesh) {
            return;
        }

        var object = celestialBodies[i].mesh;
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition( object.matrixWorld );
        vector.project(currCam);

        vector.x = ( vector.x * WIDTH/2 ) + WIDTH/2;
        vector.y = - ( vector.y * HEIGHT/2 ) + HEIGHT/2;

        if(frustum.intersectsObject(object) && showInfoBox) {
            $('#' + names[i]).removeClass('hide');

            $('#' + names[i]).css({
                'left': vector.x - 15,
                'top': vector.y - 25,
            });
        } else {
            $('#' + names[i]).addClass('hide');
        }
    }
}

function toggleInfoBox() {
    if(zoomedIn || !showInfoBox) {
        $('#toggleInfoBox').val('Info Boxes OFF');
        for(var i = 0 ; i < celestialBodies.length ; i++) {
            $('#' + names[i]).addClass('hide');
        }
    } else {
        $('#toggleInfoBox').val('Info Boxes ON');
        for(var i = 0 ; i < celestialBodies.length ; i++) {
            $('#' + names[i]).removeClass('hide');
        }
    }
}

function toggleOrbit() {
    showOrbit = !showOrbit;
    
    if(showOrbit) {
        $('#toggleOrbit').val('Orbits OFF');
        showOrbit = false;
        removeOrbit();
    } else {
        $('#toggleOrbit').val('Orbits ON');
        showOrbit = true;
        initOrbit();
    }
}