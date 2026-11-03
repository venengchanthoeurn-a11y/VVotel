"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export const NewsletterSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage(lang === "km" ? data.message.km : data.message.en);
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#f2efe9] py-14 px-4 sm:px-6 border-t border-gray-200">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-vvotel-gold">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-vvotel-navy">
          {t("newsletterTitle")}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-xl mx-auto">
          {t("newsletterDesc")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t("enterEmail")}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-vvotel-gold bg-white shadow-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 bg-vvotel-navy hover:bg-vvotel-blue text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center space-x-1.5"
          >
            <span>{t("subscribe")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {status === "success" && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-xl text-xs flex items-center justify-center space-x-2 max-w-md mx-auto border border-green-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
