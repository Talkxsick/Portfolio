'use client'
import { useWindowStore } from '@/store/windowStore'
import BootScreen from '@/components/BootScreen'
import Desktop from '@/components/Desktop'

export default function Home() {
  const bootComplete = useWindowStore(s => s.bootComplete)

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <BootScreen />
      {bootComplete && <Desktop />}
    </main>
  )
}