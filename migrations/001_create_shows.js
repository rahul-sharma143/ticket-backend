export async function up(pgm) {
  pgm.createTable("shows", {
    id: "id",
    name: { type: "varchar(255)", notNull: true },
    start_time: { type: "timestamp", notNull: true },
    total_seats: { type: "integer", notNull: true, check: "total_seats > 0" },
    available_seats: { type: "integer", notNull: true },
    price: { type: "numeric(10,2)", notNull: true, check: "price >= 0" },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
    updated_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });

  pgm.addIndex("shows", "start_time");
  pgm.addIndex("shows", "available_seats");

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = CURRENT_TIMESTAMP;
       RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON shows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(pgm) {
  pgm.dropTable("shows");
  pgm.sql(`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;`);
}
