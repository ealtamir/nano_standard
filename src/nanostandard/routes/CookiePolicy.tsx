import { Head } from "$fresh/runtime.ts";
import { Header } from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Breadcrumb from "../components/Breadcrumb.tsx";

export default function CookiePolicy() {
  // Define breadcrumb items for this page
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cookie Policy", active: true },
  ];

  return (
    <>
      <Head>
        <title>Cookie Policy - STANDARD</title>
        <meta
          name="description"
          content="Cookie Policy for STANDARD - Nano Network Intelligence"
        />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header
          navigation={
            <ul className="flex space-x-6">
              <li>
                <a
                  href="/#features"
                  className="hover:text-blue-500 transition-colors font-bold"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/#community"
                  className="hover:text-blue-500 transition-colors font-bold"
                >
                  Community
                </a>
              </li>
            </ul>
          }
        />

        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-8 font-montserrat">
            Cookie Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6">
              Last Updated: {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
            <p>
              <span className="font-high-tide">STANDARD</span>{" "}
              uses cookies and similar technologies to enhance your browsing
              experience and provide us with valuable insights about how our
              website is used. This policy explains our approach to cookies and
              how you can manage them.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              What Cookies We Use
            </h2>
            <p>
              We use performance cookies from Google Analytics and Google Tag
              Manager to collect anonymous information about how visitors use
              our website. These cookies help us understand:
            </p>
            <ul className="list-disc pl-8 mb-4">
              <li>How many people visit our website</li>
              <li>Which pages are most popular</li>
              <li>How users navigate through our site</li>
              <li>Whether users encounter any issues while browsing</li>
            </ul>
            <p>
              This information is crucial for us to continually improve our
              website and ensure we're providing the best possible experience
              for our users. All data collected is anonymous and aggregated,
              meaning we cannot identify individual users through this
              information.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Cookie Policy</h2>
            <p>
              You have complete control over the cookies we use. You can manage
              your cookie preferences at any time by clicking on the cookie
              widget located in the bottom left corner of your screen. This
              allows you to accept or decline non-essential cookies according to
              your preference.
            </p>
            <p>
              Your privacy is important to us, and we respect your right to
              control your data. Declining performance cookies will not affect
              your ability to browse our website, though it does limit our
              ability to improve our services based on user behavior.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Cookie Management</h2>
            <script
              type="text/javascript"
              charset="UTF-8"
              data-cookiescriptreport="report"
              src="//report.cookie-script.com/r/77e017346b291c8e70566673932b7ee3.js"
            >
            </script>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Third-Party Services
            </h2>
            <p>
              Our website uses Google Analytics and Google Tag Manager, which
              may set cookies on your device. Additionally, please be aware that
              external websites or services linked from our site may have their
              own cookie policies, which are beyond our control.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. Any changes will be
              posted on this page with an updated "Last Updated" date.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this policy or our use of cookies,
              please contact us at:
            </p>
            <p className="mt-2">
              <a
                href="mailto:contact@nanostandard.info"
                className="text-accent hover:underline"
              >
                contact@nanostandard.info
              </a>
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
