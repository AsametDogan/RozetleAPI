import { Request } from 'express';

export default interface IRequestWithFile extends Request {
    file?: Express.Multer.File; // Multer tarafından doldurulan dosya bilgisi
}

