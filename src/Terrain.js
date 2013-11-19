
function Terrain(path){
    var chunk;
    var objects = [];
    loadJSONFile(path,
        function(data){
	    chunk = new TerrainChunk(data.image);
	    for (var i=0;i<data.objects.length;i++){
		var o = data.objects[i];
		objects.push(new StaticWorldObject(o.model,o.pos,o.scale));
	    }
	    var player = new Player();
            
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
