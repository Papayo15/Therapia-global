"use client";

import { useState, useEffect } from "react";
import { Search, Plus, User, Phone, Mail, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, type Patient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
  onNewPatient: () => void;
}

export function PatientList({ onSelectPatient, onNewPatient }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setPatients(data);
      setLoading(false);
    }
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente..."
            className="ps-9"
          />
        </div>
        <Button onClick={onNewPatient} className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" />
          Nuevo paciente
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <User className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Sin pacientes registrados</p>
          <p className="text-sm mt-1">Crea el primer paciente para comenzar</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
          {filtered.map((patient) => (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-bold text-sm">
                  {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{patient.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {patient.phone && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Phone className="h-3 w-3" />{patient.phone}
                    </span>
                  )}
                  {patient.email && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 truncate">
                      <Mail className="h-3 w-3" />{patient.email}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
