@echo off
docker run -it --init -v compository:/database -p 22222:22222 -p 22223:22223 -p 8888:8888 guillemcordoba/compository:0.4
pause