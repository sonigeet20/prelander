export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-bold text-gray-900">Savvy</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Independent research guides to help you compare products, services, and pricing.
              We are not affiliated with any brand featured on our site.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Company</p>
            <div className="space-y-2 text-sm">
              <a href="/about" className="block text-gray-500 hover:text-indigo-600 transition-colors">About Us</a>
              <a href="/contact" className="block text-gray-500 hover:text-indigo-600 transition-colors">Contact</a>
              <a href="/about#methodology" className="block text-gray-500 hover:text-indigo-600 transition-colors">Our Methodology</a>
              <a href="/about#disclosure" className="block text-gray-500 hover:text-indigo-600 transition-colors">Affiliate Disclosure</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Legal</p>
            <div className="space-y-2 text-sm">
              <a href="/terms" className="block text-gray-500 hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="/privacy-policy" className="block text-gray-500 hover:text-indigo-600 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© {year} Savvy. All rights reserved.</p>
            <p className="text-xs text-gray-400 text-center sm:text-right max-w-md">
              Savvy is an independent research platform. We may earn commissions when you click
              affiliate links. This does not affect our editorial content or recommendations.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
