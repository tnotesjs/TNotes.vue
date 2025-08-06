import { repoName, ignore_dirs, author, root_item } from '../../.tnotes.json'

/**
 * 笔记仓库名儿
 */
export const REPO_NAME = repoName

/**
 * 笔记仓库作者
 */
export const AUTHOR = author

/**
 * notes 目录下需要忽略的笔记目录
 * @example
 * [".vscode", "0000", "assets", "node_modules"]
 */
export const IGNORE_DIRS = ignore_dirs

/**
 * 根知识库配置项
 */
export const ROOT_ITEM = root_item

/**
 * 存储本地笔记文件夹所在位置的 key
 */
export const NOTES_DIR_KEY = 'NOTES_DIR_KEY__' + repoName

/**
 * 用户选择的视图
 */
export const NOTES_VIEW_KEY = 'NOTES_VIEW_KEY__' + repoName

/**
 * 全局配置 EnWordList.vue 组件是否自动展示词汇卡片
 */
export const EN_WORD_LIST_COMP_IS_AUTO_SHOW_CARD =
  'EN_WORD_LIST_COMP_IS_AUTO_SHOW_CARD__' + repoName

/**
 * VitePress HOME README 文件名
 * 该文件内容基于 HOME README 而生成，作为 github pages 中的 README 文件，主要用于展示笔记的目录结构。
 */
export const TOC = 'TOC'
export const TOC_MD = TOC + '.md'

/**
 * 英语单词仓库基地址
 * https://github.com/Tdahuyou/en-words/blob/main/{word}.md
 */
export const EN_WORDS_REPO_BASE_URL =
  'https://github.com/Tdahuyou/TNotes.en-words/blob/main/'

/**
 * 英语单词仓库 raw 地址
 * https://raw.githubusercontent.com/Tdahuyou/TNotes.en-words/refs/heads/main/{word}.md
 */
export const EN_WORDS_REPO_BASE_RAW_URL =
  'https://raw.githubusercontent.com/Tdahuyou/TNotes.en-words/refs/heads/main/'
