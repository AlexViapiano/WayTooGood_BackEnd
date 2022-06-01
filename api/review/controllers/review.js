"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;

    const { user } = ctx.state; //Logged in user
    const { rating, comment, product } = ctx.request.body; //Review

    const realProduct = await strapi.services.product.findOne({
      id: product,
    });

    if (!realProduct) {
      ctx.throw(400, "This product doens't exist.");
    }

    const found = await strapi.services.review.findOne({
      user: user.id,
      product: product,
    });

    if (found) {
      ctx.throw(400, "You already rated this product.");
    }

    if (typeof rating !== "number" && rating) {
      ctx.throw(400, "Please only use numbers 1-5 for ratings");
    }

    var review = {
      user: user.id,
      name: user.username,
      product: product,
      rating: rating,
      comment: comment,
      published_at: null,
    };

    if (ctx.is("multipart")) {
      ctx.throw(400, "Only make JSON requests.");
    } else {
      entity = await strapi.services.review.create(review);
    }

    var ratingTotal = realProduct.rating_count * realProduct.rating;
    var ratingPerfectTotal = realProduct.rating_count * 5;
    var newRatingNumerator = ratingTotal + rating;
    var newRatingDenominator = ratingPerfectTotal + 5;
    var newRating = (newRatingNumerator / newRatingDenominator) * 5;

    if (entity) {
      const updatedProduct = await strapi.services.product.update(
        {
          id: product,
        },
        {
          rating_count: realProduct.rating_count + 1,
          rating: newRating,
        }
      );
    }

    return sanitizeEntity(entity, { model: strapi.models.review });
  },

  async delete(ctx) {
    const { user } = ctx.state;
    const reviewId = ctx.params.id;

    const review = parseInt(reviewId);
    if (typeof review !== "number") {
      ctx.throw(400, "Please only use the id of the post");
    }

    const foundReview = await strapi.services.review.findOne({
      user: user.id,
      id: reviewId,
    });

    const entity = await strapi.services.review.delete({
      id: reviewId,
      user: user.id,
    });

    //entity.length is true when review is deleted
    if (entity.length) {
      var ratingTotal =
        foundReview.product.rating_count * foundReview.product.rating;
      var ratingPerfectTotal = foundReview.product.rating_count * 5;
      var newRatingNumerator = ratingTotal - foundReview.rating;
      var newRatingDenominator = ratingPerfectTotal - 5;
      var newRating = (newRatingNumerator / newRatingDenominator) * 5;

      const updatedProduct = await strapi.services.product.update(
        {
          id: foundReview.product.id,
        },
        {
          rating_count: foundReview.product.rating_count - 1,
          rating: newRating,
        }
      );
    }
  },
};
