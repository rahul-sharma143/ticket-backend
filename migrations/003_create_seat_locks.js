export async function up(pgm) {
  // Create seat_locks table
  pgm.createTable("seat_locks", {
    id: "id",
    show_id: {
      type: "integer",
      notNull: true,
      references: '"shows"(id)',
      onDelete: "cascade",
    },
    booking_id: {
      type: "uuid",
      notNull: true,
      references: '"bookings"(booking_id)',
      onDelete: "cascade",
    },
    seats_locked: { type: "integer", notNull: true },
    locked_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
    expires_at: { type: "timestamp", notNull: true },
  });

  // Indexes for performance
  pgm.addIndex("seat_locks", "show_id");
  pgm.addIndex("seat_locks", "expires_at");

  // Trigger function to update 'updated_at' columns
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Triggers for shows and bookings tables
  pgm.sql(`
    CREATE TRIGGER update_shows_updated_at
    BEFORE UPDATE ON shows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(pgm) {
  // Drop triggers first
  pgm.sql(`
    DROP TRIGGER IF EXISTS update_shows_updated_at ON shows;
    DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
    DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
  `);

  // Drop table
  pgm.dropTable("seat_locks");
}
