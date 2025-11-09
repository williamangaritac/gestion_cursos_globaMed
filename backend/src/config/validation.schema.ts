// import * as Joi from 'joi';

// Validation schema disabled - joi package not installed
// To enable, run: npm install joi
export const validationSchema = undefined;

// export const validationSchema = Joi.object({
//   // Application
//   NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
//   PORT: Joi.number().default(3001),
//   API_PREFIX: Joi.string().default('api'),

//   // Database
//   DB_HOST: Joi.string().required(),
//   DB_PORT: Joi.number().default(5432),
//   DB_USERNAME: Joi.string().required(),
//   DB_PASSWORD: Joi.string().required(),
//   DB_DATABASE: Joi.string().required(),
//   DB_SYNCHRONIZE: Joi.boolean().default(false),
//   DB_LOGGING: Joi.boolean().default(false),

//   // JWT
//   JWT_ACCESS_SECRET: Joi.string().min(32).required(),
//   JWT_REFRESH_SECRET: Joi.string().min(32).required(),
//   JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
//   JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

//   // CORS
//   CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
//   CORS_CREDENTIALS: Joi.boolean().default(true),

//   // Redis (optional)
//   REDIS_HOST: Joi.string().optional(),
//   REDIS_PORT: Joi.number().optional(),
// });

