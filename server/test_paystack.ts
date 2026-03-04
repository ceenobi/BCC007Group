import "dotenv/config";
import { paystack } from "./src/config/paystack";

async function run() {
  const reference = "BCC-668A4647-1771968326968";
  try {
    const txRes = await paystack.get(`/transaction/verify/${reference}`);
    const tx = txRes.data?.data;
    const customerCode = tx?.customer?.customer_code;
    console.log("Customer Code:", customerCode);

    const subRes = await paystack.get(`/subscription`, {
      params: { customer: customerCode },
    });
    console.log("Subscriptions raw data:", subRes.data?.data);

    const activeSub = (subRes.data?.data as any[])?.find(
      (s: any) => s.status === "active",
    );
    console.log("Active sub:", activeSub);
  } catch (error: any) {
    console.error("Error:", error.response?.data || error);
  }
}
run();
