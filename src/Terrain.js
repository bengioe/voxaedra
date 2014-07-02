


function Terrain(path){

    var objects = [];
    var level = new  TerrainLevel(2,2);
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
	return [0,0,0];
    }
}

function TerrainTile(x,y){
    var tile_size = 4;
    this.pos = [x,y,0];
    this.z = 0;
    this.scale = 2;
    var voxels = {};
    for (var i=0;i<tile_size;i++){
	for (var j=0;j<tile_size;j++){
	    for (var k=0;k<=this.z;k++){
		voxels[[i,j,k]] = [Math.random()*0.1,Math.random()*0.2+0.7,Math.random()*0.05];
	    }
	}
    }
    this.sprite = new VoxelSprite(voxels, this.scale,
				  this.pos.map(function(x){return x*tile_size;}));

    this.draw = function(){
	var pos = this.pos;
	// done: -- rendre le scale et translation 
	// intégré aux voxels, parce que ca coute quand même cher :3 --

	var k = tile_size * this.scale;
	//mat4.scale(viewMatrix,[this.scale,this.scale,this.scale]);
        //mat4.translate(viewMatrix, [pos[0]*k,pos[1]*k,pos[2]*k]);
        this.sprite.draw();
        //mat4.translate(viewMatrix, [-pos[0]*k,-pos[1]*k,-pos[2]*k]);
	//mat4.scale(viewMatrix,[1/this.scale,1/this.scale,1/this.scale]);
	return this;
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
