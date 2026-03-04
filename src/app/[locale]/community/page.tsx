import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Share2, Award, Users, TrendingUp } from "lucide-react";

const MOCK_CASES = [
  {
    id:"1", author:"Dr. Sarah Chen", initials:"SC", specialty:"Osteopath · Shanghai",
    title:"Chronic low back pain resolution with visceral approach in 6 sessions",
    tags:["Visceral","Lumbar","Chronic"],
    likes:48, comments:12, views:234, timeAgo:"2h ago",
  },
  {
    id:"2", author:"Dr. Julien Moreau", initials:"JM", specialty:"Physio · Paris",
    title:"Post-surgical shoulder rehab: protocol combining PNF and HVLA",
    tags:["Shoulder","Post-op","PNF"],
    likes:32, comments:8, views:189, timeAgo:"5h ago",
  },
  {
    id:"3", author:"Dr. María García", initials:"MG", specialty:"Therapist · Madrid",
    title:"TMJ dysfunction treated successfully with cranial osteopathy",
    tags:["Cranial","TMJ","Facial pain"],
    likes:67, comments:21, views:412, timeAgo:"1d ago",
  },
];

const MOCK_TOP_THERAPISTS = [
  { name:"Dr. James Kim",     specialty:"Sports Osteopath",     country:"🇺🇸", cases:84, followers:"1.2k" },
  { name:"Dr. Aiko Tanaka",   specialty:"Visceral Specialist",   country:"🇯🇵", cases:61, followers:"890"  },
  { name:"Dr. Priya Sharma",  specialty:"Neurological Physio",   country:"🇮🇳", cases:55, followers:"743"  },
];

export default function CommunityPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Professional Network" subtitle="Share cases, learn from peers" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Feed */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-surface-700">Clinical Cases</h2>
                  <Button variant="primary" size="sm" className="gap-2">
                    Share Case
                  </Button>
                </div>

                {MOCK_CASES.map((item) => (
                  <Card key={item.id} className="hover:shadow-card-md transition-all cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs font-semibold">{item.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-surface-900">{item.author}</p>
                          <p className="text-xs text-surface-400">{item.specialty} · {item.timeAgo}</p>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-surface-800 mb-3 leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="default" className="text-2xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-surface-400">
                        <button className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {item.likes}
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {item.comments}
                        </button>
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {item.views} views
                        </span>
                        <button className="ms-auto flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Top therapists */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-brand-600" />
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-surface-100">
                      {MOCK_TOP_THERAPISTS.map((therapist, i) => (
                        <div key={therapist.name} className="flex items-center gap-3 px-5 py-3">
                          <span className="text-xs font-bold text-surface-400 w-4">#{i+1}</span>
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">
                              {therapist.name.split(" ").map(n => n[0]).join("").slice(1,3)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-surface-800 truncate">
                              {therapist.country} {therapist.name}
                            </p>
                            <p className="text-2xs text-surface-400 truncate">{therapist.specialty}</p>
                          </div>
                          <div className="text-end shrink-0">
                            <p className="text-xs font-bold text-brand-600">{therapist.cases}</p>
                            <p className="text-2xs text-surface-400">cases</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Network stats */}
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
                      Global Network
                    </p>
                    <div className="space-y-3">
                      {[
                        { icon: Users, label:"Verified therapists", value:"50,000+" },
                        { icon: TrendingUp, label:"Cases shared",  value:"8,400+"  },
                        { icon: Award, label:"Certifications",     value:"1,200+"  },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-surface-600">
                            <Icon className="h-3.5 w-3.5 text-surface-400" />
                            {label}
                          </div>
                          <span className="text-xs font-bold text-surface-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
