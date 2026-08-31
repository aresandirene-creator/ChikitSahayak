"use client";

import { useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  LogIn, Phone, ShieldCheck, X, Loader2, UserCheck, ArrowRight, AlertCircle,
} from "lucide-react";
import type { PatientInfo } from "@/lib/types";
import { toast } from "sonner";

/**
 * Returning-patient login modal. Searches the DB by phone or ABHA, and if
 * found, prefetches the patient's demographics + creates a fresh encounter
 * for this appointment, then jumps straight into the workflow (consent step
 * — demographics are already known). The previous visit's chat / docs /
 * summary are NOT loaded into this session — only demographics are reused.
 */
export function LoginStep() {
  const setPatient = useChikitsaHayakStore((s) => s.setPatient);
  const setEncounterId = useChikitsaHayakStore((s) => s.setEncounterId);
  const setPrefaceTab = useChikitsaHayakStore((s) => s.setPrefaceTab);
  const setStep = useChikitsaHayakStore((s) => s.setStep);
  const autoAdaptAccessibility = useChikitsaHayakStore((s) => s.autoAdaptAccessibility);
  const setUiLanguage = useChikitsaHayakStore((s) => s.setUiLanguage);
  const reset = useChikitsaHayakStore((s) => s.reset);
  const setConsent = useChikitsaHayakStore((s) => s.setConsent);
  const { t } = useI18n();

  const [phone, setPhone] = useState("");
  const [abha, setAbha] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<{ name: string; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!phone.trim() && !abha.trim()) {
      setError(t("loginNotFound"));
      return;
    }
    setSearching(true);
    setError(null);
    setFound(null);
    try {
      const res = await fetch("/api/patient/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() || undefined, abhaId: abha.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      if (!data.found || !data.patient) {
        setError(t("loginNotFound"));
        return;
      }
      setFound({ name: data.patient.name, id: data.patient.id });
    } catch (e) {
      setError(t("loginError"));
    } finally {
      setSearching(false);
    }
  };

  const handleContinue = async () => {
    if (!found) return;
    setSearching(true);
    try {
      // Create a fresh encounter for this appointment
      const res = await fetch("/api/encounter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: found.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start visit");

      // Fetch the patient's demographics
      const pResp = await fetch(`/api/patient?id=${found.id}`);
      const pData = await pResp.json();
      const p = pData.patient;
      if (!p) throw new Error("Patient record not found");

      const patientInfo: PatientInfo = {
        id: p.id,
        name: p.name,
        age: p.age ?? undefined,
        gender: p.gender ?? undefined,
        phone: p.phone ?? undefined,
        language: p.language,
        ayushMode: p.ayushMode,
        bloodGroup: p.bloodGroup ?? undefined,
        abhaId: p.abhaId ?? undefined,
      };
      setPatient(patientInfo);
      setEncounterId(data.encounter.id);
      setUiLanguage(p.language);
      // Auto-adapt accessibility for returning patient too
      autoAdaptAccessibility(p.age ?? undefined);
      // Reset consents so the returning patient re-consents for this visit
      setConsent("history", false);
      setConsent("documents", false);
      setConsent("summary", false);
      setConsent("abdm_share", false);
      setPrefaceTab("new"); // close the returning-tab overlay
      setStep("consent"); // skip identify (demographics known)
      toast.success(t("loginFound", { name: p.name }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const handleClose = () => {
    setPrefaceTab(null);
    reset();
  };

  const handleNewPatient = () => {
    setPrefaceTab("new");
    reset();
    setStep("identify");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-md border-red-200 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <LogIn className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900">{t("loginTitle")}</h2>
                <p className="text-xs text-muted-foreground">{t("loginSubtitle")}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {!found ? (
            <>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="login-phone" className="text-red-900 flex items-center gap-1.5">
                    <Phone className="size-3.5" /> {t("loginFieldPhone")}
                  </Label>
                  <Input
                    id="login-phone"
                    value={phone}
                    onChange={(e) => {
                      // Indian mobile: 10 digits, starting 6-9
                      const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                      setPhone(v);
                    }}
                    placeholder={t("loginFieldPhonePlaceholder")}
                    className="h-11 border-red-200"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                  />
                  {phone.length > 0 && phone.length < 10 && (
                    <p className="text-xs text-red-600">Indian mobile number must be 10 digits (starts 6-9)</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px bg-red-200 flex-1" />
                  <span className="text-xs text-muted-foreground font-medium">{t("loginOr")}</span>
                  <div className="h-px bg-red-200 flex-1" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-abha" className="text-red-900 flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> {t("loginFieldAbha")}
                  </Label>
                  <Input
                    id="login-abha"
                    value={abha}
                    onChange={(e) => setAbha(e.target.value)}
                    placeholder={t("loginFieldAbhaPlaceholder")}
                    className="h-11 border-red-200"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={searching}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white"
              >
                {searching ? (
                  <><Loader2 className="size-4 animate-spin" /> {t("loginSearching")}</>
                ) : (
                  <>{t("loginButton")}</>
                )}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleNewPatient}
                  className="text-sm font-medium text-red-700 hover:underline"
                >
                  {t("loginStartNew")}
                </button>
              </div>

              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex items-start gap-2 text-xs text-red-700">
                <ShieldCheck className="size-3.5 shrink-0 mt-0.5" />
                <span>{t("loginNoRecordKept")}</span>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center py-4">
                <div className="size-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mb-3">
                  <UserCheck className="size-8" />
                </div>
                <p className="text-lg font-bold text-red-900">
                  {t("loginFound", { name: found.name })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t("loginNoRecordKept")}</p>
              </div>

              <Button
                onClick={handleContinue}
                disabled={searching}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white"
              >
                {searching ? (
                  <><Loader2 className="size-4 animate-spin" /> {t("loginSearching")}</>
                ) : (
                  <>{t("continue")} <ArrowRight className="size-4" /></>
                )}
              </Button>
              <button
                onClick={() => setFound(null)}
                className="w-full text-center text-sm text-muted-foreground hover:underline"
              >
                {t("back")}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
