"use strict";

module.exports = async () => {
  // do your boostrap

  await strapi.admin.services.permission.conditionProvider.registerMany([
    {
      displayName: "Is supplier",
      name: "is-supplier",
      async handler(user) {
        return { supplier_id: user.id };
      },
    },
  ]);
};
