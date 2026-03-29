import React, { useState, useEffect } from "react";
import { 
  Form, Input, Card, Button, Space, Row, Col, App, InputNumber, Select, Typography 
} from "antd";
import { 
  SaveOutlined, 
  WalletOutlined, 
  PlusOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";

const { Text } = Typography;

export const Wargrtn: React.FC = () => {
  const [form] = Form.useForm();
  const { message: msg } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false); 
  const [editId, setEditId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<{ id: any; Mname: string }[]>([]);
  
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [day, setDay] = useState(dayjs().date());
  const [activeSegment, setActiveSegment] = useState<'year' | 'month' | 'day'>('day');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from("mshtary").select("id, Mname").order("Mname");
      if (data) setCustomers(data);

      if (location.state && location.state.editData) {
        const editData = location.state.editData;
        setEditId(editData.id);
        setIsEditable(true);
        const d = dayjs(editData.date);
        setYear(d.year());
        setMonth(d.month() + 1);
        setDay(d.date());

        form.setFieldsValue({
          zhpsulao: editData.zhpsulao,
          zhpsulad: editData.zhpsulad,
          mshID: editData.mshID,
          br: editData.br,
          memo: editData.memo
        });
      }
    };
    init();
  }, [location.state, form]);

  const handleNew = async () => {
    setLoading(true);
    try {
      setEditId(null);
      const { data: lastData } = await supabase.from("wargrtn")
        .select("zhpsulao")
        .order("zhpsulao", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      form.resetFields();
      form.setFieldsValue({ 
        zhpsulao: lastData ? Number(lastData.zhpsulao) + 1 : 1,
      });
      
      setYear(dayjs().year());
      setMonth(dayjs().month() + 1);
      setDay(dayjs().date());
      setIsEditable(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditId(null);
    setIsEditable(false);
    navigate("/wargrtn", { state: null });
  };

  const updateDate = (type: 'year' | 'month' | 'day', delta: number) => {
    if (!isEditable) return;
    if (type === 'year') setYear(prev => prev + delta);
    if (type === 'month') setMonth(prev => (prev + delta > 12 ? 1 : prev + delta < 1 ? 12 : prev + delta));
    if (type === 'day') {
      const maxDays = dayjs(`${year}-${month}-01`).daysInMonth();
      setDay(prev => {
        let val = prev + delta;
        return val > maxDays ? 1 : val < 1 ? maxDays : val;
      });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
      const formattedDate = dayjs(`${year}-${month}-${day}`).format("YYYY-MM-DD");

      const payload = {
        date: formattedDate,
        zhpsulao: values.zhpsulao,
        zhpsulad: values.zhpsulad || null,
        mshID: values.mshID,
        br: values.br || 0,
        memo: values.memo || "",
        userID: userInfo?.id,
      };

      if (editId) {
        await supabase.from("wargrtn").update(payload).eq("id", editId);
        msg.success("پاشکەوت کرا");
      } else {
        await supabase.from("wargrtn").insert([payload]);
        msg.success("تۆمارکرا");
      }
      setIsEditable(false);
      setEditId(null);
      if (editId) navigate("/wargrtnlist");
    } catch (error) {
      msg.error("هەڵەیەک هەیە");
    } finally {
      setLoading(false);
    }
  };

  const headerStyle: React.CSSProperties = {
    background: editId ? "#f29339" : "#0d9488", 
    color: "#fff", 
    height: "40px", 
    display: "flex", 
    alignItems: "center", 
    padding: "0 12px",
    borderRadius: "8px 8px 0 0", 
    fontWeight: "bold",
    fontSize: "14px"
  };

  // ستایلی دوگمە بچوکەکان
  const btnStyle = (bg?: string): React.CSSProperties => ({
    height: "34px", 
    borderRadius: "6px", 
    minWidth: "90px", 
    fontSize: "12px", 
    fontWeight: "600",
    background: bg,
    borderColor: bg
  });

  return (
    <div style={{ padding: "8px" }}>
      <Card 
        title={
          <div style={headerStyle}>
            <Space><WalletOutlined /> {editId ? "دەستکاری" : "وەرگرتنی پارە"}</Space>
          </div>
        }
        styles={{ header: { padding: 0, borderBottom: "none" } }}
        style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ padding: "8px" }}>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item label={<Text style={{fontSize: '12px'}}>بەروار</Text>} required>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #d9d9d9", borderRadius: "6px", padding: "0 8px", height: "36px", background: isEditable ? "#fff" : "#f5f5f5" }} onWheel={(e) => updateDate(activeSegment, e.deltaY < 0 ? 1 : -1)} tabIndex={0}>
                   <span onClick={() => isEditable && setActiveSegment('year')} style={{ padding: "2px 4px", background: activeSegment === 'year' && isEditable ? "#bae7ff" : "transparent", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>{year}</span>
                   <span style={{ margin: "0 2px" }}>/</span>
                   <span onClick={() => isEditable && setActiveSegment('month')} style={{ padding: "2px 4px", background: activeSegment === 'month' && isEditable ? "#bae7ff" : "transparent", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>{String(month).padStart(2, '0')}</span>
                   <span style={{ margin: "0 2px" }}>/</span>
                   <span onClick={() => isEditable && setActiveSegment('day')} style={{ padding: "2px 4px", background: activeSegment === 'day' && isEditable ? "#bae7ff" : "transparent", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>{String(day).padStart(2, '0')}</span>
                </div>
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="zhpsulao" label={<Text style={{fontSize: '12px'}}>ژ.سیستەم</Text>}>
                <InputNumber disabled style={{ width: "100%", height: "36px", borderRadius: "6px" }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="zhpsulad" label={<Text style={{fontSize: '12px'}}>ژ.دەستی</Text>}>
                <InputNumber disabled={!isEditable} style={{ width: "100%", height: "36px", borderRadius: "6px" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="mshID" label={<Text style={{fontSize: '12px'}}>ناوی پێدەر</Text>} rules={[{ required: true }]}>
                <Select disabled={!isEditable} showSearch style={{ height: "36px" }} options={customers.map(c => ({ value: c.id, label: c.Mname }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="br" label={<Text style={{fontSize: '12px'}}>بڕی پارە</Text>} rules={[{ required: true }]}>
                <InputNumber disabled={!isEditable} style={{ width: "100%", height: "36px" }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="memo" label={<Text style={{fontSize: '12px'}}>تێبینی</Text>}>
            <Input.TextArea disabled={!isEditable} rows={2} style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Row justify="end" style={{ marginTop: "5px" }}>
            <Col xs={24} style={{ textAlign: 'right' }}>
              <Space wrap size="small">
                <Button 
                  type="primary" icon={<PlusOutlined />} onClick={handleNew}
                  disabled={isEditable && !editId} 
                  style={btnStyle("#0d9488")}
                >
                  نوێ
                </Button>
                <Button 
                  type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}
                  disabled={!isEditable}
                  style={btnStyle(isEditable ? (editId ? "#f29339" : "#0d9488") : "#d9d9d9")}
                >
                  {editId ? "پاشکەوت" : "تۆمارکردن"}
                </Button>
                <Button 
                  danger icon={<CloseCircleOutlined />} onClick={handleCancel}
                  disabled={!isEditable}
                  style={{ ...btnStyle(), minWidth: "80px" }}
                >
                  لادان
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};