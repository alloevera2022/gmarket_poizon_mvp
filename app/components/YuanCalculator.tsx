"use client";

import React from 'react';
import { Form, InputNumber, Card, Divider, Typography, Space } from 'antd';
import { useCalculator } from '../context/CalculatorContext';

const { Text, Title } = Typography;

export default function YuanCalculator() {
  const { params, loading } = useCalculator();
  const [yuan, setYuan] = React.useState(100);

  const calculateSom = (yuanValue: number): number => {
    return yuanValue * params.exchangeRate;
  };

  const calculateTotal = (yuanValue: number): number => {
    return calculateSom(yuanValue) + params.serviceFee + params.deliveryFee;
  };

  if (loading) return <div>Загрузка...</div>;

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
                onChange={(value) => setYuan(value || 0)}
              />
            </Form.Item>
  
            <Divider />
  
            <Form.Item label="Курс в юанях:">
              <Text strong>{params.exchangeRate}</Text>
            </Form.Item>
  
            <Form.Item label="Цена в рублях:">
              <Text strong>{calculateSom(yuan)}</Text>
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
                {calculateTotal(yuan)} руб.
              </Text>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
}