FROM linuxserver/ffmpeg

RUN apt-get update && apt-get install -y unzip

RUN curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr bash

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*