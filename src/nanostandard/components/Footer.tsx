export default function Footer(
  { showPriceData = false }: { showPriceData?: boolean },
) {
  return (
    <footer className="py-8 px-4 bg-secondary text-white relative overflow-hidden">
      {/* Add decorative elements - now with overflow hidden on the parent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-primary/10 -translate-y-1/2">
      </div>
      <div className="absolute bottom-0 left-10 w-24 h-24 rounded-full bg-primary/5 translate-y-1/2">
      </div>

      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0 relative z-10">
        {/* Left column */}
        <div className="flex items-center gap-1 text-center md:text-left">
          <span className="mt-1 font-high-tide inline-block align-middle">
            STANDARD
          </span>
          <span>@ {new Date().getFullYear()}. Follow us on</span>
          <a
            href="https://x.com/nano_standard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-5 h-5 inline-block ml-1 mb-1"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        {/* Middle column - conditionally rendered */}
        {showPriceData && (
          <div className="flex items-center gap-1 text-center">
            <span>Price data provided by</span>
            <a
              href="https://coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="/coingecko_logo.png"
                alt="Coingecko Logo"
                className="w-[120px] h-auto"
              />
            </a>
          </div>
        )}

        {/* Right column */}
        <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
          <a
            href="/terms_of_service"
            className="hover:text-accent transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/privacy_policy"
            className="hover:text-accent transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/cookie_policy"
            className="hover:text-accent transition-colors"
          >
            Cookie Policy
          </a>
          <a
            href="https://nano.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors flex items-center"
          >
            <img
              src="/nano-logo-white.svg"
              alt="Nano Logo"
              className="w-[100px] h-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
