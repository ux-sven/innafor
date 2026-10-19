import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Gallery } from './components/Gallery';
import { InnaforLogo } from './components/InnaforLogo';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import artistImg from '../imports/InnaforHomepageDesign/d7ee5821065e09df4529c5911acbd902b14e91c7.png';
import svgPaths from '../imports/InnaforHomepageDesign/svg-i4i7dcnf9a';

const ARTIST_ID = '6ZDSgSuMbJKVg91ZZL3tx6';

interface Album {
  id: string;
  name: string;
  release_date: string;
  album_type: string;
  total_tracks: number;
  images: { url: string; height: number; width: number }[];
  external_urls: { spotify: string };
  artists: { name: string }[];
}

// Social Media Icon Components
function SocialIcon({ path, label }: { path: string; label: string }) {
  return (
    <div className="bg-[rgba(0,0,0,0.3)] content-stretch flex items-center justify-center p-[13px] relative rounded-[24px] shrink-0">
      <div aria-hidden className="absolute border border-[rgba(212,165,116,0.2)] border-solid inset-0 pointer-events-none rounded-[24px]" />
      <div className="relative shrink-0 size-[24px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g>
            <path d={path} stroke="#D4A574" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function SocialMediaLinks() {
  const socialLinks = [
    { url: 'https://www.facebook.com/artistenInnafor', path: svgPaths.p3d19f300, label: 'Facebook' },
    { url: 'https://www.instagram.com/artisten_innafor', path: svgPaths.p4fdb300, label: 'Instagram' },
    { url: 'https://www.tiktok.com/@artisten.innafor', path: svgPaths.pa3f2f80, label: 'TikTok' },
    { url: 'https://snapchat.com/t/cCzNyDBB', path: svgPaths.p1023c700, label: 'Snapchat' },
    { url: 'https://www.threads.com/@artisten_innafor', path: svgPaths.p2eea8bc0, label: 'Threads' },
  ];

  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0">
      {socialLinks.map((link) => (
        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
          <SocialIcon path={link.path} label={link.label} />
        </a>
      ))}
    </div>
  );
}

// Navigation Menu
function Navigation() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex font-['Quicksand',sans-serif] font-bold items-start justify-between leading-normal px-[64px] relative size-full text-[#e7ab38] text-[16px] whitespace-nowrap">
          <p className="relative shrink-0">OM INNAFØR</p>
          <p className="relative shrink-0">LYTT</p>
          <p className="relative shrink-0">UTGIVELSER</p>
          <p className="relative shrink-0">GALLERI</p>
          <p className="relative shrink-0">KONTAKT</p>
        </div>
      </div>
    </div>
  );
}

// Hero Section
function HeroSection() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center max-w-[800px] py-[62px] px-4 relative shrink-0 w-full">
      <SocialMediaLinks />
      <Navigation />

      {/* Image + Logo */}
      <div className="content-center flex flex-wrap gap-[32px] items-center relative shrink-0 w-full">
        <div className="h-[408px] relative rounded-br-[24px] rounded-tl-[24px] shrink-0 w-[339px]">
          <ImageWithFallback
            src={artistImg}
            alt="INNAFØR artist"
            className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-br-[24px] rounded-tl-[24px] size-full"
          />
        </div>
        <InnaforLogo />
      </div>

      {/* Biography */}
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <div className="font-['Quicksand',sans-serif] font-medium leading-[29.25px] relative shrink-0 text-[#d1d5dc] text-[18px] w-full">
          <p>INNAFØR er musikken til Sven fra Bamble i Telemark – en låtskriver med hjerte i norsk country, bygderock og festmusikk. Med én fot i bygda og én i Oslo skrives det tekster om livet slik det faktisk er – ofte med humor og ironi, men alltid med en tvist av alvor innimellom. Kunstig intelligens brukes som et musikalsk verktøy for å gi låtene det lydbildet og uttrykket de fortjener. Enten det handler om prosecco-filosofi, påtvungen dugnadsfrivillighet, solbrenthet eller kjærlighet som kanskje ikke gikk så bra – målet er alltid det samme: å være innenfor, men akkurat på kanten.</p>
        </div>
      </div>
    </div>
  );
}

