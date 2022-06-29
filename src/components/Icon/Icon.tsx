import ChevronRight from './ChevronRight'
import ChevronsDown from './ChevronsDown'
import ChevronsUp from './ChevronsUp'
import Plus from './Plus'
import PlusCircle from './PlusCircle'
import Check from './Check'
import Settings from './Settings'
import Type from './Type'

import styles from './Icon.module.css'
import ChevronLeft from './ChevronLeft'

export type IconName =
  | 'chevron-right'
  | 'chevron-left'
  | 'chevrons-down'
  | 'chevrons-up'
  | 'plus-circle'
  | 'plus'
  | 'type'
  | 'check'
  | 'settings'

export interface Props {
  name: IconName
  className?: string
  width?: string
  height?: string
}

const defaultWidth = '24'
const defaultHeight = '24'

function getIcon(
  name: IconName,
  width: string | undefined,
  height: string | undefined
) {
  const props = {
    width: width ?? defaultWidth,
    height: height ?? defaultHeight,
  }

  switch (name) {
    case 'chevron-right':
      return <ChevronRight {...props} />
    case 'chevron-left':
      return <ChevronLeft {...props} />
    case 'plus-circle':
      return <PlusCircle {...props} />
    case 'plus':
      return <Plus {...props} />
    case 'type':
      return <Type {...props} />
    case 'chevrons-up':
      return <ChevronsUp {...props} />
    case 'chevrons-down':
      return <ChevronsDown {...props} />
    case 'check':
      return <Check {...props} />
    case 'settings':
      return <Settings {...props} />
  }
}

export default function Icon(props: Props) {
  return (
    <div class={[styles.icon, props.className].join(' ')}>
      {getIcon(props.name, props.width, props.height)}
    </div>
  )
}
