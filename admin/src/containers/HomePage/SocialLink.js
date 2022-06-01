/**
 *
 * SocialLink
 */

import React, { memo } from "react";
import PropTypes from "prop-types";

import Facebook from "../../assets/images/social_facebook.png";
import Instagram from "../../assets/images/social_instagram.png";
import Pinterest from "../../assets/images/social_pinterest.png";
import Twitter from "../../assets/images/social_twitter.png";
import Linkedin from "../../assets/images/social_linkedin.png";

import { SocialLinkWrapper } from "./components";

function getSrc(name) {
  switch (name) {
    case "Facebook":
      return Facebook;
    case "Instagram":
      return Instagram;
    case "Pinterest":
      return Pinterest;
    case "Linkedin":
      return Linkedin;
    case "Twitter":
      return Twitter;
    default:
      return Facebook;
  }
}

const SocialLink = ({ link, name }) => {
  return (
    <SocialLinkWrapper className="col-6">
      <a href={link} target="_blank" rel="noopener noreferrer">
        <img src={getSrc(name)} alt={name} />
        <span>{name}</span>
      </a>
    </SocialLinkWrapper>
  );
};

SocialLink.propTypes = {
  link: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default memo(SocialLink);
