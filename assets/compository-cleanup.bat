@echo off
docker rm $(docker ps -a -f status=exited -q)
docker volume rm --force compository6
pause