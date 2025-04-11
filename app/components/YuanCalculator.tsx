"use client";

import React from "react";
import {
  Form,
  InputNumber,
  Card,
  Divider,
  Typography,
  Space,
  Select,
  Spin
} from "antd";
import { useCalculator } from "../context/CalculatorContext";

const { Text, Title, Link } = Typography;

export default function YuanCalculator() {
  const { params, loading, deliveryCategories } = useCalculator();
  const [category, setCategory] = React.useState<string>("-");
  const [yuan, setYuan] = React.useState<number>(0);



  // Функция расчета комиссии в зависимости от цены в юанях
  const calculateCommission = (yuanValue: number): number => {
    if (yuanValue <= 0) return 0;
    
    if (yuanValue >= 1 && yuanValue <= 140) {
      return yuanValue * 0.5; // +50%
    } else if (yuanValue >= 141 && yuanValue <= 250) {
      return yuanValue * 0.27; // +27%
    } else if (yuanValue >= 251 && yuanValue <= 500) {
      return yuanValue * 0.2; // +20%
    } else if (yuanValue >= 501 && yuanValue <= 600) {
      return yuanValue * 0.18; // +18%
    } else if (yuanValue >= 601 && yuanValue <= 850) {
      return yuanValue * 0.15; // +15%
    } else if (yuanValue >= 851 && yuanValue <= 1400) {
      return yuanValue * 0.14; // +14%
    } else if (yuanValue >= 1401) {
      return yuanValue * 0.12; // +12%
    }
    
    return 0;
  };

    // Функция расчета стоимости в рублях с округлением
    const calculateSom = (yuanValue: number): number => {
      if (isNaN(yuanValue) || yuanValue <= 0) return 0;
      return yuanValue * params.exchangeRate;
    };

// Функция расчета итоговой цены с учетом коэффициента категории доставки и комиссии
const calculateTotal = (yuanValue: number): number => {
  const som = calculateSom(yuanValue);
  if (isNaN(som) || som <= 0) return 0;

  const serviceFee = isNaN(params.serviceFee) || params.serviceFee <= 0 ? 0 : params.serviceFee;
  
  // Получаем коэффициент для выбранной категории товара
  const categoryCoefficient = deliveryCategories[category] || 1;

  // Расчет доставки с учетом коэффициента
  const deliveryFee = params.deliveryFee * categoryCoefficient;

  // Расчет комиссии от цены в юанях (конвертируем в рубли)
  const commission = calculateCommission(yuanValue) * params.exchangeRate;

  // Суммируем все компоненты
  return som + serviceFee + deliveryFee + commission;
};

  if (loading) return <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
    }}
  >
    <Spin size="large" />
    <Text style={{ marginTop: '20px', fontSize: '24px', color: '#ffffff' }}>
      Загрузка данных, пожалуйста, подождите...
    </Text>
  </div>;

  // Итоговая цена с округлением до двух знаков
  const totalPrice = calculateTotal(yuan);
  const validTotalPrice = !isNaN(totalPrice) && typeof totalPrice === "number" ? totalPrice : 0;
  const formattedTotalPrice = typeof validTotalPrice === "number" ? validTotalPrice.toFixed(2) : "0.00";

  // Расчет комиссии для отображения
  // const commission = calculateCommission(yuan) * params.exchangeRate;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={1} style={{ textAlign: "center", color: "#ff4d4f" }}>
          G Market x Poizon
        </Title>

        <div style={{ textAlign: "center" }}>
          <Link href="https://t.me/GMarketManager" target="_blank">
           Для оформления заказа свяжитесь с нашим менеджером в Telegram. 
          </Link>
        </div>

        <Card title="Расчет стоимости" variant="borderless">
          <Form layout="vertical">
            <Form.Item label="Цена в юанях:">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                value={yuan}
                onChange={(value) => setYuan(value || 0)}
              />
            </Form.Item>

            <Form.Item label="Категория товара:">
              <Select
                value={category}
                onChange={(value) => setCategory(value)}
                style={{ width: "100%" }}
              >
                {Object.entries(deliveryCategories).map(([key]) => (
                  <Select.Option key={key} value={key}>
                    {key}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item label="Итоговая цена (с учётом доставки):">
              <Text strong style={{ fontSize: "20px", color: "#ff4d4f" }}>
                {formattedTotalPrice} руб.
              </Text>
            </Form.Item>

            {/* <Form.Item label="Курс юаня к рублю:">
              <Text strong>{params.exchangeRate} </Text>
            </Form.Item> */}

            {/* <Form.Item label="Цена в рублях:">
              <Text strong>{calculateSom(yuan).toFixed(2)} руб.</Text>
            </Form.Item>

            <Form.Item label="Наша услуга:">
              <Text strong>{params.serviceFee} руб.</Text>
            </Form.Item> */}

            <Form.Item label="Примерная стоимость доставки:">
              <Text strong>
                {(deliveryCategories[category] * params.deliveryFee || 0).toFixed(2)} руб.
              </Text>
            </Form.Item>

            {/* <Form.Item label="Комиссия от цены:">
              <Text strong>{commission.toFixed(2)} руб.</Text>
            </Form.Item> */}

            <Divider />
          </Form>
        </Card>
      </Space>
    </div>
  );
}