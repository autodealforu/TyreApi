import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TyreModel from '../api/tyres/TyreModel.js';
import connectDB from '../config/db.js';

// Configure environment variables
dotenv.config();

// Realistic tire combinations with proper specifications
const tyreSpecs = [
  // Passenger Car Tyres
  {
    width: '175',
    aspectRatio: '70',
    rimDiameter: '13',
    type: 'Passenger',
    vehicle: 'Small Car',
    construction: 'Radial',
  },
  {
    width: '185',
    aspectRatio: '65',
    rimDiameter: '14',
    type: 'Passenger',
    vehicle: 'Compact Car',
    construction: 'Radial',
  },
  {
    width: '195',
    aspectRatio: '60',
    rimDiameter: '15',
    type: 'Passenger',
    vehicle: 'Mid-size Car',
    construction: 'Radial',
  },
  {
    width: '205',
    aspectRatio: '55',
    rimDiameter: '16',
    type: 'Passenger',
    vehicle: 'Sedan',
    construction: 'Radial',
  },
  {
    width: '215',
    aspectRatio: '55',
    rimDiameter: '17',
    type: 'Passenger',
    vehicle: 'Premium Sedan',
    construction: 'Radial',
  },
  {
    width: '225',
    aspectRatio: '50',
    rimDiameter: '17',
    type: 'Passenger',
    vehicle: 'Sports Car',
    construction: 'Radial',
  },
  {
    width: '235',
    aspectRatio: '45',
    rimDiameter: '18',
    type: 'Passenger',
    vehicle: 'Performance Car',
    construction: 'Radial',
  },
  {
    width: '245',
    aspectRatio: '40',
    rimDiameter: '18',
    type: 'Passenger',
    vehicle: 'Sports Car',
    construction: 'Radial',
  },

  // SUV Tyres
  {
    width: '215',
    aspectRatio: '70',
    rimDiameter: '16',
    type: 'SUV',
    vehicle: 'Compact SUV',
    construction: 'Radial',
  },
  {
    width: '225',
    aspectRatio: '65',
    rimDiameter: '17',
    type: 'SUV',
    vehicle: 'Mid-size SUV',
    construction: 'Radial',
  },
  {
    width: '235',
    aspectRatio: '60',
    rimDiameter: '18',
    type: 'SUV',
    vehicle: 'Large SUV',
    construction: 'Radial',
  },
  {
    width: '255',
    aspectRatio: '55',
    rimDiameter: '19',
    type: 'SUV',
    vehicle: 'Premium SUV',
    construction: 'Radial',
  },
  {
    width: '265',
    aspectRatio: '50',
    rimDiameter: '20',
    type: 'SUV',
    vehicle: 'Luxury SUV',
    construction: 'Radial',
  },

  // Commercial/Truck Tyres
  {
    width: '195',
    aspectRatio: '75',
    rimDiameter: '16',
    type: 'Commercial',
    vehicle: 'Light Truck',
    construction: 'Radial',
  },
  {
    width: '215',
    aspectRatio: '75',
    rimDiameter: '17.5',
    type: 'Commercial',
    vehicle: 'Medium Truck',
    construction: 'Radial',
  },
  {
    width: '235',
    aspectRatio: '75',
    rimDiameter: '17.5',
    type: 'Commercial',
    vehicle: 'Heavy Truck',
    construction: 'Radial',
  },
  {
    width: '255',
    aspectRatio: '70',
    rimDiameter: '22.5',
    type: 'Commercial',
    vehicle: 'Bus/Truck',
    construction: 'Radial',
  },

  // Motorcycle Tyres
  {
    width: '100',
    aspectRatio: '90',
    rimDiameter: '10',
    type: 'Motorcycle',
    vehicle: 'Scooter',
    construction: 'Radial',
  },
  {
    width: '110',
    aspectRatio: '80',
    rimDiameter: '17',
    type: 'Motorcycle',
    vehicle: 'Motorcycle',
    construction: 'Radial',
  },
  {
    width: '120',
    aspectRatio: '70',
    rimDiameter: '17',
    type: 'Motorcycle',
    vehicle: 'Sport Bike',
    construction: 'Radial',
  },
  {
    width: '150',
    aspectRatio: '70',
    rimDiameter: '17',
    type: 'Motorcycle',
    vehicle: 'Cruiser',
    construction: 'Radial',
  },
];

