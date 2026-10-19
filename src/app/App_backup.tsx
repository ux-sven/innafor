import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Gallery } from './components/Gallery';
import artistImg from '../imports/Frame1/d7ee5821065e09df4529c5911acbd902b14e91c7.png';
import logoPng from '../imports/INNAF_R_LOGO_3x.png';
import { Facebook, Instagram, Music2, MessageCircle, AtSign, Mail, Coffee } from 'lucide-react';

const ARTIST_ID = '6ZDSgSuMbJKVg91ZZL3tx6';

// Fallback data hvis Spotify API feiler
const FALLBACK_ALBUMS: Album[] = [
  {
    id: "4Qp2TC0uMnqMSzAogoMN9t",
    name: "Stathellegutt (75 års jubileum Edition)",
    release_date: "2026-05-30",
    album_type: "single",
    total_tracks: 1,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b2732720db104300ccbe1cc6685c", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/4Qp2TC0uMnqMSzAogoMN9t" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "04EnE3cEMuWxG7YWpQFAU8",
    name: "Det var deg",
    release_date: "2026-05-27",
    album_type: "single",
    total_tracks: 1,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b273722bd91abd28792d99d1b3f8", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/04EnE3cEMuWxG7YWpQFAU8" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "054onU0b6zrxP0Ok0mXNL6",
    name: "Oss for evig",
    release_date: "2026-05-15",
    album_type: "single",
    total_tracks: 1,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b273ab22c6d81eb4d814eec47c03", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/054onU0b6zrxP0Ok0mXNL6" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "7vHYpcTMxCrFx9gL2IPzG2",
    name: "Endelig helg",
    release_date: "2026-04-30",
    album_type: "single",
    total_tracks: 2,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b2732563fbb1e104e58b5d4d8409", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/7vHYpcTMxCrFx9gL2IPzG2" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "0YdHtIF6uEvPJr47vSjMa6",
    name: "Dugnad",
    release_date: "2026-04-23",
    album_type: "single",
    total_tracks: 3,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b27328ef32575d7d9086d070e2a9", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/0YdHtIF6uEvPJr47vSjMa6" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "01lR9srXD6fennCPzWe9pE",
    name: "Bobler i livet",
    release_date: "2026-04-16",
    album_type: "single",
    total_tracks: 1,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b273251b7c573524f2b592e31f75", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/01lR9srXD6fennCPzWe9pE" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "0YgzuHgZPlKnamszgjGog7",
    name: "Helt utafør remixes",
    release_date: "2026-03-25",
    album_type: "album",
    total_tracks: 12,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b27397cc99f52c5b25382d4ace7b", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/0YgzuHgZPlKnamszgjGog7" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "0o7fNBoeYGDU6DtdnSy8Qv",
    name: "Vårslipp",
    release_date: "2026-03-27",
    album_type: "single",
    total_tracks: 1,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b273934ab803a35874c4bd4a3d34", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/0o7fNBoeYGDU6DtdnSy8Qv" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "4mrysenmHFqYg6bRA2dcWn",
    name: "#cringe",
    release_date: "2026-03-23",
    album_type: "single",
    total_tracks: 1,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b273d27158f492685a45ad4bd6f4", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/4mrysenmHFqYg6bRA2dcWn" },
    artists: [{ name: "INNAFØR" }]
  },
  {
    id: "0mlct076HR9Me7ipeZEExy",
    name: "Runder i Rauland",
    release_date: "2026-02-27",
    album_type: "single",
    total_tracks: 1,
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b2737ad16bb2103b9c46cb7339cb", height: 640, width: 640 }
    ],
    external_urls: { spotify: "https://open.spotify.com/album/0mlct076HR9Me7ipeZEExy" },
    artists: [{ name: "INNAFØR" }]
  }
];

interface ArtistData {
  name: string;
  genres?: string[];
  followers?: { total: number };
  popularity?: number;
  images: { url: string }[];
}

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

// Logo component
function InnaforLogo() {
  return (
    <div className="flex justify-center">
      <img src={logoPng} alt="INNAFØR logo" className="h-[120px] w-auto" />
    </div>
  );
}

