import { IconProps } from './types'

export default function Check(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-check"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}