// Brand data with origin and premium classification
const brands = [
  { name: 'MRF', origin: 'India', premium: false },
  { name: 'CEAT', origin: 'India', premium: false },
  { name: 'Apollo', origin: 'India', premium: false },
  { name: 'JK Tyre', origin: 'India', premium: false },
  { name: 'Michelin', origin: 'France', premium: true },
  { name: 'Bridgestone', origin: 'Japan', premium: true },
  { name: 'Goodyear', origin: 'USA', premium: true },
  { name: 'Continental', origin: 'Germany', premium: true },
  { name: 'Pirelli', origin: 'Italy', premium: true },
  { name: 'Dunlop', origin: 'UK', premium: true },
  { name: 'Yokohama', origin: 'Japan', premium: true },
  { name: 'Hankook', origin: 'South Korea', premium: false },
];

// Thread patterns categorized by tyre type
const threadPatterns = {
  Passenger: [
    'Touring',
    'Performance',
    'Eco',
    'Comfort',
    'Sport',
    'All-Season',
  ],
  SUV: [
    'All-Terrain',
    'Highway',
    'Mud-Terrain',
    'Urban',
    'Performance',
    'Off-Road',
  ],
  Commercial: [
    'Highway',
    'Mixed Service',
    'Urban',
    'Long Haul',
    'Regional',
    'City',
  ],
  Motorcycle: ['Street', 'Sport', 'Touring', 'Adventure', 'Cruiser', 'Racing'],
};

// Load indexes and speed symbols
const loadIndexes = [
  '75',
  '80',
  '85',
  '87',
  '91',
  '94',
  '97',
  '100',
  '103',
  '106',
  '109',
  '112',
];
const speedSymbols = ['H', 'V', 'W', 'Y', 'Z', 'T', 'S', 'R', 'Q'];
const plyRatings = ['4PR', '6PR', '8PR', '10PR', '12PR', '14PR'];

// HSN codes for different tyre categories
const hsnCodes = {
  Passenger: '40111000',
  SUV: '40111000',
  Commercial: '40112000',
  Motorcycle: '40113000',
};

// Generate realistic tyre data
const generateRealisticTyre = (spec, brand, index) => {
  const threadPattern =
    threadPatterns[spec.type][
      Math.floor(Math.random() * threadPatterns[spec.type].length)
    ];
  const loadIndex = loadIndexes[Math.floor(Math.random() * loadIndexes.length)];
  const speedSymbol =
    speedSymbols[Math.floor(Math.random() * speedSymbols.length)];
  const plyRating =
    spec.type === 'Commercial'
      ? plyRatings[Math.floor(Math.random() * 3) + 3]
      : plyRatings[Math.floor(Math.random() * 3)]; // Commercial gets higher ply

  // Price calculation based on brand premium status and size
  const sizeFactor = parseInt(spec.width) * 0.1;
  const premiumMultiplier = brand.premium ? 1.8 : 1.2;
  const typeMultiplier =
    spec.type === 'Commercial' ? 2.5 : spec.type === 'SUV' ? 1.5 : 1;
  const basePrice = Math.floor(
    (1500 + sizeFactor * 40) * premiumMultiplier * typeMultiplier
  );

  const tyreSize = `${spec.width}/${spec.aspectRatio}R${spec.rimDiameter}`;
  const productName = `${brand.name} ${threadPattern} ${tyreSize}`;

  return {
    // Required fields from model
    rimDiameter: null, // Will need to be populated with actual ObjectId
    tyreWidthType: `${spec.width}mm`,
    tyreWidth: null, // Will need to be populated with actual ObjectId
    aspectRatio: null, // Will need to be populated with actual ObjectId
    loadIndex: null, // Will need to be populated with actual ObjectId
    speedSymbol: null, // Will need to be populated with actual ObjectId
    construction: spec.construction,
    plyRating: null, // Will need to be populated with actual ObjectId
    productBrand: null, // Will need to be populated with actual ObjectId
    productThreadPattern: null, // Will need to be populated with actual ObjectId
    productType: null, // Will need to be populated with actual ObjectId

    // Tax and categorization
    gstTaxRate: spec.type === 'Commercial' ? '28%' : '18%',
    gstTax: spec.type === 'Commercial' ? '28' : '18',
    unit: 'Piece',
    broadCategory: 'Automotive',
    category: 'Tyres',
    subCategory: spec.type,
    hsnCode: hsnCodes[spec.type],
    hsnSubCode: hsnCodes[spec.type] + '01',

    // Product details
    warranty: brand.premium ? '5 Years' : '3 Years',
    productImages: [
      `https://picsum.photos/400/400?random=${index + 1}`,
      `https://picsum.photos/400/400?random=${index + 100}`,
      `https://picsum.photos/400/400?random=${index + 200}`,
    ],
    productDescription: `Premium ${threadPattern.toLowerCase()} tyre from ${
      brand.name
    }. Designed specifically for ${spec.vehicle.toLowerCase()} with excellent performance, durability and safety. Features advanced ${spec.construction.toLowerCase()} construction technology for superior grip and comfort. Size: ${tyreSize}. Made with high-grade materials ensuring long-lasting performance. Suitable for ${spec.type.toLowerCase()} vehicles with load index ${loadIndex} and speed rating ${speedSymbol}.`,

    productWarrantyPolicy: `This ${
      brand.name
    } tyre comes with a comprehensive ${
      brand.premium ? '5-year' : '3-year'
    } warranty covering manufacturing defects. Warranty includes free replacement for defects in materials and workmanship. Regular maintenance and proper usage conditions apply. Warranty does not cover damage due to misuse, accidents, or normal wear and tear.`,

    // Physical specifications
    grossWeight: (Math.random() * 15 + 8).toFixed(2) + ' kg',
    volumetricWeight: (Math.random() * 20 + 10).toFixed(2) + ' kg',

    // System fields
    created_by: new mongoose.Types.ObjectId(), // Placeholder - should be actual user ID
    published_status: 'PUBLISHED',
  };
};

