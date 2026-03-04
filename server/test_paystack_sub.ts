import "dotenv/config";
import { paystack } from "./src/config/paystack";

async function run() {
  try {
    const subRes = await paystack.get(`/subscription`);
    const s = subRes.data?.data?.[0];
    console.log(
      "A typical subscription payload from Paystack:\n",
      JSON.stringify(s, null, 2),
    );
  } catch (error: any) {
    console.error("Error:", error.response?.data || error);
  }
}
run();
