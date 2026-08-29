"use client";

import { useState } from "react";
import { useMediKioskStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES } from "@/lib/languages";
import type { PatientInfo } from "@/lib/types";
import { UserRound, Phone, Droplet, Languages, Leaf, ShieldCheck, ArrowRight, Info } from "lucide-react";
import { toast } from "sonner";

export function IdentifyStep() {
  const setPatient = useMediKioskStore((s) => s.setPatient);
  const setConsent = useMediKioskStore((s) => s.setConsent);
  const nextStep = useMediKioskStore((s) => s.nextStep);
  const existing = useMediKioskStore((s) => s.patient);

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    age: existing?.age?.toString() ?? "",
    gender: existing?.gender ?? "",
    phone: existing?.phone ?? "",
    bloodGroup: existing?.bloodGroup ?? "",
    language: existing?.language ?? "en",
    ayushMode: existing?.ayushMode ?? false,
    abhaId: existing?.abhaId ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter the patient's name");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: form.age ? Number(form.age) : null,
          gender: form.gender || null,
          phone: form.phone || null,
          bloodGroup: form.bloodGroup || null,
          language: form.language,
          ayushMode: form.ayushMode,
          abhaId: form.abhaId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.patient) throw new Error(data.error || "Failed to create patient");

      const p: PatientInfo = {
        id: data.patient.id,
        name: data.patient.name,
        age: data.patient.age ?? undefined,
        gender: data.patient.gender ?? undefined,
        phone: data.patient.phone ?? undefined,
        language: data.patient.language,
        ayushMode: data.patient.ayushMode,
        bloodGroup: data.patient.bloodGroup ?? undefined,
        abhaId: data.patient.abhaId ?? undefined,
      };
      setPatient(p);
      // Reset consents on new patient
      setConsent("history", false);
      setConsent("documents", false);
      setConsent("summary", false);
      setConsent("abdm_share", false);
      toast.success(`Patient ${p.name} identified`);
      nextStep();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Allow the sticky footer's "Continue" to trigger the same submit logic
  useContinueHandler(handleSubmit);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
          <UserRound className="size-3.5" /> Step 1 · Identify
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-900">Who is the patient today?</h2>
        <p className="mt-1 text-muted-foreground">
          Capture basic demographics and the patient&apos;s preferred language. This information stays on the kiosk
          until the consultation is complete.
        </p>
      </div>

      <Card className="border-emerald-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-emerald-900">Patient identification</CardTitle>
          <CardDescription>Required fields are marked with an asterisk.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-emerald-900">
                Full name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age" className="text-emerald-900">Age (years)</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={120}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 45"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-emerald-900">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-emerald-900 flex items-center gap-1.5">
                <Phone className="size-3.5" /> Phone (optional)
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 98xxxxxxxx"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-emerald-900 flex items-center gap-1.5">
                <Droplet className="size-3.5" /> Blood group
              </Label>
              <Select value={form.bloodGroup} onValueChange={(v) => setForm({ ...form, bloodGroup: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-emerald-900 flex items-center gap-1.5">
                <Languages className="size-3.5" /> Preferred language <span className="text-red-500">*</span>
              </Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="abha" className="text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> ABHA ID (optional)
              </Label>
              <Input
                id="abha"
                value={form.abhaId}
                onChange={(e) => setForm({ ...form, abhaId: e.target.value })}
                placeholder="e.g. 12-3456-7890-1234"
                className="h-11"
              />
              <p className="text-[11px] text-muted-foreground">
                If the patient already has an ABHA, enter it here. Otherwise MediKiosk can generate a simulated one in the integration step.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
            <Leaf className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="ayush" className="text-amber-900 font-semibold cursor-pointer">
                Enable AYUSH / Ayurvedic history mode
              </Label>
              <p className="text-sm text-amber-700/80 mt-0.5">
                Adds Ayurvedic-specific intake questions — Prakriti, Vikriti, Ahara, Vihara, Agni and prior AYUSH treatments.
              </p>
            </div>
            <Switch
              id="ayush"
              checked={form.ayushMode}
              onCheckedChange={(c) => setForm({ ...form, ayushMode: c })}
            />
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-start gap-2 text-xs text-emerald-700">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            <span>
              Data privacy: All information collected here is stored on the kiosk and shared only with the doctor after
              explicit patient consent. MediKiosk uses consent-based ABDM-aligned data flows.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
            >
              {submitting ? "Saving…" : "Continue to consent"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
