import { useSignal } from "@preact/signals";
import { ComponentChildren } from "preact";

interface CommunitySignupProps {
  title?: string;
  description?: string;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientVia?: string;
}

export default function CommunitySignup({
  title = "Get Updates on Standard Analytics",
  description =
    "Stay informed about our upcoming crypto analytics platform. Get early updates on features, dashboards, and insights - plus priority access when we launch.",
  className = "",
  gradientFrom = "from-blue-600",
  gradientTo = "to-blue-800",
  gradientVia = "via-blue-700",
}: CommunitySignupProps) {
  const email = useSignal("");
  const isSubmitting = useSignal(false);
  const submitted = useSignal(false);
  const error = useSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!email.value || !email.value.includes("@")) {
      error.value = "Please enter a valid email address";
      return;
    }

    isSubmitting.value = true;

    // Simulate submission - replace with actual API call
    setTimeout(() => {
      isSubmitting.value = false;
      submitted.value = true;
      email.value = "";
    }, 1000);
  };

  return (
    <section
      id="community"
      className={`py-24 md:py-36 bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo} text-white relative overflow-hidden ${className}`}
    >
      {/* Add subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 10 L 40 10 M 10 0 L 10 40"
                stroke="white"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Add subtle radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-white/10 to-transparent opacity-70">
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="text-center mb-20 max-w-3xl mx-auto"
          style={{
            opacity: 1,
            transform: "translateY(0px)",
            transition: "opacity 0.5s, transform 0.5s",
          }}
        >
          <h2 className="text-3xl md:text-5xl font-bold font-montserrat mb-6">
            {title}
          </h2>
          <p className="text-xl leading-relaxed">
            {description}
          </p>
        </div>

        <div
          id="signup"
          className="max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-xl p-10 shadow-xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-montserrat">
            Get Early Access
          </h3>

          {!submitted.value
            ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 text-md font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email.value}
                    onInput={(e) => {
                      email.value = (e.target as HTMLInputElement).value;
                      error.value = "";
                    }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                  {error.value && (
                    <p className="mt-2 text-sm text-red-600">{error.value}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting.value}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex justify-center items-center text-lg shadow-md hover:shadow-lg"
                >
                  {isSubmitting.value ? "Submitting..." : "Join Now"}
                </button>
              </form>
            )
            : (
              <div className="text-center py-8">
                <div className="mb-6 text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">
                  Thanks for joining!
                </h4>
                <p className="text-gray-700 text-lg">
                  We'll send you updates on Standard soon.
                </p>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
