import { defineConfigObject } from 'reactive-vscode'
import { workspace } from 'vscode'
import * as Meta from './generated/meta'

export const config = defineConfigObject<Meta.ScopedConfigKeyTypeMap>(
  Meta.scopedConfigs.scope,
  Meta.scopedConfigs.defaults,
)

export function getConfig<K extends keyof Meta.ConfigKeyTypeMap, V = Meta.ConfigKeyTypeMap[K]>(key: K) {
  return workspace
    .getConfiguration()
    .get(key) as V
}
