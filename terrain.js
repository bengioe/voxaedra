/**
A bit of vocabulary:

- Terrain, the global terrain object manages and displays Chunks

- A Chunk, is an N sided cube containing information about a given
  area. It contains N^3 Blocks, and references to TerrainObjects

- A Block, is an M sided cube containing information about it's
  nature/contents.

- A TerrainObject, an object in voxel space with various attributes.

Those objects' contructors are defined here. They shouldn't really be
used externally, except for Terrain.

Additional functions defined here:
- terrainTypedColor (type,seed)

*/

/**
 * The global terrain object (built here)()
 * 
 */
var Terrain = new (function(){
    var chunks = {};
    this.init = function(){
	chunks[[0,0,0]] = new Chunk();
    }
    this.draw = function(){
	//viewMatrix = mat4.translate(viewMatrix, [i*8,j*8,-8]);
	chunk[[0,0,0]].draw();
	//viewMatrix = mat4.translate(viewMatrix, [-i*8,-j*8,8]);
    }
    
})();

var derp = 0, herp =0;
function Chunk(){
    var blocks = {};
    var t0 = new Date().getTime();
    for (var i=0;i<8;i++){
    for (var j=0;j<8;j++){
	blocks[[i,j,0]] = new Block();
    }}
    console.log(new Date().getTime()-t0);
    console.log(derp +"+"+herp);
    this.draw = function(){
	var s = Block.SIZE;
	for (var i=0;i<8;i++){
	for (var j=0;j<8;j++){
	    viewMatrix = mat4.translate(viewMatrix, [i*s,j*s,-s]);
	    blocks[[i,j,0]].draw();
	    viewMatrix = mat4.translate(viewMatrix, [-i*s,-j*s,s]);
	}}
    }
}

var seed = 142857;

function Block(){
    var t0 = new Date().getTime();
    var voxels = {};
    for (var i=0;i<Block.SIZE;i++){
    for (var j=0;j<Block.SIZE;j++){
    for (var k=0;k<Block.SIZE;k++){
	voxels[[i,j,k]]=terrainTypedColor(1,seed).map(function(x){return x/255.});
	seed = seed + (seed<<3);
    }}}
    derp+=new Date().getTime()-t0;
    var t0 = new Date().getTime();
    var sprite = new VoxelSprite(voxels);
    herp+=new Date().getTime()-t0;
    this.draw = sprite.draw;
}
Block.SIZE = 8;


function terrainTypedColor(type, seed){
    if (type==1){//grass
	return [12 + Math.sin(seed)*12,
		180 + Math.cos(seed<<2)*20,
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
