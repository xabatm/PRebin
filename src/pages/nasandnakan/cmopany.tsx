import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { 
  Form, Button, Row, Col, Card, Space, Input, Table, Popconfirm, App, Upload, Avatar 
} from "antd";
import { 
  SaveOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  RollbackOutlined,
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UploadOutlined,
  PictureOutlined
} from "@ant-design/icons";
import { useDelete, useCreate, useUpdate, HttpError } from "@refinedev/core";

interface ICompany {
  id: number;
  name: string;
  address: string;
  mobile: string;
  logo: string;
}

export const CompanyList: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { mutate: create } = useCreate();
  const { mutate: update } = useUpdate();
  const { mutate: mutateDelete } = useDelete();
  
  const [editId, setEditId] = useState<number | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  const { tableProps, tableQuery } = useTable<ICompany, HttpError>({
    resource: "company",
    pagination: { mode: "off" },
    sorters: { initial: [{ field: "id", order: "desc" }] },
  });

  // فەنکشن بۆ گۆڕینی وێنە بۆ نوسین (Base64)
  const getBase64 = (file: any): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async (info: any) => {
    const base64 = await getBase64(info.file);
    setImageUrl(base64);
    form.setFieldsValue({ logo: base64 });
  };

  const onFinish = (values: any) => {
    const mutation = editId ? update : create;
    mutation({
      resource: "company",
      id: editId ?? undefined,
      values,
      successNotification: false,
    }, {
      onSuccess: () => {
        message.success(editId ? "زانیارییەکان نوێکرانەوە" : "کۆمپانیا تۆمارکرا");
        resetAll();
      }
    });
  };

  const handleAddNew = () => {
    setIsDisabled(false);
    form.resetFields();
    setImageUrl(null);
    setEditId(null);
  };

  const resetAll = () => {
    form.resetFields();
    setEditId(null);
    setImageUrl(null);
    setIsDisabled(true);
    tableQuery?.refetch();
  };

  return (
    <div style={{ padding: "10px" }}>
      <Row gutter={[0, 20]}>
        <Col span={24}>
          <Card 
            title={<div style={headerStyle}>تۆمارکردنی زانیاری کۆمپانیا</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16} align="bottom">
                <Col xs={24} md={12} lg={6}>
                  <Form.Item 
                    label="ناوی کۆمپانیا" 
                    name="name" 
                    rules={[{ required: true, message: 'ناو پێویستە' }]}
                  >
                    <Input prefix={<BankOutlined />} placeholder="ناوی کۆمپانیا" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="ناونیشان" name="address">
                    <Input prefix={<EnvironmentOutlined />} placeholder="ناونیشان" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <Form.Item 
                    label="ژمارەی مۆبایل" 
                    name="mobile" 
                    rules={[{ required: true, message: 'مۆبایل پێویستە' }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="07xx xxx xxxx" disabled={isDisabled} style={{ height: "40px" }} />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="لۆگۆی کۆمپانیا (PNG)" name="logo">
                    <Space>
                      <Upload
                        accept=".png"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleUpload}
                        disabled={isDisabled}
                      >
                        <Button icon={<UploadOutlined />} disabled={isDisabled} style={{ height: "40px" }}>هەڵبژاردن</Button>
                      </Upload>
                      {imageUrl && <Avatar src={imageUrl} shape="square" size={40} />}
                    </Space>
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

        <Col span={24}>
          <Card 
            title={<div style={headerStyle}>زانیاری تۆمارکراو</div>}
            styles={{ header: { padding: 0, minHeight: "38px" } }}
            style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Table {...tableProps} rowKey="id" size="small" bordered scroll={{ x: 800 }}>
              <Table.Column title="#" dataIndex="id" width={60} align="center" />
              <Table.Column 
                title="لۆگۆ" 
                dataIndex="logo" 
                width={80} 
                align="center"
                render={(val) => val ? <Avatar src={val} shape="square" /> : <PictureOutlined style={{fontSize: 20, color: '#ccc'}} />} 
              />
              <Table.Column title="ناوی کۆمپانیا" dataIndex="name" />
              <Table.Column title="ناونیشان" dataIndex="address" />
              <Table.Column title="مۆبایل" dataIndex="mobile" />
              <Table.Column 
                title="فرمان" 
                width={100}
                align="center"
                render={(_, record: ICompany) => (
                  <Space size="middle">
                    <EditOutlined 
                      style={{ color: '#f39c12', fontSize: '18px', cursor: 'pointer' }} 
                      onClick={() => {
                        setEditId(record.id);
                        form.setFieldsValue(record);
                        setImageUrl(record.logo);
                        setIsDisabled(false);
                      }} 
                    />
                    <Popconfirm title="دڵنیایت؟" onConfirm={() => {
                        mutateDelete({ resource: "company", id: record.id, successNotification: false }, {
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