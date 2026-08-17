import * as migration_20260817_094223_initial from './20260817_094223_initial'
import * as migration_20260817_100546_projects from './20260817_100546_projects'
import * as migration_20260817_104541_bookmarks from './20260817_104541_bookmarks'
import * as migration_20260817_124153_real_content from './20260817_124153_real_content'

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
  {
    up: migration_20260817_104541_bookmarks.up,
    down: migration_20260817_104541_bookmarks.down,
    name: '20260817_104541_bookmarks',
  },
  {
    up: migration_20260817_124153_real_content.up,
    down: migration_20260817_124153_real_content.down,
    name: '20260817_124153_real_content',
  },
]
