import { Resolver, Mutation, Arg, Ctx, Query } from 'type-graphql';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
import { v4 } from 'uuid';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { __COOKIE_NAME__, __FORGET_PASSWORD_PREFIX__ } from '../constants';
import { UsernamePasswordInput } from '../utils/UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { UserResponse } from '../utils/UserResponse';
import { sendEmail } from '../utils/sendEmail';

@Resolver()
export class UserResolver {
	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg('email') email: string,
		@Ctx() { em, redis }: MyContext,
	) {
		const user = await em.findOne(User, { email });
		if (!user) {
			return true;
		}
		const token = v4();
		await redis.set(
			__FORGET_PASSWORD_PREFIX__ + token,
			user.id,
			'ex',
			1000 * 60 * 60 * 24 * 3,
		);
		sendEmail(
			email,
			`<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`,
		);
		return true;
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string,
		@Ctx() { req, em, redis }: MyContext,
	): Promise<UserResponse> {
		if (newPassword.length <= 3) {
			return {
				errors: [
					{
						field: 'newPassword',
						message: 'password length must be greater than 3',
					},
				],
			};
		}
		const userId = await redis.get(__FORGET_PASSWORD_PREFIX__ + token);
		if (!userId) {
			return {
				errors: [{ field: 'token', message: 'token expired' }],
			};
		}
		const user = await em.findOne(User, { id: +userId });
		if (!user) {
			return {
				errors: [{ field: 'token', message: 'user no longer exists' }],
			};
		}
		user.password = await argon2.hash(newPassword);
		await em.persistAndFlush(user);
		await redis.del(__FORGET_PASSWORD_PREFIX__ + token);
		req.session.userId = user.id;
		return { user };
	}

	@Query(() => User, { nullable: true })
	async me(@Ctx() { em, req }: MyContext) {
		if (!req.session.userId) {
			return null;
		}
		const user = await em.findOne(User, { id: req.session.userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext,
	): Promise<UserResponse> {
		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}
		const hashedPass = await argon2.hash(options.password);
		let user;
		try {
			const results = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username: options.username,
					email: options.email,
					password: hashedPass,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning('*');
			const users = results.map((user) => em.map(User, user));
			user = users[0];
		} catch (error) {
			if (error.code === '23505' || error.message.includes('already exists')) {
				return {
					errors: [
						{
							field: 'username',
							message: 'username already taken',
						},
					],
				};
			}
		}
		req.session.userId = user?.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('usernameOrEmail') usernameOrEmail: string,
		@Arg('password') password: string,
		@Ctx() { em, req }: MyContext,
	): Promise<UserResponse> {
		const user = await em.findOne(
			User,
			usernameOrEmail.includes('@')
				? { email: usernameOrEmail }
				: { username: usernameOrEmail },
		);
		if (!user) {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: 'Username or email does not exist!',
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [
					{
						field: 'password',
						message: 'incorrect password',
					},
				],
			};
		}
		// * store user id session this will set a cookie on the user and keep them logged in
		req.session.userId = user.id;
		return {
			user,
		};
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((err: any) => {
				if (err) {
					console.error(err);
					resolve(false);
					return;
				}
				res.clearCookie(__COOKIE_NAME__);
				resolve(true);
				return;
			}),
		);
	}
}
