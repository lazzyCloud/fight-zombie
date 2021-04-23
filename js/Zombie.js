export default class Zombie {
    constructor(zombieMesh, speed, id) {
        this.zombieMesh = zombieMesh;
        this.id = id;
        if(speed)
            this.speed = speed;
        else
            this.speed = 1;
        this.bounder = null;
        // set a random target for zombie
        zombieMesh.Zombie = this;
        this.idleAnim = null;
        this.biteAnim = null;
        this.dyingAnim = null;
        this.runningAnim = null;
        this.walkingAnim = null;
        Zombie.countKilled = 0;
        // FOR COLLISIONS, let's associate a BoundingBox to the Dude

        // singleton, static property, computed only for the first dude we constructed
        // for others, we will reuse this property.
        //if (Zombie.boundingBoxParameters == undefined) {
        //    Zombie.boundingBoxParameters = this.calculateBoundingBoxParameters();
        //}
        //this.zombieMesh.setBoundingInfo(Zombie.boundingBoxParameters);
        //this.zombieMesh.showBoundingBox = true;
        this.zombieMesh.checkCollisions = true;
        //this.bounder = this.createBoundingBox();
        //this.bounder.zombieMesh = this.zombieMesh;
        this.frontVector = new BABYLON.Vector3(Math.sin(this.zombieMesh.rotation.y), 0, Math.cos(this.zombieMesh.rotation.y));
        this.health = 3;
        this.sound = null;

    }
    setAnims(scene, skeleton) {
        this.idleAnim = scene.beginWeightedAnimation(skeleton,240, 361, 0.0, true);
        this.walkingAnim = scene.beginWeightedAnimation(skeleton,412, 532, 1.0, true);
        this.runningAnim = scene.beginWeightedAnimation(skeleton,372, 395, 0.0, true);
        this.dyingAnim = scene.beginWeightedAnimation(skeleton,140, 230, 0.0, true);
        this.biteAnim = scene.beginWeightedAnimation(skeleton,0, 126, 0.0, true);
        this.sound = scene.assets.zombieSound;
        if (this.sound && !this.sound.isPlaying) {
            this.sound.setVolume(0.6);
            this.sound.play();
        }
    }
    resetAnims() {
        this.idleAnim.weight = 0;
        this.walkingAnim.weight = 0;
        this.runningAnim.weight = 0; 
        this.dyingAnim.weight = 0;
        this.biteAnim.weight = 0;
    }
    setWalkingAnim() {
        this.resetAnims();
        this.walkingAnim.weight = 1.0;
    }
    setRunningAnim() {
        this.resetAnims();
        this.runningAnim.weight = 1.0;

    }
    setDyingAnim() {
        this.resetAnims();
        
        this.dyingAnim.reset();
        this.dyingAnim.weight = 1.0;
        setTimeout(() => {
            this.zombieMesh.dispose();
            this.bounder.dispose();
        }, 2000);
    }
    setBiteAnim() {
        this.resetAnims();
        this.biteAnim.weight = 1.0;
        //this.biteAnim.reset();
    }
    setIdleAnim() {
        this.resetAnims();
        this.idleAnim.weight = 1.0;
    }
    // zombie chase dude as dude chase tank before
    chase(scene,tank, deltaTime) {
        if (!this.bounder) return;
        if (this.dyingAnim.weight > 0) return;
        if (tank == undefined) return;
        this.zombieMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y, this.bounder.position.z);
            this.followGround(scene);
                  // follow the tank
                  //let tank = scene.getMeshByName("heroTank");
                  // let's compute the direction vector that goes from Dude to the tank
                  let direction = tank.position.subtract(this.zombieMesh.position);
                  let distance = direction.length(); // we take the vector that is not normalized, not the dir vector
                  //console.log(distance);
                  let dir = direction.normalize();
                  // angle between Dude and tank, to set the new rotation.y of the Dude so that he will look towards the tank
                  // make a drawing in the X/Z plan to uderstand....
                  let alpha = Math.atan2(-dir.x, -dir.z);
                  this.zombieMesh.rotation.y = alpha;
                  this.frontVector = new BABYLON.Vector3(Math.sin(this.zombieMesh.rotation.y), 0, Math.cos(this.zombieMesh.rotation.y));
                  // let make the Dude move towards the tank
                  if(distance > 25) {
                      this.setRunningAnim();
                      this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed*0.5*deltaTime/16, this.speed*0.5*deltaTime/16, this.speed*0.5*deltaTime/16));
                      //this.zombieMesh.moveWithCollisions(dir.multiplyByFloats(this.speed*0.5*deltaTime/16, this.speed*0.5*deltaTime/16, this.speed*0.5*deltaTime/16));
                  }
                  else {    
                      this.setBiteAnim();
                      if (tank.Girl.slashAnim.weight != 1.0)
                        tank.Girl.setImpactAnim();

                  }   
    }
    // if dude does not move, zombie move randomly
    move(scene,tank,deltaTime) {
        if (!this.bounder) return;
        if (this.dyingAnim.weight > 0) return;
        this.zombieMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y, this.bounder.position.z);
        this.followGround(scene);
        //let tank = scene.getMeshByName("heroTank");
        if (tank == undefined) return;
        let direction = tank.position.subtract(this.zombieMesh.position);
        let distance = direction.length(); // we take the vector that is not normalized, not the dir vector
        if (distance > 25) {
            let ra = Math.random()*1000;
            // 0.5% chance that zombie will randomly change rotation
            if (ra < 3) {
                //this.setIdleAnim();
                // generate a random target for zombie to chase
                let target = new BABYLON.Vector3( Math.floor(Math.random()*1000-500), 0,  Math.floor(Math.random()*1000-500));
                let direction = target.subtract(this.zombieMesh.position);
                      
                let dir = direction.normalize();
                let alpha = Math.atan2(-dir.x, -dir.z);
                this.zombieMesh.rotation.y += alpha;
                this.frontVector = new BABYLON.Vector3(Math.sin(this.zombieMesh.rotation.y), 0, Math.cos(this.zombieMesh.rotation.y));
                //this.zombieMesh.locallyTranslate(new BABYLON.Vector3( this.speed*deltaTime/16, this.speed*deltaTime/16, 0));
            } else {
                this.setWalkingAnim();
                // else zombie continue move forward
                //this.zombieMesh.locallyTranslate(new BABYLON.Vector3( this.speed*deltaTime/16, this.speed*deltaTime/16, 0));
                //this.zombieMesh.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed*deltaTime/16, -this.speed*deltaTime/16, -this.speed*deltaTime/16));
                this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed*deltaTime/16, -this.speed*deltaTime/16, -this.speed*deltaTime/16));
            
            }
        } else {
            
            let dir = direction.normalize();
            // angle between Dude and tank, to set the new rotation.y of the Dude so that he will look towards the tank
            // make a drawing in the X/Z plan to uderstand....
            let alpha = Math.atan2(-dir.x, -dir.z);
            this.zombieMesh.rotation.y = alpha;
            this.setBiteAnim();
            tank.Girl.setImpactAnim();
        }

    }
    calculateBoundingBoxParameters() {
        var boundingInfo = this.zombieMesh.getBoundingInfo();
        var min = boundingInfo.minimum.add(this.zombieMesh.position);
        var max = boundingInfo.maximum.add(this.zombieMesh.position);
        //for(var i=1; i<meshes.length; i++){
        //    boundingInfo = meshes[i].getBoundingInfo();
        //    min = BABYLON.Vector3.Minimize(min, boundingInfo.minimum.add(meshes[i].position));
        //    max = BABYLON.Vector3.Maximize(max, boundingInfo.maximum.add(meshes[i].position));
        //}
        return new BABYLON.BoundingInfo(min, max);
    }

    createBoundingBox(scene) {
        // Create a box as BoundingBox of the Dude
        let bounder = new BABYLON.Mesh.CreateBox("bounder"+ (this.id).toString(), 1, scene);
        let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", scene);
        bounderMaterial.alpha = .4;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;

        bounder.position = this.zombieMesh.position.clone();

        let bbInfo = this.zombieMesh.getBoundingInfo();

        let max = bbInfo.boundingBox.maximum;
        let min = bbInfo.boundingBox.minimum;

        // Not perfect, but kinda of works...
        // Looks like collisions are computed on a box that has half the size... ?
        bounder.scaling.x = (max._x - min._x) * 0.3;
        bounder.scaling.y = (max._y - min._y) * 1;
        bounder.scaling.z = (max._z - min._z) * 0.2;

        bounder.isVisible = false;

        this.bounder = bounder;
        this.bounder.Zombie = this;
        
    }

    decreaseHealth() {
        // locate particle system at hit point
        Zombie.particleSystem.emitter = new BABYLON.Vector3(this.zombieMesh.position.x, this.zombieMesh.position.y + 20, this.zombieMesh.position.z);
        // start particle system
        Zombie.particleSystem.start();

        // make it stop after 300ms
        setTimeout(() => {
            Zombie.particleSystem.stop();
        }, 300);

        this.health--;

        if (this.health <= 0) {
            this.gotKilled();
        }
    }

    gotKilled() {
        this.setDyingAnim();
        Zombie.countKilled += 1;
        if (Zombie.countKilled >= 11) {
            this.sound.stop();
        // GUI
            var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

            var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "You win! Press F5 to restart!");
            button1.width = "300px"
            button1.height = "80px";
            button1.color = "white";
            button1.cornerRadius = 20;
            button1.background = "green";
            button1.onPointerUpObservable.add(function() {
                console.log("you did it!");
            });
            advancedTexture.addControl(button1);     
        }

    }

    createParticleSystem(scene) {
        if (Zombie.particleSystem == undefined) {
            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
            //Box around emitter
            var box = BABYLON.MeshBuilder.CreateBox("box", {width:2, height:4, depth: 5}, scene);
            box.material = new BABYLON.StandardMaterial("mat", scene);
            box.material.wireframe = true;
            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture(
                "images/flare.png",
                scene
            );
            Zombie.particleSystem = particleSystem;
            this.setParticleSystemDefaultValues();
            particleSystem.createBoxEmitter(new BABYLON.Vector3(-5, 2, 1), new BABYLON.Vector3(5, 2, -1), new BABYLON.Vector3(-1, -2, -2.5), new BABYLON.Vector3(1, 2, 2.5));

        } 
      }
    
      setParticleSystemDefaultValues() {
        let particleSystem = Zombie.particleSystem;
    
        // Where the particles come from. Will be changed dynacally to the hit point.
        particleSystem.emitter = new BABYLON.Vector3(0, 0, 0); // the starting object, the emitter

        // Colors of all particles RGBA
        particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
    
        particleSystem.emitRate = 2000;
    
        // Set the gravity of all particles
        //particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    
        // Direction of each particle after it has been emitted
        //particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);
        //particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);
    
         // Size of each particle (random between...
         particleSystem.minSize = 0.4;
         particleSystem.maxSize = 1;
         
         particleSystem.minLifeTime = 0.3;
         particleSystem.maxLifeTime = 1.5;

             /******* Emission Space ********/
        

        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.005;
         
      }
    
      setParticleSystemToFinalExplosion() {
        let particleSystem = Zombie.particleSystem;
          particleSystem.emitter = new BABYLON.Vector3(
          this.bounder.position.x,
          this.bounder.position.y + 6,
          this.bounder.position.z
        );
        console.log(this.bounder);
        particleSystem.emitRate = 300;
    
        particleSystem.minEmitPower = 12;
        particleSystem.maxEmitPower = 20;
    
         // Size of each particle (random between...
         particleSystem.minSize = 0.5;
         particleSystem.maxSize = 2.5;
     
         // Life time of each particle (random between...
         particleSystem.minLifeTime = 0.3;
         particleSystem.maxLifeTime = 1.5;
    
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    
        particleSystem.createSphereEmitter(2);
      }
      followGround(scene) {
        // adjusts y position depending on ground height...
    
        // create a ray that starts above the dude, and goes down vertically
        let origin = new BABYLON.Vector3(this.zombieMesh.position.x, 1000, this.zombieMesh.position.z);
        let direction = new BABYLON.Vector3(0, -1, 0);
        let ray = new BABYLON.Ray(origin, direction, 10000);
    
        // compute intersection point with the ground
        let pickInfo = scene.pickWithRay(ray, (mesh) => { return (mesh.name === "gdhm"); });
        if (pickInfo.pickedPoint) {

            let groundHeight = pickInfo.pickedPoint.y;
            this.zombieMesh.position.y = groundHeight;
            this.bounder.position.y = groundHeight;
        }

      }
}