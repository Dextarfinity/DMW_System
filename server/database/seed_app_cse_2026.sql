-- APP-CSE 2026 Item Catalog Import
-- Generated from APP-CSE 2026 Form.xlsx
-- Total unique items: 318
-- stock_no and uacs_code are set to NULL (editable later)

BEGIN;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('12191601-AL-E04', NULL, 'ALCOHOL, Ethyl, 500 mL', 'ALCOHOL, Ethyl, 500 mL', 'bottle', 55.62, 'ALCOHOL OR ACETONE BASED ANTISEPTICS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('12191601-AL-E03', NULL, 'ALCOHOL, Ethyl, 1 Gallon', 'ALCOHOL, Ethyl, 1 Gallon', 'gallon', 362.45, 'ALCOHOL OR ACETONE BASED ANTISEPTICS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121413-CB-P01', NULL, 'CLEARBOOK, A4 size', 'CLEARBOOK, A4 size', 'piece', 35.52, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121413-CB-P02', NULL, 'CLEARBOOK, Legal size', 'CLEARBOOK, Legal size', 'piece', 38.23, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121534-ER-P01', NULL, 'ERASER, plastic/rubber', 'ERASER, plastic/rubber', 'piece', 9.34, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G01', NULL, 'SIGN PEN, Extra Fine Tip, Black', 'SIGN PEN, Extra Fine Tip, Black', 'piece', 27.11, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G02', NULL, 'SIGN PEN, Extra Fine Tip, Blue', 'SIGN PEN, Extra Fine Tip, Blue', 'piece', 27.11, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G03', NULL, 'SIGN PEN, Extra Fine Tip, Red', 'SIGN PEN, Extra Fine Tip, Red', 'piece', 27.11, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G04', NULL, 'SIGN PEN, Fine Tip, Black', 'SIGN PEN, Fine Tip, Black', 'piece', 30.91, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G05', NULL, 'SIGN PEN, Fine Tip, Blue', 'SIGN PEN, Fine Tip, Blue', 'piece', 30.91, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G06', NULL, 'SIGN PEN, Fine Tip, Red', 'SIGN PEN, Fine Tip, Red', 'piece', 30.91, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G07', NULL, 'SIGN PEN, Medium Tip, Black', 'SIGN PEN, Medium Tip, Black', 'piece', 63.62, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G08', NULL, 'SIGN PEN, Medium Tip, Blue', 'SIGN PEN, Medium Tip, Blue', 'piece', 63.62, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121524-SP-G09', NULL, 'SIGN PEN, Medium Tip, Red', 'SIGN PEN, Medium Tip, Red', 'piece', 63.62, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('60121124-WR-P01', NULL, 'WRAPPING PAPER', 'WRAPPING PAPER', 'pack', 163.62, 'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('45121517-DO-C02', NULL, 'DOCUMENT CAMERA', 'DOCUMENT CAMERA', 'unit', 23977.95, 'AUDIO AND VISUAL EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('45111609-MM-P01', NULL, 'MULTIMEDIA PROJECTOR', 'MULTIMEDIA PROJECTOR', 'unit', 16836.82, 'AUDIO AND VISUAL EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('26111702-BT-A02', NULL, 'BATTERY, dry cell, size AA', 'BATTERY, dry cell, size AA', 'pack', 20.8, 'BATTERIES AND CELLS AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('26111702-BT-A01', NULL, 'BATTERY, dry cell, size AAA', 'BATTERY, dry cell, size AAA', 'pack', 18.61, 'BATTERIES AND CELLS AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131812-AF-A01', NULL, 'AIR FRESHENER', 'AIR FRESHENER', 'can', 126.67, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131604-BR-S01', NULL, 'BROOM (Walis Tambo)', 'BROOM (Walis Tambo)', 'piece', 126.67, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131604-BR-T01', NULL, 'BROOM (Walis Ting-ting)', 'BROOM (Walis Ting-ting)', 'piece', 26.39, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131829-TB-C01', NULL, 'CLEANER, Toilet Bowl and Urinal', 'CLEANER, Toilet Bowl and Urinal', 'bottle', 42.22, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131805-CL-P01', NULL, 'CLEANSER, Scouring Powder', 'CLEANSER, Scouring Powder', 'can', 42.22, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131811-DE-B02', NULL, 'DETERGENT BAR', 'DETERGENT BAR', 'piece', 9.48, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131811-DE-P03', NULL, 'DETERGENT POWDER, all purpose', 'DETERGENT POWDER, all purpose', 'pouch', 54.89, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131803-DS-A01', NULL, 'DISINFECTANT SPRAY', 'DISINFECTANT SPRAY', 'can', 141.98, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131601-DU-P01', NULL, 'DUST PAN', 'DUST PAN', 'piece', 47.5, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131802-FW-P02', NULL, 'FLOOR WAX, paste type, red', 'FLOOR WAX, paste type, red', 'can', 314.41, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131830-FC-A01', NULL, 'FURNITURE CLEANER', 'FURNITURE CLEANER', 'can', 143.51, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('73101612-HS-L01', NULL, 'HAND SOAP, liquid, 500mL', 'HAND SOAP, liquid, 500mL', 'bottle', 43.6, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47121804-MP-B01', NULL, 'MOP BUCKET', 'MOP BUCKET', 'unit', 2322.32, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131501-RG-C01', NULL, 'RAGS', 'RAGS', 'bundle', 78.11, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47131602-SC-N01', NULL, 'SCOURING PAD', 'SCOURING PAD', 'pack', 86.92, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47121701-TB-P04', NULL, 'TRASHBAG, XXL size', 'TRASHBAG, XXL size', 'pack', 131.95, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47121701-TB-P05', NULL, 'TRASHBAG, Large size', 'TRASHBAG, Large size', 'pack', 59.28, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47121701-TB-P06', NULL, 'TRASHBAG, XL size', 'TRASHBAG, XL size', 'pack', 92.56, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('47121702-WB-P01', NULL, 'WASTEBASKET', 'WASTEBASKET', 'piece', 44.34, 'CLEANING EQUIPMENT AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('12171703-SI-P01', NULL, 'STAMP PAD, INK', 'STAMP PAD, INK', 'bottle', 29.22, 'COLOR COMPOUNDS AND DISPERSIONS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('52161535-DV-R01', NULL, 'DIGITAL VOICE RECORDER', 'DIGITAL VOICE RECORDER', 'unit', 7449.24, 'CONSUMER ELECTRONICS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('13111203-AC-F01', NULL, 'ACETATE', 'ACETATE', 'roll', 1262.5, 'FILMS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('13111201-CF-P02', NULL, 'CARBON FILM, Legal size', 'CARBON FILM, Legal size', 'box', 357.11, 'FILMS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('46191601-FE-M01', NULL, 'FIRE EXTINGUISHER, dry chemical', 'FIRE EXTINGUISHER, dry chemical', 'unit', 1161.16, 'FIRE FIGHTING EQUIPMENT', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('55121905-PH-F01', NULL, 'PHILIPPINE NATIONAL FLAG', 'PHILIPPINE NATIONAL FLAG', 'piece', 289.11, 'FLAG OR ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('56101504-CM-B01', NULL, 'MONOBLOC CHAIR, beige', 'MONOBLOC CHAIR, beige', 'piece', 359.96, 'FURNITURE AND FURNISHINGS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('56101504-CM-W01', NULL, 'MONOBLOC CHAIR, white', 'MONOBLOC CHAIR, white', 'piece', 359.96, 'FURNITURE AND FURNISHINGS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('40101604-EF-C01', NULL, 'ELECTRIC FAN, ceiling mount, orbit type', 'ELECTRIC FAN, ceiling mount, orbit type', 'unit', 1459.89, 'HEATING AND VENTILATION AND AIR CIRCULATION', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('40101604-EF-G01', NULL, 'ELECTRIC FAN, industrial, ground type', 'ELECTRIC FAN, industrial, ground type', 'unit', 1372.28, 'HEATING AND VENTILATION AND AIR CIRCULATION', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('40101604-EF-S01', NULL, 'ELECTRIC FAN, stand type', 'ELECTRIC FAN, stand type', 'unit', 1583.4, 'HEATING AND VENTILATION AND AIR CIRCULATION', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('40101604-EF-W01', NULL, 'ELECTRIC FAN, wall mount', 'ELECTRIC FAN, wall mount', 'unit', 915.21, 'HEATING AND VENTILATION AND AIR CIRCULATION', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43211507-DSK001', NULL, 'DESKTOP, for Basic Users', 'DESKTOP, for Basic Users', 'unit', 25165.5, 'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43211507-DSK002', NULL, 'DESKTOP, for Mid-Range Users', 'DESKTOP, for Mid-Range Users', 'unit', 43026.26, 'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43201827-HD-X02', NULL, 'EXTERNAL HARD DRIVE', 'EXTERNAL HARD DRIVE', 'unit', 3060.18, 'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43202010-FD-U04', NULL, 'FLASH DRIVE', 'FLASH DRIVE', 'piece', 155.04, 'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43211503-LAP001', NULL, 'LAPTOP COMPUTER, Mid-range', 'LAPTOP COMPUTER, Mid-range', 'unit', 43015.7, 'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43211503-LAP002', NULL, 'LAPTOP COMPUTER, Lightweight', 'LAPTOP COMPUTER, Lightweight', 'unit', 47502, 'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43211708-MO-O02', NULL, 'COMPUTER MOUSE, Wireless', 'COMPUTER MOUSE, Wireless', 'unit', 161.79, 'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43212105-PR-L01', NULL, 'PRINTER, Laser, Monochrome', 'PRINTER, Laser, Monochrome', 'unit', 9339.95, 'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('39101628-LB-L01', NULL, 'LIGHT-EMITTING DIODE (LED) LIGHT BULB, 7 watts', 'LIGHT-EMITTING DIODE (LED) LIGHT BULB, 7 watts', 'piece', 76.74, 'LIGHTING AND FIXTURES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('39101628-LT-L01', NULL, 'LIGHT-EMITTING DIODE (LED) LINEAR TUBE, 18 watts', 'LIGHT-EMITTING DIODE (LED) LINEAR TUBE, 18 watts', 'piece', 208.9, 'LIGHTING AND FIXTURES AND ACCESSORIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31201610-GL-J01', NULL, 'GLUE, all-purpose', 'GLUE, all-purpose', 'bottle', 63.07, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31151804-SW-H01', NULL, 'STAPLE WIRE, heavy duty (binder type), 23/13', 'STAPLE WIRE, heavy duty (binder type), 23/13', 'box', 36.95, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31151804-SW-S01', NULL, 'STAPLE WIRE, standard', 'STAPLE WIRE, standard', 'box', 28.5, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31201502-TA-E01', NULL, 'TAPE, electrical', 'TAPE, electrical', 'roll', 19.74, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31201503-TA-M01', NULL, 'TAPE, masking, 24mm', 'TAPE, masking, 24mm', 'roll', 59.11, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31201503-TA-M02', NULL, 'TAPE, masking, 48 mm', 'TAPE, masking, 48 mm', 'roll', 140.39, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31201517-TA-P01', NULL, 'TAPE, packaging, 48 mm', 'TAPE, packaging, 48 mm', 'roll', 29.56, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31201512-TA-T01', NULL, 'TAPE, transparent, 24mm', 'TAPE, transparent, 24mm', 'roll', 17.95, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31201512-TA-T02', NULL, 'TAPE, transparent, 48 mm', 'TAPE, transparent, 48 mm', 'roll', 29.56, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('31151507-TW-P01', NULL, 'TWINE, plastic', 'TWINE, plastic', 'roll', 71.78, 'MANUFACTURING COMPONENTS AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('41111604-RU-P02', NULL, 'RULER, plastic, 450mm', 'RULER, plastic, 450mm', 'piece', 20.23, 'MEASURING AND OBSERVING AND TESTING EQUIPMENT', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121612-BL-H01', NULL, 'BLADE, for general purpose cutter/utility knife', 'BLADE, for general purpose cutter/utility knife', 'tube', 16.62, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44101602-PB-M01', NULL, 'BINDING AND PUNCHING MACHINE', 'BINDING AND PUNCHING MACHINE', 'unit', 13287.89, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122037-RB-P10', NULL, 'BINDING RING/COMB, plastic, 32 mm', 'BINDING RING/COMB, plastic, 32 mm', 'bundle', 222.49, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44101807-CA-C01', NULL, 'CALCULATOR, Compact', 'CALCULATOR, Compact', 'unit', 220.49, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121710-CH-W01', NULL, 'CHALK, white enamel', 'CHALK, white enamel', 'box', 33.46, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122105-BF-C01', NULL, 'CLIP, backfold, 19mm', 'CLIP, backfold, 19mm', 'box', 11.29, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122105-BF-C02', NULL, 'CLIP, backfold, 25mm', 'CLIP, backfold, 25mm', 'box', 19.91, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122105-BF-C03', NULL, 'CLIP, backfold, 32mm', 'CLIP, backfold, 32mm', 'box', 29.35, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122105-BF-C04', NULL, 'CLIP, backfold, 50mm', 'CLIP, backfold, 50mm', 'box', 63.83, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121801-CT-R02', NULL, 'CORRECTION TAPE', 'CORRECTION TAPE', 'piece', 19.48, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121612-CU-H01', NULL, 'CUTTER/UTILITY KNIFE, HEAVY DUTY', 'CUTTER/UTILITY KNIFE, HEAVY DUTY', 'piece', 30.08, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44111515-DF-B01', NULL, 'DATA FILE BOX', 'DATA FILE BOX', 'piece', 151.25, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122011-DF-F01', NULL, 'DATA FOLDER', 'DATA FOLDER', 'piece', 101.34, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103202-DS-M01', NULL, 'DATER STAMP', 'DATER STAMP', 'piece', 432.16, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121506-EN-D01', NULL, 'ENVELOPE, Documentary, A4', 'ENVELOPE, Documentary, A4', 'box', 860.31, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121506-EN-D02', NULL, 'ENVELOPE, Documentary, legal,', 'ENVELOPE, Documentary, legal,', 'box', 1033.38, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121506-EN-X01', NULL, 'ENVELOPE, Expanding, Kraft', 'ENVELOPE, Expanding, Kraft', 'box', 975.37, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121506-EN-X02', NULL, 'ENVELOPE, Expanding, Plastic', 'ENVELOPE, Expanding, Plastic', 'piece', 30.95, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121506-EN-M02', NULL, 'ENVELOPE, Mailing', 'ENVELOPE, Mailing', 'box', 467.42, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121504-EN-W02', NULL, 'ENVELOPE, Mailing, with window', 'ENVELOPE, Mailing, with window', 'box', 531.81, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44111912-ER-B01', NULL, 'ERASER, felt, for blackboard/whiteboard', 'ERASER, felt, for blackboard/whiteboard', 'piece', 14.69, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122118-FA-P01', NULL, 'FASTENER, METAL, NON-SHARP EDGES', 'FASTENER, METAL, NON-SHARP EDGES', 'box', 96.06, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44111515-FO-X01', NULL, 'FILE ORGANIZER', 'FILE ORGANIZER', 'piece', 129.31, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122018-FT-D01', NULL, 'FILE TAB DIVIDER, A4', 'FILE TAB DIVIDER, A4', 'set', 11.29, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122018-FT-D02', NULL, 'FILE TAB DIVIDER, Legal', 'FILE TAB DIVIDER, Legal', 'set', 14.44, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122011-FO-F01', NULL, 'FOLDER, MOROCCO WITH SLIDE, A4', 'FOLDER, MOROCCO WITH SLIDE, A4', 'bundle', 274.46, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122011-FO-F02', NULL, 'FOLDER, MOROCCO WITH SLIDE, LEGAL', 'FOLDER, MOROCCO WITH SLIDE, LEGAL', 'bundle', 306.12, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122011-FO-L01', NULL, 'FOLDER, L-type, A4', 'FOLDER, L-type, A4', 'pack', 192.44, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122011-FO-L02', NULL, 'FOLDER, L-type, Legal', 'FOLDER, L-type, Legal', 'pack', 252.82, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122027-FO-P01', NULL, 'FOLDER, pressboard', 'FOLDER, pressboard', 'box', 1979.25, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122011-FO-T01', NULL, 'FOLDER with tab, A4', 'FOLDER with tab, A4', 'pack', 385.29, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122011-FO-T02', NULL, 'FOLDER with tab, Legal', 'FOLDER with tab, Legal', 'pack', 420.13, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122008-IT-T01', NULL, 'INDEX TAB', 'INDEX TAB', 'box', 69.44, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121716-MA-F01', NULL, 'MARKER, Flourescent', 'MARKER, Flourescent', 'set', 31.57, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121708-MP-B01', NULL, 'MARKER, Permanent, Black', 'MARKER, Permanent, Black', 'piece', 15.83, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121708-MP-B02', NULL, 'MARKER, Permanent, Blue', 'MARKER, Permanent, Blue', 'piece', 15.32, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121708-MP-B03', NULL, 'MARKER, Permanent, Red', 'MARKER, Permanent, Red', 'piece', 15.13, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121708-MW-B01', NULL, 'MARKER, Whiteboard, Black', 'MARKER, Whiteboard, Black', 'piece', 22.17, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121708-MW-B02', NULL, 'MARKER, Whiteboard, Blue', 'MARKER, Whiteboard, Blue', 'piece', 22.17, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121708-MW-B03', NULL, 'MARKER, Whiteboard, Red', 'MARKER, Whiteboard, Red', 'piece', 22.17, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122104-PC-G01', NULL, 'PAPER CLIP, vinly/plastic coated, 33mm', 'PAPER CLIP, vinly/plastic coated, 33mm', 'box', 8.97, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122104-PC-J02', NULL, 'PAPER CLIP, vinly/plastic coated, jumbo, 50mm', 'PAPER CLIP, vinly/plastic coated, jumbo, 50mm', 'box', 19.53, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44101603-PS-M02', NULL, 'PAPER SHREDDER', 'PAPER SHREDDER', 'unit', 16349.13, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44101601-PT-M02', NULL, 'PAPER TRIMMER/CUTTING MACHINE', 'PAPER TRIMMER/CUTTING MACHINE', 'unit', 10021.87, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121706-PE-L01', NULL, 'PENCIL, lead/graphite, with eraser', 'PENCIL, lead/graphite, with eraser', 'box', 45.38, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121619-PS-M01', NULL, 'PENCIL SHARPENER', 'PENCIL SHARPENER', 'piece', 241.73, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44101602-PU-P01', NULL, 'PUNCHER, paper, heavy duty', 'PUNCHER, paper, heavy duty', 'piece', 156.76, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44122101-RU-B01', NULL, 'RUBBER BAND No. 18', 'RUBBER BAND No. 18', 'box', 146.73, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121905-SP-F01', NULL, 'STAMP PAD, felt', 'STAMP PAD, felt', 'piece', 40.51, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121618-SS-S01', NULL, 'SCISSORS, symmetrical/asymmetrical', 'SCISSORS, symmetrical/asymmetrical', 'pair', 37.23, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121615-ST-S01', NULL, 'STAPLER, standard type', 'STAPLER, standard type', 'piece', 200.56, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121615-ST-B01', NULL, 'STAPLER, heavy duty (binder)', 'STAPLER, heavy duty (binder)', 'unit', 597.87, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121613-SR-P02', NULL, 'STAPLE REMOVER, plier-type', 'STAPLE REMOVER, plier-type', 'piece', 35.89, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44121605-TD-T01', NULL, 'TAPE DISPENSER, table top', 'TAPE DISPENSER, table top', 'unit', 78.52, 'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111525-CA-A01', NULL, 'CARTOLINA, assorted colors', 'CARTOLINA, assorted colors', 'pack', 84.98, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111506-CF-L11', NULL, 'COMPUTER CONTINUOUS FORM, 1 ply, 280mm x 241mm', 'COMPUTER CONTINUOUS FORM, 1 ply, 280mm x 241mm', 'box', 985.93, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111506-CF-L12', NULL, 'COMPUTER CONTINUOUS FORM, 1 ply, 280mm x 378mm', 'COMPUTER CONTINUOUS FORM, 1 ply, 280mm x 378mm', 'box', 1817.22, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111514-NP-S02', NULL, 'NOTEPAD, stick-on, 50mm x 76mm', 'NOTEPAD, stick-on, 50mm x 76mm', 'pad', 37.61, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111514-NP-S04', NULL, 'NOTEPAD, stick-on, 76mm x 100mm', 'NOTEPAD, stick-on, 76mm x 100mm', 'pad', 60.17, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111514-NP-S03', NULL, 'NOTEPAD, stick-on, 76mm x 76mm', 'NOTEPAD, stick-on, 76mm x 76mm', 'pad', 52.78, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111514-NB-S02', NULL, 'STENO NOTEBOOK', 'STENO NOTEBOOK', 'piece', 11.45, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111507-PP-M01', NULL, 'PAPER, MULTICOPY A4', 'PAPER, MULTICOPY A4', 'ream', 213.86, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111507-PP-M02', NULL, 'PAPER, MULTICOPY LEGAL', 'PAPER, MULTICOPY LEGAL', 'ream', 227.64, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111507-PP-C01', NULL, 'PAPER, MULTIPURPOSE A4', 'PAPER, MULTIPURPOSE A4', 'ream', 139.8, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111507-PP-C02', NULL, 'PAPER, MULTIPURPOSE LEGAL', 'PAPER, MULTIPURPOSE LEGAL', 'ream', 161.3, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111531-PP-R01', NULL, 'PAD PAPER, ruled', 'PAD PAPER, ruled', 'pad', 43.79, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111503-PA-P01', NULL, 'PAPER, parchment', 'PAPER, parchment', 'box', 156.52, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111531-RE-B01', NULL, 'RECORD BOOK, 300 PAGES', 'RECORD BOOK, 300 PAGES', 'book', 93.07, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111531-RE-B02', NULL, 'RECORD BOOK, 500 PAGES', 'RECORD BOOK, 500 PAGES', 'book', 126.43, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111704-TT-P04', NULL, 'TISSUE, INTERFOLDED PAPER TOWEL', 'TISSUE, INTERFOLDED PAPER TOWEL', 'pack', 34.31, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('14111704-TT-P02', NULL, 'TOILET TISSUE PAPER, 2 ply', 'TOILET TISSUE PAPER, 2 ply', 'pack', 100.88, 'PAPER MATERIALS AND PRODUCTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('53131626-HS-S01', NULL, 'HAND SANITIZER', 'HAND SANITIZER', 'bottle', 84.45, 'PERFUMES OR COLOGNES OR FRAGRANCES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('10191509-IN-A01', NULL, 'INSECTICIDE', 'INSECTICIDE', 'can', 260.47, 'PESTICIDES OR PEST REPELLENTS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('55101524-RA-H01', NULL, 'HANDBOOK ON PHILIPPINE GOVERNMENT PROCUREMENT (RA 9184 and its IRR)', 'HANDBOOK ON PHILIPPINE GOVERNMENT PROCUREMENT (RA 9184 and its IRR)', 'book', 37.77, 'PRINTED PUBLICATIONS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103109-BR-D05', NULL, 'DRUM CARTRIDGE, BROTHER DR-3455, Black', 'DRUM CARTRIDGE, BROTHER DR-3455, Black', 'cart', 7051.41, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103105-EP-M17', NULL, 'INK CARTRIDGE, EPSON C13T664300 (T6643), Magenta', 'INK CARTRIDGE, EPSON C13T664300 (T6643), Magenta', 'cart', 245.83, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103105-EP-Y17', NULL, 'INK CARTRIDGE, EPSON C13T664400 (T6644), Yellow', 'INK CARTRIDGE, EPSON C13T664400 (T6644), Yellow', 'cart', 245.83, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103105-HP-B20', NULL, 'INK CARTRIDGE, HP CH561WA (HP61), Black', 'INK CARTRIDGE, HP CH561WA (HP61), Black', 'cart', 878.26, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103105-HX-M43', NULL, 'INK CARTRIDGE, HP CN047AA (HP951XL), Magenta', 'INK CARTRIDGE, HP CN047AA (HP951XL), Magenta', 'cart', 1540.12, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103105-HP-T36', NULL, 'INK CARTRIDGE, HP CN693AA (HP704), Tri-color', 'INK CARTRIDGE, HP CN693AA (HP704), Tri-color', 'cart', 425.41, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103105-HP-B33', NULL, 'INK CARTRIDGE, HP CZ107AA (HP678), Black', 'INK CARTRIDGE, HP CZ107AA (HP678), Black', 'cart', 410.63, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103105-HP-T33', NULL, 'INK CARTRIDGE, HP CZ108AA (HP678), Tri-color', 'INK CARTRIDGE, HP CZ108AA (HP678), Tri-color', 'cart', 410.63, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103112-EP-R05', NULL, 'RIBBON CARTRIDGE, EPSON C13S015516 (#8750), Black', 'RIBBON CARTRIDGE, EPSON C13S015516 (#8750), Black', 'cart', 78.59, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103112-EP-R13', NULL, 'RIBBON CARTRIDGE, EPSON C13S015632, Black', 'RIBBON CARTRIDGE, EPSON C13S015632, Black', 'cart', 79.11, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103112-EP-R07', NULL, 'RIBBON CARTRIDGE, EPSON C13S015531 (S015086)', 'RIBBON CARTRIDGE, EPSON C13S015531 (S015086)', 'cart', 830.76, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-BR-B09', NULL, 'TONER CARTRIDGE, BROTHER TN-3320, Black', 'TONER CARTRIDGE, BROTHER TN-3320, Black', 'cart', 3620.71, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-BR-B11', NULL, 'TONER CARTRIDGE, BROTHER TN-3350, Black', 'TONER CARTRIDGE, BROTHER TN-3350, Black', 'cart', 5077.44, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-BR-B15', NULL, 'TONER CARTRIDGE, BROTHER TN-3478, Black', 'TONER CARTRIDGE, BROTHER TN-3478, Black', 'cart', 5659.07, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-BR-B16', NULL, 'TONER CARTRIDGE, BROTHER TN-456 Black, High Yield', 'TONER CARTRIDGE, BROTHER TN-456 Black, High Yield', 'cart', 4633.03, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-BR-C03', NULL, 'TONER CARTRIDGE, BROTHER TN-456 Cyan, High Yield', 'TONER CARTRIDGE, BROTHER TN-456 Cyan, High Yield', 'cart', 7832.55, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-BR-M03', NULL, 'TONER CARTRIDGE, BROTHER TN-456 Magenta, High Yield', 'TONER CARTRIDGE, BROTHER TN-456 Magenta, High Yield', 'cart', 7832.55, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-BR-Y03', NULL, 'TONER CARTRIDGE, BROTHER TN-456 Yellow, High Yield', 'TONER CARTRIDGE, BROTHER TN-456 Yellow, High Yield', 'cart', 7832.55, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-CA-B00', NULL, 'TONER CARTRIDGE, CANON CRG-324 II', 'TONER CARTRIDGE, CANON CRG-324 II', 'cart', 14145.04, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B12', NULL, 'TONER CARTRIDGE, HP CB435A, Black', 'TONER CARTRIDGE, HP CB435A, Black', 'cart', 3490.87, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B18', NULL, 'TONER CARTRIDGE, HP CE255A, Black', 'TONER CARTRIDGE, HP CE255A, Black', 'cart', 7820.94, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B21', NULL, 'TONER CARTRIDGE, HP CE278A, Black', 'TONER CARTRIDGE, HP CE278A, Black', 'cart', 4215.01, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B22', NULL, 'TONER CARTRIDGE, HP CE285A (HP85A), Black', 'TONER CARTRIDGE, HP CE285A (HP85A), Black', 'cart', 3652.38, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B23', NULL, 'TONER CARTRIDGE, HP CE310A, Black', 'TONER CARTRIDGE, HP CE310A, Black', 'cart', 2647.44, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B28', NULL, 'TONER CARTRIDGE, HP CE505A, Black', 'TONER CARTRIDGE, HP CE505A, Black', 'cart', 4563.36, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B52', NULL, 'TONER CARTRIDGE, HP CF217A (HP17A), Black LaserJet', 'TONER CARTRIDGE, HP CF217A (HP17A), Black LaserJet', 'cart', 3242.8, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B56', NULL, 'TONER CARTRIDGE, HP CF281A (HP81A), Black LaserJet', 'TONER CARTRIDGE, HP CF281A (HP81A), Black LaserJet', 'cart', 8787.87, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B58', NULL, 'TONER CARTRIDGE, HP CF287A (HP87), Black', 'TONER CARTRIDGE, HP CF287A (HP87), Black', 'cart', 11072.19, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B60', NULL, 'TONER CARTRIDGE, HP CF350A, Black Laserjet', 'TONER CARTRIDGE, HP CF350A, Black Laserjet', 'cart', 2899.73, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-C60', NULL, 'TONER CARTRIDGE, HP CF351A, Cyan Laserjet', 'TONER CARTRIDGE, HP CF351A, Cyan Laserjet', 'cart', 2987.35, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-Y60', NULL, 'TONER CARTRIDGE, HP CF352A, Yellow Laserjet', 'TONER CARTRIDGE, HP CF352A, Yellow Laserjet', 'cart', 2987.35, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-M60', NULL, 'TONER CARTRIDGE, HP CF353A, Magenta Laserjet', 'TONER CARTRIDGE, HP CF353A, Magenta Laserjet', 'cart', 2987.35, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B62', NULL, 'TONER CARTRIDGE, HP CF400A (HP201A), Black LaserJet', 'TONER CARTRIDGE, HP CF400A (HP201A), Black LaserJet', 'cart', 3490.87, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-M62', NULL, 'TONER CARTRIDGE, HP CF403A (HP201A), Magenta LaserJet', 'TONER CARTRIDGE, HP CF403A (HP201A), Magenta LaserJet', 'cart', 4124.23, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-M63', NULL, 'TONER CARTRIDGE, HP CF413A (HP410A), Magenta', 'TONER CARTRIDGE, HP CF413A (HP410A), Magenta', 'cart', 5675.96, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B34', NULL, 'TONER CARTRIDGE, HP Q2612A, Black', 'TONER CARTRIDGE, HP Q2612A, Black', 'cart', 4218.18, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('44103103-HP-B48', NULL, 'TONER CARTRIDGE, HP Q7553A, Black', 'TONER CARTRIDGE, HP Q7553A, Black', 'cart', 4750.2, 'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43231513-SFT-001', NULL, 'Business function specific software', 'Business function specific software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43231602-SFT-002', NULL, 'Finance accounting and enterprise resource planning ERP software', 'Finance accounting and enterprise resource planning ERP software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232004-SFT-003', NULL, 'Interactive or entertainment software', 'Interactive or entertainment software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232107-SFT-004', NULL, 'Content authoring and editing software', 'Content authoring and editing software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232202-SFT-005', NULL, 'Content management software', 'Content management software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232304-SFT-006', NULL, 'Data management and query software', 'Data management and query software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232402-SFT-007', NULL, 'Development software', 'Development software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232505-SFT-008', NULL, 'Educational or reference software', 'Educational or reference software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232603-SFT-009', NULL, 'Industry specific software', 'Industry specific software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43233501-SFT-016', NULL, 'Information exchange software', 'Information exchange software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232701-SFT-010', NULL, 'Network applications software', 'Network applications software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232802-SFT-011', NULL, 'Network management software', 'Network management software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43232905-SFT-012', NULL, 'Networking software', 'Networking software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43233004-SFT-013', NULL, 'Operating environment software', 'Operating environment software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43233205-SFT-014', NULL, 'Security and protection software', 'Security and protection software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('43233405-SFT-015', NULL, 'Utility and device driver software', 'Utility and device driver software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-066', NULL, 'Electrical Equipment Software', 'Electrical Equipment Software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-067', NULL, 'System Management Software', 'System Management Software', 'license', 0, 'SOFTWARE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-051', NULL, 'AIRLINE TICKETS (DOMESTIC)', 'AIRLINE TICKETS (DOMESTIC)', 'ticket', 0, 'AIRLINE TICKETS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-052', NULL, 'AIRLINE TICKETS (INTERNATIONAL)', 'AIRLINE TICKETS (INTERNATIONAL)', 'ticket', 0, 'AIRLINE TICKETS', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-060', NULL, 'ALL-TERRAIN VEHICLE (ATV)', 'ALL-TERRAIN VEHICLE (ATV)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-068', NULL, 'ALTERNATE FUELED VEHICLE (AFV)', 'ALTERNATE FUELED VEHICLE (AFV)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-061', NULL, 'ASSEMBLED OWNER-TYPE JEEP', 'ASSEMBLED OWNER-TYPE JEEP', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-062', NULL, 'ASSEMBLED PASSENGER JEEPNEY-TYPE VEHICLE', 'ASSEMBLED PASSENGER JEEPNEY-TYPE VEHICLE', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-BU-V01', NULL, 'BUS (ENTRY LEVEL)', 'BUS (ENTRY LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-BU-V02', NULL, 'BUS (MID LEVEL)', 'BUS (MID LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-BU-V03', NULL, 'BUS (TOP LEVEL)', 'BUS (TOP LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-CA-V01', NULL, 'CAR (SEDAN OR HATCHBACK) (ENTRY LEVEL)', 'CAR (SEDAN OR HATCHBACK) (ENTRY LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-CA-V02', NULL, 'CAR (SEDAN OR HATCHBACK) (MID LEVEL)', 'CAR (SEDAN OR HATCHBACK) (MID LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-CA-V03', NULL, 'CAR (SEDAN OR HATCHBACK) (TOP LEVEL)', 'CAR (SEDAN OR HATCHBACK) (TOP LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-MI-V01', NULL, 'MINI BUS (ENTRY LEVEL)', 'MINI BUS (ENTRY LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-MI-V02', NULL, 'MINI BUS (MID LEVEL)', 'MINI BUS (MID LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-MI-V03', NULL, 'MINI BUS (TOP LEVEL)', 'MINI BUS (TOP LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-063', NULL, 'MOTORCYCLE', 'MOTORCYCLE', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-MU-V01', NULL, 'MULTI-PURPOSE VEHICLE (MPV)', 'MULTI-PURPOSE VEHICLE (MPV)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-PA-V01', NULL, 'PASSENGER VAN (ENTRY LEVEL)', 'PASSENGER VAN (ENTRY LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-PA-V02', NULL, 'PASSENGER VAN (MID LEVEL)', 'PASSENGER VAN (MID LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-PA-V03', NULL, 'PASSENGER VAN (TOP LEVEL)', 'PASSENGER VAN (TOP LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-PI-V01', NULL, 'PICK-UP TRUCK (ENTRY LEVEL)', 'PICK-UP TRUCK (ENTRY LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-PI-V02', NULL, 'PICK-UP TRUCK (MID LEVEL)', 'PICK-UP TRUCK (MID LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-PI-V03', NULL, 'PICK-UP TRUCK (TOP LEVEL)', 'PICK-UP TRUCK (TOP LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-SP-V01', NULL, 'SPORTS UTILITY VEHICLE (ENTRY LEVEL)', 'SPORTS UTILITY VEHICLE (ENTRY LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-SP-V03', NULL, 'SPORTS UTILITY VEHICLE (TOP LEVEL)', 'SPORTS UTILITY VEHICLE (TOP LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-058', NULL, 'TRI-WHEEL VEHICLE', 'TRI-WHEEL VEHICLE', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-UT-V01', NULL, 'UTILITY VAN (ENTRY LEVEL)', 'UTILITY VAN (ENTRY LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-UT-V02', NULL, 'UTILITY VAN (MID LEVEL)', 'UTILITY VAN (MID LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('25101503-UT-V03', NULL, 'UTILITY VAN (TOP LEVEL)', 'UTILITY VAN (TOP LEVEL)', 'unit', 0, 'MOTOR VEHICLE', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-069', NULL, 'CLOUD COMPUTING SERVICES', 'CLOUD COMPUTING SERVICES', 'license', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-072', NULL, 'AIR CONDITIONING UNIT, 1.0 HP, CEILING TYPE', 'AIR CONDITIONING UNIT, 1.0 HP, CEILING TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-078', NULL, 'AIR CONDITIONING UNIT, 1.0 HP, SPLIT TYPE', 'AIR CONDITIONING UNIT, 1.0 HP, SPLIT TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-075', NULL, 'AIR CONDITIONING UNIT, 1.0 HP, WALL TYPE', 'AIR CONDITIONING UNIT, 1.0 HP, WALL TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-011', NULL, 'AIR CONDITIONING UNIT, 1.0 HP, WINDOW TYPE', 'AIR CONDITIONING UNIT, 1.0 HP, WINDOW TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-073', NULL, 'AIR CONDITIONING UNIT, 1.5 HP, CEILING TYPE', 'AIR CONDITIONING UNIT, 1.5 HP, CEILING TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-079', NULL, 'AIR CONDITIONING UNIT, 1.5 HP, SPLIT TYPE', 'AIR CONDITIONING UNIT, 1.5 HP, SPLIT TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-076', NULL, 'AIR CONDITIONING UNIT, 1.5 HP, WALL TYPE', 'AIR CONDITIONING UNIT, 1.5 HP, WALL TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-070', NULL, 'AIR CONDITIONING UNIT, 1.5 HP, WINDOW TYPE', 'AIR CONDITIONING UNIT, 1.5 HP, WINDOW TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-074', NULL, 'AIR CONDITIONING UNIT, 2.0 HP, CEILING TYPE', 'AIR CONDITIONING UNIT, 2.0 HP, CEILING TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-080', NULL, 'AIR CONDITIONING UNIT, 2.0 HP, SPLIT TYPE', 'AIR CONDITIONING UNIT, 2.0 HP, SPLIT TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-077', NULL, 'AIR CONDITIONING UNIT, 2.0 HP, WALL TYPE', 'AIR CONDITIONING UNIT, 2.0 HP, WALL TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-071', NULL, 'AIR CONDITIONING UNIT, 2.0 HP, WINDOW TYPE', 'AIR CONDITIONING UNIT, 2.0 HP, WINDOW TYPE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-103', NULL, 'AIR COOLER', 'AIR COOLER', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-036', NULL, 'AMPLIFIER', 'AMPLIFIER', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-104', NULL, 'ARROW FLAG (SIGN HERE)', 'ARROW FLAG (SIGN HERE)', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-032', NULL, 'AUTOMOTIVE BATTERIES', 'AUTOMOTIVE BATTERIES', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-001', NULL, 'BALLPOINT PEN, EXTRA FINE TIP', 'BALLPOINT PEN, EXTRA FINE TIP', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-081', NULL, 'BALLPOINT PEN, FINE TIP', 'BALLPOINT PEN, FINE TIP', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-082', NULL, 'BALLPOINT PEN, MEDIUM TIP', 'BALLPOINT PEN, MEDIUM TIP', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-007', NULL, 'BLEACHING SOLUTION', 'BLEACHING SOLUTION', 'bottle', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-044', NULL, 'BLUETOOTH SPEAKER', 'BLUETOOTH SPEAKER', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-023', NULL, 'BOND PAPER', 'BOND PAPER', 'ream', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-083', NULL, 'CCTV CAMERA', 'CCTV CAMERA', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-008', NULL, 'CERTIFICATE FRAME', 'CERTIFICATE FRAME', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-084', NULL, 'CERTIFICATE HOLDER, DOUBLE-SIDED, A4', 'CERTIFICATE HOLDER, DOUBLE-SIDED, A4', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-009', NULL, 'CERTIFICATE HOLDER, SINGLE-SIDED, A4', 'CERTIFICATE HOLDER, SINGLE-SIDED, A4', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-035', NULL, 'COMPACT DISC', 'COMPACT DISC', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-014', NULL, 'CONFERENCE MICROPHONE', 'CONFERENCE MICROPHONE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-085', NULL, 'CONFERENCE SPEAKERPHONE', 'CONFERENCE SPEAKERPHONE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-028', NULL, 'DEODORANT CAKE', 'DEODORANT CAKE', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-016', NULL, 'DISHWASHING LIQUID', 'DISHWASHING LIQUID', 'bottle', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-087', NULL, 'DISPOSABLE GLOVES, LARGE', 'DISPOSABLE GLOVES, LARGE', 'box', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-086', NULL, 'DISPOSABLE GLOVES, NITRILE, MEDIUM', 'DISPOSABLE GLOVES, NITRILE, MEDIUM', 'box', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-029', NULL, 'DISPOSABLE GLOVES, NITRILE, SMALL', 'DISPOSABLE GLOVES, NITRILE, SMALL', 'box', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-039', NULL, 'DOCUMENT SCANNER', 'DOCUMENT SCANNER', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-025', NULL, 'DOOR MAT', 'DOOR MAT', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-005', NULL, 'DOUBLE-SIDED TAPE, FOAM, 12mm', 'DOUBLE-SIDED TAPE, FOAM, 12mm', 'roll', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-088', NULL, 'DOUBLE-SIDED TAPE, FOAM, 24mm', 'DOUBLE-SIDED TAPE, FOAM, 24mm', 'roll', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-089', NULL, 'DOUBLE-SIDED TAPE, TISSUE, 12mm', 'DOUBLE-SIDED TAPE, TISSUE, 12mm', 'roll', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-090', NULL, 'DOUBLE-SIDED TAPE, TISSUE, 24mm', 'DOUBLE-SIDED TAPE, TISSUE, 24mm', 'roll', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-047', NULL, 'DSLR CAMERA', 'DSLR CAMERA', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-020', NULL, 'EXTENSION CORD', 'EXTENSION CORD', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-091', NULL, 'EXTERNAL DRIVE, SOLID STATE DRIVE, 1TB', 'EXTERNAL DRIVE, SOLID STATE DRIVE, 1TB', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-050', NULL, 'FUEL FILTERS', 'FUEL FILTERS', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-042', NULL, 'GLUE GUN', 'GLUE GUN', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-027', NULL, 'GLUE STICK (FOR GLUE GUN)', 'GLUE STICK (FOR GLUE GUN)', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-092', NULL, 'GLUE STICK PASTE, 15g', 'GLUE STICK PASTE, 15g', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-026', NULL, 'GLUE STICK PASTE, 8g', 'GLUE STICK PASTE, 8g', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-105', NULL, 'INTERACTIVE/DIGITAL WHITEBOARD', 'INTERACTIVE/DIGITAL WHITEBOARD', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-046', NULL, 'KEYBOARD', 'KEYBOARD', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-003', NULL, 'LAMINATING FILM', 'LAMINATING FILM', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-049', NULL, 'LAMINATING MACHINE', 'LAMINATING MACHINE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-107', NULL, 'LAPTOP FOR CREATIVE AND TECHNICAL USE', 'LAPTOP FOR CREATIVE AND TECHNICAL USE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-108', NULL, 'LOGISTICS SERVICES', 'LOGISTICS SERVICES', 'lot', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-015', NULL, 'MEDAL', 'MEDAL', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-034', NULL, 'MOBILE PHONE', 'MOBILE PHONE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-002', NULL, 'MULTIFUNCTION PRINTER', 'MULTIFUNCTION PRINTER', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-030', NULL, 'OFFICE CHAIR', 'OFFICE CHAIR', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-033', NULL, 'PADLOCK, 40mm', 'PADLOCK, 40mm', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-093', NULL, 'PADLOCK, 50mm', 'PADLOCK, 50mm', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-021', NULL, 'PAINT', 'PAINT', 'gallon', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-022', NULL, 'PAPER, COLORED, A4', 'PAPER, COLORED, A4', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-094', NULL, 'PAPER, LAID', 'PAPER, LAID', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-031', NULL, 'PAPER, MANILA', 'PAPER, MANILA', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-041', NULL, 'PARACETAMOL', 'PARACETAMOL', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-006', NULL, 'PHOTO PAPER, MATTE', 'PHOTO PAPER, MATTE', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-095', NULL, 'PHOTO PAPER, SATIN', 'PHOTO PAPER, SATIN', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-038', NULL, 'PLASTIC ENVELOPE', 'PLASTIC ENVELOPE', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-017', NULL, 'PLASTIC FASTENER', 'PLASTIC FASTENER', 'box', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-045', NULL, 'POVIDONE IODINE', 'POVIDONE IODINE', 'bottle', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-096', NULL, 'PROFESSIONAL WIRELESS HEADSET', 'PROFESSIONAL WIRELESS HEADSET', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-024', NULL, 'PUSH PIN', 'PUSH PIN', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-097', NULL, 'SCHOOL CHAIR', 'SCHOOL CHAIR', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-012', NULL, 'SMART TELEVISION', 'SMART TELEVISION', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-018', NULL, 'STEEL FILING CABINET', 'STEEL FILING CABINET', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-048', NULL, 'STEEL RACK', 'STEEL RACK', 'set', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-004', NULL, 'STICKER PAPER, MATTE', 'STICKER PAPER, MATTE', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-037', NULL, 'STORAGE BOX, FOR LEGAL SIZE', 'STORAGE BOX, FOR LEGAL SIZE', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-098', NULL, 'TABLET COMPUTER', 'TABLET COMPUTER', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-010', NULL, 'UNINTERRUPTIBLE POWER SUPPLY, TOWER TYPE, 650VA', 'UNINTERRUPTIBLE POWER SUPPLY, TOWER TYPE, 650VA', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-019', NULL, 'VELLUM BOARD PAPER', 'VELLUM BOARD PAPER', 'pack', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-099', NULL, 'VIDEO CONFERENCING CAMERA', 'VIDEO CONFERENCING CAMERA', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-040', NULL, 'WATER DISPENSER', 'WATER DISPENSER', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-106', NULL, 'WATER FILTER/PURIFIER FOR FAUCET', 'WATER FILTER/PURIFIER FOR FAUCET', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-013', NULL, 'WHITEBOARD', 'WHITEBOARD', 'piece', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-100', NULL, 'WIFI EXTENDER', 'WIFI EXTENDER', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-101', NULL, 'WIRELESS MICROPHONE', 'WIRELESS MICROPHONE', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
  VALUES ('80141505-TS-102', NULL, 'WIRELESS PRESENTER', 'WIRELESS PRESENTER', 'unit', 0, 'CLOUD COMPUTING SERVICES', NULL, TRUE)
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    unit_price = EXCLUDED.unit_price,
    category = EXCLUDED.category,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;
