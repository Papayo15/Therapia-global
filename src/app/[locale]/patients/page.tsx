import { getTranslations } from "next-intl/server";
import { Search, Plus, AlertTriangle, Mail, MessageCircle, MoreHorizontal } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const MOCK_PATIENTS = [
  { id:"1", name:"María López",     initials:"ML", email:"maria@email.com",  diagnosis:"Lumbalgia crónica",   adherence:92, lastActivity:"2h ago",  routines:8,  status:"active"    },
  { id:"2", name:"Carlos Ruiz",     initials:"CR", email:"carlos@email.com", diagnosis:"Hombro doloroso",     adherence:78, lastActivity:"5h ago",  routines:4,  status:"active"    },
  { id:"3", name:"Ana Martínez",    initials:"AM", email:"ana@email.com",    diagnosis:"Cervicalgia",         adherence:35, lastActivity:"3d ago",  routines:12, status:"attention" },
  { id:"4", name:"Pedro Sánchez",   initials:"PS", email:"pedro@email.com",  diagnosis:"Rodilla postCx",      adherence:88, lastActivity:"1d ago",  routines:6,  status:"active"    },
  { id:"5", name:"Laura Gómez",     initials:"LG", email:"laura@email.com",  diagnosis:"Fascitis plantar",    adherence:65, lastActivity:"6h ago",  routines:3,  status:"active"    },
  { id:"6", name:"Roberto Díaz",    initials:"RD", email:"roberto@email.com",diagnosis:"Escoliosis funcional",adherence:45, lastActivity:"5d ago",  routines:9,  status:"attention" },
  { id:"7", name:"Sofía Torres",    initials:"ST", email:"sofia@email.com",  diagnosis:"ATM disfunción",      adherence:95, lastActivity:"1h ago",  routines:5,  status:"active"    },
];

function PatientRow({ patient }: { patient: typeof MOCK_PATIENTS[0] }) {
  const adherenceColor =
    patient.adherence >= 80 ? "text-clinical-600" :
    patient.adherence >= 60 ? "text-amber-600" : "text-red-500";

  const adherenceBg =
    patient.adherence >= 80 ? "bg-clinical-500" :
    patient.adherence >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <tr className="hover:bg-surface-50/50 transition-colors cursor-pointer">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs font-semibold">{patient.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-surface-900">{patient.name}</p>
              {patient.status === "attention" && (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-surface-400">{patient.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-surface-600">{patient.diagnosis}</p>
      </td>
      <td className="px-6 py-4">
        <div className="w-32">
          <div className="flex items-center justify-between mb-1">
            <span className={cn("text-xs font-semibold", adherenceColor)}>
              {patient.adherence}%
            </span>
          </div>
          <Progress
            value={patient.adherence}
            className="h-1.5"
            indicatorClassName={adherenceBg}
          />
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-surface-500">{patient.lastActivity}</td>
      <td className="px-6 py-4 text-sm text-surface-500">{patient.routines}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="xs" className="gap-1">
            <Plus className="h-3 w-3" />
            Routine
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Mail className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MessageCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default async function PatientsPage() {
  const t = await getTranslations("patients");

  const activeCount = MOCK_PATIENTS.filter((p) => p.status === "active").length;
  const attentionCount = MOCK_PATIENTS.filter((p) => p.status === "attention").length;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={t("title")} subtitle={`${MOCK_PATIENTS.length} patients`} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl space-y-4">

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-clinical-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-clinical-600">{activeCount}</span>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">{t("active")}</p>
                    <p className="text-sm font-semibold text-surface-800">patients</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-amber-600">{attentionCount}</span>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Need attention</p>
                    <p className="text-sm font-semibold text-surface-800">low adherence</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-brand-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-brand-600">{MOCK_PATIENTS.length}</span>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Total</p>
                    <p className="text-sm font-semibold text-surface-800">patients</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table */}
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-64">
                    <Input
                      placeholder={t("search_placeholder")}
                      icon={<Search className="h-4 w-4" />}
                    />
                  </div>
                </div>
                <Button variant="primary" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("add_new")}
                </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-y border-surface-100 bg-surface-50">
                      <th className="px-6 py-3 text-start text-xs font-semibold text-surface-500 uppercase tracking-wide">Patient</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold text-surface-500 uppercase tracking-wide">Diagnosis</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold text-surface-500 uppercase tracking-wide">{t("adherence")}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold text-surface-500 uppercase tracking-wide">{t("last_session")}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold text-surface-500 uppercase tracking-wide">Routines</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold text-surface-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {MOCK_PATIENTS.map((patient) => (
                      <PatientRow key={patient.id} patient={patient} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
