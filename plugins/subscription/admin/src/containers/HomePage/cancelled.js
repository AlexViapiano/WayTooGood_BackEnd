import React, { memo } from "react";
import moment from "moment";

const CancelledList = (props) => {
  const { cancelled } = props;
  return (
    <div>
      <h3>Recent Cancelled: {cancelled.length}</h3>
      <table style={{ margin: "20px 0px" }}>
        <tr style={{ background: "#8f8f8f", color: "#fff" }}>
          <th style={{ padding: "0px 3px" }}></th>
          <th style={{ padding: "0px 3px" }}>Sub</th>
          <th style={{ padding: "0px 3px" }}>Name</th>
          <th style={{ padding: "0px 3px" }}>Address</th>
          <th style={{ padding: "0px 3px" }}>Qty</th>
          <th style={{ padding: "0px 3px" }}>Diet</th>
          <th style={{ padding: "0px 3px" }}>Email</th>
          <th style={{ padding: "0px 3px" }}>Phone</th>

          <th style={{ padding: "0px 3px" }}>Code</th>
          <th style={{ padding: "0px 3px" }}>Start</th>
          <th style={{ padding: "0px 3px" }}>Cancl</th>
          <th style={{ padding: "0px 3px" }}>End</th>
          <th style={{ padding: "0px 3px" }}>Invce</th>
          <th style={{ padding: "0px 3px" }}>Ret</th>
          <th style={{ padding: "0px 3px" }}>Flag</th>
        </tr>
        {cancelled.map((subscription, i) => {
          const metadata = subscription.metadata;
          const { name, diet, email, phone_number, code, flagged } = metadata;
          return (
            <tr
              style={
                flagged
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
                {name}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {subscription.address}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {subscription.quantity != 1 ? subscription.quantity : ""}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {diet}
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
                {subscription?.canceled_at != null &&
                  moment.unix(subscription?.canceled_at).format("MMM DD")}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {subscription?.cancel_at &&
                  moment.unix(subscription?.cancel_at).format("MMM DD")}
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
                  {subscription.id.slice(-3)}
                </a>
              </td>

              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {moment
                  .unix(subscription?.ended_at)
                  .diff(moment.unix(subscription?.start_date), "months")}
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

export default memo(CancelledList);
