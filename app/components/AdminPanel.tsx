"use client";
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Space, Alert } from 'antd';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getFirestore, setDoc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Инициализация Firestore
const db = getFirestore(app);

interface CalculatorParams {
  exchangeRate: number;
  serviceFee: number;
  deliveryFee: number;
}

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [params, setParams] = useState<CalculatorParams>({
    exchangeRate: 12.7,
    serviceFee: 1500,
    deliveryFee: 1300
  });
  const [form] = Form.useForm();
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadParams = async () => {
      try {
        const docRef = doc(db, "settings", "calculator");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setParams(docSnap.data() as CalculatorParams);
          form.setFieldsValue(docSnap.data());
        }
      } catch (error) {
        console.error("Ошибка загрузки параметров:", error);
        message.error("Не удалось загрузить параметры");
      } finally {
        setLoading(false);
      }
    };

    loadParams();
  }, [isAuthenticated, form]);

  const handleLogin = async (values: { email: string; password: string }) => {
    setAuthLoading(true);
    setLoginError(null);
    
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      setIsAuthenticated(true);
      message.success('Успешный вход в админ-панель');
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = 'Ошибка входа';

      switch (errorCode) {
        case 'auth/invalid-credential':
          errorMessage = 'Неверный email или пароль';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Пользователь с таким email не найден';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Неверный пароль';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Слишком много попыток. Попробуйте позже';
          break;
        default:
          errorMessage = 'Произошла ошибка при входе';
      }

      setLoginError(errorMessage);
      console.error('Ошибка аутентификации:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      message.success('Вы успешно вышли из системы');
    } catch (error) {
      console.error('Ошибка выхода:', error);
      message.error('Ошибка при выходе из системы');
    }
  };

  const handleSave = async (values: CalculatorParams) => {
    try {
      await setDoc(doc(db, "settings", "calculator"), values);
      setParams(values);
      message.success('Параметры успешно сохранены!');
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      message.error('Ошибка при сохранении параметров');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto' }}>
        <Card title="Вход в админ-панель">
          {loginError && (
            <Alert
              message={loginError}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
              closable
              onClose={() => setLoginError(null)}
            />
          )}
          
          <Form onFinish={handleLogin} layout="vertical">
            <Form.Item
              name="email"
              label="Email"
              validateStatus={loginError ? 'error' : ''}
              rules={[
                { 
                  required: true, 
                  message: 'Введите email',
                  type: 'email'
                }
              ]}
            >
              <Input 
                placeholder="admin@example.com" 
                prefix={<ExclamationCircleOutlined />}
                onChange={() => setLoginError(null)}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Пароль"
              validateStatus={loginError ? 'error' : ''}
              rules={[
                { 
                  required: true, 
                  message: 'Введите пароль',
                  min: 6
                }
              ]}
            >
              <Input.Password 
                placeholder="••••••••" 
                onChange={() => setLoginError(null)}
                iconRender={(visible) => (
                  visible ? <ExclamationCircleOutlined /> : <ExclamationCircleOutlined />
                )}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                loading={authLoading}
                icon={loginError ? <ExclamationCircleOutlined /> : null}
              >
                {authLoading ? 'Вход...' : 'Войти'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '20px auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Админ-панель</Title>
        
        <Card 
          title="Параметры калькулятора" 
          loading={loading}
          extra={
            <Button type="link" danger onClick={handleLogout} icon={<ExclamationCircleOutlined />}>
              Выйти
            </Button>
          }
        >
          <Form
            form={form}
            initialValues={params}
            onFinish={handleSave}
            layout="vertical"
          >
            <Form.Item
              name="exchangeRate"
              label="Курс юаня (руб/юань)"
              rules={[{ required: true, message: 'Введите курс' }]}
            >
              <Input type="number" step="0.01" />
            </Form.Item>

            <Form.Item
              name="serviceFee"
              label="Наша услуга (сом)"
              rules={[{ required: true, message: 'Введите стоимость услуги' }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="deliveryFee"
              label="Доставка (сом)"
              rules={[{ required: true, message: 'Введите стоимость доставки' }]}
            >
              <Input type="number" />
            </Form.Item>

            <Divider />

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Сохранить изменения
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Текущие значения">
          <Space direction="vertical">
            <Text>Курс юаня: {params.exchangeRate} рубль/юань</Text>
            <Text>Услуга: {params.serviceFee} сом</Text>
            <Text>Доставка: {params.deliveryFee} сом</Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default AdminPanel;