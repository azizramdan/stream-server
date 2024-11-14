# Stream Server

This project sets up a streaming server using Nginx RTMP, FFmpeg, and WebSockets for live streaming and recording video streams.

## Project Structure

- **nginx-rtmp/**: Contains the Nginx RTMP configuration.
- **ffmpeg-converter/**: Includes the Dockerfile and script for converting recorded videos.
- **websocket/**: Implements the WebSocket server.

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/azizramdan/stream-server.git
    cd stream-server
    ```

2. Copy the example environment file and adjust the variables as needed:
    ```bash
    cp .env.example .env
    ```

3. Build and start the services:
    ```bash
    docker-compose up --build
    ```

### Services

- **Nginx RTMP**: Handles RTMP streaming and HLS generation.
- **FFmpeg Converter**: Converts new recordings to MP4 format.
- **WebSocket Server**: Manages WebSocket connections for streaming.

### Configuration

- **Nginx RTMP**: Configuration file located at `nginx-rtmp/config/nginx.conf`
- **FFmpeg Converter**: Script located at `ffmpeg-converter/watch-and-convert.sh`
- **WebSocket Server**: Implementation file located at `websocket/index.ts`

### Usage

1. Start the streaming server:
    ```bash
    docker-compose up
    ```

2. Open the streaming client (e.g., `index.html`) and enter the stream key to start streaming.

### Environment Variables

- `RTMP_PORT`: Port for RTMP streaming (default: 9001).
- `HTTP_PORT`: Port for HTTP server (default: 9002).
- `WEBSOCKET_PORT`: Port for WebSocket server (default: 9003).
- `RTMP_ENDPOINT`: RTMP endpoint URL for FFmpeg (default: `rtmp://nginx-rtmp:1935/live`).

### Example `.env` File

```env
RTMP_PORT=9001
HTTP_PORT=9002
WEBSOCKET_PORT=9003
RTMP_ENDPOINT=rtmp://nginx-rtmp:1935/live
```

### License

This project is licensed under the MIT License.

### Acknowledgements

- [Bun](https://bun.sh) - A fast all-in-one JavaScript runtime.
- [Nginx RTMP Module](https://github.com/arut/nginx-rtmp-module) - Nginx-based Media Streaming Server.
- [FFmpeg](https://ffmpeg.org/) - A complete, cross-platform solution to record, convert, and stream audio and video.
