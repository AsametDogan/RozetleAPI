import { Request } from 'express';
import IUser from './user.interface';

export default interface IRequestWithUser extends Request {
    user?: IUser;
}
