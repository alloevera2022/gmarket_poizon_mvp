"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Divider,
  Space,
  Alert,
  InputNumber,
  notification,
} from "antd";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc, getDoc } from "firebase/firestore";
import { app } from "../lib/firebase";

const { Title } = Typography;

const db = getFirestore(app);

interface CalculatorParams {
  exchangeRate: number;
  serviceFee: number;
  deliveryFee: number;
  deliveryCategories?: Record<string, number>;
}

const defaultCategories = {
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

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [params, setParams] = useState<CalculatorParams>({
    exchangeRate: 12.7,
    serviceFee: 1500,
    deliveryFee: 1300,
    deliveryCategories: defaultCategories,
  });

  useEffect(() => {
    // Настройка позиции pop-up сообщений
    message.config({
      top: 80,
      duration: 2,
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadParams = async () => {
      try {
        const docRef = doc(db, "settings", "calculator");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setParams((prevParams) => ({
            ...prevParams,
            ...data,
            deliveryCategories: {
              ...defaultCategories,
              ...(data.deliveryCategories || {}),
            },
          }));
          form.setFieldsValue({
            ...data,
            deliveryCategories: {
              ...defaultCategories,
              ...(data.deliveryCategories || {}),
            },
          });
        }
      } catch {
        console.error("Ошибка загрузки параметров");
        message.error("Не удалось загрузить параметры");
      } finally {
        setLoading(false);
      }
    };

    loadParams();
  }, [isAuthenticated, form]); // Исправлено: убрали params, так как используем функциональное обновление

  const handleLogin = async (values: { email: string; password: string }) => {
    setAuthLoading(true);
    setLoginError(null);

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      setIsAuthenticated(true);
      message.success("Успешный вход в админ-панель");
    } catch (error) {
      let errorMessage = "Ошибка входа";
      if (error instanceof Error) {
        console.error(error); // Логируем ошибку
        errorMessage = error.message;
      }
      setLoginError(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      message.success("Вы вышли из системы");
    } catch {
      message.error("Ошибка при выходе");
    }
  };

  const handleSave = async (values: CalculatorParams) => {
    try {
      await setDoc(doc(db, "settings", "calculator"), values, { merge: true });
      setParams(values);
      notification.success({
        message: "Сохранено",
        description: "Параметры успешно сохранены",
        placement: "bottomRight",
      });
    } catch {
      console.error("Ошибка сохранения");
      message.error("Ошибка сохранения. Проверьте консоль.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto" }}>
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
              rules={[{ required: true, message: "Введите email", type: "email" }]}
            >
              <Input placeholder="admin@example.com" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, message: "Введите пароль", min: 6 }]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={authLoading}>
                Войти
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Админ-панель</Title>

        <Card
          title="Параметры калькулятора"
          loading={loading}
          extra={
            <Button type="link" danger onClick={handleLogout}>
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
              rules={[{ required: true, message: "Введите курс" }]}
            >
              <Input type="number" step="0.01" />
            </Form.Item>

            {/* <Form.Item
              name="serviceFee"
              label="Наша услуга (руб.)"
              rules={[{ required: true, message: "Введите стоимость услуги" }]}
            >
              <Input type="number" />
            </Form.Item> */}

            <Form.Item
              name="deliveryFee"
              label="Базовая стоимость доставки (руб.)"
              rules={[{ required: true, message: "Введите базовую доставку" }]}
            >
              <Input type="number" />
            </Form.Item>

            <Divider />
            <Title level={4}>Стоимость доставки по категориям</Title>

            {Object.entries(params.deliveryCategories || defaultCategories).map(
              ([category]) => (  // Мы больше не используем 'value'
                <Form.Item
                  key={category}
                  label={category}
                  name={["deliveryCategories", category]}
                  rules={[{ required: true, message: "Введите коэффициент" }]}
                >
                  <InputNumber min={0} step={0.1} />
                </Form.Item>
              )
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Сохранить изменения
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default AdminPanel;
