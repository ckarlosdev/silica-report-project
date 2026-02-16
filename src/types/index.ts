export type User = {
  id: number;
  fullName: string;
  email: string;
};

export type Job = {
  jobsId: number | null;
  number: string;
  type: string;
  name: string;
  address: string;
  contractor: string;
  contact: string;
  status: string;
};

export type Employee = {
  employeesId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  title: string;
};

export type SilicaReport = {
  silicaId: number | null;
  jobsId: number | null;
  employeesId: number;
  eventDate: string;
  workDescription: string;
  ventilationArea: string;
  datePlan: string;
  equipmentDescription: string;
  signatureId: string;
  signatureFolder: string;
  silicaControls: SilicaControl[];
  diagramData?: string;
  createdBy: string;
  updatedBy: string;
};

export type SilicaControl = {
  silicaControlId: number;
  controlDescriptionId: number;
  controlAnswer: string;
};

export type Control = {
  controlsId: number;
  controlGroup: string;
  controlType: string;
  typeDescription: string;
  descriptions: ControlDescription[];
};

export type ControlDescription = {
  controlsDescriptionsId: number;
  controlsId: number;
  controlName: string;
  componentType: string;
};

export interface DrawingAppControls {
  getDrawingData: () => string;
  loadDrawingData: (jsonString: string) => void;
  getImagesLoadedPromise: () => Promise<void> | null;
}

export interface BaseDrawingElement {
  id: string; // Unique identifier for each element for easier tracking/manipulation
  x: number;
  y: number;
  rotation?: number; // Optional rotation in radians for elements that can be rotated
}

export interface Point {
  x: number;
  y: number;
}

export interface LineDrawingElement extends BaseDrawingElement {
  type: "line";
  color: string;
  lineWidth: number; // The width (thickness) of the line
  points: Point[]; // An array of points that define the line's path
}

export interface ImageDrawingElement extends BaseDrawingElement {
  type: "figure"; // Using 'figure' as per your paint.js for image elements
  imageId: string; // Corresponds to the ID of the preloaded image (e.g., 'bocina', 'sprayer')
  width: number; // The rendered width of the image on the canvas
  height: number; // The rendered height of the image on the canvas
}

export type DrawingElement = LineDrawingElement | ImageDrawingElement;

export interface DrawingAppControls {
  getDrawingData: () => string;
  loadDrawingData: (jsonString: string) => void;
  getImagesLoadedPromise: () => Promise<void> | null;
}
