import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

// * whatever comes from type-graphql just integrates into graphql here
// * so basically we are using a single type definition for both mikro-orm and graphql
// * making our job easy
// * we can make use of the same type for both graphql and db
@ObjectType()
@Entity()
export class Post {
	@Field()
	@PrimaryKey()
	id!: number;

	// * it's necessary to give schema type in the field
	@Field(() => String)
	@Property({ type: 'date' })
	createdAt = new Date();

	@Field(() => String)
	@Property({ type: 'date', onUpdate: () => new Date() })
	updatedAt = new Date();

	@Field()
	@Property({ type: 'text' })
	title!: string;
}
