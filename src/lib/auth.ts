"use client";

// Sesión del terapeuta (Supabase Auth). Las páginas del terapeuta usan useRequireUser(): sin sesión → /login.
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function displayName(u: User | null | undefined): string {
  const n = (u?.user_metadata?.full_name as string | undefined)?.trim();
  return n || u?.email?.split("@")[0] || "";
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter((w) => w && !/^(dr|dra|lic|ft)\.?$/i.test(w))
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "·"
  );
}

/** Usuario actual (undefined = cargando, null = sin sesión). */
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => alive && setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return user;
}

/** Igual que useUser pero manda a /login si no hay sesión (páginas del terapeuta). */
export function useRequireUser(): User | null | undefined {
  const user = useUser();
  useEffect(() => {
    if (user === null) {
      const locale = window.location.pathname.split("/")[1] || "es";
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace(`/${locale}/login?next=${next}`);
    }
  }, [user]);
  return user;
}

export async function signOut(locale: string) {
  await supabase.auth.signOut();
  window.location.href = `/${locale}/login`;
}
