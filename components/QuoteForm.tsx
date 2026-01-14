"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const days = [
  "Mondays",
  "Tuesdays",
  "Wednesdays",
  "Thursdays",
  "Fridays",
  "Saturdays",
  "Sundays",
] as const;

const siteTypes = [
  "Office/Commercial",
  "Welfare/Construction",
  "Hospitality/Venue",
  "Education/Institutional",
  "Specialist/Industrial",
  "Dental/Medical",
] as const;

const frequencyOptions = ["1","2","3","4","5","6","7"] as const;

const schema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  address: z.string().min(5, "Address is required."),
  contactName: z.string().min(2, "Contact name is required."),
  contactEmail: z.string().email("Enter a valid email."),
  contactPhone: z.string().optional(),
  hoursPerDay: z.coerce.number().min(0.25, "Hours per day is required.").max(24, "Hours per day looks too high."),
  frequencyPerWeek: z.enum(frequencyOptions),
  daysSelected: z.array(z.enum(days)).min(1, "Select at least one day."),
  siteType: z.enum(siteTypes),
  marginPercent: z.coerce.number().min(1, "Margin % is required.").max(90, "Margin % must be under 90."),
  productCostWeekly: z.coerce.number().min(0, "Must be 0 or more."),
  overheadCostWeekly: z.coerce.number().min(0, "Must be 0 or more."),
  applyPilotPricing: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

function CurrencyHint({ hoursPerDay, frequencyPerWeek }: { hoursPerDay?: number; frequencyPerWeek?: string }) {
  const weeklyHours = useMemo(() => {
    const h = Number(hoursPerDay ?? 0);
    const f = Number(frequencyPerWeek ?? 0);
    if (!h || !f) return 0;
    return h * f;
  }, [hoursPerDay, frequencyPerWeek]);

  return (
    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <div className="font-semibold text-slate-800">Quick sense-check</div>
      <div className="mt-1">Weekly contract hours: <span className="font-semibold">{weeklyHours.toFixed(2)}</span></div>
      <div className="mt-1 text-xs text-slate-500">Final pricing is calculated in n8n and emailed to the contact.</div>
    </div>
  );
}

