import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — MV MODS" },
      { name: "description", content: "Defina uma nova senha para sua conta MV MODS." },
      { property: "og:title", content: "Nova senha — MV MODS" },
      { property: "og:description", content: "Defina uma nova senha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [p, setP] = useState("");
  const nav = useNavigate();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: p });
    if (error) return toast.error(error.message);
    toast.success("Senha alterada!");
    nav({ to: "/" });
    return undefined;
  }
  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4">
      <form onSubmit={save} className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-neon">
        <h1 className="text-xl font-black">NOVA SENHA</h1>
        <Input type="password" required minLength={6} value={p} onChange={(e) => setP(e.target.value)} placeholder="Nova senha" />
        <Button variant="neon" className="w-full">Salvar senha</Button>
      </form>
    </div>
  );
}
