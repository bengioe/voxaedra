
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

    chunk = new Chunk();
}
function stop(){
    clearInterval(_draw_interval);
}

function unproject(winx, winy, winz) {
    // winz is either 0 (near plane), 1 (far plane) or somewhere in between.
    // if it's not given a value we'll produce coords for both.
    if (typeof(winz) == "number") {
	
        var inf = [];
        var pm = viewMatrix, mm = projMatrix;
        var viewport = [0, 0, 300, 300];
        //Calculation for inverting a matrix, compute projection x modelview; then compute the inverse
        var m = mat4.set(mm, mat4.create());

        //mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
        mat4.multiply(m, pm, m);
        mat4.inverse(m, m);
        // Transformation of normalized coordinates between -1 and 1
        inf[0]=(winx-viewport[0])/viewport[2]*2.0-1.0;
        inf[1]=(winy-viewport[1])/viewport[3]*2.0-1.0;
        inf[2]=2.0*winz-1.0;
        inf[3]=1.0;
	
        //Objects coordinates
        var out = vec4.create();
        mat4.multiplyVec4(m, inf, out);
        if(out[3]==0.0)
            return null;
	
        out[3]=1.0/out[3];//vec3.normalize(
        return [out[0]*out[3], out[1]*out[3], out[2]*out[3]];//);
    }
    else{
	var a = unproject(winx, winy, 0);
	var b = unproject(winx, winy, 1);
        return vec3.normalize(vec3.subtract(b, a));
    }
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
    chunk.draw();
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
