import { useEffect, useState } from 'react'
import { Dropdown, Menu, Tooltip } from 'antd'
import BadgeIcon from './badge-icon.svg'
import './styles.css'
import { EllipsisOutlined } from '@ant-design/icons'

const WidgetAppHeader = ({ step, onclick }: { step: string, onclick: (key: string) => void }) => {
    const isIframe = window.location !== window.parent.location
    const profileImg = JSON.parse(localStorage.getItem("user")!)?.profileImg ?? ''
    const username = JSON.parse(localStorage.getItem("user")!)?.username ?? ''

    const [visible, setVisible] = useState(false);
    const handleVisibleChange = () => {
        setVisible((prev) => !prev);
    };

    useEffect(() => {
        setVisible(false)
    }, [step])

    const menu = (
        <Menu onClick={({ key }) => onclick(key)}>
            <Menu.Item key="profileSettings">
                Settings
            </Menu.Item>
            <Menu.Item key="logout">
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <div className='header-wrapper' style={{
            top: isIframe ? '3%' : '1%',
            left: isIframe ? '70%' : '88%'
        }}>
            <div className='user-detail'>
                <div className='user-info'>
                    <Tooltip title={username}>
                        <span className="username">{username}</span>
                    </Tooltip>
                    <div className='icon-box'>
                        <span>1000</span>
                        <img src={BadgeIcon} alt="badge-icon" />
                    </div>
                </div>
                <div className='avatar'>
                    <Dropdown
                        overlay={menu}
                        trigger={['click']}
                        visible={visible}
                        onVisibleChange={handleVisibleChange}
                    >
                        <img src={profileImg} alt='profile-image' style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: "50%",
                            cursor: "pointer"
                        }} />
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}

export default WidgetAppHeader;
