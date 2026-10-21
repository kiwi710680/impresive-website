/* Generated from "Sentinel Common Data Model v8.1.0 modify for PHDcenter.docx". */
window.IMPRESIVE_READINESS = {
 "source": "Modified Sentinel Common Data Model (mSCDM) 8.1.0 for PHDcenter",
 "tables": [
  {
   "id": "enrollment",
   "label": "Enrollment",
   "tier": "core",
   "description": "The mSCDM Enrollment Table has a start/stop structure that contains one record per continuous enrollment period. A unique combination of PatID, Enr_Start, and Enr_End identifies a unique record. A break in enrollment (of at least one day) or a change in either the medical or drug coverage variables should generate a new record. For the single-payer healthcare system, one patients would have only single record.",
   "variables": [
    {
     "name": "PatID",
     "type": "Num(#)",
     "values": "Unique patient identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary person-level identifier. Used to link across tables. A new enrollment period generates a new record, but the same person should have the same PatID on subsequent records. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" mSCDM Reference Table.",
     "example": "123456789",
     "essential": true
    },
    {
     "name": "Enr_Start",
     "type": "Num(4)",
     "values": "SAS date",
     "missingAllowed": "No",
     "definition": "Date of the beginning of the enrollment period. If the exact date is unknown, use the first day of the month. For the single-payer healthcare system, the 'Enr_Start' would be either the birth date or the start date of the database, whichever comes later.",
     "example": "1/1/2019",
     "essential": true
    },
    {
     "name": "Enr_End",
     "type": "Num(4)",
     "values": "SAS date",
     "missingAllowed": "No",
     "definition": "Date of the end of the enrollment period. If the exact date is unknown, use the last day of the month. For the single-payer healthcare system, the Enr_End date corresponds to either the date of death or the last date available in the database, whichever comes first.",
     "example": "12/31/2019",
     "essential": true
    }
   ]
  },
  {
   "id": "demographic",
   "label": "Demographic",
   "tier": "core",
   "description": "The mSCDM Demographic Table contains one record per PatID with the most recent information on Birth_Date, Sex, and Race.",
   "variables": [
    {
     "name": "PatID",
     "type": "Num(#)",
     "values": "Unique patient identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary person-level identifier. Used to link across tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "123456789",
     "essential": true
    },
    {
     "name": "Birth_Date",
     "type": "Num(4)",
     "values": "SAS date",
     "missingAllowed": "Yes",
     "definition": "Date of birth. If the exact date or month is unknown, use the first day of the month and first month of the year.",
     "example": "12/5/1971",
     "essential": true
    },
    {
     "name": "Sex",
     "type": "Char(1)",
     "values": "A = Ambiguous\nF = Female\nM = Male\nU = Unknown",
     "missingAllowed": "No",
     "definition": "Sex.",
     "example": "F",
     "essential": true
    },
    {
     "name": "Race",
     "type": "Char(1)",
     "values": "0 = Unknown\n1 = American Indian or Alaska Native (A person having origins in any of the original peoples of North and South America (including Central America), and who maintains tribal affiliation or community attachment.\n2 = Asian (A person having origins in any of the original peoples of the Far East, Southeast Asia, or the Indian subcontinent including, for example, Cambodia, China, India, Japan, Korea, Malaysia, Pakistan, the Philippine Islands, Thailand, and Vietnam.)\n3 = Black or African American (A person having origins in any of the black racial groups of Africa.)\n4 = Native Hawaiian or Other Pacific Islander (A person having origins in any of the original peoples of Hawaii, Guam, Samoa, or other Pacific Islands.)\n5 = White (A person having origins in any of the original peoples of Europe, the Middle East, or North Africa.)\nM = Multi-racial (A person who identifies with two or more races.)",
     "missingAllowed": "No",
     "definition": "Please use only one race value per patient.",
     "example": "2",
     "essential": false
    },
    {
     "name": "Orig_PatID",
     "type": "Char(#)",
     "values": "",
     "missingAllowed": "No",
     "definition": "Unique patient identifier in original database",
     "example": "D3&e$%2J6#",
     "essential": false
    }
   ]
  },
  {
   "id": "encounter",
   "label": "Encounter",
   "tier": "core",
   "description": "The mSCDM Encounter Table contains one record per EncounterID. Each encounter should have a single record in the SCDM Encounter Table. Each diagnosis and procedure recorded during the encounter should have a separate record in the Diagnosis or Procedure Tables. Rollback transactions and other adjustments should be processed before populating this table.\n• Conversion from Ambulatory or Emergency Visit (ED, AV, or OA) into Inpatient Hospital or Institutional Stay (IP, IS) through admission represents multiple encounters. The Ambulatory or Emergency Visit is one encounter, the Inpatient Hospital or Institutional Stay after admission is a second encounter.\n• Transfer from one facility to another facility starts a new encounter at the new facility.\n• If supported by Data Partner source data, multiple visits on the same day to the same facility, with no conversion from Ambulatory or Emergency Visit (ED, AV, or OA) into Inpatient Hospital or Institutional Stay (IP, IS) admission, should be created as distinct encounters and should include all diagnoses and procedures that were recorded during those separate visits, with distinct ProviderID values populated. If source data cannot identify distinct multiple visits on the same day, then populate as a single encounter.",
   "variables": [
    {
     "name": "PatID",
     "type": "Num(#)",
     "values": "Unique patient identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary person-level identifier. Used to link across tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "123456789",
     "essential": true
    },
    {
     "name": "EncounterID",
     "type": "Num(#)",
     "values": "Unique encounter identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary encounter-level identifier. Used to link across the Encounter, Diagnosis, Procedure, Vital Signs, and Prescribing tables. Use the fewest number of bytes necessary to hold all distinct values. Some encounterIDs for IP should be generated by multiple records in the native NHIRD data due to the long term hospitalization.\nUse the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "98765432159753",
     "essential": true
    },
    {
     "name": "ADate",
     "type": "Num(4)",
     "values": "SAS date",
     "missingAllowed": "No",
     "definition": "Encounter or admission date.",
     "example": "12/24/2019",
     "essential": true
    },
    {
     "name": "DDate",
     "type": "Num(4)",
     "values": "Valid Values:\nSAS Date\n.S: Special Missing\n.: Missing",
     "missingAllowed": "Yes, conditional on EncType value. If EncType = IP or IS, only SAS special missing .S is allowed.",
     "definition": "Discharge date. Should be populated for all Inpatient Hospital Stay (IP) and Non-Acute Institutional Stay (IS) encounter types. May be populated for Emergency Department (ED) encounter types. Should be missing for ambulatory visit (AV or OA) encounter types. For patients still in facility (IP or IS) use special missing value of .S.",
     "example": "12/31/2019",
     "essential": true
    },
    {
     "name": "EncType",
     "type": "Char(2)",
     "values": "AV = Ambulatory Visit (Includes visits at outpatient clinics, same day surgeries, urgent care visits, and other same-day ambulatory hospital encounters, but excludes Emergency Department encounters. Transfer from AV facility to an ED facility starts a new encounter at the new facility.)\nED = Emergency Department (Includes ED encounters that become inpatient stays through hospital admission. In this scenario, ED is one encounter, Inpatient Hospital Stay after admission from the ED is a second encounter. ED data should be identified before hospitalization data to ensure that ED with subsequent admission won't be rolled up in the hospital event. Transfer from one ED facility to another ED facility starts a new encounter at the new facility. Excludes urgent care visits.)\nIP = Inpatient Hospital Stay (Includes all inpatient stays, same-day hospital discharges, and other acute hospital care where the discharge is after the admission date. Transfer from one facility to another starts a new encounter at the new facility.)\nIS = Non-Acute Institutional Stay (Includes hospice, skilled nursing facility (SNF), rehab center, nursing home, residential, overnight non-hospital dialysis and other non-hospital stays. Transfer from one facility to another starts a new encounter at the new facility.)\nOA = Other Ambulatory Visit (Includes other non-overnight AV encounters such as hospice visits, home health visits, skilled nursing facility visits, other non-hospital visits, as well as telemedicine, telephone and email consultations.)\nPH = Pharmacy visit (Includes the dispensing visit to the contracted pharmacy)",
     "missingAllowed": "No",
     "definition": "Encounter Type",
     "example": "IP",
     "essential": true
    },
    {
     "name": "FacilityID",
     "type": "Num(#)",
     "values": "Servicing provider identifier",
     "missingAllowed": "No",
     "definition": "Local facility pseudoidentifier that identifies hospital or clinic in which the encounter occurred. There must be only one facility per encounter. Used for chart abstraction and validation. This variable links to the Facility table. If unavailable, set to special missing value .U.Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "45678",
     "essential": false
    },
    {
     "name": "Depart",
     "type": "Char(#)",
     "values": "Refer to FUNC_TYPE in NHIRD.OPDTE.\n' ' = Missing/ Blank",
     "missingAllowed": "Yes, conditional on EncType value",
     "definition": "The department for the encounter visit. Populate only for Ambulatory Visit (AV), Emergency Department (ED) or Other Ambulatory Visit (OA). The department for Inpatient Hospital Stay (IP) and Non-Acute Institutional Stay (IS) would be missing/blank in SCDM. If the admission-related information is required. Please trace back to raw dataset for further use.",
     "example": "AH",
     "essential": false
    }
   ]
  },
  {
   "id": "diagnosis",
   "label": "Diagnosis",
   "tier": "core",
   "description": "The mSCDM Diagnosis Table contains one record per unique combination of PatID, EncounterID, DX_CodeType, DX, and ProviderID. This table should capture all uniquely recorded diagnoses for all encounters, per provider.",
   "variables": [
    {
     "name": "PatID",
     "type": "Num(#)",
     "values": "Unique patient identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary person-level identifier. Used to link across tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "123456789",
     "essential": true
    },
    {
     "name": "EncounterID",
     "type": "Num(#)",
     "values": "Unique encounter identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary encounter-level identifier. Used to link across the Encounter, Diagnosis, Procedure, and Prescribing tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "98765432159753",
     "essential": true
    },
    {
     "name": "ADate",
     "type": "Num(4)",
     "values": "SAS date",
     "missingAllowed": "No",
     "definition": "Generally, it is the encounter or admission date matched to the ADate in the Encounter table. However, for the long-term hospitalization patients who had multiple records in NHIRD database, this ADates equal to the APPL_BEG_DATE in the native data.",
     "example": "12/24/2019",
     "essential": true
    },
    {
     "name": "ProviderID",
     "type": "Num(#)",
     "values": "Unique provider identifier",
     "missingAllowed": "No",
     "definition": "Identifier for the individual provider who made the diagnosis. As with the PatID, the ProviderID identifier is a pseudoidentifier with a consistent crosswalk to the real identifier. If an individual provider cannot be identified, populate the ProviderID value with special missing value of .U. This variable links to the Provider table. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "99218766",
     "essential": false
    },
    {
     "name": "DX",
     "type": "Char(#)",
     "values": "Diagnosis code",
     "missingAllowed": "No",
     "definition": "Use the fewest number of bytes to contain values for all values of DX_CodeType. The dots in DX are removed in NHIRD database when DX_CodeType is 09 or 10.",
     "example": "7615",
     "essential": true
    },
    {
     "name": "Dx_Codetype",
     "type": "Char(2)",
     "values": "09 = ICD-9-CM\n10 = ICD-10-CM\nTW = Taiwan domestic codes for diagnosis\nKR = Korea domestic codes for diagnosis\nHK = Hong Kong domestic codes for diagnosis\nJP = Japan domestic codes for diagnosis\nCG = Chang Gung domestic codes for diagnosis\nOT = Other",
     "missingAllowed": "No",
     "definition": "Diagnosis code type. This field combined with the DX field should be used to capture any type of diagnosis or clinical concept available in the source data. Other code types may be added as new terminologies are used.",
     "example": "09",
     "essential": true
    },
    {
     "name": "PDX",
     "type": "Char(1)",
     "values": "P = Principal\nS = Secondary\nX = Unable to Classify\n' ' = Missing/ Blank",
     "missingAllowed": "Yes, conditional on EncType value",
     "definition": "Principal diagnosis flag. Basically, populate for IP and IS encounters. However, populate for ED, AV, and OA is feasible if it is reasonable. Generally, one principal diagnosis is expected per Encounter; however, multiple principal diagnoses for some IP encounters were preserved in NHIRD after data conversion.",
     "example": "P",
     "essential": false
    }
   ]
  },
  {
   "id": "procedure",
   "label": "Procedure",
   "tier": "core",
   "description": "The mSCDM Procedure Table contains one record per unique combination of PatID, EncounterID, Px_CodeType, Px, and ProviderID. This table should capture all uniquely recorded procedures for all encounters, per provider.",
   "variables": [
    {
     "name": "PatID",
     "type": "Num(#)",
     "values": "Unique patient identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary person-level identifier. Used to link across tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "123456789",
     "essential": true
    },
    {
     "name": "EncounterID",
     "type": "Num(#)",
     "values": "Unique encounter identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary encounter-level identifier. Used to link across the Encounter, Diagnosis, Procedure, Vital Signs, Mother-Infant Linkage, Inpatient Pharmacy, Inpatient Transfusion, Prescribing, and Patient-Reported Measures Response tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "98765432159753",
     "essential": true
    },
    {
     "name": "ADate",
     "type": "Num(4)",
     "values": "SAS date",
     "missingAllowed": "No",
     "definition": "Generally, it is the encounter or admission date matched to the ADate in the Encounter table. However, for the long-term hospitalization patients who had multiple records in NHIRD database, this ADates equal to the APPL_BEG_DATE in the native data. In addition, when the PX_CodeType is TW, these would be the order date of the prescribing in NHIRD.",
     "example": "12/24/2019",
     "essential": true
    },
    {
     "name": "ProviderID",
     "type": "Num(#)",
     "values": "Unique provider identifier",
     "missingAllowed": "No",
     "definition": "Identifier for the individual provider who made the diagnosis. As with the PatID, the ProviderID identifier is a pseudoidentifier with a consistent crosswalk to the real identifier. If an individual provider cannot be identified, populate the ProviderID value with special missing value of .U. This variable links to the Provider table. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "99218766",
     "essential": false
    },
    {
     "name": "PX",
     "type": "Char(#)",
     "values": "Procedure code",
     "missingAllowed": "No",
     "definition": "Remove decimal points. Other codes should be listed as recorded in the source data. Use the fewest number of bytes to contain values for all values of Px_CodeType.",
     "example": "76815",
     "essential": true
    },
    {
     "name": "PX_CodeType",
     "type": "Char(2)",
     "values": "09 = ICD-9-PCS\n10 = ICD-10-PCS\nTW = Taiwan domestic codes for procedure\nKR = Korea domestic codes for procedure\nHK = Hong Kong domestic codes for procedure\nJP = Japan domestic codes for procedure\nCG = Chang Gung domestic codes for procedure\nOT = Other",
     "missingAllowed": "No",
     "definition": "Procedure code type.",
     "example": "C4",
     "essential": true
    }
   ]
  },
  {
   "id": "death",
   "label": "Death",
   "tier": "core",
   "description": "The mSCDM Death Table contains one record per PatID. When legacy data have conflicting reports, please make a local determination as to which to use.",
   "variables": [
    {
     "name": "PatID",
     "type": "Num(#)",
     "values": "Unique patient identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary person-level identifier. Used to link across tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "123456789",
     "essential": true
    },
    {
     "name": "DeathDt",
     "type": "Num(4)",
     "values": "SAS date",
     "missingAllowed": "No",
     "definition": "Date of death.",
     "example": "1/10/2019",
     "essential": true
    },
    {
     "name": "DtImpute",
     "type": "Char(1)",
     "values": "B = Both month and day imputed\nD = Day imputed\nM = Month imputed\nN = Not imputed",
     "missingAllowed": "No",
     "definition": "When DeathDt is imputed, this variable indicates which parts of the date were imputed.",
     "example": "N",
     "essential": false
    }
   ]
  },
  {
   "id": "cause-of-death",
   "label": "Cause of Death",
   "tier": "core",
   "description": "The mSCDM Cause of Death Table can contain multiple COD records per PatID. When legacy data have conflicting reports, please make a local determination as to which to use.",
   "variables": [
    {
     "name": "PatID",
     "type": "Num(#)",
     "values": "Unique patient identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary person-level identifier. Used to link across tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "123456789",
     "essential": true
    },
    {
     "name": "COD",
     "type": "Char(8)",
     "values": "Diagnosis code",
     "missingAllowed": "No",
     "definition": "Remove decimal points, site specific suffixes and prefixes.",
     "example": "J180",
     "essential": true
    },
    {
     "name": "CodeType",
     "type": "Char(2)",
     "values": "09 = ICD-9\n10 = ICD-10\nTW = Taiwan domestic codes for diagnosis\nKR = Korea domestic codes for diagnosis\nHK = Hong Kong domestic codes for diagnosis\nJP = Japan domestic codes for diagnosis\nCG = Chang Gung domestic codes for diagnosis\nOT = Other",
     "missingAllowed": "No",
     "definition": "Cause of death code type.",
     "example": "09",
     "essential": true
    }
   ]
  },
  {
   "id": "prescribing",
   "label": "Prescribing",
   "tier": "core",
   "description": "The mSCDM Prescribing Table contains one record per uniquely recorded prescription orders, as unique combination of PatID, OrderDate, Rx_CodeType, Rx, RxAmt and RxSup.",
   "variables": [
    {
     "name": "PatID",
     "type": "Num(#)",
     "values": "Unique patient identifier",
     "missingAllowed": "No",
     "definition": "Arbitrary person-level identifier. Used to link across tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "123456789",
     "essential": true
    },
    {
     "name": "EncounterID",
     "type": "Num(#)",
     "values": "Unique encounter identifier",
     "missingAllowed": "Yes",
     "definition": "Arbitrary encounter-level identifier. Used to link across the Encounter, Diagnosis, Procedure, and Prescribing tables. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "98765432159753",
     "essential": false
    },
    {
     "name": "ProviderID",
     "type": "Num(#)",
     "values": "Unique provider identifier or Special Missing .U for unknown",
     "missingAllowed": "No",
     "definition": "Provider code for the individual provider who prescribed the medication. The provider code is a pseudoidentifier with a consistent crosswalk to the real identifier and is the same set of pseudoidentifiers for ProviderID in other SCDM tables. If an individual provider can not be identified, populate the ProviderID value with special missing value of .U. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "99218766",
     "essential": false
    },
    {
     "name": "OrderDate",
     "type": "Num(4)",
     "values": "Valid SAS dates",
     "missingAllowed": "No",
     "definition": "Order date of the prescription by the provider",
     "example": "2/16/2011",
     "essential": true
    },
    {
     "name": "Rx_CodeType",
     "type": "Char(2)",
     "values": "TW = Taiwan domestic codes for drug\nKR = Korea domestic codes for drug\nHK = Hong Kong domestic codes for drug\nJP = Japan domestic codes for drug\nCG = Chang Gung domestic codes for drug\nOT = Other",
     "missingAllowed": "No",
     "definition": "Code type of prescribed medication or medical device. This field combined with the Rx field should be used to capture any type of prescribed medication or medical device available in the source data. Other code types may be added as new terminologies are used.",
     "example": "CG",
     "essential": true
    },
    {
     "name": "Rx",
     "type": "Char(#)",
     "values": "Drug Code",
     "missingAllowed": "No",
     "definition": "Code representing a prescribed medication or medical device. Please expunge any place holders (e.g., ‘-‘ or extra digit). Use the fewest number of bytes to contain values for all values of Rx_CodeType.",
     "example": "00006007431",
     "essential": true
    },
    {
     "name": "RxAmt",
     "type": "Num(4)",
     "values": "Positive integer values or Special Missing .U for unknown",
     "missingAllowed": "No",
     "definition": "Quantity ordered.",
     "example": "90",
     "essential": false
    },
    {
     "name": "RxSup",
     "type": "Num(4)",
     "values": "Positive integer values or Special Missing .U for unknown",
     "missingAllowed": "No",
     "definition": "Number of days’ supply ordered, as specified by the prescription.",
     "example": "90",
     "essential": true
    },
    {
     "name": "RxDoseForm",
     "type": "Char(40)",
     "values": "1: oral-related preparations\n2: injected-related preparations\n3: Topical-related preparations\n4: Ophthalmic, otic, and nasal preparations\n5: Rectal and vaginal preparations",
     "missingAllowed": "Yes",
     "definition": "The dosage form is represented by the 8th digit of the drug NHI code, consisting of a single character.",
     "example": "1",
     "essential": false
    }
   ]
  },
  {
   "id": "facility",
   "label": "Facility",
   "tier": "supporting",
   "description": "The mSCDM Facility Table contains one record per FacilityID, and Facility_year. This table should capture all uniquely recorded facility identifiers in the Encounter table.",
   "variables": [
    {
     "name": "FacilityID",
     "type": "Num(#)",
     "values": "Servicing facility identifier",
     "missingAllowed": "No",
     "definition": "Local facility pseudoidentifier that identifies hospital or clinic. Taken from facility claims. Used for chart abstraction and validation.",
     "example": "12345678",
     "essential": true
    },
    {
     "name": "Facility_Location",
     "type": "Char(#)",
     "values": "CITY codes",
     "missingAllowed": "Yes",
     "definition": "The CITY code in H_NHI_ HOSPBSC table. Should be left blank if missing.",
     "example": "0118",
     "essential": false
    },
    {
     "name": "Facility_level",
     "type": "Char(1)",
     "values": "Facility level codes",
     "missingAllowed": "Yes",
     "definition": "Extract the records from HOSP_CNT_TYPE in H_NHI_ HOSPBSC table",
     "example": "A",
     "essential": false
    },
    {
     "name": "Facility_year",
     "type": "Num(4)",
     "values": "The year",
     "missingAllowed": "No",
     "definition": "The year of the level is valid.",
     "example": "2015",
     "essential": true
    },
    {
     "name": "Orig_FacilityID",
     "type": "Char(#)",
     "values": "The original codes",
     "missingAllowed": "No",
     "definition": "The original facility ID in the database",
     "example": "A4#%#$df",
     "essential": false
    }
   ]
  },
  {
   "id": "provider",
   "label": "Provider",
   "tier": "supporting",
   "description": "The mSCDM Provider Table contains one record per ProviderID and Specialty. This table should capture all uniquely recorded individual provider identifiers in the Diagnosis, Procedure, and Prescribing tables.",
   "variables": [
    {
     "name": "ProviderID",
     "type": "Num(#)",
     "values": "Unique provider identifier",
     "missingAllowed": "No",
     "definition": "Identifier for the individual provider who wrote a prescription in the Prescribing table, was identified in a row in the Dispensing table, made a diagnosis in the Diagnosis table, or performed a procedure or service in the Procedure table. As with the PatID, the provider identifier is a pseudoidentifier with a consistent crosswalk to the real identifier. Use the fewest number of bytes necessary to hold all distinct values; see \"SAS Lengths\" Reference Table.",
     "example": "99218766",
     "essential": true
    },
    {
     "name": "Specialty",
     "type": "Char(#)",
     "values": "PROV_TYPE_ID",
     "missingAllowed": "No",
     "definition": "Code indicating the medical specialty of the Provider. If an individual provider has more than one specialty, keep all the specialty records. The original records is free text by Chinese.\nThe original records from PROV_TYPE_ID in table H_doh_speci",
     "example": "眼整形科",
     "essential": true
    },
    {
     "name": "Provider_year",
     "type": "Num(4)",
     "values": "The year",
     "missingAllowed": "No",
     "definition": "The year of the specialty is valid",
     "example": "2011",
     "essential": false
    },
    {
     "name": "Orig_ProviderID",
     "type": "Char(#)",
     "values": "The original codes",
     "missingAllowed": "No",
     "definition": "The original provider’s ID in original database",
     "example": "Ssl@$R@dm#fs",
     "essential": false
    }
   ]
  },
  {
   "id": "drug-strength",
   "label": "Drug_Strength",
   "tier": "supporting",
   "description": "The mSCDM Drug Strength Table contains one record per Rx and Ingred_ATC. The combination drugs, which contain more than 1 active ingredients, should be separated into multiple records by distinct ingredients. This table should capture specific medications required in study, as unique combination of Rx,  Rx_CodeType, and  Ingred_ATC.",
   "variables": [
    {
     "name": "Rx",
     "type": "Char(#)",
     "values": "Drug Code",
     "missingAllowed": "No",
     "definition": "Code representing a prescribed medication or medical device. Please expunge any place holders (e.g., ‘-‘ or extra digit). Use the fewest number of bytes to contain values for all values of Rx_CodeType.",
     "example": "A048562100",
     "essential": true
    },
    {
     "name": "Rx_CodeType",
     "type": "Char(2)",
     "values": "TW = Taiwan domestic codes for drug\nKR = Korea domestic codes for drug\nHK = Hong Kong domestic codes for drug\nJP = Japan domestic codes for drug\nCG = Chang Gung domestic codes for drug\nOT = Other",
     "missingAllowed": "No",
     "definition": "Code type of prescribed medication or medical device. This field combined with the Rx field should be used to capture any type of prescribed medication or medical device available in the source data. Other code types may be added as new terminologies are used.",
     "example": "TW",
     "essential": true
    },
    {
     "name": "Comb_Med",
     "type": "Char(1)",
     "values": "N = No\nY = Yes\nU = Unknown",
     "missingAllowed": "No",
     "definition": "Mark as Y if the medication product is a combination drug which contains more than 1 active ingredient.",
     "example": "Y",
     "essential": false
    },
    {
     "name": "Ingred_ATC",
     "type": "Char(7)",
     "values": "Value refer to WHO ATC or Special Missing .U for unknown",
     "missingAllowed": "No",
     "definition": "The WHO ATC code for the single active ingredient.",
     "example": "M01AH02",
     "essential": true
    },
    {
     "name": "Ingred_Dose",
     "type": "Num(8)",
     "values": "Values greater than zero or Special Missing .U for unknown",
     "missingAllowed": "No",
     "definition": "Dose of a given medication by the medication product.",
     "example": "120",
     "essential": false
    },
    {
     "name": "RxDoseUnit",
     "type": "Char(25)",
     "values": "Fixed list; see mSCDM Reference Tables",
     "missingAllowed": "No",
     "definition": "Units of measure associated with the dose of the ingredient (i.e., Ingred_Dose) by the medication product.",
     "example": "ueq",
     "essential": false
    }
   ]
  }
 ]
};