// Helper function to create sample reference data
const createSampleReferenceData = () => {
  const referenceData = {
    rimDiameters: [],
    tyreWidths: [],
    aspectRatios: [],
    loadIndexes: [],
    speedSymbols: [],
    plyRatings: [],
    brands: [],
    threadPatterns: [],
    productTypes: [],
  };

  // Create unique values from our test data
  const uniqueRimDiameters = [
    ...new Set(tyreSpecs.map((spec) => spec.rimDiameter)),
  ];
  const uniqueWidths = [...new Set(tyreSpecs.map((spec) => spec.width))];
  const uniqueAspectRatios = [
    ...new Set(tyreSpecs.map((spec) => spec.aspectRatio)),
  ];
  const uniqueTypes = [...new Set(tyreSpecs.map((spec) => spec.type))];
  const allThreadPatterns = Object.values(threadPatterns).flat();
  const uniqueThreadPatterns = [...new Set(allThreadPatterns)];

  // Generate ObjectIds for reference data
  uniqueRimDiameters.forEach((diameter) => {
    referenceData.rimDiameters.push({
      _id: new mongoose.Types.ObjectId(),
      name: diameter + '"',
      value: diameter,
    });
  });

  uniqueWidths.forEach((width) => {
    referenceData.tyreWidths.push({
      _id: new mongoose.Types.ObjectId(),
      name: width + 'mm',
      value: width,
    });
  });

  uniqueAspectRatios.forEach((ratio) => {
    referenceData.aspectRatios.push({
      _id: new mongoose.Types.ObjectId(),
      name: ratio + '%',
      value: ratio,
    });
  });

  loadIndexes.forEach((index) => {
    referenceData.loadIndexes.push({
      _id: new mongoose.Types.ObjectId(),
      name: 'Load Index ' + index,
      value: index,
    });
  });

  speedSymbols.forEach((symbol) => {
    referenceData.speedSymbols.push({
      _id: new mongoose.Types.ObjectId(),
      name: 'Speed ' + symbol,
      value: symbol,
    });
  });

  plyRatings.forEach((rating) => {
    referenceData.plyRatings.push({
      _id: new mongoose.Types.ObjectId(),
      name: rating,
      value: rating,
    });
  });

  brands.forEach((brand) => {
    referenceData.brands.push({
      _id: new mongoose.Types.ObjectId(),
      name: brand.name,
      origin: brand.origin,
      premium: brand.premium,
    });
  });

  uniqueThreadPatterns.forEach((pattern) => {
    referenceData.threadPatterns.push({
      _id: new mongoose.Types.ObjectId(),
      name: pattern,
      value: pattern.toLowerCase().replace(/\s+/g, '-'),
    });
  });

  uniqueTypes.forEach((type) => {
    referenceData.productTypes.push({
      _id: new mongoose.Types.ObjectId(),
      name: type,
      value: type.toLowerCase(),
    });
  });

  return referenceData;
};

