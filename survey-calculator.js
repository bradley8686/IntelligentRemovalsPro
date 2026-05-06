(function attachSurveyCalculator(global) {
  const M3_TO_CUFT = 35.3147;

  const CONTENTS_MULTIPLIER = {
    light: 0.85,
    normal: 1,
    heavy: 1.22,
    very_heavy: 1.42
  };

  const PROPERTY_BASELINE_M3 = {
    studio: 8,
    '1-bed': 12,
    '2-bed': 20,
    '3-bed': 30,
    '4-bed': 45,
    '5-bed+': 60
  };

  const BOX_BASELINE = {
    studio: { small: 5, medium: 8, large: 4, wardrobe: 1 },
    '1-bed': { small: 8, medium: 12, large: 6, wardrobe: 2 },
    '2-bed': { small: 12, medium: 22, large: 10, wardrobe: 3 },
    '3-bed': { small: 18, medium: 35, large: 15, wardrobe: 4 },
    '4-bed': { small: 25, medium: 50, large: 22, wardrobe: 6 },
    '5-bed+': { small: 35, medium: 70, large: 30, wardrobe: 8 }
  };

  const BOX_VOLUME_M3 = {
    small: 0.045,
    medium: 0.075,
    large: 0.115,
    wardrobe: 0.42
  };

  const VEHICLES = [
    { name: 'Small Van', capacity_m3: 3.5, usable_m3: 3.0, payload_kg: 500, day_rate_gbp: 170 },
    { name: 'Medium Van', capacity_m3: 7.0, usable_m3: 6.0, payload_kg: 900, day_rate_gbp: 260 },
    { name: '3.5T Luton Van', capacity_m3: 18.0, usable_m3: 15.5, payload_kg: 950, day_rate_gbp: 390 },
    { name: '7.5T Lorry', capacity_m3: 35.0, usable_m3: 30.0, payload_kg: 2500, day_rate_gbp: 620 },
    { name: '12T Lorry', capacity_m3: 45.0, usable_m3: 39.0, payload_kg: 4200, day_rate_gbp: 820 },
    { name: '18T Lorry', capacity_m3: 55.0, usable_m3: 48.0, payload_kg: 9000, day_rate_gbp: 1050 }
  ];

  function round(value, places = 1) {
    const factor = 10 ** places;
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function contentMultiplier(level) {
    return CONTENTS_MULTIPLIER[level] || CONTENTS_MULTIPLIER.normal;
  }

  function propertyBaselineM3(propertySize, contentsLevel) {
    return round((PROPERTY_BASELINE_M3[propertySize] || PROPERTY_BASELINE_M3['2-bed']) * contentMultiplier(contentsLevel), 1);
  }

  function chooseVehicle(volumeM3, weightKg) {
    const vehicle = VEHICLES.find((candidate) =>
      candidate.usable_m3 >= volumeM3 && candidate.payload_kg >= weightKg
    );

    if (vehicle) {
      return { ...vehicle, trips: 1, label: vehicle.name };
    }

    const largest = VEHICLES[VEHICLES.length - 1];
    const tripsByCube = Math.ceil(volumeM3 / largest.usable_m3);
    const tripsByWeight = Math.ceil((weightKg || 0) / largest.payload_kg);
    const trips = Math.max(2, tripsByCube, tripsByWeight);
    return { ...largest, trips, label: `${trips} x ${largest.name} loads` };
  }

  function countExistingBoxes(inventoryItems) {
    return inventoryItems
      .filter((item) => item.key === 'boxes' || /box/i.test(item.label || ''))
      .reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  }

  function estimateBoxes(propertySize, contentsLevel, inventoryItems) {
    const baseline = BOX_BASELINE[propertySize] || BOX_BASELINE['2-bed'];
    const multiplier = contentMultiplier(contentsLevel);
    const plan = {
      small: Math.ceil(baseline.small * multiplier),
      medium: Math.ceil(baseline.medium * multiplier),
      large: Math.ceil(baseline.large * multiplier),
      wardrobe: Math.ceil(baseline.wardrobe * Math.max(1, multiplier * 0.9))
    };
    const total = plan.small + plan.medium + plan.large + plan.wardrobe;
    const existing = countExistingBoxes(inventoryItems);
    const remaining = Math.max(0, total - existing);
    const cubeM3 = round(
      plan.small * BOX_VOLUME_M3.small +
      plan.medium * BOX_VOLUME_M3.medium +
      plan.large * BOX_VOLUME_M3.large +
      plan.wardrobe * BOX_VOLUME_M3.wardrobe,
      1
    );

    return { ...plan, total, existing, remaining, cube_m3: cubeM3 };
  }

  function calculate(total, job, inventoryItems) {
    const items = Array.isArray(inventoryItems) ? inventoryItems : [];
    const propertySize = job && job.property_size ? job.property_size : '2-bed';
    const contentsLevel = job && job.contents_level ? job.contents_level : 'normal';
    const surveyedM3 = Number(total && total.volume) || 0;
    const surveyedKg = Number(total && total.weight) || 0;
    const baselineM3 = propertyBaselineM3(propertySize, contentsLevel);
    const loadAllowanceM3 = round(surveyedM3 * 1.18, 1);
    const recommendedM3 = round(Math.max(loadAllowanceM3, baselineM3), 1);
    const vehicle = chooseVehicle(recommendedM3, surveyedKg);
    const boxes = estimateBoxes(propertySize, contentsLevel, items);
    const baselineUsed = baselineM3 > loadAllowanceM3;

    return {
      surveyed_volume_m3: round(surveyedM3, 1),
      surveyed_volume_cuft: Math.round(surveyedM3 * M3_TO_CUFT),
      load_volume_m3: loadAllowanceM3,
      load_volume_cuft: Math.round(loadAllowanceM3 * M3_TO_CUFT),
      recommended_volume_m3: recommendedM3,
      recommended_volume_cuft: Math.round(recommendedM3 * M3_TO_CUFT),
      baseline_volume_m3: baselineM3,
      baseline_used: baselineUsed,
      weight_kg: Math.round(surveyedKg),
      vehicle,
      boxes,
      contents_level: contentsLevel
    };
  }

  function vehicleRate(vehicleName) {
    const vehicle = VEHICLES.find((candidate) => candidate.name === vehicleName || candidate.label === vehicleName);
    return vehicle ? vehicle.day_rate_gbp : VEHICLES[0].day_rate_gbp;
  }

  global.IRP_CALC = {
    M3_TO_CUFT,
    VEHICLES,
    BOX_VOLUME_M3,
    calculate,
    chooseVehicle,
    estimateBoxes,
    vehicleRate,
    propertyBaselineM3
  };
})(window);
