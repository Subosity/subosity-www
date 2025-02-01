import { useState, useEffect } from 'react'

const PWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    const result = await installPrompt.prompt()
    console.debug('Install prompt result:', result)
    setInstallPrompt(null)
  }

  if (!installPrompt) return null

  return (
    <div className="position-fixed bottom-0 end-0 m-3">
      <button 
        className="btn btn-primary"
        onClick={handleInstallClick}
      >
        Install App
      </button>
    </div>
  )
}

export default PWAInstall