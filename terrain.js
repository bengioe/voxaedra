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
    this.chunks = chunks;
    this.init = function(){
	console.log("Terrain init");
	chunks[[0,0,0]] = new Chunk(this,[0,0,0]);
	chunks[[0,0,0]].updateBlocks();
    }
    this.draw = function(){
	//viewMatrix = mat4.translate(viewMatrix, [i*8,j*8,-8]);
	chunks[[0,0,0]].draw();
	//viewMatrix = mat4.translate(viewMatrix, [-i*8,-j*8,8]);
    }
    this.getBlock = function(pos){
	var chunkpos = pos.map(function(x){return Math.floor(x/Chunk.SIZE);});
	if (chunks.hasOwnProperty(chunkpos)){
	    var chunkoffset = pos.map(function(x){return x%Chunk.SIZE;});
	    return chunks[chunkpos].getBlock(chunkoffset);
	}else{
	    return {
		isFullCube:false,
		draw:function(){}
	    };	    
	}
    }
    
})();

var derp = 0, herp =0;
function Chunk(terrain, pos){
    var blocks = {};
    var t0 = new Date().getTime();
    for (var i=0;i<Chunk.SIZE;i++){
    for (var j=0;j<Chunk.SIZE;j++){
    for (var k=0;k<Chunk.SIZE;k++){
	blocks[[i,j,k]] = new Block(terrain,[i+pos[0]*Chunk.SIZE,
					     j+pos[1]*Chunk.SIZE,
					     k+pos[2]*Chunk.SIZE]);
    }}}
    console.log(new Date().getTime()-t0);
    console.log(derp+"+"+herp);
    this.updateBlocks = function(){
	for (var i=0;i<Chunk.SIZE;i++){
	for (var j=0;j<Chunk.SIZE;j++){
        for (var k=0;k<Chunk.SIZE;k++){	
	    blocks[[i,j,k]].checkIfDrawNeeded();
	}}}
    }
    this.getBlock = function(pos){
	return blocks[pos];
    }
    this.draw = function(){
	for (var i=0;i<Chunk.SIZE;i++){
	for (var j=0;j<Chunk.SIZE;j++){
        for (var k=0;k<Chunk.SIZE;k++){	
	    blocks[[i,j,k]].draw();
	}}}
    }
}
Chunk.SIZE = 16;

var seed = 142857;
var _noise = new SimplexNoise();
function Block(terrain, pos){
    this.pos = pos
    var t0 = new Date().getTime();
    this.isFullCube = true;
    var sprite = null;
    var voxels = {};
    for (var i=0;i<Block.SIZE;i++){
    for (var j=0;j<Block.SIZE;j++){
    for (var k=0;k<Block.SIZE;k++){
	if (_noise.noise3d((i+pos[0]*Block.SIZE)/80,
			   (j+pos[1]*Block.SIZE)/80,
			   (k+pos[2]*Block.SIZE)/40)<0.3){
	    this.isFullCube = false;
	    continue;
	}
	voxels[[i,j,k]]=terrainTypedColor(1,seed).map(function(x){return x/255.});
	seed = seed + (seed<<3);
    }}}
    this.build_sprite = function(){
	sprite = new VoxelSprite(voxels);
    }
    this.checkIfDrawNeeded = function(){
	if (sprite!==null){return;}
	if (!terrain.getBlock([pos[0]+1,pos[1],pos[2]]).isFullCube ||
	    !terrain.getBlock([pos[0]-1,pos[1],pos[2]]).isFullCube ||
	    !terrain.getBlock([pos[0],pos[1]+1,pos[2]]).isFullCube ||
	    !terrain.getBlock([pos[0],pos[1]-1,pos[2]]).isFullCube ||
	    !terrain.getBlock([pos[0],pos[1],pos[2]+1]).isFullCube ||
	    !terrain.getBlock([pos[0],pos[1],pos[2]-1]).isFullCube){
	    console.log(pos);
	    this.build_sprite()
	    //todo, si c'est plein partout autour, aussi bien disable le sprite
	}
	    
    }
    this.draw = function(){
	if (sprite!==null){
	    var s = Block.SIZE;
	    viewMatrix = mat4.translate(viewMatrix, [pos[0]*s,pos[1]*s,pos[2]*s-s]);
	    sprite.draw();
	    viewMatrix = mat4.translate(viewMatrix, [-pos[0]*s,-pos[1]*s,-pos[2]*s+s]);
	}
    }
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
