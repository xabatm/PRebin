import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { 
  Form, Button, Row, Col, Card, Space, Input, Table, Popconfirm, App, InputNumber 
} from "antd";
import { 
  SaveOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  RollbackOutlined,
  BarcodeOutlined,
  TagOutlined
} from "@ant-design/icons";
import { useDelete, useCreate, useUpdate, HttpError, useGetIdentity } from "@refinedev/core";
import { supabase } from "../../supabaseClient";

interface IBarham {
  id: number;
  itemname: string;
  itemcode: string;
  carton: number;
  addoffcarton: number;
  userID: any;
}

export const BarhamList: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { mutate: create } = useCreate();
  const { mutate: update } = useUpdate();
  const { mutate: mutateDelete } = useDelete();
  
  // وەرگرتنی زانیارییەکانی بەکارهێنەری ئێستا بە شێوەی فەرمی لە Refine
  const { data: identity } = useGetIdentity<{ id: string | number }>();

  const [editId, setEditId] = useState<number | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const headerStyle: React.CSSProperties = {
    background: "#0d9488", 
    color: "#fff",
    height: "38px",
    display: "flex",
    alignItems: "center",
    padding: "0 15px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "8px 8px 0 0"
  };

  const { tableProps, tableQuery } = useTable<IBarham, HttpError>({
    resource: "barham",
    pagination: { mode: "off" },
    sorters: { initial: [{ field: "id", order: "desc" }] },
  });

  const onFinish = (values: any) => {
    // دڵنیابوونەوە لەوەی ئایدی بەکارهێنەرەکە هەیە پێش ناردن
    if (!identity?.id) {
      message.error("ناسنامەی بەکارهێنەر بەردەست نییە، تکایە لاپەڕەکە نوێ بکەرەوە");
      return;
    }

    const mutation = editId ? update : create;
    mutation({
      resource: "barham",
      id: editId ?? undefined,
      values: { 
        ...values, 
        userID: identity.id // لێرەدا ئایدی ئەو کەسەی لۆگینە بە وردی وەردەگیرێت
      },
      successNotification: false,
    }, {
      onSuccess: () => {
        message.success(editId ? "بە سەرکەوتوویی نوێکرایەوە" : "بە سەرکەوتوویی تۆمارکرا");
        resetAll();
      },
      onError: (error: any) => {
        if (error?.message?.includes("unique")) {
          message.error("ئەم کۆدە پێشتر بەکارهاتووە!");
        } else {
          message.error("کێشەیەک لە پڕۆسەکەدا هەیە");
        }
      }
    });
  };

  const handleAddNew = () => {
    setIsDisabled(false);
    form.resetFields();
    setEditId(null);
  };

  const resetAll = () => {
    form.resetFields();
    setEditId(null);
    setIsDisabled(true);
    tableQuery?.refetch();
  };

  return (
    <div style={{ padding: "10px" }}>
      <Row gutter={[0, 20]}>
        <Col span={24}>
          <Card 
            title={<div style={headerStyle}>تۆمارکردنی بەرهەم (Barham)</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16} align="bottom">
                <Col xs={24} md={12} lg={8}>
                  <Form.Item 
                    label="ناوی بابەت" 
                    name="itemname" 
                    rules={[{ required: true, message: 'ناوی بابەت بنوسە' }]}
                  >
                    <Input prefix={<TagOutlined />} placeholder="ناوی بابەت" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item 
                    label="کۆدی بابەت" 
                    name="itemcode"
                    rules={[
                      { required: true, message: 'کۆد پێویستە' },
                      { pattern: /^[0-9]+$/, message: "تەنها ژمارە ڕێگەپێدراوە" },
                      {
                        validator: async (_, value) => {
                          if (!value || editId) return Promise.resolve();
                          const { data } = await supabase
                            .from("barham")
                            .select("itemcode")
                            .eq("itemcode", value)
                            .maybeSingle();
                          if (data) return Promise.reject(new Error("ئەم کۆدە دووبارەیە!"));
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input prefix={<BarcodeOutlined />} placeholder="تەنها ژمارە" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6} lg={5}>
                  <Form.Item label="کارتۆن" name="carton">
                    <InputNumber placeholder="0" disabled={isDisabled} style={{ height: "40px", width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6} lg={5}>
                  <Form.Item label="زیادە" name="addoffcarton">
                    <InputNumber placeholder="0" disabled={isDisabled} style={{ height: "40px", width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "15px", marginTop: "5px" }}>
                <Space size="middle">
                  <Button onClick={handleAddNew} icon={<PlusOutlined />} disabled={!isDisabled}>
                    نوێ
                  </Button>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ background: "#0d9488", borderColor: "#0d9488" }} disabled={isDisabled}>
                    {editId ? "گۆڕین" : "تۆمارکردن"}
                  </Button>
                  <Button onClick={resetAll} icon={<RollbackOutlined />} danger disabled={isDisabled}>
                    گەڕانەوە
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card 
            title={<div style={headerStyle}>لیستی بەرهەمەکان</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Table {...tableProps} rowKey="id" size="small" bordered scroll={{ x: 800 }}>
              <Table.Column title="#" dataIndex="id" width={60} align="center" />
              <Table.Column title="ناوی بابەت" dataIndex="itemname" />
              <Table.Column title="کۆد" dataIndex="itemcode" align="center" />
              <Table.Column title="کارتۆن" dataIndex="carton" align="center" />
              <Table.Column title="زیادە" dataIndex="addoffcarton" align="center" />
              <Table.Column 
                title="فرمان" 
                width={100}
                align="center"
                render={(_, record: IBarham) => (
                  <Space size="middle">
                    <EditOutlined 
                      style={{ color: '#f39c12', fontSize: '18px', cursor: 'pointer' }} 
                      onClick={() => {
                        setEditId(record.id);
                        form.setFieldsValue(record);
                        setIsDisabled(false);
                      }} 
                    />
                    <Popconfirm title="دڵنیایت؟" onConfirm={() => {
                        mutateDelete({ resource: "barham", id: record.id }, {
                          onSuccess: () => {
                            message.success("سڕایەوە");
                            tableQuery?.refetch();
                          }
                        });
                      }}>
                      <DeleteOutlined style={{ color: '#e74c3c', fontSize: '18px', cursor: 'pointer' }} />
                    </Popconfirm>
                  </Space>
                )}
              />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};