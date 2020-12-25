import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { createVoteStatusLoader } from './utils/createVoteStatusLoader';
import { createCreatorLoader } from './utils/CreatorLoader';

export type MyContext = {
	// @ts-ignore
	req: Request & { session: Express.Session };
	res: Response;
	redis: Redis;
	userLoader: ReturnType<typeof createCreatorLoader>;
	updootLoader: ReturnType<typeof createVoteStatusLoader>;
};
