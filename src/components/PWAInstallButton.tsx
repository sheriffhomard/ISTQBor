import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-3 py-2 text-xs font-medium text-white hover:bg-[#13294B] dark:bg-sky-600 dark:hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        {t('app.installApp')}
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIosGuide(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          {t('app.installApp')}
        </button>

        {showIosGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          >
            <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
              <h3 id="ios-install-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t('app.installIosTitle')}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t('app.installIosSteps')}
              </p>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="mt-4 w-full rounded-lg bg-[#0B192C] dark:bg-sky-600 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                {t('app.close')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
