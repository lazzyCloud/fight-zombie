# fight-zombie
assignment for minor course, a 3D game in BabylonJS about a girl fights with zombies
## Loading
The scene loading may need sometime, please wait a little bit. You should see a girl standing in the middle of the screen once the scene is loaded.
## Game mechanism
* The scene is initialized with one girl and eleven zombies. (really take long time on my side, please be patient...)
* Without any instructions from keyboard, the girl is in "idle" state and idle animation is played.
* If the girl does not move, the zombies walk randomly.
* Please use keyboard arrow keys to move the girl. Press "up" or "down", the girl will walk forward/backward. However, the movement of the girl will attract zombies. All zombies will run towards the girl. 
* Press "left" or "right", the girl will turn left, or turn right. The turn is a slient action and will not attract zombies.
* Press "space" to slash. The zombies in front of the girl will be attacked. Zombies that got hit will be bleeding (represented as red particles).
* Zombie bites the girl if they are close enough. The girl will die after got bitten several times by zombies. A red message will be displayed. The game then ends.
* A zombie dies after got 3 hits. If the girl clear all eleven zombies, a gree message will be displayed. The game then ends.
* Zombie growl sound is played if there is zombies.
* Slash sound is played if the girl slash. 
## Contribution
* Add 3D models for the girl and the zombie, with animations. For the girl, "idle", "walk forward", "walk backward", "bitten", "slash", "death" animations are added. For the zombie, "walk", "run", "death", "bite" animations are added. (original source from here: https://www.mixamo.com/#/?page=1&type=Character, I made some adjustment and transform the format to BabylonJS by using blender)
* Different animations are played regarding to scenarios by using weighted animation. 
* Change map from flatten ground to a "mountain", zombies and girl move on the ground. 
* Add sounds for the zombie and for the slash. 
* Decrease health of the girl and of the zombies if they got hit.
* Bounding box for the girl and the zombies, with collision detection movement (not perfect though).
* Deployment on Heroku.
* Simulation of bleeding by using particle system. 
* UI button displayed when the game ends. (original code here: https://playground.babylonjs.com/#XCPP9Y#1)
Basically, I took many things from course content. Main contribution focus on the 3D models and animations.
## Bugs (yes it does have some :) )
* Collision detection does not work perfectly...
* If the girl got bitten and slash at the same time, only bitten animation will be played. Slash sound is played but no animation :/
* I should create a health bar to display the status of the girl, but failed. So, the girl dies after got "several" bitten, unfortunately we never know how many "several" is...
* You may find others

Original commit history can be found here: https://github.com/lazzyCloud/BabylonJS_course/commits/main

I need to create a new repo to deploy the game on heroku, that's why this new repo is created. 

