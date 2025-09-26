import { asset } from "$fresh/runtime.ts";
import { ComponentChildren } from "preact";

interface HeaderProps {
  navigation?: ComponentChildren;
  props?: any;
  className?: string;
}

export function Header({ navigation, className }: HeaderProps) {
  return (
    <header
      class={`w-full max-w-[2000px] p-6 flex justify-between items-center mb-10 mx-auto ${className}`}
    >
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-2">
          <a href="/">
            <img
              src={asset("/standard_logo_horizontal.svg")}
              alt="Standard Logo"
              class="h-100"
            />
          </a>
        </div>
      </div>

      <nav class="relative">
        <ul className="flex space-x-10 text-gray-600 items-center">
          <div class="hidden md:flex space-x-10 items-center">
            {navigation}
          </div>
          <li class="relative group">
            <button class="bg-accent hover:bg-accent/90 text-white font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-1 shadow-sm">
              Dashboards
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div class="py-1 border border-gray-100 rounded-lg">
                <a
                  href="/dashboards/transactions"
                  class="px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                  </svg>
                  <span>Transactions</span>
                </a>
                <a
                  href="/dashboards/accounts"
                  class="px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Accounts</span>
                </a>
                <a
                  href="/dashboards/network"
                  class="px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M7.5 4.27h9c.85 0 1.5.65 1.5 1.5v5.73"></path>
                    <path d="m5 7 5 3-5 3V7Z"></path>
                    <path d="M6 20.77a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z">
                    </path>
                    <path d="M18 18.27a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z">
                    </path>
                  </svg>
                  <span>Network Graph</span>
                </a>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
