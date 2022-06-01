import React, { memo } from "react";
import moment from "moment";

const SendGrid = (props) => {
  const { subscriptions } = props;
  return (
    <div>
      <h3>SendGrid Template</h3>
      <table style={{ margin: "20px 0px", fontSize: 12 }}>
        <tr style={{ background: "#8f8f8f", color: "#fff" }}>
          <th style={{ padding: "0px 3px" }}>Email</th>
          <th style={{ padding: "0px 3px" }}>First Name</th>
          <th style={{ padding: "0px 3px" }}>Last Name</th>
          <th style={{ padding: "0px 3px" }}>Start</th>
          <th style={{ padding: "0px 3px" }}>Cancl</th>
          <th style={{ padding: "0px 3px" }}>End</th>
        </tr>
        {subscriptions.map((subscription, i) => {
          const { id, metadata, quantity } = subscription;
          const { name, email } = metadata;
          var firstName = "";
          var lastName = "";
          if (name) {
            firstName = name.split(" ").slice(0, -1).join(" ");
            lastName = name.split(" ").slice(-1).join(" ");
          }
          return (
            <tr
              style={
                subscription?.willDeliver == false
                  ? { background: "#ffe7e7" }
                  : i % 2 == 1
                  ? { background: "#fff" }
                  : { background: "#f7f7f7" }
              }
            >
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {email}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {firstName}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {lastName}
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
                {subscription?.canceled_at &&
                  moment.unix(subscription?.cancel_at).format("MMM DD")}
              </td>
            </tr>
          );
        })}
      </table>
    </div>
  );
};

export default memo(SendGrid);
