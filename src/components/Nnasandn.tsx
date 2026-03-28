import React from "react";
import { Menu } from "antd";
import { useLocation, Link } from "react-router-dom";
import { 
  UserOutlined, 
  TeamOutlined, 
  ShopOutlined,
  BarcodeOutlined,
  DollarOutlined // ئایکۆنی نوێ بۆ نرخی فرۆش
} from "@ant-design/icons";

export const Nnasandn: React.FC = () => {
  const { pathname } = useLocation();

  const items = [
    { 
      key: "/userlevle", 
      icon: <UserOutlined />, 
      label: <Link to="/userlevle">ئاستی بەکارهێنەر</Link> 
    },
    { 
      key: "/users", 
      icon: <TeamOutlined />, 
      label: <Link to="/users">بەکارهێنەران</Link> 
    },
    { 
      key: "/mshtarylist", 
      icon: <ShopOutlined />, 
      label: <Link to="/mshtarylist">مشتەرییەکان</Link> 
    },
    { 
      key: "/barhamlist", 
      icon: <BarcodeOutlined />, 
      label: <Link to="/barhamlist">بەرهەمەکان</Link> 
    },
    { 
      key: "/nrxfrosh", // ڕێڕەوی لاپەڕە نوێیەکە
      icon: <DollarOutlined />, 
      label: <Link to="/nrxfrosh">نرخی فرۆش</Link> 
    },
  ];

  return (
    <div style={{ 
      padding: "10px 10px 0 10px",
      background: "#f8fafc", 
    }}>
      <div style={{ 
        overflowX: "auto", 
        whiteSpace: "nowrap", 
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        backgroundColor: "#1e293b",
      }}>
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[pathname]}
          items={items}
          style={{ 
            backgroundColor: "#1e293b", 
            direction: "rtl",
            borderBottom: "none",
            fontSize: "14px",
            fontWeight: "500",
            lineHeight: "45px",
            minWidth: "max-content",
          }}
        />
      </div>
    </div>
  );
};