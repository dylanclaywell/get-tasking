import { IconProps } from './types'

export default function ChevronRight(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-chevron-right"
      {...props}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
}
