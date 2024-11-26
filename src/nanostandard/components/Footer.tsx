export default function Footer() {
  return (
    <footer class="py-6 px-4 border-t border-gray-200 mt-12">
      <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
        <div class="mb-4 sm:mb-0">
          <span>© {new Date().getFullYear()} NanoStandard. Created by </span>
          <a
            href="https://twitter.com/enzo_alt"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-gray-900 transition-colors"
          >
            @enzo_alt
          </a>
        </div>
        <div class="flex space-x-6">
          <a 
            href="https://github.com/besoeasy/nanostandard" 
            target="_blank" 
            rel="noopener noreferrer"
            class="hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <a 
            href="https://nano.org" 
            target="_blank" 
            rel="noopener noreferrer"
            class="hover:text-gray-900 transition-colors"
          >
            About Nano
          </a>
        </div>
      </div>
    </footer>
  );
}
