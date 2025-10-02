import { Handlers, PageProps } from "$fresh/server.ts";
import { Header } from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";
import CommunitySignup from "../../islands/CommunitySignup.tsx";
import Accounts from "../../islands/dashboards/accounts/Accounts.tsx";
import Breadcrumb from "../../components/Breadcrumb.tsx";

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

export default function AccountsPage({ data }: PageProps<PageData>) {
  // Define breadcrumb items for this page
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboards", href: "/#dashboards" },
    { label: "Accounts", active: true },
  ];

  return (
    <div>
      <Header />

      <div className="container mx-auto max-w-[2000px] flex flex-col items-start justify-center py-6 px-4 w-full mx-auto mt-10">
        <Breadcrumb items={breadcrumbItems} className="self-start" />
        <h1 className="text-5xl font-bold mb-6 text-left w-full">
          Accounts Dashboard
        </h1>

        {
          /* <p className="mb-6 text-left max-w-2xl self-start">
          This dashboards tracks key metrics related to transactions on the Nano
          network over time. The focus is on understanding the growth and usage
          of Nano as a practical medium of exchange and store of value.
        </p> */
        }
      </div>

      <Accounts wsProtocol={data.wsProtocol} />
      <div className="mt-12"></div>
      <CommunitySignup
        gradientFrom="from-green-400"
        gradientVia="via-green-500"
        gradientTo="to-green-600"
      />
      <Footer />
    </div>
  );
}
