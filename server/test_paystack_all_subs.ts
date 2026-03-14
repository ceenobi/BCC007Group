import "dotenv/config";
import { getPaystack } from "./src/config/paystack";

async function run() {
  try {
    const subRes = await getPaystack().get(`/subscription`);
    const subs = subRes.data?.data;
    console.log(`Found ${subs?.length} total recent subscriptions`);
    subs?.slice(0, 3).forEach((s: any) => {
      console.log(
        `Sub Code: ${s.subscription_code} | Customer: ${s.customer?.customer_code} | Status: ${s.status} | Token: ${s.email_token}`,
      );
    });
  } catch (error: any) {
    console.error("Error:", error.response?.data || error);
  }
}
run();
