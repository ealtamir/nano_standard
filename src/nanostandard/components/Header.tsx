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
      class={`w-full items-center max-w-[2000px] p-6 flex justify-between items-center mb-10 mx-auto ${className}`}
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
          {navigation && navigation.props.children}
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
                  href="/transactions"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Transactions
                </a>
                <a
                  href="/accounts"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Accounts
                </a>
                <a
                  href="/network"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Network Graph
                </a>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
