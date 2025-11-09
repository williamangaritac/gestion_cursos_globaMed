import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface CurrentUserData {
  id: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, context: ExecutionContext): CurrentUserData | any => {
    let request;

    // Check if it's a GraphQL request
    if (context.getType<string>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      // HTTP request
      request = context.switchToHttp().getRequest();
    }

    const user = request.user;

    return data ? user?.[data] : user;
  },
);

