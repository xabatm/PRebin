import React from "react";
import { Menu } from "antd";
import { useLocation, Link } from "react-router-dom";
import { 
  PlusCircleOutlined, 
  UnorderedListOutlined 
} from "@ant-design/icons";

export const ZhmeryaryMenu: React.FC = () => {
  const location = useLocation();

  // دیاریکردنی کلیلە چالاکەکە بەپێی ڕێڕەوی پەڕەکە
  const selectedKey = location.pathname;

  const items = [
    { 
      key: "/wargrtn", 
      icon: <PlusCircleOutlined style={{ fontSize: '18px' }} />, 
      label: <Link to="/wargrtn">تۆمارکردنی وەرگرتن</Link> 
    },
    { 
      key: "/wargrtnlist", 
      icon: <UnorderedListOutlined style={{ fontSize: '18px' }} />, 
      label: <Link to="/wargrtnlist">لیستی وەرگرتنەکان</Link> 
    },
  ];

  return (
    <div style={{ padding: "10px 10px 5px 10px", background: "#f0f2f5" }}>
      <div style={{ 
        borderRadius: "8px", 
        backgroundColor: "#1e293b",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}>
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[selectedKey]}
          items={items}
          style={{ 
            backgroundColor: "#1e293b", 
            direction: "rtl", 
            borderBottom: "none", 
            lineHeight: "50px",
            fontSize: "15px",
            fontWeight: "500"
          }}
        />
      </div>
    </div>
  );
};