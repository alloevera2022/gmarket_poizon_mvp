"use client";

import React from 'react';
import { Form, InputNumber, Card, Divider, Typography, Space } from 'antd';
import { useCalculator } from '../context/CalculatorContext';

const { Text, Title } = Typography;

export default function YuanCalculator() {
  const { params, loading } = useCalculator();
  const [yuan, setYuan] = React.useState<number>(100);

  // Функция расчета стоимости в рублях с округлением
  const calculateSom = (yuanValue: number): number => {
    if (isNaN(yuanValue) || yuanValue <= 0) return 0; // Проверяем, что введено корректное число
    return yuanValue * params.exchangeRate; // Умножаем на курс для получения рубле
  };

  // Функция расчета итоговой цены с округлением
  const calculateTotal = (yuanValue: number): number => {
    const som = calculateSom(yuanValue); // Получаем цену в рублях
    if (isNaN(som) || som <= 0) return 0; // Проверяем, что расчет корректный

    // Проверяем, что услуга и доставка являются числами
    const serviceFee = isNaN(params.serviceFee) || params.serviceFee <= 0 ? 0 : params.serviceFee;
    const deliveryFee = isNaN(params.deliveryFee) || params.deliveryFee <= 0 ? 0 : params.deliveryFee;

    // Суммируем цену в рублях с услугой и доставкой
    return som + serviceFee + deliveryFee;
  };

  if (loading) return <div>Загрузка...</div>;

  // Итоговая цена с округлением до двух знаков
  const totalPrice = calculateTotal(yuan);

  // Проверяем, является ли totalPrice числом
  const validTotalPrice = !isNaN(totalPrice) && typeof totalPrice === 'number' ? totalPrice : 0;

  // Округляем итоговую цену и проверяем, что это число
  const formattedTotalPrice = typeof validTotalPrice === 'number' ? validTotalPrice.toFixed(2) : '0.00';

  console.log('totalPrice:', validTotalPrice); // Для отладки

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={1} style={{ textAlign: 'center', color: '#ff4d4f' }}>
          G Market x Poizon
        </Title>
        
        <Card title="Расчет стоимости" variant="borderless">
          <Form layout="vertical">
            <Form.Item label="Цена в юанях:">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={yuan}
                onChange={(value) => setYuan(value || 0)} // Убедимся, что значение не null/undefined
              />
            </Form.Item>
  
            <Divider />
  
            <Form.Item label="Курс в юанях:">
              <Text strong>{params.exchangeRate}</Text>
            </Form.Item>
  
            <Form.Item label="Цена в рублях:">
              <Text strong>{calculateSom(yuan).toFixed(2)}</Text> {/* Округляем до 2 знаков */}
            </Form.Item>
  
            <Form.Item label="Наша услуга:">
              <Text strong>{params.serviceFee}</Text>
            </Form.Item>
  
            <Form.Item label="Доставка:">
              <Text strong>{params.deliveryFee}</Text>
            </Form.Item>
  
            <Divider />
  
            <Form.Item label="Итоговая цена:">
              <Text strong style={{ fontSize: '20px', color: '#ff4d4f' }}>
                {formattedTotalPrice} руб. {/* Округляем итоговую цену */}
              </Text>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
}

