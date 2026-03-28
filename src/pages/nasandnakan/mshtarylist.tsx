import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { 
  Form, Button, Row, Col, Card, Space, Input, Table, Popconfirm, App, Checkbox, Tag 
} from "antd";
import { 
  SaveOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  RollbackOutlined,
  ShopOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useDelete, useCreate, useUpdate, HttpError } from "@refinedev/core";

interface IMshtary {
  id: number;
  Mname: string;
  address: string;
  Fname: string;
  mobile: string;
  is_active: boolean; // فیڵدی نوێ
}

export const MshtaryList: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { mutate: create } = useCreate();
  const { mutate: update } = useUpdate();
  const { mutate: mutateDelete } = useDelete();
  
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

  const { tableProps, tableQuery } = useTable<IMshtary, HttpError>({
    resource: "mshtary",
    pagination: { mode: "off" },
    sorters: { initial: [{ field: "id", order: "desc" }] },
  });

  const onFinish = (values: any) => {
    const mutation = editId ? update : create;
    mutation({
      resource: "mshtary",
      id: editId ?? undefined,
      values,
      successNotification: false,
    }, {
      onSuccess: () => {
        message.success(editId ? "بە سەرکەوتوویی نوێکرایەوە" : "بە سەرکەوتوویی تۆمارکرا");
        resetAll();
      }
    });
  };

  const handleAddNew = () => {
    setIsDisabled(false);
    form.resetFields();
    // بە شێوەی دیفۆڵت کاتێک کڕیاری نوێ دروست دەکرێت با ئەکتیڤ بێت
    form.setFieldValue("is_active", true); 
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
        {/* بەشی فۆڕم */}
        <Col span={24}>
          <Card 
            title={<div style={headerStyle}>تۆمارکردنی کڕیار (مشترى)</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16} align="bottom">
                <Col xs={24} md={12} lg={5}>
                  <Form.Item 
                    label="ناوی فرۆشگا" 
                    name="Mname" 
                    rules={[{ required: true, message: 'ناوی فرۆشگا پێویستە' }]}
                  >
                    <Input prefix={<ShopOutlined />} placeholder="ناوی دوکان" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={5}>
                  <Form.Item 
                    label="خاوەنی فرۆشگا" 
                    name="Fname" 
                    rules={[{ required: true, message: 'ناوی خاوەن پێویستە' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="ناوی خاوەن" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={5}>
                  <Form.Item label="ناونیشان" name="address">
                    <Input prefix={<EnvironmentOutlined />} placeholder="ناونیشان" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={5}>
                  <Form.Item 
                    label="ژمارەی مۆبایل" 
                    name="mobile" 
                    rules={[{ required: true, message: 'مۆبایل بنوسە' }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="07xx xxx xxxx" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                {/* فیڵدی is_active */}
                <Col xs={24} md={12} lg={4}>
                  <Form.Item name="is_active" valuePropName="checked" style={{ marginBottom: "28px" }}>
                    <Checkbox disabled={isDisabled} style={{ fontSize: "15px" }}>
                      کڕیاری چالاک (Active)
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "15px", marginTop: "5px" }}>
                <Space size="middle">
                  <Button onClick={handleAddNew} icon={<PlusOutlined />} disabled={!isDisabled} style={{ width: "90px" }}>
                    نوێ
                  </Button>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ background: "#0d9488", borderColor: "#0d9488", width: "100px" }} disabled={isDisabled}>
                    {editId ? "گۆڕین" : "تۆمارکردن"}
                  </Button>
                  <Button onClick={resetAll} icon={<RollbackOutlined />} danger disabled={isDisabled} style={{ width: "100px" }}>
                    گەڕانەوە
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>

        {/* بەشی تەیبڵ */}
        <Col span={24}>
          <Card 
            title={<div style={headerStyle}>لیستی کڕیاران</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Table {...tableProps} rowKey="id" size="small" bordered scroll={{ x: 800 }}>
              <Table.Column title="#" dataIndex="id" width={60} align="center" />
              <Table.Column title="ناوی فرۆشگا" dataIndex="Mname" />
              <Table.Column title="خاوەنی فرۆشگا" dataIndex="Fname" />
              <Table.Column title="ناونیشان" dataIndex="address" />
              <Table.Column title="مۆبایل" dataIndex="mobile" />
              {/* پیشاندانی دۆخی چالاکبوون لە تەیبڵەکە */}
              <Table.Column 
                title="دۆخ" 
                dataIndex="is_active" 
                align="center"
                width={100}
                render={(value) => (
                  <Tag color={value ? "green" : "red"} icon={value ? <CheckCircleOutlined /> : null}>
                    {value ? "چالاک" : "ناچالاک"}
                  </Tag>
                )}
              />
              <Table.Column 
                title="فرمان" 
                width={100}
                align="center"
                render={(_, record: IMshtary) => (
                  <Space size="middle">
                    <EditOutlined 
                      style={{ color: '#f39c12', fontSize: '18px', cursor: 'pointer' }} 
                      onClick={() => {
                        setEditId(record.id);
                        form.setFieldsValue(record);
                        setIsDisabled(false);
                      }} 
                    />
                    <Popconfirm title="دڵنیایت لە سڕینەوە؟" onConfirm={() => {
                        mutateDelete({ resource: "mshtary", id: record.id, successNotification: false }, {
                          onSuccess: () => {
                            message.success("سڕایەوە");
                            tableQuery?.refetch();
                          }
                        });
                      }} okText="بەڵێ" cancelText="نەخێر">
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