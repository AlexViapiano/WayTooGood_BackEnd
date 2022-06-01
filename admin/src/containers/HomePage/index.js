/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { get, upperFirst } from "lodash";
import { auth, LoadingIndicatorPage } from "strapi-helper-plugin";
import PageTitle from "../../components/PageTitle";
import { useModels } from "../../hooks";
import Logo from "../../assets/images/WayTooGood-Logo-greenblack-web.png";
import supplier from "../../assets/images/supplier.png";
import wbox from "../../assets/images/wbox.png";

import useFetch from "./hooks";
import {
  ALink,
  Block,
  Container,
  LinkWrapper,
  P,
  Wave,
  Separator,
} from "./components";
import BlogPost from "./BlogPost";
import SocialLink from "./SocialLink";

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    link: "https://www.facebook.com/Waytoogoodcom-104295958140575",
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/waytoogoodofficial/",
  },
  {
    name: "Twitter",
    link: "https://twitter.com/Waytoogoodinc",
  },
  {
    name: "Pinterest",
    link: "https://www.pinterest.com/waytoogoodofficial",
  },
  {
    name: "Linkedin",
    link: "https://www.linkedin.com/company/way-too-good-inc/",
  },
];

const HomePage = ({ global: { plugins }, history: { push } }) => {
  const { error, isLoading } = useFetch(); //posts
  // Temporary until we develop the menu API
  const {
    collectionTypes,
    singleTypes,
    isLoading: isLoadingForModels,
  } = useModels();

  const handleClick = (e) => {
    e.preventDefault();

    push(
      "/plugins/content-type-builder/content-types/plugins::users-permissions.user?modalType=contentType&kind=collectionType&actionType=create&settingType=base&forTarget=contentType&headerId=content-type-builder.modalForm.contentType.header-create&header_icon_isCustom_1=false&header_icon_name_1=contentType&header_label_1=null"
    );
  };

  const hasAlreadyCreatedContentTypes = useMemo(() => {
    const filterContentTypes = (contentTypes) =>
      contentTypes.filter((c) => c.isDisplayed);

    return (
      filterContentTypes(collectionTypes).length > 1 ||
      filterContentTypes(singleTypes).length > 0
    );
  }, [collectionTypes, singleTypes]);

  if (isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  const headerId = hasAlreadyCreatedContentTypes
    ? "HomePage.greetings"
    : "app.components.HomePage.welcome";
  const username = get(auth.getUserInfo(), "username", "");
  const linkProps = hasAlreadyCreatedContentTypes
    ? {
        id: "app.components.HomePage.button.blog",
        href: "https://strapi.io/blog/",
        onClick: () => {},
        type: "blog",
        target: "_blank",
      }
    : {
        id: "app.components.HomePage.create",
        href: "",
        onClick: handleClick,
        type: "documentation",
      };

  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {(title) => <PageTitle title={"Way Too Good"} />}
      </FormattedMessage>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <Block style={{ minWidth: 400 }}>
              {/* <Wave />
              <FormattedMessage
                id={headerId}
                values={{
                  name: upperFirst(username),
                }}
              >
                {(msg) => <h2 id="mainHeader">{msg}</h2>}
              </FormattedMessage> */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  center: "center",
                }}
              >
                <img
                  style={{ width: "100%", maxWidth: 200 }}
                  src={Logo}
                  alt="Way Too Good Logo"
                />
              </div>
              <div style={{ marginTop: 37, marginBottom: 36 }} />

              <div
                style={{
                  maxWidth: "700px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <FormattedMessage id="HomePage.greetings.subtext"></FormattedMessage>
              </div>

              <div style={{ marginTop: 37, marginBottom: 36 }} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  center: "center",
                }}
              >
                <img
                  style={{ width: "100%", maxWidth: 300 }}
                  src={supplier}
                  alt="Way Too Good Logo"
                />
              </div>
            </Block>
          </div>

          <div className="col-md-12 col-lg-4">
            <Block
              style={{ paddingRight: 30, paddingBottom: 0, minWidth: 400 }}
            >
              <FormattedMessage id="HomePage.community">
                {(msg) => <h2>{msg}</h2>}
              </FormattedMessage>
              <FormattedMessage id="app.components.HomePage.community.content">
                {(content) => (
                  <P style={{ marginTop: 7, marginBottom: 0 }}>{content}</P>
                )}
              </FormattedMessage>

              <Separator style={{ marginTop: 18 }} />
              <div
                className="row social-wrapper"
                style={{
                  display: "flex",
                  margin: 0,
                  marginTop: 36,
                  marginLeft: -15,
                }}
              >
                {SOCIAL_LINKS.map((value, key) => (
                  <SocialLink key={key} {...value} />
                ))}
              </div>
              <div
                className="row social-wrapper"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img src={wbox} alt="wbox" />
              </div>
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
