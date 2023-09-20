import bcrypt from 'bcrypt';
// import bcrypt
const saltRounds: number = 10;
// import jwt
import jwt from 'jsonwebtoken';
// import db
import db from '../models/userModel';
import { IUser } from '../models/userModel'
// import env config
import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from 'express';

console.log('db: ', db)
const userController: any = {
    createUser: (req: Request, res: Response, next: NextFunction) => {
      console.log('inside create user')
      // pull user/pass/ARN off req.body
      //const { username, password, ARN } = req.body;
      const username: string = req.body.username;
      const password: string = req.body.password;
      const ARN: string = req.body.ARN;
      try {
        // check if username already exists in DB
        db.findOne({username: username})
        .then(obj => {
          // if so, pause and then notify the user
          if(obj) {
            setTimeout(() => {
              // TODO: notify user that username is taken
              return next({
                error: 'An account with this username already exists.'
              });
            }, 500);
          }
        })
        // use bcrypt.hash to hash password
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
          if (err) {
            console.log(err);
            return next(err);
          }
          // insert into db using user, hash and arn
          db.create({username: username, password: hashedPassword, ARN: ARN})
          // store user or arn on cookies or locals to pull and populate role arn on controllers?
        });
        res.locals.username = username;
        console.log(username);
        res.locals.ARN = ARN;
        return next();
      } catch (err) {
        console.log(err);
        return next(err);
      }
    },
  
    verifyUser: async (req: Request, res: Response, next: NextFunction) => {
      // pull user/pass off req.body
      try {
        const username: string = req.body.username;
        const password: string = req.body.password;
        // find user in db
        const user = await db.findOne({username: username}) as IUser;
        let hashedPassword: string;
        // if user doesn't exist, set an empty hashedPassword
        if(!user) {
          hashedPassword = '';
        }
        // otherwise grab hashed pass
        else {
          hashedPassword = user.password;
        }
        try {
          // use bcrypt.compare to check password
          const match: boolean = await bcrypt.compare(password, hashedPassword);
          // if it doesnt match
          if (!match) {
            // return next with err message
            return next({ error: 'Incorrect username or password' });
          }
          res.locals.username = username;
          res.locals.ARN = user.ARN;
          // return next
          return next();
        } catch (err) {
          console.log(err);
          return next(err);
        }
      } catch (err) {
        console.log(err);
        return next(err);
      }
    },
    createToken: async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log('inside createToken');
        // pull user off res.locals
        const username: string = res.locals.username;
        const ARN: string = res.locals.ARN
        // find user in db
        const user = await db.findOne({username: username}) as IUser;
        // use jwt.sign on user obj with secret env key
        const token: string = await jwt.sign({username: user.username}, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: 60 * 60// Expires in one hour
        })
        // create cookie with token
        await res.cookie('token', token, {
          maxAge: (60 * 60 * 1000), // Expires in one hour
          httpOnly: true
        })
        // create cookie with arn 
        await res.cookie('ARN', ARN);
        // give this an expiration to persist session?
        // ex. delete when they logout
        // and delete after an hour
        return next();
      } catch (err) {
        console.log(err);
        return next(err);
      }
    },
    verifyToken: async (req: Request, res: Response, next: NextFunction) => {
      // pull token from cookies
      console.log('inside verifyToken');
      const token: string = req.cookies.token;
      try {
        // use jwt.verify to check if token is valid with secret env key
        await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: Error, success: {username: string}) => {
          if (err) {
            console.log(err);
            return next(err)
          }
          return next();
        })
      } catch (err) {
        console.log(err);
        return next(err);
      }
    },
  
    deleteToken: (req: Request, res: Response, next: NextFunction) => {
      try {
        // use res.clearCookie to delete both cookies
        res.clearCookie('token');
        return next();
      } catch (err) {
        console.log(err);
        return next(err);
      }
    }
};

export default userController;
