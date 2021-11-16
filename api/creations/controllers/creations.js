"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create creation with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.creations.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.creations.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.creations });
  },
  // Update user creation
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [creations] = await strapi.services.creations.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!creations) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.creations.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.creations.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.creations });
  },
  // Delete a user creation
  async delete(ctx) {
    const { id } = ctx.params;

    const [creations] = await strapi.services.creations.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!creations) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.creations.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.creations });
  },
  // Get logged in users
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { message: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.creations.find({ user: user.id });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.creations });
  },
};
