
function Terrain(path){
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
