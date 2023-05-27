import { HttpException, HttpStatus } from '@nestjs/common'
import { diskStorage } from 'multer'
import { fsAsync, getUniqueId } from './utils/helpers'
import { extname } from 'path'
import { MAX_SIZE_FILE, MIME_TYPE_FILE, UPLOAD_PATH } from './const'

export const multerOptions = {
  limits: {
    fileSize: Math.floor(MAX_SIZE_FILE),
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.match(MIME_TYPE_FILE)) {
      cb(null, true)
    } else {
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      )
    }
  },
  storage: diskStorage({
    destination: async (req: any, file: Express.Multer.File, cb: any) => {
      try {
        const uploadPath = `.${UPLOAD_PATH}`
        await fsAsync.checkOrCreateFolder(uploadPath)
        cb(null, uploadPath)
      } catch (error) {
        cb(new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR))
      }
    },
    filename: (req: any, file: Express.Multer.File, cb: any) => {
      cb(null, `${getUniqueId()}${extname(file.originalname)}`)
    },
  }),
}
