FROM linuxserver/ffmpeg

RUN apt-get update && apt-get install -y inotify-tools

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*