"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase"; // Импортируем Firestore
import { doc, getDoc, onSnapshot } from "firebase/firestore";

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

const defaultDeliveryCategories = {
  "Кофты": 1.6,
  "Кроссовки": 1.5,
  "Куртки/Ветровки": 1.1,
  "Джинсы/Брюки": 0.9,
  "Футболки/Шорты/Аксессуары": 1.1,
  "Барсетки/Клатчи": 0.9,
  "Зимняя обувь": 1.7,
  "Сумки/Рюкзаки": 1.5,
  "Техника/Парфюмерия/Алкоголь/Еда/Ювелирные изделия/Часы": 2,
};

const CalculatorContext = createContext<{
  params: CalculatorParams;
  setParams: (params: CalculatorParams) => void;
  deliveryCategories: Record<string, number>; // Добавляем deliveryCategories
  loading: boolean;
}>({
  params: defaultParams,
  setParams: () => {},
  deliveryCategories: defaultDeliveryCategories, // Устанавливаем значение по умолчанию
  loading: true,
});

// Функция для преобразования значений в числа
const parseToNumber = (value: unknown): number => {
  const parsedValue =
    typeof value === "string" || typeof value === "number"
      ? parseFloat(value as string)
      : NaN;
  return isNaN(parsedValue) ? 0 : parsedValue;
};

export const CalculatorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [params, setParams] = useState<CalculatorParams>(defaultParams);
  const [deliveryCategories, setDeliveryCategories] = useState<
    Record<string, number>
  >(defaultDeliveryCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "calculator");

    // Загружаем данные один раз при инициализации
    const loadParams = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Преобразуем данные в числа перед установкой
        const data = docSnap.data() as Record<string, unknown>; // Используем Record<string, unknown> для данных из Firestore
        setParams({
          exchangeRate: parseToNumber(data.exchangeRate),
          rubleRate: parseToNumber(data.rubleRate),
          serviceFee: parseToNumber(data.serviceFee),
          deliveryFee: parseToNumber(data.deliveryFee),
        });

        // Загружаем и устанавливаем категории доставки (если они есть в Firestore)
        if (data.deliveryCategories) {
          const parsedDeliveryCategories = Object.fromEntries(
            Object.entries(data.deliveryCategories).map(([key, value]) => [
              key,
              parseToNumber(value),
            ])
          );
          setDeliveryCategories(parsedDeliveryCategories);
        }
      }
      setLoading(false);
    };

    // Используем onSnapshot для обновления данных в реальном времени
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Record<string, unknown>;
        setParams({
          exchangeRate: parseToNumber(data.exchangeRate),
          rubleRate: parseToNumber(data.rubleRate),
          serviceFee: parseToNumber(data.serviceFee),
          deliveryFee: parseToNumber(data.deliveryFee),
        });

        if (data.deliveryCategories) {
          const parsedDeliveryCategories = Object.fromEntries(
            Object.entries(data.deliveryCategories).map(([key, value]) => [
              key,
              parseToNumber(value),
            ])
          );
          setDeliveryCategories(parsedDeliveryCategories);
        }
      }
    });

    loadParams(); // Загрузить параметры один раз
    return () => unsubscribe(); // Отписка от обновлений при размонтировании компонента
  }, []);

  return (
    <CalculatorContext.Provider
      value={{ params, setParams, deliveryCategories, loading }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => useContext(CalculatorContext);
