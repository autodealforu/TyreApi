# Alloy Wheel API - Complete Analysis & Implementation

## Overview

This document provides a detailed analysis of the Alloy Wheel API implementation based on the existing Tyre Model API structure. The alloy wheel API maintains the same general product fields as the tyre model while implementing specific alloy wheel technical specifications.

## API Structure Comparison

### Tyre Model Fields (Reference)

```javascript
// Tyre-specific fields
rimDiameter: ObjectId -> RimDiameter
tyreWidthType: String
tyreWidth: ObjectId -> TyreWidth
aspectRatio: ObjectId -> AspectRatio
loadIndex: ObjectId -> LoadIndex
speedSymbol: ObjectId -> SpeedSymbol
construction: String
plyRating: ObjectId -> PlyRating
productBrand: ObjectId -> Brand
productThreadPattern: ObjectId -> ThreadPattern

// General product fields (shared)
productType, gstTaxRate, gstTax, unit, broadCategory, category, subCategory
hsnCode, hsnSubCode, warranty, productImages, productDescription
productWarrantyPolicy, grossWeight, volumetricWeight
created_by, updated_by, published_status
```

### Alloy Wheel Model Fields (New Implementation)

```javascript
// Alloy Wheel-specific fields
alloyDiameterInches: ObjectId -> AlloyDiameter
alloyWidth: ObjectId -> AlloyWidth
alloyPCD: ObjectId -> AlloyPCD
alloyOffset: ObjectId -> AlloyOffset
alloyBoreSizeMM: ObjectId -> AlloyBoreSize
alloyBrand: ObjectId -> Brand (reused)
alloyDesignName: String
alloyFinish: ObjectId -> AlloyFinish

// General product fields (same as tyre)
productType, gstTaxRate, gstTax, unit, broadCategory, category, subCategory
hsnCode, hsnSubCode, warranty, productImages, productDescription
productWarrantyPolicy, grossWeight, volumetricWeight
created_by, updated_by, published_status
```

## Reference Models Created

### 1. AlloyDiameter Model

- **Purpose**: Stores alloy wheel diameter specifications in inches
- **Fields**:
  - `name`: String (e.g., "17 inch", "18 inch")
  - `diameterInches`: Number (actual diameter value)
  - `description`: String (optional)
  - Standard metadata fields

### 2. AlloyWidth Model

- **Purpose**: Stores alloy wheel width specifications
- **Fields**:
  - `name`: String (e.g., "7.5J", "8.5J")
  - `widthValue`: Number (width value)
  - `unit`: String (default: "inches")
  - `description`: String (optional)
  - Standard metadata fields

### 3. AlloyPCD Model

- **Purpose**: Stores Pitch Circle Diameter (bolt pattern) specifications
- **Fields**:
  - `name`: String (e.g., "5x114.3", "4x100")
  - `pcdValue`: String (full PCD specification)
  - `numberOfBolts`: Number (number of bolt holes)
  - `diameter`: Number (circle diameter in mm)
  - `description`: String (optional)
  - Standard metadata fields

### 4. AlloyOffset Model

- **Purpose**: Stores wheel offset specifications
- **Fields**:
  - `name`: String (e.g., "+35mm", "-15mm")
  - `offsetValue`: Number (offset value)
  - `unit`: String (default: "mm")
  - `offsetType`: Enum ["positive", "negative", "zero"]
  - `description`: String (optional)
  - Standard metadata fields

### 5. AlloyBoreSize Model

- **Purpose**: Stores center bore diameter specifications
- **Fields**:
  - `name`: String (e.g., "73.1mm", "66.6mm")
  - `boreSizeMM`: Number (bore diameter in mm)
  - `description`: String (optional)
  - Standard metadata fields

### 6. AlloyFinish Model

- **Purpose**: Stores alloy wheel finish/coating types
- **Fields**:
  - `name`: String (finish name)
  - `finishType`: Enum (chrome, painted, machined, powder_coated, polished, etc.)
  - `color`: String (optional color specification)
  - `description`: String (optional)
  - Standard metadata fields

## API Endpoints

### Base Route: `/api/alloy-wheels`

