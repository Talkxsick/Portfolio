import { create } from 'zustand'

export type AppName = 'terminal' | 'projects' | 'about' | 'music' | 'contact'

export interface WindowState {
  id: AppName
  isOpen: boolean
  isMinimized: boolean
  zIndex: number
  position: { x: number; y: number }
}

interface WindowStore {
  windows: Record<AppName, WindowState>
  highestZ: number
  bootComplete: boolean

  openWindow:     (id: AppName) => void
  closeWindow:    (id: AppName) => void
  minimizeWindow: (id: AppName) => void
  focusWindow:    (id: AppName) => void
  setPosition:    (id: AppName, pos: { x: number; y: number }) => void
  setBootComplete: () => void
}

const defaultWindows: Record<AppName, WindowState> = {
  terminal: { id: 'terminal', isOpen: false, isMinimized: false, zIndex: 10, position: { x: 80,  y: 60  } },
  projects: { id: 'projects', isOpen: false, isMinimized: false, zIndex: 10, position: { x: 140, y: 80  } },
  about:    { id: 'about',    isOpen: false, isMinimized: false, zIndex: 10, position: { x: 200, y: 100 } },
  music:    { id: 'music',    isOpen: false, isMinimized: false, zIndex: 10, position: { x: 260, y: 120 } },
  contact:  { id: 'contact',  isOpen: false, isMinimized: false, zIndex: 10, position: { x: 320, y: 140 } },
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: defaultWindows,
  highestZ: 10,
  bootComplete: false,

  openWindow: (id) => {
    const { highestZ } = get()
    const newZ = highestZ + 1
    set(state => ({
      highestZ: newZ,
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isOpen: true, isMinimized: false, zIndex: newZ }
      }
    }))
  },

  closeWindow: (id) => set(state => ({
    windows: { ...state.windows, [id]: { ...state.windows[id], isOpen: false } }
  })),

  minimizeWindow: (id) => set(state => ({
    windows: { ...state.windows, [id]: { ...state.windows[id], isMinimized: true } }
  })),

  focusWindow: (id) => {
    const { highestZ } = get()
    const newZ = highestZ + 1
    set(state => ({
      highestZ: newZ,
      windows: { ...state.windows, [id]: { ...state.windows[id], zIndex: newZ } }
    }))
  },

  setPosition: (id, pos) => set(state => ({
    windows: { ...state.windows, [id]: { ...state.windows[id], position: pos } }
  })),

  setBootComplete: () => set({ bootComplete: true }),
}))