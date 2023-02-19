const sql = require("./Db.js");

const Booking = function (booking) {
    this.booking_id = booking.booking_id;
}

Booking.getAppointmentDetails = (booking, result) => {
    const query = { 
        name: 'get-appointment-details',
        /* text: `SELECT ba.appointment_date, ba.appointment_time, u.email FROM booking_appointments ba
            JOIN bookings_new b ON b.id = ba.booking_id
            JOIN customer c ON c.id = b.customer_id
            JOIN users u ON u.id = c.user_id
            WHERE ba.booking_id = $1
            LIMIT 1
        `, */
        text: `SELECT 
                    TO_CHAR(appointment_date, 'YYYY-MM-DD') AS date, 
                    TO_CHAR(appointment_time, 'hh12:mi AM') AS time 
                FROM booking_appointments 
                WHERE booking_id = $1`,
        values: [parseInt(booking.booking_id)]
    };

    sql.query(query, (err, res) => {
        if (err) {
            console.log("ERROR......" , err)
            result(err, null);
            return;
        }
        if (res.rows.length > 0) {
            result(null, res.rows[0]);
        } else {
            result({kind: "not_found"}, null);
        }
    })
}

module.exports = Booking;