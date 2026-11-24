import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ImagePicker } from "@/components/ImagePicker";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/mv";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — MV MODS" },
      { name: "description", content: "Seu perfil e histórico de downloads no MV MODS." },
      { property: "og:title", content: "Minha conta — MV MODS" },
      { property: "og:description", content: "Seu perfil no MV MODS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Conta,
});

function Conta() {
  const { ready, user, profile } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const hist = useQuery({
    queryKey: ["history", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("download_history").select("*, contents(name, slug)").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });
  if (!ready) return <div className="min-h-screen"><Header /></div>;
  if (!user) return <div className="min-h-screen"><Header /><p className="p-8 text-center">Você precisa <Link to="/auth" search={{ modo: "entrar" }} className="text-primary">entrar</Link>.</p></div>;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="w-24 shrink-0">
            <ImagePicker folder="avatars" value={profile?.avatar_url} label="Foto" onChange={async (url) => {
              await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
              qc.invalidateQueries({ queryKey: ["profile"] });
            }} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black">{profile?.username}</h1>
            <p className="truncate text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
            {profile?.blocked && <p className="text-sm text-destructive">Conta bloqueada pelo ADM</p>}
          </div>
        </div>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-bold tracking-widest text-muted-foreground">HISTÓRICO DE DOWNLOADS</h2>
          {hist.data?.length ? (
            <ul className="divide-y divide-border">
              {hist.data.map((h) => (
                <li key={h.id} className="flex justify-between py-2">
                  <Link to="/c/$slug" params={{ slug: h.contents?.slug ?? "" }} className="font-semibold hover:text-primary">{h.contents?.name} v{h.version}</Link>
                  <span className="text-sm text-muted-foreground">{new Date(h.created_at).toLocaleDateString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground">Nenhum download ainda.</p>}
        </section>
        <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}><LogOut /> Sair</Button>
      </main>
    </div>
  );
}
