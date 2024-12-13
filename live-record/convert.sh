#!/bin/bash

WATCH_DIR="/data/recordings/live"
mkdir -p "$WATCH_DIR"

inotifywait -m "$WATCH_DIR" -e close_write |
while read path action file; do
    if [[ "$file" =~ .*\.flv$ ]]; then
        echo "Converting $file to MP4..."
        
        filename="${file%.*}"
        
        ffmpeg -y -i "$WATCH_DIR/$file" -c copy "$WATCH_DIR/$filename.mp4"
        
        rm "$WATCH_DIR/$file"
        
        echo "Conversion complete: $filename.mp4"
    fi
done
