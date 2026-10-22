#!/usr/bin/env bash
echo Converting .mov files...
for name in *.mov; do ffmpeg -i $name "$(basename $name .mov).mp4"; done
#mkdir ~/galeri/backup
#mv *.mov ~/galeri/backup/
mkdir thumbnails
echo Creating .jpeg, .jog thumbnails...
for name in *.JPEG *.JPG *.jpeg *.jpg; do convert ${name} -resize 256x256 -density 72 -quality 75 thumbnails/${name}; done
echo Creating .mp4 thumbnails...
for name in *.mp4; do echo ffmpeg -i ${name} -frames:v 1 "thumbnails/$(basename ${name} .mp4).mp4.jpg"; done
for name in *.mp4; do ffmpeg -i ${name} -frames:v 1 "thumbnails/$(basename ${name} .mp4).mp4.jpg"; done
