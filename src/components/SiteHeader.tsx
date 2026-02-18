export function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent">
            Savvy
          </span>
        </a>
        <nav className="flex items-center gap-5 text-sm text-gray-500">
          <a href="/about" className="hover:text-indigo-600 transition-colors">About</a>
          <a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a>
          <a href="/terms" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy</a>
        </nav>
      </div>
    </header>
  );
}
