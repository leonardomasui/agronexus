"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CloudSun, BarChart3, Newspaper, CalendarDays } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { name: "Início", href: "/", icon: Home },
    { name: "Clima", href: "/clima", icon: CloudSun },
    { name: "Impactos", href: "/impactos", icon: BarChart3 },
    { name: "Notícias", href: "/noticias", icon: Newspaper },
    { name: "Agenda", href: "/agenda", icon: CalendarDays },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-agro-gray pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-agro-blue" : "text-gray-400 hover:text-agro-blue/70"
              }`}
            >
              <Icon strokeWidth={isActive ? 2.5 : 2} size={22} className={isActive ? "scale-110 transition-transform" : ""} />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
