import { SiGithub } from 'react-icons/si'
import { VscRepoForked, VscStarFull } from 'react-icons/vsc'
import { CardItemWithActions, ColoredLanguagesBadge } from 'src/components/Elements'
import { useUserPreferences } from 'src/stores/preferences'
import { BaseItemPropsType, GithubFeedItemData } from 'src/types'
import { FeedItemHeader } from '../FeedItemHeader'

function numberWithCommas(x: number | string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const RepoFeedItem = (props: BaseItemPropsType<GithubFeedItemData>) => {
  const { item, index, analyticsTag } = props
  const { listingMode } = useUserPreferences()

  return (
    <CardItemWithActions
      source={analyticsTag}
      index={index}
      item={item}
      key={index}
      cardItem={
        <>
          <FeedItemHeader
            item={item}
            fallbackImage={
              <div className="rowCover repo">
                <SiGithub size={40} />
                <p className="title">{item.title}</p>
                <p className="description">{item.description}</p>
                <div className="details">
                  <p>
                    <VscStarFull className="rowItemIcon" /> {numberWithCommas(item.stars || 0)}{' '}
                    stars
                  </p>
                  <p>
                    <VscRepoForked className="rowItemIcon" /> {numberWithCommas(item?.forks || 0)}{' '}
                    forks
                  </p>
                </div>
              </div>
            }
          />

          {listingMode === 'normal' && (
            <div className="rowDetails">
              {item.stars && (
                <span className="rowItem">
                  <VscStarFull className="rowItemIcon" /> {numberWithCommas(item.stars || 0)} stars
                </span>
              )}
              <span className="rowItem">
                <VscRepoForked className="rowItemIcon" /> {numberWithCommas(item?.forks || 0)} forks
              </span>
              <span className="rowItem">
                <ColoredLanguagesBadge languages={item.tags} />
              </span>
            </div>
          )}
        </>
      }
    />
  )
}
