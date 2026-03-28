import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { 
  Form, Button, Row, Col, Card, Space, Input, Table, Popconfirm, App 
} from "antd";
import { 
  SaveOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  RollbackOutlined 
} from "@ant-design/icons";
import { useDelete, useCreate, useUpdate, HttpError } from "@refinedev/core";

interface IUserLevel {
  id: number;
  levle: string;
}

export const UserLevelList: React.FC = () => {
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

  const { tableProps, tableQuery } = useTable<IUserLevel, HttpError>({
    resource: "userlevle",
    pagination: { mode: "off" },
    sorters: {
      initial: [{ field: "id", order: "asc" }], // ڕیزبەندی لە 1 بەرەو سەرەوە
    },
  });

  const onFinish = (values: any) => {
    const mutation = editId ? update : create;
    mutation({
      resource: "userlevle",
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
      <Row gutter={[16, 16]}>
        {/* فۆڕمی تۆمارکردن: لە مۆبایل هەموو پاناییەکە دەگرێت (24) و لە کۆمپیوتەر بەشێکی کەم (8) */}
        <Col xs={24} lg={8}>
          <Card 
            title={<div style={headerStyle}>تۆمارکردنی ئاستی بەکارهێنەر</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item 
                label="ناوی ئاست" 
                name="levle" 
                rules={[{ required: true, message: 'تکایە ناوێک بنوسە' }]}
              >
                <Input 
                  placeholder="بۆ نموونە: ئەدمین، کارمەند" 
                  style={{ height: "40px" }} 
                  disabled={isDisabled} 
                />
              </Form.Item>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Button 
                   onClick={handleAddNew} 
                   icon={<PlusOutlined />}
                   disabled={!isDisabled}
                   size="large"
                   style={{ width: "100%" }}
                >
                  نوێ
                </Button>

                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  size="large"
                  style={{ background: "#0d9488", borderColor: "#0d9488", width: "100%" }}
                  disabled={isDisabled}
                >
                  {editId ? "گۆڕین" : "تۆمارکردن"}
                </Button>

                <Button 
                  onClick={resetAll} 
                  icon={<RollbackOutlined />}
                  danger
                  size="large"
                  disabled={isDisabled}
                  style={{ width: "100%" }}
                >
                  پاشگەزبوونەوە
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* لیستی نمایشکردن: لە مۆبایل دەکەوێتە خوارەوەی فۆڕمەکە */}
        <Col xs={24} lg={16}>
          <Card 
            title={<div style={headerStyle}>لیستی ئاستەکان</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            {/* بۆ ئەوەی تەیبڵەکە لە شاشەی مۆبایلدا تێک نەچێت */}
            <div style={{ overflowX: "auto" }}>
              <Table {...tableProps} rowKey="id" size="small" bordered scroll={{ x: 400 }}>
                <Table.Column title="#" dataIndex="id" width={60} align="center" />
                <Table.Column title="ناوی ئاست" dataIndex="levle" />
                <Table.Column 
                  title="فرمان" 
                  width={90}
                  align="center"
                  render={(_, record: IUserLevel) => (
                    <Space size="middle">
                      <EditOutlined 
                        style={{ color: '#f39c12', fontSize: '18px', cursor: 'pointer' }} 
                        onClick={() => {
                          setEditId(record.id);
                          form.setFieldsValue(record);
                          setIsDisabled(false);
                        }} 
                      />
                      <Popconfirm 
                        title="دڵنیایت؟" 
                        onConfirm={() => {
                          mutateDelete({ resource: "userlevle", id: record.id, successNotification: false }, {
                            onSuccess: () => {
                              message.success("سڕایەوە");
                              tableQuery?.refetch();
                            }
                          });
                        }}
                        okText="بەڵێ"
                        cancelText="نەخێر"
                      >
                        <DeleteOutlined style={{ color: '#e74c3c', fontSize: '18px', cursor: 'pointer' }} />
                      </Popconfirm>
                    </Space>
                  )}
                />
              </Table>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};