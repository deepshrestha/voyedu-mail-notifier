const sql = require("./Db.js");

const Customer = function (customer) {
    this.booking_id = customer.booking_id;
}

Customer.findByBookingId = (customer, result) => {
    const query = { 
        name: 'get-customeremail-by-bookingid',
        text: `SELECT u.email FROM bookings_new b
                JOIN customer c ON b.customer_id = c.id
                JOIN users u ON c.user_id = u.id
            WHERE b.id = $1`,
        values: [customer.booking_id]
    };
    
    sql.query(query, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.rows.length > 0) {
            if (res.rows[0]['email']) {
                result(null, res.rows[0]['email']);
            } else {
                result({kind: "not_found"}, null);
            }
        } else {
            result({kind: "not_found"}, null);
        }
    });
}

module.exports = Customer;