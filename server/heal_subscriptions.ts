import "dotenv/config";
import { paystack } from "./src/config/paystack";

async function run() {
  const customerId = 276662214;
  try {
    const subRes = await paystack.get(`/subscription`, {
      params: { customer: customerId },
    });

    const subs = subRes.data?.data;
    console.log(
      `Found ${subs?.length} total recent subscriptions for customer ID ${customerId}`,
    );

    const activeSubs = subs.filter((s: any) => s.status === "active");
    console.log(`There are ${activeSubs.length} active subscriptions.`);

    for (const sub of activeSubs) {
      console.log(
        `Cancelling active subscription: ${sub.subscription_code} (Token: ${sub.email_token})`,
      );
      const response = await paystack.post("/subscription/disable", {
        code: sub.subscription_code,
        token: sub.email_token,
      });
      console.log(`Cancelled: ${response.data.message}`);
    }
  } catch (error: any) {
    console.error("Error:", error.response?.data || error);
  }
}
run();
