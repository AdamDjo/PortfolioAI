import * as migration_20260817_094223_initial from './20260817_094223_initial'
import * as migration_20260817_100546_projects from './20260817_100546_projects'
import * as migration_20260817_104541_bookmarks from './20260817_104541_bookmarks'
import * as migration_20260817_124153_real_content from './20260817_124153_real_content'
import * as migration_20260817_155900_display_name from './20260817_155900_display_name'
import * as migration_20260818_135519_availability from './20260818_135519_availability'
import * as migration_20260818_141706_assistant from './20260818_141706_assistant'
import * as migration_20260824_203553_ai_tools from './20260824_203553_ai_tools'
import * as migration_20260825_192608_conversations from './20260825_192608_conversations'

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
  {
    up: migration_20260817_155900_display_name.up,
    down: migration_20260817_155900_display_name.down,
    name: '20260817_155900_display_name',
  },
  {
    up: migration_20260818_135519_availability.up,
    down: migration_20260818_135519_availability.down,
    name: '20260818_135519_availability',
  },
  {
    up: migration_20260818_141706_assistant.up,
    down: migration_20260818_141706_assistant.down,
    name: '20260818_141706_assistant',
  },
  {
    up: migration_20260824_203553_ai_tools.up,
    down: migration_20260824_203553_ai_tools.down,
    name: '20260824_203553_ai_tools',
  },
  {
    up: migration_20260825_192608_conversations.up,
    down: migration_20260825_192608_conversations.down,
    name: '20260825_192608_conversations',
  },
]
