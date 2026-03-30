import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Progress, Typography, Space } from "antd";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";
import {
  ShoppingCartOutlined, TeamOutlined, RiseOutlined,
  DollarOutlined, FileTextOutlined, ArrowUpOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;

const C = {
  navy:     "#0a0f1e",
  card:     "#111827",
  border:   "rgba(255,255,255,.08)",
  teal:     "#0d9488",
  amber:    "#f59e0b",
  blue:     "#3b82f6",
  white:    "#f8fafc",
  slate:    "#94a3b8",
};

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, received: 0, count: 0 });
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);

  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: sales }, { data: wargrtn }, { data: details }, { data: barhamList }] = await Promise.all([
        supabase.from("sale").select("net_total, mshtary(Mname)").gte("date", startOfMonth),
        supabase.from("wargrtn").select("br").gte("date", startOfMonth),
        supabase.from("sales_details").select("proID, total_price, sale!inner(date)").gte("sale.date", startOfMonth),
        supabase.from("barham").select("id, itemname"),
      ]);

      setStats({
        total: sales?.reduce((s, r) => s + (Number(r.net_total) || 0), 0) ?? 0,
        received: wargrtn?.reduce((s, r) => s + (Number(r.br) || 0), 0) ?? 0,
        count: sales?.length ?? 0
      });

      const custMap: Record<string, number> = {};
      sales?.forEach((r: any) => {
        const name = r.mshtary?.Mname || "نەناسراو";
        custMap[name] = (custMap[name] || 0) + (Number(r.net_total) || 0);
      });
      setCustomerData(Object.entries(custMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

      const nameMap: Record<string, string> = {};
      barhamList?.forEach(b => { nameMap[b.id] = b.itemname; });
      const prodMap: Record<string, number> = {};
      details?.forEach((d: any) => {
        const n = nameMap[d.proID] || "بێ ناو";
        prodMap[n] = (prodMap[n] || 0) + (Number(d.total_price) || 0);
      });
      setProductData(Object.entries(prodMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return <div style={{ height: "100vh", background: C.navy, display: "flex", justifyContent: "center", alignItems: "center" }}><Spin size="large" /></div>;

  const maxCust = Math.max(...customerData.map(d => d.value), 1);
  const maxProd = Math.max(...productData.map(d => d.value), 1);

  return (
    <div style={{ background: C.navy, minHeight: "100vh", padding: "16px", direction: "rtl" }}>
      
      {/* ── HEADER ── */}
      <div style={{ marginBottom: 24, padding: "0 8px" }}>
        <Title level={3} style={{ color: C.white, margin: 0 }}>📊 ڕاپۆرتی گشتی فرۆشتن</Title>
        <Text style={{ color: C.slate }}>داتای مانگی {dayjs().format("MM/YYYY")}</Text>
      </div>

      {/* ── TOP STATS (Cards) ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
            <Space direction="vertical" size={0}>
              <Text style={{ color: C.slate, fontSize: 12 }}>کۆی گشتی فرۆشراو</Text>
              <Title level={4} style={{ color: C.teal, margin: 0, fontFamily: "monospace" }}>{stats.total.toLocaleString()} <small style={{fontSize: 10}}>د.ع</small></Title>
              <Text style={{ color: C.teal, fontSize: 10 }}><ArrowUpOutlined /> ئەم مانگە</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
            <Space direction="vertical" size={0}>
              <Text style={{ color: C.slate, fontSize: 12 }}>کۆی وەرگیراو</Text>
              <Title level={4} style={{ color: C.blue, margin: 0, fontFamily: "monospace" }}>{stats.received.toLocaleString()} <small style={{fontSize: 10}}>د.ع</small></Title>
              <Text style={{ color: C.blue, fontSize: 10 }}>داخڵبوو</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
            <Space direction="vertical" size={0}>
              <Text style={{ color: C.slate, fontSize: 12 }}>ژمارەی پسوڵەکان</Text>
              <Title level={4} style={{ color: C.amber, margin: 0, fontFamily: "monospace" }}>{stats.count}</Title>
              <Text style={{ color: C.amber, fontSize: 10 }}>مامەڵەکان</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* ── CHARTS / LISTS ── */}
      <Row gutter={[16, 16]}>
        {/* Customer Section */}
        <Col xs={24} lg={12}>
          <Card 
            title={<Text style={{ color: C.white, fontSize: 15 }}><TeamOutlined /> فرۆشتن بەپێی کڕیار</Text>}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {customerData.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{item.name}</Text>
                    <Text style={{ color: C.teal, fontSize: 13, fontWeight: "bold" }}>{item.value.toLocaleString()}</Text>
                  </div>
                  <Progress percent={(item.value / maxCust) * 100} strokeColor={C.teal} trailColor="rgba(255,255,255,0.05)" showInfo={false} strokeWidth={6} />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Product Section */}
        <Col xs={24} lg={12}>
          <Card 
            title={<Text style={{ color: C.white, fontSize: 15 }}><ShoppingCartOutlined /> ئاماری بەرهەمەکان</Text>}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {productData.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{item.name}</Text>
                    <Text style={{ color: C.amber, fontSize: 13, fontWeight: "bold" }}>{item.value.toLocaleString()}</Text>
                  </div>
                  <Progress percent={(item.value / maxProd) * 100} strokeColor={C.amber} trailColor="rgba(255,255,255,0.05)" showInfo={false} strokeWidth={6} />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .ant-card-head { border-bottom: 1px solid ${C.border} !important; min-height: 40px !important; }
        .ant-card-head-title { padding: 8px 0 !important; }
      `}</style>
    </div>
  );
};