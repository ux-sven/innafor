import { useMemo, useState, type ComponentType } from 'react';
import { Check, GlassWater, Mail, Plus, Sparkles, Sticker, TreePine, X } from 'lucide-react';
import { trackEvent } from '../analytics';
import modelImg from '../../imports/merch/merch-model.jpg';
import teeImg from '../../imports/merch/merch-tee.jpg';
import capImg from '../../imports/merch/merch-cap.jpg';
import toteImg from '../../imports/merch/merch-tote.jpg';

const EMAIL = 'artisten.innafor@gmail.com';

interface MerchItem {
  id: string;
  name: string;
  pitch: string;
  tag?: string;
  image?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Extra line in the e-mail, e.g. asking for size */
  emailHint?: string;
}

const MAIN_ITEMS: MerchItem[] = [
  {
    id: 't-skjorte',
    name: 'T-skjorte',
    pitch: 'Klassikeren. Svart t-skjorte med hatten og gull-logoen stort på brystet.',
    tag: 'Svart & gull',
    image: teeImg,
    emailHint: 'størrelse',
  },
  {
    id: 'caps',
    name: 'Caps',
    pitch: 'Diskret logo foran. Funker like godt på traktoren som på byen.',
    tag: 'Liten logo',
    image: capImg,
  },
  {
    id: 'handlenett',
    name: 'Handlenett',
    pitch: 'Romslig nett med stor logo. Til butikken, polet eller festivalen.',
    tag: 'Stort trykk',
    image: toteImg,
  },
];

const SMALL_ITEMS: MerchItem[] = [
  { id: 'drikkeflaske', name: 'Drikkeflaske', pitch: 'Hold deg hydrert mellom refrengene.', icon: GlassWater },
  { id: 'wonderbaum', name: 'Wonderbaum', pitch: 'Bilen lukter innafør.', icon: TreePine },
  { id: 'klistremerker', name: 'Klistremerker', pitch: 'Klistre INNAFØR på alt som står stille.', icon: Sticker },
];

const ALL_ITEMS = [...MAIN_ITEMS, ...SMALL_ITEMS];

