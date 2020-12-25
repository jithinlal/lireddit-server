import DataLoader from 'dataloader';
import { User } from '../entities/User';

// * this solves the n+1 problem of fetching users multiple times on the home page
// * so basically input will be an array with bunch of ids
// * and the output will be a bunch of objects corresponds to that id
export const createCreatorLoader = () =>
	new DataLoader<number, User>(async (userIds) => {
		const users = await User.findByIds(userIds as number[]);
		const userIdToUser: Record<number, User> = {};
		users.forEach((u) => {
			userIdToUser[u.id] = u;
		});
		return userIds.map((userId) => userIdToUser[userId]);
	});
