import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Modo = "entrar" | "cadastro" | "recuperar";
export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { modo?: Modo } => ({
    modo: (["entrar", "cadastro", "recuperar"] as const).includes(s["modo"] as Modo) ? (s["modo"] as Modo) : "entrar",
  }),
  head: () => ({
    meta: [
      { title: "Entrar ou cadastrar — MV MODS" },
      { name: "description", content: "Acesse sua conta MV MODS para liberar os downloads." },
      { property: "og:title", content: "Entrar — MV MODS" },
      { property: "og:description", content: "Acesse sua conta MV MODS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo = "entrar" } = Route.useSearch();
  const nav = useNavigate();
  const [f, setF] = useState({ username: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const go = (m: Modo) => nav({ to: "/auth", search: { modo: m } });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
        if (error) throw new Error("E-mail ou senha incorretos, ou e-mail ainda não confirmado.");
        toast.success("Bem-vindo!");
        nav({ to: "/" });
      } else if (modo === "cadastro") {
        if (f.username.trim().length < 3) throw new Error("Nome de usuário muito curto.");
        if (f.password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
        if (f.password !== f.confirm) throw new Error("As senhas não coincidem.");
        const { data: exists } = await supabase.rpc("email_exists", { _email: f.email });
        if (exists) throw new Error("Este e-mail já está cadastrado.");
        const { error } = await supabase.auth.signUp({
          email: f.email, password: f.password,
          options: { emailRedirectTo: window.location.origin, data: { username: f.username.trim() } },
        });
        if (error) throw error;
        setSent("Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("Enviamos um link de recuperação para o seu e-mail.");
      }
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 shadow-neon backdrop-blur">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-4 text-center text-xl font-black">
          {modo === "entrar" ? "ENTRAR" : modo === "cadastro" ? "CRIAR CONTA" : "RECUPERAR SENHA"}
        </h1>
        {sent ? <p className="mt-6 text-center text-success">{sent}</p> : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {modo === "cadastro" && <div><Label>Nome de usuário</Label><Input required value={f.username} onChange={set("username")} /></div>}
            <div><Label>E-mail</Label><Input required type="email" value={f.email} onChange={set("email")} placeholder="Digite seu e-mail" /></div>
            {modo !== "recuperar" && <div><Label>Senha</Label><Input required type="password" value={f.password} onChange={set("password")} placeholder="Digite sua senha" /></div>}
            {modo === "cadastro" && <div><Label>Confirmar senha</Label><Input required type="password" value={f.confirm} onChange={set("confirm")} /></div>}
            <Button variant="neon" className="w-full" size="lg" disabled={busy}>
              {busy ? "Aguarde..." : modo === "entrar" ? "Entrar" : modo === "cadastro" ? "Cadastrar" : "Enviar link"}
            </Button>
          </form>
        )}
        <div className="mt-5 space-y-1 text-center text-sm text-muted-foreground">
          {modo !== "entrar" && <button className="block w-full hover:text-primary" onClick={() => { setSent(null); go("entrar"); }}>Já tem conta? Entrar</button>}
          {modo !== "cadastro" && <button className="block w-full hover:text-primary" onClick={() => { setSent(null); go("cadastro"); }}>Não tem conta? Cadastre-se</button>}
          {modo === "entrar" && <button className="block w-full hover:text-primary" onClick={() => go("recuperar")}>Esqueci minha senha</button>}
        </div>
      </div>
    </div>
  );
}
