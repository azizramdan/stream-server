import type { Subprocess } from "bun";

type WebSocketData = {
  key: string;
};

let connections: Array<{
  key: string
  ffmpeg: Subprocess<"pipe", "pipe", "inherit">
}> = []

const CLOSE_CODE_MISSING_KEY = 4001
const CLOSE_CODE_KEY_IN_USE = 4002

const server = Bun.serve<WebSocketData>({
  hostname: '0.0.0.0',
  async fetch(req, server) {
    const upgraded = server.upgrade(req, {
      data: {
        key: new URL(req.url).searchParams.get('key')
      },
    });

    if (upgraded) return undefined;
  },
  websocket: {
    message(ws, message) {
      const process = connections.find(_ => _.key === ws.data.key)

      if (process) {
        process.ffmpeg.stdin.write(message)
      }
    },
    open(ws) {
      const key = ws.data.key

      if (!key) {
        ws.close(CLOSE_CODE_MISSING_KEY, 'Missing key parameter');
        return
      }
  
      const exists = connections.find(_ => _.key === key)
  
      if (exists) {
        ws.close(CLOSE_CODE_KEY_IN_USE, 'Key already in use');
        return
      }

      connections.push({
        key: key,
        ffmpeg: Bun.spawn(
          [
            'ffmpeg',
            '-i', 'pipe:0',
            '-c:v', 'libx264',    // Transcode to H.264
            '-preset', 'veryfast', // Fast encoding preset
            '-tune', 'zerolatency', // Minimize latency
            '-c:a', 'aac',        // AAC audio codec
            '-ar', '44100',       // Audio sample rate
            '-f', 'flv',
            `${process.env.RTMP_ENDPOINT}/${key}`,
          ],
          {
            stdin: 'pipe',
            onExit(proc: Subprocess<"pipe", "pipe", "inherit">) {
              proc.stdin.end()
              cleanConnections()
            }
          }
        )
      })
    },
    close(ws, code) {
      // jangan kill proses jika close karena validasi key
      if ([CLOSE_CODE_MISSING_KEY, CLOSE_CODE_KEY_IN_USE].includes(code)) {
        return
      }
      
      const process = connections.find(_ => _.key === ws.data.key)
      
      if (process) {
        process.ffmpeg.kill('SIGKILL')
      }
    }
  },
})

function cleanConnections() {
  connections = connections.filter(conn => conn.ffmpeg && !conn.ffmpeg.killed)
}

// pastikan tidak ada connection yang prosesnya sudah mati
setInterval(() => {
  cleanConnections()
}, 1000 * 60);

console.log(`Listening on ${server.hostname}:${server.port}`);