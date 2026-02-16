export function Header() {
  return (
    <header className="h-14 border-b border-estinator-border flex items-center px-4 bg-estinator-surface">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-estinator-accent flex items-center justify-center">
          <span className="text-lg">🤖</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-estinator-text">
            Estinator
          </h1>
        </div>
      </div>
      
      <div className="ml-4 text-sm text-estinator-muted">
        Terminate the busywork.
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button className="text-sm text-estinator-muted hover:text-estinator-text transition-colors">
          Settings
        </button>
        <button className="px-3 py-1.5 bg-estinator-accent text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-colors">
          New Project
        </button>
      </div>
    </header>
  )
}
