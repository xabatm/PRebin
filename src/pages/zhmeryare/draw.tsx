import React, { useState, useEffect } from "react";
import { 
  Form, Input, Card, Button, Space, Row, Col, App, InputNumber, Select, Typography, DatePicker 
} from "antd";
import { 
  SaveOutlined, 
  WalletOutlined, 
  PlusOutlined,
  CloseCircleOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";

const { Text } = Typography;

export const Draw: React.FC = () => {
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
  const [showDatePicker, setShowDatePicker] = useState(false);

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
        form.setFieldsValue(editData);
      }
    };
    init();
  }, [location.state, form]);

  const updateDate = (type: 'year' | 'month' | 'day', delta: number) => {
    if (!isEditable) return;
    if (type === 'year') setYear(prev => prev + delta);
    if (type === 'month') {
      let next = month + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      setMonth(next);
    }
    if (type === 'day') {
      const maxDays = dayjs(`${year}-${month}-01`).daysInMonth();
      let next = day + delta;
      if (next > maxDays) next = 1;
      if (next < 1) next = maxDays;
      setDay(next);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditable) return;
    if (e.key === "ArrowUp") { e.preventDefault(); updateDate(activeSegment, 1); } 
    else if (e.key === "ArrowDown") { e.preventDefault(); updateDate(activeSegment, -1); } 
    else if (e.key === "ArrowRight") { e.preventDefault(); if (activeSegment === "day") setActiveSegment("month"); else if (activeSegment === "month") setActiveSegment("year"); } 
    else if (activeSegment === "year" && e.key === "ArrowLeft") { e.preventDefault(); setActiveSegment("month"); }
    else if (activeSegment === "month" && e.key === "ArrowLeft") { e.preventDefault(); setActiveSegment("day"); }
  };

  const handleNew = async () => {
    setLoading(true);
    try {
      setEditId(null);
      const { data: lastData } = await supabase.from("draw")
        .select("zhpsulao")
        .order("zhpsulao", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      form.resetFields();
      form.setFieldsValue({ zhpsulao: lastData ? Number(lastData.zhpsulao) + 1 : 1 });
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
    if (editId) navigate("/drawlist");
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // ١. هەوڵدان بۆ وەرگرتنی ئایدی لە Auth
      const { data: authData } = await supabase.auth.getUser();
      let currentUserID = authData.user?.id;
      
      // ٢. ئەگەر لە Auth نەبوو (چونکە لۆگینی دەستی بەکاردێنیت)، لە LocalStorage دەیخوێنینەوە
      if (!currentUserID) {
        const userInfoStr = localStorage.getItem("user_info");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          currentUserID = userInfo.id; // ئەمە ئەو ئایدییە کە لە LoginPage پاشکەوتمان کرد
        }
      }

      if (!currentUserID) {
        msg.warning("ناسنامەی کاربەر نەدۆزرایەوە، تکایە دووبارە Login بکەرەوە.");
        setLoading(false);
        return;
      }

      const formattedDate = dayjs(`${year}-${month}-${day}`).format("YYYY-MM-DD");
      
      // ئامادەکردنی داتا - لێرە userID ئۆتۆماتیکی زیاد دەکرێت
      const payload = { 
        ...values, 
        date: formattedDate,
        userID: currentUserID 
      };

      if (editId) {
        // لە کاتی دەستکاری (Update)
        const { error } = await supabase.from("draw").update(payload).eq("id", editId);
        if (error) throw error;
        msg.success("گۆڕانکارییەکان بە سەرکەوتوویی پاشکەوت کران");
      } else {
        // لە کاتی تۆمارکردنی نوێ (Insert)
        const { error } = await supabase.from("draw").insert([payload]);
        if (error) throw error;
        msg.success("تۆمارکردن سەرکەوتوو بوو");
      }
      
      setIsEditable(false);
      setEditId(null);
      form.resetFields();
      if (editId) navigate("/drawlist");
    } catch (error: any) {
      msg.error("هەڵەیەک ڕوویدا: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const headerStyle: React.CSSProperties = {
    background: editId ? "#f29339" : "#0d9488", 
    color: "#fff", height: "40px", display: "flex", alignItems: "center", 
    padding: "0 12px", borderRadius: "8px 8px 0 0", fontWeight: "bold"
  };

  const btnStyle = (bg?: string): React.CSSProperties => ({
    height: "34px", borderRadius: "6px", minWidth: "90px", fontSize: "12px", fontWeight: "600",
    background: bg, borderColor: bg
  });

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "10px" }}>
      <Card 
        title={
          <div style={headerStyle}>
            <Space><WalletOutlined /> {editId ? "دەستکاری پێدان" : "تۆمارکردنی پێدانی پارە"}</Space>
          </div>
        }
        styles={{ header: { padding: 0, borderBottom: "none" } }}
        style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: 'hidden' }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ padding: "8px" }}>
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item label={<Text style={{ fontSize: '12px' }}>بەروار</Text>} required>
                <div 
                  style={{ 
                    display: "flex", alignItems: "center", border: "1px solid #d9d9d9", borderRadius: "6px", 
                    padding: "0 10px", height: "36px", background: isEditable ? "#fff" : "#f5f5f5", 
                    outline: activeSegment ? '1px solid #40a9ff' : 'none', justifyContent: 'space-between', position: 'relative'
                  }} 
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', gap: '4px' }}>
                    <span onClick={() => isEditable && setActiveSegment('year')} style={{ padding: "2px 6px", background: activeSegment === 'year' && isEditable ? "#0d9488" : "transparent", color: activeSegment === 'year' && isEditable ? "white" : "black", borderRadius: "4px", cursor: "pointer", fontWeight: 'bold', fontSize: '15px' }}>{year}</span>
                    <span style={{ color: '#ccc' }}>/</span>
                    <span onClick={() => isEditable && setActiveSegment('month')} style={{ padding: "2px 6px", background: activeSegment === 'month' && isEditable ? "#0d9488" : "transparent", color: activeSegment === 'month' && isEditable ? "white" : "black", borderRadius: "4px", cursor: "pointer", fontWeight: 'bold', fontSize: '15px' }}>{String(month).padStart(2, '0')}</span>
                    <span style={{ color: '#ccc' }}>/</span>
                    <span onClick={() => isEditable && setActiveSegment('day')} style={{ padding: "2px 6px", background: activeSegment === 'day' && isEditable ? "#0d9488" : "transparent", color: activeSegment === 'day' && isEditable ? "white" : "black", borderRadius: "4px", cursor: "pointer", fontWeight: 'bold', fontSize: '15px' }}>{String(day).padStart(2, '0')}</span>
                  </div>
                  <CalendarOutlined 
                    style={{ fontSize: '18px', color: '#0d9488', cursor: isEditable ? 'pointer' : 'not-allowed', marginLeft: '8px' }} 
                    onClick={(e) => { e.stopPropagation(); if (isEditable) setShowDatePicker(true); }}
                  />
                  <div style={{ position: 'absolute', right: 10, top: 0, width: 0, height: 0, overflow: 'hidden' }}>
                    <DatePicker open={showDatePicker} autoFocus onBlur={() => setShowDatePicker(false)} onChange={(date) => { if (date) { setYear(date.year()); setMonth(date.month() + 1); setDay(date.date()); } setShowDatePicker(false); }} onOpenChange={(open) => setShowDatePicker(open)} />
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="zhpsulao" label={<Text style={{fontSize: '12px'}}>پسوڵەی سیستەم</Text>}>
                <InputNumber disabled style={{ width: "100%", height: "36px", borderRadius: "6px", fontWeight: 'bold', color: '#000' }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="zhpsulad" label={<Text style={{fontSize: '12px'}}>پسوڵەی دەستی</Text>}>
                <InputNumber disabled={!isEditable} style={{ width: "100%", height: "36px", borderRadius: "6px" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="mshID" label={<Text style={{fontSize: '12px'}}>ناوی وەرگر</Text>} rules={[{ required: true, message: 'ناو هەڵبژێرە' }]}>
                <Select disabled={!isEditable} showSearch style={{ height: "36px" }} options={customers.map(c => ({ value: c.id, label: c.Mname }))} filterOption={(input, option) => (option?.label ?? "").includes(input)} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="br" label={<Text style={{fontSize: '12px'}}>بڕی پارە</Text>} rules={[{ required: true, message: 'بڕ بنووسە' }]}>
                <InputNumber disabled={!isEditable} style={{ width: "100%", height: "36px", fontWeight: 'bold' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="memo" label={<Text style={{fontSize: '12px'}}>تێبینی</Text>}>
            <Input.TextArea disabled={!isEditable} rows={2} style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Row justify="end" style={{ marginTop: "5px" }}>
            <Col xs={24} style={{ textAlign: 'right' }}>
              <Space wrap size="small">
                <Button type="primary" icon={<PlusOutlined />} onClick={handleNew} disabled={isEditable && !editId} style={btnStyle("#0d9488")}>نوێ</Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} disabled={!isEditable} style={btnStyle(isEditable ? (editId ? "#f29339" : "#0d9488") : "#d9d9d9")}>{editId ? "پاشکەوت" : "تۆمارکردن"}</Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={handleCancel} disabled={!isEditable} style={{ ...btnStyle(), minWidth: "80px" }}>لادان</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};