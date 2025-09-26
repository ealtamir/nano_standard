import { Handlers, PageProps } from "$fresh/server.ts";
import { Header } from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";
import Breadcrumb from "../../components/Breadcrumb.tsx";
import CommunitySignup from "../../islands/CommunitySignup.tsx";

interface PageData {
  wsProtocol: "ws" | "wss";
}

export const handler: Handlers<PageData> = {
  GET(req, ctx) {
    const isDevelopment = Deno.env.get("ENVIRONMENT") !== "production";
    const wsProtocol = isDevelopment ? "ws" : "wss";
    return ctx.render({ wsProtocol });
  },
};

export default function NetworkPage({ data }: PageProps<PageData>) {
  // Define breadcrumb items for this page
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboards", href: "/#dashboards" },
    { label: "Network", active: true },
  ];

  return (
    <div>
      <Header />

      <div className="container mx-auto max-w-[2000px] flex flex-col items-start justify-center py-6 px-4 w-full mx-auto mt-10">
        <Breadcrumb items={breadcrumbItems} className="self-start" />
        <h1 className="text-5xl font-bold mb-6 text-left w-full">
          Network Dashboard
        </h1>
      </div>

      {/* Under Construction Hero Section */}
      <div className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
            <div className="text-purple-600 mb-6">
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
                <path d="M7.5 4.27h9c.85 0 1.5.65 1.5 1.5v5.73"></path>
                <path d="m5 7 5 3-5 3V7Z"></path>
                <path d="M6 20.77a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"></path>
                <path d="M18 18.27a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Coming Soon!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              We're building a powerful Network Graph visualization tool to help
              you understand Nano's network topology, node distribution, and
              transaction flows.
            </p>
            <a
              href="#community"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
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

      <div className="mt-12"></div>
      <CommunitySignup
        title="Be the First to Access the Network Dashboard"
        description="Join our community to get early access to the Network Graph Dashboard and other upcoming features. We'll notify you as soon as it's ready!"
        gradientFrom="from-purple-400"
        gradientVia="via-purple-500"
        gradientTo="to-purple-600"
      />
      <Footer showPriceData />
    </div>
  );
}
