import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSessionClient() {
  const cookieStore = await cookies();

  let supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  // Jika URL tidak sengaja mengandung path REST API /rest/v1, bersihkan ke base URL
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari context di mana cookie tidak dapat dimodifikasi langsung
        }
      },
    },
  });
}

