export type HazardReport = {
  _id: string;
  reportId?: string;
  hazardType: string;
  description: string;
  district?: string;
  severity?: "Low" | "Medium" | "High";
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
    district?: string;
  };
  photoFileId: string | null;
  status: string;
  remarks?: string;
  rejectionReason?: string;
  verifications?: Verification[];
  createdAt: string;
};

export type Verification = {
  _id: string;
  decision: string;
  remarks: string;
  createdAt: string;
  officer?: { name?: string };
};
