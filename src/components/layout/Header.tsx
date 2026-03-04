"use client";

import { useTranslations, useLocale } from "next-intl";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isRTL, type Locale } from "@/i18n/routing";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Header({ title, subtitle, className }: HeaderProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const rtl = isRTL(locale);

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-surface-200 bg-white px-6",
        className
      )}
      dir={rtl ? "rtl" : "ltr"}
    >
      {/* Left — Title */}
      <div>
        {title && (
          <h1 className="text-base font-semibold text-surface-900 leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1">
        {/* Global Search */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          aria-label={t("search")}
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>

        {/* Language */}
        <LanguageSwitcher compact />

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-surface-200" />

        {/* User Avatar */}
        <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-surface-50 transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarImage src="" alt="Dr. García" />
            <AvatarFallback className="text-xs">DG</AvatarFallback>
          </Avatar>
          <div className="text-start hidden sm:block">
            <p className="text-xs font-semibold text-surface-800 leading-none">Dr. García</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="pro" className="text-2xs px-1.5 py-0">Pro</Badge>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
