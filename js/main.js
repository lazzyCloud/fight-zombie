import Zombie from "./Zombie.js";
import Girl from "./Girl.js";

let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};




window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    scene.enablePhysics();
    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    
    //engine.runRenderLoop(() => {
    scene.toRender = () => {
        let deltaTime = engine.getDeltaTime(); // remind you something ?F
        // use deltaTime to calculate move distance
        let tank = scene.getMeshByName("heroTank");
        if (tank) {
            
            tank.Girl.move(scene,inputStates, deltaTime);
            tank.Girl.slash(inputStates, scene);
        }
        

        if(scene.zombies) {
        
            for(var i = 0 ; i < scene.zombies.length ; i++) {
                if (inputStates.up || inputStates.down) {
                    scene.zombies[i].Zombie.chase(scene,tank, deltaTime);
                } else {
                    scene.zombies[i].Zombie.move(scene,tank,deltaTime);
                }
                
            }
        }    


        scene.render();
    }//);
    scene.assetsManager.load();
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    scene.assetsManager = configureAssetManager(scene);
    let ground = createGround(scene);
    let freeCamera = createFreeCamera(scene);

    scene.collisionsEnabled = true;
    createGirl(scene);
    

    createLights(scene);


    createZombie(scene);
    loadSounds(scene);
   return scene;
}

function configureAssetManager(scene) {
    // useful for storing references to assets as properties. i.e scene.assets.cannonsound, etc.
    scene.assets = {};

    let assetsManager = new BABYLON.AssetsManager(scene);

    assetsManager.onProgress = function(remainingCount, totalCount, lastFinishedTask) {
        engine.loadingUIText = 'We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.';
        console.log('We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.');
    };

    assetsManager.onFinish = function(tasks) {
        engine.runRenderLoop(function() {
            scene.toRender();  
        });
    };


    return assetsManager;

}

