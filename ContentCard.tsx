import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, type Content } from "@/lib/mv";
import { cn } from "@/lib/utils";

export function ContentCard({ c, compact }: { c: Content; compact?: boolean }) {
  return (
    <Link to="/c/$slug" params={{ slug: c.slug }} className="card-glow group block overflow-hidden rounded-xl border border-border bg-card">
      <div className={cn("relative overflow-hidden bg-muted", compact ? "aspect-[4/3]" : "aspect-[3/4]")}>
        {c.cover_url ? (
          <img src={c.cover_url} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-hero font-display text-2xl text-muted-foreground">MV</div>
        )}
        <Badge className="absolute left-2 top-2 bg-background/80 text-foreground">{categoryLabel(c.category)}</Badge>
        {c.status === "atualizado" && <Badge className="absolute right-2 top-2 bg-success text-background">Atualizado</Badge>}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-bold">{c.name}</h3>
        <p className="text-sm text-muted-foreground">{categoryLabel(c.category)} · v{c.current_version}</p>
      </div>
    </Link>
  );
}
