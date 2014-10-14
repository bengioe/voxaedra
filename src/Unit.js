

function Unit(owner, type){

    var x = {
        stand : {
            length : 1,
            0 : "person.vobj"
        },
	walk : {
	    length : 4,
	    0 : "person_walk_1",
	    1 : "person_walk_2",
	    2 : "person_walk_3",
	    3 : "person_walk_4"}
    };

    this.vobj = new AnimatedWorldObject(x);
    this.direction = [1,0];
    this.owner = owner;
    this.type = type;
    this.pos = [0,0,0];
    //this.vobj.setAnim("walk");
    
    this.draw = function(){
	this.vobj.pos = this.pos
	this.vobj.draw();
    }
    
}
