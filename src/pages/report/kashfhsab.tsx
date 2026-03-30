import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Select, Table, Typography, App } from "antd";
import {
  SearchOutlined, PrinterOutlined, FileTextOutlined,
  UserOutlined, CalendarOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined
} from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";

// ─────────────────────────────────────────────────────────────
// ScrollDatePicker
// ─────────────────────────────────────────────────────────────
const ScrollDatePicker: React.FC<{
  label: string;
  value: dayjs.Dayjs;
  onChange: (d: dayjs.Dayjs) => void;
}> = ({ label, value, onChange }) => {
  const [active, setActive] = useState<"year" | "month" | "day">("day");

  const update = (delta: number) => {
    if (active === "year") return onChange(value.add(delta, "year"));
    if (active === "month") {
      let m = value.month() + delta;
      if (m > 11) m = 0;
      if (m < 0)  m = 11;
      return onChange(value.month(m));
    }
    onChange(value.add(delta, "day"));
  };

  const seg = (type: string): React.CSSProperties => ({
    padding: "3px 8px", cursor: "pointer", borderRadius: 6, fontWeight: 700,
    fontSize: 14, minWidth: type === "year" ? 54 : 34, textAlign: "center",
    background: active === type ? "#0d9488" : "transparent",
    color:      active === type ? "#fff"    : "#0f172a",
    transition: "all .15s", userSelect: "none",
  });

  return (
    <div>
      <span style={{
        fontSize: 11, fontWeight: 700, color: "#64748b",
        letterSpacing: ".05em", display: "block", marginBottom: 5
      }}>{label}</span>
      <div
        style={{
          display: "flex", alignItems: "center",
          border: "1.5px solid #e2e8f0", height: 44, borderRadius: 10,
          padding: "0 10px", background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.06)", cursor: "default",
          touchAction: "none",
        }}
        onWheel={(e) => { e.preventDefault(); update(e.deltaY < 0 ? 1 : -1); }}
        tabIndex={0}
      >
        <CalendarOutlined style={{ color: "#0d9488", fontSize: 15, marginLeft: 6 }} />
        <div style={{ display: "flex", direction: "ltr", alignItems: "center", flex: 1, justifyContent: "center", gap: 2 }}>
          <span onClick={() => setActive("year")}  style={seg("year")}>{value.year()}</span>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span onClick={() => setActive("month")} style={seg("month")}>{String(value.month() + 1).padStart(2, "0")}</span>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span onClick={() => setActive("day")}   style={seg("day")}>{String(value.date()).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────
const C = {
  navy:    "#0f172a", navyMid: "#1e293b",
  teal:    "#0d9488", tealLt:  "#14b8a6", tealPale: "#ccfbf1",
  red:     "#ef4444", green:   "#10b981",
  slate:   "#64748b", slateLt: "#94a3b8", slateXl: "#cbd5e1",
  bg:      "#f1f5f9", white:   "#ffffff", border: "#e2e8f0",
  shadow:  "0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.05)",
  shadowMd:"0 4px 24px rgba(0,0,0,.11)",
};

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────
// Inner component
// ─────────────────────────────────────────────────────────────
const CustomerStatementInner: React.FC = () => {
  const { message: msg } = App.useApp();

  const [customers,          setCustomers]          = useState<any[]>([]);
  const [companyInfo,        setCompanyInfo]        = useState<any>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer,   setSelectedCustomer]   = useState<any>(null);

  // [خاڵی ٢] بەروارەکان ئۆتۆماتیک بۆ ئەمڕۆ — هەر کاتێک mount دەبێت
  const [fromDate, setFromDate] = useState<dayjs.Dayjs>(() => dayjs());
  const [toDate,   setToDate]   = useState<dayjs.Dayjs>(() => dayjs());

  const [loading,       setLoading]       = useState(false);
  const [statementData, setStatementData] = useState<any[]>([]);
  const [totals,        setTotals]        = useState({ debit: 0, credit: 0, balance: 0 });
  const [searched,      setSearched]      = useState(false);

  // [خاڵی ٢] دوای ریفرێش یان گەڕانەوە بۆ تاب — بەروارەکان ڕیست دەبنەوە
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setFromDate(dayjs());
        setToDate(dayjs());
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: cust }, { data: comp }] = await Promise.all([
        supabase.from("mshtary").select("*").order("Mname"),
        supabase.from("company").select("*").single(),
      ]);
      if (cust) setCustomers(cust);
      if (comp) setCompanyInfo(comp);
    })();
  }, []);

  const fetchStatement = async () => {
    if (!selectedCustomerId) return msg.warning("تکایە سەرەتا مشتەری هەڵبژێرە");
    setLoading(true);
    try {
      const startStr = fromDate.format("YYYY-MM-DD");
      const endStr   = toDate.format("YYYY-MM-DD");

      const [{ data: sales }, { data: wargrtn }, { data: draw }] = await Promise.all([
        supabase.from("sale")
          .select("id, date, inv_no, net_total, naqd, memo")
          .eq("mshID", selectedCustomerId)
          .gte("date", startStr).lte("date", endStr),
        supabase.from("wargrtn")
          .select("id, date, br, memo")
          .eq("mshID", selectedCustomerId)
          .gte("date", startStr).lte("date", endStr),
        supabase.from("draw")
          .select("id, date, br, memo")
          .eq("mshID", selectedCustomerId)
          .gte("date", startStr).lte("date", endStr),
      ]);

      const combined: any[] = [];
      sales?.forEach(s => combined.push({
        date: s.date, type: "فرۆشتن", ref_no: s.inv_no,
        debit: s.net_total || 0, credit: s.naqd || 0, memo: s.memo || "",
      }));
      wargrtn?.forEach(w => combined.push({
        date: w.date, type: "وەرگرتنی پارە", ref_no: "—",
        debit: 0, credit: w.br || 0, memo: w.memo || "",
      }));
      draw?.forEach(d => combined.push({
        date: d.date, type: "دراو", ref_no: "—",
        debit: d.br || 0, credit: 0, memo: d.memo || "",
      }));

      combined.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      let bal = 0, totD = 0, totC = 0;
      const finalized = combined.map((item, i) => {
        bal  += item.debit - item.credit;
        totD += item.debit;
        totC += item.credit;
        return { ...item, balance: bal, key: i };
      });

      setStatementData(finalized);
      setTotals({ debit: totD, credit: totC, balance: bal });
      setSearched(true);
    } catch {
      msg.error("هەڵەیەک ڕووی دا لە هێنانی داتاکان");
    } finally {
      setLoading(false);
    }
  };

  const typeTag = (type: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      "فرۆشتن":        { color: C.navy,  bg: "#f0f9ff" },
      "وەرگرتنی پارە": { color: C.green, bg: "#f0fdf4" },
      "دراو":          { color: C.red,   bg: "#fef2f2" },
    };
    const s = map[type] || { color: C.slate, bg: "#f8fafc" };
    return (
      <span style={{
        background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
        borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
      }}>{type}</span>
    );
  };

  // [خاڵی ٣] ستوونەکان — scroll:x بۆ موبایل
  const columns = [
    {
      title: "#", width: 40, align: "center" as const,
      render: (_: any, __: any, i: number) =>
        <span style={{ color: C.slateLt, fontSize: 12 }}>{i + 1}</span>,
    },
    {
      title: "بەروار", dataIndex: "date", width: 105,
      render: (v: string) =>
        <span style={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "nowrap" }}>{v}</span>,
    },
    {
      title: "جۆر", dataIndex: "type", width: 135,
      render: (v: string) => typeTag(v),
    },
    {
      title: "ژ.بەڵگە", dataIndex: "ref_no", width: 72, align: "center" as const,
      render: (v: any) =>
        <span style={{ fontFamily: "monospace", fontWeight: 700, color: C.teal, fontSize: 12 }}>{v}</span>,
    },
    {
      title: "قەرزدار", dataIndex: "debit", align: "center" as const, width: 100,
      render: (v: number) => v > 0
        ? <span style={{ color: C.red,   fontWeight: 700, fontFamily: "monospace" }}>{v.toLocaleString()}</span>
        : <span style={{ color: C.slateXl }}>—</span>,
    },
    {
      title: "قەرزدارین", dataIndex: "credit", align: "center" as const, width: 100,
      render: (v: number) => v > 0
        ? <span style={{ color: C.green, fontWeight: 700, fontFamily: "monospace" }}>{v.toLocaleString()}</span>
        : <span style={{ color: C.slateXl }}>—</span>,
    },
    {
      title: "ماوە", dataIndex: "balance", align: "center" as const, width: 110,
      render: (v: number) => (
        <span style={{
          fontWeight: 800, fontFamily: "monospace", fontSize: 13,
          color: v > 0 ? C.red : v < 0 ? C.green : C.slate,
        }}>{v.toLocaleString()}</span>
      ),
    },
    {
      title: "تێبینی", dataIndex: "memo",
      render: (v: string) => v
        ? <span style={{ color: C.slate, fontSize: 12, fontStyle: "italic" }}>{v}</span>
        : <span style={{ color: C.slateXl }}>—</span>,
    },
  ];

  const balance = totals.balance;

  return (
    <div style={{
      background: C.bg, minHeight: "100vh",
      direction: "rtl", fontFamily: "'Noto Sans Arabic', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap');

        .stmt-table .ant-table-thead > tr > th {
          background: ${C.navyMid} !important; color: #fff !important;
          font-weight: 700; font-size: 13px;
          padding: 10px 10px !important; border-color: #334155 !important;
        }
        .stmt-table .ant-table-tbody > tr:hover > td { background: ${C.tealPale} !important; }
        .stmt-table .ant-table-tbody > tr > td      { padding: 8px 10px !important; border-color: ${C.border} !important; }
        .stmt-table .ant-table-summary > tr > td    { padding: 10px !important; font-weight: 700; background: #f8fafc !important; }

        /* [خاڵی ٣] موبایل */
        @media (max-width: 600px) {
          .stmt-table .ant-table-cell { font-size: 12px !important; padding: 6px 6px !important; }
        }

        .stmt-select .ant-select-selector       { height: 44px !important; border-radius: 10px !important; border-color: ${C.border} !important; align-items: center !important; }
        .stmt-select .ant-select-selection-item { line-height: 42px !important; }
        .stat-card { border-radius: 14px !important; border: none !important; box-shadow: ${C.shadow} !important; }

        @media print {
          body * { visibility: hidden !important; }
          .print-zone, .print-zone * { visibility: visible !important; }
          .print-zone {
            display: block !important; position: fixed !important; inset: 0;
            padding: 8mm 10mm !important; background: #fff !important;
            font-family: 'Noto Sans Arabic', sans-serif; direction: rtl;
          }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 6mm; }
        }
        .print-zone { display: none; }
      `}</style>

      {/* ════════════════════════ SCREEN ════════════════════════ */}
      <div className="no-print" style={{ padding: "12px 12px 24px" }}>

        {/* Header Banner */}
        <Card
          style={{ borderRadius: 16, border: "none", boxShadow: C.shadowMd, marginBottom: 14, overflow: "hidden" }}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{
            background: `linear-gradient(135deg,${C.navy} 0%,${C.navyMid} 100%)`,
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, background: C.teal, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileTextOutlined style={{ color: "#fff", fontSize: 19 }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>کەشف حیسابی کڕیار</div>
              <div style={{ color: C.slateLt, fontSize: 11, marginTop: 2 }}>
                ڕاپۆرتی تەواوی مامەڵەکانی کڕیار لە ماوەیەکی دیاریکراودا
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <div style={{ padding: "16px 16px 18px", background: "#f8fafc", borderTop: `1px solid ${C.border}` }}>
            {/* [خاڵی ١] تەنیا یەک Select — دووبارەبوونەوە نییە */}
            <Row gutter={[10, 12]} align="bottom">
              <Col xs={24} sm={10}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: C.slate,
                  letterSpacing: ".05em", display: "block", marginBottom: 5,
                }}>
                  <UserOutlined style={{ marginLeft: 4 }} />ناوی کڕیار
                </span>
                <Select
                  className="stmt-select"
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="گەڕان و هەڵبژاردنی کڕیار..."
                  options={customers.map(c => ({ value: c.id, label: c.Mname, original: c }))}
                  filterOption={(input, opt) => (opt?.label as string)?.includes(input)}
                  onChange={(v, opt: any) => {
                    setSelectedCustomerId(v);
                    setSelectedCustomer(opt?.original ?? null);
                  }}
                  value={selectedCustomerId}
                  suffixIcon={<UserOutlined style={{ color: C.teal }} />}
                  dropdownStyle={{ direction: "rtl" }}
                />
              </Col>

              {/* [خاڵی ٢] بەروارەکان ئۆتۆماتیک بۆ ئەمڕۆ */}
              <Col xs={12} sm={5}>
                <ScrollDatePicker label="لە بەروار" value={fromDate} onChange={setFromDate} />
              </Col>
              <Col xs={12} sm={5}>
                <ScrollDatePicker label="تا بەروار" value={toDate} onChange={setToDate} />
              </Col>

              <Col xs={24} sm={4}>
                <Button
                  type="primary" icon={<SearchOutlined />} block
                  onClick={fetchStatement} loading={loading}
                  style={{
                    height: 44, borderRadius: 10,
                    background: `linear-gradient(135deg,${C.teal},${C.tealLt})`,
                    border: "none", fontWeight: 700, fontSize: 14,
                    boxShadow: `0 4px 12px rgba(13,148,136,.3)`,
                  }}
                >
                  نیشاندان
                </Button>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Stats Row */}
        {searched && (
          <Row gutter={[10, 10]} style={{ marginBottom: 14 }}>
            {[
              { label: "کۆی قەرزدار",   value: totals.debit,        color: C.red,   icon: <ArrowUpOutlined /> },
              { label: "کۆی قەرزدارین", value: totals.credit,       color: C.green, icon: <ArrowDownOutlined /> },
              {
                label: balance > 0 ? "كڕیار قەرزدارە" : balance < 0 ? "ئێمە قەرزدارین" : "حیساب سفرە",
                value: Math.abs(balance),
                color: balance > 0 ? C.red : balance < 0 ? C.green : C.slate,
                icon: <MinusOutlined />,
              },
            ].map((s, i) => (
              <Col xs={8} sm={8} key={i}>
                <Card className="stat-card" styles={{ body: { padding: "14px 12px" } }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.slate, marginBottom: 4, whiteSpace: "nowrap" }}>
                        {s.label}
                      </div>
                      <div style={{
                        fontSize: 17, fontWeight: 800, color: s.color,
                        fontFamily: "monospace", lineHeight: 1, wordBreak: "break-all",
                      }}>
                        {s.value.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10, color: C.slateLt, marginTop: 2 }}>د.ع</div>
                    </div>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: s.color + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: s.color, fontSize: 15,
                    }}>{s.icon}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Table Card */}
        <Card
          style={{ borderRadius: 16, border: "none", boxShadow: C.shadow, overflow: "hidden" }}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{
            padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>
              {searched
                ? <><span style={{ color: C.teal }}>{statementData.length}</span> مامەڵە</>
                : "هێشتا داتایەک نەهاتووە"
              }
            </div>
            {searched && (
              <Button
                icon={<PrinterOutlined />} onClick={() => window.print()}
                style={{ borderRadius: 8, borderColor: C.teal, color: C.teal, fontWeight: 700, height: 36 }}
              >
                چاپکردن
              </Button>
            )}
          </div>

          {/* [خاڵی ٣] scroll:x بۆ موبایل */}
          <Table
            className="stmt-table"
            dataSource={statementData}
            columns={columns}
            pagination={false}
            bordered
            size="small"
            loading={loading}
            scroll={{ x: 680 }}
            locale={{
              emptyText: (
                <div style={{ padding: 40, color: C.slateLt, textAlign: "center" }}>
                  <FileTextOutlined style={{ fontSize: 32, marginBottom: 10, display: "block" }} />
                  کڕیار هەڵبژێرە و دوگمەی نیشاندان بکە
                </div>
              ),
            }}
            summary={() =>
              searched ? (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="center">
                      <span style={{ fontWeight: 800, color: C.navy }}>کۆی گشتی</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="center">
                      <span style={{ color: C.red, fontWeight: 800, fontFamily: "monospace" }}>
                        {totals.debit.toLocaleString()}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="center">
                      <span style={{ color: C.green, fontWeight: 800, fontFamily: "monospace" }}>
                        {totals.credit.toLocaleString()}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="center">
                      <span style={{
                        fontWeight: 800, fontFamily: "monospace", fontSize: 14,
                        color: balance > 0 ? C.red : balance < 0 ? C.green : C.slate,
                      }}>
                        {balance.toLocaleString()}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} />
                  </Table.Summary.Row>
                </Table.Summary>
              ) : null
            }
          />
        </Card>
      </div>

      {/* ════════════════════════ PRINT ═════════════════════════ */}
      {/* [خاڵی ٤] زانیارییەکانی کۆمپانیا لە چاپ */}
      <div className="print-zone">

        {/* سێ ستوونی سەرەوە */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>

          {/* لای ڕاست: کڕیار */}
          <div style={{ fontSize: 12, lineHeight: 1.9, width: "32%" }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 3, borderBottom: "1px solid #ddd", paddingBottom: 3 }}>
              زانیارییەکانی کڕیار
            </div>
            <div><strong>ناو: </strong>{selectedCustomer?.Mname || "—"}</div>
            <div><strong>مۆبایل: </strong>{selectedCustomer?.mobile || "—"}</div>
            <div><strong>ناونیشان: </strong>{selectedCustomer?.address || "—"}</div>
          </div>

          {/* ناوەڕاست: لۆگۆ + ناوی کۆمپانیا */}
          <div style={{ textAlign: "center", width: "36%" }}>
            {companyInfo?.logo && (
              <img src={companyInfo.logo} alt="" style={{ maxWidth: 64, marginBottom: 5 }} />
            )}
            <div style={{ fontWeight: 800, fontSize: 20 }}>
              {companyInfo?.name || "شیرینی تاج"}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>کەشف حیسابی کڕیار</div>
          </div>

          {/* لای چەپ: کۆمپانیا + ماوەی ڕاپۆرت */}
          <div style={{ fontSize: 12, lineHeight: 1.9, width: "32%", textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 3, borderBottom: "1px solid #ddd", paddingBottom: 3 }}>
              زانیارییەکانی کۆمپانیا
            </div>
            <div><strong>ناو: </strong>{companyInfo?.name || "—"}</div>
            <div><strong>ناونیشان: </strong>{companyInfo?.address || "—"}</div>
            <div><strong>مۆبایل: </strong>{companyInfo?.mobile || "—"}</div>
            <div style={{ marginTop: 5, paddingTop: 4, borderTop: "1px solid #eee" }}>
              <div><strong>لە بەروار: </strong>{fromDate.format("YYYY-MM-DD")}</div>
              <div><strong>تا بەروار: </strong>{toDate.format("YYYY-MM-DD")}</div>
              <div><strong>ژ. مامەڵە: </strong>{statementData.length}</div>
            </div>
          </div>
        </div>

        {/* خەتی ڕەش */}
        <div style={{ borderBottom: "2.5px solid #000", marginBottom: 10 }} />

        {/* جەدوەل */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#0f172a", color: "#fff" }}>
              {["#","بەروار","جۆری مامەڵە","ژ. بەڵگە","قەرزدار (د.ع)","قەرزدارین (د.ع)","ماوە (د.ع)","تێبینی"].map(h => (
                <th key={h} style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statementData.map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ textAlign: "center", padding: "5px 6px", color: "#94a3b8", fontSize: 10 }}>{idx + 1}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontFamily: "monospace" }}>{row.date}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontWeight: 700 }}>{row.type}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontFamily: "monospace", fontWeight: 700, color: "#0d9488" }}>{row.ref_no}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontWeight: 700, color: row.debit  > 0 ? "#ef4444" : "#94a3b8" }}>
                  {row.debit  > 0 ? row.debit.toLocaleString()  : "—"}
                </td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontWeight: 700, color: row.credit > 0 ? "#10b981" : "#94a3b8" }}>
                  {row.credit > 0 ? row.credit.toLocaleString() : "—"}
                </td>
                <td style={{
                  textAlign: "center", padding: "5px 6px", fontWeight: 800, fontFamily: "monospace",
                  color: row.balance > 0 ? "#ef4444" : row.balance < 0 ? "#10b981" : "#64748b",
                }}>{row.balance.toLocaleString()}</td>
                <td style={{ textAlign: "right", padding: "5px 8px", color: "#64748b", fontSize: 10, fontStyle: "italic" }}>
                  {row.memo || "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#0f172a", color: "#fff", fontWeight: 800 }}>
              <td colSpan={4} style={{ textAlign: "center", padding: "8px", fontSize: 12 }}>کۆی گشتی</td>
              <td style={{ textAlign: "center", padding: "8px", fontSize: 13, color: "#fca5a5" }}>{totals.debit.toLocaleString()}</td>
              <td style={{ textAlign: "center", padding: "8px", fontSize: 13, color: "#86efac" }}>{totals.credit.toLocaleString()}</td>
              <td style={{
                textAlign: "center", padding: "8px", fontSize: 14,
                color: balance > 0 ? "#fca5a5" : balance < 0 ? "#86efac" : "#fff",
              }}>{balance.toLocaleString()}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {/* Summary Box */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <div style={{ border: "1.5px solid #000", borderRadius: 8, padding: "10px 18px", minWidth: 250, fontSize: 12 }}>
            {([
              ["کۆی قەرزدار:",   totals.debit,   "#ef4444"],
              ["کۆی قەرزدارین:", totals.credit,  "#10b981"],
            ] as [string, number, string][]).map(([label, val, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontWeight: 700 }}>{label}</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color }}>{val.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 3px", borderTop: "2px solid #000", marginTop: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 13 }}>
                {balance > 0 ? "باقی ماوە لای كڕیار" : balance < 0 ? "باقی ماوە لای ئێمە :" : "حیساب سفرە:"}
              </span>
              <span style={{
                fontFamily: "monospace", fontWeight: 800, fontSize: 16,
                color: balance > 0 ? "#ef4444" : balance < 0 ? "#10b981" : "#64748b",
              }}>{Math.abs(balance).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 16, borderTop: "1px solid #ddd", paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888" }}>
          <span>چاپکراوە: {dayjs().format("YYYY-MM-DD HH:mm")}</span>
          <span>{companyInfo?.name} — {companyInfo?.mobile}</span>
        </div>
      </div>
    </div>
  );
};

// ── Export directly - App provider is in App.tsx ─────────────
export const CustomerStatement = CustomerStatementInner;

