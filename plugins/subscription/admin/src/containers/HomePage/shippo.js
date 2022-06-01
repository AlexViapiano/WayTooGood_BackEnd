import React, { memo } from "react";

const Shippo = (props) => {
  const { subscriptions } = props;
  return (
    <div>
      <h3>GoShippo Template</h3>
      <table style={{ margin: "20px 0px", fontSize: 12 }}>
        <tr style={{ background: "#8f8f8f", color: "#fff" }}>
          <th style={{ padding: "0px 3px" }}>Order Number</th>
          <th style={{ padding: "0px 3px" }}>Order Date</th>
          <th style={{ padding: "0px 3px" }}>Recipient Name</th>
          <th style={{ padding: "0px 3px" }}>Company</th>
          <th style={{ padding: "0px 3px" }}>Email</th>
          <th style={{ padding: "0px 3px" }}>Phone</th>
          <th style={{ padding: "0px 3px" }}>Street Line 1</th>
          <th style={{ padding: "0px 3px" }}>Street Number</th>
          <th style={{ padding: "0px 3px" }}>Street Line 2</th>
          <th style={{ padding: "0px 3px" }}>City</th>
          <th style={{ padding: "0px 3px" }}>State/Province</th>
          <th style={{ padding: "0px 3px" }}>Zip/Postal Code</th>
          <th style={{ padding: "0px 3px" }}>Country</th>
          <th style={{ padding: "0px 3px" }}>Item Title</th>
          <th style={{ padding: "0px 3px" }}>SKU</th>
          <th style={{ padding: "0px 3px" }}>Quantity</th>
          <th style={{ padding: "0px 3px" }}>Item Weight</th>
          <th style={{ padding: "0px 3px" }}>Item Weight Unit</th>
          <th style={{ padding: "0px 3px" }}>Item Price</th>
          <th style={{ padding: "0px 3px" }}>Item Currency</th>
          <th style={{ padding: "0px 3px" }}>Order Weight</th>
          <th style={{ padding: "0px 3px" }}>Order Weight Unit</th>
          <th style={{ padding: "0px 3px" }}>Order Amount</th>
          <th style={{ padding: "0px 3px" }}>Order Currency</th>
          <th style={{ padding: "0px 3px" }}>Diet</th>
        </tr>
        {subscriptions.map((subscription, i) => {
          const { id, metadata, quantity } = subscription;
          const {
            name,
            email,
            phone_number,
            line1,
            line2,
            city,
            country,
            state,
            postal_code,
            diet,
          } = metadata;
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
                {id.slice(-5)}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                01-11-2021
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {name}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}></td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {email}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {phone_number}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {line1}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}></td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {line2}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {city}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {state}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {postal_code}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                Canada
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                WBox
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                WBox
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {quantity}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                3kg
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                3kg
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                29.99
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                CAD
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                3 kg
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                3kg
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {29.99 * quantity}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                CAD
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {diet == "Gluten-Free" ? "GF" : diet == "Vegan" ? "V" : diet}
              </td>
            </tr>
          );
        })}
      </table>
    </div>
  );
};

export default memo(Shippo);
