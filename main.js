
/*****************************************
 * ALL GLOBAL VARIABLES DECLARED HERE!!! *
 *****************************************/

var temp_voxel_sprite;
var chunk;

var _draw_interval;
function loaded(){
    setupCanvas("glcontext");
    setupShaders();

    loadBinaryFile("models/person.vobj",function(data){
	temp_voxel_sprite = new VoxelSprite({'0,0,0':[1,0,0]});
	//temp_voxel_sprite = loadVOBJ(data).sprite;
	_draw_interval = setInterval(drawFrame,100);
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

    viewMatrix = mat4.lookAt(camera.getPos(),[0,0,0], [0,0,1])
    camera.computeRay();

    mat4.translate(viewMatrix, [0,0,1], viewMatrix);
    Terrain.draw(); //chunk.draw();
    trans = camera.voxelUnderMouse();
    mat4.translate(viewMatrix, trans, viewMatrix);
    temp_voxel_sprite.draw();
    mat4.translate(viewMatrix, vec3.scale(trans,-1), viewMatrix);

    drawFrame.timeSum += new Date().getTime() - start;
    drawFrame.nFrames += 1;
    if (drawFrame.timeLast + 1000 < start){
	document.getElementById("log").innerHTML = drawFrame.timeSum +
	    "ms in " + drawFrame.nFrames + " frames";
	drawFrame.timeSum = 0;
	drawFrame.timeLast = start;
	drawFrame.nFrames = 0;
    }
}

var _key = {
    a:65,
    d:68,
    e:69,
    q:81,
    s:83,
    w:87,
}

document.onkeydown = function(evt){
    var k = evt.keyCode;
    if (k==_key.s){
        camAngles[1]+=0.1;
    }else if (k==_key.w){
        camAngles[1]-=0.1;
    }else if (k==_key.q){
        camAngles[0]+=0.1;
    }else if (k==_key.e){
        camAngles[0]-=0.1;
    }else if (k==_key.a){
        camAngles[2]-=0.1;
    }else if (k==_key.d){
        camAngles[2]+=0.1;
    }
    drawFrame();
}
