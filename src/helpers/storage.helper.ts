
import multer from 'multer';



export const profileImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/profile/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-pp-" + file.originalname)
  },
}
)

export const badgeImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/badge/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-badge-" + file.originalname)
  },
}
)


