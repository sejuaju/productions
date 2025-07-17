"use client"

import Link from "next/link";
import MainLayout from "@/components/Layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
            Welcome to ExtSwap
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            The most efficient Layer 2 DEX platform for swapping tokens with minimal fees.
            ExtSwap offers the best rates and fastest transactions on the market.
          </p>
          
          <Link href="/swap" className="btn bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity">
            Launch Swap
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-[var(--primary)] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)]">Lightning Fast</h3>
            <p className="text-[var(--text-secondary)]">
              Execute trades in milliseconds thanks to our optimized Layer 2 infrastructure.
            </p>
          </div>
          
          <div className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-[var(--accent)] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)]">Secure & Audited</h3>
            <p className="text-[var(--text-secondary)]">
              Your funds are protected by industry-leading security practices and audited smart contracts.
            </p>
          </div>          
          <div className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-[var(--success)] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)]">Lowest Fees</h3>
            <p className="text-[var(--text-secondary)]">
              Pay up to 100x less in gas fees compared to Layer 1 exchanges and enjoy minimal trading fees.
            </p>
          </div>
        </div>      
      </div>
    </MainLayout>
  );
}
