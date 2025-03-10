export default function Footer() {
  return (
    <footer className="py-6 px-4 border-t border-gray-200 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 space-y-4 md:space-y-0">
        {/* Left column */}
        <div className="flex items-center gap-1 text-center md:text-left">
          <span>© {new Date().getFullYear()} NanoStandard. Created by</span>
          <a
            href="https://twitter.com/enzo_alt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            @enzo_alt.
          </a>
        </div>

        {/* Middle column */}
        <div className="flex items-center gap-1 text-center">
          <span>Price data provided by</span>
          <a
            href="https://coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            <img
              src="/coingecko_logo.png"
              alt="Coingecko Logo"
              className="w-[120px] h-auto"
            />
          </a>
        </div>

        {/* Right column */}
        <div className="flex space-x-6">
          <a
            href="https://github.com/ealtamir/nano_standard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://nano.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            About Nano
          </a>
        </div>
      </div>
    </footer>
  );
}
