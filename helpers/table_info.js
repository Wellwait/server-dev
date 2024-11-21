const tableInfo = [
  {
    tableName: "BU_MASTER",
    primaryKey: "BU_CODE",
    searchField: "BU_NAME",
    fkNameField: "BU_NAME",
  },
  {
    tableName: "CITY_MASTER",
    primaryKey: "CITY_CODE",
    searchField: "CITY_NAME",
    fkNameField: "CITY_NAME",
  },
  {
    tableName: "COMPANY_MASTER",
    primaryKey: "COMP_CODE",
    searchField: "COMP_NAME",
    fkNameField: "COMP_NAME",
  },
  {
    tableName: "COUNTRY_MASTER",
    primaryKey: "COUNTRY_CODE",
    searchField: "COUNTRY_NAME",
    fkNameField: "COUNTRY_NAME",
  },
  {
    tableName: "DEPT_MASTER",
    primaryKey: "DEPT_CODE",
    searchField: "DEPT_NAME",
    fkNameField: "DEPT_NAME",
  },
  {
    tableName: "DOCTOR_AVAILABILITY_MASTER",
    primaryKey: "AVAILABILITY_ID",
    searchField: "DR_NAME",
    fkNameField: "DR_SLOTF",
  },
  {
    tableName: "DOCTOR_FEES_MASTER",
    primaryKey: "DR_CODE",
    searchField: "DR_NAME",
    fkNameField: "DR_FEES",
  },
  {
    tableName: "DOCTOR_MASTER",
    primaryKey: "DR_CODE",
    searchField: "DR_NAME",
    fkNameField: "DR_NAME",
  },
  {
    tableName: "DOCTOR_TYPE_MASTER",
    primaryKey: "DR_TYPE_CODE",
    searchField: "DR_TYPE_DESC",
    fkNameField: "DR_TYPE_DESC",
  },
  {
    tableName: "HOSPITAL_FLOOR_MASTER",
    primaryKey: "FLOOR_CODE",
    searchField: "FLOOR_DESC",
    fkNameField: "FLOOR_DESC",
  },
  {
    tableName: "HOSPITAL_MASTER",
    primaryKey: "LOCATION_CODE",
    searchField: "LOCATION_DESC",
    fkNameField: "LOCATION_DESC",
  },
  {
    tableName: "OPD_DETAILS",
    primaryKey: "OPD_REGN_NO",
    searchField: "OPD_REGN_NO",
    fkNameField: "OPDP_ANAME",
  },
  {
    tableName: "OPD_HEADER",
    primaryKey: "OPD_REGN_NO",
    searchField: "OPD_REGN_NO",
    fkNameField: "OPDP_NAME",
  },
  {
    tableName: "OPD_MEDICINE",
    primaryKey: "OPD_MEDICINE_ID",
    searchField: "MEDI_CODE",
    fkNameField: "MEDI_CODE",
  },
  {
    tableName: "OPD_PRESCRIPTION",
    primaryKey: "OPD_PRESCRIPTION_ID",
    searchField: "DR_NOTE",
    fkNameField: "DR_NOTE",
  },
  {
    tableName: "OPD_PRESCRIPTION_UPLOAD",
    primaryKey: "OPD_REGN_NO",
    searchField: "BU_NAME",
    fkNameField: "BU_NAME",
  },
  {
    tableName: "OPD_VITALS",
    primaryKey: "OPD_VITAL_ID",
    searchField: "VITAL_CODE",
    fkNameField: "VITAL_CODE",
  },
  {
    tableName: "PHARMA_MEDICINE_MASTER",
    primaryKey: "MEDI_CODE",
    searchField: "MEDI_NAME",
    fkNameField: "MEDI_NAME",
  },
  {
    tableName: "ROOM_TYPE_MASTER",
    primaryKey: "ROOM_TYPE_CODE",
    searchField: "ROOM_TYPE_NAME",
    fkNameField: "ROOM_TYPE_NAME",
  },
  {
    tableName: "SPECIALIZATION_MASTER",
    primaryKey: "SPECIAL_CODE",
    searchField: "SPECIAL_DESC",
    fkNameField: "SPECIAL_DESC",
  },
  {
    tableName: "STATE_MASTER",
    primaryKey: "STATE_CODE",
    searchField: "STATE_NAME",
    fkNameField: "STATE_NAME",
  },
  {
    tableName: "USER_MASTER",
    primaryKey: "USER_CODE",
    searchField: "USER_NAME",
    fkNameField: "USER_NAME",
  },
  {
    tableName: "VITAL_MASTER",
    primaryKey: "VITAL_CODE",
    searchField: "VITAL_NAME",
    fkNameField: "VITAL_NAME",
  },
  {
    tableName: "BLOOD_GROUP_MASTER",
    primaryKey: "id",
    searchField: "BLOOD_GROUP",
    fkNameField: "BLOOD_GROUP",
  },
  {
    tableName: "TEST_TYPE_MASTER",
    primaryKey: "id",
    searchField: "TEST_TYPE_NAME",
    fkNameField: "TEST_TYPE_NAME",
  },
  {
    tableName: "TEST_MASTER_HEADER",
    primaryKey: "TEST_CODE",
    searchField: "TEST_TYPE_NAME",
    fkNameField: "TEST_TYPE_NAME",
  },
  {
    tableName: "TEST_MASTER_DETAIL",
    primaryKey: "TEST_CODE",
    searchField: "TEST_DESC",
    fkNameField: "TEST_DESC",
  },
];

function getTableFieldInfo(tableName) {
  const table = tableInfo.find((table) => table.tableName === tableName);
  return table || null;
}

export { tableInfo, getTableFieldInfo };
