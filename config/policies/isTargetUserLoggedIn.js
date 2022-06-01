module.exports = async (ctx, next) => {
  if (ctx.state.user) {
    if (!ctx.request.query.user) {
      return ctx.unauthorized(
        "Specify a target user equal to your own id ?user=${user.id}"
      );
    }
    const targetUser = ctx.request.query.user.toString();
    const loggedInUser = ctx.state.user.id.toString();
    // console.log("targetUser", targetUser);
    // console.log("loggedInUser", loggedInUser);
    if (targetUser === loggedInUser) {
      return await next();
    } else {
      return ctx.unauthorized("Target user is different from logged in user");
    }
  }

  ctx.unauthorized("You arent logged in");
};
