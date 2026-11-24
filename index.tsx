import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/Header";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, type Category, type Content, useSettings } from "@/lib/mv";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MV MODS — Seu catálogo gamer" },
      { name: "description", content: "Encontre jogos, skins e conteúdos no catálogo MV MODS." },
      { property: "og:title", content: "MV MODS — Seu catálogo gamer" },
      { property: "og:description", content: "Encontre jogos, skins e conteúdos no catálogo MV MODS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: settings } = useSettings();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | null>(null);
  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["contents", "public"],
    queryFn: async () => {
      const { data } = await supabase.from("contents").select("*").eq("published", true).order("created_at", { ascending: false });
      return (data ?? []) as Content[];
    },
  });
  const featured = contents.find((c) => c.featured);
  const filtered = useMemo(() => contents.filter((c) =>
    (!cat || c.category === cat) && c.name.toLowerCase().includes(q.toLowerCase())), [contents, q, cat]);
  const sorted = settings?.sort_order === "destaques" ? [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured)) : filtered;
  const updates = [...contents].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 4);
  const compact = settings?.card_size === "compacto";

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative overflow-hidden bg-hero">
        {settings?.hero_banner_url && <img src={settings.hero_banner_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center">
          <h1 className="text-3xl font-black sm:text-5xl"><span className="text-neon">{settings?.hero_title ?? "SEU CATÁLOGO GAMER"}</span></h1>
          <p className="mt-3 text-lg text-muted-foreground">{settings?.hero_subtitle ?? "Encontre jogos, skins e conteúdos."}</p>
          <div className="relative mx-auto mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar..." className="h-12 rounded-full bg-card/80 pl-10 text-base" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-12 px-4 pt-8">
        <section>
          <h2 className="mb-4 text-sm font-bold tracking-widest text-muted-foreground">CATEGORIAS</h2>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCat(cat === c.value ? null : c.value)}
                className={cn("card-glow rounded-xl border bg-card p-4 text-center", cat === c.value ? "border-primary shadow-neon" : "border-border")}>
                <div className="text-3xl">{c.icon}</div>
                <div className="mt-1 font-display text-sm font-bold">{c.label}</div>
              </button>
            ))}
          </div>
        </section>

        {featured && !q && !cat && (
          <section>
            <h2 className="mb-4 text-sm font-bold tracking-widest text-muted-foreground">EM DESTAQUE</h2>
            <div className="relative overflow-hidden rounded-2xl border border-primary/50 shadow-neon">
              <div className="aspect-[16/9] sm:aspect-[21/8]">
                {(featured.banner_url || featured.cover_url) ? (
                  <img src={featured.banner_url || featured.cover_url!} alt={featured.name} className="h-full w-full object-cover" />
                ) : <div className="h-full w-full bg-hero" />}
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/40 to-transparent p-5 sm:p-8">
                <span className="w-fit rounded bg-neon px-2 py-0.5 font-display text-xs font-bold text-primary-foreground">DESTAQUE</span>
                <h3 className="mt-2 text-2xl font-black sm:text-4xl">{featured.featured_title || featured.name}</h3>
                <p className="text-muted-foreground">{featured.featured_description || `Versão ${featured.current_version} · ${featured.status === "atualizado" ? "Atualizado" : "Antigo"}`}</p>
                <Button asChild variant="neon" className="mt-3 w-fit"><Link to="/c/$slug" params={{ slug: featured.slug }}>Ver conteúdo</Link></Button>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-sm font-bold tracking-widest text-muted-foreground">ÚLTIMOS CONTEÚDOS</h2>
          {isLoading ? <p className="text-muted-foreground">Carregando...</p> : sorted.length === 0 ? (
            <p className="text-muted-foreground">Nenhum conteúdo encontrado.</p>
          ) : (
            <div className={cn("grid gap-4", compact ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
              {sorted.map((c) => <ContentCard key={c.id} c={c} compact={compact} />)}
            </div>
          )}
        </section>

        {!q && !cat && updates.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-bold tracking-widest text-muted-foreground">ATUALIZAÇÕES RECENTES</h2>
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {updates.map((c) => (
                <li key={c.id}>
                  <Link to="/c/$slug" params={{ slug: c.slug }} className="flex items-center justify-between p-3 hover:bg-accent">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-sm text-muted-foreground">v{c.current_version} · {new Date(c.updated_at).toLocaleDateString("pt-BR")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
