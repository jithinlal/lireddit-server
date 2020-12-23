// import { MikroORM } from '@mikro-orm/core';
// import path from 'path';
// import { __PROD__ } from './constants';
// import { Post } from './entities/Post';
// import { User } from './entities/User';

// export default {
// 	type: 'postgresql',
// 	dbName: 'lireddit',
// 	user: 'jithin',
// 	password: 'root',
// 	debug: !__PROD__,
// 	entities: [Post, User],
// 	migrations: {
// 		path: path.join(__dirname, './migrations'),
// 		pattern: /^[\w-]+\d+\.[tj]s$/,
// 	},
// } as Parameters<typeof MikroORM.init>[0];
