import { access, constants, mkdir, unlink } from 'node:fs'
import path from 'node:path'

export const checkOrCreateFolder = (dir: string) => {
  return new Promise<boolean>((resolve, reject) => {
    access(dir, constants.F_OK, (err) => {
      if (err)
        mkdir(dir, { recursive: false }, (err) => {
          if (err) reject(false)
          resolve(true)
        })
      resolve(true)
    })
  })
}

export const removeFile = (dir: string, fileName: string) => {
  return new Promise<boolean>((resolve, reject) => {
    const fullDir = path.join('.', dir, fileName)
    unlink(fullDir, (err) => {
      if (err) resolve(false)
      resolve(true)
    })
  })
}
