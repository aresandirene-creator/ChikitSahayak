"use client";

import { useState } from "react";
import { useChikitSahayakStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { useI18n } from "@/lib/use-i18n";
import { useUiMode } from "@/lib/use-ui-mode";
import { LANGUAGES, type LangCode, getLanguageNativeName } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PatientInfo } from "@/lib/types";
import { toast } from "sonner";
import {
  UserRound, Phone, Droplet, Languages, Leaf, ShieldCheck, ArrowRight, Lock,
  Venus, Mars, CircleUser,
} from "lucide-react";

export function IdentifyStep() {
  const setPatient = useChikitSahayakStore((s) => s.setPatient);
  const setEncounterId = useChikitSahayakStore((s) => s.setEncounterId);
  const setConsent = useChikitSahayakStore((s) => s.setConsent);
  const setUiLanguage = useChikitSahayakStore((s) => s.setUiLanguage);
  const autoAdaptAccessibility = useChikitSahayakStore((s) => s.autoAdaptAccessibility);
  const nextStep = useChikitSahayakStore((s) => s.nextStep);
  const existing = useChikitSahayakStore((s) => s.patient);
  const uiLanguage = useChikitSahayakStore((s) => s.uiLanguage);
  const { t } = useI18n();
  const { graphical } = useUiMode();

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    age: existing?.age?.toString() ?? "",
    gender: existing?.gender ?? "",
    phone: existing?.phone ?? "",
    bloodGroup: existing?.bloodGroup ?? "",
    language: existing?.language ?? uiLanguage,
    ayushMode: existing?.ayushMode ?? false,
    abhaId: existing?.abhaId ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error(t("identifyName") + " " + t("required").toLowerCase());
      return;
    }
    // Age validation: 0-120
    if (form.age && (Number(form.age) < 0 || Number(form.age) > 120)) {
      toast.error("Age must be between 0 and 120");
      return;
    }
    // Indian phone validation: if provided, must be 10 digits starting 6-9
    if (form.phone) {
      if (form.phone.length !== 10) {
        toast.error("Phone number must be exactly 10 digits");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(form.phone)) {
        toast.error("Indian mobile numbers start with 6, 7, 8 or 9");
        return;
      }
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
      setEncounterId(data.encounter?.id ?? null);
      setUiLanguage(form.language as LangCode);
      // Auto-adapt the UI to the patient's age (bigger fonts for seniors/children)
      autoAdaptAccessibility(data.patient.age ?? (form.age ? Number(form.age) : undefined));
      setConsent("history", false);
      setConsent("documents", false);
      setConsent("summary", false);
      setConsent("abdm_share", false);
      toast.success(t("identifySaved"));
      nextStep();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  useContinueHandler(handleSubmit);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-100 rounded-full px-3 py-1">
          <UserRound className="size-3.5" /> {t("identifyBadge")}
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-red-900">{t("identifyTitle")}</h2>
        <p className="mt-1 text-muted-foreground">{t("identifySubtitle")}</p>
      </div>

      <Card className="border-red-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-900">{t("identifyCardTitle")}</CardTitle>
          <CardDescription>{t("identifyCardDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-red-900">
                {t("identifyName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => {
                  // Allow letters (incl. Indian scripts), spaces, dots, hyphens, apostrophes.
                  // Strip digits and other symbols.
                  const v = e.target.value.replace(/[0-9]/g, "").slice(0, 60);
                  setForm({ ...form, name: v });
                }}
                placeholder={t("identifyNamePlaceholder")}
                className="h-11"
                maxLength={60}
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age" className="text-red-900">{t("identifyAge")}</Label>
              <Input
                id="age"
                type="text"
                value={form.age}
                onChange={(e) => {
                  // Strip everything except digits; limit to 3 chars; clamp to 120
                  let v = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                  if (v && Number(v) > 120) v = "120";
                  setForm({ ...form, age: v });
                }}
                placeholder={t("identifyAgePlaceholder")}
                className="h-11"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
              />
              {form.age && Number(form.age) > 120 && (
                <p className="text-xs text-red-600">Age must be between 0 and 120</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-red-900">{t("identifyGender")}</Label>
              {graphical ? (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v: "male", icon: Mars, label: t("identifyGenderMale"), color: "bg-red-100 text-red-700" },
                    { v: "female", icon: Venus, label: t("identifyGenderFemale"), color: "bg-pink-100 text-pink-700" },
                    { v: "other", icon: CircleUser, label: t("identifyGenderOther"), color: "bg-violet-100 text-violet-700" },
                    { v: "prefer_not", icon: CircleUser, label: t("identifyGenderPreferNot"), color: "bg-slate-100 text-slate-600" },
                  ].map((g) => (
                    <button
                      key={g.v}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g.v })}
                      className={[
                        "rounded-xl border-2 p-2 flex flex-col items-center gap-1 transition-all",
                        form.gender === g.v
                          ? "border-red-500 bg-red-50 shadow-sm"
                          : "border-red-200 bg-white hover:bg-red-50/50",
                      ].join(" ")}
                    >
                      <div className={["size-10 rounded-full flex items-center justify-center", g.color].join(" ")}>
                        <g.icon className="size-6" />
                      </div>
                      <span className="text-[10px] font-semibold text-red-800 text-center leading-tight">{g.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t("identifyGenderPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("identifyGenderMale")}</SelectItem>
                    <SelectItem value="female">{t("identifyGenderFemale")}</SelectItem>
                    <SelectItem value="other">{t("identifyGenderOther")}</SelectItem>
                    <SelectItem value="prefer_not">{t("identifyGenderPreferNot")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-red-900 flex items-center gap-1.5">
                <Phone className="size-3.5" /> {t("identifyPhone")}
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => {
                  // Indian mobile numbers: exactly 10 digits, starting 6-9
                  let v = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  setForm({ ...form, phone: v });
                }}
                placeholder={t("identifyPhonePlaceholder")}
                className="h-11"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
              />
              {form.phone.length > 0 && form.phone.length < 10 && (
                <p className="text-xs text-red-600">Indian mobile number must be 10 digits (starts 6-9)</p>
              )}
              {form.phone.length === 10 && form.phone[0] && !/[6-9]/.test(form.phone[0]) && (
                <p className="text-xs text-red-600">Indian mobile numbers start with 6, 7, 8 or 9</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-red-900 flex items-center gap-1.5">
                <Droplet className="size-3.5" /> {t("identifyBloodGroup")}
              </Label>
              <Select value={form.bloodGroup} onValueChange={(v) => setForm({ ...form, bloodGroup: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t("identifyBloodGroupPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-red-900 flex items-center gap-1.5">
                <Languages className="size-3.5" /> {t("identifyLanguage")} <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, language: l.code });
                      setUiLanguage(l.code as LangCode);
                    }}
                    className={[
                      "rounded-lg border px-2 py-2 text-center transition-all",
                      form.language === l.code
                        ? "border-red-500 bg-red-50 text-red-800 font-semibold shadow-sm"
                        : "border-red-200 bg-white text-red-700 hover:bg-red-50/50",
                    ].join(" ")}
                  >
                    <div className="text-sm font-bold leading-none">{l.flag}</div>
                    <div className="text-[10px] mt-1 leading-tight">{l.nativeName}</div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t("prefaceLanguageChanged")}: <span className="font-medium text-red-700">{getLanguageNativeName(form.language)}</span>
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="abha" className="text-red-900 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> {t("identifyAbha")}
              </Label>
              <Input
                id="abha"
                value={form.abhaId}
                onChange={(e) => setForm({ ...form, abhaId: e.target.value })}
                placeholder={t("identifyAbhaPlaceholder")}
                className="h-11"
              />
              <p className="text-[11px] text-muted-foreground">{t("identifyAbhaHint")}</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
            <Leaf className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="ayush" className="text-amber-900 font-semibold cursor-pointer">
                {t("identifyAyush")}
              </Label>
              <p className="text-sm text-amber-700/80 mt-0.5">{t("identifyAyushDesc")}</p>
            </div>
            <Switch
              id="ayush"
              checked={form.ayushMode}
              onCheckedChange={(c) => setForm({ ...form, ayushMode: c })}
            />
          </div>

          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex items-start gap-2 text-xs text-red-700">
            <Lock className="size-3.5 shrink-0 mt-0.5" />
            <span>{t("identifyPrivacyNote")}</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
              className="bg-red-600 hover:bg-red-700 text-white h-12 px-8"
            >
              {submitting ? t("identifySaving") : t("identifyContinue")}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
