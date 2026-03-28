import React from "react";
import { Menu } from "antd";
import { useLocation, Link } from "react-router-dom";
import { 
  UserOutlined, 
  TeamOutlined, 
  HomeOutlined, 
  ClusterOutlined,
  SettingOutlined 
} from "@ant-design/icons";

export const Nnasandn: React.FC = () => {
  const { pathname } = useLocation();

  // تێبینی: لێرە کلیلەکە (key) کراوە بە /users بۆ ئەوەی لەگەڵ App.tsx یەک بگرێتەوە
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
      key: "/nasandni-koga", 
      icon: <HomeOutlined />, 
      label: <Link to="/nasandni-koga">ناساندنی کۆگا</Link> 
    },
    { 
      key: "/darazhmeryari", 
      icon: <ClusterOutlined />, 
      label: <Link to="/darazhmeryari">دارەژمێریاری</Link> 
    },
    { 
      key: "/rekxstnakan", 
      icon: <SettingOutlined />, 
      label: <Link to="/rekxstnakan">ڕێکخستنەکان</Link> 
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