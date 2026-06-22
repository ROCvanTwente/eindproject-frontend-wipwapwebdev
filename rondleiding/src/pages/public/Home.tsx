import { Link } from "react-router";
import { ArrowRight, Building2, Compass, MapPinned } from "lucide-react";
import { Button } from "../../app/components/ui/button";
import gieterijBackground from "../../img/gieterij1_logo-DR102645.jpg";

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

                    </div>

                    <div
                        className="roc-panel p-6 md:p-8"
                        style={{
                            backgroundImage: `url(${gieterijBackground})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="flex h-full min-h-[18rem] flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                                <MapPinned className="size-7 text-primary" />
                            </div>
                            <div className="mt-auto space-y-4">
                                <div className="bg-white py-3 px-4 border-radius9999 shadow-sm">
                                    <Link to="/locations" className="roc-kicker text-primary">
                                        locaties
                                    </Link>
                                </div>
                                <div className="bg-primary py-3 px-4 border-radius9999 text-white shadow-sm">
                                    <link href="/routes" className="roc-kicker text-primary">
                                        routes
                                    </link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <span className="roc-diagonal-overlay" />
                <span className="roc-diagonal-overlay-sm" />
            </section>

            
        </main>
    );
}
