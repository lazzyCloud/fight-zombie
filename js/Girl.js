export default class Girl {
    constructor(girlMesh, swordMesh, speed) {
        this.girlMesh = girlMesh;
        this.swordMesh = swordMesh;

        if(speed)
            this.speed = speed;
        else
            this.speed = 0.5;
        this.idleAnim = null;
        this.walkAnim = null;
        this.backWalkAnim = null;
        this.deathAnim = null; 
        this.impactAnim = null;
        this.slashAnim = null;
        this.life=100;
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
        // in case, attach the instance to the mesh itself, in case we need to retrieve
        // it after a scene.getMeshByName that would return the Mesh
        // SEE IN RENDER LOOP !
        girlMesh.Girl = this;

        // FOR COLLISIONS, let's associate a BoundingBox to the Dude

        // singleton, static property, computed only for the first dude we constructed
        // for others, we will reuse this property.
        if (Girl.boundingBoxParameters == undefined) {
            Girl.boundingBoxParameters = this.calculateBoundingBoxParameters();

        }
        //sphere.setBoundingInfo(new BABYLON.BoundingInfo(newMin, newMax));
        this.girlMesh.setBoundingInfo(Girl.boundingBoxParameters);
        //this.girlMesh.showBoundingBox = true;

        this.girlMesh.checkCollisions = true;
        this.frontVector = new BABYLON.Vector3(Math.sin(this.girlMesh.rotation.y), 0, Math.cos(this.girlMesh.rotation.y));
        this.bounder = null;
        
        this.canSlash = true;
        this.slashInterval = 1;

    }
    setAnims(scene, skeleton) {
        this.idleAnim = scene.beginWeightedAnimation(skeleton,143, 252, 1.0, true);
        this.walkAnim = scene.beginWeightedAnimation(skeleton,462, 500, 0.0, true);
        this.backWalkAnim = scene.beginWeightedAnimation(skeleton,0, 40, 0.0, true);
        this.deathAnim = scene.beginWeightedAnimation(skeleton,52, 129, 0.0, true);
        this.impactAnim = scene.beginWeightedAnimation(skeleton,260, 299, 0.0, true);
        this.slashAnim = scene.beginWeightedAnimation(skeleton, 382, 436, 0.0, true);
    }
    resetAnims() {
        this.idleAnim.weight = 0;
        this.walkAnim.weight = 0;
        this.backWalkAnim.weight = 0; 
        this.deathAnim.weight = 0;
        this.impactAnim.weight = 0;
        this.slashAnim.weight = 0;
    }
    setWalkAnim() {
        this.resetAnims();
        this.walkAnim.weight = 1.0;
    }
    setBackWalkAnim() {
        this.resetAnims();
        this.backWalkAnim.weight = 1.0;

    }
    setDeathAnim() {
        this.resetAnims();
        //this.deathAnim.reset();
        this.deathAnim.weight = 1.0;
        this.deathAnim.restart();
            setTimeout(() => {
                this.girlMesh.dispose();
                this.swordMesh.dispose();

                var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "You lose! Zombies eat your brain!\n Press F5 to restart!");
                button1.width = "300px"
                button1.height = "80px";
                button1.color = "white";
                button1.cornerRadius = 20;
                button1.background = "red";
                button1.onPointerUpObservable.add(function() {
                    console.log("you lose!");
                });
                this.advancedTexture.addControl(button1);   
            }, 1200); 
 
    }
    setImpactAnim() {
        this.resetAnims();
        this.impactAnim.weight = 1.0;
        this.decreaseHealth();
        
    }
    setIdleAnim() {
        this.resetAnims();
        this.idleAnim.weight = 1.0;
    }
    setSlashAnim() {
        this.resetAnims();  
        
        this.slashAnim.weight = 1.0;      
        this.slashAnim.reset();

        setTimeout(() => {
            this.setIdleAnim();
        }, 1600);
    }
    // change move method in girl, current girl should move as previous tank
    move(scene,inputStates, deltaTime) {
        if (!this.bounder) return;
        if (this.slashAnim.weight > 0) return;
        this.girlMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y, this.bounder.position.z);
        this.followGround(scene);
        
        //if (this.impactAnim.weight == 1.0) return;
        if(inputStates.up) {
            this.setWalkAnim();
            this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed*deltaTime/16, -this.speed*deltaTime/16, -this.speed*deltaTime/16));
            //this.girlMesh.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed*deltaTime/16, -this.speed*deltaTime/16, -this.speed*deltaTime/16));
            this.swordMesh.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed*deltaTime/16, -this.speed*deltaTime/16, -this.speed*deltaTime/16));
            //this.girlMesh.locallyTranslate(new BABYLON.Vector3( 0, this.speed*deltaTime/16,0));
            //this.swordMesh.locallyTranslate(new BABYLON.Vector3( 0, this.speed*deltaTime/16,0));
            
        } else if(inputStates.down) {
            this.setBackWalkAnim();
            this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed*deltaTime/16, this.speed*deltaTime/16, this.speed*deltaTime/16));
            //this.girlMesh.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed*deltaTime/16, this.speed*deltaTime/16, this.speed*deltaTime/16));
            this.swordMesh.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed*deltaTime/16, this.speed*deltaTime/16, this.speed*deltaTime/16));
            //this.girlMesh.locallyTranslate(new BABYLON.Vector3( 0,-this.speed*deltaTime/16, 0));
            //this.swordMesh.locallyTranslate(new BABYLON.Vector3( 0,-this.speed*deltaTime/16, 0));

        } else if(inputStates.left) {
            this.setIdleAnim();
            this.girlMesh.rotation.y -= 0.02*deltaTime/16;
            this.swordMesh.rotation.y -= 0.02*deltaTime/16;
            this.bounder.rotation.y -= 0.02*deltaTime/16;
            this.frontVector = new BABYLON.Vector3(Math.sin(this.girlMesh.rotation.y), 0, Math.cos(this.girlMesh.rotation.y));
            // does not work? why?
            //scene.stopAnimation(this.girlMesh);
            
        } else if(inputStates.right) {
            this.setIdleAnim();
            this.girlMesh.rotation.y += 0.02*deltaTime/16;
            this.swordMesh.rotation.y += 0.02*deltaTime/16;
            this.bounder.rotation.y += 0.02*deltaTime/16;
            this.frontVector = new BABYLON.Vector3(Math.sin(this.girlMesh.rotation.y), 0, Math.cos(this.girlMesh.rotation.y));
        } else {
            this.setIdleAnim();
        }
    }
    calculateBoundingBoxParameters() {
        // Compute BoundingBoxInfo for the Dude, for this we visit all children meshes
        //let childrenMeshes = this.girlMesh.getChildren();
        //console.log(this.girlMesh);
        var boundingInfo = this.girlMesh.getBoundingInfo();
        var min = boundingInfo.minimum.add(this.girlMesh.position);
        var max = boundingInfo.maximum.add(this.girlMesh.position);

        boundingInfo = this.swordMesh.getBoundingInfo();
        min = BABYLON.Vector3.Minimize(min, boundingInfo.minimum.add(this.swordMesh.position));
        max = BABYLON.Vector3.Maximize(max, boundingInfo.maximum.add(this.swordMesh.position));
        let sum = min.add(max);
        let center = sum.divide(new BABYLON.Vector3(2,2,2));

        return new BABYLON.BoundingInfo(min, max);
    }

    createBoundingBox(scene) {
        // Create a box as BoundingBox of the Dude
        let bounder = new BABYLON.Mesh.CreateBox("girlbounder", 1, scene);
        let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", scene);
        bounderMaterial.alpha = .4;
        bounder.material = bounderMaterial;
        

        let bbInfo = Girl.boundingBoxParameters;

        let max = bbInfo.boundingBox.maximumWorld;
        let min = bbInfo.boundingBox.minimumWorld;

        bounder.position = this.girlMesh.position.clone();


        // Not perfect, but kinda of works...
        // Looks like collisions are computed on a box that has half the size... ?
        bounder.scaling.x = (max._x - min._x) * 0.4;
        bounder.scaling.y = (max._y - min._y);
        bounder.scaling.z = (max._z - min._z) * 0.3;

        bounder.isVisible = false;
        bounder.checkCollisions = true;
        this.bounder = bounder;
        this.bounder.girlMesh = this.girlMesh;
        
    }
    slash(inputStates, scene) {
        if (!inputStates.space) return;
        if (!this.canSlash) return;

        this.canSlash = false;
        setTimeout(() => {
            this.canSlash = true;
        }, 1600);
        
        this.setSlashAnim();


        setTimeout(() => {
            
            scene.assets.slashSound.setVolume(0.6);
            scene.assets.slashSound.play();
            let cannonball = BABYLON.MeshBuilder.CreateSphere("cannonball", {diameterX: 30, diameterY: 2,diameterZ: 30,segments: 32}, scene);
            cannonball.material = new BABYLON.StandardMaterial("Fire", scene);
            cannonball.isVisible = false;
            let pos = this.girlMesh.position;
            // position the cannonball above the tank
            cannonball.position = new BABYLON.Vector3(pos.x, pos.y+20, pos.z);
            // move cannonBall position from above the center of the tank to above a bit further than the frontVector end (5 meter s further)
            cannonball.position.addInPlace(this.frontVector.multiplyByFloats(5, 5, 5));
    
            // add physics to the cannonball, mass must be non null to see gravity apply
            cannonball.physicsImpostor = new BABYLON.PhysicsImpostor(cannonball,
                BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);    
    
            // the cannonball needs to be fired, so we need an impulse !
            // we apply it to the center of the sphere
            let powerOfFire = 20;
            let azimuth = 0.1; 
            let aimForceVector = new BABYLON.Vector3(-this.frontVector.x*powerOfFire, (this.frontVector.y+azimuth)*powerOfFire,-this.frontVector.z*powerOfFire);
            
            cannonball.physicsImpostor.applyImpulse(aimForceVector,cannonball.getAbsolutePosition());
    
            cannonball.actionManager = new BABYLON.ActionManager(scene);
            // register an action for when the cannonball intesects a dude, so we need to iterate on each dude
            scene.zombies.forEach(zombie => {
                cannonball.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                    {trigger : BABYLON.ActionManager.OnIntersectionEnterTrigger,
                    parameter : zombie.Zombie.bounder}, // dude is the mesh, Dude is the instance if Dude class that has a bbox as a property named bounder.
                                                    // see Dude class, line 16 ! dudeMesh.Dude = this;
                    () => {
                        //console.log(zombie.Zombie.bounder)
                        if(zombie.Zombie.bounder._isDisposed) return;
    
                        //console.log("HIT !")
                        //dude.Dude.bounder.dispose();
                        //dude.dispose();
                        

                        zombie.Zombie.decreaseHealth();
                        //cannonball.dispose(); // don't work properly why ? Need for a closure ?
                    }
                ));
            });
    
            // Make the cannonball disappear after 3s
            setTimeout(() => {
                cannonball.dispose();
            }, 600);
        },800);


    }

    followGround(scene) {
        // adjusts y position depending on ground height...
    
        // create a ray that starts above the dude, and goes down vertically
        let origin = new BABYLON.Vector3(this.girlMesh.position.x, 1000, this.girlMesh.position.z);
        let direction = new BABYLON.Vector3(0, -1, 0);
        let ray = new BABYLON.Ray(origin, direction, 10000);
    
        // compute intersection point with the ground
        let pickInfo = scene.pickWithRay(ray, (mesh) => { return (mesh.name === "gdhm"); });
    
        let groundHeight = pickInfo.pickedPoint.y;
        this.girlMesh.position.y = groundHeight;
        this.swordMesh.position.y = groundHeight;
        this.bounder.position.y = groundHeight;
        return groundHeight;
      }
    decreaseHealth() {
        this.life -= 1;
        console.log(this.life);
        if (this.life <= 0)
            this.setDeathAnim();
    }

}