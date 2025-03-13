import { Head } from "$fresh/runtime.ts";
import { Header } from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Breadcrumb from "../components/Breadcrumb.tsx";

export default function PrivacyPolicy() {
  // Define breadcrumb items for this page
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Privacy Policy", active: true },
  ];

  return (
    <>
      <Head>
        <title>Privacy Policy - STANDARD</title>
        <meta
          name="description"
          content="Privacy Policy for STANDARD - Nano Network Intelligence"
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
            Privacy Policy
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
              At{" "}
              <span className="font-high-tide">STANDARD</span>, we respect your
              privacy and are committed to protecting your personal data. This
              privacy policy explains how we collect, use, and safeguard your
              information when you visit our website.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Information We Collect
            </h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">Email Addresses</h3>
            <p>
              We collect email addresses only when you voluntarily provide them
              to us, such as when you sign up for our newsletter or updates
              about our services. Your email address is used solely for the
              purpose of sending you the information you requested. If you wish
              to delete your email address, please contact us at the address
              below.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">IP Addresses</h3>
            <p>
              We temporarily collect IP addresses to prevent abuse of our
              services. This information is automatically deleted after 1 hour
              and is not used for any other purpose. We do not use this
              information to identify individual users or to track your
              activities outside of our website.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              How We Use Your Information
            </h2>
            <p>
              We use the information we collect in the following ways:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                To send newsletters and updates about our services (if you've
                subscribed)
              </li>
              <li>To prevent abuse of our services</li>
              <li>To improve our website and user experience</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Data Retention</h2>
            <p>
              We retain your email address for as long as you wish to receive
              communications from us. You can unsubscribe at any time by
              clicking the unsubscribe link in our emails or by contacting us
              directly.
            </p>
            <p>
              IP addresses are automatically deleted after 1 hour.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Request access to your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update our privacy policy from time to time. We will notify
              you of any changes by posting the new privacy policy on this page
              and updating the "Last Updated" date.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please
              contact us at:
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
