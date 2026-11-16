"use client";

import { Tag } from "lucide-react";
import { useCategoriaIconeStore } from "@/app/store/categoriaIcone.store";
import { iconesCategoria } from "./iconesCategoria";

interface IconeCategoriaProps {
  categoriaId: number | null | undefined;
  size?: number;
  className?: string;
}

/** Ícone escolhido pelo usuário para a categoria (ou uma etiqueta). */
export default function IconeCategoria({ categoriaId, size = 18, className }: IconeCategoriaProps) {
  const nome = useCategoriaIconeStore((s) =>
    categoriaId != null ? s.icones[categoriaId] : undefined,
  );
  const Icone = iconesCategoria.find((i) => i.nome === nome)?.componente ?? Tag;
  return <Icone size={size} className={className} aria-hidden="true" />;
}
