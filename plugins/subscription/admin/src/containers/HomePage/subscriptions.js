import React, { memo } from "react";
import moment from "moment";

const SubscriptionsList = (props) => {
  const { subscriptions, hasMore } = props;
  console.log(subscriptions);

  var totalCancelledAtPeriodEnd = 0;
  var totalRetained = 0;
  var totalFreeRetained = 0;
  var totalSubsThisMonth = 0;
  var totalFreeSubsThisMonth = 0;
  var totalCancelledSubsThisMonth = 0;
  var totalFreeCancelledSubsThisMonth = 0;
  var totalBoxesToShipNextMonth = 0;
  var notShippingSubscriptions = [];
  var totalVegan = 0;
  var totalGlutenFree = 0;

  if (!hasMore) {
    totalVegan = subscriptions.filter(
      (sub) => sub.metadata.diet == "Vegan"
    ).length;
    totalGlutenFree = subscriptions.filter(
      (sub) => sub.metadata.diet == "Gluten-Free"
    ).length;

    totalCancelledAtPeriodEnd = subscriptions.filter(
      (subscription) => subscription?.canceled_at
    ).length;

    const retained = subscriptions.filter(
      (sub) =>
        moment().diff(moment.unix(sub?.start_date), "months") > 0 &&
        !sub?.canceled_at
    );

    const freeRetained = retained.filter(
      (sub) => sub?.metadata?.code == "free"
    );

    const subsThisMonth = subscriptions.filter(
      (sub) =>
        moment.unix(sub?.start_date).format("MM YY") == moment().format("MM YY")
    );

    const freeSubsThisMonth = subsThisMonth.filter(
      (sub) => sub?.metadata?.code == "free"
    );
    const cancelledSubsThisMonth = subsThisMonth.filter(
      (sub) => sub?.canceled_at
    );
    const freeCancelledSubsThisMonth = freeSubsThisMonth.filter(
      (sub) => sub?.canceled_at
    );

    totalRetained = retained.length;
    totalFreeRetained = freeRetained.length;
    totalSubsThisMonth = subsThisMonth.length;
    totalFreeSubsThisMonth = freeSubsThisMonth.length;
    totalCancelledSubsThisMonth = cancelledSubsThisMonth.length;
    totalFreeCancelledSubsThisMonth = freeCancelledSubsThisMonth.length;
    // totalBoxesToShipNextMonth =
    //   subscriptions.length -
    //   totalCancelledAtPeriodEnd +
    //   totalCancelledSubsThisMonth;

    subscriptions.forEach((sub) => {
      var notCancelled = !sub?.canceled_at;
      var lastBox =
        sub?.canceled_at &&
        moment.unix(sub?.start_date).format("MM YY") ==
          moment().format("MM YY");

      var cancelAt = moment.unix(sub?.cancel_at);
      var endOfMonth = moment().endOf("month");
      var willDeliver = !moment(cancelAt).isSameOrBefore(endOfMonth);

      if (notCancelled || willDeliver)
        totalBoxesToShipNextMonth = totalBoxesToShipNextMonth + sub.quantity;
      else notShippingSubscriptions.push(sub);
    });

    if (notShippingSubscriptions.length > 0)
      console.log("Not Shipping", notShippingSubscriptions);
  }

  return (
    <div>
      {!hasMore && (
        <div>
          <h2>
            Boxes To Ship{" "}
            {moment().add(1, "M").startOf("month").format("MMM Do")}:{" "}
            {totalBoxesToShipNextMonth}
          </h2>
          <h4>
            Subscriptions: {subscriptions.length} &nbsp; (Cancel:{" "}
            {totalCancelledAtPeriodEnd})
          </h4>
          <h4>
            Retianed: {totalRetained} &nbsp; (Free: {totalFreeRetained})
          </h4>

          <br />

          <h4>Vegan: {totalVegan}</h4>
          <h4>Gluten-Free: {totalGlutenFree}</h4>

          <br />

          <h2>
            {moment().format("MMMM")} Subscribers: {totalSubsThisMonth}
          </h2>
          <h4>
            Paid: {totalSubsThisMonth - totalFreeSubsThisMonth} &nbsp; (Cancel:{" "}
            {totalCancelledSubsThisMonth - totalFreeCancelledSubsThisMonth})
          </h4>
          <h4>
            Free: {totalFreeSubsThisMonth} &nbsp; (Cancel:{" "}
            {totalFreeCancelledSubsThisMonth})
          </h4>
        </div>
      )}

      <table
        style={{
          margin: "20px 0px",
          boxShadow: "rgb(0 0 0 / 16%) 0px 1px 4px",
        }}
      >
        <tr style={{ background: "#8f8f8f", color: "#fff" }}>
          <th style={{ padding: "0px 3px" }}></th>
          <th style={{ padding: "0px 3px" }}>Sub</th>
          <th style={{ padding: "0px 3px" }}>Name (GoShippo)</th>
          <th style={{ padding: "0px 3px" }}>Address</th>
          <th style={{ padding: "0px 3px" }}>Qty</th>
          <th style={{ padding: "0px 3px" }}>Diet</th>
          <th style={{ padding: "0px 3px" }}>Email</th>
          <th style={{ padding: "0px 3px" }}>Phone</th>
          <th style={{ padding: "0px 3px" }}>Code</th>
          <th style={{ padding: "0px 3px" }}>Start</th>
          <th style={{ padding: "0px 3px" }}>Cancl</th>
          <th style={{ padding: "0px 3px" }}>End</th>
          {/* <th style={{ padding: "0px 3px" }}>Invce</th> */}
          <th style={{ padding: "0px 3px" }}>Ret</th>
          <th style={{ padding: "0px 3px" }}>Gift To</th>
          <th style={{ padding: "0px 3px" }}>Flag</th>
        </tr>

        {subscriptions.map((subscription, i) => {
          const metadata = subscription.metadata;
          const { name, diet, email, phone_number, gift_to, code, flagged } =
            metadata;

          return (
            <tr
              style={
                subscription?.willDeliver == false
                  ? { background: "#ffe7e7" }
                  : flagged
                  ? { background: "#fff2d9" }
                  : i % 2 == 1
                  ? { background: "#fff" }
                  : { background: "#f7f7f7" }
              }
            >
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {i}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                <a
                  href={
                    "https://dashboard.stripe.com/subscriptions/" +
                    subscription.id
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {subscription.id.slice(-5)}
                </a>
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                <a
                  href={`https://apps.goshippo.com/orders?q=${name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {name}
                </a>
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {subscription.address}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {subscription.quantity != 1 ? subscription.quantity : ""}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {diet == "Gluten-Free" ? "GF" : diet == "Vegan" ? "V" : diet}
              </td>

              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {email}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {phone_number}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {code}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {moment
                  .unix(subscription?.current_period_start)
                  .format("MMM DD")}
              </td>

              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {subscription?.canceled_at &&
                  moment.unix(subscription?.canceled_at).format("MMM DD")}
              </td>

              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {subscription?.cancel_at &&
                  moment.unix(subscription?.cancel_at).format("MMM DD")}
              </td>

              {/* <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                <a
                  href={
                    "https://dashboard.stripe.com/invoices/" +
                    subscription.latest_invoice
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {subscription.latest_invoice.slice(-3)}
                </a>
              </td> */}

              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {moment().diff(moment.unix(subscription?.start_date), "months")}
              </td>

              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {gift_to}
              </td>

              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {flagged && "x"}
              </td>
            </tr>
          );
        })}
      </table>
    </div>
  );
};

export default memo(SubscriptionsList);
