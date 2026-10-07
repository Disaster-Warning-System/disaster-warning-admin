export type HazardReport = {
  _id: string;
  hazardType: string;
  description: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
  };
  photoFileId: string | null;
  status: string;
  createdAt: string;
};
