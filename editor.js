
/*****************************************
 * ALL GLOBAL VARIABLES DECLARED HERE!!! *
 *****************************************/

var temp_voxel_sprite;
var voxel_data = {};
var grid_position = [-5,-5,0];
var insertMode = 1
var eraserMode = 2;
var pickMode = 3;
var currentMode = 1;
function dir(object)
{
    methods = [];
    for (z in object) {
        if (typeof(z) != 'number') {
            methods.push(z);
        }
        return methods.join(', ');
    }
}

function hex255(n){
    n = (n*255).toString(16);
    if (n.length==1){return "0"+n;}
    return n;
}


function loaded(){
    setupCanvas("glcontext");
    setupShaders();
    derp = {};
    var n = 3;
    console.log(n*n*n);
    for(var i=0;i<n*n*n;i++){
        derp[[i%n,Math.floor(i/n)%n,Math.floor(i/(n*n))]] =
	    [Math.sin(i)+Math.cos(i),Math.cos(i)*Math.cos(i)+i%3,(i+1)%2];
    }
    
    var table = document.getElementById("colortable");
    table.onclick = function(event){
	var j = event.target.cellIndex;
	var i = event.target.parentNode.rowIndex;
	var pos = [grid_position[0]+i,
		   grid_position[1]+j,
		   grid_position[2]];
	if (currentMode == insertMode){
	    var c = document.getElementById("colorpick").value;
	    c = [parseInt(c.substring(0,2),16)/255,
		 parseInt(c.substring(2,4),16)/255,
		 parseInt(c.substring(4,6),16)/255]
	    voxel_data[pos] = c;
	}else if (currentMode == eraserMode){
	    delete voxel_data[pos];
	}else if (currentMode == pickMode){
	    var c = voxel_data[pos];
	    document.getElementById("colorpick").color.fromRGB(
		c[0],c[1],c[2]);
	}
	if (temp_voxel_sprite){
	    temp_voxel_sprite.destroy();
	    temp_voxel_sprite = new VoxelSprite(voxel_data);
	}
	grid_update();
    }
    table.onmousemove = function(event){
	var j = event.target.cellIndex;
	var i = event.target.parentNode.rowIndex;
	var pos = [grid_position[0]+i,
		   grid_position[1]+j,
		   grid_position[2]];
	if (pos.map(isNaN).indexOf(true)>=0){
	    return;
	}
	document.getElementById("grid_mousepos").innerHTML = pos;
    }
    grid_update();
    temp_voxel_sprite = new VoxelSprite(derp);
    setInterval(drawFrame,150);
    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object
	var fr = new FileReader();
	fr.onload = function(x){load_voxel_model(x.target.result);};
	fr.readAsArrayBuffer(files[0]);
      }
      document.getElementById('files').addEventListener('change', handleFileSelect, false);
}

/**
 * load a voxel model into the editor
 * @param data, ArrayBuffer, representing the file data
 */
function load_voxel_model(data){
    if (temp_voxel_sprite && 'destroy' in temp_voxel_sprite){
	temp_voxel_sprite.destroy();
    }
    var data = loadVOBJ(data);
    temp_voxel_sprite = data.sprite;
    voxel_data = data.voxels;
}

function save_model(){
    var version = 1;
    var data = [14,28,57,version]
    for (var i in voxel_data){
	var pos = i.split(",").map(function(x){return parseInt(x);});
	data.push.apply(data, pos);
	data.push.apply(data, voxel_data[i].map(function(x){return x*255;}));
    }
    var d = ab2str(new Int8Array(data).buffer);
    document.getElementById("datalink").href =
	"data:model/voxelmap;base64,"+btoa(d);
}

function toggle_eraser(){
    if (currentMode != eraserMode){
	currentMode = eraserMode;
    }
    else{
	currentMode = insertMode;
    }
    update_table_cursor();
}
function toggle_picker(){
    if (currentMode!=pickMode){
	currentMode = pickMode;
    }
    else{
	currentMode = insertMode;
    }
    update_table_cursor();
}


function update_table_cursor(){
    var table = document.getElementById("colortable");
    if (currentMode == insertMode){
	table.style.cursor = "default";
    }else if (currentMode == eraserMode){
	table.style.cursor = "url('images/eraser.png')";
    }else if (currentMode == pickMode){
	table.style.cursor = "url('images/pick.png')";
    }
}
function grid_forw() { grid_position[0]+=1;grid_update();}
function grid_back() { grid_position[0]-=1;grid_update();}
function grid_up()   { grid_position[2]+=1;grid_update();}
function grid_down() { grid_position[2]-=1;grid_update();}
function grid_right(){ grid_position[1]+=1;grid_update();}
function grid_left() { grid_position[1]-=1;grid_update();}


function grid_update(){
    var tablesize = 10;
    var inner = "";
    for (var i=-1;i++<tablesize;){
	inner+= "<tr>";
	for (var j=-1;j++<tablesize;){
	    var pos = [grid_position[0]+i,
		       grid_position[1]+j,
		       grid_position[2]];
	    var voxel = voxel_data[pos];
	    if (voxel){
		inner += "<td bgcolor='#"+voxel.map(hex255).join("")+"'/>";
	    }
	    else{
		inner += "<td class='transcell'/>"
	    }
	}
	inner+= "</tr>";
    }
    var table = document.getElementById("colortable");
    table.innerHTML = inner;
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
    globalShader.updateMats();
    temp_voxel_sprite.draw();
    
    document.getElementById("log").innerHTML = new Date().getTime() - start;
}
var _key = {
    a:65,
    d:68,
    e:69,
    f:70,
    q:81,
    r:82,
    s:83,
    w:87,
}

document.onkeydown = function(evt){
    var k = evt.keyCode;
    if (k==_key.s){
	grid_back()
    }else if (k==_key.w){
	grid_forw();
    }else if (k==_key.q){
	grid_up();
    }else if (k==_key.e){
	grid_down();
    }else if (k==_key.a){
	grid_left();
    }else if (k==_key.d){
	grid_right();
    }else if (k==_key.r){
	toggle_eraser();
    }else if (k==_key.f){
	toggle_picker();
    }
    drawFrame();
}
