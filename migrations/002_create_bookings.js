export async function up(pgm) {
  // Create the bookings table
  pgm.createTable("bookings", {
    id: "id",
    booking_id: { type: "uuid", notNull: true, unique: true },
    show_id: {
      type: "integer",
      notNull: true,
      references: '"shows"(id)',
      onDelete: "cascade",
    },
    user_id: { type: "varchar(255)", notNull: true },
    seats_requested: {
      type: "integer",
      notNull: true,
      check: "seats_requested > 0",
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "PENDING",
      check: "status IN ('PENDING', 'CONFIRMED', 'FAILED')",
    },
    expires_at: { type: "timestamp", notNull: true },
    created_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
  });

  // Add indexes
  pgm.addIndex("bookings", "show_id");
  pgm.addIndex("bookings", "status");
  pgm.addIndex("bookings", "expires_at");
  pgm.addIndex("bookings", "user_id");

  // Trigger to auto-update updated_at
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_booking_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = CURRENT_TIMESTAMP;
       RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_booking_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_updated_at_column();
  `);
}

export async function down(pgm) {
  pgm.dropTable("bookings");
  pgm.sql(`DROP FUNCTION IF EXISTS update_booking_updated_at_column CASCADE;`);
}
