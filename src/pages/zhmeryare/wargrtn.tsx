import React, { useState, useEffect } from "react";
import { 
  Form, Input, Card, Button, Space, Row, Col, App, InputNumber, Select, DatePicker, Typography 
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
  const [openPicker, setOpenPicker] = useState(false);

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
    msg.info("کردارەکە هەڵوەشایەوە");
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
        const { error } = await supabase.from("wargrtn").update(payload).eq("id", editId);
        if (error) throw error;
        msg.success("گۆڕانکارییەکان پاشکەوت کران");
      } else {
        const { error } = await supabase.from("wargrtn").insert([payload]);
        if (error) throw error;
        msg.success("تۆمارکرا");
      }

      form.resetFields();
      setIsEditable(false);
      setEditId(null);
      if (editId) navigate("/wargrtnlist");
    } catch (error: any) {
      msg.error("کێشەیەک ڕوویدا");
    } finally {
      setLoading(false);
    }
  };

  // ستایلی هێدەرە سەوزە گەورەکە (پڕاوپڕ وەک ئەوەی دیاریت کردووە)
  const headerStyle: React.CSSProperties = {
    background: editId ? "#f29339" : "#0d9488", 
    color: "#fff", 
    height: "45px", // بەرزکردنەوەی هێدەرەکە بۆ ئەو قیاسەی ویستووتە
    display: "flex", 
    alignItems: "center", 
    padding: "0 15px",
    borderRadius: "8px 8px 0 0", 
    fontWeight: "bold",
    fontSize: "15px"
  };

  return (
    <div style={{ padding: "10px" }}>
      <Card 
        title={
          <div style={headerStyle}>
            <Space>
              <WalletOutlined />
              {editId ? "دەستکاریکردنی وەرگرتن" : "تۆمارکردنی وەرگرتنی پارە"}
            </Space>
          </div>
        }
        styles={{ header: { padding: 0, borderBottom: "none" } }} // لادانی سپەیس و هێڵە زیادەکان
        style={{ borderRadius: "8px", maxWidth: "100%", margin: "0 auto", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ padding: "10px" }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item label="بەروار" required>
                <div 
                  style={{ 
                    display: "flex", alignItems: "center", border: "1px solid #d9d9d9", 
                    borderRadius: "6px", padding: "0 10px", height: "40px", 
                    background: isEditable ? "#fff" : "#f5f5f5"
                  }}
                  onWheel={(e) => updateDate(activeSegment, e.deltaY < 0 ? 1 : -1)}
                  tabIndex={0}
                >
                   <span onClick={() => isEditable && setActiveSegment('year')} style={{ padding: "2px 5px", background: activeSegment === 'year' && isEditable ? "#bae7ff" : "transparent", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>{year}</span>
                   <span style={{ margin: "0 2px" }}>/</span>
                   <span onClick={() => isEditable && setActiveSegment('month')} style={{ padding: "2px 5px", background: activeSegment === 'month' && isEditable ? "#bae7ff" : "transparent", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>{String(month).padStart(2, '0')}</span>
                   <span style={{ margin: "0 2px" }}>/</span>
                   <span onClick={() => isEditable && setActiveSegment('day')} style={{ padding: "2px 5px", background: activeSegment === 'day' && isEditable ? "#bae7ff" : "transparent", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>{String(day).padStart(2, '0')}</span>
                </div>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="zhpsulao" label="ژمارەی پسوڵە (سیستەم)">
                <InputNumber disabled style={{ width: "100%", height: "40px", borderRadius: "6px", fontWeight: "bold", color: "#000" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="zhpsulad" label="ژمارەی پسوڵەی دەستی">
                <InputNumber disabled={!isEditable} placeholder="ژمارەی پسوڵە" style={{ width: "100%", height: "40px", borderRadius: "6px" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="mshID" label="ناوی پێدەر" rules={[{ required: true, message: " هەڵبژێرە" }]}>
                <Select
                  disabled={!isEditable}
                  showSearch
                  placeholder="هەڵبژاردن"
                  style={{ height: "40px" }}
                  options={customers.map(c => ({ value: c.id, label: c.Mname }))}
                  filterOption={(input, option) => (option?.label ?? "").includes(input)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="br" label="بڕی پارەی وەرگیراو" rules={[{ required: true, message: "بڕ بنوسە" }]}>
                <InputNumber
                  disabled={!isEditable}
                  style={{ width: "100%", height: "40px" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="memo" label="تێبینی">
            <Input.TextArea disabled={!isEditable} rows={2} placeholder="تێبینی لێرە بنووسە..." style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Row justify="end" style={{ marginTop: "10px" }}>
            <Col>
              <Space size="middle">
                <Button 
                  type="primary" icon={<PlusOutlined />} onClick={handleNew}
                  disabled={isEditable && !editId} 
                  style={{ background: "#0d9488", borderColor: "#0d9488", height: "40px", borderRadius: "6px", minWidth: "110px" }}
                >
                  نوێ
                </Button>
                <Button 
                  type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}
                  disabled={!isEditable}
                  style={{ background: isEditable ? (editId ? "#f29339" : "#0d9488") : "#d9d9d9", borderColor: isEditable ? (editId ? "#f29339" : "#0d9488") : "#d9d9d9", height: "40px", borderRadius: "6px", minWidth: "110px" }}
                >
                  {editId ? "پاشکەوتکردن" : "تۆمارکردن"}
                </Button>
                <Button 
                  danger icon={<CloseCircleOutlined />} onClick={handleCancel}
                  disabled={!isEditable}
                  style={{ height: "40px", borderRadius: "6px", minWidth: "110px" }}
                >
                  پاشگەزبوونەوە
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};