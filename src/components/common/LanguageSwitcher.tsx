"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing, localeNames, localeFlags, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: Locale) {
    // Replace current locale prefix with new one
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
            "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
            "transition-colors duration-150 focus:outline-none",
            className
          )}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4 shrink-0" />
          {!compact && (
            <span className="flex items-center gap-1.5">
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </span>
          )}
          {compact && <span>{localeFlags[locale]}</span>}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "z-50 min-w-[180px] overflow-hidden rounded-2xl border border-surface-200",
            "bg-white shadow-card-lg p-1",
            "data-[state=open]:animate-fade-in"
          )}
          sideOffset={8}
          align="end"
        >
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">
              Language
            </p>
          </div>
          {routing.locales.map((loc) => (
            <DropdownMenu.Item
              key={loc}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2",
                "text-sm text-surface-700 hover:bg-surface-50 hover:text-surface-900",
                "focus:outline-none transition-colors duration-100",
                locale === loc && "bg-brand-50 text-brand-700 font-medium"
              )}
              onClick={() => switchLocale(loc as Locale)}
            >
              <span className="text-base">{localeFlags[loc as Locale]}</span>
              <span>{localeNames[loc as Locale]}</span>
              {locale === loc && (
                <span className="ms-auto h-1.5 w-1.5 rounded-full bg-brand-600" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
