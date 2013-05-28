
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

    terrain = new PTerrain("data/maps/isao.map");
    chunk = new PChunk("models/test.bmp");
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

function PTerrain(path){
    var chunk;
    var objects = [];
    loadJSONFile(path,
        function(data){
	    chunk = new PChunk(data.image);
	    for (var i=0;i<data.objects.length;i++){
		var o = data.objects[i];
		objects.push(new StaticWorldObject(o.model,o.pos,o.scale));
	    }
            
	});
    this.draw = function(){
	chunk.draw();
	for (var i=0;i<objects.length;i++){
	    objects[i].draw();
        }
    }
    this.intersectsCameraRay = function(cameraPos,cameraRay){
	return chunk.intersectsCameraRay(cameraPos,cameraRay);
    }
}

function PChunk(path){
    var image = new Image();
    var terrain_grid = {};
    var doodles = [];
    var sprite;
    var origin = [0,0,0];
    
    this.init = function(ev){
        var temp_ctx = temp_canvas.getContext("2d");
        var image = ev.target;
        console.log(image);
        temp_ctx.drawImage(image,0,0);
        var data = temp_ctx.getImageData(0,0,image.width,image.height).data;
        for (var y=0;y<image.height;y++){
            for (var x=0;x<image.width;x++){
                var i = (y*image.width+x)*4;
                var r = data[i]; var g = data[i+1]; var b = data[i+2];
                if (!(r==255 && g==255 && b ==255)){
                    terrain_grid[[x,y,0]] = [r/255.,g/255.,b/255.];
                    if (r==255 && g==127 && b==39) { // forest
                        doodles.push(new StaticWorldObject("tree_small.vobj",[x*4,y*4,0]));
                    } else if (r==150 && g==100 && b==50){ // rocks
                        
                    }
                }
            }
        }
        console.log(terrain_grid);
        sprite = new VoxelSprite(terrain_grid,4);
        console.log("loaded");
    }
    this.draw = function(){
        mat4.translate(viewMatrix, [2,2,-2]);
        sprite.draw();
        mat4.translate(viewMatrix, [-2,-2,2]);
        for (var i=0;i<doodles.length;i++){
            doodles[i].draw();
        }
    }
    this.intersectsCameraRay = function(cameraPos,cameraRay){
	//console.log(cameraPos+":"+cameraRay[0]+","+cameraRay[1]+","+cameraRay[2]);
        // let p be cameraPos, r cameraRay and c a point on the plane (origin)
        // the segment of the camera is defined by p+kr, 
        // the intersection point is i_x = p_x+kr_x, i_y = p_y+kr_y, i_z = c_z
        // reformulated:
        // p+kr=c iff p_z + kr_z = c_z, k = (c_z-p_z)/r_z
        var k = (origin[2]*4-cameraPos[2])/cameraRay[2]
        // relative to origin, x,y:
        var x = Math.floor((cameraPos[0]+k*cameraRay[0] - origin[0])/4);
	var y = Math.floor((cameraPos[1]+k*cameraRay[1] - origin[1])/4);
	//console.log(x+":"+y);
        // check if x,y actually in the chunk
        if ([x,y,origin[2]] in terrain_grid){
            return [x,y,origin[2]];
        }
	return false;
    }

    image.onload = this.init
    image.src = path;
    this.getImage = function(){
        return image;
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

document.onkeydown = function(evt){
    camAngles = camera.getAngles(); 
    var k = evt.keyCode;
    
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

    if (k==_key.ctrl){
	camera.moveOnMouseDelta(false);
    }
    camera.update();
    //drawFrame();
}
