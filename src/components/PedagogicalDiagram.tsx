import React, { useState } from 'react';
import type { AppLanguage, LessonDiagramType } from '../types/domain';

interface PedagogicalDiagramProps {
  type: LessonDiagramType;
  lang: AppLanguage;
}

export const PedagogicalDiagram: React.FC<PedagogicalDiagramProps> = ({ type, lang }) => {
  const [bvaMode, setBvaMode] = useState<'2val' | '3val'>('3val');
  const [bvaMin, setBvaMin] = useState<number>(10);
  const [bvaMax, setBvaMax] = useState<number>(50);
  const [sdlcMode, setSdlcMode] = useState<'v_model' | 'shift_left'>('shift_left');
  const [activeQuadrant, setActiveQuadrant] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');

  if (type === 'none') return null;

  if (type === 'bva_boundaries') {
    const safeMax = Math.max(bvaMin + 4, bvaMax);
    const points =
      bvaMode === '2val'
        ? [bvaMin - 1, bvaMin, safeMax, safeMax + 1]
        : [bvaMin - 1, bvaMin, bvaMin + 1, safeMax - 1, safeMax, safeMax + 1];

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {lang === 'fr'
                ? 'Simulateur interactif BVA (2 valeurs vs 3 valeurs)'
                : 'Interactive BVA Explorer (2-Value vs 3-Value)'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {lang === 'fr'
                ? `Plage valide entière [${bvaMin} .. ${safeMax}]`
                : `Valid integer partition [${bvaMin} .. ${safeMax}]`}
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setBvaMode('2val')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                bvaMode === '2val'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {lang === 'fr' ? 'BVA 2 valeurs' : '2-Value BVA'}
            </button>
            <button
              type="button"
              onClick={() => setBvaMode('3val')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                bvaMode === '3val'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {lang === 'fr' ? 'BVA 3 valeurs' : '3-Value BVA'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <label className="block text-xs text-slate-700 dark:text-slate-300">
            <span className="flex justify-between mb-1 font-mono tabular-nums">
              <span>{lang === 'fr' ? 'Borne min' : 'Min boundary'}</span>
              <span>{bvaMin}</span>
            </span>
            <input
              type="range"
              min={1}
              max={30}
              value={bvaMin}
              onChange={(e) => setBvaMin(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </label>
          <label className="block text-xs text-slate-700 dark:text-slate-300">
            <span className="flex justify-between mb-1 font-mono tabular-nums">
              <span>{lang === 'fr' ? 'Borne max' : 'Max boundary'}</span>
              <span>{safeMax}</span>
            </span>
            <input
              type="range"
              min={bvaMin + 4}
              max={100}
              value={safeMax}
              onChange={(e) => setBvaMax(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs tabular-nums">
          {points.map((val) => {
            const isValid = val >= bvaMin && val <= safeMax;
            return (
              <div
                key={val}
                className={`px-3 py-2 rounded-lg border ${
                  isValid
                    ? 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100'
                    : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100'
                }`}
              >
                <span className="font-semibold">{val}</span>
                <span className="ml-1.5 text-[11px] opacity-80">
                  {isValid ? (lang === 'fr' ? 'Valide' : 'Valid') : lang === 'fr' ? 'Invalide' : 'Invalid'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'v_model_shift_left') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {lang === 'fr'
              ? 'Comparateur visuel : Modèle en V vs Shift-Left'
              : 'Visual Explorer: V-Model vs Shift-Left'}
          </h4>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setSdlcMode('v_model')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                sdlcMode === 'v_model'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {lang === 'fr' ? 'Modèle en V' : 'V-Model'}
            </button>
            <button
              type="button"
              onClick={() => setSdlcMode('shift_left')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                sdlcMode === 'shift_left'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Shift-Left (CI/CD)
            </button>
          </div>
        </div>

        {sdlcMode === 'v_model' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              [
                lang === 'fr' ? 'Exigences métier' : 'Business Requirements',
                lang === 'fr' ? 'Test d’acceptation' : 'Acceptance Testing',
              ],
              [
                lang === 'fr' ? 'Spécifications système' : 'System Specification',
                lang === 'fr' ? 'Test système' : 'System Testing',
              ],
              [
                lang === 'fr' ? 'Architecture & Interfaces' : 'Architecture & Interfaces',
                lang === 'fr' ? 'Test d’intégration' : 'Integration Testing',
              ],
              [
                lang === 'fr' ? 'Conception détaillée & Code' : 'Detailed Design & Code',
                lang === 'fr' ? 'Test de composant' : 'Component Testing',
              ],
            ].map(([left, right], i) => (
              <React.Fragment key={i}>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  {left}
                </div>
                <div className="p-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 font-medium">
                  ↔ {right}
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {[
              {
                step: '01',
                title: lang === 'fr' ? 'Revue Story / ATDD' : 'Story Review / ATDD',
                desc: lang === 'fr' ? 'Défauts d’ambiguïté corrigés avant codage' : 'Ambiguities resolved before coding',
              },
              {
                step: '02',
                title: lang === 'fr' ? 'TDD & Analyse statique' : 'TDD & Static Checks',
                desc: lang === 'fr' ? 'Linters & tests unitaires dès l’IDE' : 'Linters & unit checks right inside IDE',
              },
              {
                step: '03',
                title: 'Pipeline CI/CD',
                desc: lang === 'fr' ? 'Intégration & API automatisés à chaque commit' : 'Automated API/integration gates per commit',
              },
              {
                step: '04',
                title: lang === 'fr' ? 'Exploratoire & Release' : 'Exploratory & Release',
                desc: lang === 'fr' ? 'Validation humaine ciblée à haute valeur' : 'High-value human exploratory validation',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-800"
              >
                <div className="font-mono text-sky-700 dark:text-sky-300 font-semibold">{item.step}</div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === 'test_pyramid_quadrants') {
    const info: Record<'Q1' | 'Q2' | 'Q3' | 'Q4', { fr: string; en: string }> = {
      Q1: {
        fr: 'Q1 (Technologie · Soutien équipe) : Tests unitaires, intégration composants, automatisés dans le pipeline.',
        en: 'Q1 (Technology · Team-supporting): Unit & component integration tests, automated in CI.',
      },
      Q2: {
        fr: 'Q2 (Métier · Soutien équipe) : Tests fonctionnels, BDD/ATDD, simulations de parcours utilisateur.',
        en: 'Q2 (Business · Team-supporting): Functional tests, BDD/ATDD, story acceptance scenarios.',
      },
      Q3: {
        fr: 'Q3 (Métier · Critique produit) : Tests exploratoires, utilisabilité, tests d’acceptation utilisateurs (UAT).',
        en: 'Q3 (Business · Product-critiquing): Exploratory testing, usability, UAT.',
      },
      Q4: {
        fr: 'Q4 (Technologie · Critique produit) : Charge, performance, sécurité, résilience (souvent outillés).',
        en: 'Q4 (Technology · Product-critiquing): Load, performance, security, reliability (tool-supported).',
      },
    };

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          {lang === 'fr' ? 'Explorateur des 4 Quadrants de Test' : 'Interactive 4 Testing Quadrants Explorer'}
        </h4>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {(['Q2', 'Q3', 'Q1', 'Q4'] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setActiveQuadrant(q)}
              className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                activeQuadrant === q
                  ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="font-mono font-semibold">{q}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          {info[activeQuadrant][lang]}
        </p>
      </div>
    );
  }

  // Review process / Defect lifecycle clean structured flow
  const steps =
    type === 'review_process'
      ? lang === 'fr'
        ? ['1. Planification', '2. Initiation', '3. Revue individuelle', '4. Analyse collective', '5. Correction & Rapport']
        : ['1. Planning', '2. Review Initiation', '3. Individual Review', '4. Communication & Analysis', '5. Fixing & Reporting']
      : lang === 'fr'
        ? ['Nouveau', 'Assigné', 'En correction', 'À confirmer (Retest)', 'Fermé / Rejeté']
        : ['New', 'Assigned', 'In Progress', 'Ready for Confirmation', 'Closed / Rejected'];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {type === 'review_process'
          ? lang === 'fr'
            ? 'Flux du processus de revue statique'
            : 'Static Review Process Workflow'
          : lang === 'fr'
            ? 'Cycle de vie type d’un défaut'
            : 'Typical Defect Lifecycle'}
      </h4>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {step}
            </div>
            {idx < steps.length - 1 && (
              <span className="text-slate-400 font-mono" aria-hidden="true">
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
