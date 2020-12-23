import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

// * whatever comes from type-graphql just integrates into graphql here
// * so basically we are using a single type definition for both mikro-orm and graphql
// * making our job easy
// * we can make use of the same type for both graphql and db
@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
	@Field()
	@Column({ type: 'int' })
	value: number;

	@Field()
	@PrimaryColumn()
	userId: number;

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	@Field()
	@PrimaryColumn()
	postId: number;

	@Field(() => Post)
	@ManyToOne(() => Post, (post) => post.updoots, { onDelete: 'CASCADE' })
	post: Post;
}
