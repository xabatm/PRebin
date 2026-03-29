import React, { useState, useEffect } from "react";
import { Table, Card, Button, Space, App, Popconfirm, Typography, Row, Col, Select, DatePicker, Tag } from "antd";
import { EditOutlined, DeleteOutlined, TableOutlined, SearchOutlined, CalendarOutlined } from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

// --- ScrollDatePicker لێرەدا وەک خۆی دەمێنێتەوە ---
const ScrollDatePicker: React.FC<{ 
  label: string, 
  value: dayjs.Dayjs, 
  onChange: (d: dayjs.Dayjs) => void 
}> = ({ label, value, onChange }) => {
  const [activeSegment, setActiveSegment] = useState<'year' | 'month' | 'day'>('day');
  const [open, setOpen] = useState(false);

  const updateDate = (delta: number) => {
    let newDate = value;
    if (activeSegment === 'year') newDate = value.add(delta, 'year');
    if (activeSegment === 'month') {
      let nextMonth = value.month() + delta;
      if (nextMonth > 11) nextMonth = 0;
      if (nextMonth < 0) nextMonth = 11;
      newDate = value.month(nextMonth);
    }
    if (activeSegment === 'day') newDate = value.add(delta, 'day');
    onChange(newDate);
  };

  const segmentStyle = (type: string) => ({
    padding: "1px 6px",
    cursor: "pointer",
    background: activeSegment === type ? "#0d9488" : "transparent",
    color: activeSegment === type ? "#fff" : "#000",
    borderRadius: "4px",
    fontWeight: "bold" as const,
    minWidth: type === 'year' ? "50px" : "30px",
    textAlign: "center" as const
  });

  return (
    <div>
      <Text style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold", display: "block", marginBottom: "2px" }}>{label}:</Text>
      <div 
        style={{ 
          display: "flex", alignItems: "center", border: "1px solid #d9d9d9", 
          height: "36px", borderRadius: "6px", padding: "0 8px", background: "#fff",
          outline: "none"
        }}
        onWheel={(e) => { e.preventDefault(); updateDate(e.deltaY < 0 ? 1 : -1); }}
        tabIndex={0}
      >
        <CalendarOutlined onClick={() => setOpen(true)} style={{ color: "#0d9488", marginLeft: "8px", fontSize: "16px" }} />
        <div style={{ display: "flex", direction: "ltr", alignItems: "center", flex: 1, justifyContent: "center", fontSize: "13px" }}>
          <span onClick={() => setActiveSegment('year')} style={segmentStyle('year')}>{value.year()}</span>
          <span style={{ color: "#d1d5db", margin: "0 2px" }}>/</span>
          <span onClick={() => setActiveSegment('month')} style={segmentStyle('month')}>{String(value.month() + 1).padStart(2, '0')}</span>
          <span style={{ color: "#d1d5db", margin: "0 2px" }}>/</span>
          <span onClick={() => setActiveSegment('day')} style={segmentStyle('day')}>{String(value.date()).padStart(2, '0')}</span>
        </div>
        <div style={{ position: "absolute", visibility: "hidden" }}>
          <DatePicker open={open} onOpenChange={setOpen} onChange={(d) => { if(d) onChange(d); setOpen(false); }} />
        </div>
      </div>
    </div>
  );
};

