"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard, Dumbbell, ClipboardList, Users,
  Bone, Scan, Globe2, Award, Settings, LogOut,
  ChevronLeft, ChevronRight, Brain, Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, FEATURES } from "@/lib/constants";
import { isRTL, type Locale } from "@/i18n/routing";
import { useState } from "react";

const ICON_MAP = {
  LayoutDashboard, Dumbbell, ClipboardList, Users,
  Bone, Scan, Globe2, Award, Brain, Stethoscope,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const rtl = isRTL(locale);
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.alwaysVisible && item.featureFlag) {
      return FEATURES[item.featureFlag];
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "flex flex-col border-surface-200 bg-white transition-all duration-300",
        "border-e",
        collapsed ? "w-16" : "w-64",
        className
      )}
      dir={rtl ? "rtl" : "ltr"}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-surface-200 px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600">
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900 leading-none">Therapia</p>
              <p className="text-xs text-surface-400 leading-none mt-0.5">Global</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href={`/${locale}/dashboard`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600">
              <span className="text-sm font-bold text-white">T</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-lg text-surface-400",
            "hover:bg-surface-100 hover:text-surface-700 transition-colors",
            collapsed && "mx-auto mt-2"
          )}
        >
          {collapsed
            ? (rtl ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />)
            : (rtl ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />)
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 pt-3">
        {visibleItems.map((item) => {
          const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          const href = `/${locale}${item.href}`;
          const isActive = pathname.includes(item.href);

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-colors duration-150 group",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? t(item.key as Parameters<typeof t>[0]) : undefined}
            >
              {IconComponent && (
                <IconComponent
                  className={cn(
                    "h-4.5 w-4.5 shrink-0",
                    isActive ? "text-brand-600" : "text-surface-400 group-hover:text-surface-600"
                  )}
                  size={18}
                />
              )}
              {!collapsed && (
                <span className="truncate">{t(item.key as Parameters<typeof t>[0])}</span>
              )}
              {!collapsed && isActive && (
                <span className="ms-auto h-1.5 w-1.5 rounded-full bg-brand-600 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-200 p-2 space-y-0.5">
        <Link
          href={`/${locale}/settings`}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
            "text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-4 w-4 shrink-0 text-surface-400" size={18} />
          {!collapsed && <span>{t("settings")}</span>}
        </Link>
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
            "text-surface-600 hover:bg-red-50 hover:text-red-600 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" size={18} />
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
