


function Player(){
    var x = {
	stand : "person.vobj",
	walk : {
	    length : 4,
	    0 : "person_walk_1",
	    1 : "person_walk_2",
	    2 : "person_walk_3",
	    3 : "person_walk_4"}
    };

    this.vobj = new AnimatedWorldObject(x);
    this.direction = [1,0];
    this.gameUpdate = function(deltaT){
	if (_keystate[_key.w] == _key.PRESSED){
	    
	}
    }
}
