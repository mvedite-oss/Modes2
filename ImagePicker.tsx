import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/mv";

/** Abre a galeria do celular/computador, mostra prévia e envia a foto. */
export function ImagePicker({ value, onChange, folder, label = "Selecionar da galeria", wide }: {
  value: string | null | undefined; onChange: (url: string) => void; folder: string; label?: string; wide?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  async function pick(f: File | undefined) {
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setBusy(true);
    try { onChange(await uploadImage(f, folder)); toast.success("Foto enviada"); }
    catch (e) { toast.error("Falha no envio: " + (e as Error).message); setPreview(null); }
    finally { setBusy(false); }
  }
  const src = preview ?? value;
  return (
    <button type="button" onClick={() => ref.current?.click()}
      className={`relative grid w-full place-items-center overflow-hidden rounded-xl border-2 border-dashed border-primary/50 bg-muted/50 text-muted-foreground hover:border-primary ${wide ? "aspect-[16/7]" : "aspect-[4/3]"}`}>
      {src ? <img src={src} alt="Prévia" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <div className={`relative z-10 flex flex-col items-center gap-1 rounded-lg p-3 text-sm ${src ? "bg-background/80" : ""}`}>
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6 text-primary" />}
        <span className="font-semibold text-foreground">{src ? "Trocar foto" : label}</span>
        {!src && <span className="text-xs">Escolha uma foto do celular ou computador</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
    </button>
  );
}
