import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
    groupOrderCount?: number;
}

export default function HeroBanner({ groupOrderCount = 0 }: HeroBannerProps) {
    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1c1e] to-[#2d3033] text-white shadow-xl ring-1 ring-black/5">
            {/* Background Effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-[0.03] rounded-full -mr-20 -mt-20 blur-3xl"></div>

            <div className="flex flex-col lg:flex-row min-h-[360px]">
                {/* Left: Content */}
                <div className="p-8 lg:p-12 flex-1 flex flex-col justify-center z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-gray-300 w-fit mb-6">
                        <span className="w-2 h-2 rounded-full bg-kh-red animate-pulse"></span>
                        Live: {groupOrderCount > 0 ? `${groupOrderCount} Group Orders Active` : 'Start a Group Order'}
                    </div>

                    <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                        Resell fast.<br />Order smart.<br />
                        <span className="text-kh-red bg-clip-text text-transparent bg-gradient-to-r from-kh-red to-orange-400">Save together.</span>
                    </h1>

                    <p className="text-gray-400 mb-8 max-w-lg text-sm lg:text-base leading-relaxed">
                        The exclusive marketplace for IPM students. Buy/sell campus essentials or split delivery fees on food orders to save money every day.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/listings/create" className="px-6 py-3 bg-kh-red hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-900/20 text-sm flex items-center gap-2 group">
                            List an Item
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/group-orders/create" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all backdrop-blur-md text-sm">
                            Start Group Order
                        </Link>
                    </div>
                </div>

                {/* Right: Visual / Quick Actions */}
                <div className="lg:w-[35%] bg-white/5 backdrop-blur-md border-l border-white/5 p-6 lg:p-8 flex flex-col justify-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Quick Group Orders</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { name: "Blinkit", desc: "Groceries in minutes", logo: "/Blinkit.svg" },
                            { name: "Swiggy", desc: "Food delivery", logo: "/Swiggy.svg" },
                            { name: "Zomato", desc: "Restaurant meals", logo: "/Zomato.svg" },
                        ].map(brand => (
                            <Link href={`/group-orders/create?platform=${brand.name}`} key={brand.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
                                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{brand.name}</div>
                                    <div className="text-[11px] text-gray-400">{brand.desc}</div>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
