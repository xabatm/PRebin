import React, { useState } from "react";
import { useTable, useSelect } from "@refinedev/antd";
import { 
  Form, Button, Row, Col, Card, Space, Input, Table, Popconfirm, App, Select 
} from "antd";
import { 
  SaveOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  RollbackOutlined,
  UserOutlined,
  LockOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import { useDelete, useCreate, useUpdate, HttpError } from "@refinedev/core";

interface IUser {
  id: number;
  fullname: string;
  username: string;
  password?: string;
  mobile: string;
  level_id: number;
}

export const UserList: React.FC = () => {
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

  const { tableProps, tableQuery } = useTable<IUser, HttpError>({
    resource: "user",
    pagination: { mode: "off" },
    sorters: { initial: [{ field: "id", order: "desc" }] },
  });

  const { selectProps: levelSelectProps } = useSelect({
    resource: "userlevle",
    optionLabel: "levle",
    optionValue: "id",
  });

  const onFinish = (values: any) => {
    const mutation = editId ? update : create;
    mutation({
      resource: "user",
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
        {/* بەشی فۆڕم - لە سەرەوە */}
        <Col span={24}>
          <Card 
            title={<div style={headerStyle}>ناساندنی بەکارهێنەر</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col xs={24} md={12} lg={6}>
                  <Form.Item 
                    label="ناوی تەواو" 
                    name="fullname" 
                    rules={[{ required: true, message: 'ناوی تەواو پێویستە' }]}
                  >
                    <Input placeholder="ناوی سیانی" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <Form.Item 
                    label="ناوی بەکارهێنەر" 
                    name="username" 
                    rules={[
                      { required: true, message: 'Username بنوسە' },
                      { pattern: /^[A-Za-z0-9_]+$/, message: 'تەنیا ئینگلیزی و ژمارە' }
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Username" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={4}>
                  <Form.Item 
                    label="وشەی تێپەڕ" 
                    name="password" 
                    rules={[{ required: !editId, message: 'Password پێویستە' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={4}>
                  <Form.Item 
                    label="ژمارەی مۆبایل" 
                    name="mobile" 
                    rules={[{ required: true, message: 'مۆبایل بنوسە' }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="07xx xxx xxxx" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={4}>
                  <Form.Item 
                    label="ئاست" 
                    name="level_id" 
                    rules={[{ required: true, message: 'ئاستێک هەڵبژێرە' }]}
                  >
                    <Select 
                      {...levelSelectProps} 
                      placeholder="ئاست" 
                      disabled={isDisabled} 
                      style={{ height: "40px" }} 
                    />
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

        {/* بەشی تەیبڵ - لە خوارەوە */}
        <Col span={24}>
          <Card 
            title={<div style={headerStyle}>لیستی بەکارهێنەران</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Table {...tableProps} rowKey="id" size="small" bordered scroll={{ x: 800 }}>
              <Table.Column title="#" dataIndex="id" width={60} align="center" />
              <Table.Column title="ناوی تەواو" dataIndex="fullname" />
              <Table.Column title="بەکارهێنەر" dataIndex="username" />
              <Table.Column title="مۆبایل" dataIndex="mobile" />
              <Table.Column 
                title="ئاست" 
                dataIndex="level_id" 
                render={(value) => {
                  const level = levelSelectProps.options?.find(opt => opt.value === value);
                  return level?.label || value;
                }}
              />
              <Table.Column 
                title="فرمان" 
                width={100}
                align="center"
                render={(_, record: IUser) => (
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
                        mutateDelete({ resource: "user", id: record.id, successNotification: false }, {
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