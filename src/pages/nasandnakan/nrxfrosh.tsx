import React, { useState, useMemo } from "react";
import { useTable } from "@refinedev/antd";
import { 
  Table, Input, Card, Button, Space, Row, Col, App, InputNumber 
} from "antd";
import { 
  SearchOutlined, 
  SaveOutlined, 
  DollarOutlined,
  ReloadOutlined 
} from "@ant-design/icons";
import { useUpdate, HttpError } from "@refinedev/core";

interface IBarham {
  id: number;
  itemname: string;
  itemcode: string;
  sealprice: number;
}

export const NrxFrosh: React.FC = () => {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState("");
  const [pendingUpdates, setPendingUpdates] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const { mutateAsync: update } = useUpdate();

  const { tableProps, tableQuery } = useTable<IBarham, HttpError>({
    resource: "barham",
    pagination: { mode: "off" },
    sorters: { initial: [{ field: "id", order: "desc" }] },
  });

  // فلتەرکردنی خێرا لە کاتی نووسیندا
  const filteredData = useMemo(() => {
    const data = tableProps.dataSource || [];
    if (!searchText) return data;
    
    const lowerSearch = searchText.toLowerCase();
    return data.filter(item => 
      (item.itemname?.toLowerCase().includes(lowerSearch)) || 
      (item.itemcode?.toString().includes(lowerSearch))
    );
  }, [searchText, tableProps.dataSource]);

  // چاککردنی نرخی گۆڕدراو
  const handlePriceChange = (id: number, value: number | null) => {
    const numValue = value === null ? 0 : value;
    setPendingUpdates(prev => ({ ...prev, [id]: numValue }));
  };

  const handleSaveAll = async () => {
    const ids = Object.keys(pendingUpdates).map(Number);
    if (ids.length === 0) {
      message.warning("هیچ نرخێک دەستکاری نەکراوە!");
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        ids.map((id) =>
          update({
            resource: "barham",
            id: id,
            values: { sealprice: pendingUpdates[id] },
            successNotification: false,
          })
        )
      );

      message.success("تۆمارکرا");
      setPendingUpdates({});
      tableQuery?.refetch();
    } catch (error) {
      message.error("کێشەیەک ڕوویدا");
    } finally {
      setIsSaving(false);
    }
  };

  const headerStyle: React.CSSProperties = {
    background: "#0d9488", color: "#fff", height: "40px",
    display: "flex", alignItems: "center", padding: "0 15px",
    borderRadius: "8px 8px 0 0", fontWeight: "bold"
  };

  return (
    <div style={{ padding: "10px" }}>
      <Card 
        title={<div style={headerStyle}>تۆمارکردنی نرخ بە کۆمەڵ</div>}
        styles={{ header: { padding: 0 } }}
        style={{ borderRadius: "8px" }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
          <Col xs={24} md={12}>
            <Input
              placeholder="گەڕان (ناو یان کۆد)..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ height: "40px", borderRadius: "6px" }}
            />
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "left" }}>
            <Space>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSaveAll}
                loading={isSaving}
                style={{ background: "#0d9488", borderColor: "#0d9488", height: "40px" }}
              >
                تۆمارکردن ({Object.keys(pendingUpdates).length})
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => tableQuery?.refetch()} style={{ height: "40px" }} />
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={filteredData}
          rowKey="id"
          pagination={false}
          bordered
          size="small"
          scroll={{ y: "60vh" }}
          loading={tableProps.loading}
        >
          <Table.Column title="کۆد" dataIndex="itemcode" width={120} align="center" />
          <Table.Column title="ناوی بابەت" dataIndex="itemname" />
          <Table.Column 
            title="نرخی فرۆش" 
            render={(_, record: IBarham) => (
              <InputNumber
                style={{ 
                  width: "100%",
                  borderColor: pendingUpdates[record.id] !== undefined ? "#0d9488" : "#d9d9d9",
                  background: pendingUpdates[record.id] !== undefined ? "#f0fdfa" : "white"
                }}
                prefix={<DollarOutlined />}
                value={pendingUpdates[record.id] !== undefined ? pendingUpdates[record.id] : record.sealprice}
                onChange={(val) => handlePriceChange(record.id, val)}
                // فۆرماتکردنی ژمارەکە: زیادکردنی کۆما (,) بۆ هەر ٣ ژمارەیەک
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                // لابردنی کۆما لە کاتی وەرگرتنەوەی ژمارەکە
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as unknown as number}
              />
            )}
          />
        </Table>
      </Card>
    </div>
  );
};