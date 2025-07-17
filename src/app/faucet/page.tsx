"use client"

import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import Faucet from '@/components/Faucet/Faucet';

export default function FaucetPage() {
  return (
    <MainLayout>
      <div className="py-12">
        <Faucet />
      </div>
    </MainLayout>
  );
} 