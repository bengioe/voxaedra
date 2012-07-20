
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
	temp_voxel_sprite = loadVOBJ(data).sprite;
	_draw_interval = setInterval(drawFrame,100);
    });

    chunk = new Chunk();
}
function stop(){
    clearInterval(_draw_interval);
}

function voxelUnderMouse(){
    //var eye = camPos.map(function(x){return x;})
    var eye = vec3.add(camPos,[0.5,0.5,0.5]);
    var at = camPos.map(Math.floor);
    var sideInto = [0,0,0];
    var lastSideInto = [0,0,0];
    var step = camRay.map(function(x){return x>=0?1:-1});
    var target = camRay.map(function(x){return x>=0?1:0});
    var iter=0;
    console.log(eye + ":" + at);
    do{
        if (at[2]<=0){
            //lastUnderMouse = blockmatrix.g(at.asInt());
            return at;
        }
        var tx = (1.*at[0]+target[0]-eye[0])/camRay[0];
        var ty = (1.*at[1]+target[1]-eye[1])/camRay[1];
        var tz = (1.*at[2]+target[2]-eye[2])/camRay[2];
        var t = 1.0;
        if (tx<ty && tx<tz){
            t=tx;
            at[0]+=step[0];
            //if (sideInto!=null){sideInto.set(stepX,0,0);}
        }else if (ty<=tx && ty<=tz){
            t=ty;
            at[1]+=step[1];
            //if (sideInto!=null){sideInto.set(0,stepY,0);}
        }else{
            t=tz;
            at[2]+=step[2];
            //if (sideInto!=null){sideInto.set(0,0,stepZ);}
        }
	console.log(at+":"+t);
        eye = vec3.add(eye,vec3.scale(camRay,t,vec3.create()),vec3.create());
	console.log(eye);
    }while(iter++<256);
    //sideInto.set(lastSideInto);
    return [undefined,0,0];//lastUnderMouse.pos;
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

    camPos = [camAngles[0]*Math.sin(camAngles[1])*Math.cos(camAngles[2]),
	      camAngles[0]*Math.sin(camAngles[1])*Math.sin(camAngles[2]),
	      camAngles[0]*Math.cos(camAngles[1])]

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, canvas.width/canvas.height, 1, 1000.0, projMatrix);
    mat4.identity(viewMatrix);

    viewMatrix = mat4.lookAt(camPos,[0,0,0], [0,0,1])
    //camRay = vec3.unproject(mouseWinPos,mat4.inverse(viewMatrix,mat4.create()),projMatrix,[0,0,300,300],vec3.create());
    //temp_voxel_sprite.draw();
    chunk.draw();
    camRay = unproject(mouseWinPos[0],
		       mouseWinPos[1]);
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
