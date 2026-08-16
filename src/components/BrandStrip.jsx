import React from 'react';

const brands = ['ZARA', 'NIKE', 'H&M', 'ADIDAS', 'GUCCI', 'LEVI\'S', 'PUMA', 'CALVIN KLEIN'];

export default function BrandStrip() {
    return (
        <section className="border-y border-border bg-card/30">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                    {brands.map(b => (
                        <span key={b} className="font-heading text-xl font-bold tracking-widest text-muted-foreground/40 transition-colors duration-300 hover:text-foreground">{b}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}