export async function up(pgm) {
  pgm.addColumn("shows", {
    price: {
      type: "numeric(10,2)",
      notNull: true,
      default: 0,
      check: "price >= 0",
    },
  });
}

export async function down(pgm) {
  pgm.dropColumn("shows", "price");
}
