

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

    image.onload = this.init
    image.src = path;
    this.getImage = function(){
        return image;
    }
    
}