export default function QuoteForm() {
  const [status, setStatus] = useState<"idle"|"submitting"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      frequencyPerWeek: "5",
      siteType: "Office/Commercial",
      productCostWeekly: 0,
      overheadCostWeekly: 0,
      applyPilotPricing: false,
      daysSelected: [],
      marginPercent: 45,
    },
  });

  const hoursPerDay = watch("hoursPerDay");
  const frequencyPerWeek = watch("frequencyPerWeek");
  const daysSelected = watch("daysSelected");

  const onSubmit = async (values: FormValues) => {
    setStatus("submitting");
    setErrorMsg("");

    // Map to the EXACT field labels used in your n8n workflow
    const payload = {
      "Company Name": values.companyName,
      "Address": values.address,
      "Contact Name": values.contactName,
      "Contact Email": values.contactEmail,
      "Contact Phone": values.contactPhone ?? "",
      "Hours Per Day": values.hoursPerDay,
      "Frequency Per Week": values.frequencyPerWeek,
      "On Which Days?": values.daysSelected,
      "Site Type": values.siteType,
      "Margin %": values.marginPercent,
      "Product Cost (Weekly)": values.productCostWeekly,
      "Overhead Cost (Weekly)": values.overheadCostWeekly,
      // n8n checkbox expects [] or ["yes"]
      "Apply Pilot Pricing (25% off for 30 days)": values.applyPilotPricing ? ["yes"] : [],
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || data?.upstream || `Request failed (${res.status})`);
      }

      setStatus("success");
      reset();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong sending your request.");
    }
  };

  const toggleDay = (d: typeof days[number]) => {
    const next = daysSelected.includes(d)
      ? daysSelected.filter((x) => x !== d)
      : [...daysSelected, d];
    setValue("daysSelected", next, { shouldValidate: true });
  };

  if (status === "success") {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center">
          <Image src="/logo.jpeg" alt="Signature Cleans" width={280} height={90} priority />
        </div>

        <div className="mt-6 rounded-2xl border border-scGreen/30 bg-scGreen/5 p-6 text-center">
          <div className="text-2xl font-bold text-scGreen">Thank you!</div>
          <p className="mt-2 text-slate-700">
            Your quote is being generated and will be emailed to you shortly. 📧
          </p>
        </div>

        <button
          className="mt-6 w-full rounded-xl bg-scGreen px-5 py-3 text-base font-bold text-white shadow-sm transition hover:bg-scGreenDark"
          onClick={() => setStatus("idle")}
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="flex items-center justify-center">
        <Image src="/logo.jpeg" alt="Signature Cleans" width={280} height={90} priority />
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-3xl font-extrabold text-scGreen">Instant Quote Request</h1>
        <p className="mt-2 text-slate-600 italic">Get your cleaning quote in minutes.</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Company Name <span className="text-red-600">*</span></label>
          <input className="input" placeholder="e.g., Acme Ltd" {...register("companyName")} />
          {errors.companyName && <div className="error">{errors.companyName.message}</div>}
        </div>

        <div>
          <label className="label">Address <span className="text-red-600">*</span></label>
          <input className="input" placeholder="Full site address" {...register("address")} />
          {errors.address && <div className="error">{errors.address.message}</div>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="label">Contact Name <span className="text-red-600">*</span></label>
            <input className="input" placeholder="Full name" {...register("contactName")} />
            {errors.contactName && <div className="error">{errors.contactName.message}</div>}
          </div>

          <div>
            <label className="label">Contact Phone</label>
            <input className="input" placeholder="Optional" {...register("contactPhone")} />
            {errors.contactPhone && <div className="error">{errors.contactPhone.message}</div>}
          </div>
        </div>

        <div>
          <label className="label">Contact Email <span className="text-red-600">*</span></label>
          <input className="input" placeholder="name@company.com" {...register("contactEmail")} />
          {errors.contactEmail && <div className="error">{errors.contactEmail.message}</div>}
          <div className="helper">We’ll send the quote to this address.</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="label">Hours Per Day <span className="text-red-600">*</span></label>
            <input className="input" type="number" step="0.25" min="0" {...register("hoursPerDay")} />
            {errors.hoursPerDay && <div className="error">{errors.hoursPerDay.message}</div>}
          </div>

          <div>
            <label className="label">Frequency Per Week <span className="text-red-600">*</span></label>
            <select className="input" {...register("frequencyPerWeek")}>
              {frequencyOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {errors.frequencyPerWeek && <div className="error">{errors.frequencyPerWeek.message}</div>}
          </div>
        </div>

        <div>
          <label className="label">On Which Days? <span className="text-red-600">*</span></label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {days.map((d) => {
              const checked = daysSelected.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                    checked ? "border-scGreen bg-scGreen/10 text-scGreen" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className="mr-2 inline-block h-4 w-4 align-[-2px] rounded border border-slate-300 bg-white">
                    {checked ? <span className="block h-full w-full rounded bg-scGreen" /> : null}
                  </span>
                  {d}
                </button>
              );
            })}
          </div>
          {errors.daysSelected && <div className="error">{errors.daysSelected.message as any}</div>}
        </div>

        <div>
          <label className="label">Site Type <span className="text-red-600">*</span></label>
          <select className="input" {...register("siteType")}>
            {siteTypes.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          {errors.siteType && <div className="error">{errors.siteType.message}</div>}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="label">Margin % <span className="text-red-600">*</span></label>
            <input className="input" type="number" step="1" min="0" {...register("marginPercent")} />
            {errors.marginPercent && <div className="error">{errors.marginPercent.message}</div>}
            <div className="helper">Example: 45</div>
          </div>

          <div>
            <label className="label">Product Cost (Weekly) <span className="text-red-600">*</span></label>
            <input className="input" type="number" step="0.01" min="0" {...register("productCostWeekly")} />
            {errors.productCostWeekly && <div className="error">{errors.productCostWeekly.message}</div>}
          </div>

          <div>
            <label className="label">Overhead Cost (Weekly) <span className="text-red-600">*</span></label>
            <input className="input" type="number" step="0.01" min="0" {...register("overheadCostWeekly")} />
            {errors.overheadCostWeekly && <div className="error">{errors.overheadCostWeekly.message}</div>}
          </div>
        </div>

        <CurrencyHint hoursPerDay={hoursPerDay} frequencyPerWeek={frequencyPerWeek} />

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-scGreen"
              {...register("applyPilotPricing")}
            />
            <div>
              <div className="font-bold text-amber-900">Apply Pilot Pricing (25% off for 30 days)</div>
              <div className="mt-1 text-sm text-amber-900/80">
                Tick this if you’re offering the 30-day pilot discount.
              </div>
            </div>
          </label>
        </div>

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="font-bold">Couldn’t submit your request</div>
            <div className="mt-1">{errorMsg}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-xl bg-gradient-to-br from-scGreen to-scGreenDark px-5 py-4 text-lg font-extrabold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : "Generate Quote"}
        </button>

        <div className="text-center text-xs text-slate-500">
          By submitting, you agree we may contact you about your request.
        </div>
      </form>
    </div>
  );
}
