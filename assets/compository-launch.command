#!/bin/bash
docker run -it --init -v compository:/database -p 22222:22222 -p 22223:22223 guillemcordoba/compository:0.2
