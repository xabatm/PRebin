import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Table, Card, Button, Space, App, Popconfirm, Typography, 
  Row, Col, Select, Tag, DatePicker, Modal, InputNumber, Divider 
} from "antd";
import { 
  EditOutlined, DeleteOutlined, SearchOutlined, 
  CalendarOutlined, FileTextOutlined, SaveOutlined, PlusOutlined,
  DollarOutlined, PercentageOutlined, ShoppingCartOutlined
} from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";

const { Text } = Typography;

// --- ScrollDatePicker Component ---
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
      let m = value.month() + delta;
      if (m > 11) m = 0; if (m < 0) m = 11;
      newDate = value.month(m);
    }
    if (activeSegment === 'day') newDate = value.add(delta, 'day');
    onChange(newDate);
  };

  const segmentStyle = (type: string) => ({
    padding: "2px 8px", cursor: "pointer",
    background: activeSegment === type ? "#0d9488" : "transparent",
    color: activeSegment === type ? "#fff" : "#475569",
    borderRadius: "4px", fontWeight: "bold" as const,
    fontSize: "14px"
  });

  return (
    <div style={{ flex: 1, marginBottom: '8px' }}>
      <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "4px" }}>{label}</Text>
      <div 
        style={{ 
          display: "flex", alignItems: "center", border: "1px solid #e2e8f0", 
          height: "45px", borderRadius: "8px", padding: "0 10px", background: "#fff",
          outline: "none", position: 'relative'
        }}
        onWheel={(e) => { e.preventDefault(); updateDate(e.deltaY < 0 ? 1 : -1); }}
        tabIndex={0}
      >
        <CalendarOutlined onClick={() => setOpen(true)} style={{ color: "#0d9488", fontSize: '18px', marginLeft: "10px", cursor: 'pointer' }} />
        <div style={{ display: "flex", direction: "ltr", alignItems: "center", flex: 1, justifyContent: "center" }}>
          <span onClick={() => setActiveSegment('year')} style={segmentStyle('year')}>{value.year()}</span>
          <span style={{ color: "#cbd5e1", margin: "0 4px" }}>/</span>
          <span onClick={() => setActiveSegment('month')} style={segmentStyle('month')}>{String(value.month() + 1).padStart(2, '0')}</span>
          <span style={{ color: "#cbd5e1", margin: "0 4px" }}>/</span>
          <span onClick={() => setActiveSegment('day')} style={segmentStyle('day')}>{String(value.date()).padStart(2, '0')}</span>
        </div>
        <div style={{ position: "absolute", visibility: "hidden" }}>
          <DatePicker open={open} onOpenChange={setOpen} onChange={(d) => { if(d) onChange(d); setOpen(false); }} />
        </div>
      </div>
    </div>
  );
};

