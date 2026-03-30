import React, { useState, useEffect, useRef } from "react";
import {
  Row, Col, Card, Button, Select,
  DatePicker, InputNumber, Table, Typography, Space, App, Divider, Input, Badge
} from "antd";
import {
  PlusOutlined, DeleteOutlined, ShoppingCartOutlined, PlusCircleOutlined,
  UnorderedListOutlined, ArrowRightOutlined, CheckCircleOutlined, CalendarOutlined,
  PrinterOutlined, UserOutlined, TagOutlined, FileTextOutlined, DollarOutlined
} from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";
import { useGetIdentity } from "@refinedev/core";
import { useLocation, Link } from "react-router-dom";

const { Text, Title } = Typography;

// ── DESIGN TOKENS ─────────────────────────────────────────────
const C = {
  navy:     "#0f172a",
  navyMid: "#1e293b",
  teal:     "#0d9488",
  tealLt:   "#14b8a6",
  tealPale:"#ccfbf1",
  amber:    "#f59e0b",
  red:      "#ef4444",
  slate:    "#64748b",
  slateLt: "#94a3b8",
  bg:       "#f1f5f9",
  white:    "#ffffff",
  border:   "#e2e8f0",
  shadow:   "0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)",
  shadowMd:"0 4px 24px rgba(0,0,0,.12)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px", fontWeight: 700, color: C.slate,
  letterSpacing: ".04em", textTransform: "uppercase", display: "block", marginBottom: 6
};

const fieldBox: React.CSSProperties = {
  background: C.white, border: `1.5px solid ${C.border}`,
  borderRadius: 10, padding: "10px 14px", boxShadow: C.shadow,
  transition: "border-color .2s"
};

// ── ScrollDatePicker ───────────────────────────────────────────
const ScrollDatePicker: React.FC<{
  label: string; value: dayjs.Dayjs; onChange: (d: dayjs.Dayjs) => void;
}> = ({ label, value, onChange }) => {
  const [active, setActive] = useState<"year"|"month"|"day">("day");
  const [open, setOpen]     = useState(false);

  const update = (delta: number) => {
    if (active === "year")  return onChange(value.add(delta, "year"));
    if (active === "month") {
      let m = value.month() + delta;
      if (m > 11) m = 0; if (m < 0) m = 11;
      return onChange(value.month(m));
    }
    onChange(value.add(delta, "day"));
  };

  const seg = (type: string): React.CSSProperties => ({
    padding: "2px 8px", cursor: "pointer", borderRadius: 6, fontWeight: 700,
    fontSize: 14, minWidth: type === "year" ? 52 : 32, textAlign: "center",
    background: active === type ? C.teal : "transparent",
    color:       active === type ? C.white : C.navy,
    transition: "all .15s"
  });

  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <div
        style={{ ...fieldBox, display: "flex", alignItems: "center", height: 44, cursor: "default" }}
        onWheel={(e) => { e.preventDefault(); update(e.deltaY < 0 ? 1 : -1); }}
        tabIndex={0}
      >
        <CalendarOutlined
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          style={{ color: C.teal, fontSize: 16, cursor: "pointer", marginLeft: 8 }}
        />
        <div style={{ display:"flex", direction:"ltr", alignItems:"center", flex:1, justifyContent:"center", gap:2 }}>
          <span onClick={() => setActive("year")}   style={seg("year")}>{value.year()}</span>
          <span style={{ color: C.slateLt }}>/</span>
          <span onClick={() => setActive("month")} style={seg("month")}>{String(value.month()+1).padStart(2,"0")}</span>
          <span style={{ color: C.slateLt }}>/</span>
          <span onClick={() => setActive("day")}    style={seg("day")}>{String(value.date()).padStart(2,"0")}</span>
        </div>
        <div style={{ position:"absolute", visibility:"hidden" }}>
          <DatePicker open={open} onOpenChange={setOpen} onChange={(d) => { if(d) onChange(d); setOpen(false); }} />
        </div>
      </div>
    </div>
  );
};

