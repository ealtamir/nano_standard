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
          <span>Standard @ {new Date().getFullYear()}. Created by</span>
          <a
            href="https://twitter.com/enzo_alt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-white transition-colors font-medium"
          >
            @enzo_alt.
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
            className="hover:text-accent transition-colors"
          >
            About Nano
          </a>
        </div>
      </div>
    </footer>
  );
}
