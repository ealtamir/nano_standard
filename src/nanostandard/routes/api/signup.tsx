/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import {
  getCookies,
  setCookie,
} from "https://deno.land/std@0.216.0/http/cookie.ts";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10; // Maximum 3 signups per hour per IP

// Interface for the subscription data
interface SubscriptionData {
  email: string;
  timestamp: number;
  acceptedPolicy: boolean;
  ipAddress: string;
}

// Interface for rate limiting data
interface RateLimitData {
  count: number;
  resetAt: number;
}

export const handler: Handlers = {
  async POST(req, ctx) {
    try {
      // Open Deno KV database
      const kv = await Deno.openKv(
        Deno.env.get("ENV")?.startsWith("prod") ? "./kv.db" : undefined,
      );

      // Get client IP address
      const ipAddress = req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";

      // Check rate limit
      const rateLimitKey = ["rate_limit", ipAddress];
      const rateLimitData = await kv.get<RateLimitData>(rateLimitKey);

      const now = Date.now();
      let currentCount = 0;
      let resetAt = now + RATE_LIMIT_WINDOW_MS;

      if (rateLimitData.value) {
        // If the rate limit window has expired, reset the counter
        if (now > rateLimitData.value.resetAt) {
          currentCount = 1;
        } else {
          currentCount = rateLimitData.value.count + 1;
          resetAt = rateLimitData.value.resetAt;

          // Check if rate limit exceeded
          if (currentCount > MAX_REQUESTS_PER_WINDOW) {
            return new Response(
              JSON.stringify({
                success: false,
                message: "Rate limit exceeded. Please try again later.",
              }),
              {
                status: 429,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
        }
      } else {
        currentCount = 1;
      }

      // Update rate limit in KV store
      await kv.set(rateLimitKey, {
        count: currentCount,
        resetAt: resetAt,
      });

      // Parse request body
      const data = await req.json();
      const { email, acceptedPolicy } = data;

      // Validate input
      if (!email || !email.includes("@")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid email address",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (!acceptedPolicy) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "You must accept the privacy policy",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Create subscription data
      const subscriptionData: SubscriptionData = {
        email,
        timestamp: now,
        acceptedPolicy,
        ipAddress,
      };

      // Store in KV database
      // Use email as unique key to prevent duplicates
      const emailKey = ["subscription_emails", email];
      await kv.set(emailKey, subscriptionData);

      // Also add to the list of all subscriptions
      const listKey = ["subscription_emails_list"];
      await kv.set([...listKey, now], subscriptionData);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Subscription successful",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Error in signup handler:", error);

      return new Response(
        JSON.stringify({
          success: false,
          message: "An error occurred while processing your request",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
