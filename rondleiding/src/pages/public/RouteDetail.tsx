import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { Button } from "../../app/components/ui/button";
import { locationService } from "../../services/locationService";
import { routeService } from "../../services/routeService";
import type { GuideRoute } from "../../types";

export function RouteDetail() {
    const { routeId } = useParams();
    const [route, setRoute] = useState<GuideRoute | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeStep, setActiveStep] = useState(0);

    // Handmatige TTS Status & Woord-index tracking
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const textScrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!routeId) {
            setError("route niet gevonden");
            setLoading(false);
            return;
        }

        Promise.all([routeService.getById(routeId), locationService.getAll()])
            .then(([result, locations]) => {
                const locationMap = new Map(
                    locations.map((location) => [location.id, location]),
                );
                const enrichedRoute: GuideRoute = {
                    ...result,
                    locations: result.locations?.map((step) => {
                        const location = locationMap.get(step.locationId);
                        return {
                            ...step,
                            locationName:
                                step.locationName || location?.name || "",
                            locationDescription:
                                step.locationDescription ||
                                location?.description ||
                                "",
                            imageUrl:
                                (location as any)?.imageUrl ||
                                "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1000&auto=format&fit=crop",
                        };
                    }),
                };

                setRoute(enrichedRoute);
                setActiveStep(0);
            })
            .catch((err) =>
                setError(
                    err instanceof Error ? err.message : "route laden mislukt",
                ),
            )
            .finally(() => setLoading(false));
    }, [routeId]);

    const orderedSteps = useMemo(
        () =>
            (route?.locations ?? []).slice().sort((a, b) => a.order - b.order),
        [route],
    );
    const currentStep = orderedSteps[activeStep];

    // Stop TTS en scroll terug naar boven zodra je naar een andere stap gaat
    useEffect(() => {
        stopSpeech();
        if (textScrollContainerRef.current) {
            textScrollContainerRef.current.scrollTop = 0;
        }
    }, [activeStep]);

    // Schoon de spraak op als de component unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Volledig betrouwbare native TTS afhandeling met boundary-tracking per woord
    const startSpeech = (text: string) => {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "nl-NL";
        utteranceRef.current = utterance;

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onboundary = (event) => {
            if (event.name === "word") {
                const textUpToBoundary = text.substring(0, event.charIndex);
                const wordsUpToBoundary = textUpToBoundary.trim().split(/\s+/);
                const wordCount =
                    textUpToBoundary.trim() === ""
                        ? 0
                        : wordsUpToBoundary.length;
                setCurrentWordIndex(wordCount);

                // OPTIONEEL: Automatisch de tekstcontainer meescrollen met de gesproken woorden
                const container = textScrollContainerRef.current;
                if (container) {
                    const wordsElements =
                        container.getElementsByClassName("tts-word");
                    const activeWordElement = wordsElements[
                        wordCount
                    ] as HTMLElement;
                    if (activeWordElement) {
                        container.scrollTo({
                            top:
                                activeWordElement.offsetTop -
                                container.clientHeight / 2,
                            behavior: "smooth",
                        });
                    }
                }
            }
        };

        utterance.onend = () => {
            resetSpeechState();
        };

        utterance.onerror = () => {
            resetSpeechState();
        };

        window.speechSynthesis.speak(utterance);
    };

    const pauseSpeech = () => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            setIsPlaying(false);
        }
    };

    const resumeSpeech = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
            setIsPaused(false);
        }
    };

    const stopSpeech = () => {
        window.speechSynthesis.cancel();
        resetSpeechState();
    };

    const resetSpeechState = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
    };

    const handleToggleSpeech = () => {
        if (isPlaying) {
            pauseSpeech();
            return;
        }
        if (isPaused) {
            resumeSpeech();
            return;
        }

        const spokenText = currentStep?.locationDescription?.trim() || "";
        if (spokenText) {
            startSpeech(spokenText);
        }
    };

    if (loading)
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans text-[#333333]">
                route laden...
            </div>
        );
    if (error)
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans text-[#C3071B] font-bold">
                {error}
            </div>
        );
    if (!route || orderedSteps.length === 0) return null;

    // Split de tekst van de HUIDIGE stap op in woorden
    const stepText =
        currentStep?.locationDescription ||
        "geen beschrijving toegevoegd aan deze stap.";
    const words = stepText.split(" ");

    return (
       <main className="relative flex h-[calc(100vh-97px)] flex-col overflow-hidden bg-[#004B98] font-sans text-[#333333] selection:bg-[#0064AD]/20"> {/* -97px zodat er geen scroll is, want met header is het anders groter dan het scherm (100vh) */}
            <section className="relative w-full h-[30vh] bg-neutral-900 overflow-hidden">
                {/* Sluitknop */}
                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="absolute top-6 right-6 z-20 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-md"
                >
                    <Link to="/routes">
                        <X className="size-6" />
                    </Link>
                </Button>

                <img
                    src={(currentStep as any)?.imageUrl}
                    alt={currentStep?.locationName}
                    className="h-full w-full object-cover transition-all duration-700 ease-in-out"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#004B98] via-transparent to-black/20 pointer-events-none" />
                <span className="roc-diagonal-overlay" />
                <span className="roc-diagonal-overlay-sm" />

                <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-between px-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                            setActiveStep((prev) => Math.max(0, prev - 1))
                        }
                        disabled={activeStep === 0}
                        className="inline-flex items-center justify-center text-white/95 hover:text-white hover:bg-white/10 rounded-[2mm] text-sm font-semibold gap-1 lowercase disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <ChevronLeft className="size-4" /> vorige
                    </Button>

                    <span className="text-xs text-white/95 font-sans truncate max-w-[140px] lowercase drop-shadow-md">
                        {route.name}
                    </span>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                            setActiveStep((prev) =>
                                Math.min(orderedSteps.length - 1, prev + 1),
                            )
                        }
                        disabled={activeStep >= orderedSteps.length - 1}
                        className="inline-flex items-center justify-center text-white/95 hover:text-white hover:bg-white/10 rounded-[2mm] text-sm font-semibold gap-1 lowercase disabled:opacity-40 disabled:pointer-events-none"
                    >
                        volgende <ChevronRight className="size-4" />
                    </Button>
                </div>
            </section>

            {/* ONDERSTE HELFT: Lyrics Sheet van de HUIDIGE stap */}
            <section className="relative flex h-[70vh] flex-col bg-gradient-to-b from-[#004B98] to-[#0064AD] pt-6 px-6 text-white shadow-[0_-15px_40px_rgba(0,0,0,0.3)] rounded-t-[32px] z-10 overflow-hidden">
                {/* Sleep-indicator bar */}
                <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/25" />

                {/* Info & TTS Control */}
                <div className="mb-4 flex items-end justify-between border-b border-white/10 pb-4">
                    <div>
                        <span className="font-sans text-xs font-bold tracking-widest text-[#FFF265] uppercase">
                            stap {activeStep + 1} van {orderedSteps.length}
                        </span>
                        <h1 className="font-sans text-xl font-bold text-white lowercase mt-0.5">
                            {currentStep?.locationName || "locatie"}
                        </h1>
                    </div>

                    <Button
                        type="button"
                        onClick={handleToggleSpeech}
                        className="h-14 w-14 rounded-full bg-[#E3001A] text-white hover:bg-[#C3071B] transition-transform hover:scale-105 shadow-lg flex items-center justify-center shrink-0"
                    >
                        {isPlaying ? (
                            <Pause className="size-6 fill-white" />
                        ) : (
                            <Play className="size-6 fill-white ml-1" />
                        )}
                    </Button>
                </div>

                {/* SCROLLBARE CONTAINER */}
