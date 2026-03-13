"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, type Patient } from "@/lib/supabase";

interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [form, setForm] = useState({
    name: patient?.name ?? "",
    birth_date: patient?.birth_date ?? "",
    gender: patient?.gender ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      if (patient?.id) {
        const { data, error: err } = await supabase
          .from("patients")
          .update({ ...form })
          .eq("id", patient.id)
          .select()
          .single();
        if (err) throw err;
        onSave(data);
      } else {
        const { data, error: err } = await supabase
          .from("patients")
          .insert({ ...form, doctor_id: user.id })
          .select()
          .single();
        if (err) throw err;
        onSave(data);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar paciente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Nombre completo *
          </label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej. María García López"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Fecha de nacimiento
          </label>
          <Input
            type="date"
            value={form.birth_date}
            onChange={(e) => set("birth_date", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">Género</label>
          <select
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Sin especificar</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">Teléfono</label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+52 55 1234 5678"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="paciente@email.com"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : patient?.id ? "Actualizar" : "Crear paciente"}
        </Button>
      </div>
    </form>
  );
}
