import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Content = Database["public"]["Tables"]["contents"]["Row"];
export type Version = Database["public"]["Tables"]["versions"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Category = Database["public"]["Enums"]["content_category"];

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "jogo", label: "Jogos", icon: "🎮" },
  { value: "skin", label: "Skins", icon: "🎨" },
  { value: "xite", label: "Xite", icon: "🔥" },
];
export const categoryLabel = (c: Category) =>
  ({ jogo: "Jogo", skin: "Skin", xite: "Xite" })[c];

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Sessão + perfil + se é ADM (o banco reforça todas as permissões). */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const userId = session?.user.id;
  const profile = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: p }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);
      return { profile: p, isAdmin: !!roles?.some((r) => r.role === "admin") };
    },
  });
  return {
    ready: ready && (!userId || !profile.isLoading),
    session,
    user: session?.user ?? null,
    profile: profile.data?.profile ?? null,
    isAdmin: profile.data?.isAdmin ?? false,
  };
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      return data as SiteSettings;
    },
  });
}

export const COLOR_PRESETS: Record<string, { primary: string; secondary: string; label: string }> = {
  roxo: { primary: "oklch(0.62 0.25 300)", secondary: "oklch(0.65 0.18 245)", label: "Roxo" },
  azul: { primary: "oklch(0.62 0.2 255)", secondary: "oklch(0.75 0.15 210)", label: "Azul" },
  verde: { primary: "oklch(0.7 0.2 150)", secondary: "oklch(0.72 0.15 190)", label: "Verde" },
  vermelho: { primary: "oklch(0.6 0.24 25)", secondary: "oklch(0.7 0.18 50)", label: "Vermelho" },
  rosa: { primary: "oklch(0.65 0.25 350)", secondary: "oklch(0.62 0.25 300)", label: "Rosa" },
};

export function applySettings(s: SiteSettings | undefined) {
  if (!s || typeof document === "undefined") return;
  const root = document.documentElement;
  const c = COLOR_PRESETS[s.primary_color] ?? COLOR_PRESETS["roxo"]!;
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty("--ring", c.primary);
  root.style.setProperty("--secondary", c.secondary);
  root.style.setProperty("--radius", s.button_style === "reto" ? "0.15rem" : "0.875rem");
  root.classList.toggle("light", s.theme === "claro");
  document.body.style.backgroundImage = s.background_url
    ? `linear-gradient(color-mix(in oklab, var(--background) 85%, transparent), var(--background)), url(${s.background_url})`
    : "";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundAttachment = "fixed";
}

/** Envia a foto escolhida da galeria e devolve um endereço permanente. */
export async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 20);
  if (e2 || !data) throw e2 ?? new Error("Falha ao gerar endereço");
  return data.signedUrl;
}

export function compareVersions(a: string, b: string) {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}
