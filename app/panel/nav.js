"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const ITEMS = [
  { href: "/panel", label: "Resumen" },
  { href: "/panel/catalogo", label: "Catálogo" },
  { href: "/panel/compradores", label: "Mis compradores" },
  { sep: true },
  { href: "/panel/comisiones", label: "Comisiones" },
  { href: "/panel/materiales", label: "Materiales" },
  { href: "/panel/agencia", label: "Mi agencia" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      {ITEMS.map((it, i) =>
        it.sep ? (
          <div className="sep" key={i} />
        ) : (
          <Link
            key={it.href}
            href={it.href}
            className={path === it.href ? "active" : ""}
          >
            {it.label}
          </Link>
        )
      )}
    </nav>
  );
}
