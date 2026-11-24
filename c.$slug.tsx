import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Heart, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabel, compareVersions, useAuth, type Content, type Version } from "@/lib/mv";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/c/$slug")({
  head: () => ({
    meta: [
      { title: "Conteúdo — MV MODS" },
      { name: "description", content: "Detalhes, versões e novidades no MV MODS." },
      { property: "og:title", content: "Conteúdo — MV MODS" },
      { property: "og:description", content: "Detalhes, versões e novidades no MV MODS." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { slug } = Route.useParams();
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [sel, setSel] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["content", slug],
    queryFn: async () => {
      const { data: c } = await supabase.from("contents").select("*").eq("slug", slug).maybeSingle();
      if (!c) return null;
      const { data: v } = await supabase.from("versions").select("*").eq("content_id", c.id).eq("archived", false);
      return { c: c as Content, versions: ((v ?? []) as Version[]).sort((a, b) => compareVersions(a.version, b.version)) };
    },
  });
  const fav = useQuery({
    queryKey: ["fav", data?.c.id, user?.id],
    enabled: !!user && !!data,
    queryFn: async () => !!(await supabase.from("favorites").select("content_id").eq("content_id", data!.c.id).maybeSingle()).data,
  });

  if (isLoading) return <div className="min-h-screen"><Header /><p className="p-8 text-center text-muted-foreground">Carregando...</p></div>;
  if (!data) return <div className="min-h-screen"><Header /><p className="p-8 text-center">Conteúdo não encontrado. <Link to="/" className="text-primary">Voltar</Link></p></div>;
  const { c, versions } = data;
  const current = versions.find((v) => v.version === sel) ?? versions.find((v) => v.is_current) ?? versions.at(-1);

  async function download() {
    if (!current || !user) return;
    if (profile?.blocked) return toast.error("Sua conta está bloqueada.");
    const { data: d } = await supabase.from("downloads").select("url").eq("version_id", current.id).maybeSingle();
    if (!d?.url) return toast.error("Download indisponível para esta versão.");
    await supabase.from("download_history").insert({ user_id: user.id, content_id: c.id, version: current.version });
    window.open(d.url, "_blank", "noopener");
    return undefined;
  }
  async function toggleFav() {
    if (!user) return;
    if (fav.data) await supabase.from("favorites").delete().eq("content_id", c.id).eq("user_id", user.id);
    else await supabase.from("favorites").insert({ user_id: user.id, content_id: c.id });
    qc.invalidateQueries({ queryKey: ["fav"] });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="relative">
        <div className="aspect-[16/8] max-h-[420px] w-full overflow-hidden bg-hero sm:aspect-[21/7]">
          {(c.banner_url || c.cover_url) && <img src={c.banner_url || c.cover_url!} alt={c.name} className="h-full w-full object-cover" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      <main className="relative mx-auto -mt-20 max-w-4xl px-4">
        <div className="flex items-end gap-4">
          {c.cover_url && <img src={c.cover_url} alt="" className="h-28 w-24 rounded-xl border-2 border-primary object-cover shadow-neon" />}
          <div>
            <h1 className="text-2xl font-black sm:text-4xl">{c.name}</h1>
            <div className="mt-2 flex gap-2">
              <Badge className="bg-neon text-primary-foreground">{categoryLabel(c.category)}</Badge>
              <Badge variant="outline" className={c.status === "atualizado" ? "border-success text-success" : ""}>{c.status === "atualizado" ? "Atualizado" : "Antigo"}</Badge>
            </div>
          </div>
        </div>
        <p className="mt-6 whitespace-pre-line text-lg text-muted-foreground">{c.description}</p>

        {c.gallery.length > 0 && (
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {c.gallery.map((g) => <img key={g} src={g} alt="" className="h-40 rounded-lg border border-border object-cover" />)}
          </div>
        )}

        {versions.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-bold tracking-widest text-muted-foreground">VERSÕES DISPONÍVEIS</h2>
            <div className="flex flex-wrap gap-2">
              {versions.map((v) => (
                <button key={v.id} onClick={() => setSel(v.version)}
                  className={cn("rounded-lg border px-4 py-2 font-display text-sm font-bold", current?.id === v.id ? "border-primary bg-primary text-primary-foreground shadow-neon" : "border-border bg-card")}>
                  v{v.version}{v.is_current && " ★"}
                </button>
              ))}
            </div>
            {current && (
              <div className="mt-4 rounded-xl border border-border bg-card p-5">
                <h3 className="font-bold">O QUE TEM NA VERSÃO {current.version}</h3>
                {current.description && <p className="mt-2 text-muted-foreground">{current.description}</p>}
                <ul className="mt-3 list-inside list-disc space-y-1">{current.features.map((f) => <li key={f}>{f}</li>)}</ul>
                {current.images.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto">{current.images.map((i) => <img key={i} src={i} alt="" className="h-28 rounded-lg object-cover" />)}</div>
                )}
              </div>
            )}
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <>
              <Button variant="neon" size="lg" onClick={download}><Download /> Baixar v{current?.version}</Button>
              <Button variant="outline" size="lg" onClick={toggleFav}><Heart className={fav.data ? "fill-primary text-primary" : ""} /> {fav.data ? "Favoritado" : "Favoritar"}</Button>
            </>
          ) : (
            <Button asChild variant="neon" size="lg"><Link to="/auth" search={{ modo: "entrar" }}><Lock /> Entrar para acessar</Link></Button>
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Publicado em {new Date(c.created_at).toLocaleDateString("pt-BR")}. Apenas conteúdos próprios, autorizados e seguros.</p>
      </main>
      <Footer />
    </div>
  );
}
