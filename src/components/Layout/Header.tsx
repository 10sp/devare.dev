import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { BsFillBookmarksFill, BsFillGearFill, BsMoonFill } from 'react-icons/bs'
import { CgTab } from 'react-icons/cg'
import { IoMdSunny } from 'react-icons/io'
import { MdDoDisturbOff, MdGridView } from 'react-icons/md'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AvatarPlaceholder from 'src/assets/icons/avatar.svg?react'
import StreakIcon from 'src/assets/icons/fire_icon.svg?react'
import HackertabLogo from 'src/assets/logo.svg?react'
import { SearchBar } from 'src/components/Elements/SearchBar'
import { UserTags } from 'src/components/Elements/UserTags'
import { useAuth } from 'src/features/auth'
import { Changelog } from 'src/features/changelog'
import { identifyUserTheme, trackDNDDisable, trackThemeSelect } from 'src/lib/analytics'
import { useUserPreferences } from 'src/stores/preferences'
import { Button, CircleButton } from '../Elements'

export const Header = () => {
  const { openAuthModal, user, isConnected, isConnecting } = useAuth()

  const [themeIcon, setThemeIcon] = useState(<BsMoonFill />)
  const { theme, setTheme, setDNDDuration, isDNDModeActive, layout, setLayout } =
    useUserPreferences()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.add(theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.replace('dark', theme)
      setThemeIcon(<BsMoonFill />)
    } else if (theme === 'dark') {
      document.documentElement.classList.replace('light', theme)
      setThemeIcon(<IoMdSunny />)
    }
  }, [theme])

  const onThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    trackThemeSelect(newTheme)
    identifyUserTheme(newTheme)
  }

  const onSettingsClick = () => {
    navigate('/settings/general')
  }

  const onUnpauseClicked = () => {
    trackDNDDisable()
    setDNDDuration('never')
  }

  const toggleLayout = () => {
    const newLayout = layout === 'cards' ? 'grid' : 'cards'
    setLayout(newLayout)
  }

  return (
    <>
      <header className="AppHeader">
        <span className="AppName">
          <i className="logo">
            <CgTab />
          </i>{' '}
          <Link to="/">
            <HackertabLogo aria-label="devare.dev" className="logoText" />
          </Link>
          <Changelog />
        </span>
        <SearchBar />
        <div className="buttonsFlex extras mobileOnly">
          <CircleButton onClick={onSettingsClick}>
            <BsFillGearFill />
          </CircleButton>
        </div>
        <div className="buttonsFlex extras">
          {isDNDModeActive() && (
            <Button onClick={onUnpauseClicked} className="dndButton">
              <MdDoDisturbOff />
              Unpause
            </Button>
          )}

          <CircleButton onClick={toggleLayout}>
            <MdGridView />
          </CircleButton>
          <CircleButton onClick={onSettingsClick}>
            <BsFillGearFill />
          </CircleButton>
          <CircleButton onClick={onThemeChange} variant="darkfocus">
            {themeIcon}
          </CircleButton>
          <CircleButton onClick={() => navigate('/settings/bookmarks')}>
            <BsFillBookmarksFill />
          </CircleButton>
          <CircleButton
            isLoading={isConnecting}
            className={clsx('profileImageContainer', !isConnected && 'overflowHidden')}
            onClick={() => {
              if (isConnected) {
                navigate('/settings/general')
              } else {
                openAuthModal()
              }
            }}>
            {isConnected ? (
              <>
                <img className="profileImage" src={user?.imageURL} />
                <div className="streak">
                  <span className="content">
                    <StreakIcon className="icon" /> {user?.streak || 1}
                  </span>
                </div>
              </>
            ) : (
              <AvatarPlaceholder className="avatarPlaceholder" />
            )}
          </CircleButton>
        </div>
        {location.pathname === '/' && <UserTags />}
      </header>
    </>
  )
}
