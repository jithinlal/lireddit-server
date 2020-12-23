import { Field, Int, ObjectType } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Updoot } from './Updoot';
import { User } from './User';

// * whatever comes from type-graphql just integrates into graphql here
// * so basically we are using a single type definition for both mikro-orm and graphql
// * making our job easy
// * we can make use of the same type for both graphql and db
@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	title!: string;

	@Field()
	@Column()
	text!: string;

	@Field()
	@Column({ type: 'int', default: 0 })
	points!: number;

	@Field(() => Int, { nullable: true })
	voteStatus: number | null;

	@Field()
	@Column()
	creatorId: number;

	@Field()
	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	@OneToMany(() => Updoot, (updoot) => updoot.post)
	updoots: Updoot[];

	// * it's necessary to give schema type in the field
	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
