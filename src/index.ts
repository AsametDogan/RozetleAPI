import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import database from './config/database';
import cors from 'cors';


dotenv.config({ path: __dirname + '/.env' });


const app: Express = express();
database.db()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors<Request>());
app.use(express.static('public'))
app.use('/api', routes);

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
