import React from "react";
import { useMenu, useGetIdentity } from "@refinedev/core";
import { Layout, Menu, Divider, Typography, Drawer } from "antd";
import { Link, useLocation } from "react-router-dom";
import { 
  DashboardOutlined, 
  SettingOutlined,
  SolutionOutlined,
  CalculatorOutlined,
  WalletOutlined
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

  const activeKey = React.useMemo(() => {
    const path = pathname.toLowerCase();
    // ئەگەر لە هەر کام لە لاپەڕەکانی وەرگرتن بیت، با مێنۆی وەرگرتنەکە چالاک بێت
    if (path.includes("/wargrtn")) return "/wargrtn";
    return refineSelectedKey;
  }, [pathname, refineSelectedKey]);

  const items = [
    { 
      key: "/dashboard", 
      icon: <DashboardOutlined />, 
      label: <Link to="/dashboard">داشبۆرد</Link> 
    },
    {
      key: "accounting-group",
      icon: <CalculatorOutlined />,
      label: "ژمێریاری",
      children: [
        { 
          key: "/wargrtn", 
          icon: <WalletOutlined />, 
          label: <Link to="/wargrtn">وەرگرتنی پارە</Link> 
        },
      ],
    },
    {
      key: "setup-group",
      icon: <SettingOutlined />,
      label: "ڕێکخستنەکان",
      children: [
        { 
          key: "/userlevle", 
          icon: <SolutionOutlined />, 
          label: <Link to="/userlevle"> ناساندنەكان</Link> 
        },
      ],
    },
  ];

  const renderMenu = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px", textAlign: "center", background: "#1e293b" }}>
        <Text style={{ color: "white", fontSize: "17px", fontWeight: "bold" }}>
          {user?.fullname || "بەکارھێنەر"}
        </Text>
      </div>
      <Divider style={{ borderColor: "#334155", margin: 0 }} />
      <Menu
        theme="dark"
        selectedKeys={[activeKey || ""]}
        defaultOpenKeys={["accounting-group", "setup-group"]}
        mode="inline"
        style={{ backgroundColor: "transparent", border: 0, marginTop: "10px", flex: 1 }}
        items={items}
        onClick={() => { if(isMobile) setCollapsed(true); }}
      />
    </div>
  );

  return isMobile ? (
    <Drawer placement="right" open={!collapsed} onClose={() => setCollapsed(true)} width={260} styles={{ body: { padding: 0, backgroundColor: "#0f172a" }, header: { display: "none" } }}>
      {renderMenu}
    </Drawer>
  ) : (
    <Sider width={260} collapsed={collapsed} style={{ backgroundColor: "#0f172a", height: "100vh", position: "sticky", top: 0 }}>
      {renderMenu}
    </Sider>
  );
};