1. **GET /** - Get paginated alloy wheels

   - Query params: `pageNumber`, `search`, `exact`, `conditional`
   - Returns: Paginated list with population of all reference models

2. **GET /all** - Get all alloy wheels (limited to 100)

   - Query params: `pageNumber`, `term`, `value`
   - Returns: Array of alloy wheels

3. **GET /:id** - Get single alloy wheel by ID

   - Returns: Single alloy wheel with all populated references

4. **POST /** - Create new alloy wheel (Protected)

   - Body: Alloy wheel data
   - Authentication: Required
   - Returns: Created alloy wheel

5. **PUT /:id** - Update alloy wheel (Protected)

   - Body: Updated alloy wheel data
   - Authentication: Required
   - Returns: Updated alloy wheel

6. **DELETE /:id** - Delete alloy wheel (Admin only)
   - Authentication: Admin required
   - Returns: Success message

## Data Population Strategy

All queries include comprehensive population of reference models:

```javascript
.populate('alloyDiameterInches', '_id, name')
.populate('alloyWidth', '_id, name')
.populate('alloyPCD', '_id, name')
.populate('alloyOffset', '_id, name')
.populate('alloyBoreSizeMM', '_id, name')
.populate('alloyBrand', '_id, name')
.populate('alloyFinish', '_id, name')
.populate('productType', '_id, name')
.populate('created_by', '_id, name')
.populate('updated_by', '_id, name')
```

## Key Differences from Tyre Model

1. **Reference Models**: Created specific reference models for alloy wheel technical specifications
2. **Field Names**: Updated to be alloy-wheel specific while maintaining clarity
3. **Data Types**: Used proper ObjectId references instead of strings for better data integrity
4. **Validation**: Each reference model includes proper validation and required fields
5. **Enum Values**: Added specific enum values for finish types and offset types

## Technical Specifications Mapping

| User Requirement         | Database Field      | Reference Model  | Type     |
| ------------------------ | ------------------- | ---------------- | -------- |
| ALLOY DIAMETER IN INCHES | alloyDiameterInches | AlloyDiameter    | ObjectId |
| ALLOY WIDTH              | alloyWidth          | AlloyWidth       | ObjectId |
| ALLOY PCD                | alloyPCD            | AlloyPCD         | ObjectId |
| ALLOY OFFSET             | alloyOffset         | AlloyOffset      | ObjectId |
| ALLOY BORE SIZE IN MM    | alloyBoreSizeMM     | AlloyBoreSize    | ObjectId |
| ALLOY BRAND              | alloyBrand          | Brand (existing) | ObjectId |
| ALLOY DESIGN NAME        | alloyDesignName     | -                | String   |
| ALLOY FINISH             | alloyFinish         | AlloyFinish      | ObjectId |

## Files Created/Modified

### New Files:

- `AlloyDiameterModel.js` - Diameter reference model
- `AlloyWidthModel.js` - Width reference model
- `AlloyPCDModel.js` - PCD reference model
- `AlloyOffsetModel.js` - Offset reference model
- `AlloyBoreSizeModel.js` - Bore size reference model
- `AlloyFinishModel.js` - Finish reference model

### Modified Files:

- `alloyWheelModel.js` - Updated with proper ObjectId references
- `alloyWheelController.js` - Updated with proper population and tyre-like structure
- `alloyWheelRoutes.js` - Fixed import errors and cleaned up routes
- `alloyWheels_enum.js` - Updated field definitions

## Next Steps

1. **Create Controllers for Reference Models**: Create CRUD controllers for each reference model
2. **Add Route Registration**: Register alloy wheel routes in main server file
3. **Database Seeding**: Create seed data for reference models
4. **Validation**: Add proper input validation middleware
5. **Testing**: Create test cases for all endpoints
6. **Documentation**: Add API documentation with examples

## Usage Example

```javascript
// Create new alloy wheel
POST /api/alloy-wheels
{
  "alloyDiameterInches": "objectId_of_17_inch",
  "alloyWidth": "objectId_of_8_5J",
  "alloyPCD": "objectId_of_5x114_3",
  "alloyOffset": "objectId_of_plus_35mm",
  "alloyBoreSizeMM": "objectId_of_73_1mm",
  "alloyBrand": "objectId_of_brand",
  "alloyDesignName": "Racing Pro",
  "alloyFinish": "objectId_of_hyper_silver",
  "productType": "objectId_of_product_type",
  "category": "Aftermarket Wheels",
  "productDescription": "High-performance alloy wheel...",
  // ... other general fields
}
```

This implementation provides a robust, scalable API structure that mirrors the tyre model's approach while accommodating the specific technical requirements of alloy wheels.
