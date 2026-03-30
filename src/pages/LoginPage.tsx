import React, { useState, useEffect, useCallback } from "react";
import { useLogin } from "@refinedev/core";
import { Card, Form, Input, Button, Typography, Row, Col, App } from "antd"; 
import { 
  UserOutlined, 
  LockOutlined, 
  CopyrightOutlined, 
  ReloadOutlined 
} from "@ant-design/icons";
import { supabase } from "../supabaseClient"; 
import Logo from "../assets/logo.png";

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [form] = Form.useForm();
  const { mutate: login, isPending } = useLogin();
  const [isFormValid, setIsFormValid] = useState(false);
  const [captcha, setCaptcha] = useState({ n1: 0, n2: 0 });

  const { message } = App.useApp();

  const genCaptcha = useCallback(() => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ n1, n2 });
    form.setFieldsValue({ captchaResult: "" });
    setIsFormValid(false);
  }, [form]);

  useEffect(() => {
    genCaptcha();
  }, [genCaptcha]);

  const onValuesChange = () => {
    const values = form.getFieldsValue();
    const allFilled = !!values.username && !!values.password && !!values.captchaResult;
    setIsFormValid(allFilled);
  };

  const onFinish = async (v: any) => {
    if (parseInt(v.captchaResult) !== captcha.n1 + captcha.n2) {
      message.error("ئەنجامی کۆکردنەوە هەڵەیە!");
      return genCaptcha();
    }

    try {
      const { data: user, error } = await supabase
        .from("user")
        .select("*")
        .eq("username", v.username)
        .maybeSingle();

      if (error) {
        message.error("کێشەی پەیوەندی داتابەیس!");
        return;
      }

      if (!user) {
        message.error("ئەم ناوی بەکارهێنەرە بوونی نییە!");
        return;
      }

      if (user.password !== v.password) {
        message.error("وشەی نهێنی هەڵەیە!");
        return;
      }

      if (!user.is_active) {
        message.error("ئەم هەژمارە ناچالاک کراوە!");
        return;
      }

      localStorage.setItem("user_info", JSON.stringify({
        id: user.id, 
        fullname: user.fullname,
        level_id: user.level_id
      }));

      // --- لێرە گۆڕانکاری کراوە بۆ ئەوەی ڕاستەوخۆ بچێتە داشبۆرد ---
      login({ 
        ...user, 
        redirectTo: "/dashboard" 
      }, {
        onSuccess: () => {
          message.success(`بەخێربێیتەوە ${user.fullname}`);
        }
      });

    } catch (err) {
      message.error("هەڵەیەک لە سێرڤەر ڕوویدا");
    }
  };

  const inputIcon = (icon: any) => ({ 
    prefix: React.cloneElement(icon, { style: { color: "#0d9488" } }), 
    size: "large" as const 
  });

  return (
    <div className="login-container" style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5", direction: "rtl" }}>
      <style>
        {`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active  {
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            box-shadow: 0 0 0 30px white inset !important;
          }
        `}
      </style>

      <Card styles={{ body: { padding: 0 } }} style={{ width: 400, borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
        <div style={{ background: "#0d9488", padding: "15px", textAlign: "center" }}>
          <Title level={4} style={{ color: "white", margin: 0 }}>شیرینی تاج</Title>
        </div>

        <div style={{ padding: "30px 25px" }}>
          <div style={{ textAlign: "center", marginBottom: 25 }}>
            <img src={Logo} alt="Logo" style={{ width: 120 }} />
          </div>
          
          <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={onValuesChange} autoComplete="off">
            <Form.Item name="username" rules={[{ required: true, message: "ناوی بەکارهێنەر بنوسە" }]}>
              <Input 
                {...inputIcon(<UserOutlined />)} 
                placeholder="ناوی بەکارهێنەر" 
                autoComplete="one-time-code"
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: "وشەی نهێنی بنوسە" }]}>
              <Input.Password 
                {...inputIcon(<LockOutlined />)} 
                placeholder="وشەی نهێنی" 
                autoComplete="new-password"
              />
            </Form.Item>
            
            <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: 8, marginBottom: 20, border: "1px solid #e2e8f0", direction: "ltr" }}>
              <Row gutter={10} align="middle" justify="center">
                <Col span={8} style={{ textAlign: "right" }}>
                  <Text strong style={{ fontSize: 18, color: "#0d9488" }}>{captcha.n1} + {captcha.n2} =</Text>
                </Col>
                <Col span={12}>
                  <Form.Item name="captchaResult" rules={[{ required: true }]} style={{ margin: 0 }}>
                    <Input placeholder="ئەنجام" size="large" type="number" style={{ direction: "rtl" }} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Button type="text" icon={<ReloadOutlined style={{ color: "#0d9488" }} />} onClick={genCaptcha} />
                </Col>
              </Row>
            </div>

            <Button type="primary" htmlType="submit" block size="large" loading={isPending} disabled={!isFormValid} style={{ background: isFormValid ? "#0d9488" : "#d9d9d9", borderColor: isFormValid ? "#0d9488" : "#d9d9d9", height: 48, borderRadius: 8, fontWeight: "bold", fontSize: "16px" }}>
              بڕۆ ژوورەوە
            </Button>
          </Form>
        </div>

        <div style={{ background: "#0d9488", padding: "10px 20px", display: "flex", justifyContent: "space-between", color: "white", fontSize: "12px" }}>
          <Text style={{ color: "white" }}><CopyrightOutlined />دروست كەری بەرنامە\خەبات محمد </Text>
          <Text style={{ color: "white" }}> 07501205881</Text>
        </div>
      </Card>
    </div>
  );
};