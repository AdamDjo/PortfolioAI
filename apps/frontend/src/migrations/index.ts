import * as migration_20260817_094223_initial from './20260817_094223_initial'
import * as migration_20260817_100546_projects from './20260817_100546_projects'

export const migrations = [
  {
    up: migration_20260817_094223_initial.up,
    down: migration_20260817_094223_initial.down,
    name: '20260817_094223_initial',
  },
  {
    up: migration_20260817_100546_projects.up,
    down: migration_20260817_100546_projects.down,
    name: '20260817_100546_projects',
  },
]
