import "dotenv/config";
import { getPaystack } from "./src/config/paystack";

async function run() {
  const reference = "BCC-F1FF7F25-1771970254223";
  try {
    const txRes = await getPaystack().get(`/transaction/verify/${reference}`);
    const tx = txRes.data?.data;
    const customerCode = tx?.customer?.customer_code;
    const customerId = tx?.customer?.id;

    console.log("Customer Code:", customerCode);
    console.log("Customer ID:", customerId);

    const subResCode = await getPaystack().get(`/subscription`, {
      params: { customer: customerCode },
    });
    console.log(
      "Subscriptions using customer_code length:",
      subResCode.data?.data?.length,
    );

    const subResId = await getPaystack().get(`/subscription`, {
      params: { customer: customerId },
    });
    console.log(
      "Subscriptions using customer_id length:",
      subResId.data?.data?.length,
    );
  } catch (error: any) {
    console.error("Error:", error.response?.data || error);
  }
}
run();
