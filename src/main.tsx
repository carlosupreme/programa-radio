import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      
      // Start monitoring immediately
      setTimeout(() => monitorCacheProgress(), 1000)

      // Check if service worker is already active
      if (registration.active) {
        setTimeout(() => checkCacheStatus(), 1500)
      }

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              setTimeout(() => {
                monitorCacheProgress()
                checkCacheStatus()
              }, 1000)
            }
          })
        }
      })

      // Also listen for controller change (when SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setTimeout(() => {
          monitorCacheProgress()
          checkCacheStatus()
        }, 1000)
      })
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  })
}

let progressInterval: number | null = null

function monitorCacheProgress() {
  // Clear any existing interval
  if (progressInterval) {
    clearInterval(progressInterval)
  }

  // Check progress every 500ms
  progressInterval = window.setInterval(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        console.log('Available caches:', cacheNames)
        
        // Look for any cache that might contain our files
        let allMp3Files: Request[] = []
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName)
          const cachedRequests = await cache.keys()
          console.log(`Cache "${cacheName}" has ${cachedRequests.length} requests`)
          
          // Log first few URLs to see the pattern
          if (cachedRequests.length > 0) {
            console.log('Sample URLs:', cachedRequests.slice(0, 3).map(req => req.url))
          }
          
          const mp3Files = cachedRequests.filter(req => req.url.includes('.mp3'))
          console.log(`Found ${mp3Files.length} MP3 files in ${cacheName}`)
          allMp3Files = [...allMp3Files, ...mp3Files]
        }
        
        // Remove duplicates based on URL
        const uniqueMp3Files = Array.from(new Set(allMp3Files.map(req => req.url)))
        
        const total = 19
        const downloaded = uniqueMp3Files.length
        const progress = (downloaded / total) * 100

        console.log(`Download progress: ${downloaded}/${total} (${progress.toFixed(1)}%)`)

        // Emit progress event
        if (downloaded > 0 && downloaded < total) {
          window.dispatchEvent(new CustomEvent('swDownloadProgress', {
            detail: { progress, downloaded, total }
          }))
        } else if (downloaded >= total) {
          // All downloaded, stop monitoring
          console.log('All MP3 files cached!')
          if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
          }
          window.dispatchEvent(new Event('swOfflineReady'))
        }
      } catch (error) {
        console.error('Error monitoring cache progress:', error)
      }
    }
  }, 500)
}

async function checkCacheStatus() {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      console.log('Checking cache status, available caches:', cacheNames)
      
      // Check all caches for MP3 files
      let allMp3Files: Request[] = []
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const cachedRequests = await cache.keys()
        console.log(`Cache "${cacheName}" has ${cachedRequests.length} requests`)
        
        const mp3Files = cachedRequests.filter(req => req.url.includes('.mp3'))
        console.log(`Found ${mp3Files.length} MP3 files in ${cacheName}`)
        allMp3Files = [...allMp3Files, ...mp3Files]
      }
      
      // Remove duplicates
      const uniqueMp3Files = Array.from(new Set(allMp3Files.map(req => req.url)))
      
      console.log(`Found ${uniqueMp3Files.length} MP3 files in cache`)
      
      // Check if we have all 19 MP3 files cached
      if (uniqueMp3Files.length >= 19) {
        console.log('All MP3 files are cached, dispatching ready event')
        window.dispatchEvent(new Event('swOfflineReady'))
      }
    } catch (error) {
      console.error('Error checking cache status:', error)
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
