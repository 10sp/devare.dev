import clsx from 'clsx'
import React, { useEffect } from 'react'
import { BsBoxArrowInUpRight } from 'react-icons/bs'
import { ref } from 'src/config'
import { useUserPreferences } from 'src/stores/preferences'
import { CardPropsType } from 'src/types'

type RootCardProps = CardPropsType & {
  children: React.ReactNode
  titleComponent?: React.ReactNode
  fullBlock?: boolean
}

export const Card = ({
  meta,
  titleComponent,
  className,
  children,
  fullBlock = false,
  knob,
}: RootCardProps) => {
  const { openLinksNewTab, isOrganizeMode, setIsOrganizeMode } = useUserPreferences()
  const { link, icon, label, badge } = meta

  const handleHeaderLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    let url = `${link}?${ref}`
    window.open(url, openLinksNewTab ? '_blank' : '_self')
  }

  // Handle double click on drag button to enter organize mode
  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.blockHeaderDragButton')) {
      setIsOrganizeMode(true)
      // Add class to document element for global styling
      document.documentElement.classList.add('organizeMode')
    }
  }

  // Add escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOrganizeMode) {
        setIsOrganizeMode(false)
        document.documentElement.classList.remove('organizeMode')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOrganizeMode, setIsOrganizeMode])

  return (
    <div
      className={clsx(
        'block',
        fullBlock && 'fullBlock',
        className,
        isOrganizeMode && 'organizeMode'
      )}
      onDoubleClick={handleDoubleClick}>
      <div className="blockHeader">
        {knob}
        <span className="blockHeaderIcon">{icon}</span> {titleComponent || label}{' '}
        {link && (
          <a className="blockHeaderLink" href={link} onClick={handleHeaderLinkClick}>
            <BsBoxArrowInUpRight />
          </a>
        )}
        {badge && <span className="blockHeaderBadge">{badge}</span>}
      </div>

      {!isOrganizeMode && <div className="blockContent scrollable">{children}</div>}
    </div>
  )
}