// Spotify Listen Section
function SpotifySection() {
  return (
    <div className="bg-[rgba(212,165,116,0.16)] content-stretch flex flex-col items-center relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-start max-w-[800px] py-[62px] px-4 relative rounded-[16px] shrink-0 w-full">
        {/* Header */}
        <div className="content-stretch flex items-center justify-between relative w-full mb-6">
          <div className="flex gap-[12px] items-center">
            <div className="relative shrink-0 size-[32px]">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                <g clipPath="url(#clip0_8_91)">
                  <path d={svgPaths.p1b662a00} fill="#E5B87E" />
                </g>
                <defs>
                  <clipPath id="clip0_8_91">
                    <rect fill="white" height="32" width="32" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <p className="font-['Inter',sans-serif] font-bold leading-[36px] text-[#e5b87e] text-[30px] tracking-[0.3955px] whitespace-nowrap">Lytt på Spotify</p>
          </div>
          <a
            href={`https://open.spotify.com/artist/${ARTIST_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1db954] hover:bg-[#1ed760] h-[48px] px-6 flex items-center justify-center relative rounded-full shrink-0 transition-colors"
          >
            <p className="font-['Inter',sans-serif] font-semibold leading-[24px] text-white text-[16px] tracking-[-0.3125px] whitespace-nowrap">Følg på Spotify</p>
          </a>
        </div>

        {/* Spotify Embed */}
        <div className="relative w-full">
          <iframe
            src={`https://open.spotify.com/embed/artist/${ARTIST_ID}?utm_source=generator&theme=0`}
            width="100%"
            height="500"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-[10px]"
          />
        </div>
      </div>
    </div>
  );
}

// Latest Releases Section
function LatestReleasesSection({ albums, loading }: { albums: Album[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[32px] items-center max-w-[800px] py-[62px] px-4 relative shrink-0 w-full">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5B87E]" />
          </div>
        </div>
      </div>
    );
  }

  if (albums.length === 0) {
    return null;
  }

  const latestAlbum = albums[0];
  const olderAlbums = albums.slice(1, 10);

  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[32px] items-center max-w-[800px] py-[62px] px-4 relative shrink-0 w-full">
        <h2 className="font-['Inter',sans-serif] font-bold leading-[32px] text-[#e5b87e] text-[24px] tracking-[0.0703px] self-start">SISTE UTGIVELSER</h2>

        {/* Featured Latest Release */}
        <div className="bg-[rgba(0,0,0,0.2)] relative rounded-[14px] shrink-0 w-full border border-[rgba(212,165,116,0.2)] p-[25px]">
          <div className="flex gap-[24px] items-start">
            <img
              src={latestAlbum.images[0]?.url}
              alt={latestAlbum.name}
              className="w-[192px] h-[192px] rounded-[10px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] object-cover"
            />

            <div className="flex-1 flex flex-col justify-between h-[192px]">
              <div>
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] text-[#e5b87e] text-[12px] tracking-[0.6px] uppercase mb-2">
                  {latestAlbum.album_type === 'single' ? 'Singel' : 'Album'} • {new Date(latestAlbum.release_date).toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h3 className="font-['Inter',sans-serif] font-bold leading-[36px] text-white text-[30px] tracking-[0.3955px] mb-2">{latestAlbum.name}</h3>
                <p className="font-['Inter',sans-serif] font-normal leading-[24px] text-[#99a1af] text-[16px] tracking-[-0.3125px]">
                  {latestAlbum.total_tracks} {latestAlbum.total_tracks === 1 ? 'låt' : 'låter'}
                </p>
              </div>

              <a
                href={latestAlbum.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1db954] hover:bg-[#1ed760] flex gap-[8px] items-center px-[24px] py-[12px] rounded-full transition-colors w-fit"
              >
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <p className="font-['Inter',sans-serif] font-semibold leading-[24px] text-white text-[16px] tracking-[-0.3125px] whitespace-nowrap">Lytt på Spotify</p>
              </a>
            </div>
          </div>
        </div>

        {/* Older Releases Grid */}
        {olderAlbums.length > 0 && (
          <div className="w-full">
            <h3 className="font-['Inter',sans-serif] font-semibold leading-[28px] text-[#e5b87e] text-[20px] tracking-[-0.4492px] mb-4">Tidligere utgivelser</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {olderAlbums.map((album) => (
                <a
                  key={album.id}
                  href={album.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-[10px] mb-2">
                    <img
                      src={album.images[0]?.url}
                      alt={album.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="font-['Inter',sans-serif] font-medium leading-[20px] text-white text-[14px] tracking-[-0.1504px] truncate group-hover:text-[#E5B87E] transition-colors">{album.name}</p>
                  <p className="font-['Inter',sans-serif] font-normal leading-[16px] text-[#99a1af] text-[12px]">{new Date(album.release_date).getFullYear()}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* See all songs link */}
        <div className="w-full text-center">
          <a
            href={`https://open.spotify.com/artist/${ARTIST_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex gap-[8px] items-center text-[#d4a574] hover:text-[#E5B87E] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <g clipPath="url(#clip0_38_278)">
                <path d={svgPaths.p313c0100} />
              </g>
              <defs>
                <clipPath id="clip0_38_278">
                  <rect fill="white" height="20" width="20" />
                </clipPath>
              </defs>
            </svg>
            <p className="font-['Inter',sans-serif] font-normal leading-[20px] text-[14px] tracking-[-0.1504px]">Se alle sangene</p>
          </a>
        </div>
      </div>
    </div>
  );
}

// Footer
function Footer() {
  return (
    <div className="bg-[rgba(0,0,0,0.2)] content-stretch flex flex-col items-start pt-px relative shrink-0 w-full border-t border-[rgba(212,165,116,0.2)]">
      <div className="max-w-[800px] relative shrink-0 w-full mx-auto">
        <div className="flex flex-row justify-center max-w-[inherit] size-full">
          <div className="content-stretch flex items-center justify-between max-w-[inherit] px-[16px] py-[32px] relative size-full">
            {/* Contact */}
            <div className="flex flex-col gap-2">
              <p className="font-['Inter',sans-serif] font-normal leading-[24px] text-[#99a1af] text-[16px] tracking-[-0.3125px] text-center">Kontakt meg</p>
              <a
                href="mailto:artisten.innafor@gmail.com"
                className="flex gap-[8px] items-center text-[#d4a574] hover:text-[#E5B87E] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                  <g>
                    <path d={svgPaths.pd919a80} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d={svgPaths.p189c1170} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  </g>
                </svg>
                <p className="font-['Inter',sans-serif] font-normal leading-[24px] text-[16px] tracking-[-0.3125px]">artisten.innafor@gmail.com</p>
              </a>
            </div>

            {/* Buy Me a Coffee */}
            <a
              href="https://buymeacoffee.com/innafor"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FFDD00] hover:bg-[#FFED4E] drop-shadow-[0px_10px_7.5px_rgba(0,0,0,0.1),0px_4px_3px_rgba(0,0,0,0.1)] rounded-[10px] transition-colors"
            >
              <div className="flex gap-[8px] items-center px-[24px] py-[12px]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                  <g>
                    <path d="M8.33333 1.66667V3.33333" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d="M11.6667 1.66667V3.33333" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d={svgPaths.p9daf320} stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d="M5 1.66667V3.33333" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  </g>
                </svg>
                <p className="font-['Inter',sans-serif] font-semibold leading-[24px] text-black text-[16px] tracking-[-0.3125px] whitespace-nowrap">Buy me a coffee</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const albumsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ae52fa22/artist/${ARTIST_ID}/albums`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
        );

        if (albumsResponse.ok) {
          const albumsData = await albumsResponse.json();
          if (albumsData.items && albumsData.items.length > 0) {
            const sortedAlbums = [...albumsData.items].sort((a, b) => {
              const dateA = new Date(a.release_date || '1970-01-01');
              const dateB = new Date(b.release_date || '1970-01-01');
              return dateB.getTime() - dateA.getTime();
            });
            setAlbums(sortedAlbums);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="bg-[#020202] content-stretch flex flex-col items-center justify-end relative min-h-screen w-full">
      <HeroSection />
      <SpotifySection />
      <LatestReleasesSection albums={albums} loading={loading} />
      <div className="py-[32px] w-full">
        <Gallery />
      </div>
      <Footer />
    </div>
  );
}
