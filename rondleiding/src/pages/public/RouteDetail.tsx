import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../../app/components/ui/button";
import { locationService } from "../../services/locationService";
import { analyticsService } from "../../services/analyticsService";
import { routeService } from "../../services/routeService";
import type { GuideRoute, Location } from "../../types";

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1000&auto=format&fit=crop";
const STEP_TRANSITION = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

interface EnrichedStep {
    id: string; 
    locationId: string;
    order: number;
    locationName: string;
    locationDescription: string;
    imageUrl: string;
    direction?: string;
    estimatedMinutes?: number;
}

export function RouteDetail() {
    const { routeId } = useParams();
    const [route, setRoute] = useState<GuideRoute | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeStep, setActiveStep] = useState(0);
    const [stepDirection, setStepDirection] = useState(1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const textScrollContainerRef = useRef<HTMLDivElement>(null);

    // Data laden met async/await voor betere foutafhandeling en gegarandeerde logs
    useEffect(() => {
        async function fetchAndEnrichData() {
            if (!routeId) {
                setError("route niet gevonden");
                setLoading(false);
                return;
            }

            try {
                const [rawRoute, allLocations] = await Promise.all([
                    routeService.getById(routeId),
                    locationService.getAll()
                ]);

                const locationMap = new Map<string, Location>(
                    allLocations.map((loc) => [loc.id, loc])
                );

                // Mappen en verrijken
                const enrichedLocations = (rawRoute.locations || []).map((step: any, index: number) => {
                    const linkedLocation = locationMap.get(step.locationId);

                    // Precedentie bepalen
                    const finalImageUrl = step.imageUrl || linkedLocation?.imageUrl || FALLBACK_IMAGE_URL;

                    return {
                        ...step,
                        locationName: step.locationName || linkedLocation?.name || `Stap ${index + 1}`,
                        locationDescription: step.locationDescription || linkedLocation?.description || "",
                        imageUrl: finalImageUrl,
                    };
                });

                const enrichedRoute = {
                    ...rawRoute,
                    locations: enrichedLocations
                } as unknown as GuideRoute;

                setRoute(enrichedRoute);
            } catch (err) {
                console.error("CRASH TIJDENS DATA LADEN:", err);
                setError(err instanceof Error ? err.message : "Route laden mislukt");
            } finally {
                setLoading(false);
            }
        }

        fetchAndEnrichData();
    }, [routeId]);

    // Sorteer de stappen
    const orderedSteps = useMemo(() => {
        if (!route || !route.locations) return [];
        return (route.locations as unknown as EnrichedStep[])
            .slice()
            .sort((a, b) => a.order - b.order);
    }, [route]);
    
    // Huidige stap bepalen
    const currentStep = useMemo(() => {
        if (orderedSteps.length === 0 || activeStep >= orderedSteps.length) return null;
        return orderedSteps[activeStep];
    }, [orderedSteps, activeStep]);

    // Effect bij wisselen van stap (voor TTS en scrollen)
    useEffect(() => {
        stopSpeech();
        if (textScrollContainerRef.current) {
            textScrollContainerRef.current.scrollTop = 0;
        }
    }, [activeStep]);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const detectLanguage = (textToDetect: string): "en" | "nl" => {
        const t = textToDetect.toLowerCase();

        // Simple heuristiek voor NL/EN (goed genoeg voor korte step-descriptions)
        const enSignals = [
            // common short english words
            " the ", " and ", " you ", " your ", " we ", " our ", " they ", " their ",
            " is ", " are ", " of ", "to ", "from ", "with ", "in ", "on ", "for ", "at ", "as ",
            // a few domain-ish words
            "guide", "welcome", "entrance", "exit", "building", "museum",
            "stairs", "floor", "level", "left", "right", "north", "south", "east", "west",
        ];
        const nlSignals = [
            "de ", "en ", "je ", "jouw ", "wij ", "ons ", "zij ", "hun ",
            "gids", "welkom", "ingang", "uitgang", "gebouw", "museum",
            "trappen", "verdieping", "etage", "links", "rechts", "noord", "zuid", "oost", "west",
        ];

        let enScore = 0;
        for (const s of enSignals) if (t.includes(s)) enScore++;

        let nlScore = 0;
        for (const s of nlSignals) if (t.includes(s)) nlScore++;

        return enScore > nlScore ? "en" : "nl";
    };

    const getBestVoiceForLang = (lang: "en" | "nl", voices: SpeechSynthesisVoice[]) => {
        const targetLang = lang === "en" ? "en" : "nl";

        return (
            voices.find((v) => v.lang?.toLowerCase() === (lang === "en" ? "en-us" : "nl-nl")) ||
            voices.find((v) => v.lang?.toLowerCase().startsWith(targetLang)) ||
            voices.find((v) => v.default) ||
            voices[0] ||
            null
        );
    };

    const startSpeech = (text: string) => {
        window.speechSynthesis.cancel();

        const detected = detectLanguage(text);
        const utterance = new SpeechSynthesisUtterance(text);

        const preferredLang = detected === "en" ? "en-US" : "nl-NL";
        utterance.lang = preferredLang;

        const availableVoices = window.speechSynthesis.getVoices?.() || [];
        const selectedVoice = getBestVoiceForLang(detected, availableVoices);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            // Zorg dat lang overeenkomt met gekozen voice
            utterance.lang = selectedVoice.lang || preferredLang;
        }

        utteranceRef.current = utterance;

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onboundary = (event) => {
            if (event.name === "word") {
                const textUpToBoundary = text.substring(0, event.charIndex);
                const wordsUpToBoundary = textUpToBoundary.trim().split(/\s+/);
                const wordCount = textUpToBoundary.trim() === "" ? 0 : wordsUpToBoundary.length;
                setCurrentWordIndex(wordCount);

                const container = textScrollContainerRef.current;
                if (container) {
                    const wordsElements = container.getElementsByClassName("tts-word");
                    const activeWordElement = wordsElements[wordCount] as HTMLElement;
                    if (activeWordElement) {
                        container.scrollTo({
                            top: activeWordElement.offsetTop - container.clientHeight / 2,
                            behavior: "smooth",
                        });
                    }
                }
            }
        };

        utterance.onend = () => resetSpeechState();
        utterance.onerror = () => resetSpeechState();
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

    const goToStep = (nextStep: number) => {
        const boundedStep = Math.max(0, Math.min(orderedSteps.length - 1, nextStep));
        if (boundedStep === activeStep) return;

        setStepDirection(boundedStep > activeStep ? 1 : -1);
        setActiveStep(boundedStep);
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
        
    if (!route || orderedSteps.length === 0 || !currentStep) return null;

    const stepText = currentStep?.locationDescription || "geen beschrijving toegevoegd aan deze stap.";
    const words = stepText.split(/\s+/);

    return (
        <main className="relative flex h-[calc(100vh-97px)] flex-col overflow-hidden bg-[#004B98] font-sans text-[#333333] selection:bg-[#0064AD]/20">
            <section className="relative w-full h-[30vh] bg-neutral-900 overflow-hidden">
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

                <AnimatePresence initial={false} custom={stepDirection}>
                    <motion.img
                        key={currentStep.id || activeStep}
                        src={currentStep.imageUrl}
                        alt={currentStep.locationName}
                        custom={stepDirection}
                        initial={{ opacity: 0, x: stepDirection * 36, scale: 1.04 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: stepDirection * -28, scale: 0.985 }}
                        transition={STEP_TRANSITION}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-[#004B98] via-transparent to-black/20 pointer-events-none" />
                <span className="roc-diagonal-overlay" />
                <span className="roc-diagonal-overlay-sm" />

                <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-between px-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => goToStep(activeStep - 1)}
                        disabled={activeStep === 0}
                        className="inline-flex items-center justify-center text-white/95 hover:text-white hover:bg-white/10 rounded-[2mm] text-sm font-semibold gap-1 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <ChevronLeft className="size-4" /> vorige
                    </Button>

                    <span className="text-xs text-white/95 font-sans truncate max-w-[140px] drop-shadow-md">
                        {route.name}
                    </span>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => goToStep(activeStep + 1)}
                        disabled={activeStep >= orderedSteps.length - 1}
                        className="inline-flex items-center justify-center text-white/95 hover:text-white hover:bg-white/10 rounded-[2mm] text-sm font-semibold gap-1 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        volgende <ChevronRight className="size-4" />
                    </Button>
                </div>
            </section>

            <section className="relative flex h-[70vh] flex-col bg-gradient-to-b from-[#004B98] to-[#0064AD] pt-6 px-6 text-white shadow-[0_-15px_40px_rgba(0,0,0,0.3)] rounded-t-[32px] z-10 overflow-hidden">
                <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/25" />

                <div className="mb-4 flex items-end justify-between border-b border-white/10 pb-4">
                    <AnimatePresence mode="wait" initial={false} custom={stepDirection}>
                        <motion.div
                            key={`heading-${currentStep.id || activeStep}`}
                            custom={stepDirection}
                            initial={{ opacity: 0, x: stepDirection * 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: stepDirection * -18 }}
                            transition={STEP_TRANSITION}
                        >
                            <span className="font-sans text-xs font-bold tracking-widest text-[#FFF265]">
                                stap {activeStep + 1} van {orderedSteps.length}
                            </span>
                            <h1 className="font-sans text-xl font-bold text-white mt-0.5">
                                {currentStep.locationName}
                            </h1>
                        </motion.div>
                    </AnimatePresence>

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

                <div
                    ref={textScrollContainerRef}
                    className="flex-1 overflow-y-auto py-4 scrollbar-none select-none relative"
                >
                    <AnimatePresence mode="wait" initial={false} custom={stepDirection}>
                        <motion.div
                            key={`text-${currentStep.id || activeStep}`}
                            custom={stepDirection}
                            initial={{ opacity: 0, y: 18, x: stepDirection * 18 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, y: -10, x: stepDirection * -12 }}
                            transition={STEP_TRANSITION}
                            className="font-sans font-bold tracking-tight text-2xl md:text-3xl text-left"
                        >
                            <span className="flex flex-wrap gap-x-[0.23em] gap-y-2">
                                {words.map((word, wordIdx) => {
                                    const isWordSpeaking = isPlaying && wordIdx === currentWordIndex;
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

                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>
        </main>
    );
}