function buildMailto(selected: MerchItem[]) {
  const names = selected.map((i) => i.name);
  const subject = selected.length ? `Merch: ${names.join(', ')}` : 'Merch fra INNAFØR';
  const lines = selected.length
    ? selected.map((i) => `- ${i.name} – antall:${i.emailHint ? ` – ${i.emailHint}:` : ''}`)
    : ['- (skriv hva du er interessert i)'];
  const body = [
    'Hei INNAFØR!',
    '',
    'Jeg er interessert i:',
    ...lines,
    '',
    'Navn:',
    'Hvor holder du til (for henting/sending):',
    '',
    'Hilsen',
  ].join('\n');
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function SelectButton({ selected, onClick, name }: { selected: boolean; onClick: () => void; name: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={selected ? `Fjern ${name} fra forespørselen` : `Legg ${name} til i forespørselen`}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B87E] ${
        selected
          ? 'bg-[#E5B87E] text-black hover:bg-[#f0c890]'
          : 'border border-[rgba(229,184,126,0.45)] text-[#E5B87E] hover:bg-[rgba(229,184,126,0.1)] hover:border-[#E5B87E]'
      }`}
    >
      {selected ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      {selected ? 'Lagt til' : 'Jeg vil ha'}
    </button>
  );
}

export function Merch() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selected = useMemo(() => ALL_ITEMS.filter((i) => selectedIds.includes(i.id)), [selectedIds]);
  const mailto = buildMailto(selected);

  const toggle = (item: MerchItem) => {
    setSelectedIds((ids) => {
      const on = !ids.includes(item.id);
      trackEvent(on ? 'merch_select' : 'merch_deselect', { item: item.name });
      return on ? [...ids, item.id] : ids.filter((id) => id !== item.id);
    });
  };

  const onRequest = (location: string) =>
    trackEvent('merch_request', {
      location,
      items: selected.map((i) => i.name).join(', ') || '(ingen valgt)',
      item_count: selected.length,
    });

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 py-[62px] font-['Inter',sans-serif]">
      {/* Heading */}
      <div className="flex flex-col items-start gap-2 mb-8">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[2px] text-[#E5B87E]">
          <Sparkles className="size-4" aria-hidden /> Merch
        </span>
        <h2 className="text-[30px] sm:text-[40px] font-extrabold leading-[1.1] text-white">
          Vis at du er <span className="text-[#E5B87E]">innafør</span>.
        </h2>
        <p className="max-w-[560px] text-[15px] sm:text-[16px] leading-[25px] text-[#aab1bb]">
          Svart som natta, gull som whisky. Plukk det du vil ha, så sender du en forespørsel på e-post. Noe selges, og
          innimellom gis det bort – følg med!
        </p>
      </div>

      {/* Hero */}
      <div className="grid md:grid-cols-[1.05fr_1fr] overflow-hidden rounded-3xl border border-[rgba(212,165,116,0.22)] bg-[linear-gradient(135deg,rgba(229,184,126,0.12),rgba(255,255,255,0.02)_45%,rgba(0,0,0,0)_100%)]">
        <div className="relative aspect-square md:aspect-auto md:min-h-[460px]">
          <img
            src={modelImg}
            alt="Kvinne i INNAFØR t-skjorte med hest på et jorde i solnedgang"
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/40" />
          <span className="absolute left-4 top-4 rounded-full bg-[#E5B87E] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[1.5px] text-black shadow-lg">
            Begrenset opplag
          </span>
        </div>
        <div className="flex flex-col justify-center gap-5 p-6 sm:p-10">
          <h3 className="text-[26px] sm:text-[32px] font-extrabold leading-[1.15] text-white">
            INNAFØR-kolleksjonen
          </h3>
          <ul className="flex flex-col gap-3 text-[15px] text-[#d1d5dc]">
            {[
              'T-skjorter, capser og handlenett med hatten og gull-logoen',
              'Småtteri: drikkeflasker, wonderbaum og klistremerker',
              'Bestilles enkelt på e-post – ingen nettbutikk, ingen kø',
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-[3px] flex size-5 shrink-0 items-center justify-center rounded-full bg-[rgba(229,184,126,0.15)] text-[#E5B87E]">
                  <Check className="size-3.5" aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="#merch-produkter"
              className="inline-flex items-center gap-2 rounded-full bg-[#E5B87E] px-6 py-3 text-[15px] font-bold text-black shadow-[0_10px_30px_-10px_rgba(229,184,126,0.7)] transition hover:bg-[#f0c890] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Se utvalget
            </a>
            <a
              href={buildMailto([])}
              onClick={() => trackEvent('merch_request', { location: 'hero', items: '(ingen valgt)', item_count: 0 })}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(229,184,126,0.45)] px-6 py-3 text-[15px] font-semibold text-[#E5B87E] transition hover:border-[#E5B87E] hover:bg-[rgba(229,184,126,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B87E]"
            >
              <Mail className="size-4" aria-hidden />
              Spør om merch
            </a>
          </div>
        </div>
      </div>

      {/* Main products */}
      {/* Mobile: swipeable row. Larger screens: grid */}
      <div
        id="merch-produkter"
        className="scroll-mt-6 mt-6 -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
      >
        {MAIN_ITEMS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <article
              key={item.id}
              className={`group flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-[rgba(255,255,255,0.02)] transition sm:w-auto ${
                isSelected ? 'border-[#E5B87E] shadow-[0_0_0_1px_#E5B87E]' : 'border-[rgba(212,165,116,0.18)] hover:border-[rgba(212,165,116,0.45)]'
              }`}
            >
              <div className="relative aspect-square overflow-hidden bg-black">
                <img
                  src={item.image}
                  alt={`INNAFØR ${item.name.toLowerCase()}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {item.tag && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[1px] text-[#E5B87E] backdrop-blur-sm">
                    {item.tag}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-[20px] font-bold text-white">{item.name}</h3>
                <p className="flex-1 text-[14px] leading-[21px] text-[#aab1bb]">{item.pitch}</p>
                <div>
                  <SelectButton selected={isSelected} onClick={() => toggle(item)} name={item.name} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Small items */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {SMALL_ITEMS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const Icon = item.icon!;
          return (
            <article
              key={item.id}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                isSelected ? 'border-[#E5B87E] bg-[rgba(229,184,126,0.06)]' : 'border-[rgba(212,165,116,0.18)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(212,165,116,0.45)]'
              }`}
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(229,184,126,0.35),rgba(229,184,126,0.08))] text-[#E5B87E]">
                <Icon className="size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-bold text-white">{item.name}</h3>
                <p className="text-[13px] leading-[18px] text-[#99a1af]">{item.pitch}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(item)}
                aria-pressed={isSelected}
                aria-label={isSelected ? `Fjern ${item.name} fra forespørselen` : `Legg ${item.name} til i forespørselen`}
                className={`flex size-10 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B87E] ${
                  isSelected
                    ? 'bg-[#E5B87E] text-black hover:bg-[#f0c890]'
                    : 'border border-[rgba(229,184,126,0.45)] text-[#E5B87E] hover:bg-[rgba(229,184,126,0.1)]'
                }`}
              >
                {isSelected ? <Check className="size-5" aria-hidden /> : <Plus className="size-5" aria-hidden />}
              </button>
            </article>
          );
        })}
      </div>

      {/* Request bar */}
      <div
        aria-live="polite"
        className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-[rgba(212,165,116,0.22)] bg-[rgba(12,10,8,0.6)] p-5"
      >
        <div className="flex-1 min-w-0">
          {selected.length === 0 ? (
            <>
              <p className="text-[15px] font-semibold text-white">Plukk det du vil ha</p>
              <p className="text-[13px] text-[#99a1af]">Trykk «Jeg vil ha» på produktene, så lager vi e-posten for deg.</p>
            </>
          ) : (
            <>
              <p className="text-[15px] font-semibold text-white">
                {selected.length} {selected.length === 1 ? 'produkt' : 'produkter'} i forespørselen
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggle(i)}
                    aria-label={`Fjern ${i.name}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[rgba(229,184,126,0.15)] px-3 py-1 text-[12px] font-semibold text-[#E5B87E] hover:bg-[rgba(229,184,126,0.25)]"
                  >
                    {i.name}
                    <X className="size-3.5" aria-hidden />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <a
          href={mailto}
          onClick={() => onRequest('request_bar')}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#E5B87E] px-6 py-3 text-[15px] font-bold text-black transition hover:bg-[#f0c890] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Mail className="size-4" aria-hidden />
          {selected.length ? 'Send forespørsel' : 'Send e-post'}
        </a>
      </div>
      <p className="mt-3 text-center text-[12px] text-[#6b7280]">
        Åpner e-postprogrammet ditt med en ferdig utfylt melding til {EMAIL}.
      </p>
    </div>
  );
}
