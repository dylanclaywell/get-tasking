export interface TodoItem {
  id: string
  title: string
  description: string | null
  notes: string | null
  isCompleted: boolean
  dateCompleted: Date | null
  dateCreated: Date
  tags: Tag[]
}

export interface TodoItemModel {
  id: string
  title: string
  description: string | null
  notes: string | null
  is_completed: boolean
  date_completed: string | null
  time_completed: string | null
  timezone_completed: string | null
  date_created: string
  time_created: string
  timezone_created: string
}

export interface Tag {
  id: string
  name: string
  color: string
}
