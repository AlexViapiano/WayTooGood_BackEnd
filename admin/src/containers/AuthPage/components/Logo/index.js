import React from "react";
import LogoWTG from "../../../../assets/images/WayTooGood-Logo-greenblack-web.png";
import Img from "./Img";

const Logo = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Img src={LogoWTG} alt="way-too-good-logo" />
      <span style={{ fontWeight: 800, paddingLeft: 10, color: "#546e7a" }}>
        {window.location.href ==
          "https://stg-api.waytoogood.com/admin/auth/login" && "STG"}
      </span>
    </div>
  );
};

export default Logo;
