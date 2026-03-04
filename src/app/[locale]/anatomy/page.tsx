import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const REGIONS = [
  { id:"shoulder",  label:"Shoulder",   emoji:"💪", layers:5, techniques:24 },
  { id:"cervical",  label:"Cervical",   emoji:"🔍", layers:5, techniques:18 },
  { id:"thoracic",  label:"Thoracic",   emoji:"🫁", layers:5, techniques:15 },
  { id:"lumbar",    label:"Lumbar",     emoji:"🦴", layers:5, techniques:32 },
  { id:"hip",       label:"Hip",        emoji:"🔵", layers:5, techniques:21 },
  { id:"knee",      label:"Knee",       emoji:"🦵", layers:5, techniques:19 },
  { id:"ankle",     label:"Ankle",      emoji:"🦶", layers:5, techniques:12 },
  { id:"elbow",     label:"Elbow",      emoji:"💫", layers:5, techniques:10 },
  { id:"tmj",       label:"TMJ",        emoji:"😬", layers:5, techniques:8  },
  { id:"visceral",  label:"Viscera",    emoji:"🫀", layers:5, techniques:28 },
];

const KNOWLEDGE_LAYERS = [
  { key:"anatomy",         label:"Anatomy",          color:"bg-blue-100 text-blue-700",    desc:"Structures, insertions, origin" },
  { key:"physiology",      label:"Physiology",       color:"bg-green-100 text-green-700",  desc:"Function in movement" },
  { key:"dysfunctions",    label:"Dysfunctions",     color:"bg-amber-100 text-amber-700",  desc:"What fails and why" },
  { key:"techniqueEffects",label:"Technique Effects",color:"bg-purple-100 text-purple-700",desc:"What happens when you apply the technique" },
  { key:"connections",     label:"Connections",      color:"bg-rose-100 text-rose-700",    desc:"Distant dysfunctions" },
];

export default function AnatomyPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Applied Anatomy" subtitle="5 knowledge layers per region" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl space-y-6">

            {/* Knowledge layers legend */}
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
                  5 Knowledge Layers per Region
                </p>
                <div className="flex flex-wrap gap-2">
                  {KNOWLEDGE_LAYERS.map((layer, i) => (
                    <div
                      key={layer.key}
                      className={cn("flex items-center gap-2 rounded-xl px-3 py-1.5", layer.color)}
                    >
                      <span className="text-xs font-bold">{i + 1}</span>
                      <div>
                        <p className="text-xs font-semibold leading-none">{layer.label}</p>
                        <p className="text-2xs opacity-70 mt-0.5">{layer.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regions grid */}
            <div>
              <h2 className="text-sm font-semibold text-surface-700 mb-3">Select a region</h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {REGIONS.map((region) => (
                  <Card
                    key={region.id}
                    className="group cursor-pointer hover:shadow-card-md hover:-translate-y-0.5 transition-all hover:border-brand-200"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-3">{region.emoji}</div>
                      <p className="text-sm font-semibold text-surface-900">{region.label}</p>
                      <p className="text-xs text-surface-400 mt-1">{region.techniques} techniques</p>
                      <div className="mt-3 flex justify-center gap-0.5">
                        {KNOWLEDGE_LAYERS.map((layer, i) => (
                          <div
                            key={i}
                            className={cn("h-1.5 w-6 rounded-full", layer.color.split(" ")[0])}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="mt-3 w-full gap-1 text-brand-600 group-hover:bg-brand-50"
                      >
                        Explore <ChevronRight className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
