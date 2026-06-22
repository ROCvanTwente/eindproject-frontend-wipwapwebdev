import { Link } from "react-router";
import { ArrowRight, Building2, Compass, MapPinned } from "lucide-react";
import { Button } from "../../app/components/ui/button";

export function Home() {
    return (
        <main className="roc-page-shell">
            <section className="roc-strip roc-strip--blue">
                <div className="roc-content-wrap roc-band roc-hero-grid">
                    <div className="roc-panel roc-panel--dark p-6 md:p-8 lg:p-10">
                        <p className="roc-kicker">roc van twente</p>
                        <h1 className="roc-title mt-4 max-w-xl text-white">
                            Ontdek je route door het gebouw
                        </h1>
                        <p className="roc-copy roc-copy--on-dark mt-5 max-w-2xl text-base md:text-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Morbi elementum risus ut odio suscipit
                            pretium. Vivamus metus urna, hendrerit sed.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="tracking-[0.08em]"

                            >
                                <Link to="/routes">
                                    bekijk routes{" "}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/30 bg-transparent text-white hover:bg-white/10 tracking-[0.08em]"

                            >
                                <Link to="/locations">alle locaties</Link>
                            </Button>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-2">
                            <span className="roc-chip">Placeholder</span>
                        </div>
                    </div>

                    <div
                        className="roc-panel p-6 md:p-8"
                        style={{
                            backgroundImage: `url('/src/img/gieterij1_logo-DR102645.jpg')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="flex h-full min-h-[18rem] flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                                <span className="roc-chip roc-chip--blue">
                                    basistramien
                                </span>
                                <MapPinned className="size-7 text-primary" />
                            </div>
                            <div className="mt-auto space-y-4">
                                <div className="rounded-[2mm] bg-white p-4 shadow-sm">
                                    <p className="roc-kicker text-primary">
                                        Placeholder
                                    </p>
                                </div>
                                <div className="rounded-[2mm] bg-primary p-4 text-white shadow-sm">
                                    <p className="text-sm font-semibold tracking-[0.12em]">
                                        Placeholder
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <span className="roc-diagonal-overlay" />
                <span className="roc-diagonal-overlay-sm" />
            </section>

            <section className="roc-strip roc-strip--white">
                <div className="roc-content-wrap roc-band roc-band--split">
                    <div className="roc-panel roc-panel--dark p-6 md:p-8">
                        <p className="roc-kicker">start hier</p>
                        <h2 className="roc-title mt-3 text-secondary">
                            kies een route of zoek direct een locatie
                        </h2>
                        
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/30 bg-white text-foreground tracking-[0.08em]"

                            >
                                <Link to="/locations">
                                    locaties <Building2 className="size-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="text-white shadow-sm bg-primary hover:bg-secondary/12 tracking-[0.08em]"

                            >
                                <Link to="/admin/login">beheer</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
