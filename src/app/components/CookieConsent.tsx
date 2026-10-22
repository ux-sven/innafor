import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { OPEN_SETTINGS_EVENT, getConsent, loadAnalytics, setConsent, type Consent } from '../analytics';

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Consent | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const saved = getConsent();
    setCurrent(saved);
    if (saved === 'granted') loadAnalytics();
    if (saved === null) setOpen(true);

    const onOpen = () => {
      setCurrent(getConsent());
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
  }, []);

  const choose = (value: Consent) => {
    setConsent(value);
    setCurrent(value);
    setOpen(false);
    setShowDetails(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-text"
      className="fixed inset-x-0 bottom-0 z-[1000] p-3 sm:p-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="mx-auto max-w-[860px] rounded-2xl border border-[rgba(212,165,116,0.3)] bg-[rgba(12,10,8,0.92)] backdrop-blur-md shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] p-5 sm:p-6 font-['Inter',sans-serif]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Cookie className="size-5 text-[#E5B87E]" aria-hidden />
              <h2 id="cookie-title" className="text-[16px] font-bold text-white">Er det greit med litt statistikk?</h2>
            </div>
            <p id="cookie-text" className="mt-1.5 text-[14px] leading-[21px] text-[#c4c9d1]">
              Vi bruker Google Analytics for å se hvor mange som besøker siden og hva som blir lyttet til. Ingenting lagres
              før du sier ja, og du kan når som helst endre valget nederst på siden.{' '}
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                aria-expanded={showDetails}
                className="underline underline-offset-2 text-[#E5B87E] hover:text-[#f5d08a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B87E] rounded-sm"
              >
                {showDetails ? 'Skjul detaljer' : 'Les mer'}
              </button>
            </p>
            {showDetails && (
              <div className="mt-3 rounded-lg border border-[rgba(212,165,116,0.15)] bg-[rgba(255,255,255,0.03)] p-3 text-[13px] leading-[20px] text-[#aab1bb]">
                <p>
                  <strong className="text-[#d1d5dc]">Hva:</strong> Google Analytics 4 setter informasjonskapslene <code>_ga</code> og{' '}
                  <code>_ga_*</code> (lagres i opptil 2 år) og samler anonymisert info om besøket – sidevisninger, omtrentlig
                  land/by, enhet og nettleser. IP-adressen lagres ikke.
                </p>
                <p className="mt-2">
                  <strong className="text-[#d1d5dc]">Hvem:</strong> Google Ireland Ltd. behandler dataene på vegne av INNAFØR.
                  Dataene brukes kun til statistikk, ikke til annonser. Spørsmål? Skriv til{' '}
                  <a className="text-[#E5B87E] underline underline-offset-2" href="mailto:artisten.innafor@gmail.com">
                    artisten.innafor@gmail.com
                  </a>
                  .
                </p>
              </div>
            )}
            {current && (
              <p className="mt-2 text-[12px] text-[#6b7280]">
                Nåværende valg: {current === 'granted' ? 'statistikk tillatt' : 'statistikk avslått'}
              </p>
            )}
          </div>

          {/* Equal weight buttons – declining must be as easy as accepting */}
          <div className="flex shrink-0 gap-2 sm:flex-col">
            <button
              type="button"
              onClick={() => choose('granted')}
              className="flex-1 rounded-full bg-[#E5B87E] px-5 py-2.5 text-[14px] font-semibold text-black transition hover:bg-[#f0c890] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Ja, det er greit
            </button>
            <button
              type="button"
              onClick={() => choose('denied')}
              className="flex-1 rounded-full border border-[rgba(229,184,126,0.6)] px-5 py-2.5 text-[14px] font-semibold text-[#E5B87E] transition hover:bg-[rgba(229,184,126,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B87E]"
            >
              Nei takk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
