"use strict";

const { sanitizeEntity } = require("strapi-utils");
var pjson = require("../../../package.json");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async version(ctx) {
    return pjson.version;
  },
  async search(ctx) {
    let entities;

    if (ctx.query._q) {
      entities = await strapi.services.product.search(ctx.query);
    } else {
      entities = await strapi.services.product.find(ctx.query);
    }

    let products = entities.map((queryProduct) => {
      var media = queryProduct.media[0];
      var thumbnail = "";
      if (
        media &&
        media.formats &&
        media.formats.thumbnail &&
        media.formats.thumbnail.url
      )
        thumbnail = media.formats.thumbnail.url;

      var product = {
        name: queryProduct.name,
        id: queryProduct.id,
        value: queryProduct.id,
        thumbnail: thumbnail,
        url: queryProduct.url,
      };
      return product;
    });

    return {
      products: products,
    };
  },
  async find(ctx) {
    let entities;
    let allEntities;
    if (Array.isArray(ctx.query.diets_in)) {
      var selectedDiets = ctx.query.diets_in;
      allEntities = await strapi.services.product.find();
      entities = allEntities.filter((entity) => {
        var dietsContained = [];
        entity.diets.forEach((diet) => {
          if (selectedDiets.includes(diet.id.toString()))
            dietsContained.push(diet);
        });
        if (dietsContained.length == selectedDiets.length) return true;
      });
    } else if (ctx.query._q) {
      entities = await strapi.services.product.search(ctx.query);
    } else {
      entities = await strapi.services.product.find(ctx.query);
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.product })
    );
  },
  async findOne(ctx) {
    const { url } = ctx.params;
    const entity = await strapi.services.product.findOne({
      url: url,
      _locale: "all",
    });
    return sanitizeEntity(entity, { model: strapi.models.product });
  },
  async findSimilar(ctx) {
    const { productId, country_CA, country_US, _locale } = ctx.query;
    var similarProducts = [];
    const productEntity = await strapi.services.product.findOne({
      id: productId,
    });
    if (productEntity.brand && productEntity.brand.id) {
      const brandEntity = await strapi.services.brand.findOne({
        id: productEntity.brand.id,
      });
      brandEntity.products.forEach((product) => {
        if (similarProducts.length == 8) return;
        if (productEntity.id == product.id) return;
        if (country_CA == "true" && product.country_CA != true) return;
        if (country_US == "true" && product.country_US != true) return;
        similarProducts.push(product);
      });
    }

    if (similarProducts.length < 8 && productEntity.category) {
      var similarCategoryEntities = await strapi.services.product.find({
        category: productEntity.category.id,
      });

      similarCategoryEntities.forEach((product) => {
        if (similarProducts.length == 8) return;
        if (productEntity.id == product.id) return;
        if (country_CA == "true" && product.country_CA != true) return;
        if (country_US == "true" && product.country_US != true) return;
        similarProducts.push(product);
      });
    }

    return similarProducts;
  },
  async wish(ctx) {
    let product;
    product = await strapi.services.product.findOne({
      id: ctx.request.body.id,
    });

    const new_wish_count = product.wish_count + 1;

    let entity;
    entity = await strapi.services.product.update(
      { id: product.id },
      { wish_count: new_wish_count }
    );

    return sanitizeEntity(entity, { model: strapi.models.product });
  },
};
