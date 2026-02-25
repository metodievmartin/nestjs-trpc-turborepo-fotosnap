import { extname } from 'node:path';
import { v4 as uuidV4 } from 'uuid';
import type { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { diskStorage, FileFilterCallback } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { MB } from '../common/constants';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const MAX_FILE_SIZE = 5 * MB;

export const editFileName = (
  _request: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  callback(null, `${uuidV4()}${extname(file.originalname)}`);
};

export const imageFileFilter = (
  _request: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(new BadRequestException('Only image files are allowed!'));
  }

  callback(null, true);
};

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/images',
    filename: editFileName,
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};
