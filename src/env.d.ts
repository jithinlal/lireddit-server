declare namespace NodeJS {
	export interface ProcessEnv {
		NODE_ENV: string;
		PORT: string;
		REDIS_SECRET: string;
		COOKIE_NAME: string;
		FORGET_PASSWORD_PREFIX: string;
	}
}
