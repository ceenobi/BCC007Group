import "dotenv/config";
import { paystack } from "./src/config/paystack";

async function run() {
  const reference = "BCC-F1FF7F25-1771970254223"; // Reference from the recent terminal log
  try {
    const txRes = await paystack.get(`/transaction/verify/${reference}`);
    const tx = txRes.data?.data;
    console.log(
      "Tx Subscription data:",
      JSON.stringify(tx?.subscription, null, 2),
    );
    console.log("Tx Customer code:", tx?.customer?.customer_code);
    console.log("Tx plan_object:", JSON.stringify(tx?.plan_object, null, 2));
    console.log("Tx metadata:", JSON.stringify(tx?.metadata, null, 2));

    const subRes = await paystack.get(`/subscription`, {
      params: { customer: tx?.customer?.customer_code },
    });
    console.log("Subscriptions raw data length:", subRes.data?.data?.length);
    console.log(
      "Subscriptions data:",
      JSON.stringify(subRes.data?.data, null, 2),
    );
  } catch (error: any) {
    console.error("Error:", error.response?.data || error);
  }
}
run();
