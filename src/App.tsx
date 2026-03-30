import React, { useState, useEffect } from "react";
import { Refine, Authenticated, useLogout } from "@refinedev/core";
import { useNotificationProvider, ErrorComponent } from "@refinedev/antd";
import { dataProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { App as AntdApp, ConfigProvider, Layout, Button, Grid } from "antd";
import { 
  MenuOutlined, 
  ArrowRightOutlined, 
  LogoutOutlined 
} from "@ant-design/icons";

import { supabase } from "./supabaseClient";
import { authProvider } from "./authProvider"; 
import { CustomSider } from "./components/CustomSider";
import { Nnasandn } from "./components/Nnasandn"; 
import { ZhmeryaryMenu } from "./components/ZhmeryaryMenu";
import { Mdraw } from "./components/Mdraw"; 
import { Msale } from "./components/Mseal"; 
import { LoginPage } from "./pages/LoginPage"; 
import { UserLevelList } from "./pages/nasandnakan/userlvlelist";
import { UserList } from "./pages/nasandnakan/userlisr"; 
import { MshtaryList } from "./pages/nasandnakan/mshtarylist"; 
import { BarhamList } from "./pages/nasandnakan/barhamlist";
import { NrxFrosh } from "./pages/nasandnakan/nrxfrosh";
import { Wargrtn } from "./pages/zhmeryare/wargrtn";
import { WargrtnList } from "./pages/zhmeryare/WargrtnList";
import { Draw } from "./pages/zhmeryare/draw"; 
import { DrawList } from "./pages/zhmeryare/drawlist"; 
import { SaleForm } from "./pages/frosh/seal"; 
import { SaleList } from "./pages/frosh/SaleList"; 
import { CompanyList } from "./pages/nasandnakan/cmopany"; 
import { CustomerStatement } from "./pages/report/kashfhsab"; 

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const globalStyles = `
  body, html, #root { margin: 0; padding: 0; height: 100%; width: 100%; overflow-x: hidden; font-family: 'Kurdish Font', sans-serif; }
  .ant-layout { flex-direction: row !important; display: flex !important; width: 100% !important; }
  .inner-layout { flex-direction: column !important; flex: 1 !important; min-width: 0; }
  .ant-layout-content { background: #f0f2f5 !important; width: 100%; }
`;

// --- تایبەتمەندی نوێ: چاودێریکردنی چالاکی کاربەر ---
const AutoLogoutHandler: React.FC = () => {
  const { mutate: logout } = useLogout();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      // ۱۰ خولەک = ۱۰ * ٦٠ * ۱۰۰۰ میڵی چرکە
      timer = setTimeout(() => {
        logout();
      }, 10 * 60 * 1000);
    };

    // ڕووداوەکان کە چالاکی کاربەر دیاری دەکەن
    const activityEvents = [
      "mousedown", "mousemove", "keydown", 
      "scroll", "touchstart", "click"
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // دەستپێکردن لە کاتی بارکردنی ئەپەکە

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logout]);

  return null; // هیچ شتێک نیشان نادات، تەنها لۆژیکەکە جێبەجێ دەکات
};

const CustomHeader: React.FC<{ 
  collapsed: boolean; 
  setCollapsed: (val: boolean) => void;
  isMobile: boolean;
}> = ({ collapsed, setCollapsed, isMobile }) => {
  const { mutate: logout } = useLogout();
  return (
    <Header style={{ 
      background: "#0f172a", padding: "0 20px", display: "flex", alignItems: "center",
      justifyContent: "space-between", height: "64px", boxShadow: "0 1px 4px rgba(0,21,41,.08)", width: "100%"
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          type="text"
          icon={collapsed ? <MenuOutlined style={{ fontSize: "22px" }} /> : <ArrowRightOutlined style={{ fontSize: "22px" }} />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ width: 50, height: 50, color: "white", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "10px" }}
        />
        <span style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>شیرینی تاج</span>
      </div>
      <Button 
        type="text" icon={<LogoutOutlined style={{ fontSize: "18px" }} />} onClick={() => logout()}
        style={{ color: "#ff4d4f", display: "flex", alignItems: "center", fontWeight: "bold", gap: "8px" }}
      >
        {!isMobile && "چوونەدەرەوە"}
      </Button>
    </Header>
  );
};

function App() {
  const screens = useBreakpoint();
  const isMobile = screens.md === false;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <style>{globalStyles}</style>
      <ConfigProvider direction="rtl">
        <AntdApp>
          <Refine
            dataProvider={dataProvider(supabase)}
            authProvider={authProvider} 
            notificationProvider={useNotificationProvider} 
            resources={[
              { name: "userlevle", list: "/userlevle" },
              { name: "users", list: "/users" },
              { name: "mshtary", list: "/mshtarylist" },
              { name: "barham", list: "/barhamlist" },
              { name: "wargrtn", list: "/wargrtn" },
              { name: "draw", list: "/draw" },
              { name: "sale", list: "/sale" },
              { name: "company", list: "/company" },
              { name: "statement", list: "/statement" }
            ]}
          >
            {/* لێرە چاودێرەکە جێگیر کراوە بۆ ئەوەی لە هەموو ئەپەکەدا کار بکات */}
            <AutoLogoutHandler />

            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                element={
                  <Authenticated key="authenticated-routes" fallback={<LoginPage />}>
                    <Layout style={{ minHeight: "100vh", width: "100%" }}>
                      <CustomSider collapsed={collapsed} setCollapsed={setCollapsed} isMobile={isMobile} />
                      <Layout className="inner-layout">
                        <CustomHeader collapsed={collapsed} setCollapsed={setCollapsed} isMobile={isMobile} />
                        <Content style={{ padding: "15px" }}>
                          <Routes>
                             <Route path="/userlevle/*" element={<Nnasandn />} />
                             <Route path="/users/*" element={<Nnasandn />} />
                             <Route path="/mshtarylist/*" element={<Nnasandn />} />
                             <Route path="/barhamlist/*" element={<Nnasandn />} />
                             <Route path="/nrxfrosh/*" element={<Nnasandn />} />
                             <Route path="/company/*" element={<Nnasandn />} />
                             
                             <Route path="/wargrtn/*" element={<ZhmeryaryMenu />} />
                             <Route path="/wargrtnlist/*" element={<ZhmeryaryMenu />} />
                             
                             <Route path="/draw/*" element={<Mdraw />} />
                             <Route path="/drawlist/*" element={<Mdraw />} />

                             <Route path="/sale/*" element={<Msale />} />
                             <Route path="/salelist/*" element={<Msale />} />

                             <Route index element={<UserList />} />
                          </Routes>

                          <div style={{ marginTop: "10px" }}>
                             <Outlet />
                          </div>
                        </Content>
                      </Layout>
                    </Layout>
                  </Authenticated>
                }
              >
                <Route path="/userlevle" element={<UserLevelList />} />
                <Route path="/users" element={<UserList />} /> 
                <Route path="/mshtarylist" element={<MshtaryList />} />
                <Route path="/barhamlist" element={<BarhamList />} />
                <Route path="/nrxfrosh" element={<NrxFrosh />} />
                <Route path="/company" element={<CompanyList />} />
                <Route path="/statement" element={<CustomerStatement />} />
                <Route path="/wargrtn" element={<Wargrtn />} /> 
                <Route path="/wargrtnlist" element={<WargrtnList />} /> 
                
                <Route path="/draw" element={<Draw />} /> 
                <Route path="/drawlist" element={<DrawList />} /> 

                <Route path="/sale" element={<SaleForm />} /> 
                <Route path="/salelist" element={<SaleList />} /> 
                
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;