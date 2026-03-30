import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Button, Select, Table, Typography, App } from "antd";
import {
  SearchOutlined, PrinterOutlined, FileTextOutlined,
  UserOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined
} from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";

const { Text } = Typography;

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const C = {
  teal:     "#0d9488",
  tealLt:   "#14b8a6",
  tealPale: "#f0fdfa",
  navy:     "#0f172a",
  navyMid:  "#1e293b",
  red:      "#ef4444",
  green:    "#10b981",
  slate:    "#64748b",
  slateLt:  "#94a3b8",
  slateXl:  "#cbd5e1",
  bg:       "#f1f5f9",
  border:   "#e2e8f0",
  white:    "#ffffff",
  shadow:   "0 1px 4px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.05)",
  shadowMd: "0 4px 24px rgba(0,0,0,.10)",
};

// ═══════════════════════════════════════════════════════════════
// SCROLL DATE PICKER — چارەسەرکراو بۆ کلیکی ئایکۆن و موبایل
// ═══════════════════════════════════════════════════════════════
const ScrollDatePicker: React.FC<{
  label: string;
  value: dayjs.Dayjs;
  onChange: (d: dayjs.Dayjs) => void;
}> = ({ label, value, onChange }) => {
  const [active, setActive] = useState<"year" | "month" | "day">("day");

  // ─── سکرۆڵ و دوگمەی تیر ───────────────────────────────────
  const update = (delta: number) => {
    if (active === "year")  return onChange(value.add(delta, "year"));
    if (active === "month") {
      let m = value.month() + delta;
      if (m > 11) m = 0;
      if (m < 0)  m = 11;
      return onChange(value.month(m));
    }
    onChange(value.add(delta, "day"));
  };

  // ─── تاچ سواپ بۆ موبایل ───────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 30) update(dx > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const segStyle = (type: string): React.CSSProperties => ({
    padding: "4px 8px",
    cursor: "pointer",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 15,
    minWidth: type === "year" ? 58 : 36,
    textAlign: "center",
    background: active === type ? C.teal : "transparent",
    color:      active === type ? "#fff" : C.navy,
    transition: "background .13s, color .13s",
    userSelect: "none",
    WebkitUserSelect: "none",
  });

  return (
    <div>
      <span style={{
        fontSize: 11, fontWeight: 700, color: C.slate,
        letterSpacing: ".05em", display: "block", marginBottom: 5,
      }}>{label}</span>

      {/* ─── فیڵدی سەرەکی ─── */}
      <div
        style={{
          display: "flex", alignItems: "center",
          border: `1.5px solid ${C.border}`,
          height: 44, borderRadius: 10,
          padding: "0 8px", background: C.white,
          boxShadow: "0 1px 3px rgba(0,0,0,.05)",
          touchAction: "pan-y",
          userSelect: "none",
        }}
        onWheel={e => { e.preventDefault(); update(e.deltaY < 0 ? 1 : -1); }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
      >
        {/* ─── دوگمەی بەرەو خوار (کلیک کار دەکات) ─── */}
        <button
          type="button"
          onClick={() => update(-1)}
          style={{
            border: "none", background: "transparent", cursor: "pointer",
            color: C.teal, fontSize: 16, padding: "0 4px",
            lineHeight: 1, flexShrink: 0,
          }}
          title="کەمتر"
        >▼</button>

        {/* ─── بەشەکان ─── */}
        <div style={{
          display: "flex", direction: "ltr", alignItems: "center",
          flex: 1, justifyContent: "center", gap: 2,
        }}>
          <span onClick={() => setActive("year")}  style={segStyle("year")}>
            {value.year()}
          </span>
          <span style={{ color: C.slateXl, fontWeight: 300 }}>/</span>
          <span onClick={() => setActive("month")} style={segStyle("month")}>
            {String(value.month() + 1).padStart(2, "0")}
          </span>
          <span style={{ color: C.slateXl, fontWeight: 300 }}>/</span>
          <span onClick={() => setActive("day")}   style={segStyle("day")}>
            {String(value.date()).padStart(2, "0")}
          </span>
        </div>

        {/* ─── دوگمەی بەرەو سەرەوە (کلیک کار دەکات) ─── */}
        <button
          type="button"
          onClick={() => update(1)}
          style={{
            border: "none", background: "transparent", cursor: "pointer",
            color: C.teal, fontSize: 16, padding: "0 4px",
            lineHeight: 1, flexShrink: 0,
          }}
          title="زیاتر"
        >▲</button>
      </div>

      {/* ─── دوگمەی بەشەکان (بۆ موبایل و ئاسانی) ─── */}
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {(["year","month","day"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(t)}
            style={{
              flex: 1, padding: "3px 0", fontSize: 10, fontWeight: 700,
              border: `1.5px solid ${active === t ? C.teal : C.border}`,
              borderRadius: 5, cursor: "pointer",
              background: active === t ? C.tealPale : C.white,
              color:      active === t ? C.teal     : C.slateLt,
              transition: "all .13s",
            }}
          >
            {t === "year" ? "ساڵ" : t === "month" ? "مانگ" : "ڕۆژ"}
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const CustomerStatementInner: React.FC = () => {
  const { message: msg } = App.useApp();

  const [customers,    setCustomers]    = useState<any[]>([]);
  const [companyInfo,  setCompanyInfo]  = useState<any>(null);
  const [custId,       setCustId]       = useState<string | null>(null);
  const [custObj,      setCustObj]      = useState<any>(null);
  const [fromDate,     setFromDate]     = useState(() => dayjs());
  const [toDate,       setToDate]       = useState(() => dayjs());
  const [loading,      setLoading]      = useState(false);
  const [rows,         setRows]         = useState<any[]>([]);
  const [totals,       setTotals]       = useState({ debit: 0, credit: 0, balance: 0 });
  const [searched,     setSearched]     = useState(false);

  // ─── بارکردنی ڕێکخستنەکان ─────────────────────────────────
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

  // ─── هێنانی داتا ──────────────────────────────────────────
  const fetchStatement = async () => {
    if (!custId) return msg.warning("تکایە سەرەتا کڕیار هەڵبژێرە");
    setLoading(true);
    try {
      const s = fromDate.format("YYYY-MM-DD");
      const e = toDate.format("YYYY-MM-DD");

      const [{ data: sales }, { data: wargrtn }, { data: draw }] = await Promise.all([
        supabase.from("sale").select("id,date,inv_no,net_total,naqd,memo")
          .eq("mshID", custId).gte("date", s).lte("date", e),
        supabase.from("wargrtn").select("id,date,br,memo")
          .eq("mshID", custId).gte("date", s).lte("date", e),
        supabase.from("draw").select("id,date,br,memo")
          .eq("mshID", custId).gte("date", s).lte("date", e),
      ]);

      const combined: any[] = [];
      sales?.forEach(r   => combined.push({ date: r.date, type: "فرۆشتن",        ref_no: r.inv_no, debit: r.net_total || 0, credit: r.naqd || 0, memo: r.memo || "" }));
      wargrtn?.forEach(r => combined.push({ date: r.date, type: "وەرگرتنی پارە", ref_no: "—",      debit: 0,               credit: r.br || 0,   memo: r.memo || "" }));
      draw?.forEach(r    => combined.push({ date: r.date, type: "دراو",           ref_no: "—",      debit: r.br || 0,       credit: 0,           memo: r.memo || "" }));

      combined.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      let bal = 0, totD = 0, totC = 0;
      const final = combined.map((item, i) => {
        bal  += item.debit - item.credit;
        totD += item.debit;
        totC += item.credit;
        return { ...item, balance: bal, key: i };
      });

      setRows(final);
      setTotals({ debit: totD, credit: totC, balance: bal });
      setSearched(true);
    } catch {
      msg.error("هەڵەیەک ڕووی دا لە هێنانی داتاکان");
    } finally {
      setLoading(false);
    }
  };

  const bal = totals.balance;

  // ─── رەنگی جۆری مامەڵە ────────────────────────────────────
  const typeTag = (type: string) => {
    const map: Record<string, [string, string]> = {
      "فرۆشتن":        [C.navy,  "#eff6ff"],
      "وەرگرتنی پارە": [C.green, "#f0fdf4"],
      "دراو":          [C.red,   "#fef2f2"],
    };
    const [color, bg] = map[type] || [C.slate, "#f8fafc"];
    return (
      <span style={{
        background: bg, color, border: `1px solid ${color}25`,
        borderRadius: 20, padding: "2px 10px",
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      }}>{type}</span>
    );
  };

  // ─── ستوونەکان ────────────────────────────────────────────
  const columns = [
    {
      title: "#", width: 36, align: "center" as const,
      render: (_: any, __: any, i: number) =>
        <span style={{ color: C.slateLt, fontSize: 11 }}>{i + 1}</span>,
    },
    {
      title: "بەروار", dataIndex: "date", width: 98,
      render: (v: string) =>
        <span style={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "nowrap", color: C.navyMid }}>{v}</span>,
    },
    {
      title: "جۆر", dataIndex: "type", width: 130,
      render: (v: string) => typeTag(v),
    },
    {
      title: "ژ.بەڵگە", dataIndex: "ref_no", width: 68, align: "center" as const,
      render: (v: any) =>
        <span style={{ fontFamily: "monospace", fontWeight: 700, color: C.teal, fontSize: 12 }}>{v}</span>,
    },
    {
      title: "قەرزدار", dataIndex: "debit", align: "center" as const, width: 96,
      render: (v: number) => v > 0
        ? <span style={{ color: C.red,   fontWeight: 700, fontFamily: "monospace" }}>{v.toLocaleString()}</span>
        : <span style={{ color: C.slateXl }}>—</span>,
    },
    {
      title: "قەرزدارین", dataIndex: "credit", align: "center" as const, width: 96,
      render: (v: number) => v > 0
        ? <span style={{ color: C.green, fontWeight: 700, fontFamily: "monospace" }}>{v.toLocaleString()}</span>
        : <span style={{ color: C.slateXl }}>—</span>,
    },
    {
      title: "ماوە", dataIndex: "balance", align: "center" as const, width: 106,
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

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ background: C.bg, minHeight: "100vh", direction: "rtl", fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap');

        /* ── خشتە ── */
        .stmt-tbl .ant-table-thead > tr > th {
          background: ${C.navyMid} !important;
          color: #fff !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          padding: 9px 8px !important;
          border-color: #334155 !important;
          white-space: nowrap;
        }
        .stmt-tbl .ant-table-tbody > tr:hover > td { background: ${C.tealPale} !important; }
        .stmt-tbl .ant-table-tbody > tr > td       { padding: 7px 8px !important; border-color: ${C.border} !important; }
        .stmt-tbl .ant-table-summary > tr > td     { padding: 9px 8px !important; background: #f8fafc !important; }

        /* ── موبایل ── */
        @media (max-width: 575px) {
          .stmt-tbl .ant-table-cell { font-size: 11px !important; padding: 5px 5px !important; }
          .stmt-filter-grid { display: flex !important; flex-direction: column !important; }
          .stmt-dates-row   { display: grid  !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
        }

        /* ── Select ── */
        .stmt-sel .ant-select-selector {
          height: 44px !important;
          border-radius: 10px !important;
          border-color: ${C.border} !important;
          align-items: center !important;
        }
        .stmt-sel .ant-select-selection-placeholder,
        .stmt-sel .ant-select-selection-item { line-height: 42px !important; }

        /* ── چاپ ── */
        @media print {
          body * { visibility: hidden !important; }
          .stmt-print, .stmt-print * { visibility: visible !important; }
          .stmt-print {
            display: block !important;
            position: fixed !important;
            inset: 0;
            padding: 8mm 10mm !important;
            background: #fff !important;
            font-family: 'Noto Sans Arabic', sans-serif;
            direction: rtl;
          }
          .stmt-screen { display: none !important; }
          @page { size: A4 landscape; margin: 6mm; }
        }
        .stmt-print { display: none; }
      `}</style>

      {/* ═══════════════ SCREEN ═══════════════ */}
      <div className="stmt-screen" style={{ padding: "12px 10px 32px" }}>

        {/* ── بانەری سەر ── */}
        <Card
          style={{ borderRadius: 16, border: "none", boxShadow: C.shadowMd, marginBottom: 12, overflow: "hidden" }}
          styles={{ body: { padding: 0 } }}
        >
          {/* ستریپی ناونیشان */}
          <div style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
            padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: C.teal, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileTextOutlined style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>کەشف حیسابی کڕیار</div>
              <div style={{ color: C.slateLt, fontSize: 11, marginTop: 2 }}>
                ڕاپۆرتی تەواوی مامەڵەکانی کڕیار لە ماوەیەکی دیاریکراودا
              </div>
            </div>
          </div>

          {/* ── فلتەرەکان ── */}
          <div style={{ padding: "14px 14px 16px", background: "#f8fafc", borderTop: `1px solid ${C.border}` }}>

            {/* ناوی کڕیار — ڕیزی یەکەم */}
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.slate, letterSpacing: ".05em", display: "block", marginBottom: 5 }}>
                <UserOutlined style={{ marginLeft: 4 }} />ناوی کڕیار
              </span>
              <Select
                className="stmt-sel"
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="گەڕان و هەڵبژاردنی کڕیار..."
                options={customers.map(c => ({ value: c.id, label: c.Mname, original: c }))}
                filterOption={(input, opt) => (opt?.label as string)?.includes(input)}
                onChange={(v, opt: any) => {
                  setCustId(v ?? null);
                  setCustObj(opt?.original ?? null);
                  // ڕیسێتی داتا کاتێک کڕیار گۆڕدرێت
                  setRows([]);
                  setSearched(false);
                  setTotals({ debit: 0, credit: 0, balance: 0 });
                }}
                value={custId}
                suffixIcon={<UserOutlined style={{ color: C.teal }} />}
                dropdownStyle={{ direction: "rtl" }}
              />
            </div>

            {/* بەروارەکان + دوگمە — ڕیزی دووەم */}
            <Row gutter={[10, 10]} align="bottom">
              <Col xs={12} sm={8} md={7}>
                <ScrollDatePicker label="لە بەروار" value={fromDate} onChange={setFromDate} />
              </Col>
              <Col xs={12} sm={8} md={7}>
                <ScrollDatePicker label="تا بەروار" value={toDate} onChange={setToDate} />
              </Col>
              <Col xs={24} sm={8} md={10}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  block
                  onClick={fetchStatement}
                  loading={loading}
                  style={{
                    height: 44, borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.teal}, ${C.tealLt})`,
                    border: "none", fontWeight: 700, fontSize: 14,
                    boxShadow: `0 4px 12px rgba(13,148,136,.28)`,
                    marginTop: 0,
                  }}
                >
                  نیشاندان
                </Button>
              </Col>
            </Row>
          </div>
        </Card>

        {/* ── کارتەکانی ستاتیستیک ── */}
        {searched && (
          <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
            {[
              { label: "کۆی قەرزدار",   value: totals.debit,   color: C.red,   icon: <ArrowUpOutlined /> },
              { label: "کۆی قەرزدارین", value: totals.credit,  color: C.green, icon: <ArrowDownOutlined /> },
              {
                label: bal > 0 ? "ئەو قەرزدارە" : bal < 0 ? "ئێمە قەرزدارین" : "حساب سفرە",
                value: Math.abs(bal),
                color: bal > 0 ? C.red : bal < 0 ? C.green : C.slate,
                icon:  <MinusOutlined />,
              },
            ].map((s, i) => (
              <Col xs={8} key={i}>
                <Card
                  style={{ borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow }}
                  styles={{ body: { padding: "10px 10px" } }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: s.color + "15",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: s.color, fontSize: 14,
                    }}>{s.icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.slate, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: "monospace", lineHeight: 1.2 }}>
                        {s.value.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9, color: C.slateLt }}>د.ع</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* ── کارتی خشتە ── */}
        <Card
          style={{ borderRadius: 14, border: "none", boxShadow: C.shadow, overflow: "hidden" }}
          styles={{ body: { padding: 0 } }}
        >
          {/* سەردێری خشتە */}
          <div style={{
            padding: "11px 14px", borderBottom: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>
              {searched
                ? <><span style={{ color: C.teal, fontWeight: 800 }}>{rows.length}</span> مامەڵە</>
                : <span style={{ color: C.slateLt }}>هێشتا داتایەک نەهاتووە</span>
              }
            </div>
            {searched && (
              <Button
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
                size="small"
                style={{ borderRadius: 7, borderColor: C.teal, color: C.teal, fontWeight: 700, height: 32 }}
              >
                چاپکردن
              </Button>
            )}
          </div>

          <Table
            className="stmt-tbl"
            dataSource={rows}
            columns={columns}
            pagination={false}
            bordered
            size="small"
            loading={loading}
            scroll={{ x: 660 }}
            locale={{
              emptyText: (
                <div style={{ padding: "36px 0", color: C.slateLt, textAlign: "center" }}>
                  <FileTextOutlined style={{ fontSize: 30, marginBottom: 10, display: "block" }} />
                  کڕیار هەڵبژێرە و دوگمەی نیشاندان بکە
                </div>
              ),
            }}
            summary={() =>
              searched && rows.length > 0 ? (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="center">
                      <span style={{ fontWeight: 800, color: C.navy }}>کۆی گشتی</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="center">
                      <span style={{ color: C.red,   fontWeight: 800, fontFamily: "monospace" }}>{totals.debit.toLocaleString()}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="center">
                      <span style={{ color: C.green, fontWeight: 800, fontFamily: "monospace" }}>{totals.credit.toLocaleString()}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="center">
                      <span style={{ fontWeight: 800, fontFamily: "monospace", fontSize: 14, color: bal > 0 ? C.red : bal < 0 ? C.green : C.slate }}>
                        {bal.toLocaleString()}
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

      {/* ═══════════════ PRINT ═══════════════ */}
      <div className="stmt-print">
        {/* سەردێری ٣ ستوون */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ fontSize: 12, lineHeight: 1.9, width: "32%" }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 3, borderBottom: "1px solid #ddd", paddingBottom: 3 }}>
              زانیارییەکانی کڕیار
            </div>
            <div><strong>ناو: </strong>{custObj?.Mname    || "—"}</div>
            <div><strong>مۆبایل: </strong>{custObj?.mobile   || "—"}</div>
            <div><strong>ناونیشان: </strong>{custObj?.address  || "—"}</div>
          </div>

          <div style={{ textAlign: "center", width: "36%" }}>
            {companyInfo?.logo && <img src={companyInfo.logo} alt="" style={{ maxWidth: 60, marginBottom: 5 }} />}
            <div style={{ fontWeight: 800, fontSize: 20 }}>{companyInfo?.name || "—"}</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>کەشف حیسابی کڕیار</div>
          </div>

          <div style={{ fontSize: 12, lineHeight: 1.9, width: "32%", textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 3, borderBottom: "1px solid #ddd", paddingBottom: 3 }}>
              زانیارییەکانی کۆمپانیا
            </div>
            <div><strong>ناو: </strong>{companyInfo?.name    || "—"}</div>
            <div><strong>ناونیشان: </strong>{companyInfo?.address || "—"}</div>
            <div><strong>مۆبایل: </strong>{companyInfo?.mobile  || "—"}</div>
            <div style={{ marginTop: 5, paddingTop: 4, borderTop: "1px solid #eee" }}>
              <div><strong>لە بەروار: </strong>{fromDate.format("YYYY-MM-DD")}</div>
              <div><strong>تا بەروار: </strong>{toDate.format("YYYY-MM-DD")}</div>
              <div><strong>ژ. مامەڵە: </strong>{rows.length}</div>
            </div>
          </div>
        </div>

        <div style={{ borderBottom: "2.5px solid #000", marginBottom: 10 }} />

        {/* خشتەی چاپ */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#0f172a", color: "#fff" }}>
              {["#","بەروار","جۆری مامەڵە","ژ. بەڵگە","قەرزدار (د.ع)","قەرزدارین (د.ع)","ماوە (د.ع)","تێبینی"].map(h => (
                <th key={h} style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ textAlign: "center", padding: "5px 6px", color: "#94a3b8", fontSize: 10 }}>{i + 1}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontFamily: "monospace" }}>{r.date}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontWeight: 700 }}>{r.type}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontFamily: "monospace", fontWeight: 700, color: C.teal }}>{r.ref_no}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontWeight: 700, color: r.debit  > 0 ? C.red   : "#94a3b8" }}>{r.debit  > 0 ? r.debit.toLocaleString()  : "—"}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontWeight: 700, color: r.credit > 0 ? C.green : "#94a3b8" }}>{r.credit > 0 ? r.credit.toLocaleString() : "—"}</td>
                <td style={{ textAlign: "center", padding: "5px 6px", fontWeight: 800, fontFamily: "monospace", color: r.balance > 0 ? C.red : r.balance < 0 ? C.green : C.slate }}>
                  {r.balance.toLocaleString()}
                </td>
                <td style={{ textAlign: "right", padding: "5px 8px", color: C.slate, fontSize: 10, fontStyle: "italic" }}>{r.memo || "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#0f172a", color: "#fff", fontWeight: 800 }}>
              <td colSpan={4} style={{ textAlign: "center", padding: "8px", fontSize: 12 }}>کۆی گشتی</td>
              <td style={{ textAlign: "center", padding: "8px", fontSize: 13, color: "#fca5a5" }}>{totals.debit.toLocaleString()}</td>
              <td style={{ textAlign: "center", padding: "8px", fontSize: 13, color: "#86efac" }}>{totals.credit.toLocaleString()}</td>
              <td style={{ textAlign: "center", padding: "8px", fontSize: 14, color: bal > 0 ? "#fca5a5" : bal < 0 ? "#86efac" : "#fff" }}>
                {bal.toLocaleString()}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>

        {/* خلاصەی چاپ */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <div style={{ border: "1.5px solid #000", borderRadius: 8, padding: "10px 18px", minWidth: 250, fontSize: 12 }}>
            {([
              ["کۆی قەرزدار:",   totals.debit,   C.red],
              ["کۆی قەرزدارین:", totals.credit,  C.green],
            ] as [string, number, string][]).map(([label, val, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontWeight: 700 }}>{label}</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color }}>{val.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 3px", borderTop: "2px solid #000", marginTop: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 13 }}>
                {bal > 0 ? "ئەو قەرزدارە:" : bal < 0 ? "ئێمە قەرزدارین:" : "حیساب سفرە:"}
              </span>
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: bal > 0 ? C.red : bal < 0 ? C.green : C.slate }}>
                {Math.abs(bal).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* فووتەری چاپ */}
        <div style={{ marginTop: 16, borderTop: "1px solid #ddd", paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888" }}>
          <span>چاپکراوە: {dayjs().format("YYYY-MM-DD HH:mm")}</span>
          <span>{companyInfo?.name} — {companyInfo?.mobile}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Export (بەبێ App wrapper — App لە root دا هەیە) ─────────
export const CustomerStatement = CustomerStatementInner;
export default CustomerStatement;

