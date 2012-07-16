
/*****************************************
 * ALL GLOBAL VARIABLES DECLARED HERE!!! *
 *****************************************/

var temp_voxel_sprite;
var chunk;

var _draw_interval;
function loaded(){
    setupCanvas("glcontext");
    setupShaders();
    //temp_voxel_sprite = new VoxelSprite([[0,0,0, 1,0,0],
	//[0,0,1, 0,1,0]]);
    derp = {};
    var n = 3;
    console.log(n*n*n);
    for(var i=0;i<n*n*n;i++){
        derp[[i%n,Math.floor(i/n)%n,Math.floor(i/(n*n))]] = 
	     [Math.sin(i)+Math.cos(i),Math.cos(i)*Math.cos(i)+i%3,(i+1)%2];
    }
    console.log(derp)
    loadBinaryFile("models/person.vobj",function(data){
	temp_voxel_sprite = loadVOBJ(data).sprite;
	_draw_interval = setInterval(drawFrame,15);
    });
    chunk = new Chunk();
}
function stop(){
    clearInterval(_draw_interval);
}


function drawFrame(){
    var start = new Date().getTime();

    camPos = [camAngles[0]*Math.sin(camAngles[1])*Math.cos(camAngles[2]),
	      camAngles[0]*Math.sin(camAngles[1])*Math.sin(camAngles[2]),
	      camAngles[0]*Math.cos(camAngles[1])]

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, canvas.width / canvas.height, 0.01, 1000.0, projMatrix);
    mat4.identity(viewMatrix);

    //mat4.translate(viewMatrix, camPos);
    viewMatrix = mat4.lookAt(camPos,[0,0,0], [0,0,1])
    temp_voxel_sprite.draw();
    chunk.draw();
    
    document.getElementById("log").innerHTML = new Date().getTime() - start;
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
