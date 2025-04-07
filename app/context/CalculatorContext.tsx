"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CalculatorParams {
  exchangeRate: number;
  rubleRate: number;
  serviceFee: number;
  deliveryFee: number;
}

const defaultParams: CalculatorParams = {
  exchangeRate: 12.7,
  rubleRate: 5791.2,
  serviceFee: 1500,
  deliveryFee: 1300,
};

const CalculatorContext = createContext<{
  params: CalculatorParams;
  setParams: (params: CalculatorParams) => void;
  loading: boolean;
}>({
  params: defaultParams,
  setParams: () => {},
  loading: true,
});

export const CalculatorProvider = ({ children }: { children: React.ReactNode }) => {
  const [params, setParams] = useState<CalculatorParams>(defaultParams);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedParams = localStorage.getItem('calculatorParams');
    if (savedParams) {
      setParams(JSON.parse(savedParams));
    }
    setLoading(false);
  }, []);

  const handleSetParams = (newParams: CalculatorParams) => {
    setParams(newParams);
    localStorage.setItem('calculatorParams', JSON.stringify(newParams));
  };

  return (
    <CalculatorContext.Provider value={{ params, setParams: handleSetParams, loading }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => useContext(CalculatorContext);