import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ============================================================
// 配置区 - 在此修改要收集的笔记编号
// ============================================================
const NOTE_IDS = [
  `0106`,
  `0011`,
  // `0012`,
  // `0016`,
  // `0021`,
  // `0022`,
  // `0026`,
  // `0031`,
  // `0035`,
  // `0036`,
  // `0040`,
]

// ============================================================
// 以下为脚本逻辑，无需修改
// ============================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const NOTES_DIR = path.resolve(__dirname, '..', 'notes')
const OUTPUT_FILE = path.resolve(__dirname, 'MERGE_NOTES_OUTPUT.md')

/**
 * 在 notes/ 目录下查找匹配编号的笔记文件夹。
 * 目录名格式为 "{编号}. {标题}"，例如 "0001. 组件属性（Props）"
 */
async function findNoteDir(id) {
  const entries = await fs.readdir(NOTES_DIR, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith(id + '.')) {
      return entry.name
    }
  }
  return null
}

async function main() {
  const parts = []

  for (const id of NOTE_IDS) {
    const dirName = await findNoteDir(id)
    if (!dirName) {
      console.warn(`⚠️  未找到编号 ${id} 的笔记目录，已跳过`)
      continue
    }

    const readmePath = path.join(NOTES_DIR, dirName, 'README.md')
    let content
    try {
      content = await fs.readFile(readmePath, 'utf-8')
    } catch {
      console.warn(`⚠️  无法读取 ${readmePath}，已跳过`)
      continue
    }

    parts.push(`---\n## ${dirName}\n\n${content.trim()}`)
    console.log(`✅  已收集: ${dirName}`)
  }

  if (parts.length === 0) {
    console.log('没有收集到任何笔记内容，1.md 保持不变。')
    return
  }

  const output = parts.join('\n\n')
  await fs.writeFile(OUTPUT_FILE, output, 'utf-8')
  console.log(`\n📝 已写入 ${OUTPUT_FILE}，共合并 ${parts.length} 篇笔记`)
}

main().catch((err) => {
  console.error('❌ 脚本执行失败:', err)
  process.exit(1)
})
