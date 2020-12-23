import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import path from 'path';
import {
	__PROD__,
	__PORT__,
	__REDIS_SECRET__,
	__COOKIE_NAME__,
} from './constants';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Updoot } from './entities/Updoot';

const main = async () => {
	const conn = await createConnection({
		type: 'postgres',
		database: 'lireddit2',
		username: 'jithin',
		password: 'root',
		logging: true,
		synchronize: true,
		entities: [Post, User, Updoot],
		migrations: [path.join(__dirname, './migrations/*')],
	});
	conn.runMigrations();

	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis();

	app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

	app.use(
		session({
			name: __COOKIE_NAME__,
			store: new RedisStore({
				client: redis,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				secure: __PROD__, // only work in https
				sameSite: 'lax', // related to csrf
			},
			secret: __REDIS_SECRET__,
			resave: false,
			saveUninitialized: false,
		}),
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({
			req,
			res,
			redis,
		}),
	});

	apolloServer.applyMiddleware({
		app,
		cors: false,
	});

	app.listen(__PORT__, () => {
		console.log(`Server started on localhost: ${__PORT__}`);
	});
};

main().catch((err) => {
	console.error(err);
});
