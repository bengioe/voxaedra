
/*****************************************
 * ALL GLOBAL VARIABLES DECLARED HERE!!! *
 *****************************************/

var temp_voxel_sprite;
var chunk,terrain;
var temp_canvas = document.createElement("canvas");


var _draw_interval;
function loaded(){
    setupCanvas("glcontext");
    setupShaders();

    terrain = new Terrain("data/maps/isao.map");
    chunk = new TerrainChunk("models/test.bmp");
    loadBinaryFile("models/tree_small.vobj",function(data) {
	//temp_voxel_sprite = new VoxelSprite({'0,0,0':[1,0,0]});
	var x = {
	    stand : "person.vobj",
	    walk : {
		length : 4,
		0 : "person_walk_1",
		1 : "person_walk_2",
		2 : "person_walk_3",
		3 : "person_walk_4"}
	};
	//temp_voxel_sprite = loadVOBJ(data).sprite;
	temp_voxel_sprite = new AnimatedWorldObject(x);//loadVOBJ(data).sprite;
	temp_voxel_sprite.setAnim("walk");
	_draw_interval = setInterval(drawFrame,30);
    });
    Terrain.init()
}
function stop(){
    clearInterval(_draw_interval);
}


function drawFrame(){
    if (drawFrame.timeSum === undefined){
	    drawFrame.timeSum = 0;
	    drawFrame.timeLast = new Date().getTime();
	    drawFrame.nFrames = 0;
    }
    var start = new Date().getTime();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, canvas.width/canvas.height, 1, 1000.0, projMatrix);
    mat4.identity(viewMatrix);

    viewMatrix = mat4.lookAt(camera.getPos(),camera.getTargetPos(), [0,0,1])
    //camera.computeRay();

    //mat4.translate(viewMatrix, [0,0,1], viewMatrix);
    //Terrain.draw(); 
    trans = terrain.intersectsCameraRay(camera.getPos(),
					camera.computeRay());//camera.voxelUnderMouse();
    terrain.draw();
    document.getElementById("mousevoxel").innerHTML = ":"+trans+":"+camera.computeRay();
    if (trans){
	mat4.translate(viewMatrix, vec3.scale(vec3.create(trans),4), viewMatrix);
	temp_voxel_sprite.draw();
	mat4.translate(viewMatrix, vec3.scale(vec3.create(trans),-4), viewMatrix);
    }

    drawFrame.timeSum += new Date().getTime() - start;
    drawFrame.nFrames += 1;
    if (drawFrame.timeLast + 1000 < start){
	    document.getElementById("log").innerHTML = drawFrame.timeSum +
	        "ms for " + drawFrame.nFrames + " frames";
	    drawFrame.timeSum = 0;
	    drawFrame.timeLast = start;
	    drawFrame.nFrames = 0;
    }
}

var _key = {
    INACTIVE:-2,
    PRESSED:-1,
    ctrl:17,
    alt:18,
    left:37,
    up:38,
    right:39,
    down:40,
    a:65,
    d:68,
    e:69,
    q:81,
    s:83,
    w:87,
    z:90,
}


var _keystate = {};

document.onkeydown = function(evt){
    camAngles = camera.getAngles(); 
    var k = evt.keyCode;
    _keystate[k] = _key.PRESSED;
    if (k==_key.s){
        camAngles[0]+=10;
    }else if (k==_key.w){
        camAngles[0]-=10;
    }/*else if (k==_key.q){
        camAngles[0]+=10.1;
    }else if (k==_key.e){
        camAngles[0]-=10.1;
    }*/else if (k==_key.a){
        camAngles[2]-=1.570796;
    }else if (k==_key.d){
        camAngles[2]+=1.570796;
    }else if (k==_key.up){
        camera.moveTargetPos(-1,-1,0);
    }else if (k==_key.down){
        camera.moveTargetPos(1,1,0);
    }else if (k==_key.left){
        camera.moveTargetPos(1,-1,0);
    }else if (k==_key.right){
        camera.moveTargetPos(-1,1,0);
    }else if (k==_key.ctrl){
	camera.moveOnMouseDelta(true);
    }else{
        console.log(k);
    }
    camera.update();
    //drawFrame();
}

document.onkeyup = function(evt){
    camAngles = camera.getAngles(); 
    var k = evt.keyCode;
    _keystate[k] = _key.INACTIVE;

    if (k==_key.ctrl){
	camera.moveOnMouseDelta(false);
    }
    camera.update();
    //drawFrame();
}
