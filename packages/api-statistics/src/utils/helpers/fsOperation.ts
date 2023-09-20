import { access, constants, mkdir, unlink } from 'fs/promises'
import path from 'path'

export async function checkOrCreateFolder(dir: string) {
  try {
    await access(dir, constants.F_OK)
  } catch (error) {
    await mkdir(dir, { recursive: true })
  }
}

export async function removeFile(dir: string, fileName: string) {
  const fullPath = path.join(dir, fileName)
  await unlink(fullPath)
}
