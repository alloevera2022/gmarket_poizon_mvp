"use client";

import { CalculatorProvider } from './context/CalculatorContext';
import YuanCalculator from './components/YuanCalculator';

export default function Home() {
  return (
    <CalculatorProvider>
      <YuanCalculator />
    </CalculatorProvider>
  );
}