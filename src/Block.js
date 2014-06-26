

function Block(type, pos){
    this.type = type;
    this.pos = pos;

    this.sample = function(){
	return [0,((pos[0]*1911 ^ pos[1]*4773 ^ pos[2]*7219 ^ pos[1]*(pos[2]+1)*413)%100 + 100)/255, 0];
    }
}
