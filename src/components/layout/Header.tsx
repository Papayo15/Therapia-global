"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Bell, Menu, Search } from "lucide-react";
import { MENU_EVENT } from "@/components/layout/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { isRTL, type Locale } from "@/i18n/routing";
import Link from "next/link";
import { displayName, initials, useUser } from "@/lib/auth";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Header({ title, subtitle, className }: HeaderProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const rtl = isRTL(locale);
  const user = useUser();
  const name = displayName(user);
  useEffect(() => {                         // título de la pestaña del navegador según la página
    if (title) document.title = `${title} · Therapia Global`;
  }, [title]);

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between gap-2 border-b border-surface-200 bg-white px-3 sm:px-6",
        className
      )}
      dir={rtl ? "rtl" : "ltr"}
    >
      {/* Left — menú (celular) + título */}
      <button
        onClick={() => window.dispatchEvent(new Event(MENU_EVENT))}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-surface-600 hover:bg-surface-100 md:hidden"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="truncate text-base font-semibold text-surface-900 leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="hidden truncate text-xs text-surface-500 mt-0.5 sm:block">{subtitle}</p>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1">
        {/* Global Search */}
        <button
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors sm:flex"
          aria-label={t("search")}
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative hidden h-9 w-9 sm:flex items-center justify-center rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>

        {/* Language */}
        <LanguageSwitcher compact />

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-surface-200" />

        {/* Usuario: lleva a Configuración */}
        <Link href={`/${locale}/settings`} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-surface-50 transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarImage src="" alt={name} />
            <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="text-start hidden sm:block max-w-[10rem]">
            <p className="truncate text-xs font-semibold text-surface-800 leading-none">{name}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
