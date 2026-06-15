"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useTranslation } from "@/i18n/client";

export default function PlaybookPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    // Use an iframe or direct window location to trigger the download,
    // which allows the browser to download the file without navigating away.
    window.location.href = "/api/playbook/export";
    
    // Reset loading state after a short delay since we can't easily hook into native download completion
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto mt-8">
      <header className="text-center">
        <h1 className="text-4xl font-heading font-bold text-on-surface mb-2">{t.playbook.title}</h1>
        <p className="text-on-surface-variant text-lg">{t.playbook.subtitle}</p>
      </header>

      <div className="bg-surface-container-low border border-surface-container rounded-3xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center">
            <Icon name="calendar_month" className="text-5xl text-on-primary-container" />
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-on-surface mb-2">{t.playbook.noPlaybookTitle}</h3>
          <p className="text-on-surface-variant max-w-md mx-auto">
            {t.playbook.noPlaybookDesc}
          </p>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleDownload}
            disabled={loading}
            className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg inline-flex items-center gap-3 hover:bg-primary-fixed transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Icon name="progress_activity" className="animate-spin" /> 
                {t.playbook.loading}
              </>
            ) : (
              <>
                <Icon name="download" /> 
                {t.playbook.generateButton}
              </>
            )}
          </button>
          
          <p className="text-sm text-on-surface-variant mt-4 opacity-75">
            Imports directly into Google Calendar, Apple Calendar, and Outlook.
          </p>
        </div>
      </div>
    </div>
  );
}
