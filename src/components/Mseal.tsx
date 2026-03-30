import React from "react";
import { Menu } from "antd";
import { useLocation, Link } from "react-router-dom";
import { 
  PlusCircleOutlined, 
  UnorderedListOutlined 
} from "@ant-design/icons";

export const Msale: React.FC = () => {
  const location = useLocation();

  // لێرە پشکنین دەکەین ئەگەر ڕێڕەوەکە هەرچییەک بێت، کلیلە دروستەکە چالاک بکات
  const getSelectedKey = () => {
    if (location.pathname.includes("/salelist")) return "/salelist";
    return "/sale";
  };

  const items = [
    { 
      key: "/sale", 
      icon: <PlusCircleOutlined style={{ fontSize: '18px' }} />, 
      label: <Link to="/sale">تۆمارکردنی فرۆشتن</Link> 
    },
    { 
      key: "/salelist", 
      icon: <UnorderedListOutlined style={{ fontSize: '18px' }} />, 
      label: <Link to="/salelist">لیستی فرۆشتنەکان</Link> 
    },
  ];

  return (
    <div style={{ padding: "10px 10px 5px 10px", background: "#f0f2f5" }}>
      <div style={{ 
        borderRadius: "8px", 
        backgroundColor: "#0f172a", // تۆختر بۆ ئەوەی وەک وێنەکە بێت
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}>
        <style>
          {`
            /* ستایل بۆ ئەوەی ڕەنگی شینەکە وەک وێنەکە دەربچێت کاتێک یەکێکیان هەڵبژێردراوە */
            .ant-menu-dark.ant-menu-horizontal > .ant-menu-item-selected {
              background-color: #3b82f6 !important; 
              border-radius: 4px;
              margin: 4px 8px;
              height: 42px !important;
              line-height: 42px !important;
            }
            .ant-menu-dark.ant-menu-horizontal > .ant-menu-item {
              transition: all 0.3s;
            }
          `}
        </style>
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[getSelectedKey()]}
          items={items}
          style={{ 
            backgroundColor: "#0f172a", 
            direction: "rtl", 
            borderBottom: "none", 
            lineHeight: "50px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center"
          }}
        />
      </div>
    </div>
  );
};