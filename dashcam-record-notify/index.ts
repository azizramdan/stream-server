import { watch } from 'fs'
import { stat } from 'fs/promises'
import * as path from 'path'

const WATCH_DIR = '/data/recordings/dashcam';

(async () => {
  try {
    watch(
      WATCH_DIR,
      { recursive: true },
      async (eventType, filename) => {
        if (!filename) return

        const fullPath = path.join(WATCH_DIR, filename)

        if (eventType === 'rename' && filename.endsWith('.mp4')) {
          try {
            const stats = await stat(fullPath)

            if (stats.isFile()) {
              await new Promise(resolve => setTimeout(resolve, 1000 * 60)) // wait 1 minute because video segment is not fully written yet, video segment is 1 minute long
              await sendToApi(fullPath)
            }
          } catch (error) {
            // do nothing
          }
        }
      }
    )
  } catch (error) {
    console.error('Error setting up directory watch:', error)
  }
})()

async function sendToApi(filePath: string) {
  const relativePath = path.relative(WATCH_DIR, filePath)

  const pathParts = relativePath.split(path.sep)
  const key = pathParts[0]

  const filename = '/recordings/dashcam/' + relativePath
  
    try {
      const response = await fetch(String(process.env.API_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          filename,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      console.log(`Successfully sent data to API for ${filename}`)
      
    } catch (error) {
      console.error('Error sending data to API:', error)
    }
}