import React, { useState } from 'react';
import { AiOutlineAlignLeft, AiOutlineAlignRight, AiOutlineDashboard, AiOutlineUser, AiOutlineShoppingCart } from 'react-icons/ai';
import { SiBrandfolder } from 'react-icons/si';
import { BiCategoryAlt } from 'react-icons/bi';
import { FaClipboardList, FaBloggerB } from 'react-icons/fa';
import { ImBlog } from 'react-icons/im';
import { IoIosNotifications } from 'react-icons/io';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button, Layout, Menu, theme } from 'antd';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <h2 className='text-white fs-5 text-center py-3 mb-0'>
            <span className='sm-logo'>TZ</span>
            <span className='lg-logo'>Trust Zone</span>
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['']}
          onClick={({ key }) => {
            if (key === 'signout') {
              // handle signout logic
            } else {
              navigate(key);
            }
          }}
          items={[
            {
              key: '',
              icon: <AiOutlineDashboard className='fs-4' />,
              label: 'Settings',
            },
            {
              key: 'notifications',
              icon: <AiOutlineUser className='fs-4' />,
              label: 'Notifications',
            },
            {
              key: 'language',
              icon: <FaBloggerB className='fs-4' />,
              label: 'Languages',
              children: [
                {
                  key: 'arabic',
                  icon: <FaBloggerB className='fs-5' />,
                  label: 'Arabic',
                },
                {
                  key: 'english',
                  icon: <ImBlog className='fs-5' />,
                  label: 'English',
                },
              ],
            },
            {
              key: 'help',
              icon: <FaClipboardList className='fs-4' />,
              label: 'Help',
            },
            // Divider before the logout button
            {
              type: 'divider',
            },
            {
              key: 'log out',
              icon: <FaClipboardList className='fs-4' />,
              label: 'Log out',
            },
          ]}
        />
      </Sider>
      <Layout className='site-layout'>
        <Header className='d-flex justify-content-between ps-1 pe-5'
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <AiOutlineAlignRight /> : <AiOutlineAlignLeft />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div className='d-flex gap-3 align-items-center'>
            <div className='position-relative'>
              <IoIosNotifications className='fs-4' />
              <span className='badge rounded-circle p-1 position-absolute'>3</span>
            </div>
            <div className='d-flex gap-3 align-items-center dropdown'>
              <div>
                <img
                  className="rounded-circle"
                  width={45}
                  height={45}
                  src="https://i.pinimg.com/736x/97/22/2f/97222fa158251b2feb29efb5c5103f57.jpg"
                  alt=""
                />
              </div>
              <div
                role="button"
                id="dropdownMenuLink"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <h5 className='mb-0'>Arwa</h5>
                <p className='mb-0'>arwaahmed2553@gmail.com</p>
              </div>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <li>
                  <Link
                    className="dropdown-item py-1 mb-1"
                    style={{ height: "auto", lineHeight: "20px" }}
                    to="/admin"
                  >
                    View Profile
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item py-1 mb-1"
                    style={{ height: "auto", lineHeight: "20px" }}
                    to="/admin"
                  >
                    Signout
                  </Link>
                </li>
              </div>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {/* Render nested routes */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
