import React, { memo, useState, useEffect } from "react";
import { request } from "strapi-helper-plugin";
import moment from "moment";
import SubscriptionsList from "./subscriptions";
import CancelledList from "./cancelled";
import Shippo from "./shippo";
import Parcelz from "./parcelz";
import SendGrid from "./sendgrid";

const HomePage = (strapi) => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [template, setTemplate] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [hasMoreCanclled, setHasMoreCanclled] = useState(false);

  useEffect(async () => {
    getSubscriptions("");
  }, []);

  const getSubscriptions = async (starting_after) => {
    setLoading(true);
    try {
      var url = `/subscription/get-subscriptions`;
      if (starting_after)
        url = `/subscription/get-subscriptions/` + starting_after;

      const subs = await request(url, {
        method: "GET",
      });

      setHasMore(subs.has_more);
      if (subs.data) {
        const active = subs.data.map((sub) => {
          var metadata = sub.metadata;
          var { line1, line2, city, country, state, postal_code } = metadata;
          if (line2 == null) line2 = "";
          else line2 = ", " + line2;
          var addressString = "";
          if (line1 && city && country && state && postal_code) {
            addressString =
              line1 +
              line2 +
              ", " +
              city +
              ", " +
              // country +
              // ", " +
              state +
              ", " +
              postal_code;
          }

          sub.address = addressString;

          var notCancelled = !sub?.canceled_at;

          var cancelAt = moment.unix(sub?.cancel_at);
          var endOfMonth = moment().endOf("month");
          var activeThisMonth = !moment(cancelAt).isSameOrBefore(endOfMonth);

          var willDeliver = false;
          if (notCancelled || activeThisMonth) willDeliver = true;
          sub.willDeliver = willDeliver;

          return sub;
        });

        setSubscriptions([...subscriptions, ...active]);

        if (subs.has_more) loadMoreSubscriptions;

        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getCancelled = async (starting_after) => {
    setLoading(true);
    try {
      var url = `/subscription/get-cancelled`;
      if (starting_after) url = `/subscription/get-cancelled/` + starting_after;

      const subs = await request(url, {
        method: "GET",
      });

      console.log(subs);

      setHasMoreCanclled(subs.has_more);
      if (subs.data) {
        const cancelledSubs = subs.data.filter((sub) => {
          var lastMonth = moment()
            .startOf("month")
            .subtract(1, "month")
            .format("YYYY-MM-DD");

          var cancelledAt = moment.unix(sub?.canceled_at).format("YYYY-MM-DD");

          var isBefore = moment(cancelledAt).isSameOrBefore(lastMonth);

          if (!isBefore) {
            var metadata = sub.metadata;
            var { line1, line2, city, country, state, postal_code } = metadata;
            if (line2 == null) line2 = "";
            else line2 = ", " + line2;
            var addressString = "";
            if (line1 && line2 && city && country && state && postal_code) {
              addressString =
                line1 +
                line2 +
                ", " +
                city +
                ", " +
                // country +
                // ", " +
                state +
                ", " +
                postal_code;
            }

            sub.address = addressString;
            return sub;
          }
        });

        setCancelled([...cancelled, ...cancelledSubs]);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadMoreSubscriptions = async () => {
    const lastSubscription = subscriptions.at(-1);
    getSubscriptions(lastSubscription.id);
  };

  const loadMoreCancelled = async () => {
    const lastCancelled = cancelled.at(-1);
    getSubscriptions(lastCancelled.id);
  };

  const displayCancelled = async () => {
    setShowCancelled(!showCancelled);
    if (cancelled.length == 0) await getCancelled();
  };

  return (
    <div style={{ padding: 20, background: "#FFF", overflow: "scroll" }}>
      {showCancelled ? (
        <div>
          <button
            onClick={() => displayCancelled()}
            style={
              showCancelled
                ? {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                    background: "#a0c037",
                    color: "#fff",
                  }
                : {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                  }
            }
          >
            Cancelled
          </button>
          <br />
          <button
            onClick={() => loadMoreCancelled()}
            style={
              hasMoreCanclled
                ? {
                    background: "#EEE",
                    marginTop: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                    background: "#a0c037",
                    color: "#fff",
                  }
                : {
                    display: "none",
                  }
            }
            disabled={!hasMoreCanclled}
          >
            Load More
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => displayCancelled()}
            style={
              showCancelled
                ? {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                    background: "#a0c037",
                    color: "#fff",
                  }
                : {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                  }
            }
          >
            Cancelled
          </button>
          <button
            onClick={() => setTemplate(null)}
            style={
              template == null
                ? {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                    background: "#a0c037",
                    color: "#fff",
                  }
                : {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                  }
            }
          >
            Default
          </button>
          <button
            onClick={() => setTemplate("shippo")}
            style={
              template == "shippo"
                ? {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                    background: "#a0c037",
                    color: "#fff",
                  }
                : {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                  }
            }
          >
            GoShippo
          </button>
          <button
            onClick={() => setTemplate("parcelz")}
            style={
              template == "parcelz"
                ? {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                    background: "#a0c037",
                    color: "#fff",
                  }
                : {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                  }
            }
          >
            Parcelz
          </button>
          <button
            onClick={() => setTemplate("sendgrid")}
            style={
              template == "sendgrid"
                ? {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                    background: "#a0c037",
                    color: "#fff",
                  }
                : {
                    background: "#EEE",
                    marginRight: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                  }
            }
          >
            SendGrid
          </button>
          <br />
          <button
            onClick={() => loadMoreSubscriptions()}
            style={
              hasMore
                ? {
                    background: "#EEE",
                    marginTop: 10,
                    width: 100,
                    height: 30,
                    borderRadius: 20,
                    background: "#a0c037",
                    color: "#fff",
                  }
                : {
                    display: "none",
                  }
            }
            disabled={!hasMore}
          >
            Load More
          </button>
        </div>
      )}

      <br />

      {loading ? (
        <h3>Loading...</h3>
      ) : showCancelled ? (
        <CancelledList cancelled={cancelled} />
      ) : (
        <div>
          {!template ? (
            <SubscriptionsList
              subscriptions={subscriptions}
              hasMore={hasMore}
            />
          ) : template == "shippo" ? (
            <Shippo subscriptions={subscriptions} />
          ) : template == "parcelz" ? (
            <Parcelz subscriptions={subscriptions} />
          ) : template == "sendgrid" ? (
            <SendGrid subscriptions={subscriptions} />
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(HomePage);
