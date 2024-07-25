import './styles.css'
import BadgeIcon from './badge-icon.svg'

const WidgetAppHeader = () => {
    const isIframe = window.location !== window.parent.location
    const profileImg = localStorage.getItem("profilePic") ?? ''
    const username = localStorage.getItem("username") ?? ''

    console.log("p", profileImg)

    return (
        <div className='header-wrapper' style={{
            top: isIframe ? '3%' : '1%',
            left: isIframe ? '70%' : '90%'
        }}>
            <div className='user-detail'>
                <div className='user-info'>
                    <span>{username}</span>
                    <div className='icon-box'>
                        <img src={BadgeIcon} />
                    </div>
                </div>
                <div className='avatar'>
                    <img src={profileImg} alt='profie-image' style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: "50%"
                    }} />
                </div>
                {/* <Drawer
                    handleLogout={handleLogout}
                    handleStepper={handleStepper}
                    address={metamaskAddress ?? litAddress ?? ''}
                /> */}
            </div>
        </div>
    )
}

export default WidgetAppHeader
