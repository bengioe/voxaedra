
# while inotifywait -e close_write src/*; do python build.py; done

import os
import time
src = "\n".join([open("src/"+f,'r').read() for f in os.listdir("src/") if f.endswith(".js")])

open("voxaedra.js",'w').write(src)
print time.strftime("%d:%m:%Y %H:%M:%S")
#raw_input("done.")
