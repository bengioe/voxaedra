/**
A bit of vocabulary:

- Terrain, the global terrain object manages and displays Chunks

- A Chunk, is an N sided cube containing information about a given
  area. It contains N^3 Blocks, and references to TerrainObjects

- A Block, is an M sided cube containing information about it's
  nature/contents.

- A TerrainObject, an object in voxel space with various attributes.

Those objects' contructors are defined here. They shouldn't really be
used externally.

Additional functions defined here:
- terrainTypedColor (type,seed)

*/

/**
 * The global terrain object (built here)()
 * 
 */
var Terrain = new (function(){
    var chunks = {};

    
})();

function Chunk(){
    var blocks = {};
    blocks[[0,0,0]] = new Block()
    this.draw = function(){
	for (i in blocks){
	    viewMatrix = mat4.translate(viewMatrix, [0,0,-8]);
	    blocks[i].draw();
	    viewMatrix = mat4.translate(viewMatrix, [0,0,8]);
	}
    }
}

function Block(){
    var voxels = {};
    var seed = 142857;
    for (var i=0;i<8;i++){
    for (var j=0;j<8;j++){
    for (var k=0;k<8;k++){
	voxels[[i,j,k]]=terrainTypedColor(1,seed).map(function(x){return x/255.});
	seed = 3 + (seed<<1);
	console.log(seed);
    }}}
    var sprite = new VoxelSprite(voxels);
    this.draw = sprite.draw;
}


function terrainTypedColor(type, seed){
    if (type==1){//grass
	return [12 + Math.sin(seed)*12,
		180 + Math.cos(seed<<2)*40,
		32 + Math.sin(seed<<3)*12];
    }
    else if (type==2){//nether, black rock
	return [12 + Math.sin(seed)*12,
		12 + Math.cos(seed<<2)*12,
		12 + Math.sin(seed<<3)*12];
    }
}

function HeightmapTerrain(map){
    var voxels = {};
    var seed = 142857;
    for (var i=0;i<map.length;i++){
	var row = map[i]
	for (var j=0;j<row.length/2;j++){
	    voxels[i,j,row[j*2]] = terrainTypedVoxel(row[j*2+1],seed);
	    seed <<=1;
	}
    }
    var sprite = new VoxelSprite(voxels);
    this.obj = new StaticWorldObject(sprite);
}
