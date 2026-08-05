import { createClient } from "@supabase/supabase-js";
import { processCustomerEnquiryDelivery } from "@/lib/enquiries/customer-delivery";
import type { Database } from "@/types/database";

export const runtime = "nodejs";

async function retryDelivery(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return Response.json({ error: "Delivery recovery is not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const pending = await supabase.from("customer_enquiries")
    .select("id")
    .or("customer_confirmation_status.neq.sent,internal_notification_status.neq.sent")
    .order("updated_at", { ascending: true })
    .limit(25);
  if (pending.error) return Response.json({ error: "Delivery recovery could not be prepared." }, { status: 500 });

  const results = await Promise.all(pending.data.map(async ({ id }) => ({ id, ...(await processCustomerEnquiryDelivery(supabase, id)) })));
  return Response.json({ processed: results.length, pending: results.filter((result) => result.deliveryPending).length });
}

export const GET = retryDelivery;
export const POST = retryDelivery;
