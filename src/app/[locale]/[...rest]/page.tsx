import { notFound } from "next/navigation";

// Cualquier ruta desconocida dentro de un idioma muestra la página 404 de la marca ([locale]/not-found.tsx).
export default function CatchAll() {
  notFound();
}
