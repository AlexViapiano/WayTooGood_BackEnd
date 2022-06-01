import React, { memo } from "react";

const Parcelz = (props) => {
  const { subscriptions } = props;
  return (
    <div>
      <h3>Parcelz Template</h3>
      <table style={{ margin: "20px 0px", fontSize: 12 }}>
        <tr style={{ background: "#8f8f8f", color: "#fff" }}>
          <th style={{ padding: "0px 3px" }}>Nom de contact</th>
          <th style={{ padding: "0px 3px" }}>Nom de compagnie</th>
          <th style={{ padding: "0px 3px" }}>Address 1</th>
          <th style={{ padding: "0px 3px" }}>Address 2</th>
          <th style={{ padding: "0px 3px" }}>Ville</th>
          <th style={{ padding: "0px 3px" }}>Code Postal</th>
          <th style={{ padding: "0px 3px" }}>Code de Province en majuscule</th>
          <th style={{ padding: "0px 3px" }}>Code du Pays en majuscule</th>
          <th style={{ padding: "0px 3px" }}>Telephone</th>
          <th style={{ padding: "0px 3px" }}>Nombre de colis</th>
          <th style={{ padding: "0px 3px" }}>Poids en LBS</th>
          <th style={{ padding: "0px 3px" }}>Longueur Pouce</th>
          <th style={{ padding: "0px 3px" }}>Largeur Pouce</th>
          <th style={{ padding: "0px 3px" }}>Hauteur Pouces</th>
          <th style={{ padding: "0px 3px" }}>Reference 1</th>
          <th style={{ padding: "0px 3px" }}>Reference 2</th>
          <th style={{ padding: "0px 3px" }}>Email</th>
          <th style={{ padding: "0px 3px" }}>Diet</th>
        </tr>
        {subscriptions.map((subscription, i) => {
          const { id, metadata, quantity, latest_invoice } = subscription;
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
                {name}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {name}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {line1}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {line2}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {city}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {postal_code}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {state}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                CA
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {phone_number}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                1
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                3
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                12
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                12
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                8
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {name}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {id.slice(-5)}
              </td>
              <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                {email}
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

export default memo(Parcelz);
