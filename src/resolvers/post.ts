import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from '../types';
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { em }: MyContext): Promise<Post[]> {
		return em.find(Post, {});
	}

	@Query(() => Post, { nullable: true })
	post(@Arg('id') id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
		return em.findOne(Post, { id });
	}

	@Mutation(() => Post)
	async create(
		// @Arg('title', () => String) title: string,
		@Arg('title') title: string,
		@Ctx() { em }: MyContext,
	): Promise<Post> {
		const post = em.create(Post, { title });
		await em.persistAndFlush(post);
		return post;
	}

	// * nullable true will make sure that the output is like optional
	@Mutation(() => Post, { nullable: true })
	async update(
		@Arg('id') id: number,
		@Arg('title', () => String, { nullable: true }) title: string,
		@Ctx() { em }: MyContext,
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id });
		if (!post) {
			return null;
		}
		if (typeof title !== 'undefined') {
			post.title = title;
			await em.persistAndFlush(post);
		}
		return post;
	}

	@Mutation(() => Boolean)
	async delete(
		@Arg('id') id: number,
		@Ctx() { em }: MyContext,
	): Promise<boolean> {
		try {
			await em.nativeDelete(Post, { id });
			return true;
		} catch (error) {
			return false;
		}
	}
}
