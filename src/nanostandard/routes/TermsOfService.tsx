import { Head } from "$fresh/runtime.ts";
import { Header } from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Breadcrumb from "../components/Breadcrumb.tsx";

export default function TermsOfService() {
  // Define breadcrumb items for this page
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Terms of Service", active: true },
  ];

  return (
    <>
      <Head>
        <title>Terms of Service - STANDARD</title>
        <meta
          name="description"
          content="Terms of Service for STANDARD - Nano Network Intelligence"
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
            Terms of Service
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
              Welcome to{" "}
              <span className="font-high-tide">STANDARD</span>. By accessing our
              website and using our services, you agree to comply with and be
              bound by the following terms and conditions. Please read these
              terms carefully before using our website.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Services</h2>
            <p>
              <span className="font-high-tide">STANDARD</span>{" "}
              provides open data and analytics related to the Nano
              cryptocurrency network. Our services are provided "as is" and may
              be subject to change without notice.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Disclaimer</h2>
            <p>
              All data, information, and services provided by{" "}
              <span className="font-high-tide">STANDARD</span>{" "}
              are for informational purposes only. We make no representations or
              warranties of any kind, express or implied, about the
              completeness, accuracy, reliability, suitability, or availability
              of the information, products, services, or related graphics
              contained on the website.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Limitation of Liability
            </h2>
            <p>
              In no event shall{" "}
              <span className="font-high-tide">STANDARD</span>, its operators,
              employees, agents, or affiliates be liable for any indirect,
              consequential, exemplary, incidental, special, or punitive
              damages, including lost profit, lost revenue, or lost data,
              whether in an action in contract, tort, or otherwise, even if we
              have been advised of the possibility of such damages.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              User Responsibility
            </h2>
            <p>
              By using our services, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                You are solely responsible for any decisions you make based on
                the information provided on our platform
              </li>
              <li>
                You will conduct your own research and due diligence before
                making any financial or other decisions
              </li>
              <li>You will use our services at your own risk</li>
              <li>
                You will not hold{" "}
                <span className="font-high-tide">STANDARD</span>{" "}
                responsible for any losses or damages that may result from your
                use of our services
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              No Investment Advice
            </h2>
            <p>
              The information provided on this website is not investment advice,
              trading advice, or any other sort of advice.{" "}
              <span className="font-high-tide">STANDARD</span>{" "}
              does not recommend that any cryptocurrency should be bought, sold,
              or held by you. Conduct your own due diligence and consult your
              financial advisor before making any investment decisions.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless{" "}
              <span className="font-high-tide">STANDARD</span>, its operators,
              employees, agents, and affiliates from and against any and all
              claims, damages, obligations, losses, liabilities, costs or debt,
              and expenses arising from your use of the website or your
              violation of these Terms of Service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time.
              We will notify you of any changes by posting the new Terms of
              Service on this page and updating the "Last Updated" date. Your
              continued use of our services after any such changes constitutes
              your acceptance of the new Terms of Service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at:
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