// Main seeding function
const seedAdvancedTyres = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('🗑️  Clearing existing tyre data...');
    await TyreModel.deleteMany({});

    console.log('📊 Creating reference data...');
    const referenceData = createSampleReferenceData();

    console.log('🏭 Generating realistic tyre test data...');
    const testTyres = [];

    // Generate tyres using combinations of specs and brands
    let tyreCount = 0;
    for (let i = 0; i < tyreSpecs.length && tyreCount < 40; i++) {
      for (let j = 0; j < brands.length && tyreCount < 40; j++) {
        const spec = tyreSpecs[i];
        const brand = brands[j];

        const tyreData = generateRealisticTyre(spec, brand, tyreCount);

        // Map to actual reference IDs
        const rimDiameter = referenceData.rimDiameters.find(
          (r) => r.value === spec.rimDiameter
        );
        const tyreWidth = referenceData.tyreWidths.find(
          (w) => w.value === spec.width
        );
        const aspectRatio = referenceData.aspectRatios.find(
          (a) => a.value === spec.aspectRatio
        );
        const productType = referenceData.productTypes.find(
          (t) => t.name === spec.type
        );
        const productBrand = referenceData.brands.find(
          (b) => b.name === brand.name
        );

        // Get random references for other fields
        const loadIndex =
          referenceData.loadIndexes[
            Math.floor(Math.random() * referenceData.loadIndexes.length)
          ];
        const speedSymbol =
          referenceData.speedSymbols[
            Math.floor(Math.random() * referenceData.speedSymbols.length)
          ];
        const plyRating =
          referenceData.plyRatings[
            Math.floor(Math.random() * referenceData.plyRatings.length)
          ];
        const threadPattern =
          referenceData.threadPatterns.find((tp) =>
            threadPatterns[spec.type].includes(tp.name)
          ) || referenceData.threadPatterns[0];

        // Assign the ObjectIds
        tyreData.rimDiameter = rimDiameter?._id;
        tyreData.tyreWidth = tyreWidth?._id;
        tyreData.aspectRatio = aspectRatio?._id;
        tyreData.loadIndex = loadIndex?._id;
        tyreData.speedSymbol = speedSymbol?._id;
        tyreData.plyRating = plyRating?._id;
        tyreData.productBrand = productBrand?._id;
        tyreData.productThreadPattern = threadPattern?._id;
        tyreData.productType = productType?._id;

        testTyres.push(tyreData);
        tyreCount++;

        // Add some variety - skip some combinations
        if (Math.random() > 0.7) {
          j++; // Skip next brand sometimes
        }
      }
    }

    console.log(`💾 Inserting ${testTyres.length} tyres into database...`);
    const insertedTyres = await TyreModel.insertMany(testTyres);

    console.log(
      `✅ Successfully created ${insertedTyres.length} realistic test tyres!`
    );

    // Display summary statistics
    const summary = {};
    insertedTyres.forEach((tyre) => {
      const category = tyre.subCategory;
      summary[category] = (summary[category] || 0) + 1;
    });

    console.log('\n📊 Summary by category:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} tyres`);
    });

    console.log('\n📋 Sample tyres created:');
    insertedTyres.slice(0, 5).forEach((tyre, index) => {
      console.log(
        `   ${index + 1}. ${tyre.tyreWidthType} ${tyre.subCategory} - GST: ${
          tyre.gstTaxRate
        }`
      );
    });

    console.log('\n🎯 Test data generation completed successfully!');
    console.log(
      '🚀 You can now test your API endpoints with this realistic data.'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tyres:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Execute the seeder
console.log('🌱 Starting Advanced Tyre Test Data Generator...');
console.log('📅 Generated on:', new Date().toLocaleString());
console.log('🎯 Target: 40 realistic tyre records\n');

seedAdvancedTyres();
