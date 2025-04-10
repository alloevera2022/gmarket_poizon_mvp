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
  Collapse,
} from "antd";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc, getDoc } from "firebase/firestore";
import { app } from "../lib/firebase";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

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
    deliveryFee: 1300,
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
      message.success("Успешный вход в админ-панель");
    } catch (error: unknown) {
      // Используем unknown вместо any
      let errorMessage = "Ошибка входа";

      // Проверяем, является ли ошибка объектом с кодом
      if (error && typeof error === "object" && "code" in error) {
        const errorCode = (error as { code: string }).code;
        switch (errorCode) {
          case "auth/invalid-credential":
            errorMessage = "Неверный email или пароль";
            break;
          case "auth/user-not-found":
            errorMessage = "Пользователь с таким email не найден";
            break;
          case "auth/wrong-password":
            errorMessage = "Неверный пароль";
            break;
          case "auth/too-many-requests":
            errorMessage = "Слишком много попыток. Попробуйте позже";
            break;
          default:
            errorMessage = "Произошла ошибка при входе";
        }
      }

      setLoginError(errorMessage);
      console.error("Ошибка аутентификации:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      message.success("Вы успешно вышли из системы");
    } catch (error) {
      console.error("Ошибка выхода:", error);
      message.error("Ошибка при выходе из системы");
    }
  };

  const handleSave = async (values: CalculatorParams) => {
    try {
      console.log("Попытка сохранения:", values);

      // Добавляем merge: true для частичного обновления
      await setDoc(doc(db, "settings", "calculator"), values, { merge: true });

      console.log("Успешно сохранено в Firestore");
      setParams(values);
      message.success("Параметры успешно сохранены!");

      // Проверяем обновленные данные
      const updatedDoc = await getDoc(doc(db, "settings", "calculator"));
      console.log("Проверка после сохранения:", updatedDoc.data());
    } catch (error) {
      console.error("Полная ошибка сохранения:", {
        error,
        firebaseConfig: app.options,
        currentUser: auth.currentUser,
      });
      message.error("Ошибка сохранения. Проверьте консоль для деталей.");
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
              validateStatus={loginError ? "error" : ""}
              rules={[
                {
                  required: true,
                  message: "Введите email",
                  type: "email",
                },
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
              validateStatus={loginError ? "error" : ""}
              rules={[
                {
                  required: true,
                  message: "Введите пароль",
                  min: 6,
                },
              ]}
            >
              <Input.Password
                placeholder="••••••••"
                onChange={() => setLoginError(null)}
                iconRender={(visible) =>
                  visible ? (
                    <ExclamationCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )
                }
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
                {authLoading ? "Вход..." : "Войти"}
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
            <Button
              type="link"
              danger
              onClick={handleLogout}
              icon={<ExclamationCircleOutlined />}
            >
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
  label={
    <>
      Доставка (руб.){" "}
      <Text type="secondary" style={{ fontSize: "12px" }}>
        — смотрите полную логику работы стоимости доставки в Справке ниже.
      </Text>
    </>
  }
  rules={[{ required: true, message: "Введите стоимость доставки" }]}
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
            {/* <Text>Услуга: {params.serviceFee} руб.</Text> */}
            <Text>Доставка: {params.deliveryFee} руб.</Text>
          </Space>
        </Card>

        <Card title="Справка">
          <Collapse defaultActiveKey={[]}>
            <Panel header="Как работают коэффициенты для доставки?" key="1">
              <Text>
                В админ-панели можно установить базовую стоимость доставки. Эта
                стоимость умножается на коэффициенты, которые зависят от
                категории товара. Каждый товар имеет свой коэффициент, который
                влияет на итоговую цену доставки.
                <br />
                <br />
                Пример: если базовая стоимость доставки составляет 1000 рублей,
                а коэффициент для категории «Кофты» равен 1.6, то итоговая
                стоимость доставки для кофты составит 1000 * 1.6 = 1600 рублей.
                <br />
                <br />
                Категории и их коэффициенты:
                <ul>
                  <li>Кофты: 1.6</li>
                  <li>Кроссовки: 1.5</li>
                  <li>Куртки/Ветровки: 1.1</li>
                  <li>Джинсы/Брюки: 0.9</li>
                  <li>Футболки/Шорты/Аксессуары: 1.1</li>
                  <li>Барсетки/Клатчи: 0.9</li>
                  <li>Зимняя обувь: 1.7</li>
                  <li>Сумки/Рюкзаки: 1.5</li>
                  <li>
                    Техника/Парфюмерия/Алкоголь/Еда/Ювелирные изделия/Часы: 2
                  </li>
                </ul>
              </Text>
            </Panel>
          </Collapse>
        </Card>
      </Space>
    </div>
  );
};

export default AdminPanel;
