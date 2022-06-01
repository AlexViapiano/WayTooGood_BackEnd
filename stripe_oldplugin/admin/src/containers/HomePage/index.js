/*
 *
 * HomePage
 *
 */

import React, { memo, useEffect } from "react";
// import PropTypes from 'prop-types';
import pluginId from "../../pluginId";
const stripe = require("stripe")(process.env.STRIPE_KEY);
import { auth, request } from "strapi-helper-plugin";
// import iconStripe from "../../../../../../../admin/src/assets/images/iconStripe.png";

const HomePage = (strapi) => {
  useEffect(async () => {
    var userInfo = auth.getUserInfo();
    var userId = userInfo.id;

    if (userInfo && userInfo.stripe_acct_id) {
      var response = await fetch(
        window.location.href.split("/admin/plugins/stripe")[0] +
          "/getStripeLink/" +
          userInfo.stripe_acct_id
      );
      var url = await response.text();
      var win = window.open(url);
      win.focus();
    }
  }, []);

  return (
    <div>
      <h1>{pluginId}</h1>
      {/* <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          alignItems: "center",
          marginRight: 10,
          margin: "0px 10px",
        }}
      >
        <img
          src={iconStripe}
          style={{
            borderRadius: 10,
            width: 175,
            boxShadow: `rgb(50 50 93 / 25%) 0px 13px 27px -5px, rgb(0 0 0 / 30%) 0px 8px 16px -8px`,
          }}
          alt="Stripe Logo"
        />
      </div> */}
    </div>
  );
};

export default memo(HomePage);
