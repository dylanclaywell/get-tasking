import {
  Accessor,
  JSXElement,
  Resource,
  Setter,
  createContext,
  createResource,
} from 'solid-js'
import { Tag } from '../types/Models'
import { invoke } from '@tauri-apps/api'

interface State {
  tags: Resource<Tag[] | undefined>
}

type Context = [
  Accessor<State>,
  {
    mutateTags: Setter<Tag[] | undefined>
  }
]

const [initialTags] = createResource<Tag[]>(() => [])
const initialValues: Accessor<State> = () => ({
  tags: initialTags,
})

export const TagsContext = createContext<Context>([
  initialValues,
  { mutateTags: () => [] as any },
])

async function fetchTags() {
  return JSON.parse(await invoke('get_tags')) as Tag[]
}

export default function TagsProvider(props: { children: JSXElement }) {
  const [tags, { mutate }] = createResource<Tag[]>(fetchTags)
  const store: Context = [
    () => ({ tags }),
    {
      mutateTags: mutate,
    },
  ]

  return (
    <TagsContext.Provider value={store}>{props.children}</TagsContext.Provider>
  )
}
