import React, { useMemo } from "react";
import { Padded, Text, Flex } from "@buffetjs/core";
import { get, isEmpty } from "lodash";
import moment from "moment";
import styled from "styled-components";
import { useIntl } from "react-intl";
import {
  InjectionZone,
  useContentManagerEditViewDataManager,
} from "strapi-helper-plugin";
import { SubWrapper, StatusWrapper } from "./components";
import pluginId from "../../pluginId";
import { getTrad } from "../../utils";

import { auth } from "strapi-helper-plugin";
import iconStripe from "../../../../../../../admin/src/assets/images/iconStripe.png";
const stripe = require("stripe")(process.env.STRIPE_KEY);

const BaselineAlignment = styled.div`
  padding-top: ${({ size }) => size};
`;

const InformationCard = () => {
  const { initialData, hasDraftAndPublish, layout } =
    useContentManagerEditViewDataManager();
  const { formatMessage } = useIntl();

  const updatedAtName = useMemo(
    () =>
      get(layout, ["options", "timestamps"], ["created_at", "updated_at"])[1],
    [layout]
  );

  const updatedBy = useMemo(() => {
    const firstname = get(initialData, ["updated_by", "firstname"], "");
    const lastname = get(initialData, ["updated_by", "lastname"], "");

    return `${firstname} ${lastname}`;
  }, [initialData]);

  const trackOrder = async () => {
    const { tracking_number } = initialData;
    var url = "https://parcelsapp.com/en/tracking/" + tracking_number;
    window.open(url, "_blank");
  };

  const printPackingSlip = async (isOrder) => {
    var userInfo = auth.getUserInfo();
    const {
      id,
      currency,
      email,
      first_name,
      last_name,
      createdAt,
      order,
      product_qty,
      shipping_address,
      billing_address,
      subtotal,
      taxes,
      total,
      supplier_address,
    } = initialData;
    const { username } = userInfo;

    console.log(product_qty);

    console.log(
      JSON.stringify({
        product_qty,
      })
    );

    var product_qty_string = JSON.stringify({
      product_qty,
    })
      .replace(/ /g, "_")
      .replace("&", " ");

    console.log(product_qty_string);

    var orderNumber = "";
    var number = "";
    if (isOrder) orderNumber = id;
    else if (order && order.id) {
      orderNumber = order.id;
      number = id;
    }

    var supplierAddress = "";
    if (isOrder) supplierAddress = "6832 Rue Jarry E Saint-Léonard, QC H1P 1W3";
    else if (supplier_address) supplierAddress = supplier_address;

    var url = "http://localhost:3000";
    if (strapi.backendURL == "https://stg-api.waytoogood.com")
      url = "https://stg.waytoogood.com";
    else if (strapi.backendURL == "https://portal.waytoogood.com")
      url = "http://waytoogood.com";

    var url =
      url +
      "/packing-slip?" +
      "number=" +
      number +
      "&email=" +
      email +
      "&currency=" +
      currency +
      "&first_name=" +
      first_name +
      "&last_name=" +
      last_name +
      "&createdAt=" +
      createdAt +
      "&orderNumber=" +
      orderNumber +
      "&shipping_address=" +
      shipping_address +
      "&billing_address=" +
      billing_address +
      "&subtotal=" +
      subtotal +
      "&taxes=" +
      taxes +
      "&total=" +
      total +
      "&supplier_address=" +
      supplierAddress +
      "&product_qty_string=" +
      product_qty_string;

    console.log("url", url);
    var win = window.open(url, "_blank");
    win.focus();
  };

  const notifyCustomer = async () => {
    const { id, email, tracking_number } = initialData;
    if (!tracking_number) {
      alert("Missing tracking number");
      return;
    }
    if (!id || !email) {
      alert("Missing email or id");
      return;
    }
    var response = await fetch(
      strapi.backendURL +
        "/notifyCustomer?orderId=" +
        id +
        "&email=" +
        email +
        "&tracking_number=" +
        tracking_number
    );
    alert("Email sent!");
  };

  const enterStripePortal = async () => {
    if (initialData && initialData.stripe_acct_id) {
      var response = await fetch(
        strapi.backendURL + "/getStripeLink/" + initialData.stripe_acct_id
      );
      var url = await response.text();
      var win = window.open(url, "_blank");
      win.focus();
    }
  };

  return (
    <>
      <SubWrapper>
        <BaselineAlignment size="3px" />
        <Padded top left right bottom size="smd">
          <Text fontWeight="bold">
            {formatMessage({
              id: getTrad("containers.Edit.information"),
            })}
          </Text>
          <Padded top size="smd">
            <BaselineAlignment size="2px" />
            <Flex justifyContent="space-between">
              <Text
                fontSize="xs"
                color="grey"
                textTransform="uppercase"
                fontWeight="semiBold"
              >
                {formatMessage({
                  id: getTrad("containers.Edit.information.lastUpdate"),
                })}
              </Text>
              <Text lineHeight="12px">
                {isEmpty(initialData)
                  ? "-"
                  : moment(initialData[updatedAtName]).fromNow()}
              </Text>
            </Flex>
          </Padded>
          <Padded top size="smd">
            <BaselineAlignment size="3px" />
            <Flex justifyContent="space-between">
              <Text
                fontSize="xs"
                color="grey"
                textTransform="uppercase"
                fontWeight="semiBold"
              >
                {formatMessage({
                  id: getTrad("containers.Edit.information.by"),
                })}
              </Text>
              <Text lineHeight="12px">
                {isEmpty(initialData) ? "-" : updatedBy}
              </Text>
            </Flex>
          </Padded>
        </Padded>
        <InjectionZone area={`${pluginId}.editView.informations`} />
        {window.location.href.includes("purchase-orders") ? (
          <Padded bottom size="smd">
            <BaselineAlignment size="2px" />
            <Flex justifyContent="center">
              <button
                onClick={() => printPackingSlip(false)}
                style={{
                  margin: 5,
                  padding: 5,
                  minWidth: 200,
                  fontWeight: 600,
                  color: "#ffffff",
                  background: "#a0c037",
                  borderRadius: 2,
                  boxShadow: `rgba(0, 0, 0, 0.24) 0px 3px 8px;`,
                }}
              >
                Print Packing Slip
              </button>
            </Flex>
          </Padded>
        ) : window.location.href.includes("orders") ? (
          <div>
            {initialData && initialData.payment_intent_id && (
              <Padded bottom size="smd">
                <BaselineAlignment size="2px" />
                <Flex justifyContent="center">
                  <a
                    href={`https://dashboard.stripe.com/payments/${initialData.payment_intent_id}`}
                    target="_blank"
                    style={{
                      padding: 5,
                      minWidth: 200,
                      fontWeight: 600,
                      color: "#ffffff",
                      background: "#c37aef",
                      borderRadius: 2,
                      boxShadow: `rgba(0, 0, 0, 0.24) 0px 3px 8px;`,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    View Payment
                  </a>
                </Flex>
              </Padded>
            )}
            {initialData && initialData.first_name && (
              <Padded bottom size="smd">
                <BaselineAlignment size="2px" />
                <Flex justifyContent="center">
                  <a
                    href={`https://apps.goshippo.com/orders?q=${initialData.last_name}`}
                    target="_blank"
                    style={{
                      padding: 5,
                      minWidth: 200,
                      fontWeight: 600,
                      color: "#ffffff",
                      background: "#a0c037",
                      borderRadius: 2,
                      boxShadow: `rgba(0, 0, 0, 0.24) 0px 3px 8px;`,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    GoShippo
                  </a>
                </Flex>
              </Padded>
            )}

            <Padded bottom size="smd">
              <BaselineAlignment size="2px" />
              <Flex justifyContent="center">
                <button
                  onClick={() => printPackingSlip(true)}
                  style={{
                    padding: 5,
                    minWidth: 200,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "#7a8def",
                    borderRadius: 2,
                    boxShadow: `rgba(0, 0, 0, 0.24) 0px 3px 8px;`,
                  }}
                >
                  Print Packing Slip
                </button>
              </Flex>
            </Padded>
            {/* <Padded bottom size="smd">
              <BaselineAlignment size="2px" />
              <Flex justifyContent="center">
                <button
                  onClick={() => trackOrder()}
                  style={{
                    padding: 5,
                    minWidth: 200,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "#a0c037",
                    borderRadius: 2,
                      boxShadow: `rgba(0, 0, 0, 0.24) 0px 3px 8px;`,
                  }}
                >
                  Track Order
                </button>
              </Flex>
            </Padded>
            */}
            <Padded bottom size="smd">
              <BaselineAlignment size="2px" />
              <Flex justifyContent="center">
                <button
                  onClick={() => notifyCustomer()}
                  style={{
                    padding: 5,
                    minWidth: 200,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "#ffd329",
                    borderRadius: 2,
                    boxShadow: `rgba(0, 0, 0, 0.24) 0px 3px 8px;`,
                  }}
                >
                  Email Client Tracking
                </button>
              </Flex>
            </Padded>
          </div>
        ) : null}
        {window.location.href.includes("payment") && (
          <Padded bottom size="smd">
            <BaselineAlignment size="2px" />
            <Flex justifyContent="center">
              <button
                onClick={() => enterStripePortal()}
                style={{
                  margin: 5,
                  padding: 5,
                  minWidth: 200,
                  fontWeight: 600,
                  color: "#ffffff",
                  borderRadius: 10,
                }}
              >
                <div
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
                      boxShadow: `rgba(0, 0, 0, 0.24) 0px 3px 8px;`,
                    }}
                    alt="Stripe Logo"
                  />
                </div>
              </button>
            </Flex>
          </Padded>
        )}
      </SubWrapper>
      <Padded top size="sm" />
      {hasDraftAndPublish && (
        <StatusWrapper isGreen={initialData.published_at}>
          <Text fontSize="sm" lineHeight="18px">
            •
          </Text>
          <Padded left size="xs" />
          <Flex>
            <Text lineHeight="18px">
              {formatMessage({
                id: getTrad("containers.Edit.information.editing"),
              })}
            </Text>
            &nbsp;
            <Text lineHeight="18px" fontWeight="bold">
              {formatMessage({
                id: getTrad(
                  initialData.published_at
                    ? "containers.Edit.information.publishedVersion"
                    : "containers.Edit.information.draftVersion"
                ),
              })}
            </Text>
          </Flex>
        </StatusWrapper>
      )}
      <BaselineAlignment size="2px" />
    </>
  );
};

export default InformationCard;
