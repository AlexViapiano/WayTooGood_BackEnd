import React, { memo, useState, useEffect } from "react";
// import PropTypes from 'prop-types';
import pluginId from "../../pluginId";
import { request } from "strapi-helper-plugin";
const moment = require("moment"); //use to format dates
const qs = require("qs"); //use to build queries

const HomePage = () => {
  const [orders, setOrders] = useState([]);
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [productsQty, setProductsQty] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(async () => {
    getOrders("");
  }, []);

  const getOrders = async () => {
    setLoading(true);

    const firstDayOfTheMonth = moment(date)
      .startOf("month")
      .format("YYYY-MM-DD");
    const lastDayOfTheMonth = moment(date).endOf("month").format("YYYY-MM-DD");

    const query =
      "?created_at_gte=" +
      firstDayOfTheMonth +
      "&" +
      "created_at_lte=" +
      lastDayOfTheMonth;

    try {
      const orders = await request(
        strapi.backendURL + `/sales-report/get-orders` + query,
        {
          method: "GET",
        }
      );
      setOrders(orders);
      combineProductsQty(orders);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const combineProductsQty = (orders) => {
    var productsQty = [];
    orders.forEach((order) => {
      order.product_qty.forEach((product_qty) => {
        var foundIndex = productsQty.findIndex((x) => x.id == product_qty.id);
        if (foundIndex == -1) productsQty.push(product_qty);
        else {
          productsQty[foundIndex].qty =
            productsQty[foundIndex].qty + product_qty.qty;
        }
      });
    });
    productsQty.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    setProductsQty(productsQty);
  };

  const handleInputChange = (e) => {
    var date = e.target.value;
    setDate(date);
    getOrders();
  };

  return (
    <div style={{ padding: 20, background: "#FFF", overflow: "scroll" }}>
      <h1>Sales Report</h1>
      <div>Select Month:</div>
      <input
        name="date"
        type="date"
        value={moment(date).format("YYYY-MM-DD")}
        className="form-control"
        onChange={handleInputChange}
        style={{ width: "150px" }}
      />
      {loading ? (
        <h3>Loading...</h3>
      ) : (
        <div style={{ margin: "20px 0px" }}>
          <p>{moment(date).format("MMMM YYYY")}</p>
          <table style={{ fontSize: 12 }}>
            <tr style={{ background: "#8f8f8f", color: "#fff" }}>
              <th style={{ padding: "0px 3px" }}>Qty</th>
              <th style={{ padding: "0px 3px" }}>Name</th>
            </tr>
            {productsQty.map((productQty, i) => {
              const { image, name, qty } = productQty;

              return (
                <tr
                  style={
                    i % 2 == 1
                      ? { background: "#fff" }
                      : { background: "#f7f7f7" }
                  }
                >
                  <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                    {qty}
                  </td>
                  <td style={{ border: "1px solid #EEE", padding: "0px 3px" }}>
                    {name}
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      )}
      Note: This list doesn't include refunds/returns.
    </div>
  );
};

export default memo(HomePage);
