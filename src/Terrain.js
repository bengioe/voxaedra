


function Terrain(path){

    var objects = [];
    var level = new  TerrainLevel(12,12);
    console.log(path);
    loadJSONFile(path,
		 function(data){
		     //chunk = new TerrainChunk(data.image);
		     for (var i=0;i<data.objects.length;i++){
			 var o = data.objects[i];
			 objects.push(new StaticWorldObject(o.model,o.pos,o.scale));
		     }
		     var player = new Player(); 
		 });



    this.draw = function(){
	level.draw();
	for (var i=0;i<objects.length;i++){
	    objects[i].draw();
	}
    }
    this.intersectsCameraRay = function(cameraPos,cameraRay){
	return level.intersectsCameraRay(cameraPos, cameraRay);
    }
}

function TerrainLevel(w,h){
    this.tiles = new Array(w*h);
    for (var i=0;i<w;i++){
	for (var j=0;j<h;j++){
	    this.tiles[i*w+j] = new TerrainTile(i,j);
	}
    }

    this.draw = function(){
	for (var i=0; i<w*h; i++){
	    this.tiles[i].draw();
	}
    }

    this.intersectsCameraRay = function(pos, ray){
	var it;
	for (var i=0; i<w*h; i++){
	    if ((it = this.tiles[i].intersectsCameraRay(pos, ray)) != undefined){
		return it;
	    }
	}
	return undefined;
    }
}

var tile_width = 4;
var tile_scale = 2;
var tile_size = tile_width * tile_scale;
function TerrainTile(x,y){
    this.pos = [x,y,0];
    this.z = 0;
    var voxels = {};
    for (var i=0;i<tile_width-1;i++){
	for (var j=0;j<tile_width-1;j++){
	    for (var k=0;k<=this.z;k++){
		voxels[[i,j,k]] = [Math.random()*0.1,Math.random()*0.1+0.7,Math.random()*0.05];
	    }
	}
    }
    this.sprite = new VoxelSprite(voxels, tile_scale,
				  [this.pos[0]*tile_width,
				   this.pos[1]*tile_width,
				   this.pos[2]*tile_width-0.75]);

    this.draw = function(){
	var pos = this.pos;
	// done: -- rendre le scale et translation 
	// intégré aux voxels, parce que ca coute quand même cher :3 --

	var k = tile_size * tile_scale;
	//mat4.scale(viewMatrix,[tile_scale,tile_scale,tile_scale]);
        //mat4.translate(viewMatrix, [pos[0]*k,pos[1]*k,pos[2]*k]);
        this.sprite.draw();
        //mat4.translate(viewMatrix, [-pos[0]*k,-pos[1]*k,-pos[2]*k]);
	//mat4.scale(viewMatrix,[1/tile_scale,1/tile_scale,1/tile_scale]);
	return this;
    }

    this.intersectsCameraRay = function(cam, ray){
	var p = this.pos;
	// the tile is a square defined by a plane on px,py,pz with
	// normal 0,0,1 (z-up). Thus the intersection is when the ray
	// (cx + t*rx, cy + t*ry, cz + t * rz) reaches cz + t * rz = pz
	// that is when t = (pz - cz) / rz
	var t = (p[2] - cam[2]) / ray[2];
	// the x and y positions at this point are:
	var ix = cam[0] + t * ray[0];
	var iy = cam[1] + t * ray[1];
	// now we can check if they are within this tile
	if (ix >= p[0] * tile_size &&
	    ix <= (p[0]+1) * tile_size &&
	    iy >= p[1] * tile_size &&
	    iy <= (p[1]+1) * tile_size)
	    return this;
	return undefined;
    }
}


function _Terrain2(path){
    var chunk;
    if (1){
	var objects = [];
	console.log(path);
	loadJSONFile(path,
		     function(data){
			 //chunk = new TerrainChunk(data.image);
			 for (var i=0;i<data.objects.length;i++){
			     var o = data.objects[i];
			     objects.push(new StaticWorldObject(o.model,o.pos,o.scale));
			 }
			 var player = new Player(); 
		     });
    }else{
	chunk = new TerrainChunk(this, "full", 4, [0,0,0]);
    }    
    this.abspos = [0,0,0];


    this.draw = function(){
	//chunk.draw();
	for (var i=0;i<objects.length;i++){
	    objects[i].draw();
        }
    }
    this.intersectsCameraRay = function(cameraPos,cameraRay){
	return [0,0,0];
	return chunk.intersectsCameraRay(cameraPos,cameraRay);
    }
}
