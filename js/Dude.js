export default class Dude {
    constructor(dudeMesh, speed) {
        this.dudeMesh = dudeMesh;

        if(speed)
            this.speed = speed;
        else
            this.speed = 0.5;

        // in case, attach the instance to the mesh itself, in case we need to retrieve
        // it after a scene.getMeshByName that would return the Mesh
        // SEE IN RENDER LOOP !
        dudeMesh.Dude = this;
    }
    // change move method in dude, current dude should move as previous tank
    move(inputStates, deltaTime) {

        if(inputStates.up) {
            this.dudeMesh.locallyTranslate(new BABYLON.Vector3( 0, 0,-this.speed*deltaTime/16));
            
        }    
        if(inputStates.down) {
            this.dudeMesh.locallyTranslate(new BABYLON.Vector3( 0, 0,this.speed*deltaTime/16));

        }    
        if(inputStates.left) {
            this.dudeMesh.rotation.y -= 0.02*deltaTime/16;
            // does not work? why?
            //scene.stopAnimation(this.dudeMesh);
            
        }    
        if(inputStates.right) {
            this.dudeMesh.rotation.y += 0.02*deltaTime/16;
        }
    }
}