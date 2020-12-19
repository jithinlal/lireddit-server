import { FieldError } from './FieldError';
import { UsernamePasswordInput } from './UsernamePasswordInput';

export const validateRegister = (
	options: UsernamePasswordInput,
): [FieldError] | null => {
	if (!options.email.includes('@')) {
		return [
			{
				field: 'email',
				message: 'email is not a valid one',
			},
		];
	}
	if (options.username.length <= 2) {
		return [
			{
				field: 'username',
				message: 'username length must be greater than 2',
			},
		];
	}
	if (options.username.includes('@')) {
		return [
			{
				field: 'username',
				message: 'username should not contain @ symbol',
			},
		];
	}
	if (options.password.length <= 3) {
		return [
			{
				field: 'password',
				message: 'password length must be greater than 3',
			},
		];
	}

	return null;
};
