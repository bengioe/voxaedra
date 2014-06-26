


/*
  TerrainChunk is an octree of TerrainChunks, leading to Block leaves at level 0
 */
function TerrainChunkOld(parent, type, level, position){
    this.level = level;
    /*
      x ->
      y |
        V
      z \
         -|
     */
    this.subchunks = [0,0,
		      0,0,	      
		        0,0,
		        0,0];
    this.parent = parent
    // position relative to parent
    this.relpos = position;
    // true position, where
    // position * (1>>level) is actually the position of the first leaf of the first subchunk
    this.abspos = [ Math.floor(parent.abspos[0] + (1 << (level+1)) * position[0]),
		    Math.floor(parent.abspos[1] + (1 << (level+1)) * position[1]),
		    Math.floor(parent.abspos[2] + (1 << (level+1)) * position[2]) ]
    console.log("level:"+level+"  "+JSON.stringify(this.abspos));
    var nexttype = "full";
    if (level <= 1){
	nexttype = "blocks";
    }
    if (type === "full"){
	for (var i=0;i<8;i++){
	    this.subchunks[i] = new TerrainChunk(this, nexttype, level-1,
						 [i%2, Math.floor((i%4)/2), Math.floor(i/4)]);
	}
	this.draw = function(){
	    for (var i=0;i<8;i++){
		this.subchunks[i].draw();
	    }
	}
    }else if (type === "blocks"){
	var blocks = {};
	for (var i=0;i<8;i++){
	    var bpos = [this.abspos[0] + i%2, 
                        this.abspos[1] + Math.floor((i%4)/2),
			this.abspos[2] + Math.floor(i/4)];
	    this.subchunks[i] = new Block("ground", bpos);
	    blocks[bpos] = this.subchunks[i].sample();
	}
	//console.log(JSON.stringify(blocks));
	var sprite = new VoxelSprite(blocks);
	this.draw = function(){
	    sprite.draw();
	}
    }else{
	console.log("Unknown type: "+type);
    }

    this.intersectsCameraRay = function(cameraPos, cameraRay){
	
    }
}

function TerrainChunk(path){
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

    image.onload = this.init;
    image.src = path;
    this.getImage = function(){
        return image;
    }
    
}
