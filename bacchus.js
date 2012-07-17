/*
This file contains:
classes:
  StaticWorldObject  (sprite)
  VoxelSprite        (voxels)
  RawRGBSprite       (vertices,normals,colors,indexes)

functions:
  loadVOBJ           (ArrayBuffer) -> VoxelSprite
  setupCanvas        ()
  setupShaders       ()

*/

/*****************************************
 * ALL GLOBAL VARIABLES DECLARED HERE!!! *
 *****************************************/
var canvas, gl, globalShader;
var viewMatrix = mat4.create();
var projMatrix = mat4.create();

// rho, theta, phi
var camAngles = [30, 0.5, 0.5];
var camPos = [10,-20,-60];
var camRay = [0,0,0.1];
var viewport = [0,0,300,300];
var mouseWinPos = [0,0];

/* 
 * Create a static object in a world from a voxel model
 * This object holds:
 *  - a position
 *  - a reference to a sprite
 */
function StaticWorldObject(sprite){
    var pos = [0,0,0];
    var sprite = sprite;
    this.draw = function(){
	mat4.translate(viewMatrix, pos);
	sprite.draw();
	mat4.translate(viewMatrix, [-pos[0],-pos[1],-pos[2]]);
	return this;
    }

    this.setPos = function(p){pos = p;return this;}
    this.getPos = function(){return pos;}
    
}

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

/*
 * Create a sprite from a voxel dict of the form
 * { 'x,y,z' : [r,g,b,[a]] , ...}
 * or 
 * { [x,y,z] : [r,g,b,[a]] , ...}
 * note: alpha not supported yet.
 */

function VoxelSprite(voxels){
    var start = new Date().getTime();
    // quads is a list of [pos,delta_index]
    // delta_index is the index the direction in _cubedelta
    var quads = new Array();
    for (var pos in voxels){
	pos = pos.split(',').map(function(x){return parseInt(x,10);});
	var color = voxels[pos];
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
	    vertices.push(vox[0]+verts[j*3]*0.5);
	    vertices.push(vox[1]+verts[j*3+1]*0.5);
	    vertices.push(vox[2]+verts[j*3+2]*0.5);
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
    //console.log("Making VoxelSprite took: "+(end-start)+"ms ("+(mid-start)+" + "+(end-mid)+")");
}


/**
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
 * setup a canvas element to be used by Bacchus
 * puts default mouse listeners on the context
 */
function setupCanvas(can_id){
    canvas = document.getElementById(can_id);
    var mousedown = [0,0,0,0,0,0];
    var lastmousepos = [0,0];
    canvas.onmousemove = function(event){
	var mousex = event.clientX - canvas.offsetLeft;
	var mousey = event.clientY - canvas.offsetTop;
	mouseWinPos = [mousex,mousey];
	document.getElementById("mousepos").innerHTML = mousex+":"+
	    mousey+":"+camRay+":";
	if (mousedown[2]){
	    camAngles[2]+=0.02*(lastmousepos[0]-mousex);
	    camAngles[1]+=0.02*(lastmousepos[1]-mousey);
	}
	lastmousepos = [mousex,mousey];
    }
    var scrollhook = function(event){
	var d = event.detail ? event.detail : -event.wheelDelta;
	if (d>0){
	    camAngles[0]+=7;
	}
	else{
	    camAngles[0]-=7;
	}
    };
    canvas.addEventListener("DOMMouseScroll",scrollhook);
    canvas.addEventListener("mousewheel",scrollhook);

    canvas.addEventListener("mousedown",function(event){
	if (event.which==3){
	    mousedown[2]=1;
	}
	event.cancelBubble = true;
	event.returnValue = false;
	event.stopPropagation();
	event.preventDefault();
	return false;
    },true);
    canvas.addEventListener("mouseup",function(event){
	if (event.which==3){
	    mousedown[2]=0;
	}
    },true);
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
