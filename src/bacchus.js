/*
  This file contains:
  classes:
  StaticWorldObject  (sprite)
  VoxelSprite        (voxels)
  RawRGBSprite       (vertices,normals,colors,indexes)
  Camera             ()

  functions:
  loadVOBJ           (ArrayBuffer) -> VoxelSprite
  setupCanvas        ()
  setupShaders       ()


  The idea really is that files other than bacchus.js are agnostic of 
  the fact that WebGL (and other file facilities) is being used.
*/

/*****************************************
 * ALL GLOBAL VARIABLES DECLARED HERE!!! *
 *****************************************/
var canvas, gl, globalShader;
var viewMatrix = mat4.create();
var projMatrix = mat4.create();

var camera = undefined;
var viewport = [0,0,300,300];
var mouseWinPos = [0,0];


var _cubedelta = [
    [0,1,0], // right
    [0,-1,0],// left
    [1,0,0], // front
    [-1,0,0],// back
    [0,0,1], // up
    [0,0,-1],// down
]
var _cubevertices = [ 
    // right face
    [-1.0, 1.0, -1.0,
     -1.0, 1.0, 1.0,
     1.0, 1.0, 1.0,
     1.0, 1.0, -1.0],
    // left face
    [-1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, 1.0,
     -1.0, -1.0, 1.0],
    // front face
    [1.0, -1.0, -1.0,
     1.0, 1.0, -1.0,
     1.0, 1.0, 1.0,
     1.0, -1.0, 1.0],
    // back face
    [-1.0, -1.0, -1.0,
     -1.0, -1.0, 1.0,
     -1.0, 1.0, 1.0,
     -1.0, 1.0, -1.0],
    // up face
    [-1.0, -1.0, 1.0,
     1.0, -1.0, 1.0,
     1.0, 1.0, 1.0,
     -1.0, 1.0, 1.0],
    // down face
    [-1.0, -1.0, -1.0,
     -1.0, 1.0, -1.0,
     1.0, 1.0, -1.0,
     1.0, -1.0, -1.0]
];

var _cubenormals = [
    [ 0, 1, 0],
    [ 0,-1, 0],
    [ 1, 0, 0],
    [-1, 0, 0],
    [ 0, 0, 1],
    [ 0, 0,-1]
];

/**
 * @type class
 * A `draw`able Voxel Sprite
 * Create and own a RawRGBSprite from a voxel dict of the form
 * { 'x,y,z' : [r,g,b,[a]] , ...}
 * or 
 * { [x,y,z] : [r,g,b,[a]] , ...}
 * note: alpha not supported yet.
 * note: 0<=r,g,b,a<=1.0
 */
function VoxelSprite(voxels, scale, offset){
    offset = offset || [0, 0, 0];
    scale = scale || 1;
    var start = new Date().getTime();
    // quads is a list of [pos,delta_index]
    // delta_index is the index the direction in _cubedelta
    var quads = new Array();
    for (var pos in voxels){
	var color = voxels[pos];
	pos = pos.split(',').map(function(x){return parseInt(x,10);});
	for (var j=6;j--;){
	    var d = _cubedelta[j];
	    var vj = voxels[[pos[0]+d[0],
			     pos[1]+d[1],
			     pos[2]+d[2]]];
	    if (vj === undefined){
		quads.push([pos,color,j]);
	    }
	}
    }
    var mid = new Date().getTime();
    var vertices = [];
    var normals = [];
    var colors = [];
    var indexes = [];
    var index_at = 0;
    for (var i=quads.length;i--;){
	    var vox = quads[i][0];
	    var color = quads[i][1];
	    var verts = _cubevertices[quads[i][2]];
	    var norm = _cubenormals[quads[i][2]];
	    for (var j=4;j--;){
	        vertices.push(scale*(vox[0]+verts[j*3  ]*0.5+offset[0]));
	        vertices.push(scale*(vox[1]+verts[j*3+1]*0.5+offset[1]));
	        vertices.push(scale*(vox[2]+verts[j*3+2]*0.5+offset[2]));
		colors.push.apply(colors,color);
	        normals.push.apply(normals,norm);
	    }
	    indexes = indexes.concat([index_at,index_at+1,index_at+2,
				      index_at,index_at+2,index_at+3])
	    index_at += 4;
    }
    var rawSprite = new RawRGBSprite(vertices,
				     normals,
				     colors,
				     indexes);
    this.draw = rawSprite.draw;
    this.destroy = function(){
	    rawSprite.destroy();
    }
    var end = new Date().getTime();
    if ((end-start) > 15){
		console.log("Making VoxelSprite took: "+(end-start)+"ms ("+(mid-start)+" + "+(end-mid)+")");
    }
}