export const WargrtnList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: cData } = await supabase.from("mshtary").select("id, Mname").order("Mname");
      if (cData) setCustomers(cData);
      fetchData();
    };
    init();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from("wargrtn").select(`*, mshtary(Mname)` )
      .gte("date", fromDate.format("YYYY-MM-DD"))
      .lte("date", toDate.format("YYYY-MM-DD"))
      .order("id", { ascending: false });

    if (selectedCustomer) query = query.eq("mshID", selectedCustomer);
    const { data: result } = await query;
    if (result) setData(result);
    setLoading(false);
  };

  const cardStyle: React.CSSProperties = {
    marginBottom: "12px", 
    borderRadius: "8px", 
    borderTop: "4px solid #0d9488",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  };

  return (
    <div style={{ padding: "8px" }}>
      {/* فلتەرەکان - Responsive */}
      <Card style={cardStyle} bodyStyle={{ padding: "12px" }}>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} sm={24} md={7}>
            <Text style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold", display: "block" }}>ناوی پێدەر:</Text>
            <Select 
              placeholder="هەموو " 
              allowClear 
              showSearch 
              style={{ width: "100%", height: "36px" }}
              options={customers.map(c => ({ value: c.id, label: c.Mname }))} 
              onChange={setSelectedCustomer} 
              filterOption={(input, option) => (option?.label ?? "").includes(input)}
            />
          </Col>
          <Col xs={12} sm={12} md={6}><ScrollDatePicker label="لە بەرواری" value={fromDate} onChange={setFromDate} /></Col>
          <Col xs={12} sm={12} md={6}><ScrollDatePicker label="بۆ بەرواری" value={toDate} onChange={setToDate} /></Col>
          <Col xs={24} md={5}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={fetchData} 
              block
              style={{ background: "#0d9488", height: "36px", borderRadius: "6px", fontWeight: "bold" }}
            >
              نیشاندان
            </Button>
          </Col>
        </Row>
      </Card>

      {/* لیست - Responsive Table */}
      <Card 
        style={cardStyle}
        title={
          <Space style={{ color: "#0d9488" }}>
            <TableOutlined /> 
            <span style={{ fontWeight: "bold", fontSize: "14px" }}>لیستی وەرگرتنەکان</span>
          </Space>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Table 
          dataSource={data} 
          loading={loading} 
          rowKey="id" 
          pagination={{ pageSize: 15, simple: window.innerWidth < 768 }} 
          size="small"
          // --- لێرەدا گرنگی بە شاشەی موبایل دراوە ---
          scroll={{ x: 700 }} // ڕێگە دەدات بە سکرۆڵی ئاسۆیی ئەگەر شاشە بچووک بوو
          summary={(pageData) => {
            let totalBr = 0;
            pageData.forEach(({ br }) => { totalBr += Number(br) || 0; });
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ background: "#f8fafc" }}>
                  <Table.Summary.Cell index={0} colSpan={window.innerWidth < 768 ? 2 : 4}>
                    <Text strong>کۆیی گشتی:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong style={{ color: "#0d9488" }}>{totalBr.toLocaleString()}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        >
          <Table.Column 
            title="ڕیز" 
            key="index" 
            width={50}
            fixed="right"
            align="center"
            render={(_, __, index) => <Text type="secondary" style={{fontSize: '11px'}}>{index + 1}</Text>} 
          />
          <Table.Column 
            title="ژ.پسوڵە" 
            dataIndex="zhpsulao" 
            width={100}
            render={(v) => <Tag color="blue" style={{margin:0}}>#{v}</Tag>} 
          />
          <Table.Column 
            title="بەروار" 
            dataIndex="date" 
            width={100}
            render={(d) => <span style={{fontSize: '12px'}}>{dayjs(d).format("YYYY/MM/DD")}</span>} 
          />
          <Table.Column 
            title="ناوی مشتەری" 
            dataIndex={["mshtary", "Mname"]} 
            ellipsis // ئەگەر ناوەکە زۆر درێژ بوو، نایبڕێت بەڵکو سێ خاڵ دادەنێت
          />
          <Table.Column 
            title="بڕ" 
            dataIndex="br" 
            width={110}
            render={(v) => <Text strong style={{color: "#0d9488"}}>{Number(v).toLocaleString()}</Text>} 
          />
          <Table.Column 
            title="کردارەکان" 
            width={90}
            fixed="left" // لە موبایلدا لە لای چەپ جێگیر دەبێت
            align="center" 
            render={(_, record: any) => (
              <Space size="small">
                <Button size="small" icon={<EditOutlined />} onClick={() => navigate("/wargrtn", { state: { editData: record } })} />
                <Popconfirm title="سڕینەوە؟" onConfirm={async () => { await supabase.from("wargrtn").delete().eq("id", record.id); fetchData(); }}>
                  <Button size="small" icon={<DeleteOutlined />} danger ghost />
                </Popconfirm>
              </Space>
            )} 
          />
        </Table>
      </Card>
    </div>
  );
};