function loadSounds(scene) {
    var assetsManager = scene.assetsManager;
    var binaryTask = assetsManager.addBinaryFileTask("zombieSound", "sounds/zombie.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets.zombieSound = new BABYLON.Sound("zombie", task.data, scene, null, { loop: true });
    }

    binaryTask = assetsManager.addBinaryFileTask("slashSound", "sounds/slash.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets.slashSound = new BABYLON.Sound("slash", task.data, scene, null, { loop: false });
    }

    //binaryTask = assetsManager.addBinaryFileTask("dieSound", "sounds/dying.wav");
    //binaryTask.onSuccess = function (task) {
    //    scene.assets.dieSound = new BABYLON.Sound("die", task.data, scene, null, { loop: false });
    //}
    //binaryTask = assetsManager.addBinaryFileTask("explosion", "sounds/explosion.mp3");
    //binaryTask.onSuccess = function (task) {
    //    scene.assets.explosion = new BABYLON.Sound("explosion", task.data, scene, null, { loop: false });
    //}

    //binaryTask = assetsManager.addBinaryFileTask("pirates", "sounds/pirateFun.mp3");
    //binaryTask.onSuccess = function(task) {
    //    scene.assets.pirateMusic = new BABYLON.Sound("piratesFun", task.data, scene, null, {
    //      loop: true,
    //      autoplay: true
    //    });
    //  };
}
function createGround(scene) {
    const groundOptions = { width:2000, height:2000, subdivisions:20, minHeight:0, maxHeight:100, onReady: onGroundCreated};
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap2.jpg', groundOptions, scene); 

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        // change texture of ground
        let myTexture = new BABYLON.Texture("images/ground.jpg")
        myTexture.uScale = 20;    myTexture.vScale = 20;
        groundMaterial.diffuseTexture = myTexture;
        // add ground color
        groundMaterial.useRGBColor = false;
        groundMaterial.primaryColor = BABYLON.Color3.Magenta();
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        //ground.checkCollisions = true;
        //groundMaterial.wireframe=true;
        // for physic engine
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene);  
    }
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    // similate natural light
    var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    //let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);

}

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
    // prevent camera to cross ground
    camera.checkCollisions = true; 
    // avoid flying with the camera
    camera.applyGravity = true;

    // Add extra keys for camera movements
    // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
    camera.keysUp.push('z'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysLeft.push('q'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysUp.push('Z'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysLeft.push('Q'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene,target) {
    let camera = new BABYLON.FollowCamera("tankFollowCamera",target.position, scene,target);

    camera.radius = 100; // how far from the object to follow
	camera.heightOffset = 40; // how high above the object to place the camera
    // change viewing angle, should follow dude's view
	camera.rotationOffset = 0; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit
    return camera;
}

let zMovement = 5;
function createGirl(scene) {
    // create girl instead of tank
    let meshTask = scene.assetsManager.addMeshTask("Girl task","", "models/Girl/", "girl.babylon");
    meshTask.onSuccess = function (task) {
        onGirlImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }

    function onGirlImported(newMeshes, particleSystems, skeletons) {
    //BABYLON.SceneLoader.ImportMesh("", "models/Girl/", "girl.babylon", scene,  (newMeshes, particleSystems, skeletons) => {
        for (var index = 0; index < newMeshes.length; index++) {
			newMeshes[index].position = new BABYLON.Vector3(0, 0, 5);
            newMeshes[index].scaling = new BABYLON.Vector3(0.2 , 0.2, 0.2);
            newMeshes[index].rotation = new BABYLON.Vector3( -Math.PI/2 , 0, 0);
		}

        // give it a name so that we can query the scene to get it by name
        newMeshes[0].name = "heroTank";

        newMeshes[1].name = "swordMesh";

        let tank = new Girl(newMeshes[0], newMeshes[1], 0.5, skeletons[0]);
        tank.setAnims(scene, skeletons[0]);
        tank.createBoundingBox(scene);
        // create follow camera after creating tank
        // otherwise camera may attach to null due to async steps during scene creation
        let followCamera = createFollowCamera(scene, tank.girlMesh);
        scene.activeCamera = followCamera;

    }//);

}

function createZombie(scene) {
    let meshTask = scene.assetsManager.addMeshTask("Zombie task","Zombie_Geo", "models/Zombie/", "Zombie.babylon");
    meshTask.onSuccess = function (task) {
        onZombieImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
    }

    function onZombieImported(newMeshes, particleSystems, skeletons) {
    //BABYLON.SceneLoader.ImportMesh("Zombie_Geo", "models/Zombie/", "Zombie.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        let zombie = newMeshes[0];
        
        // make zombie smaller, rotate zombie
        zombie.scaling = new BABYLON.Vector3(0.2  , 0.2, 0.2);
        zombie.name = "zombie";
        let xrand = Math.floor(Math.random()*1000 - 500);
        let zrand = Math.floor(Math.random()*1000 - 500);
    
        zombie.position = new BABYLON.Vector3(xrand, 0, zrand);
        zombie.rotation = new BABYLON.Vector3( -Math.PI/2 , 0, 0);
        //scene.beginAnimation(zombie.skeleton, 412, 532, true, 1);
        let oneZombie = new Zombie(zombie, 0.2, 0);
        oneZombie.setAnims(scene, zombie.skeleton);
        oneZombie.createBoundingBox(scene);
        oneZombie.createParticleSystem(scene);
        // make clones
        scene.zombies = [];
        for(let i = 0; i < 10; i++) {
            scene.zombies[i] = doClone(zombie, skeletons, i);
            //scene.beginAnimation(, 412, 532, true, 1);
            var temp = new Zombie(scene.zombies[i], 0.2, i+1);
            temp.setAnims(scene, scene.zombies[i].skeleton);
            temp.createBoundingBox(scene);
            //temp.createParticleSystem(scene);
        }
        scene.zombies[scene.zombies.length] = zombie;

    }//);	
}


function doClone(originalMesh, skeletons, id) {
    let myClone;
    let xrand = Math.floor(Math.random()*1000-500);
    let zrand = Math.floor(Math.random()*1000-500);

    myClone = originalMesh.clone("clone_" + id);
    myClone.position = new BABYLON.Vector3(xrand, 0, zrand);
    myClone.rotation.y = Math.random() * Math.PI;
    if(!skeletons) return myClone;

    // The mesh has at least one skeleton
    if(!originalMesh.getChildren()) {
        myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
        return myClone;
    } else {
        if(skeletons.length === 1) {
            // the skeleton controls/animates all children, like in the Dude model
            let clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
            myClone.skeleton = clonedSkeleton;
            let nbChildren = myClone.getChildren().length;

            for(let i = 0; i < nbChildren;  i++) {
                myClone.getChildren()[i].skeleton = clonedSkeleton
            }
            return myClone;
        } else if(skeletons.length === originalMesh.getChildren().length) {
            // each child has its own skeleton
            for(let i = 0; i < myClone.getChildren().length;  i++) {
                myClone.getChildren()[i].skeleton() = skeletons[i].clone("clone_" + id + "_skeleton_" + i);
            }
            return myClone;
        }
    }

    return myClone;
}

window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {
    // as soon as we click on the game window, the mouse pointer is "locked"
    // you will have to press ESC to unlock it
    scene.onPointerDown = () => {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    }

    document.addEventListener("pointerlockchange", () => {
        let element = document.pointerLockElement || null;
        if(element) {
            // lets create a custom attribute
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }
    })

    // key listeners for the tank
    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = true;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = true;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = true;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = true;
        }  else if (event.key === " ") {
           inputStates.space = true;
        }
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', (event) => {

        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = false;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = false;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = false;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = false;
        }  else if (event.key === " ") {
           inputStates.space = false;
        }
    }, false);
}