/**
 * @type class
 * RGB drawable 3D object.
 * 
 * Create a `draw`able object from a list of 
 * vertices, colors, and corresponding triplets of indexes
 * for each triangle
 */
function RawRGBSprite(verts,normals,colors,idxs){
    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts),
		          gl.STATIC_DRAW)
    var normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals),
		          gl.STATIC_DRAW)
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors),
		          gl.STATIC_DRAW)
    var idxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
		          new Uint16Array(idxs),
		          gl.STATIC_DRAW);
    var nelements = idxs.length;
    this.draw = function(){
	    globalShader.updateMats()
	    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	    gl.vertexAttribPointer(globalShader.vertAttribute,
			                   3, gl.FLOAT,false,0,0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
	    gl.vertexAttribPointer(globalShader.normAttribute,
			                   3, gl.FLOAT,false,0,0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	    gl.vertexAttribPointer(globalShader.colorAttribute,
			                   3, gl.FLOAT,false,0,0);
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
	    gl.drawElements(gl.TRIANGLES, nelements, gl.UNSIGNED_SHORT, 0);		
    }
    this.destroy = function(){
	    gl.deleteBuffer(vertBuffer);
	    gl.deleteBuffer(colorBuffer);
	    gl.deleteBuffer(idxBuffer)
    }
}

/**
 * @type class
 * Camera class
 */
function Camera(mouseHandler){
    // rho, theta, phi
    var camAngles = [100, 0.9553166182, 3.141592/4];
    var camPos = [0,0,0];
    var camRay = [0,0,0.1];
    var self = this;
    var targetPos = [0,0,0];
    var doMoveOnMouseDelta = false;
    this.moveOnMouseDelta = function(b){
		doMoveOnMouseDelta = b;
    }
    this.getAngles = function(){
        return camAngles;
    }
    mouseHandler.addDeltaMouseHook(function(dx,dy,mousedown){
		if (mousedown[2]){
			camAngles[2]+=0.02*dx;
			camAngles[1]+=0.02*dy;
			if (camAngles[1] > 1.6){
				camAngles[1] = 1.6;
			} else if (camAngles[1] < -0.15){
				camAngles[1] = -0.15;
			}
		}
		if (doMoveOnMouseDelta){
			var ray = [camPos[0],camPos[1],camPos[2]]
			targetPos[0] += 0.01*(-dx*ray[1] + dy*ray[0]);
			targetPos[1] += 0.01*(dx*ray[0] + dy*ray[1]);
		}
		self.update()
    });
    /* this gives the ground pos:
       var t = -camPos[2]/camRay[2];
       var trans = vec3.add(camPos,vec3.scale(camRay,t,vec3.create()),
	   vec3.create());*/
    mouseHandler.addScrollHook(function(d){
		if (d>0){
			camAngles[0]+=7;
			if (camAngles[0]>100)
				camAngles[0] = 100;
		}
		else{
			camAngles[0]-=7;
			if (camAngles[0] < 10){
				camAngles[0] = 10;
			}
		}
		self.update();
    });
    this.getTargetPos = function(){
        return targetPos;
    }
    this.moveTargetPos = function(dx,dy,dz){
        targetPos = [dx+targetPos[0],dy+targetPos[1],dz+targetPos[2]];
    }
    this.getRay = function(){
		return vec3.scale(vec3.normalize(vec3.create(camPos)),-1);
    }
    this.update = function(){
	camPos = [camAngles[0]*Math.sin(camAngles[1])*Math.cos(camAngles[2]),
		  camAngles[0]*Math.sin(camAngles[1])*Math.sin(camAngles[2]),
		  camAngles[0]*Math.cos(camAngles[1])];
    };
    this.getPos = function(){
		return [camPos[0]+targetPos[0],camPos[1]+targetPos[1],camPos[2]+targetPos[2]];
    };
    this.computeRay = function(){
	    camRay = unproject(mouseWinPos[0],
						   300-mouseWinPos[1]);
	    return camRay;
    }
    this.voxelUnderMouse = function(){
	    //var eye = camPos.map(function(x){return x;})
	    var eye = vec3.add(camPos,[0.5,0.5,0.5],vec3.create());
	    var at = camPos.map(Math.floor);
	    var sideInto = [0,0,0];
	    var lastSideInto = [0,0,0];
	    var step = camRay.map(function(x){return x>=0?1:-1});
	    var target = camRay.map(function(x){return x>=0?1:0});
	    var iter=0;
	    //console.log(eye + ":" + at);
	    do{
            /*if (at[2]<=0){
		    //lastUnderMouse = blockmatrix.g(at.asInt());
		    return at;
            }*/
	        if (Terrain.getAtVoxel(at)!=null){
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
	        //console.log(at+":"+t);
            eye = vec3.add(eye,vec3.scale(camRay,t,vec3.create()),vec3.create());
	        //console.log(eye);
	    }while(iter++<256);
	    //sideInto.set(lastSideInto);
	    return [undefined,0,0];//lastUnderMouse.pos;
    }
    this.update();
}

function MouseEventHandler(canvas){
    var mousedown = [0,0,0,0,0,0];
    var lastmousepos = [0,0];
    var deltaMouseHooks = {};
    var deltaMouseCount = 0;
    var scrollHooks = {};
    var scrollCount = 0;
    var is_ctrl_down = false;
    this.addDeltaMouseHook = function(callback){
	    deltaMouseCount += 1;
	    deltaMouseHooks[deltaMouseCount] = callback;
	    return deltaMouseCount;
    }
    this.addScrollHook = function(callback){
	    scrollCount += 1;
	    scrollHooks[scrollCount] = callback;
	    return scrollCount;
    }
    var movehook = function(event){
		var mousex = event.clientX - canvas.offsetLeft;
		var mousey = event.clientY - canvas.offsetTop;
		mouseWinPos = [mousex,mousey];
		document.getElementById("mousepos").innerHTML = mousex+":"+mousey;//+":"+camRay;
		for (i in deltaMouseHooks){
			deltaMouseHooks[i](lastmousepos[0]-mousex,
							   lastmousepos[1]-mousey,
							   mousedown,
							   is_ctrl_down);
		}
		lastmousepos = [mousex,mousey];
    }
    var scrollhook = function(event){
	    var d = event.detail ? event.detail : -event.wheelDelta;
	    for (i in scrollHooks){
	        scrollHooks[i](d);
	    }
    };
    var downhook = function(event){
	    if (event.which==3){
	        //mousedown[2]=1;
		console.log(current_selection);
		if (current_selection !== undefined &&
		    current_selection.constructor == Unit){
		    var t = trans;
		    current_selection.pos = t.pos;
		}
	    }
	    if (event.which==1){
		var t = trans;
		current_selection = undefined;
		console.log(trans);
		if (t !== undefined &&
		    t.constructor == TerrainTile){
		    for (var i=0;i<units.length;i++){
			console.log(units[i].pos);
			if (units[i].pos[0] == t.pos[0] && units[i].pos[1] == t.pos[1]){
			    current_selection = units[i]; break;
			}
		    }
		}
	        //document.getElementById("mousevoxel").innerHTML = voxelUnderMouse();
	    }
	    event.cancelBubble = true;
	    event.returnValue = false;
	    event.stopPropagation();
	    event.preventDefault();
	    return false;
    }

    var uphook = function(event){
	    if (event.which==3){
	        mousedown[2]=0;
	    }
    }

    canvas.onmousemove = movehook
    canvas.addEventListener("DOMMouseScroll",scrollhook);
    canvas.addEventListener("mousewheel",scrollhook);
    canvas.addEventListener("mousedown",downhook,true);
    canvas.addEventListener("mouseup",uphook,true);
}

/**
 * loads a VOBJ, Voxel Object, file given an ArrayBuffer
 */
function loadVOBJ(buffer){
    var udata = new Uint8Array(buffer); // pixels are unsigned
    var sdata = new Int8Array(buffer);  // positions are signed
    var vobj_h = udata[0] + udata[1]<<8 + udata[2]<<16;
    var version = udata[3];
    if (vobj_h != 14 + 28<<8 + 57<<16){
	    alert("File is not a VOBJ");
    }
    if (version == 1) {
	    var voxels = {};
	    for (var i=4;i<udata.length;i+=6){
	        voxels[[sdata[i],sdata[i+1],sdata[i+2]]] = 
		        [udata[i+3]/255.,udata[i+4]/255.,udata[i+5]/255.];
	    }
	    return {sprite: new VoxelSprite(voxels),
				voxels: voxels};
    }
    else {
		alert("Unknown VOBJ version: "+version);
    }
}


/**
 * @type function
 * setup a canvas element to be used by Bacchus
 *
 * puts default mouse listeners on the context and creates a global
 * camera
 */
function setupCanvas(can_id){
    canvas = document.getElementById(can_id);
    var mouseHandler = new MouseEventHandler(canvas);
    camera = new Camera(mouseHandler);
    canvas.addEventListener("contextmenu",function(event){
	    event.cancelBubble = true;
	    event.returnValue = false;
	    event.stopPropagation();
	    event.preventDefault();
	    return false;
    },true);
    try{ gl = canvas.getContext("webgl");}
    catch(x) {console.log("err:"+x);}
    if (gl==null){
	    try{ gl = canvas.getContext("experimental-webgl");}
	    catch(y) {console.log("No webgl:"+y);}
    }
    if (gl==null){
	    console.log("Could not get WebGL context");
	    document.getElementById("glerrormessage").innerHTML = 
	        "It seems your browser does not support WebGL. Sorry.";
    }
    gl.enable(gl.DEPTH_TEST);
    // todo: fix les cubes dans bacchus.js pour que ceci marche, en
    // fait en ce moment je crois que TOUTES les faces sont à
    // l'envers, donc ça devrait être facile à régler, mais ça ne
    // semble pas affecter tant les performances
    // gl.enable(gl.CULL_FACE);
}

/**
 * setup variable `globalShader` using $(#vshader) and $(#fshader)
 */
function setupShaders(){
    var vertexShaderSrc = document.getElementById("vshader").innerHTML;
    var fragmentShaderSrc = document.getElementById("fshader").innerHTML;

    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	    console.log(gl.getShaderInfoLog(vertexShader));
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
	    console.log(gl.getShaderInfoLog(fragmentShader));
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
    }
    globalShader = gl.createProgram();
    gl.attachShader(globalShader, vertexShader);
    gl.attachShader(globalShader, fragmentShader);
    gl.linkProgram(globalShader);
    if (!gl.getProgramParameter(globalShader, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    gl.useProgram(globalShader);
    globalShader.colorAttribute = gl.getAttribLocation(globalShader, "aVertexColor");
    gl.enableVertexAttribArray(globalShader.colorAttribute);

    globalShader.normAttribute = gl.getAttribLocation(globalShader, "aVertexNormal");
    gl.enableVertexAttribArray(globalShader.normAttribute);

    globalShader.vertAttribute = gl.getAttribLocation(globalShader, "aVertexPos");
    gl.enableVertexAttribArray(globalShader.vertAttribute);
    
    globalShader.projMatrixUniform = gl.getUniformLocation(globalShader, "uProjMatrix");
    globalShader.viewMatrixUniform = gl.getUniformLocation(globalShader, "uViewMatrix");

    globalShader.updateMats = function (){
        gl.uniformMatrix4fv(globalShader.projMatrixUniform, false, projMatrix);
        gl.uniformMatrix4fv(globalShader.viewMatrixUniform, false, viewMatrix);
    }
}
