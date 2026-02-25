import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { MB } from '../common/constants';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './upload.config';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, _metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file provided');
    }

    if (value.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds the max limit of ${MAX_FILE_SIZE / MB}MB`,
      );
    }

    return value;
  }
}

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, _metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(value.mimetype)) {
      throw new BadRequestException(
        `File type is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    return value;
  }
}