// Social Media Links Component
function SocialMediaLinks() {
  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/artistenInnafor',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/artisten_innafor',
      icon: Instagram,
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@artisten.innafor',
      icon: Music2,
    },
    {
      name: 'Snapchat',
      url: 'https://snapchat.com/t/cCzNyDBB',
      icon: MessageCircle,
    },
    {
      name: 'Threads',
      url: 'https://www.threads.com/@artisten_innafor',
      icon: AtSign,
    },
  ];

  return (
    <div className="py-6">
      <p className="text-sm text-gray-500 text-center mb-4">
        Følg INNAFØR på sosiale medier
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-16 h-16 bg-black/30 rounded-full transition-all duration-300 hover:scale-110 hover:bg-black/50 border border-[rgba(212,165,116,0.2)] hover:border-[rgba(212,165,116,0.5)]"
              aria-label={social.name}
            >
              <Icon
                className="w-8 h-8 text-[#D4A574] group-hover:text-[#E5B87E] transition-colors duration-300"
                strokeWidth={1.5}
              />
              <span className="absolute -bottom-8 text-xs text-[#D4A574] group-hover:text-[#E5B87E] transition-colors whitespace-nowrap">
                {social.name}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t border-[rgba(212,165,116,0.2)] bg-black/20">
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Buy Me a Coffee */}
          <a
            href="https://buymeacoffee.com/innafor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFDD00] hover:bg-[#FFED4E] text-black font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Coffee className="w-5 h-5" />
            <span>Buy me a coffee</span>
          </a>

          {/* Contact */}
          <div className="text-center">
            <p className="text-gray-400 mb-3">Kontakt meg</p>
            <a
              href="mailto:artisten.innafor@gmail.com"
              className="inline-flex items-center gap-2 text-[#D4A574] hover:text-[#E5B87E] transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>artisten.innafor@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Hent artist info
        const artistResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ae52fa22/artist/${ARTIST_ID}`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
        );

        if (artistResponse.ok) {
          const artistData = await artistResponse.json();
          if (!artistData.followers) artistData.followers = { total: 0 };
          setArtist(artistData);
        }

        // Hent albums og singles
        const albumsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ae52fa22/artist/${ARTIST_ID}/albums`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
        );

        if (albumsResponse.ok) {
          const albumsData = await albumsResponse.json();
          console.log('Albums response:', albumsData);
          if (albumsData.items && albumsData.items.length > 0) {
            // Sorter etter release_date (nyeste først) for å sikre at siste utgivelse vises først
            const sortedAlbums = [...albumsData.items].sort((a, b) => {
              const dateA = new Date(a.release_date || '1970-01-01');
              const dateB = new Date(b.release_date || '1970-01-01');
              return dateB.getTime() - dateA.getTime();
            });
            setAlbums(sortedAlbums);
            console.log('Loaded albums from API:', sortedAlbums.length);
          } else {
            console.warn('No albums in response, using fallback');
            setAlbums(FALLBACK_ALBUMS);
          }
        } else {
          const errorText = await albumsResponse.text();
          console.error('Failed to fetch albums:', albumsResponse.status, errorText);
          console.log('Using fallback album data');
          setAlbums(FALLBACK_ALBUMS);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        console.log('Using fallback album data due to error');
        setAlbums(FALLBACK_ALBUMS);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-[#d1d5dc]">
      {/* Hero Section */}
      <div className="max-w-[800px] mx-auto px-4 py-16 space-y-8">
        {/* Logo */}
        <InnaforLogo />

        {/* Bio + Image */}
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex-1 min-w-[300px] space-y-6 font-['Quicksand',sans-serif] font-medium text-lg leading-relaxed">
            <p>INNAFØR er norsk country, bygderock og festmusikk med en leken og ironisk vri. Mannen bak er en kar fra Bamble i Telemark, med store deler av livet tilbrakt i Oslo – og med én fot stødig plantet i begge verdener.</p>
            <p>Med tekster hentet fra hverdagslivet, bygdekulturen og det moderne Norge lager INNAFØR musikk som får folk til å både le og synge med – enten det handler om prosecco-filosofi, påtvungen dugnadsfrivillighet eller kjærlighet som kanskje ikke var så vellykket likevel.</p>
            <p>Tekstene skrives for hånd, mens kunstig intelligens brukes til å gi musikken liv. Målet er alltid det samme: å være innenfor – men akkurat på kanten.</p>
          </div>

          <div className="relative">
            <ImageWithFallback
              src={artistImg}
              alt="INNAFØR artist"
              className="w-[339px] h-[408px] object-cover rounded-br-3xl rounded-tl-3xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Spotify Section */}
      <div className="max-w-[800px] mx-auto px-4 pb-16 space-y-8">
        {/* Social Media Links */}
        <SocialMediaLinks />

        <section className="rounded-2xl p-8 relative overflow-hidden bg-gradient-to-br from-[rgba(212,165,116,0.15)] to-transparent">
          <div className="absolute border border-[rgba(212,165,116,0.3)] inset-0 pointer-events-none rounded-2xl" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-3xl font-bold text-[#E5B87E]">Lytt på Spotify</h2>
            <a
              href={`https://open.spotify.com/artist/${ARTIST_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold rounded-full transition-all"
            >
              Følg på Spotify
            </a>
          </div>

          {/* Spotify Embed Player */}
          <div className="relative z-10 mb-6">
            <iframe
              src={`https://open.spotify.com/embed/artist/${ARTIST_ID}?utm_source=generator&theme=0`}
              width="100%"
              height="380"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
            />
          </div>

          {artist && (
            <div className="mt-6 flex flex-wrap gap-4 justify-center relative z-10">
              {artist.popularity !== undefined && artist.popularity > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-full">
                  <span className="text-sm text-gray-300">Popularitet: <span className="text-[#E5B87E] font-semibold">{artist.popularity}/100</span></span>
                </div>
              )}
              {artist.followers && artist.followers.total > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-full">
                  <span className="text-sm text-gray-300">Følgere: <span className="text-[#E5B87E] font-semibold">{artist.followers.total.toLocaleString()}</span></span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Latest Releases */}
        <section className="rounded-2xl p-8 relative overflow-hidden bg-gradient-to-br from-[rgba(212,165,116,0.15)] to-transparent">
          <div className="absolute border border-[rgba(212,165,116,0.3)] inset-0 pointer-events-none rounded-2xl" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <h2 className="text-2xl font-bold text-[#E5B87E]">SISTE UTGIVELSER</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 relative z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5B87E]" />
            </div>
          ) : albums.length > 0 && albums[0].images && albums[0].images.length > 0 ? (
            <div className="relative z-10 space-y-8">
              {/* Siste utgivelse - fremhevet */}
              <div className="p-6 rounded-xl bg-black/20 border border-[rgba(212,165,116,0.2)]">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={albums[0].images[0]?.url}
                    alt={albums[0].name}
                    className="w-48 h-48 rounded-lg shadow-xl object-cover"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#E5B87E] uppercase tracking-wider mb-2">
                        {albums[0].album_type === 'single' ? 'Singel' : 'Album'} • {new Date(albums[0].release_date).toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <h3 className="text-3xl font-bold text-white mb-2">{albums[0].name}</h3>
                      <p className="text-gray-400">{albums[0].total_tracks} {albums[0].total_tracks === 1 ? 'låt' : 'låter'}</p>
                    </div>
                    <a
                      href={albums[0].external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold rounded-full transition-all mt-4 w-fit"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Lytt på Spotify
                    </a>
                  </div>
                </div>
              </div>

              {/* Øvrige utgivelser */}
              {albums.length > 1 && (
                <div>
                  <h3 className="text-xl font-semibold text-[#E5B87E] mb-4">Tidligere utgivelser</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {albums.slice(1).map((album) => (
                      <a
                        key={album.id}
                        href={album.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                      >
                        <div className="relative overflow-hidden rounded-lg mb-2">
                          <img
                            src={album.images[0]?.url}
                            alt={album.name}
                            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-white truncate group-hover:text-[#E5B87E] transition-colors">{album.name}</p>
                        <p className="text-xs text-gray-400">{new Date(album.release_date).getFullYear()}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Se alle sangene lenke */}
              <div className="text-center mt-8">
                <a
                  href={`https://open.spotify.com/artist/${ARTIST_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#D4A574] hover:text-[#E5B87E] transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Se alle sangene
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 relative z-10">
              <p className="text-gray-400">Ingen utgivelser tilgjengelig</p>
            </div>
          )}
        </section>
      </div>

      {/* Image Gallery - Full width */}
      <div className="py-8">
        <Gallery />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}