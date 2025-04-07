"use client";

import { CalculatorProvider } from '../context/CalculatorContext';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  return (
    <CalculatorProvider>
      <AdminPanel />
    </CalculatorProvider>
  );
}