"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { LICENSE_TIERS } from "@/lib/licenseTiers";

type BeatPreview = {
  id: string;
  slug: string;
  title: string;
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  previewUrl: string;
};

type TabId = "beats" | "licenses";
type PackTheme = "dark" | "white";
type Stage = "carousel" | "focus" | "slicing" | "opening" | "deck";

type PackItem = {
  id: string;
  image: string;
  theme: PackTheme;
  tab: TabId;
};

type Props = {
  beats: BeatPreview[];
};

const RING_PACKS: PackItem[] = [
  { id: "dark-a", image: "/darkmagicianpack.png", theme: "dark", tab: "beats" },
  { id: "white-a", image: "/whitedragonpack.png", theme: "white", tab: "licenses" },
  { id: "dark-b", image: "/darkmagicianpack.png", theme: "dark", tab: "beats" },
  { id: "white-b", image: "/whitedragonpack.png", theme: "white", tab: "licenses" }
];

const DECK_BY_THEME: Record<PackTheme, string[]> = {
  dark: [],
  white: [
    "/dark-magician.jpeg",
    "/dark-magician-girl..webp",
    "/dark-magician.jpeg",
    "/dark-magician-girl..webp",
    "/dark-magician.jpeg"
  ]
};

export function DuelLanding({ beats }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("beats");
  const [menuOpen, setMenuOpen] = useState(false);

  const [stage, setStage] = useState<Stage>("carousel");
  const [ringRotation, setRingRotation] = useState(0);
  const [isRingDragging, setIsRingDragging] = useState(false);
  const [selectedPack, setSelectedPack] = useState<PackItem | null>(null);
  const [sliceProgress, setSliceProgress] = useState(0);
  const [deckCards, setDeckCards] = useState<string[]>([]);
  const [isDeckCycling, setIsDeckCycling] = useState(false);

  const ringDragRef = useRef({ active: false, moved: false, startX: 0, startRotation: 0, lastX: 0, lastTs: 0 });
  const ringVelocityRef = useRef(0);
  const ringGlideFrameRef = useRef<number | null>(null);
  const ringSnapFrameRef = useRef<number | null>(null);
  const ringSnapDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringRotationRef = useRef(0);

  const sliceDragRef = useRef({ active: false, startX: 0, startProgress: 0 });
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadedThemesRef = useRef<Set<PackTheme>>(new Set());

  const shellStyle = useMemo(
    () =>
      ({
        "--slice-progress": String(sliceProgress)
      }) as CSSProperties,
    [sliceProgress]
  );

  function normalizeAngle(deg: number) {
    return ((deg + 180) % 360 + 360) % 360 - 180;
  }

  function preloadDeckForTheme(theme: PackTheme) {
    if (preloadedThemesRef.current.has(theme)) return;
    preloadedThemesRef.current.add(theme);

    for (const src of DECK_BY_THEME[theme]) {
      const image = new Image();
      image.src = src;
    }
  }

  function stopRingGlide() {
    if (ringGlideFrameRef.current !== null) {
      cancelAnimationFrame(ringGlideFrameRef.current);
      ringGlideFrameRef.current = null;
    }
  }

  function stopRingSnap() {
    if (ringSnapFrameRef.current !== null) {
      cancelAnimationFrame(ringSnapFrameRef.current);
      ringSnapFrameRef.current = null;
    }
  }

  function clearRingSnapDelay() {
    if (ringSnapDelayRef.current) {
      clearTimeout(ringSnapDelayRef.current);
      ringSnapDelayRef.current = null;
    }
  }

  function snapRingToNearest(fromRotation: number) {
    const step = 360 / RING_PACKS.length;
    const nearestIndex = Math.round((-fromRotation) / step);
    const targetRaw = -nearestIndex * step;
    const delta = normalizeAngle(targetRaw - fromRotation);
    const target = fromRotation + delta;

    if (Math.abs(target - fromRotation) < 0.01) {
      ringRotationRef.current = target;
      setRingRotation(target);
      ringDragRef.current.moved = false;
      return;
    }

    stopRingSnap();
    const started = performance.now();
    const duration = 170;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / duration);
      const eased = easeOut(t);
      const next = fromRotation + (target - fromRotation) * eased;
      ringRotationRef.current = next;
      setRingRotation(next);
      if (t >= 1) {
        ringSnapFrameRef.current = null;
        ringDragRef.current.moved = false;
        return;
      }
      ringSnapFrameRef.current = requestAnimationFrame(tick);
    };

    ringSnapFrameRef.current = requestAnimationFrame(tick);
  }

  function resetToCarousel() {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }

    stopRingGlide();
    clearRingSnapDelay();
    stopRingSnap();
    ringVelocityRef.current = 0;
    ringDragRef.current.moved = false;
    setIsRingDragging(false);

    ringRotationRef.current = 0;
    setRingRotation(0);
    setStage("carousel");
    setSelectedPack(null);
    setSliceProgress(0);
    setDeckCards([]);
    setActiveTab("beats");
    setMenuOpen(false);
    setIsDeckCycling(false);
  }

  function packLabelFor(pack: PackItem) {
    return pack.tab === "beats" ? "Beats" : "Kits";
  }

  function startRingDrag(clientX: number) {
    if (stage !== "carousel") return;
    stopRingGlide();
    clearRingSnapDelay();
    stopRingSnap();
    ringVelocityRef.current = 0;
    const now = performance.now();
    ringDragRef.current = {
      active: true,
      moved: false,
      startX: clientX,
      startRotation: ringRotationRef.current,
      lastX: clientX,
      lastTs: now
    };
    setIsRingDragging(true);
  }

  function moveRingDrag(clientX: number) {
    if (!ringDragRef.current.active || stage !== "carousel") return;

    const deltaX = clientX - ringDragRef.current.startX;
    const target = ringDragRef.current.startRotation + deltaX * 0.35;
    setRingRotation((prev) => {
      const next = prev + (target - prev) * 0.52;
      ringRotationRef.current = next;
      return next;
    });

    if (Math.abs(deltaX) > 6) ringDragRef.current.moved = true;

    const now = performance.now();
    const dt = Math.max(1, now - ringDragRef.current.lastTs);
    const dx = clientX - ringDragRef.current.lastX;
    const instantV = (dx / dt) * 0.35;
    ringVelocityRef.current = ringVelocityRef.current * 0.6 + instantV * 0.4;
    ringDragRef.current.lastX = clientX;
    ringDragRef.current.lastTs = now;
  }

  function endRingDrag() {
    const wasDragging = ringDragRef.current.active;
    ringDragRef.current.active = false;
    setIsRingDragging(false);
    if (!wasDragging || stage !== "carousel") return;

    stopRingGlide();
    clearRingSnapDelay();

    let velocity = ringVelocityRef.current;
    let lastTs = performance.now();

    const glide = (now: number) => {
      const dt = now - lastTs;
      lastTs = now;
      velocity *= 0.9;

      setRingRotation((prev) => {
        const next = prev + velocity * dt * 0.55;
        ringRotationRef.current = next;
        return next;
      });

      if (Math.abs(velocity) < 0.003 || stage !== "carousel") {
        ringGlideFrameRef.current = null;
        ringSnapDelayRef.current = setTimeout(() => {
          snapRingToNearest(ringRotationRef.current);
          ringSnapDelayRef.current = null;
                        }, 100);
        return;
      }

      ringGlideFrameRef.current = requestAnimationFrame(glide);
    };

    ringGlideFrameRef.current = requestAnimationFrame(glide);
  }

  function choosePack(pack: PackItem) {
    if (stage !== "carousel") return;
    setSelectedPack(pack);
    setActiveTab(pack.tab);
    setSliceProgress(0);
    setDeckCards([]);
    setIsDeckCycling(false);
    preloadDeckForTheme(pack.theme);
    setStage("focus");
  }

  function handleRingPackClick(pack: PackItem, isFront: boolean) {
    if (stage !== "carousel") return;
    if (ringDragRef.current.active || ringDragRef.current.moved) {
      ringDragRef.current.moved = false;
      return;
    }
    if (!isFront) return;
    choosePack(pack);
  }

  function triggerPackOpen() {
    if (!selectedPack || stage === "opening" || stage === "deck") return;

    setSliceProgress(1);
    setStage("opening");
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    setIsDeckCycling(false);

    const nextDeck = [...DECK_BY_THEME[selectedPack.theme]];
    preloadDeckForTheme(selectedPack.theme);
    setDeckCards(nextDeck);

    openTimerRef.current = setTimeout(() => {
      setStage("deck");
    }, 70);
  }

  function startSliceDrag(clientX: number) {
    if (stage !== "focus" && stage !== "slicing") return;
    sliceDragRef.current = { active: true, startX: clientX, startProgress: sliceProgress };
    setStage("slicing");
  }

  function moveSliceDrag(clientX: number) {
    if (!sliceDragRef.current.active || (stage !== "slicing" && stage !== "focus")) return;
    const deltaX = clientX - sliceDragRef.current.startX;
    const next = Math.max(0, Math.min(1, sliceDragRef.current.startProgress + deltaX / 180));
    setSliceProgress(next);
    if (next >= 1) {
      sliceDragRef.current.active = false;
      triggerPackOpen();
    }
  }

  function endSliceDrag() {
    if (!sliceDragRef.current.active) return;
    sliceDragRef.current.active = false;
    if (sliceProgress < 1 && stage !== "opening" && stage !== "deck") {
      setSliceProgress(0);
      setStage("focus");
    }
  }

  function cycleDeckTopToBack() {
    if (deckCards.length < 2 || isDeckCycling) return;

    setIsDeckCycling(true);
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);

    cycleTimerRef.current = setTimeout(() => {
      setDeckCards((prev) => [...prev.slice(1), prev[0]]);
      setIsDeckCycling(false);
      cycleTimerRef.current = null;
    }, 240);
  }

  useEffect(() => {
    ringRotationRef.current = ringRotation;
  }, [ringRotation]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      stopRingGlide();
      clearRingSnapDelay();
      stopRingSnap();
    };
  }, []);

  const currentKitImage = deckCards[0] ?? "";
  const isGirlKit = currentKitImage.includes("girl");
  const kitTitle = isGirlKit ? "Dark Magician Girl Kit" : "Dark Magician Kit";
  const kitCheckoutSlug = isGirlKit ? "dark-magician-girl-kit" : "dark-magician-kit";

  return (
    <main className="duel-page">
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/websitebackground.mov" type="video/quicktime" />
      </video>

      <div className="top-brand" aria-hidden="false">
        <button type="button" className="top-brand-button" onClick={resetToCarousel} aria-label="Back to pack select">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/headerlogo.png" alt="Header logo" className="top-brand-logo" />
        </button>
      </div>

      {stage !== "carousel" ? (
        <button type="button" className="left-back-btn" onClick={resetToCarousel} aria-label="Back to packs">
          Back
        </button>
      ) : null}

      <button
        type="button"
        className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-label="Open menu"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/DARK.svg" alt="" className="menu-toggle-icon" aria-hidden="true" />
        <span className="menu-toggle-label">menu</span>
      </button>

      <div className={`menu-backdrop ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen} />

      <aside className={`menu-panel ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="menu-head">
          <strong>gambino.flp</strong>
          <button type="button" className="menu-close" onClick={() => setMenuOpen(false)}>
            Close
          </button>
        </div>
        <p className="menu-desc">Official beat website. Browse and purchase directly from the duel field</p>
        <Link
          href="/"
          onClick={() => {
            resetToCarousel();
            setMenuOpen(false);
          }}
        >
          Home
        </Link>
        <a href="http://instagram.com/gambino.flp" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href="https://www.youtube.com/@ogambi11" target="_blank" rel="noreferrer">
          YouTube
        </a>
        <hr />
        {beats
          .filter((beat) => beat.title !== "Golden Window" && beat.title !== "Midnight Asphalt")
          .map((beat) => (
            <Link href={`/checkout/${beat.slug}`} key={beat.id} onClick={() => setMenuOpen(false)}>
              {beat.title}
            </Link>
          ))}
      </aside>

      <section className="duel-field">
        {stage === "carousel" ? (
          <div
            className="pack-ring-scene"
            onMouseDown={(e) => startRingDrag(e.clientX)}
            onMouseMove={(e) => moveRingDrag(e.clientX)}
            onMouseUp={endRingDrag}
            onMouseLeave={endRingDrag}
            onTouchStart={(e) => {
              const t = e.touches[0];
              if (t) startRingDrag(t.clientX);
            }}
            onTouchMove={(e) => {
              const t = e.touches[0];
              if (t) moveRingDrag(t.clientX);
            }}
            onTouchEnd={endRingDrag}
            role="presentation"
          >
            <div className={`pack-ring ${isRingDragging ? "is-dragging" : ""}`} style={{ transform: `rotateY(${ringRotation}deg)` }}>
              {(() => {
                const step = 360 / RING_PACKS.length;
                let closestIdx = 0;
                let closestDist = Number.POSITIVE_INFINITY;
                for (let i = 0; i < RING_PACKS.length; i += 1) {
                  const dist = Math.abs(normalizeAngle(i * step + ringRotation));
                  if (dist < closestDist) {
                    closestDist = dist;
                    closestIdx = i;
                  }
                }

                return RING_PACKS.map((pack, index) => {
                  const angle = index * step;
                  const visible = normalizeAngle(angle + ringRotation);
                  const depth = Math.cos((visible * Math.PI) / 180);
                  const isFront = index === closestIdx;

                  return (
                    <button
                      key={pack.id}
                      type="button"
                      className={`ring-pack ${isFront ? "is-front" : ""}`}
                      style={{
                        transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(220px) scale(${0.84 + Math.max(0, depth) * 0.2})`,
                        zIndex: Math.round((depth + 1) * 50)
                      }}
                      onClick={() => handleRingPackClick(pack, isFront)}
                      aria-label={pack.theme === "dark" ? "Choose Dark Magician pack" : "Choose White Dragon pack"}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pack.image} alt="" className="ring-pack-image" draggable={false} />
                      <span className={"ring-pack-title " + (pack.tab === "beats" ? "is-beats" : "is-kits")}>{packLabelFor(pack)}</span>
                    </button>
                  );
                });
              })()}
            </div>
            <div className="swipe-hint" aria-hidden="true">
              <span className="swipe-hint-arrow">→</span>
              <span className="swipe-hint-text">swipe</span>
            </div>
          </div>
        ) : null}

        {selectedPack && (stage === "focus" || stage === "slicing" || stage === "opening") ? (
          <div className="pack-focus-stage">
            <div className={`selected-pack-shell ${stage === "opening" ? "is-opening" : ""}`} style={shellStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedPack.image} alt="Selected pack" className="selected-pack-image selected-pack-bottom" draggable={false} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedPack.image} alt="" className="selected-pack-image selected-pack-top" draggable={false} />

              {stage === "focus" || stage === "slicing" ? (
                <div
                  className="slice-zone"
                  onMouseDown={(e) => startSliceDrag(e.clientX)}
                  onMouseMove={(e) => moveSliceDrag(e.clientX)}
                  onMouseUp={endSliceDrag}
                  onMouseLeave={endSliceDrag}
                  onTouchStart={(e) => {
                    const t = e.touches[0];
                    if (t) startSliceDrag(t.clientX);
                  }}
                  onTouchMove={(e) => {
                    const t = e.touches[0];
                    if (t) moveSliceDrag(t.clientX);
                  }}
                  onTouchEnd={endSliceDrag}
                  role="presentation"
                >
                  <div className="slice-hint">
                    <span>Click + drag to slice</span>
                    <span className="slice-hint-arrow" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {stage === "deck" ? (
          <div className="deck-stage deck-stage-center">
            {selectedPack?.tab === "licenses" ? (
              <div className="kit-showcase">
                <button type="button" className="deck-stack" onClick={cycleDeckTopToBack} aria-label="Cycle deck">
                  {deckCards.map((img, index) => (
                    <span
                      key={`${img}-${index}-${deckCards.length}`}
                      className={"deck-item " + (index === 0 ? "is-top " : "") + (index === 0 && isDeckCycling ? "is-cycling" : "")}
                      style={{
                        zIndex: deckCards.length - index,
                        transform: `translateY(${index * 7}px) rotate(${index * 1.1}deg)`
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Deck card" className="deck-item-image" draggable={false} />
                    </span>
                  ))}
                </button>

                <aside className="kit-info-panel" aria-label="Kit details">
                  <h3>{kitTitle}</h3>
                  <p>
                    <strong>Description</strong>
                    <span>description here bla bla bla</span>
                  </p>
                  <Link href={`/checkout/${kitCheckoutSlug}`} className="kit-buy-btn">
                    <span>Buy Now!</span>
                    <small>$59.99</small>
                  </Link>
                </aside>
              </div>
            ) : (
              <div className="coming-soon-panel">Coming Soon..</div>
            )}
          </div>
        ) : null}
      </section>

      <div className="hidden-links" aria-hidden="true">
        {activeTab === "beats"
          ? beats.map((beat) => (
              <Link href={`/checkout/${beat.slug}`} key={beat.id}>
                {beat.title}
              </Link>
            ))
          : LICENSE_TIERS.map((tier) => <span key={tier.id}>{tier.name}</span>)}
      </div>
    </main>
  );
}
