interface AccountsProps {
  wsProtocol: "ws" | "wss";
}

export default function Accounts({ wsProtocol }: AccountsProps) {
  return (
    <>
      {/* Under Construction Hero Section */}
      <div className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
            <div className="text-green-600 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Coming Soon!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              We're working hard to bring you a comprehensive Accounts
              Dashboard. This feature will provide detailed insights into
              account activities, balances, and analytics.
            </p>
            <a
              href="#community"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Get Notified When It's Ready
            </a>
          </div>
        </div>
      </div>

      <div className="block md:hidden text-sm text-gray-600 text-center px-4 py-2 bg-amber-50 rounded-md mx-4 mb-4">
        For the best experience viewing our charts and data, please consider
        using a desktop browser.
      </div>
    </>
  );
}
