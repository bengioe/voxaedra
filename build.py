import os

src = "\n".join([file("src/"+f,'r').read() for f in os.listdir("src/")])

file("voxaedra.js",'w').write(src)
