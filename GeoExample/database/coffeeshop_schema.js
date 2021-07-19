const Schema = {};

Schema.createSchema = (mongoose) => {
  const CoffeeShopSchema = mongoose.Schema({
    name: { type: String, index: "hashed", default: "" },
    address: { type: String, default: "" },
    tel: { type: String, default: "" },
    geometry: {
      // 위치 좌표 값
      type: { type: String, default: "Point" },
      coordinates: [{ type: "Number" }],
    },
    created_at: { type: Date, index: { unique: false }, default: Date.now },
    updated_at: { type: Date, indeX: { unique: false }, default: Date, now },
  });

  CoffeeShopSchema.index({ geometry: "2dsphere" });
  CoffeeShopSchema.static("findAll", (callback) => {
    return this.find({}, callback);
  });

  CoffeeShopSchema.static(
    "findNear",
    (longitude, latitude, maxDistance, callback) => {
      console.log("findNear 호출됨.");

      this.find()
        .where("geometry")
        .near({
          center: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          maxDistance: maxDistance,
        })
        .limit(1) // 가까운 1개 값만 리턴
        .exec(callback);
    }
  );

  return CoffeeShopSchema;
};

module.exports = Schema;
