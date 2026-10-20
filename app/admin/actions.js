"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";

export async function login(prevState, formData) {
  // Dukung useActionState (prevState, formData) dan pemanggilan langsung (formData)
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!data) {
    return { error: "Data formulir tidak valid." };
  }

  const email = data.get("email")?.toString()?.trim() || "";
  const password = data.get("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let signInError = null;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    signInError = error;
  } catch (err) {
    return { error: err.message || "Gagal menghubungi layanan autentikasi." };
  }

  if (signInError) {
    return {
      error:
        signInError.message === "Invalid login credentials"
          ? "Email atau password salah."
          : signInError.message || "Gagal masuk. Silakan periksa kembali akun Anda.",
    };
  }

  redirect("/admin");
}

export async function keluar() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika tidak ada sesi aktif
  }

  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!data) {
    return { error: "Data formulir tidak valid." };
  }

  const passwordBaru = data.get("password_baru")?.toString() || "";
  const konfirmasiPassword = data.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  try {
    const supabase = await createSessionClient();

    // Verifikasi admin sudah login
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (updateError) {
      return {
        error:
          updateError.message || "Gagal mengganti password. Silakan coba lagi.",
      };
    }

    return { sukses: "Password berhasil diganti." };
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat memproses permintaan.",
    };
  }
}
