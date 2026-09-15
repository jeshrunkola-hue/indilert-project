"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, AlertTriangle, Map, Edit3, PhoneCall } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/map", label: "MAP", icon: Map },
    { href: "/report", label: "REPORT", icon: Edit3 },
    { href: "/help", label: "HELP", icon: PhoneCall },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-red-600" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-red-100" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wider">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
