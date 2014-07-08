
function AnimatedWorldObject(spriteData, pos){
    this.pos = pos || [0,0,0];
    this.sprites = {stand:{length:1,
			   0:{draw:function(){}}},
		    walk:{length:0}};
    this.currentAnim = "stand";
    this.currentMax = 1;

    function load(self,path,anim,sub){
	loadBinaryFile("models/"+path,
           function(data){
	       self.sprites[anim][sub] = loadVOBJ(data).sprite
	   });
    }

    if (spriteData.walk !== undefined){
	var w = {};
	this.sprites.walk = w;
	w.length = spriteData.walk.length;
	for (var i=0;i<w.length;i++){
	    load(this,spriteData.walk[i],"walk",i);
	}
    }
    
    this.draw = function(){
	var pos = this.pos.map(function(x){return x*tile_size;});
        mat4.translate(viewMatrix, [pos[0]+2,pos[1]+2,pos[2]]);
	var keyframe = Math.floor(new Date().getTime()/200) % this.currentMax;
        this.sprites[this.currentAnim][keyframe].draw();
        mat4.translate(viewMatrix, [-pos[0]-2,-pos[1]-2,-pos[2]]);
	return this;
    }

    this.setAnim = function(anim){
	this.currentAnim = anim;
	this.currentMax = this.sprites[anim].length;
    }
}
