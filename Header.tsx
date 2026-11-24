import { Link } from "@tanstack/react-router";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/mv";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-neon font-display text-sm font-black text-primary-foreground shadow-neon">MV</span>
      <span className="font-display text-lg font-black tracking-widest text-neon">MV MODS</span>
    </Link>
  );
}

export function Header() {
  const { user, profile, isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Logo />
        <nav className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild size="sm" variant="outline"><Link to="/admin"><Settings /> ADM</Link></Button>
          )}
          {user ? (
            <Button asChild size="sm" variant="neon">
              <Link to="/conta"><User /> {profile?.username ?? "Conta"}</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost"><Link to="/auth" search={{ modo: "entrar" }}>Entrar</Link></Button>
              <Button asChild size="sm" variant="neon"><Link to="/auth" search={{ modo: "cadastro" }}>Cadastrar</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
      <Logo />
      <p className="mt-3">Catálogo de jogos, skins e conteúdos autorizados.</p>
      <p className="mt-1">© {new Date().getFullYear()} MV MODS</p>
    </footer>
  );
}
