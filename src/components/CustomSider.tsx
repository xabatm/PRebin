import React from "react";
import { useMenu, useGetIdentity } from "@refinedev/core";
import { Layout, Menu, Divider, Typography, Drawer } from "antd";
import { Link, useLocation } from "react-router-dom";
import { 
  DashboardOutlined, 
  SettingOutlined,
  SolutionOutlined
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
    if (path.includes("/userlevle")) return "/userlevle";
    if (path.includes("/users")) return "/users"; 
    return refineSelectedKey;
  }, [pathname, refineSelectedKey]);

  // لێرەدا تەنها داشبۆرد و ڕێکخستنەکان (ئاستی بەکارهێنەر) ماوەتەوە
  // ناساندنی بەکارهێنەر لادراوە چونکە دەچێتە ناو مێنۆی سەرەوە (Nnasandn)
  const items = [
    { 
      key: "/dashboard", 
      icon: <DashboardOutlined />, 
      label: <Link to="/dashboard">داشبۆرد</Link> 
    },
    {
      key: "setup-group",
      icon: <SettingOutlined />,
      label: "ڕێکخستنەکان",
      children: [
        { 
          key: "/userlevle", 
          icon: <SolutionOutlined />, 
          label: <Link to="/userlevle">ئاستی بەکارهێنەر</Link> 
        },
      ],
    },
  ];

  const renderMenu = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px", textAlign: "center", background: "#1e293b" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Text style={{ color: "white", fontSize: "17px", fontWeight: "bold", whiteSpace: "nowrap" }}>
            {user?.fullname || "بەکارھێنەر"}
          </Text>
          <Text style={{ color: "#94a3b8", fontSize: "12px", whiteSpace: "nowrap" }}>
            سیستەمی بەڕێوەبردن
          </Text>
        </div>
      </div>
      <Divider style={{ borderColor: "#334155", margin: 0 }} />
      <Menu
        theme="dark"
        selectedKeys={[activeKey || ""]}
        defaultOpenKeys={["setup-group"]}
        mode="inline"
        style={{ backgroundColor: "transparent", border: 0, marginTop: "10px", flex: 1 }}
        items={items}
        onClick={() => { if(isMobile) setCollapsed(true); }}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="right"
        closable={true}
        onClose={() => setCollapsed(true)}
        open={!collapsed}
        width={260}
        styles={{ 
            body: { padding: 0, backgroundColor: "#0f172a" },
            header: { display: "none" }
        }}
      >
        {renderMenu}
      </Drawer>
    );
  }

  return (
    <Sider
      width={260}
      collapsedWidth={0}
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        backgroundColor: "#0f172a",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
        overflow: "hidden"
      }}
    >
      {renderMenu}
    </Sider>
  );
};