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
              does not use cookies or any similar tracking technologies on our
              website. This policy explains our approach to cookies and similar
              technologies.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Cookie Policy</h2>
            <p>
              Standard does not use cookies or any similar tracking technologies
              on our website. We do not collect any cookie data whatsoever from
              our visitors.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Third-Party Services
            </h2>
            <p>
              While our website does not use cookies, please be aware that
              external websites or services linked from our site may have their
              own cookie policies.
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
              If you have any questions about this policy, please contact us at:
            </p>
            <p className="mt-2">
              <a
                href="mailto:nanostandard@protonmail.com"
                className="text-accent hover:underline"
              >
                nanostandard@protonmail.com
              </a>
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
