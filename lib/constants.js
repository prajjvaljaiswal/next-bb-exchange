export const BLOOD_GROUPS = [
  "A+", "A-", "A1+", "A1-", "A2+", "A2-",
  "B+", "B-",
  "AB+", "AB-", "A1B+", "A1B-", "A2B+", "A2B-",
  "O+", "O-",
  "Bombay_Oh+", "Bombay_Oh-",
  "Cis_AB+", "Cis_AB-",
  "A3+", "A3-",
  "Ax+", "Ax-",
  "B3+", "B3-",
  "Am+", "Am-",
  "Bm+", "Bm-",
  "Aend+", "Aend-",
  "OhA+", "OhA-",
  "OhB+", "OhB-",
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const FEES = {
  PATIENT_REGISTRATION: 100,
  TRANSFER_FEE: 549,
  CYCLE_DONOR_REFUND: 400,
  CYCLE_PATIENT_REFUND: 400,
  CYCLE_SERVICE_CHARGE: 150,
};

export const ROLES = {
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  BLOOD_BANK_ADMIN: "BLOOD_BANK_ADMIN",
  DONOR: "DONOR",
  PATIENT: "PATIENT",
};

export const ROLE_LABELS = {
  PLATFORM_ADMIN: "Platform Admin",
  BLOOD_BANK_ADMIN: "Blood Bank Admin",
  DONOR: "Donor",
  PATIENT: "Patient",
};

export const URGENCY_LEVELS = ["ROUTINE", "URGENT", "EMERGENCY"];

export const DESIGNATION_OPTIONS = [
  "Medical Director", "Chief Medical Officer", "Blood Bank Officer",
  "Lab Technician", "Phlebotomist", "Nurse", "Receptionist", "Administrator",
];

export const TRANSFER_STATUS_LABELS = {
  SENT: "Sent",
  ACKNOWLEDGED: "Acknowledged",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  FULFILLED: "Fulfilled",
};

export const DONOR_CARD_STATUS_LABELS = {
  ISSUED: "Issued",
  IN_WHOLE_BLOOD: "In Whole Blood",
  IN_PRBC: "In PRBC",
  RESERVED: "Reserved",
  TRANSFERRED: "Transferred",
  USED: "Used",
  EXPIRED: "Expired",
};
