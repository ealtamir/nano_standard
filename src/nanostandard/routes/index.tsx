import { Head } from "$fresh/runtime.ts";
import { asset } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";
import { Header } from "../components/Header.tsx";
import CommunitySignup from "../islands/CommunitySignup.tsx";

// Mock framer-motion functionality since we don't have it installed
// These could be replaced with actual Framer Motion imports later
const motion = {
  div: (props: any) => <div {...props}>{props.children}</div>,
};

// Icons from Lucide (implemented as inline SVGs for simplicity)
const Icons = {
  TrendingUp: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-trending-up"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
  ),
  Users: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-users"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Lightbulb: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-lightbulb"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5">
      </path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  ),
  BarChart: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-bar-chart"
    >
      <line x1="12" x2="12" y1="20" y2="10"></line>
      <line x1="18" x2="18" y1="20" y2="4"></line>
      <line x1="6" x2="6" y1="20" y2="16"></line>
    </svg>
  ),
  ArrowRight: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-arrow-right"
    >
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  ),
};

export default function Home() {
  return (
    <>
      <Head>
        <title>STANDARD - Nano Network Intelligence</title>
        <meta
          name="description"
          content="Explore clear, actionable insights that help you navigate the Nano network effortlessly."
        />
      </Head>

      {/* Main Content */}
      <div class="flex flex-col min-h-screen">
        {/* Hero background that extends behind the header */}
        <div class="absolute inset-0 z-0 overflow-visible">
          <img
            src={asset("/landing_img.png")}
            alt="Background"
            class="w-full h-full object-cover opacity-40"
          />
        </div>

        {/* Header with higher z-index */}
        <Header
          navigation={
            <ul class="flex space-x-6">
              <li>
                <a
                  href="#features"
                  class="hover:text-blue-500 transition-colors font-bold"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  class="hover:text-blue-500 transition-colors font-bold"
                >
                  Community
                </a>
              </li>
            </ul>
          }
          className="relative z-10"
        />

        <section class="hero-section relative flex-grow px-4 py-24 md:py-36 flex flex-col items-center justify-center">
          <div class="container mx-auto relative z-10">
            <div class="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                class="max-w-3xl relative"
              >
                {/* Update the backdrop to be more transparent with stronger blur */}
                <div class="absolute inset-0 bg-white/20 backdrop-blur-[2px] rounded-3xl -m-8 p-8">
                </div>

                {/* Add relative positioning to keep text on top of blur */}
                <div class="relative">
                  <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat leading-tight mb-8">
                    Smarter Decisions Start With Better Insights
                  </h1>
                  <p class="text-xl text-gray-950 mb-12 mx-auto leading-relaxed">
                    Explore clear, actionable insights that help you navigate
                    the Nano network effortlessly.{" "}
                    <span class="font-high-tide">STANDARD</span>{" "}
                    simplifies complex data into intuitive intelligence anyone
                    can use.
                  </p>
                  <a
                    href="#dashboards"
                    class="bg-accent hover:bg-accent/90 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center space-x-2 mx-auto w-fit text-lg"
                  >
                    <span>Get Started</span>
                    <Icons.ArrowRight />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" class="bg-white py-24 md:py-36">
          <div class="container mx-auto px-4">
            <div class="text-center mb-24">
              <h2 class="text-3xl md:text-5xl font-bold text-gray-900 font-montserrat mb-6">
                What we're building
              </h2>
              <p class="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Welcome to <span class="font-high-tide">STANDARD</span>{" "}
                - your comprehensive intelligence toolkit for understanding
                what's happening on the Nano network.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                class="bg-gray-50 p-8 rounded-xl h-full flex flex-col"
              >
                <div class="bg-blue-100 p-4 rounded-full w-fit mb-6 text-blue-600">
                  <Icons.TrendingUp />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                  Spot Trends Early
                </h3>
                <p class="text-gray-700 flex-grow leading-relaxed">
                  Understand what's happening on the Nano network before others
                  do. Easily identify shifts and act confidently ahead of the
                  curve.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                class="bg-gray-50 p-8 rounded-xl h-full flex flex-col"
              >
                <div class="bg-green-100 p-4 rounded-full w-fit mb-6 text-green-600">
                  <Icons.Users />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                  Know the Key Players
                </h3>
                <p class="text-gray-700 flex-grow leading-relaxed">
                  Identify key influencers and impactful accounts within Nano.
                  Gain clarity on account behaviors and relationships.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                class="bg-gray-50 p-8 rounded-xl h-full flex flex-col"
              >
                <div class="bg-purple-100 p-4 rounded-full w-fit mb-6 text-purple-600">
                  <Icons.Lightbulb />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                  Predict and React with Confidence
                </h3>
                <p class="text-gray-700 flex-grow leading-relaxed">
                  Leverage AI-powered predictions for smarter choices. Quickly
                  adapt to changes and opportunities as they emerge.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                class="bg-gray-50 p-8 rounded-xl h-full flex flex-col"
              >
                <div class="bg-orange-100 p-4 rounded-full w-fit mb-6 text-orange-600">
                  <Icons.BarChart />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                  See Beyond the Numbers
                </h3>
                <p class="text-gray-700 flex-grow leading-relaxed">
                  Visualize how funds flow and how accounts evolve. Gain clear
                  insights into network dynamics.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Dashboards Section */}
        <section id="dashboards" class="py-24 md:py-36 bg-gray-50">
          <div class="container mx-auto px-4">
            <div class="text-center mb-20">
              <h2 class="text-3xl md:text-5xl font-bold text-gray-900 font-montserrat mb-6">
                Check out our <span class="text-accent">open</span>{" "}
                analytics dashboards
              </h2>
              <p class="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Gain deeper insights into the Nano network with our specialized
                dashboards, designed to help you visualize and understand
                complex data.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Transactions Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div class="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                  </svg>
                </div>
                <div class="p-6">
                  <h3 class="text-2xl font-bold text-gray-900 mb-3 font-montserrat">
                    Transactions
                  </h3>
                  <p class="text-gray-700 mb-6">
                    Track transaction emounts, monitor volume trends, and
                    identify patterns in network activity.
                  </p>
                  <a
                    href="/transactions"
                    class="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                  >
                    <span>Explore Transactions</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      class="ml-2"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* Accounts Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div class="h-48 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
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
                <div class="p-6">
                  <h3 class="text-2xl font-bold text-gray-900 mb-3 font-montserrat flex items-center">
                    Accounts
                    <span class="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-medium">
                      Coming Soon
                    </span>
                  </h3>
                  <p class="text-gray-700 mb-6">
                    Analyze account behaviors, track aggregate balances, and
                    identify key players in the Nano ecosystem.
                  </p>
                  <a
                    href="/accounts"
                    class="inline-flex items-center text-green-600 font-medium hover:text-green-800 transition-colors"
                  >
                    <span>Explore Accounts</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      class="ml-2"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* Network Graph Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div class="h-48 bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7.5 4.27h9c.85 0 1.5.65 1.5 1.5v5.73"></path>
                    <path d="m5 7 5 3-5 3V7Z"></path>
                    <path d="M6 20.77a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z">
                    </path>
                    <path d="M18 18.27a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z">
                    </path>
                  </svg>
                </div>
                <div class="p-6">
                  <h3 class="text-2xl font-bold text-gray-900 mb-3 font-montserrat">
                    Network Graph
                    <span class="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-medium">
                      Coming Soon
                    </span>
                  </h3>
                  <p class="text-gray-700 mb-6">
                    Visualize connections between accounts, understand fund
                    flows, and discover network patterns.
                  </p>
                  <a
                    href="/network"
                    class="inline-flex items-center text-purple-600 font-medium hover:text-purple-800 transition-colors"
                  >
                    <span>Explore Network</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      class="ml-2"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Community Section / Email Signup */}
        <CommunitySignup
          gradientFrom="from-blue-500"
          gradientVia="via-indigo-600"
          gradientTo="to-indigo-800"
        />

        <Footer />
      </div>
    </>
  );
}