export const SaleList: React.FC = () => {
  const { message: msg } = App.useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [fromDate, setFromDate] = useState(dayjs()); 
  const [toDate, setToDate] = useState(dayjs());
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [editDetails, setEditDetails] = useState<any[]>([]);
  const [editDate, setEditDate] = useState<dayjs.Dayjs>(dayjs());
  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
  const [editNaqd, setEditNaqd] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("sale").select(`*, mshtary(Mname)`)
        .gte("date", fromDate.format("YYYY-MM-DD"))
        .lte("date", toDate.format("YYYY-MM-DD"))
        .order("id", { ascending: false });
      if (selectedCustomer) query = query.eq("mshID", selectedCustomer);
      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);
    } catch (error: any) {
      msg.error("هەڵە لە بارکردنی داتاکان");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedCustomer, msg]);

  useEffect(() => {
    const init = async () => {
      const [{ data: cData }, { data: pData }] = await Promise.all([
        supabase.from("mshtary").select("id, Mname").order("Mname"),
        supabase.from("barham").select("id, itemname, addoffcarton, sealprice").order("itemname")
      ]);
      if (cData) setCustomers(cData);
      if (pData) setProducts(pData);
      fetchData();
    };
    init();
  }, [fetchData]);

  const currentTotal = useMemo(() => editDetails.reduce((sum, item) => sum + (item.total_price || 0), 0), [editDetails]);
  const currentNetTotal = useMemo(() => currentTotal - editDiscount, [currentTotal, editDiscount]);
  const currentBaqi = useMemo(() => currentNetTotal - editNaqd, [currentNetTotal, editNaqd]);

  const openEditModal = async (record: any) => {
    setEditingSale(record);
    setEditDate(dayjs(record.date));
    setEditCustomerId(record.mshID);
    setEditNaqd(record.naqd || 0);
    setEditDiscount(record.discount || 0);
    const { data: details, error } = await supabase.from("sales_details").select("*").eq("saleID", record.id);
    if (!error) {
      setEditDetails(details || []);
      setIsEditModalOpen(true);
    } else {
      msg.error("نەتوانرا وردەکارییەکان باربکرێت");
    }
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newList = [...editDetails];
    const item = { ...newList[index] };
    const selectedPro = products.find(p => p.id === (field === 'proID' ? value : item.proID));
    const ratio = selectedPro?.addoffcarton || 1;
    
    if (field === 'proID') {
      item.proID = value;
      item.itemname = selectedPro?.itemname;
      item.price = selectedPro?.sealprice || 0;
      item.total_price = Math.round(item.karton * item.price);
    } else if (field === 'karton') {
      item.karton = value;
      item.dana = Number((value * ratio).toFixed(2));
      item.total_price = Math.round(value * (item.price || 0));
    } else if (field === 'dana') {
      item.dana = value;
      item.karton = Number((value / ratio).toFixed(2));
      item.total_price = Math.round(item.karton * (item.price || 0));
    }
    newList[index] = item;
    setEditDetails(newList);
  };

  const saveChanges = async () => {
    try {
      const { error: saleErr } = await supabase.from("sale").update({
        date: editDate.format("YYYY-MM-DD"), mshID: editCustomerId,
        total: currentTotal, discount: editDiscount, net_total: currentNetTotal,
        naqd: editNaqd, baqi: currentBaqi
      }).eq("id", editingSale.id);
      if (saleErr) throw saleErr;

      for (const item of editDetails) {
        if (item.id) {
          await supabase.from("sales_details").update({
            proID: item.proID, itemname: item.itemname, karton: item.karton,
            dana: item.dana, price: item.price, total_price: item.total_price
          }).eq("id", item.id);
        } else {
          const { tempId, ...newItem } = item;
          await supabase.from("sales_details").insert([newItem]);
        }
      }
      msg.success("گۆڕانکارییەکان پاشکەوت کران");
      setIsEditModalOpen(false);
      fetchData();
    } catch (e) { msg.error("هەڵەیەک ڕوویدا"); }
  };

  return (
    <div style={{ padding: "8px", direction: 'rtl', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Card style={{ marginBottom: "12px", borderRadius: "12px" }}>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} md={8}>
            <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>کڕیار</Text>
            <Select 
              placeholder="گەڕان بۆ کڕیار..." allowClear showSearch 
              style={{ width: "100%", marginTop: "4px" }}
              options={customers.map(c => ({ value: c.id, label: c.Mname }))} 
              onChange={setSelectedCustomer}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ScrollDatePicker label="لە بەرواری" value={fromDate} onChange={setFromDate} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ScrollDatePicker label="بۆ بەرواری" value={toDate} onChange={setToDate} />
          </Col>
          <Col xs={24} md={4}>
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchData} block size="large" style={{ background: "#0d9488", height: '45px' }}>گەڕان</Button>
          </Col>
        </Row>
      </Card>

      <Card title={<Space><FileTextOutlined style={{ color: "#0d9488" }} /><Text strong>تۆماری فرۆشتنەکان</Text></Space>}>
        <Table dataSource={data} loading={loading} rowKey="id" scroll={{ x: 'max-content' }} size="middle">
          <Table.Column title="ژ.پ" dataIndex="id" width={70} render={(v) => <Tag color="blue">#{v}</Tag>} />
          <Table.Column title="بەروار" dataIndex="date" width={100} render={(d) => dayjs(d).format("MM/DD")} />
          <Table.Column title="کڕیار" dataIndex={["mshtary", "Mname"]} />
          <Table.Column title="کۆ" dataIndex="net_total" align="right" render={(v) => <Text strong>{Number(v || 0).toLocaleString()}</Text>} />
          <Table.Column title="باقی" dataIndex="baqi" align="right" render={(v) => <Text type={v > 0 ? "danger" : "secondary"}>{Number(v || 0).toLocaleString()}</Text>} />
          <Table.Column title="کردار" align="center" fixed="right" width={100} render={(_, record: any) => (
            <Space>
              <Button type="text" icon={<EditOutlined style={{ color: '#0d9488' }} />} onClick={() => openEditModal(record)} />
              <Popconfirm title="سڕینەوە؟" onConfirm={async () => { await supabase.from("sale").delete().eq("id", record.id); fetchData(); }}>
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )} />
        </Table>
      </Card>

      <Modal
        title={<Text strong><EditOutlined /> چاککردنی پسوڵە #{editingSale?.id}</Text>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        width={1000}
        footer={[
          <div key="footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <Row gutter={[8, 8]}>
               <Col xs={12} sm={8}>
                 <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                   <Text style={{ fontSize: '10px', display: 'block' }}>کۆیی گشتی</Text>
                   <Text strong>{currentTotal.toLocaleString()}</Text>
                 </div>
               </Col>
               <Col xs={12} sm={8}>
                 <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                   <Text style={{ fontSize: '10px', display: 'block' }}>پاش داشکاندن</Text>
                   <Text strong style={{ color: '#0d9488' }}>{currentNetTotal.toLocaleString()}</Text>
                 </div>
               </Col>
               <Col xs={24} sm={8}>
                 <div style={{ background: '#fff7ed', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ffedd5' }}>
                   <Text style={{ fontSize: '10px', display: 'block' }}>باقی (قەرز)</Text>
                   <Text strong style={{ color: '#ea580c' }}>{currentBaqi.toLocaleString()}</Text>
                 </div>
               </Col>
             </Row>
             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
               <Button onClick={() => setIsEditModalOpen(false)}>داخستن</Button>
               <Button type="primary" icon={<SaveOutlined />} onClick={saveChanges} style={{ background: "#0d9488" }}>پاشکەوت</Button>
             </div>
          </div>
        ]}
      >
        <div style={{ direction: 'rtl' }}>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>کڕیار</Text>
              <Select style={{ width: '100%', marginTop: 4 }} showSearch value={editCustomerId} options={customers.map(c => ({ value: c.id, label: c.Mname }))} onChange={setEditCustomerId} />
            </Col>
            <Col xs={24} sm={12}>
              <ScrollDatePicker label="بەروار" value={editDate} onChange={setEditDate} />
            </Col>
            <Col xs={12} sm={12}>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>داشکاندن</Text>
              <InputNumber style={{ width: '100%', marginTop: 4 }} value={editDiscount} onChange={(val) => setEditDiscount(val || 0)} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Col>
            <Col xs={12} sm={12}>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>واصڵکراو</Text>
              <InputNumber style={{ width: '100%', marginTop: 4 }} value={editNaqd} onChange={(val) => setEditNaqd(val || 0)} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Col>
          </Row>

          <Divider orientation="right">
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => setEditDetails([...editDetails, { saleID: editingSale?.id, proID: null, karton: 0, dana: 0, price: 0, total_price: 0, tempId: Date.now() }])} style={{ color: '#0d9488' }}>زیادکردن</Button>
          </Divider>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {editDetails.map((item, index) => (
              <Card 
                key={item.id || item.tempId} 
                size="small" 
                style={{ marginBottom: 8, background: '#fafafa' }}
                title={<Space><ShoppingCartOutlined /> <Text style={{ fontSize: '12px' }}>ڕیزی {index + 1}</Text></Space>}
                extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => { const nl = [...editDetails]; nl.splice(index, 1); setEditDetails(nl); }} />}
              >
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <Select style={{ width: '100%' }} showSearch value={item.proID} options={products.map(p => ({ value: p.id, label: p.itemname }))} onChange={(val) => handleUpdateItem(index, 'proID', val)} />
                  </Col>
                  <Col span={8}>
                    <Text style={{ fontSize: 10 }}>کارتۆن</Text>
                    <InputNumber min={0} style={{ width: '100%' }} value={item.karton} onChange={(v) => handleUpdateItem(index, 'karton', v || 0)} />
                  </Col>
                  <Col span={8}>
                    <Text style={{ fontSize: 10 }}>عدد</Text>
                    <InputNumber min={0} style={{ width: '100%' }} value={item.dana} onChange={(v) => handleUpdateItem(index, 'dana', v || 0)} />
                  </Col>
                  <Col span={8}>
                    <Text style={{ fontSize: 10 }}>کۆ</Text>
                    <div style={{ padding: '4px', background: '#eee', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>{item.total_price?.toLocaleString()}</div>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};