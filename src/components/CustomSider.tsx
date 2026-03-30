import React, { useState } from "react";
import { useMenu, useGetIdentity } from "@refinedev/core";
import { Layout, Menu, Divider, Typography, Drawer } from "antd";
import { Link, useLocation } from "react-router-dom";
import { 
  DashboardOutlined, 
  SettingOutlined,
  SolutionOutlined,
  CalculatorOutlined,
  WalletOutlined,
  MoneyCollectOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  ShopOutlined,
  FileTextOutlined, 
  HistoryOutlined
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;

export const CustomSider: React.FC<{ 
  collapsed: boolean; 
  isMobile: boolean; 
  setCollapsed: (val: boolean) => void 
}> = ({ collapsed, isMobile, setCollapsed }) => {
  
  const { selectedKey: refineSelectedKey } = useMenu();
  const { pathname } = useLocation();
  const { data: user } = useGetIdentity<any>();
  
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // چاککردنی لۆجیکی دەستنیشانکردنی کلیلە چالاکەکان
  const activeKey = React.useMemo(() => {
    const path = pathname.toLowerCase();
    if (path.includes("/wargrtn")) return "/wargrtn";
    if (path.includes("/draw")) return "/draw"; 
    // لێرە چاککراوە: ئەگەر لە لیستی فرۆشتنیش بیت، کلیلەکە هەر بە /sale دەمێنێتەوە
    if (path.includes("/sale") || path.includes("/salelist")) return "/sale"; 
    if (path.includes("/company")) return "/company";
    if (path.includes("/statement")) return "/statement";
    return refineSelectedKey;
  }, [pathname, refineSelectedKey]);

  const onOpenChange = (keys: string[]) => {
    const rootSubmenuKeys = ["sales-group", "accounting-group", "reports-group", "setup-group"];
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const items = [
    { 
      key: "/dashboard", 
      icon: <DashboardOutlined />, 
      label: <Link to="/dashboard">داشبۆرد</Link> 
    },
    {
      key: "sales-group",
      icon: <ShoppingCartOutlined />,
      label: "بەشی فرۆشتن",
      children: [
        { 
          key: "/sale", 
          icon: <PlusOutlined />, 
          label: <Link to="/sale">فرۆشتنەکان</Link> // ناوەکیم گۆڕی بۆ گشتگیرتر
        },
      ],
    },
    {
      key: "accounting-group",
      icon: <CalculatorOutlined />,
      label: "ژمێریاری",
      children: [
        { key: "/wargrtn", icon: <WalletOutlined />, label: <Link to="/wargrtn">وەرگرتنی پارە</Link> },
        { key: "/draw", icon: <MoneyCollectOutlined />, label: <Link to="/draw">پێدانی پارە</Link> },
      ],
    },
    {
      key: "reports-group",
      icon: <FileTextOutlined />,
      label: "ڕاپۆرتەکان",
      children: [
        { 
          key: "/statement", 
          icon: <HistoryOutlined />, 
          label: <Link to="/statement">کەشف حیساب</Link> 
        },
      ],
    },
    {
      key: "setup-group",
      icon: <SettingOutlined />,
      label: "ڕێکخستنەکان",
      children: [
        { key: "/userlevle", icon: <SolutionOutlined />, label: <Link to="/userlevle"> ناساندنەكان</Link> },
        { 
          key: "/company", 
          icon: <ShopOutlined />, 
          label: <Link to="/company">شیرینی تاج</Link> 
        },
      ],
    },
  ];

  const renderMenu = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: "rtl" }}>
      {/* باشترکردنی ستایلی بەشی ناوەکە */}
      <div style={{ 
        padding: "24px 16px", 
        textAlign: "center", 
        background: "#0f172a",
        borderBottom: "1px solid #1e293b" 
      }}>
        <div style={{ 
          width: "45px", 
          height: "45px", 
          background: "#3b82f6", 
          borderRadius: "50%", 
          margin: "0 auto 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "20px",
          fontWeight: "bold"
        }}>
          {user?.fullname?.charAt(0) || "U"}
        </div>
        {!collapsed && (
          <Text style={{ color: "white", fontSize: "15px", fontWeight: "600", display: "block" }}>
            {user?.fullname || "بەکارھێنەر"}
          </Text>
        )}
      </div>

      <Menu
        theme="dark"
        selectedKeys={[activeKey || ""]}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={onOpenChange}
        mode="inline"
        style={{ 
          backgroundColor: "transparent", 
          border: 0, 
          marginTop: "10px", 
          flex: 1, 
          textAlign: "right" 
        }}
        items={items}
        onClick={() => { if(isMobile) setCollapsed(true); }}
      />
    </div>
  );

  return isMobile ? (
    <Drawer 
      placement="right" 
      open={!collapsed} 
      onClose={() => setCollapsed(true)} 
      width={260} 
      styles={{ body: { padding: 0, backgroundColor: "#0f172a" }, header: { display: "none" } }}
    >
      {renderMenu}
    </Drawer>
  ) : (
    <Sider 
      width={260} 
      collapsed={collapsed} 
      style={{ 
        backgroundColor: "#0f172a", 
        height: "100vh", 
        position: "sticky", 
        top: 0,
        boxShadow: "2px 0 8px rgba(0,0,0,0.15)"
      }}
    >
      {renderMenu}
    </Sider>
  );
};