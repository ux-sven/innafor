import { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Import alle galleribilder
import bobler from '../../imports/bobler_i_livet_4.jpg';
import bobler1 from '../../imports/bobler_i_livet_1.jpg';
import bobler2 from '../../imports/bobler_i_livet_2.jpg';
import cringe from '../../imports/cringe_3.jpg';
import cringe1 from '../../imports/cringe_1.jpg';
import img4765 from '../../imports/IMG_4765.JPG';
import img4775 from '../../imports/IMG_4775-1.JPG';
import img4776 from '../../imports/IMG_4776.JPG';
import img4779 from '../../imports/IMG_4779.JPG';
import nano1 from '../../imports/nano-banana-2026-02-03T13-03-39.png';
import nano2 from '../../imports/nano-banana-2026-02-03T13-05-44.png';
import nano3 from '../../imports/nano-banana-2026-02-18T17-27-31.png';
import nano4 from '../../imports/nano-banana-2026-03-30T10-49-03.png';
import nano5 from '../../imports/nano-banana-2026-04-13T13-38-09.png';
import nano6 from '../../imports/nano-banana-2026-01-25T20-16-50.png';
import skjermbilde from '../../imports/Skjermbilde_2026-04-16_kl._15.20.52.png';

type LayoutType = 'square' | 'stacked' | 'portrait';

interface GalleryItem {
  type: LayoutType;
  images: { src: string; alt: string }[];
}

const GALLERY_HEIGHT = 400; // px
const GAP = 8; // px
const SPEED = 40; // px per second for the endless slide

const galleryItems: GalleryItem[] = [
  {
    type: 'square',
    images: [{ src: bobler, alt: 'Bobler i livet' }],
  },
  {
    type: 'stacked',
    images: [
      { src: cringe, alt: 'Cringe' },
      { src: img4765, alt: 'INNAFØR bilde 1' },
    ],
  },
  {
    type: 'portrait',
    images: [{ src: img4775, alt: 'INNAFØR bilde 2' }],
  },
  {
    type: 'square',
    images: [{ src: img4776, alt: 'INNAFØR bilde 3' }],
  },
  {
    type: 'portrait',
    images: [{ src: img4779, alt: 'INNAFØR bilde 4' }],
  },
  {
    type: 'stacked',
    images: [
      { src: nano1, alt: 'Nano Banana 1' },
      { src: nano2, alt: 'Nano Banana 2' },
    ],
  },
  {
    type: 'square',
    images: [{ src: nano3, alt: 'Nano Banana 3' }],
  },
  {
    type: 'portrait',
    images: [{ src: nano4, alt: 'Nano Banana 4' }],
  },
  {
    type: 'square',
    images: [{ src: bobler1, alt: 'Bobler i livet 1' }],
  },
  {
    type: 'portrait',
    images: [{ src: bobler2, alt: 'Bobler i livet 2' }],
  },
  {
    type: 'stacked',
    images: [
      { src: cringe1, alt: 'Cringe 1' },
      { src: nano5, alt: 'Nano Banana 5' },
    ],
  },
  {
    type: 'square',
    images: [{ src: nano6, alt: 'Nano Banana 6' }],
  },
  {
    type: 'portrait',
    images: [{ src: skjermbilde, alt: 'Skjermbilde' }],
  },
];

export function Gallery() {
  const renderItem = (item: GalleryItem, index: number) => {
    if (item.type === 'square') {
      // 1:1 format - hele høyden
      return (
        <div
          key={index}
          className="relative flex-shrink-0 rounded-xl overflow-hidden group cursor-pointer"
          style={{ width: GALLERY_HEIGHT, height: GALLERY_HEIGHT }}
        >
          <ImageWithFallback
            src={item.images[0].src}
            alt={item.images[0].alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      );
    }

    if (item.type === 'stacked') {
      // 2 x 1:1 format stablet vertikalt
      const stackedHeight = (GALLERY_HEIGHT - GAP) / 2;
      return (
        <div
          key={index}
          className="flex-shrink-0 flex flex-col gap-2"
          style={{ width: stackedHeight, height: GALLERY_HEIGHT }}
        >
          {item.images.map((img, i) => (
            <div
              key={i}
              className="relative flex-1 rounded-xl overflow-hidden group cursor-pointer"
            >
              <ImageWithFallback
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      );
    }

    if (item.type === 'portrait') {
      // 9:16 format - hele høyden
      const portraitWidth = (GALLERY_HEIGHT * 9) / 16;
      return (
        <div
          key={index}
          className="relative flex-shrink-0 rounded-xl overflow-hidden group cursor-pointer"
          style={{ width: portraitWidth, height: GALLERY_HEIGHT }}
        >
          <ImageWithFallback
            src={item.images[0].src}
            alt={item.images[0].alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      );
    }
  };

  // Measure one set of images so the loop speed stays constant regardless of content width
  const setRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(90);
  useEffect(() => {
    const el = setRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDuration(Math.max(20, el.offsetWidth / SPEED)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Two identical sets side by side; the track slides exactly one set width (-50%) and repeats.
  // Each set carries its own trailing gap (pr-3) so the seam is seamless.
  return (
    <div
      className="gallery-marquee w-full overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div className="gallery-track flex w-max" style={{ animationDuration: `${duration}s` }}>
        <div ref={setRef} className="flex gap-3 pr-3">
          {galleryItems.map((item, index) => renderItem(item, index))}
        </div>
        <div className="flex gap-3 pr-3" aria-hidden="true">
          {galleryItems.map((item, index) => renderItem(item, index))}
        </div>
      </div>

      <style>{`
        @keyframes gallery-slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .gallery-track {
          animation: gallery-slide linear infinite;
          will-change: transform;
        }
        .gallery-marquee:hover .gallery-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .gallery-marquee { overflow-x: auto; }
          .gallery-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