// ── SummaryBox ─────────────────────────────────────────────────
const SummaryRow: React.FC<{ label:string; value:string; bold?:boolean; accent?:string }> = 
({ label, value, bold, accent }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0",
    borderBottom:`1px solid ${C.border}` }}>
    <Text style={{ color: C.slate, fontWeight: bold ? 700 : 400 }}>{label}</Text>
    <Text style={{ fontWeight: bold ? 700 : 500, fontSize: bold ? 16 : 14, color: accent || C.navy }}>{value}</Text>
  </div>
);

// ── MAIN COMPONENT ─────────────────────────────────────────────
export const SaleForm: React.FC = () => {
  const { message: msg } = App.useApp();
  const { data: user }   = useGetIdentity<any>();

  const productSelectRef = useRef<any>(null);
  const kartonInputRef   = useRef<any>(null);
  const invNoRef         = useRef<number>(0);

  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [customers,   setCustomers]   = useState<any[]>([]);
  const [products,    setProducts]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [saleDate,  setSaleDate]  = useState(dayjs());
  const [invNo,     setInvNo]     = useState<number>(0);
  const [memo,      setMemo]      = useState("");
  const [items,     setItems]     = useState<any[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qtyKarton,  setQtyKarton]  = useState<number>(0);
  const [qtyDana,    setQtyDana]    = useState<number>(0);
  const [discount,   setDiscount]   = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const [{ data: comp }, { data: cData }, { data: pData }, { data: sData }] = await Promise.all([
        supabase.from("company").select("*").single(),
        supabase.from("mshtary").select("*").order("Mname"),
        supabase.from("barham").select("*").order("itemname"),
        supabase.from("sale").select("inv_no").order("inv_no", { ascending:false }).limit(1),
      ]);
      if (comp)  setCompanyInfo(comp);
      if (cData) setCustomers(cData);
      if (pData) setProducts(pData);
      const nextInv = sData && sData[0] ? Number(sData[0].inv_no) + 1 : 1;
      invNoRef.current = nextInv;
      setInvNo(nextInv);
    })();
  }, []);

  const totalBill       = items.reduce((s, i) => s + i.total_price, 0);
  const netTotal        = totalBill - discount;
  const remainingAmount = netTotal - paidAmount;

  const handlePrint = () => {
    if (!selectedCustomer) return msg.warning("تکایە سەرەتا مشتەری هەڵبژێرە");
    window.print();
  };

  const handleSave = async () => {
    if (!selectedCustomer) return msg.error("تکایە مشتەری هەڵبژێرە");
    if (items.length === 0) return msg.error("لیستی کاڵاکان بەتاڵە");
    setLoading(true);
    try {
      const { data: saleRes, error: saleErr } = await supabase.from("sale").insert([{
        inv_no: invNo, date: saleDate.format("YYYY-MM-DD"),
        mshID: selectedCustomer.id, total: totalBill,
        discount, net_total: netTotal, naqd: paidAmount,
        baqi: remainingAmount, memo, userID: user?.id
      }]).select().single();
      if (saleErr) throw saleErr;
      await supabase.from("sales_details").insert(
        items.map(item => ({
          saleID: saleRes.id, proID: item.proID, itemname: item.itemname,
          karton: item.karton, dana: item.dana, price: item.price, total_price: item.total_price
        }))
      );
      msg.success("پسوڵەکە بە سەرکەوتوویی تۆمارکرا ✓");
      setItems([]); setDiscount(0); setPaidAmount(0); setMemo("");
      setSelectedCustomer(null);
      setInvNo(p => { const next = p + 1; invNoRef.current = next; return next; });
      setCurrentStep(1);
    } catch (error: any) {
      msg.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!selectedProduct)               return msg.warning("تکایە کاڵایەک هەڵبژێرە");
    if (qtyKarton === 0 && qtyDana === 0) return msg.warning("بڕ دیاری بکە");
    setItems(prev => [...prev, {
      key:         Date.now(),
      proID:       selectedProduct.id,
      itemname:    selectedProduct.itemname,
      addoffcarton: selectedProduct.addoffcarton,
      karton:      qtyKarton,
      dana:        qtyDana,
      price:       selectedProduct.sealprice,
      total_price: Math.round(qtyKarton * (selectedProduct.sealprice || 0)),
    }]);
    setSelectedProduct(null); setQtyKarton(0); setQtyDana(0);
    setTimeout(() => productSelectRef.current?.focus(), 100);
  };

  const updateItemRow = (key: number, field: "karton"|"dana", val: number) =>
    setItems(prev => prev.map(item => {
      if (item.key !== key) return item;
      const ratio = item.addoffcarton || 1;
      const newK  = field === "karton" ? val : Number((val / ratio).toFixed(2));
      const newD  = field === "karton" ? Number((val * ratio).toFixed(2)) : val;
      return { ...item, karton: newK, dana: newD, total_price: Math.round(newK * item.price) };
    }));

  return (
    <div style={{ background: C.bg, minHeight:"100vh", direction:"rtl", fontFamily:"'Noto Sans Arabic', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
        @media print {
          body * { visibility:hidden !important; }
          .print-area,.print-area * { visibility:visible !important; }
          .print-area { display:block !important; position:absolute !important; inset:0; padding:8mm; background:#fff !important; }
          .no-print { display:none !important; }
          table { width:100%; border-collapse:collapse; }
          th,td { border:1px solid #555 !important; padding:7px 10px; text-align:center; font-size:12px; }
          @page { size:A4; margin:10mm; }
        }
        .print-area { display:none; }

        .sale-select .ant-select-selector { height:44px !important; border-radius:10px !important; border-color:${C.border} !important; align-items:center; }
        .sale-select .ant-select-selection-item { line-height:42px !important; }
        .sale-input-number .ant-input-number-input { height:42px !important; }
        .ant-input-number { border-radius:10px !important; border-color:${C.border} !important; }
        .sale-table .ant-table-thead > tr > th { background:${C.navyMid} !important; color:#fff !important; font-weight:700; font-size:13px; }
        .sale-table .ant-table-tbody > tr:hover > td { background:${C.tealPale} !important; }
        .sale-table .ant-table-tbody > tr > td { padding:8px 10px; }
        .step-card { border-radius:16px !important; box-shadow:${C.shadowMd} !important; border:none !important; overflow:hidden; }
      `}</style>

      <div className="no-print" style={{ padding:"16px" }}>

        {currentStep === 1 && (
          <Card
            className="step-card"
            title={
              <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", padding:"4px 0" }}>
                <ShoppingCartOutlined style={{ color:C.white, fontSize:20 }} />
                <span style={{ fontSize:17, fontWeight:700, color:C.white }}>تۆمارکردنی فرۆشتنی نوێ</span>
                <Badge
                  count={`#${invNo}`}
                  style={{ background:C.teal, fontFamily:"monospace", fontSize:13, borderRadius:6, padding:"0 8px" }}
                />
              </div>
            }
            styles={{ header:{ background:`linear-gradient(135deg,${C.tealLt} 0%,${C.tealLt} 100%)`, borderBottom:"none" },
                      body:{ padding:"24px 20px" } }}
          >
            <div style={{ background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px", marginBottom:20 }}>
              <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} sm={8}>
                  <span style={labelStyle}><UserOutlined style={{marginLeft:4}}/>ناوی مشتەری</span>
                  <Select
                    className="sale-select" showSearch style={{ width:"100%" }}
                    placeholder="گەڕان و هەڵبژاردنی مشتەری"
                    options={customers.map(c => ({ value:c.id, label:c.Mname, original:c }))}
                    filterOption={(input, opt) => (opt?.label as string)?.includes(input)}
                    onChange={(_, opt:any) => { setSelectedCustomer(opt.original); setTimeout(()=>productSelectRef.current?.focus(),100); }}
                    value={selectedCustomer?.id}
                    suffixIcon={<UserOutlined style={{color:C.teal}}/>}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <ScrollDatePicker label="بەرواری پسوڵە" value={saleDate} onChange={setSaleDate} />
                </Col>
                <Col xs={12} sm={8}>
                  <span style={labelStyle}><TagOutlined style={{marginLeft:4}}/>ژمارەی پسوڵە</span>
                  <InputNumber
                    value={invNo} onChange={(v) => { setInvNo(v||0); invNoRef.current = v||0; }}
                    style={{ width:"100%", height:44 }} className="sale-input-number"
                  />
                </Col>
              </Row>
            </div>

            <div style={{ background:"#f0fdf4", border:`1.5px dashed ${C.teal}`, borderRadius:12, padding:"16px 20px", marginBottom:20 }}>
              <div style={{ marginBottom:12, fontWeight:700, color:C.teal, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
                <PlusOutlined /> زیادکردنی کاڵا
              </div>
              <Row gutter={[10, 10]} align="bottom">
                <Col xs={24} sm={10}>
                  <span style={labelStyle}>کاڵا هەڵبژێرە</span>
                  <Select
                    ref={productSelectRef} className="sale-select" showSearch
                    placeholder="گەڕان بەپێی ناو یان کۆد"
                    value={selectedProduct?.id} style={{ width:"100%", height:44 }}
                    options={products.map(p => ({ value:p.id, label:p.itemname, original:p }))}
                    filterOption={(input, opt) => (opt?.label as string)?.includes(input)}
                    onChange={(_, opt:any) => { setSelectedProduct(opt.original); setTimeout(()=>kartonInputRef.current?.focus(),100); }}
                  />
                </Col>
                <Col xs={8} sm={4}>
                  <span style={labelStyle}>کارتۆن</span>
                  <InputNumber
                    ref={kartonInputRef} min={0} step={0.1} value={qtyKarton}
                    style={{ width:"100%", height:44 }}
                    onChange={(v) => { setQtyKarton(v||0); if(selectedProduct) setQtyDana(Number(((v||0)*selectedProduct.addoffcarton).toFixed(2))); }}
                    onPressEnter={addItem}
                  />
                </Col>
                <Col xs={8} sm={4}>
                  <span style={labelStyle}>دانە</span>
                  <InputNumber
                    min={0} value={qtyDana} style={{ width:"100%", height:44 }}
                    onChange={(v) => { setQtyDana(v||0); if(selectedProduct) setQtyKarton(Number(((v||0)/selectedProduct.addoffcarton).toFixed(2))); }}
                  />
                </Col>
                <Col xs={8} sm={6}>
                  <Button
                    type="primary" icon={<PlusOutlined />} block onClick={addItem}
                    style={{ height:44, background:C.teal, border:"none", borderRadius:10, fontWeight:700, fontSize:14 }}
                  >
                    خستنە لیست
                  </Button>
                </Col>
              </Row>
            </div>

            <Table
              className="sale-table" dataSource={items}
              pagination={false} size="small" bordered scroll={{ x:600 }}
              style={{ borderRadius:12, overflow:"hidden" }}
              locale={{ emptyText: <div style={{ padding:32, color:C.slateLt }}>هیچ کاڵایەک زیاد نەکراوە</div> }}
            >
              <Table.Column title="#" width={44} align="center" render={(_, __, i) => i+1} />
              <Table.Column title="ناوی کاڵا" dataIndex="itemname" />
              <Table.Column title="کارتۆن" width={100} render={(_, r:any) =>
                <InputNumber size="small" value={r.karton} onChange={(v) => updateItemRow(r.key,"karton",v||0)} style={{width:"100%"}}/>} />
              <Table.Column title="دانە" width={100} render={(_, r:any) =>
                <InputNumber size="small" value={r.dana} onChange={(v) => updateItemRow(r.key,"dana",v||0)} style={{width:"100%"}}/>} />
              <Table.Column title="نرخ" width={110} dataIndex="price"
                render={(v) => <Text style={{ color:C.slate }}>{v?.toLocaleString()}</Text>} />
              <Table.Column title="کۆ" width={120} dataIndex="total_price"
                render={(v) => <Text strong style={{ color:C.teal, fontSize:14 }}>{v?.toLocaleString()}</Text>} />
              <Table.Column title="" width={44} align="center" render={(_, r:any) =>
                <Button type="text" danger icon={<DeleteOutlined />} size="small"
                  onClick={() => setItems(items.filter(i => i.key !== r.key))} />} />
            </Table>

            {items.length > 0 && (
              <div style={{ marginTop:20 }}>
                <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, borderRadius:12,
                  padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <Text style={{ color:"rgba(255,255,255,.7)", fontSize:14 }}>کۆی گشتی ({items.length} دانە)</Text>
                  <Text style={{ color:C.white, fontSize:22, fontWeight:700, fontFamily:"monospace" }}>
                    {totalBill.toLocaleString()} <span style={{ fontSize:14, color:C.tealLt }}>د.ع</span>
                  </Text>
                </div>
                <Button
                  type="primary" size="large" block icon={<ArrowRightOutlined />}
                  onClick={() => setCurrentStep(2)}
                  style={{ height:52, borderRadius:12, background:C.teal, border:"none", fontSize:16, fontWeight:700 }}
                >
                  کۆتایی پسوڵە و پارەدان
                </Button>
              </div>
            )}
          </Card>
        )}

        {currentStep === 2 && (
          <div style={{ maxWidth:560, margin:"0 auto" }}>
            <Card
              className="step-card"
              title={
                <Space>
                  <Button
                    type="text" icon={<ArrowRightOutlined />} onClick={() => setCurrentStep(1)}
                    style={{ color:C.white, fontWeight:700 }}
                  />
                  <span style={{ color:C.white, fontWeight:700, fontSize:16 }}>کۆتایی پسوڵە</span>
                </Space>
              }
              styles={{ header:{ background:`linear-gradient(135deg,${C.teal},${C.tealLt})`, borderBottom:"none" },
                        body:{ padding:24 } }}
            >
              <div style={{ textAlign:"center", padding:"20px 0 24px", borderBottom:`1px solid ${C.border}`, marginBottom:20 }}>
                <Text style={{ color:C.slateLt, fontSize:13, letterSpacing:".06em", display:"block", marginBottom:6 }}>
                  کۆی گشتی
                </Text>
                <div style={{ fontSize:42, fontWeight:800, color:C.navy, fontFamily:"monospace", lineHeight:1 }}>
                  {totalBill.toLocaleString()}
                </div>
                <Text style={{ color:C.slate, fontSize:16 }}>د.ع</Text>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
                <div>
                  <span style={labelStyle}><DollarOutlined style={{marginLeft:4}}/>داشکاندن</span>
                  <InputNumber style={{ width:"100%", height:44 }} value={discount} onChange={(v) => setDiscount(v||0)} />
                </div>
                <div>
                  <span style={labelStyle}><DollarOutlined style={{marginLeft:4}}/>بڕی واصڵ</span>
                  <InputNumber style={{ width:"100%", height:44 }} value={paidAmount} onChange={(v) => setPaidAmount(v||0)} />
                </div>
              </div>

              <div style={{ background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
                <SummaryRow label="کۆی گشتی:"   value={`${totalBill.toLocaleString()} د.ع`} />
                <SummaryRow label="داشکاندن:"   value={`- ${discount.toLocaleString()} د.ع`} />
                <SummaryRow label="کۆی کۆتایی:" value={`${netTotal.toLocaleString()} د.ع`} bold />
                <SummaryRow label="بڕی واصڵ:"   value={`${paidAmount.toLocaleString()} د.ع`} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, marginTop:4 }}>
                  <Text style={{ fontWeight:700, color:C.navy }}>باقی:</Text>
                  <div style={{ background: remainingAmount > 0 ? "#fef2f2" : "#f0fdf4",
                    border:`1.5px solid ${remainingAmount > 0 ? "#fca5a5" : "#86efac"}`,
                    borderRadius:8, padding:"4px 14px" }}>
                    <Text strong style={{ color: remainingAmount > 0 ? C.red : C.teal, fontSize:18, fontFamily:"monospace" }}>
                      {remainingAmount.toLocaleString()} د.ع
                    </Text>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom:24 }}>
                <span style={labelStyle}><FileTextOutlined style={{marginLeft:4}}/>تێبینی</span>
                <Input.TextArea
                  rows={2} value={memo} onChange={(e) => setMemo(e.target.value)}
                  style={{ borderRadius:10, borderColor:C.border }}
                  placeholder="تێبینییەکانت بنووسە..."
                />
              </div>

              <Row gutter={12}>
                <Col span={12}>
                  <Button
                    size="large" block icon={<PrinterOutlined />} onClick={handlePrint}
                    style={{ height:52, borderRadius:12, background:"#f1f5f9", color:C.navy,
                      border:`1.5px solid ${C.border}`, fontWeight:700, fontSize:15 }}
                  >
                    چاپکردن
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary" size="large" block icon={<CheckCircleOutlined />}
                    loading={loading} onClick={handleSave}
                    style={{ height:52, borderRadius:12, background:`linear-gradient(135deg,${C.teal},${C.tealLt})`,
                      border:"none", fontWeight:700, fontSize:15, boxShadow:`0 4px 14px rgba(13,148,136,.4)` }}
                  >
                    پاشکەوتکردن
                  </Button>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </div>

      <div className="print-area" style={{ direction:"rtl", fontFamily:"'Noto Sans Arabic', sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          paddingBottom:12 }}>
          <div style={{ width:"33%", fontSize:13, lineHeight:1.8 }}>
            <strong>کۆدی کڕیار: </strong>{selectedCustomer?.id}<br/>
            <strong>کڕیار: </strong>{selectedCustomer?.Mname}<br/>
            <strong>مۆبایل: </strong>{selectedCustomer?.mobile}<br/>
            <strong>ناونیشان: </strong>{selectedCustomer?.address}
          </div>

          <div style={{ width:"34%", textAlign:"center" }}>
            {companyInfo?.logo && <img src={companyInfo.logo} alt="" style={{ maxWidth:80, marginBottom:6 }}/>}
            <h2 style={{ margin:0, fontSize:20 }}>{companyInfo?.name || "شیرینی تاج"}</h2>
          </div>

          <div style={{ width:"33%", textAlign:"left", fontSize:13, lineHeight:1.8 }}>
            <strong>کۆمپانیا: </strong>{companyInfo?.name}<br/>
            <strong>ناونیشان: </strong>{companyInfo?.address}<br/>
            <strong>مۆبایل: </strong>{companyInfo?.mobile}
          </div>
        </div>

        <div style={{ borderBottom:"2.5px solid #000", marginBottom:10 }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13, marginBottom:20 }}>
          <div style={{ textAlign:"right" }}>
            <strong>بەروار: </strong>{saleDate.format("YYYY-MM-DD")}
          </div>
          <div style={{ textAlign:"left" }}>
            <strong>ژمارەی پسوڵە: </strong>{invNoRef.current}
          </div>
        </div>

        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#0f172a", color:"#fff" }}>
              {["#","کاڵا","کارتۆن","دانە","نرخ","کۆ"].map(h => (
                <th key={h} style={{ padding:"8px 10px", fontSize:13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.key} style={{ background: idx%2===0 ? "#fff" : "#f8fafc" }}>
                <td>{idx+1}</td>
                <td style={{ textAlign:"right", padding:"7px 10px" }}>{item.itemname}</td>
                <td>{item.karton}</td>
                <td>{item.dana}</td>
                <td>{item.price?.toLocaleString()}</td>
                <td><strong>{item.total_price?.toLocaleString()}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:20 }}>
          <div style={{ border:"1.5px solid #333", borderRadius:8, padding:"12px 18px", width:260, fontSize:14 }}>
            {[
              ["کۆی گشتی:",    totalBill.toLocaleString()],
              ["داشکاندن:",    discount.toLocaleString()],
              ["کۆی کۆتایی:", netTotal.toLocaleString()],
              ["بڕی واصڵ:",    paidAmount.toLocaleString()],
            ].map(([label, val]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:"1px solid #eee" }}>
                <span>{label}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, marginTop:4, borderTop:"2px solid #000", fontWeight:700 }}>
              <span>باقی:</span>
              <span style={{ color: remainingAmount > 0 ? "red" : "green" }}>
                {remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {memo && (
          <div style={{ marginTop:16, padding:"8px 14px", background:"#f8fafc", border:"1px solid #ddd", borderRadius:6, fontSize:13 }}>
            <strong>تێبینی: </strong>{memo}
          </div>
        )}
      </div>
    </div>
  );
};