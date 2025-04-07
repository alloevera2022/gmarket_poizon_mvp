"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase'; // Импортируем Firestore
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

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
}>( {
  params: defaultParams,
  setParams: () => {},
  loading: true,
});

// Функция для преобразования значений в числа
const parseToNumber = (value: any): number => {
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? 0 : parsedValue;
};

export const CalculatorProvider = ({ children }: { children: React.ReactNode }) => {
  const [params, setParams] = useState<CalculatorParams>(defaultParams);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "calculator");

    // Загружаем данные один раз при инициализации
    const loadParams = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Преобразуем данные в числа перед установкой
        const data = docSnap.data() as CalculatorParams;
        setParams({
          exchangeRate: parseToNumber(data.exchangeRate),
          rubleRate: parseToNumber(data.rubleRate),
          serviceFee: parseToNumber(data.serviceFee),
          deliveryFee: parseToNumber(data.deliveryFee),
        });
      }
      setLoading(false);
    };

    // Используем onSnapshot для обновления данных в реальном времени
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CalculatorParams;
        setParams({
          exchangeRate: parseToNumber(data.exchangeRate),
          rubleRate: parseToNumber(data.rubleRate),
          serviceFee: parseToNumber(data.serviceFee),
          deliveryFee: parseToNumber(data.deliveryFee),
        });
      }
    });

    loadParams(); // Загрузить параметры один раз
    return () => unsubscribe(); // Отписка от обновлений при размонтировании компонента
  }, []);

  return (
    <CalculatorContext.Provider value={{ params, setParams, loading }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => useContext(CalculatorContext);
