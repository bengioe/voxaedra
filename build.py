
# while inotifywait -e close_write src/*; do python build.py; done

import os
import time

while 1:
    src = "\n".join([open("src/"+f,'r').read() for f in os.listdir("src/") if f.endswith(".js")])

    open("voxaedra.js",'w').write(src)
    print(time.strftime("%d:%m:%Y %H:%M:%S"))
    time.sleep(2)
    #raw_input("done.")
