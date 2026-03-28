import React, { useState } from "react";
import { Refine } from "@refinedev/core";
import { useNotificationProvider, ErrorComponent } from "@refinedev/antd";
import { dataProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { App as AntdApp, ConfigProvider, Layout, Button, Grid } from "antd";
import { MenuOutlined, ArrowRightOutlined } from "@ant-design/icons";

import { supabase } from "./supabaseClient";
import { CustomSider } from "./components/CustomSider";
import { Nnasandn } from "./components/Nnasandn"; 
import { UserLevelList } from "./pages/nasandnakan/userlvlelist";
import { UserList } from "./pages/nasandnakan/userlisr"; 

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const globalStyles = `
  body, html, #root { margin: 0; padding: 0; height: 100%; width: 100%; overflow-x: hidden; }
  .ant-layout { flex-direction: row !important; display: flex !important; width: 100% !important; }
  .inner-layout { flex-direction: column !important; flex: 1 !important; min-width: 0; }
  .ant-layout-content { background: #f0f2f5 !important; width: 100%; }
`;

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
            notificationProvider={useNotificationProvider} 
            resources={[
              { name: "userlevle", list: "/userlevle" },
              { name: "user", list: "/users" },
              { name: "nasandni-koga", list: "/nasandni-koga" },
              { name: "darazhmeryari", list: "/darazhmeryari" }
            ]}
          >
            <Routes>
              <Route
                element={
                  <Layout style={{ minHeight: "100vh", width: "100%" }}>
                    <CustomSider 
                      collapsed={collapsed} 
                      setCollapsed={setCollapsed} 
                      isMobile={isMobile}
                    />
                    
                    <Layout className="inner-layout">
                      <Header style={{ 
                        background: "#0f172a", 
                        padding: "0 20px", 
                        display: "flex", 
                        alignItems: "center",
                        height: "64px",
                        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
                        width: "100%"
                      }}>
                        <Button
                          type="text"
                          icon={collapsed ? 
                            <MenuOutlined style={{ fontSize: "22px" }} /> : 
                            <ArrowRightOutlined style={{ fontSize: "22px" }} />
                          }
                          onClick={() => setCollapsed(!collapsed)}
                          style={{
                            width: 50,
                            height: 50,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "10px"
                          }}
                        />
                        <span style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>
                          کۆمپانیای بێژوو | لقی بێژوو
                        </span>
                      </Header>
                      
                      <Content style={{ padding: "15px" }}>
                        <div style={{ width: "100%", maxWidth: "100%" }}>
                          <Nnasandn />
                          <div style={{ marginTop: "15px" }}>
                            <Outlet />
                          </div>
                        </div>
                      </Content>
                    </Layout>
                  </Layout>
                }
              >
                {/* ڕێڕەوەکان - Routes */}
                <Route path="/userlevle" element={<UserLevelList />} />
                <Route path="/users" element={<UserList />} /> 
                
                {/* ئەمانە بە کاتی دامناون تا 404 نەدەن، دەتوانی دواتر لاپەڕەی خۆیان دابنێیت */}
                <Route path="/nasandni-koga" element={<div>لاپەڕەی ناساندنی کۆگا</div>} />
                <Route path="/darazhmeryari" element={<div>لاپەڕەی دارەژمێریاری</div>} />
                <Route path="/rekxstnakan" element={<div>لاپەڕەی ڕێکخستنەکان</div>} />
                
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