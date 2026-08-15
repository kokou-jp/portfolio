import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-8 text-center space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Portfolio Workspace
        </h1>
        <p className="text-muted-foreground text-sm">
          Phase 1: Project Initialization & Directory Structure is successfully set up. Vite, React, TypeScript, and Tailwind CSS v4 are ready.
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            Count: {count}
          </button>
          
          <button
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-opacity-80 transition-colors cursor-pointer"
          >
            Toggle Theme
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
