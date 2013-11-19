
/**
 * @type class
 *
 * Create a static object in a world from a voxel model
 *
 * This object holds:
 *  - a position
 *  - a reference to a sprite
 */
function StaticWorldObject(spriteParam, pos, scale){
    var pos = pos || [0,0,0];
    this.scale = scale || 1;
    this._sprite = {draw:function(){}};
    var self = this;
    if (typeof spriteParam === "string"){
        loadBinaryFile("models/"+spriteParam,
            function(data){
                self._sprite = loadVOBJ(data).sprite;
            });
    }else{
        this._sprite = spriteParam;
    }
    this.draw = function(){
        mat4.translate(viewMatrix, [pos[0]+2,pos[1]+2,pos[2]]);
	mat4.scale(viewMatrix,[this.scale,this.scale,this.scale]);
        this._sprite.draw();
	mat4.scale(viewMatrix,[1/this.scale,1/this.scale,1/this.scale]);
        mat4.translate(viewMatrix, [-pos[0]-2,-pos[1]-2,-pos[2]]);
	return this;
    }
    this.setPos = function(p) { pos = p;return this; }
    this.getPos = function() { return pos; }
}
