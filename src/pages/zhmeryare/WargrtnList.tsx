import React, { useState, useEffect } from "react";
import { Table, Card, Button, Space, App, Popconfirm, Typography, Row, Col, Select, DatePicker, Tag } from "antd";
import { EditOutlined, DeleteOutlined, TableOutlined, SearchOutlined, CalendarOutlined } from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

// پێکهاتەی بەروار بە لۆجیکی سکرۆڵ (RTL)
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") { e.preventDefault(); updateDate(1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); updateDate(-1); } 
    else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (activeSegment === 'day') setActiveSegment('month');
      else if (activeSegment === 'month') setActiveSegment('year');
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (activeSegment === 'year') setActiveSegment('month');
      else if (activeSegment === 'month') setActiveSegment('day');
    }
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
          outline: "none", boxShadow: activeSegment ? "0 0 0 2px rgba(13, 148, 136, 0.1)" : "none"
        }}
        onWheel={(e) => { e.preventDefault(); updateDate(e.deltaY < 0 ? 1 : -1); }}
        onKeyDown={handleKeyDown}
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

  // ستایلی کارتی ستاندارد کە هێڵە سەوزەکەی لە سەرەوەیە
  const cardStyle: React.CSSProperties = {
    marginBottom: "12px", 
    borderRadius: "8px", 
    borderTop: "4px solid #0d9488", // ئەمە ئەو هێڵە باریكەیە کە داوات کردبوو
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* سندوقی فلتەرەکان */}
      <Card style={cardStyle} bodyStyle={{ padding: "12px 16px" }}>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} md={7}>
            <Text style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold", display: "block", marginBottom: "2px" }}>ناوی پێدەر:</Text>
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
          <Col xs={12} md={6}><ScrollDatePicker label="لە بەرواری" value={fromDate} onChange={setFromDate} /></Col>
          <Col xs={12} md={6}><ScrollDatePicker label="بۆ بەرواری" value={toDate} onChange={setToDate} /></Col>
          <Col xs={24} md={5}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={fetchData} 
              style={{ width: "100%", background: "#0d9488", height: "36px", borderRadius: "6px", fontWeight: "bold" }}
            >
              نیشاندان
            </Button>
          </Col>
        </Row>
      </Card>

      {/* خشتەی ئەنجامەکان */}
      <Card 
        style={cardStyle}
        title={
          <Space style={{ color: "#0d9488", padding: "4px 0" }}>
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
          pagination={{ pageSize: 15 }} 
          size="small"
          summary={(pageData) => {
            let totalBr = 0;
            pageData.forEach(({ br }) => { totalBr += Number(br) || 0; });
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ background: "#f8fafc" }}>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <Text strong style={{ fontSize: "13px" }}>کۆیی گشتی:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong style={{ color: "#0d9488", fontSize: "14px" }}>
                      {totalBr.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        >
          {/* ستونی ڕیز بۆ ئەژمارکردن */}
          <Table.Column 
            title="ڕیز" 
            key="index" 
            width={50}
            align="center"
            render={(_, __, index) => <Text type="secondary" style={{fontSize: '12px'}}>{index + 1}</Text>} 
          />
          <Table.Column title="ژ.سیستەم" dataIndex="zhpsulao" render={(v) => <Tag color="blue">#{v}</Tag>} />
          <Table.Column title="ژ.دەستی" dataIndex="zhpsulad" />
          <Table.Column title="بەروار" dataIndex="date" render={(d) => dayjs(d).format("YYYY/MM/DD")} />
          <Table.Column title="ناوی مشتەری" dataIndex={["mshtary", "Mname"]} />
          <Table.Column title="بڕ" dataIndex="br" render={(v) => <Text strong color="#0d9488">{Number(v).toLocaleString()}</Text>} />
          <Table.Column title="کردارەکان" align="center" render={(_, record: any) => (
            <Space>
              <Button size="small" icon={<EditOutlined />} onClick={() => navigate("/wargrtn", { state: { editData: record } })} />
              <Popconfirm title="دڵنیای لە سڕینەوە ؟" onConfirm={async () => { await supabase.from("wargrtn").delete().eq("id", record.id); fetchData(); }}>
                <Button size="small" icon={<DeleteOutlined />} danger ghost />
              </Popconfirm>
            </Space>
          )} />
        </Table>
      </Card>
    </div>
  );
};