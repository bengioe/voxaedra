/**
   A bit of vocabulary:

   - Terrain, the global terrain object manages and displays Chunks

   - A Chunk, is an N sided cube containing information about a given
   area. It contains N^3 Blocks, and references to TerrainObjects

   - A Block, is an M sided cube containing information about it's
   nature/contents. Blocks are either full of a BlockMaterial, or empty
   and containing TerrainObjects

   - A TerrainObject, an object in voxel space with various attributes.

   Those objects' contructors are defined here. They shouldn't really be
   used externally, except for Terrain.

   Additional functions defined here:
   - terrainTypedColor (type,seed)

*/

/**
 * The global Terrain object (built here)()
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
		        draw:function(){},
		        isEmptyCube:true,
	        };	    
	    }
    }
    this.getAtVoxel = function(pos){
	    var blockpos=pos.map(function(x){return Math.floor(x/Block.SIZE);});
	    var block = this.getBlock(blockpos);
	    if (block.isEmptyCube)
	        return null;
	    return block.getVoxel(pos.map(function(x){return x%Block.SIZE;}));
    }
    
})();

var derp = 0, herp =0;
function Chunk(terrain, pos){
    var blocks = {};
    var t0 = new Date().getTime();
    var voxels = {};
    for (var i=0;i<Chunk.SIZE;i++){
        for (var j=0;j<Chunk.SIZE;j++){
            for (var k=0;k<Chunk.SIZE;k++){
	            var b = new Block(terrain,[i+pos[0]*Chunk.SIZE,
				                           j+pos[1]*Chunk.SIZE,
				                           k+pos[2]*Chunk.SIZE]);
	            if (b.isFullCube){
                    console.log("cube");
	                voxels[[i,j,k]] = b.voxel;
	            }
	            blocks[[i,j,k]] = b;
            }}}
    console.log(new Date().getTime()-t0);
    console.log(derp+"+"+herp);
    var sprite = new VoxelSprite(voxels,Block.SIZE);
    this.updateBlocks = function() {
	    for (var i=0;i<Chunk.SIZE;i++) {
	        for (var j=0;j<Chunk.SIZE;j++) {
                for (var k=0;k<Chunk.SIZE;k++) {	
	                blocks[[i,j,k]].checkIfDrawNeeded();
	            }}}
    }
    this.getBlock = function(pos){
	    return blocks[pos];
    }
    this.draw = function(){
	    sprite.draw()
    }
}
Chunk.SIZE = 32;

var seed = 142857;
var _noise = new SimplexNoise();
function Block(terrain, pos){
    this.pos = pos
    /** this variable is true if this block cannot let light pass
	    under any circumstance **/
    this.isFullCube = false;
    this.isEmptyCube = false; // true if there's anything in the block
    this.voxel = null; // if it's a full cube, only need one voxel
    this.voxels = {}; // else we might need more stuff
    this.initWithPerlinNoise = function(){
        if (_noise.noise3d((pos[0])/80,
		                   (pos[1])/80,
		                   (pos[2])/10)>0.3){
	        this.voxel = terrainTypedColor(
                1,seed).map(function(x){return x/255.});
	    this.isFullCube = true;
        }
        seed = seed + (seed<<3);
    }
    this.checkIfDrawNeeded = function(){
	    //if (sprite!==null){return;}
	    if (!terrain.getBlock([pos[0]+1,pos[1],pos[2]]).isFullCube ||
	        !terrain.getBlock([pos[0]-1,pos[1],pos[2]]).isFullCube ||
	        !terrain.getBlock([pos[0],pos[1]+1,pos[2]]).isFullCube ||
	        !terrain.getBlock([pos[0],pos[1]-1,pos[2]]).isFullCube ||
	        !terrain.getBlock([pos[0],pos[1],pos[2]+1]).isFullCube ||
	        !terrain.getBlock([pos[0],pos[1],pos[2]-1]).isFullCube){
	        return true;
	    }
    }
    this.getVoxel = function(pos){
	    if (this.isFullCube){
	        return this;
	    }else{
	        if (this.voxels[pos]==undefined)
		        return null;
	        return this.voxels[pos];
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