<div
    ref={textScrollContainerRef}
    className="flex-1 overflow-y-auto py-4 scrollbar-none select-none relative"
    style={{
        maskImage:
            "linear-gradient(to bottom, white 85%, transparent 100%)",
        WebkitMaskImage:
            "linear-gradient(to bottom, white 85%, transparent 100%)",
    }}
                >
                    <div className="font-sans font-bold tracking-tight text-2xl md:text-3xl text-left lowercase transition-all duration-300">
                        <span className="flex flex-wrap gap-x-[0.23em] gap-y-2">
                            {words.map((word, wordIdx) => {
                                const isWordSpeaking =
                                    isPlaying && wordIdx === currentWordIndex;
                                const dynamicStyle = isPlaying
                                    ? isWordSpeaking
                                        ? "opacity-100 text-[#FFFFFF] scale-100"
                                        : "opacity-25 text-white/50"
                                    : "text-white opacity-100";

                                return (
                                    <span
                                        key={wordIdx}
                                        className={`tts-word inline-block transition-all duration-150 origin-left ${dynamicStyle}`}
                                    >
                                        {word}
                                    </span>
                                );
                            })}
                        </span>

                        {currentStep?.direction && (
                            <span className="block text-base font-normal font-sans text-white/80 mt-6 normal-case border-l-2 border-[#FFF265] pl-3">
                                ➔ {currentStep.direction}
                            </span>
                        )}
                    </div>
                </div>

                {/* OUDE NAVIGATIE BALK IS HIER VERWIJDERD */}
            </section>
        </main>
    );
}
