#!/bin/bash

WATCH_DIR="/data/hls/dashcam"
RECORD_DIR="/data/recordings/dashcam"
NGINX_URL="http://nginx-rtmp/hls/dashcam"

declare -A ffmpeg_pids

start_recording() {
    local key=$1
    local input_stream="$NGINX_URL/$key/index.m3u8"
    local output_dir="$RECORD_DIR/$key"
    
    mkdir -p "$output_dir"
    
    echo "Starting recording process for dashcam $key"
    
    while true; do
        # Check if directory still exists
        if [ ! -d "$WATCH_DIR/$key" ]; then
            echo "Directory removed, stopping recording for $key"
            break
        fi
        
        # 60-second segments
        ffmpeg -i "$input_stream" \
            -c:v libx264 \
            -preset fast \
            -c:a aac \
            -g 60 \
            -keyint_min 60 \
            -sc_threshold 0 \
            -f segment \
            -segment_time 60 \
            -segment_time_delta 0.05 \
            -force_key_frames "expr:gte(t,n_forced*60)" \
            -segment_format_options movflags=+faststart \
            -segment_list_size 0 \
            -segment_list_type csv \
            -segment_list "/dev/null" \
            -reset_timestamps 1 \
            -vsync 1 \
            -avoid_negative_ts make_zero \
            -strftime 1 \
            "$output_dir/%Y%m%d_%H%M%S.mp4"

        if [ $? -ne 0 ]; then
            echo "FFmpeg error occurred"
            sleep 5
        else
            echo "Segment completed successfully"
            sleep 1
        fi
    done
}

stop_recording() {
    local key=$1
    if [ ! -z "${ffmpeg_pids[$key]}" ]; then
        echo "Stopping recording for $key (PID: ${ffmpeg_pids[$key]})"
        kill ${ffmpeg_pids[$key]} 2>/dev/null
        unset ffmpeg_pids[$key]
    fi
}

echo "Starting dashcam monitor..."

# Watch for directory creation and removal
inotifywait -m "$WATCH_DIR" -e create -e moved_to -e delete |
while read path action file; do
    case "$action" in
        "CREATE,ISDIR" | "MOVED_TO,ISDIR")
            echo "New dashcam detected: $file"
            start_recording "$file" &
            ffmpeg_pids[$file]=$!
            echo "Started recording for $file (PID: ${ffmpeg_pids[$file]})"
            ;;
            
        "DELETE,ISDIR")
            echo "dashcam removed: $file"
            stop_recording "$file"
            ;;
    esac
done
